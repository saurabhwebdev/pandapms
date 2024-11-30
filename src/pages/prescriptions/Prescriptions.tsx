import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchPrescriptions,
  addPrescription,
  updatePrescription,
  deletePrescription,
  selectPrescriptions,
  selectPrescriptionsLoading,
  selectPrescriptionsError,
} from '../../store/features/prescriptionSlice';
import { fetchPatients } from '../../store/features/patientSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PrescriptionList from '../../components/prescriptions/PrescriptionList';
import PrescriptionForm from '../../components/prescriptions/PrescriptionForm';
import Modal from '../../components/common/Modal';
import { Prescription } from '../../types/prescription';
import toast from 'react-hot-toast';
import { generatePrescriptionPDF } from '../../utils/pdfGenerator';

export default function Prescriptions() {
  const dispatch = useAppDispatch();
  const prescriptions = useAppSelector(selectPrescriptions);
  const loading = useAppSelector(selectPrescriptionsLoading);
  const error = useAppSelector(selectPrescriptionsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPrescriptions());
    dispatch(fetchPatients()); // We need patients for the form
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddPrescription = async (data: any) => {
    setFormLoading(true);
    try {
      await dispatch(addPrescription(data)).unwrap();
      toast.success('Prescription created successfully');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create prescription');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePrescription = async (data: any) => {
    if (!selectedPrescription) return;
    
    setFormLoading(true);
    try {
      await dispatch(updatePrescription({ id: selectedPrescription.id, data })).unwrap();
      toast.success('Prescription updated successfully');
      setIsModalOpen(false);
      setSelectedPrescription(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update prescription');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePrescription = async (prescription: Prescription) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await dispatch(deletePrescription(prescription.id)).unwrap();
        toast.success('Prescription deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete prescription');
      }
    }
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    generatePrescriptionPDF(prescription);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrescription(null);
  };

  const modalTitle = selectedPrescription ? 'Edit Prescription' : 'Create New Prescription';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Prescriptions</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Prescription
          </button>
        </div>

        {loading && !prescriptions.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <PrescriptionList
              prescriptions={prescriptions}
              onEdit={handleEdit}
              onDelete={handleDeletePrescription}
              onPrint={handlePrintPrescription}
            />
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalTitle}
        >
          <PrescriptionForm
            initialData={selectedPrescription || undefined}
            onSubmit={selectedPrescription ? handleUpdatePrescription : handleAddPrescription}
            onCancel={handleCloseModal}
            loading={formLoading}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
