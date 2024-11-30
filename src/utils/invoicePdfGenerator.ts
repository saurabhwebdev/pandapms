import jsPDF from 'jspdf';
import { Invoice } from '../types/invoice';
import { format } from 'date-fns';

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const generateInvoicePDF = (invoice: Invoice, clinicInfo: ClinicInfo): jsPDF => {
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

  // Clinic contact details with icons (simulated with characters)
  yPos += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('', leftMargin + 8, yPos);
  doc.text(clinicInfo.address, leftMargin + 18, yPos);
  yPos += 6;
  doc.text('', leftMargin + 8, yPos);
  doc.text(clinicInfo.phone, leftMargin + 18, yPos);
  yPos += 6;
  doc.text('', leftMargin + 8, yPos);
  doc.text(clinicInfo.email, leftMargin + 18, yPos);

  // Large "INVOICE" text with modern styling
  yPos += 25;
  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(66, 133, 244); // Primary blue
  doc.text('INVOICE', leftMargin + 8, yPos);

  // Invoice details in a modern grid layout
  yPos += 15;
  const col1X = leftMargin + 8;
  const col2X = pageWidth / 2 + 10;

  // Modern info boxes
  const boxHeight = 50;
  doc.setFillColor(247, 250, 252); // Very light blue-gray
  doc.roundedRect(col1X, yPos, pageWidth/2 - 20, boxHeight, 3, 3, 'F');
  doc.roundedRect(col2X - 2, yPos, pageWidth/2 - 20, boxHeight, 3, 3, 'F');

  // Left box content
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('INVOICE TO', col1X + 8, yPos + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(12);
  doc.text(invoice.patientName, col1X + 8, yPos + 28);

  // Right box content
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE NUMBER', col2X + 8, yPos + 12);
  doc.text('DATE ISSUED', col2X + 8, yPos + 32);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(invoice.invoiceNumber, col2X + 8, yPos + 22);
  doc.text(format(new Date(invoice.date), 'MMM dd, yyyy'), col2X + 8, yPos + 42);

  // Items table with modern design
  yPos += boxHeight + 20;
  const tableHeaders = ['Service Description', 'Qty', 'Rate', 'Amount'];
  const columnWidths = [pageWidth - 140, 30, 40, 40];
  const startX = leftMargin + 8;

  // Table header
  doc.setFillColor(249, 250, 251); // Very light gray
  doc.rect(startX, yPos - 5, pageWidth - 25, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate-600
  
  let xPos = startX + 5;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, yPos + 2);
    xPos += columnWidths[index];
  });

  // Table rows
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // Slate-800
  invoice.items.forEach((item, index) => {
    // Zebra striping with very subtle background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(startX, yPos - 5, pageWidth - 25, 10, 'F');
    }
    
    xPos = startX + 5;
    doc.text(item.description, xPos, yPos);
    doc.text(item.quantity.toString(), xPos + columnWidths[0], yPos);
    doc.text(item.unitPrice.toFixed(2), xPos + columnWidths[0] + columnWidths[1], yPos);
    doc.text(item.amount.toFixed(2), xPos + columnWidths[0] + columnWidths[1] + columnWidths[2], yPos);
    yPos += 12;
  });

  // Modern totals section
  const totalsX = rightMargin - 100;
  yPos += 5;

  // Subtle divider before totals
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(totalsX, yPos - 5, rightMargin, yPos - 5);

  // Totals with modern typography
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Subtotal', totalsX, yPos);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(invoice.subtotal.toFixed(2), rightMargin - 20, yPos, { align: 'right' });

  yPos += 8;
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Tax (${invoice.taxRate}%)`, totalsX, yPos);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(invoice.taxAmount.toFixed(2), rightMargin - 20, yPos, { align: 'right' });

  // Bold total with accent color
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(66, 133, 244); // Primary blue
  doc.text('TOTAL', totalsX, yPos);
  doc.text(invoice.total.toFixed(2), rightMargin - 20, yPos, { align: 'right' });

  // Payment status with modern badge design
  yPos += 25;
  const badgeWidth = 100;
  const badgeHeight = 30;
  const badgeX = rightMargin - badgeWidth;

  // Status badge with dynamic color
  let statusColor;
  if (invoice.status === 'paid') {
    statusColor = [16, 185, 129]; // Emerald-500
  } else if (invoice.status === 'pending') {
    statusColor = [245, 158, 11]; // Amber-500
  } else {
    statusColor = [239, 68, 68]; // Red-500
  }

  // Draw status badge
  doc.setFillColor(...statusColor);
  doc.roundedRect(badgeX, yPos - 20, badgeWidth, badgeHeight, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const statusText = invoice.status.toUpperCase();
  const textWidth = doc.getStringUnitWidth(statusText) * 12 / doc.internal.scaleFactor;
  doc.text(statusText, badgeX + (badgeWidth - textWidth) / 2, yPos - 5);

  if (invoice.status === 'paid' && invoice.paidDate) {
    yPos += 15;
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment received on ${format(new Date(invoice.paidDate), 'MMMM dd, yyyy')}`,
      rightMargin - 180, yPos);
  }

  // Modern footer with gradient-like effect
  const footerY = pageHeight - 25;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, footerY - 15, pageWidth, 40, 'F');
  
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  addCenteredText('Thank you for choosing our services!', footerY);
  
  doc.setFontSize(8);
  addCenteredText('This is a computer-generated document. No signature is required.', footerY + 8);

  return doc;
};
