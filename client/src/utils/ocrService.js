// utils/ocrService.js
import { createWorker } from 'tesseract.js';
import pdfToText from 'react-pdftotext';

// Simple text validation function exactly like your algorithm
const checktext1 = (stext, itemstocheck) => {
  const ar1 = itemstocheck.split('~');
  let found = 0;
  let notthere = '';
  
  for (let i = 0; i < ar1.length; i++) {
    if (stext.toLowerCase().indexOf(ar1[i].toLowerCase()) > -1) {
      found = found + 1;
    } else {
      notthere = notthere + ar1[i] + ', ';
    }
  }
  
  const percentage = Math.round(parseFloat(found) / parseFloat(ar1.length) * 100);
  
  return {
    percentage: percentage,
    found: found,
    total: ar1.length,
    missing: notthere.replace(/,\s*$/, ''), // Remove trailing comma
    success: true
  };
};

export function checkValuesInText(ocrText, itemsToCheck) {
  console.log('OCR Text:', ocrText);
  console.log('Items to check:', itemsToCheck);
  
  const result = checktext1(ocrText, itemsToCheck);
  console.log('Match result:', result);
  
  return result;
}

class OCRService {
  constructor() {
    this.worker = null;
    this._queue = Promise.resolve();
  }

  async init() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
    return this.worker;
  }

  async extractTextFromImage(imageInput) {
    const run = async () => {
      try {
        const worker = await this.init();
        const { data } = await worker.recognize(imageInput);
        const text = (data?.text || '').trim();
        console.log('Image OCR extracted text:', text);
        return {
          text,
          confidence: typeof data?.confidence === 'number' ? data.confidence : 0,
          success: true,
          pagesProcessed: 1,
        };
      } catch (err) {
        console.error('Image OCR error:', err);
        return {
          text: '',
          confidence: 0,
          success: false,
          error: String(err?.message || err),
          pagesProcessed: 0,
        };
      }
    };
    this._queue = this._queue.then(run, run);
    return this._queue;
  }

  async extractTextFromPDF(pdfFile) {
    const run = async () => {
      try {
        console.log('Starting PDF text extraction for:', pdfFile.name);
        
        // Use react-pdftotext to extract text directly from PDF
        const text = await pdfToText(pdfFile);
        
        console.log('PDF text extracted successfully');
        console.log('PDF text length:', text.length);
        console.log('PDF text preview:', text.substring(0, 500));
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text found in PDF. The PDF might be image-based or corrupted.');
        }

        return {
          text: text.trim(),
          confidence: 95, // High confidence for direct PDF text extraction
          success: true,
          pagesProcessed: 1, // react-pdftotext processes all pages at once
          totalPages: 1
        };

      } catch (err) {
        console.error('PDF text extraction error:', err);
        
        // If direct text extraction fails, suggest OCR alternative
        return {
          text: '',
          confidence: 0,
          success: false,
          error: `PDF text extraction failed: ${err.message}. This PDF might be image-based. Try converting it to an image (PNG/JPG) for OCR processing.`,
          pagesProcessed: 0,
        };
      }
    };
    this._queue = this._queue.then(run, run);
    return this._queue;
  }

  async extract(file) {
    const type = String(file?.type || '').toLowerCase();
    console.log('Processing file:', file.name, 'Type:', type);
    
    if (type.includes('pdf')) {
      return this.extractTextFromPDF(file);
    }
    return this.extractTextFromImage(file);
  }
}

const ocrService = new OCRService();
export default ocrService;

export async function ocrAndCheckValues(file, itemsToCheck) {
  console.log('=== OCR Check Started ===');
  console.log('File:', file.name);
  console.log('Items to check:', itemsToCheck);
  
  const ocr = await ocrService.extract(file);
  const score = checkValuesInText(ocr.text || '', itemsToCheck || '');
  
  console.log('=== OCR Check Results ===');
  console.log('Extracted text:', ocr.text);
  console.log('Match percentage:', score.percentage + '%');
  console.log('Missing items:', score.missing);
  
  return { ocr, score };
}
