import { useEffect, useState, useMemo } from 'react';
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
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Patients() {
  const dispatch = useAppDispatch();
  const patients = useAppSelector(selectPatients);
  const loading = useAppSelector(selectPatientsLoading);
  const error = useAppSelector(selectPatientsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary whitespace-nowrap"
            >
              Add Patient
            </button>
          </div>
        </div>

        {loading && !patients.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <PatientList
              patients={filteredPatients}
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
