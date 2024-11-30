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
  let yPos = 20;
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;

  // Helper function for centered text
  const addCenteredText = (text: string, y: number, size = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Add clinic logo and info
  doc.setFontSize(20);
  addCenteredText(clinicInfo.name, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  addCenteredText(clinicInfo.address, yPos);
  yPos += 5;
  addCenteredText(`Phone: ${clinicInfo.phone} | Email: ${clinicInfo.email}`, yPos);

  // Add invoice details
  yPos += 15;
  doc.setFontSize(16);
  addCenteredText('INVOICE', yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, leftMargin, yPos);
  doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, rightMargin - 40, yPos);

  // Add patient details
  yPos += 15;
  doc.text('Bill To:', leftMargin, yPos);
  yPos += 5;
  doc.text(invoice.patientName, leftMargin, yPos);

  // Add items table
  yPos += 15;
  const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Amount'];
  const columnWidths = [80, 20, 35, 35];
  const startX = leftMargin;

  // Draw table header
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, yPos - 5, pageWidth - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  
  let xPos = startX;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, yPos);
    xPos += columnWidths[index];
  });

  // Draw table rows
  doc.setFont('helvetica', 'normal');
  yPos += 10;
  invoice.items.forEach(item => {
    xPos = startX;
    doc.text(item.description, xPos, yPos);
    doc.text(item.quantity.toString(), xPos + columnWidths[0], yPos);
    doc.text(item.unitPrice.toFixed(2), xPos + columnWidths[0] + columnWidths[1], yPos);
    doc.text(item.amount.toFixed(2), xPos + columnWidths[0] + columnWidths[1] + columnWidths[2], yPos);
    yPos += 8;
  });

  // Add totals
  yPos += 5;
  const totalsX = rightMargin - 60;
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(invoice.subtotal.toFixed(2), rightMargin - 20, yPos);

  yPos += 8;
  doc.text(`Tax (${invoice.taxRate}%)`, totalsX, yPos);
  doc.text(invoice.taxAmount.toFixed(2), rightMargin - 20, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', totalsX, yPos);
  doc.text(invoice.total.toFixed(2), rightMargin - 20, yPos);

  // Add payment status
  yPos += 20;
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${invoice.status.toUpperCase()}`, leftMargin, yPos);
  if (invoice.status === 'paid' && invoice.paidDate) {
    doc.text(`Paid on: ${format(new Date(invoice.paidDate), 'dd/MM/yyyy')}`, leftMargin + 60, yPos);
  }

  // Add terms and conditions
  if (invoice.termsAndConditions) {
    yPos += 20;
    doc.setFontSize(10);
    doc.text('Terms and Conditions:', leftMargin, yPos);
    yPos += 5;
    doc.setFontSize(8);
    const terms = doc.splitTextToSize(invoice.termsAndConditions, pageWidth - 40);
    doc.text(terms, leftMargin, yPos);
  }

  return doc;
};
