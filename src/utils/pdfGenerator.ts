import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { Prescription } from '../types/prescription';

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

const DEFAULT_CLINIC_INFO: ClinicInfo = {
  name: 'Panda Dental Clinic',
  address: '123 Healthcare Street, Medical District',
  phone: '(555) 123-4567',
  email: 'contact@pandadental.com'
};

export const generatePrescriptionPDF = (prescription: Prescription, clinicInfo: ClinicInfo = DEFAULT_CLINIC_INFO): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;
  let yPos = 15;

  // Helper functions
  const addCenteredText = (text: string, y: number, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Modern accent color strip on the left
  doc.setFillColor(66, 133, 244);
  doc.rect(0, 0, 8, pageHeight, 'F');

  // Add clinic info with modern typography
  doc.setTextColor(30, 41, 59); // Slate-800 for main text
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(clinicInfo.name, leftMargin + 8, yPos);

  // Add a subtle divider line
  yPos += 8;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(leftMargin + 8, yPos, rightMargin, yPos);

  // Clinic contact details with icons
  yPos += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('📍', leftMargin + 8, yPos);
  doc.text(clinicInfo.address, leftMargin + 18, yPos);
  yPos += 6;
  doc.text('📞', leftMargin + 8, yPos);
  doc.text(clinicInfo.phone, leftMargin + 18, yPos);
  yPos += 6;
  doc.text('✉️', leftMargin + 8, yPos);
  doc.text(clinicInfo.email, leftMargin + 18, yPos);

  // Large "PRESCRIPTION" text with modern styling
  yPos += 25;
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(66, 133, 244); // Primary blue
  doc.text('PRESCRIPTION', leftMargin + 8, yPos);

  // Patient info and prescription details in modern grid layout
  yPos += 15;
  const col1X = leftMargin + 8;
  const col2X = pageWidth / 2 + 10;

  // Modern info boxes
  const boxHeight = 70;
  doc.setFillColor(247, 250, 252); // Very light blue-gray
  doc.roundedRect(col1X, yPos, pageWidth/2 - 20, boxHeight, 3, 3, 'F');
  doc.roundedRect(col2X - 2, yPos, pageWidth/2 - 20, boxHeight, 3, 3, 'F');

  // Patient details box
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('PATIENT DETAILS', col1X + 8, yPos + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(12);
  doc.text(prescription.patientName, col1X + 8, yPos + 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient ID: ${prescription.patientId || 'N/A'}`, col1X + 8, yPos + 42);

  // Prescription details box
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFont('helvetica', 'normal');
  doc.text('PRESCRIPTION DETAILS', col2X + 8, yPos + 12);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(`Date: ${format(new Date(prescription.date), 'MMMM dd, yyyy')}`, col2X + 8, yPos + 28);
  doc.text(`Prescription ID: ${prescription.id}`, col2X + 8, yPos + 42);

  // Medications section
  yPos += boxHeight + 20;
  doc.setFillColor(249, 250, 251); // Very light gray
  doc.rect(leftMargin + 8, yPos - 5, pageWidth - 25, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(66, 133, 244);
  doc.text('MEDICATIONS', leftMargin + 13, yPos + 2);

  // Medications list
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  // Ensure medicines array exists and handle each medicine
  const medicines = prescription.medicines || [];
  medicines.forEach((med, index) => {
    // Zebra striping with very subtle background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(leftMargin + 8, yPos - 5, pageWidth - 25, 32, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${med.name}`, leftMargin + 13, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dosage: ${med.dosage}`, leftMargin + 25, yPos + 10);
    doc.text(`Frequency: ${med.frequency}`, leftMargin + 25, yPos + 20);
    doc.text(`Duration: ${med.duration}`, leftMargin + 25, yPos + 30);
    
    if (med.instructions) {
      yPos += 40;
      doc.text(`Instructions: ${med.instructions}`, leftMargin + 25, yPos);
      yPos += 10;
    } else {
      yPos += 40;
    }
  });

  // Notes section
  if (prescription.notes) {
    doc.setFillColor(249, 250, 251);
    doc.rect(leftMargin + 8, yPos - 5, pageWidth - 25, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(66, 133, 244);
    doc.text('NOTES', leftMargin + 13, yPos + 2);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    const notes = doc.splitTextToSize(prescription.notes, pageWidth - 50);
    doc.text(notes, leftMargin + 13, yPos);
    yPos += notes.length * 7;
  }

  // Doctor's signature section
  yPos = Math.max(yPos + 30, pageHeight - 80);
  doc.setDrawColor(226, 232, 240);
  doc.line(rightMargin - 80, yPos, rightMargin - 10, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text("Doctor's Signature", rightMargin - 80, yPos + 10);

  // Modern footer with gradient-like effect
  const footerY = pageHeight - 25;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, footerY - 15, pageWidth, 40, 'F');
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  addCenteredText('This prescription is valid for 30 days from the date of issue', footerY);
  
  doc.setFontSize(8);
  addCenteredText('This is a computer-generated prescription. Signature is required for validity.', footerY + 8);

  return doc;
};
