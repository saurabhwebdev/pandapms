import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchPatients,
  addPatient,
  updatePatient,
  deletePatient,
  selectPatients,
  selectPatientsLoading,
  selectPatientsError,
} from '../../store/features/patientSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PatientList from '../../components/patients/PatientList';
import PatientForm from '../../components/patients/PatientForm';
import Modal from '../../components/common/Modal';
import { Patient, PatientFormData } from '../../types/patient';
import toast from 'react-hot-toast';

export default function Patients() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectPatients);
  const loading = useAppSelector(selectPatientsLoading);
  const error = useAppSelector(selectPatientsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddPatient = async (data: PatientFormData) => {
    setFormLoading(true);
    try {
      await dispatch(addPatient(data)).unwrap();
      toast.success('Patient added successfully');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePatient = async (data: PatientFormData) => {
    if (!selectedPatient) return;
    
    setFormLoading(true);
    try {
      await dispatch(updatePatient({ id: selectedPatient.id, data })).unwrap();
      toast.success('Patient updated successfully');
      setIsModalOpen(false);
      setSelectedPatient(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await dispatch(deletePatient(patient.id)).unwrap();
        toast.success('Patient deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete patient');
      }
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const modalTitle = selectedPatient ? 'Edit Patient' : 'Add New Patient';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Add Patient
          </button>
        </div>

        {loading && !patients.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <PatientList
              patients={patients}
              onEdit={handleEdit}
              onDelete={handleDeletePatient}
            />
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalTitle}
        >
          <PatientForm
            initialData={selectedPatient || undefined}
            onSubmit={selectedPatient ? handleUpdatePatient : handleAddPatient}
            onCancel={handleCloseModal}
            loading={formLoading}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
