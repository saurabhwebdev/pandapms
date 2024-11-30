import { format } from 'date-fns';
import { Invoice } from '../../types/invoice';
import { generateInvoicePDF } from '../../utils/invoicePdfGenerator';
import { PencilIcon, PrinterIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { deleteInvoice, markInvoiceAsPaid } from '../../store/features/invoiceSlice';
import toast from 'react-hot-toast';

interface Props {
  onEdit: (invoice: Invoice) => void;
  clinicInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  invoices: Invoice[];
}

const InvoiceList = ({ onEdit, clinicInfo, invoices }: Props) => {
  const dispatch = useDispatch();

  const handlePrint = (invoice: Invoice) => {
    const doc = generateInvoicePDF(invoice, clinicInfo);
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await dispatch(deleteInvoice(id)).unwrap();
        toast.success('Invoice deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete invoice');
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
      } catch (error: any) {
        toast.error(error.message || 'Failed to mark invoice as paid');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!invoices.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invoice.invoiceNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.patientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(invoice.date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${invoice.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => handlePrint(invoice)}
                  className="text-gray-600 hover:text-gray-900"
                  title="Print Invoice"
                >
                  <PrinterIcon className="h-5 w-5 inline" />
                </button>
                <button
                  onClick={() => onEdit(invoice)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit Invoice"
                >
                  <PencilIcon className="h-5 w-5 inline" />
                </button>
                {invoice.status !== 'paid' && (
                  <button
                    onClick={() => handleMarkAsPaid(invoice)}
                    className="text-green-600 hover:text-green-900 text-sm"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Invoice"
                >
                  <TrashIcon className="h-5 w-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
