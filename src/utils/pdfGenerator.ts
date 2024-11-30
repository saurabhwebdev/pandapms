import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Prescription } from '../types/prescription';

export const generatePrescriptionPDF = (prescription: Prescription) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Helper function to add left-aligned text
  const addText = (text: string, y: number, x = margin) => {
    doc.text(text, x, y);
  };

  // Helper function to add a line
  const addLine = (y: number) => {
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Header
  doc.setFont('helvetica', 'bold');
  addCenteredText('PRESCRIPTION', yPos, 16);
  yPos += lineHeight * 2;

  // Clinic Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  addCenteredText('Panda Dentist Clinic', yPos);
  yPos += lineHeight;
  addCenteredText('123 Healthcare Street, Medical District', yPos);
  yPos += lineHeight;
  addCenteredText('Phone: (555) 123-4567', yPos);
  yPos += lineHeight * 2;

  // Line separator
  addLine(yPos - 2);
  yPos += lineHeight;

  // Patient and Prescription Details
  doc.setFont('helvetica', 'bold');
  addText('Patient Name: ', yPos);
  doc.setFont('helvetica', 'normal');
  addText(prescription.patientName, yPos, margin + doc.getTextWidth('Patient Name: '));
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  addText('Date: ', yPos);
  doc.setFont('helvetica', 'normal');
  addText(format(new Date(prescription.date), 'MMMM dd, yyyy'), yPos, margin + doc.getTextWidth('Date: '));
  yPos += lineHeight * 2;

  // Line separator
  addLine(yPos - 2);
  yPos += lineHeight;

  // Medicines
  doc.setFont('helvetica', 'bold');
  addText('Medicines:', yPos);
  yPos += lineHeight;

  prescription.medicines.forEach((medicine, index) => {
    yPos += lineHeight;
    doc.setFont('helvetica', 'bold');
    addText(`${index + 1}. ${medicine.name}`, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    addText(`   Dosage: ${medicine.dosage}`, yPos);
    yPos += lineHeight;
    addText(`   Frequency: ${medicine.frequency}`, yPos);
    yPos += lineHeight;
    addText(`   Duration: ${medicine.duration}`, yPos);
    
    if (medicine.instructions) {
      yPos += lineHeight;
      addText(`   Instructions: ${medicine.instructions}`, yPos);
    }
    
    yPos += lineHeight;
  });

  // Additional Notes
  if (prescription.notes) {
    yPos += lineHeight;
    addLine(yPos - 2);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    addText('Additional Notes:', yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(prescription.notes, pageWidth - (margin * 2));
    splitNotes.forEach((line: string) => {
      addText(line, yPos);
      yPos += lineHeight;
    });
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  addLine(yPos - 2);
  yPos += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  addCenteredText('Doctor\'s Signature: _______________________', yPos);

  // Save the PDF
  const fileName = `prescription_${prescription.patientName.replace(/\s+/g, '_')}_${format(new Date(prescription.date), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
