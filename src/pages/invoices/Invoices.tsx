import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { fetchInvoices, addInvoice, updateInvoice } from '../../store/features/invoiceSlice';
import { fetchPatients } from '../../store/features/patientSlice';
import { Invoice } from '../../types/invoice';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import InvoiceList from '../../components/invoices/InvoiceList';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Invoices: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const clinicInfo = {
    name: user?.clinicName || 'Your Clinic',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || '',
  };

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
            <button
              onClick={handleCreateInvoice}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Invoice
            </button>
          </div>

          <InvoiceList onEdit={handleEditInvoice} clinicInfo={clinicInfo} />

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
