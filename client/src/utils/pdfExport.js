import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Configure for A4 page capture
    const canvas = await html2canvas(element, {
      scale: 1.2, // Reduced scale for smaller text
      useCORS: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      backgroundColor: '#ffffff',
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png', 0.8);
    
    // A4 dimensions in mm (portrait)
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    // Create PDF in portrait mode for A4
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    let position = 0;
    let heightLeft = imgHeight;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
