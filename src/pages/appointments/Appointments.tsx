import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  selectAppointments,
  selectAppointmentsLoading,
  selectAppointmentsError,
} from '../../store/features/appointmentSlice';
import { fetchPatients } from '../../store/features/patientSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import Modal from '../../components/common/Modal';
import { Appointment, AppointmentFormData } from '../../types/appointment';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Appointments() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments based on search term
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchPatients()); // We need patients for the form
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddAppointment = async (data: AppointmentFormData) => {
    setFormLoading(true);
    try {
      await dispatch(addAppointment(data)).unwrap();
      toast.success('Appointment scheduled successfully');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule appointment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAppointment = async (data: AppointmentFormData) => {
    if (!selectedAppointment) return;
    
    setFormLoading(true);
    try {
      await dispatch(updateAppointment({ id: selectedAppointment.id, data })).unwrap();
      toast.success('Appointment updated successfully');
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appointment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await dispatch(deleteAppointment(appointment.id)).unwrap();
        toast.success('Appointment deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete appointment');
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const modalTitle = selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 whitespace-nowrap"
            >
              Schedule Appointment
            </button>
          </div>
        </div>

        {loading && !appointments.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <AppointmentList
              appointments={filteredAppointments}
              onEdit={handleEdit}
              onDelete={handleDeleteAppointment}
            />
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalTitle}
        >
          {({ onClose }) => (
            <AppointmentForm
              initialData={selectedAppointment || undefined}
              onSubmit={selectedAppointment ? handleUpdateAppointment : handleAddAppointment}
              onCancel={onClose}
              loading={formLoading}
            />
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
