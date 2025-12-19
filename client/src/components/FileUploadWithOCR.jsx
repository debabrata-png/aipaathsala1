import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CloudUpload, Cancel, Visibility, CheckCircle, Warning, PictureAsPdf, Image } from '@mui/icons-material';
import global1 from '../pages/global1';
import AWS from 'aws-sdk';
import ocrService from '../utils/ocrService';

const FileUploadWithOCR = ({ onFileUpload, onCancel, formData, fieldMappings, documentType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfConversionNeeded, setPdfConversionNeeded] = useState(false);
  const fileInputRef = useRef(null);

  const configureAWS = () => {
    AWS.config.update({
      accessKeyId: global1.username,
      secretAccessKey: global1.password,
      region: global1.region,
    });
    return new AWS.S3();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 15 * 1024 * 1024) { // Increased to 15MB for PDFs
      setError('File size must be less than 15MB');
      return;
    }

    // Validate file type - both images and PDFs supported
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload JPG, PNG images or PDF files only');
      return;
    }

    setSelectedFile(file);
    setError('');
    setOcrResults(null);
    setValidationResults(null);
    setPdfConversionNeeded(false);

    // Show info for PDF files
    if (file.type === 'application/pdf') {
      setShowPdfDialog(true);
    } else {
      // Start OCR processing for images immediately
      await performOCR(file);
    }
  };

  const handlePdfProcess = async () => {
    setShowPdfDialog(false);
    await performOCR(selectedFile);
  };

  const performOCR = async (file) => {
    setOcrProcessing(true);
    setError('');
    
    try {
      console.log('Starting OCR for file:', file.name, 'Type:', file.type);
      
      const result = await ocrService.extractTextFromFile(file);
      
      if (result.success) {
        console.log('OCR Success:', { 
          confidence: result.confidence, 
          textLength: result.text.length,
          pagesProcessed: result.pagesProcessed
        });
        
        setOcrResults(result);
        
        // Validate against form data if mappings provided
        if (fieldMappings && formData && Object.keys(formData).length > 0) {
          const validation = ocrService.compareWithFormData(
            result.text, 
            formData, 
            fieldMappings
          );
          console.log('Validation results:', validation);
          setValidationResults(validation);
        }
      } else {
        console.error('OCR failed:', result.error);
        
        if (result.needsManualConversion) {
          setPdfConversionNeeded(true);
          setError(`${result.error}\n\nFor better OCR results with PDFs:\n1. Convert PDF to high-quality JPG/PNG image\n2. Or take a clear screenshot of the document\n3. Then upload the image file`);
        } else {
          setError(`OCR failed: ${result.error || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setError(`OCR processing error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setOcrProcessing(false);
    }
  };

  const uploadToS3 = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!global1.username || !global1.password || !global1.bucket || !global1.region) {
      setError('AWS configuration is missing. Please check your settings.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const s3 = configureAWS();
      const dt1 = new Date();
      const month = dt1.getMonth() + 1;
      const dt2 = `${month}-${dt1.getFullYear()}-${dt1.getDate()}-${dt1.getHours()}-${dt1.getMinutes()}-${dt1.getSeconds()}`;
      const newFileName = `${dt2}-${selectedFile.name}`;

      const params = {
        Bucket: global1.bucket,
        Key: newFileName,
        Body: selectedFile,
        ContentType: selectedFile.type,
        ACL: 'public-read'
      };

      const uploadRequest = s3.upload(params);
      uploadRequest.on('httpUploadProgress', (progress) => {
        const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
        setUploadProgress(percentCompleted);
      });

      const result = await uploadRequest.promise();

      if (result && result.Location) {
        // Pass both URL and OCR results
        onFileUpload({
          url: result.Location,
          ocrResults,
          validationResults,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          needsManualConversion: pdfConversionNeeded
        });
        
        // Reset form
        resetForm();
      } else {
        throw new Error('Upload successful but no URL returned');
      }
    } catch (uploadError) {
      console.error('S3 Upload Error:', uploadError);
      setError(`Upload failed: ${uploadError.message || 'Please check your AWS configuration and try again.'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setOcrResults(null);
    setValidationResults(null);
    setError('');
    setPdfConversionNeeded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowPdfDialog(false);
    if (onCancel) {
      onCancel();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getValidationColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <PictureAsPdf sx={{ color: '#ef4444' }} />;
    }
    return <Image sx={{ color: '#3b82f6' }} />;
  };

  return (
    <Box sx={{ padding: 2 }}>
      {error && (
        <Alert 
          severity={pdfConversionNeeded ? "warning" : "error"} 
          sx={{ marginBottom: 2, whiteSpace: 'pre-line' }}
        >
          {error}
          {pdfConversionNeeded && (
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open('https://pdf2jpg.net/', '_blank')}
                sx={{ marginRight: 1 }}
              >
                Convert PDF Online
              </Button>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<Image />}
              >
                Upload Image Instead
                <input
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png"
                />
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {/* PDF Processing Dialog */}
      <Dialog open={showPdfDialog} onClose={() => setShowPdfDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdf sx={{ color: '#ef4444' }} />
            PDF OCR Processing
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You've selected a PDF file. OCR processing will attempt to extract text from your PDF.
          </Typography>
          <Alert severity="info" sx={{ marginTop: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              For best OCR results:
            </Typography>
            <Typography variant="caption" component="div">
              • Ensure PDF contains clear, readable text
              • Avoid heavily stylized or handwritten text
              • Consider converting to high-quality image if OCR fails
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handlePdfProcess} variant="contained">
            Process PDF with OCR
          </Button>
        </DialogActions>
      </Dialog>

      {uploading ? (
        <Box sx={{ padding: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Uploading to AWS S3...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ marginTop: 2 }}
          />
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            {uploadProgress}% Complete
          </Typography>
          <Typography variant="caption" display="block">
            {selectedFile?.name}
          </Typography>
        </Box>
      ) : (
        <>
          {selectedFile ? (
            <Box>
              <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                  {getFileTypeIcon(selectedFile.type)}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Selected File:
                  </Typography>
                </Box>
                <Typography variant="body2">{selectedFile.name}</Typography>
                <Typography variant="caption">
                  Size: {formatFileSize(selectedFile.size)} | Type: {selectedFile.type}
                </Typography>
              </Paper>

              {/* OCR Processing Status */}
              {ocrProcessing && (
                <Paper elevation={1} sx={{ padding: 2, marginBottom: 2, textAlign: 'center' }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" sx={{ marginTop: 1 }}>
                    {selectedFile.type.includes('pdf') ? 
                      'Processing PDF with OCR...' : 
                      'Processing image with OCR...'
                    }
                  </Typography>
                  <Typography variant="caption">
                    {selectedFile.type.includes('pdf') ? 
                      'Converting PDF pages and extracting text' : 
                      'Extracting text for validation'
                    }
                  </Typography>
                </Paper>
              )}

              {/* OCR Results */}
              {ocrResults && !ocrProcessing && (
                <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                    <CheckCircle sx={{ color: 'green', marginRight: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      OCR Processing Complete
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>
                    Confidence: {Math.round(ocrResults.confidence)}%
                  </Typography>

                  {ocrResults.pagesProcessed > 0 && (
                    <Typography variant="caption" display="block" sx={{ marginBottom: 1 }}>
                      Pages processed: {ocrResults.pagesProcessed}
                    </Typography>
                  )}

                  <Typography variant="caption" display="block" sx={{ marginBottom: 1 }}>
                    Text extracted: {ocrResults.text.length} characters
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    sx={{ marginTop: 1 }}
                  >
                    {showExtractedText ? 'Hide' : 'View'} Extracted Text
                  </Button>

                  {showExtractedText && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        padding: 2, 
                        marginTop: 2, 
                        backgroundColor: '#f5f5f5',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Extracted Text:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', marginTop: 1 }}>
                        {ocrResults.text || 'No text found'}
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              )}

              {/* Validation Results */}
              {validationResults && (
                <Paper elevation={1} sx={{ padding: 2, marginBottom: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    {validationResults.overallScore >= 80 ? (
                      <CheckCircle sx={{ color: 'green', marginRight: 1 }} />
                    ) : (
                      <Warning sx={{ color: 'orange', marginRight: 1 }} />
                    )}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Document Validation
                    </Typography>
                    <Chip
                      label={`${Math.round(validationResults.overallScore)}% Match`}
                      color={getValidationColor(validationResults.overallScore)}
                      size="small"
                      sx={{ marginLeft: 2 }}
                    />
                  </Box>

                  {/* Matches */}
                  {validationResults.matches.length > 0 && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'green' }}>
                        ✓ Verified Information:
                      </Typography>
                      {validationResults.matches.map((match, index) => (
                        <Typography key={index} variant="caption" display="block">
                          • {match.field}: "{match.userValue}" 
                          {match.matchType && ` (${match.matchType} match)`}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Suggestions */}
                  {validationResults.suggestions.length > 0 && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'orange' }}>
                        ⚠ Possible Matches:
                      </Typography>
                      {validationResults.suggestions.map((suggestion, index) => (
                        <Typography key={index} variant="caption" display="block">
                          • {suggestion.field}: You entered "{suggestion.userValue}", 
                          found: "{suggestion.suggestedValue}"
                          {suggestion.matchRatio && ` (${suggestion.matchRatio} match)`}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Mismatches */}
                  {validationResults.mismatches.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'red' }}>
                        ❌ Information Not Found:
                      </Typography>
                      {validationResults.mismatches.map((mismatch, index) => (
                        <Typography key={index} variant="caption" display="block">
                          • {mismatch.field}: "{mismatch.userValue}" not found in document
                        </Typography>
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ margin: '12px 0' }} />
                  <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    Note: OCR accuracy varies based on document quality and format. 
                    For PDFs, consider converting to high-quality images for better results.
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ 
                padding: 4, 
                textAlign: 'center', 
                borderStyle: 'dashed',
                backgroundColor: '#fafafa'
              }}
            >
              <CloudUpload sx={{ fontSize: 48, color: '#ccc', marginBottom: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select a document to upload and validate
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
                Supported formats: Images (JPG, PNG) and PDF files
              </Typography>
              <Typography variant="caption" display="block" sx={{ marginBottom: 3 }}>
                The document will be analyzed using OCR to verify the information you provided
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                <Chip 
                  icon={<Image />} 
                  label="Images: Best OCR accuracy" 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<PictureAsPdf />} 
                  label="PDFs: Supported with conversion" 
                  color="info" 
                  variant="outlined" 
                />
              </Box>
            </Paper>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
            {!selectedFile ? (
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUpload />}
                sx={{
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                Choose File
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={uploadToS3}
                  disabled={ocrProcessing}
                  sx={{
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  {ocrProcessing ? 'Processing...' : 'Upload & Save'}
                </Button>
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={ocrProcessing}
                >
                  Choose Different File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                  />
                </Button>
              </>
            )}

            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              sx={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Cancel
            </Button>
          </Box>

          <Typography variant="caption" display="block" sx={{ marginTop: 2, textAlign: 'center' }}>
            Maximum file size: 15MB • Supported: JPG, PNG, PDF
          </Typography>
        </>
      )}
    </Box>
  );
};

export default FileUploadWithOCR;
