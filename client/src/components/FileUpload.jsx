import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import { CloudUpload, Cancel } from '@mui/icons-material';
import global1 from '../pages/global1';
import AWS from 'aws-sdk';

const FileUpload = ({ onFileUpload, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // AWS S3 Configuration - uses the same credentials they already have
  const configureAWS = () => {
    AWS.config.update({
      accessKeyId: global1.username,        // Same as before
      secretAccessKey: global1.password,    // Same as before
      region: global1.region,              // Same as before
    });
    
    return new AWS.S3();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
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

      // Generate unique filename (same logic as before)
      const dt1 = new Date();
      const month = dt1.getMonth() + 1;
      const dt2 = `${month}-${dt1.getFullYear()}-${dt1.getDate()}-${dt1.getHours()}-${dt1.getMinutes()}-${dt1.getSeconds()}`;
      const newFileName = `${dt2}-${selectedFile.name}`;

      const params = {
        Bucket: global1.bucket,              // Uses their existing S3 bucket
        Key: newFileName,
        Body: selectedFile,
        ContentType: selectedFile.type,
        ACL: 'public-read'                   // Makes file accessible for download
      };

      // Upload with progress tracking
      const uploadRequest = s3.upload(params);

      uploadRequest.on('httpUploadProgress', (progress) => {
        const percentCompleted = Math.round((progress.loaded / progress.total) * 100);
        setUploadProgress(percentCompleted);
      });

      const result = await uploadRequest.promise();

      if (result && result.Location) {
        onFileUpload(result.Location);  // Returns the same URL format they expect
        
        // Reset form
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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

  const handleCancel = () => {
    setSelectedFile(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  return (
    <Box sx={{ 
      p: 3, 
      border: '2px dashed #d1d5db', 
      borderRadius: 2, 
      backgroundColor: '#fafafa',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#3b82f6',
        backgroundColor: '#f8fafc'
      }
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {uploading ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            Uploading to AWS S3...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ 
              mb: 2,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3b82f6'
              }
            }}
          />
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {uploadProgress}% Complete
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem', color: '#9ca3af' }}>
            {selectedFile?.name}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
          
          {selectedFile ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Selected File:
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f0f9ff', 
                border: '1px solid #0ea5e9',
                borderRadius: 1,
                mb: 2
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Size: {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ mb: 3, color: '#6b7280' }}>
              Select a file to upload to AWS S3
            </Typography>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload-input"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            accept="*/*"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {!selectedFile ? (
              <Button
                variant="contained"
                component="label"
                htmlFor="file-upload-input"
                startIcon={<CloudUpload />}
                sx={{ 
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' }
                }}
              >
                Choose File
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={uploadToS3}
                  startIcon={<CloudUpload />}
                  sx={{ 
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Upload to S3
                </Button>
                
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="file-upload-input"
                  sx={{ borderColor: '#6b7280', color: '#6b7280' }}
                >
                  Choose Different File
                </Button>
              </>
            )}
            
            {(onCancel || selectedFile) && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
                sx={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Cancel
              </Button>
            )}
          </Box>

          <Typography variant="caption" sx={{ 
            display: 'block', 
            mt: 2, 
            color: '#9ca3af' 
          }}>
            Maximum file size: 10MB
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
