import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Invoice } from '../../types/invoice';
import { selectInvoices } from '../../store/features/invoiceSlice';
import { deleteInvoice, markInvoiceAsPaid, fetchInvoices } from '../../store/features/invoiceSlice';
import { AppDispatch } from '../../store/store';
import { generateInvoicePDF } from '../../utils/invoicePdfGenerator';
import toast from 'react-hot-toast';

interface InvoiceListProps {
  onEdit: (invoice: Invoice) => void;
  clinicInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onEdit, clinicInfo }) => {
  const dispatch = useDispatch<AppDispatch>();
  const invoices = useSelector(selectInvoices);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await dispatch(deleteInvoice(id)).unwrap();
        toast.success('Invoice deleted successfully');
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (window.confirm('Mark this invoice as paid?')) {
      try {
        await dispatch(markInvoiceAsPaid({
          id: invoice.id,
          amount: invoice.total,
          paymentMethod: 'cash'
        })).unwrap();
        toast.success('Invoice marked as paid');
        // Refresh invoices to ensure all components have latest data
        dispatch(fetchInvoices());
      } catch (error) {
        toast.error('Failed to mark invoice as paid');
      }
    }
  };

  const handlePrint = (invoice: Invoice) => {
    const doc = generateInvoicePDF(invoice, clinicInfo);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  const filteredInvoices = selectedStatus === 'all'
    ? invoices
    : invoices.filter(invoice => invoice.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Invoices</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.patientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.currency} {invoice.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handlePrint(invoice)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  {invoice.status !== 'paid' && (
                    <button
                      onClick={() => handleMarkAsPaid(invoice)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
