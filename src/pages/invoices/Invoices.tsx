import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { AppDispatch, useAppSelector } from '../../store/store';
import {
  fetchInvoices,
  addInvoice,
  updateInvoice,
  selectInvoices,
  selectInvoicesLoading,
} from '../../store/features/invoiceSlice';
import { fetchPatients } from '../../store/features/patientSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InvoiceList from '../../components/invoices/InvoiceList';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import Modal from '../../components/common/Modal';
import { Invoice } from '../../types/invoice';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Invoices: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading } = useAuth();
  const invoices = useAppSelector(selectInvoices) || [];
  const invoicesLoading = useAppSelector(selectInvoicesLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const clinicInfo = {
    name: user?.clinicName || 'Your Clinic',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || '',
  };

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => 
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.items.some(item => 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount.toString().includes(searchTerm.toLowerCase())
      )
    );
  }, [invoices, searchTerm]);

  useEffect(() => {
    if (user) {
      dispatch(fetchInvoices());
      dispatch(fetchPatients());
    }
  }, [dispatch, user]);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (selectedInvoice) {
      await dispatch(updateInvoice({ id: selectedInvoice.id, data: formData }));
    } else {
      await dispatch(addInvoice(formData));
    }
    setIsModalOpen(false);
  };

  if (authLoading || invoicesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleCreateInvoice}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
              >
                Create Invoice
              </button>
            </div>
          </div>

          <InvoiceList 
            onEdit={handleEditInvoice} 
            clinicInfo={clinicInfo} 
            invoices={filteredInvoices} 
          />

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedInvoice ? 'Edit Invoice' : 'Create Invoice'}
          >
            <InvoiceForm
              initialData={selectedInvoice || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </Modal>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
