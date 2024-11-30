import { useEffect, useState, useMemo } from 'react';
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
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Prescriptions() {
  const dispatch = useAppDispatch();
  const prescriptions = useAppSelector(selectPrescriptions);
  const loading = useAppSelector(selectPrescriptionsLoading);
  const error = useAppSelector(selectPrescriptionsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter prescriptions based on search term
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicines.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [prescriptions, searchTerm]);

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
    const doc = generatePrescriptionPDF(prescription);
    doc.save(`Prescription-${prescription.id}.pdf`);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Prescriptions</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
            >
              Create Prescription
            </button>
          </div>
        </div>

        {loading && !prescriptions.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <PrescriptionList
              prescriptions={filteredPrescriptions}
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
