// src/components/BooksList.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  MenuBook, 
  DocumentScanner, 
  CloudUpload, 
  Visibility, 
  Link as LinkIcon,
  CheckCircle,
  ErrorOutline,
  Business
} from '@mui/icons-material';
import ep3 from '../api/ep3';
import global1 from '../pages/global1';
import FileUpload from './FileUpload';
import { ocrAndCheckValues } from '../utils/ocrService';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({});

  // Document management states
  const [docDialog, setDocDialog] = useState({
    open: false,
    book: null,
    tab: 0
  });
  const [docCheckFile, setDocCheckFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [docUpdateLink, setDocUpdateLink] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await ep3.get('getbooksbyuser', {
        params: { user: global1.userEmail, colid: global1.colid }
      });
      if (response?.data?.success) {
        setBooks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({ ...book });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await ep3.post('updatebook', formData, {
        params: { id: selectedBook._id }
      });
      if (response?.data?.success) {
        setEditDialog(false);
        fetchBooks();
        alert('Book updated successfully!');
      }
    } catch (error) {
      alert('Failed to update book');
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book entry?')) {
      try {
        const response = await ep3.get('deletebook', {
          params: { id: bookId }
        });
        if (response?.data?.success) {
          fetchBooks();
          alert('Book deleted successfully!');
        }
      } catch (error) {
        alert('Failed to delete book');
      }
    }
  };

  // Document management functions
  const openDocumentDialog = (book, tab = 0) => {
    setDocDialog({ open: true, book, tab });
    setDocUpdateLink(book.doclink || '');
    setOcrResult(null);
    setDocCheckFile(null);
  };

  const closeDocumentDialog = () => {
    setDocDialog({ open: false, book: null, tab: 0 });
    setOcrResult(null);
    setDocCheckFile(null);
    setDocUpdateLink('');
    setShowFileUpload(false);
  };

  const handleCheckDocument = async () => {
    if (!docCheckFile) {
      alert('Please select a document to check');
      return;
    }

    try {
      const book = docDialog.book;
      const itemsToCheck = [
        book.name,
        book.booktitle,
        book.papertitle,
        book.publisher
      ].filter(Boolean).join('~');

      const { score, ocr } = await ocrAndCheckValues(docCheckFile, itemsToCheck);
      setOcrResult({ score, ocr });
    } catch (error) {
      alert('Document check failed: ' + error.message);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      let doclink = docUpdateLink.trim();

      if (showFileUpload) {
        return;
      }

      const response = await ep3.post('updatebook', {
        ...docDialog.book,
        doclink: doclink
      }, {
        params: { id: docDialog.book._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchBooks();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const handleFileUpload = (fileUrl) => {
    setDocUpdateLink(fileUrl);
    setShowFileUpload(false);
    handleUpdateDocumentWithUrl(fileUrl);
  };

  const handleUpdateDocumentWithUrl = async (fileUrl) => {
    try {
      const response = await ep3.post('updatebook', {
        ...docDialog.book,
        doclink: fileUrl
      }, {
        params: { id: docDialog.book._id }
      });

      if (response?.data?.success) {
        closeDocumentDialog();
        fetchBooks();
        alert('Document updated successfully!');
      }
    } catch (error) {
      alert('Failed to update document: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'accepted': return 'info';
      case 'in press': return 'warning';
      case 'under review': return 'secondary';
      case 'submitted': return 'primary';
      case 'in preparation': return 'default';
      default: return 'default';
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'international': return 'error';
      case 'national': return 'success';
      case 'regional': return 'info';
      case 'local': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'book chapter': return 'primary';
      case 'full book': return 'success';
      case 'conference proceedings': return 'info';
      case 'edited volume': return 'secondary';
      case 'monograph': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      {books.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBook sx={{ fontSize: 60, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
            No books registered yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Use the Create Book Entry tab to register your first book/chapter
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item xs={12} md={6} lg={4} key={book._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {book.papertitle}
                    </Typography>
                    <Chip 
                      label={book.status1} 
                      color={getStatusColor(book.status1)} 
                      size="small" 
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Book Title:</strong> {book.booktitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Business sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        <strong>Publisher:</strong> {book.publisher}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>Year:</strong> {book.yop}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      <strong>ISBN/ISSN:</strong> {book.issn}
                    </Typography>
                    {book.proceeding && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        <strong>Proceedings:</strong> {book.proceeding.substring(0, 100)}
                        {book.proceeding.length > 100 ? '...' : ''}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={book.type} 
                        color={getTypeColor(book.type)} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={book.level} 
                        color={getLevelColor(book.level)} 
                        size="small" 
                      />
                      {book.affiliated === 'Yes' && (
                        <Chip label="Affiliated" color="info" size="small" />
                      )}
                    </Box>

                    {book.conferencename && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        <strong>Conference:</strong> {book.conferencename}
                      </Typography>
                    )}

                    {book.comments && (
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2, fontStyle: 'italic' }}>
                        {book.comments.substring(0, 100)}{book.comments.length > 100 ? '...' : ''}
                      </Typography>
                    )}

                    {/* Document Status */}
                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Document Status:
                      </Typography>
                      {book.doclink ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                          <Typography variant="body2" color="success.main">
                            Document attached
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ErrorOutline sx={{ color: '#f59e0b', fontSize: 16 }} />
                          <Typography variant="body2" color="warning.main">
                            No document
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Document Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DocumentScanner />}
                        onClick={() => openDocumentDialog(book, 0)}
                      >
                        Check Document
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => openDocumentDialog(book, 1)}
                      >
                        Update Document
                      </Button>
                      {book.doclink && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(book.doclink, '_blank')}
                        >
                          View Document
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 'auto' }}>
                    <IconButton onClick={() => handleEdit(book)} size="small" sx={{ color: '#3b82f6' }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(book._id)} size="small" sx={{ color: '#ef4444' }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Book Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Book Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Book Title"
                fullWidth
                value={formData.booktitle || ''}
                onChange={(e) => setFormData({ ...formData, booktitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Paper/Chapter Title"
                fullWidth
                value={formData.papertitle || ''}
                onChange={(e) => setFormData({ ...formData, papertitle: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Publisher"
                fullWidth
                value={formData.publisher || ''}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Year"
                fullWidth
                value={formData.yop || ''}
                onChange={(e) => setFormData({ ...formData, yop: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="ISBN/ISSN"
                fullWidth
                value={formData.issn || ''}
                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Type"
                select
                fullWidth
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select type</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Full Book">Full Book</option>
                <option value="Conference Proceedings">Conference Proceedings</option>
                <option value="Edited Volume">Edited Volume</option>
                <option value="Monograph">Monograph</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Level"
                select
                fullWidth
                value={formData.level || ''}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select level</option>
                <option value="International">International</option>
                <option value="National">National</option>
                <option value="Regional">Regional</option>
                <option value="Local">Local</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Status"
                select
                fullWidth
                value={formData.status1 || ''}
                onChange={(e) => setFormData({ ...formData, status1: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select status</option>
                <option value="Published">Published</option>
                <option value="Accepted">Accepted</option>
                <option value="Under Review">Under Review</option>
                <option value="Submitted">Submitted</option>
                <option value="In Press">In Press</option>
                <option value="In Preparation">In Preparation</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Affiliated"
                select
                fullWidth
                value={formData.affiliated || ''}
                onChange={(e) => setFormData({ ...formData, affiliated: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Conference Name"
                fullWidth
                value={formData.conferencename || ''}
                onChange={(e) => setFormData({ ...formData, conferencename: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Proceedings Details"
                fullWidth
                multiline
                rows={2}
                value={formData.proceeding || ''}
                onChange={(e) => setFormData({ ...formData, proceeding: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Comments"
                fullWidth
                multiline
                rows={3}
                value={formData.comments || ''}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update Book</Button>
        </DialogActions>
      </Dialog>

      {/* Document Management Dialog */}
      <Dialog open={docDialog.open} onClose={closeDocumentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Document Management - {docDialog.book?.papertitle}
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={docDialog.tab} 
            onChange={(e, newValue) => setDocDialog({ ...docDialog, tab: newValue })}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Check Document" />
            <Tab label="Update Document" />
            <Tab label="View Document" />
          </Tabs>

          {/* Tab 0: Check Document */}
          {docDialog.tab === 0 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Upload a document to verify it matches your book data: name, book title, paper title, and publisher.
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button variant="outlined" component="label">
                  Choose Document
                  <input
                    hidden
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setDocCheckFile(file);
                    }}
                  />
                </Button>
                {docCheckFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Selected: {docCheckFile.name}
                  </Typography>
                )}
              </Box>

              <Button 
                variant="contained" 
                onClick={handleCheckDocument}
                disabled={!docCheckFile}
                sx={{ mb: 2 }}
              >
                Check Document
              </Button>

              {ocrResult && (
                <Alert 
                  severity={ocrResult.score.percentage >= 75 ? 'success' : ocrResult.score.percentage >= 50 ? 'warning' : 'error'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2">
                    Match: {ocrResult.score.percentage}%
                  </Typography>
                  {ocrResult.score.missing && (
                    <Typography variant="body2">
                      Missing: {ocrResult.score.missing}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}

          {/* Tab 1: Update Document */}
          {docDialog.tab === 1 && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Update the document for this book by uploading a new file or providing a document link.
              </Typography>

              {!showFileUpload ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowFileUpload(true)}
                    >
                      Upload New File
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    label="Document Link"
                    value={docUpdateLink}
                    onChange={(e) => setDocUpdateLink(e.target.value)}
                    placeholder="https://..."
                    sx={{ mb: 2 }}
                  />

                  <Button 
                    variant="contained" 
                    onClick={handleUpdateDocument}
                  >
                    Update Document
                  </Button>
                </Box>
              ) : (
                <Box>
                  <FileUpload 
                    onFileUpload={handleFileUpload} 
                    onCancel={() => setShowFileUpload(false)} 
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Tab 2: View Document */}
          {docDialog.tab === 2 && (
            <Box>
              {docDialog.book?.doclink ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Current document for this book:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinkIcon />
                    <Link 
                      href={docDialog.book.doclink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {docDialog.book.doclink}
                    </Link>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => window.open(docDialog.book.doclink, '_blank')}
                    sx={{ mt: 2 }}
                  >
                    Open Document
                  </Button>
                </Box>
              ) : (
                <Alert severity="info">
                  No document attached to this book. Use the "Update Document" tab to add one.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDocumentDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BooksList;
