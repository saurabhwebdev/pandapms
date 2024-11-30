import { useEffect, useState } from 'react';
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

export default function Appointments() {
  const dispatch = useAppDispatch();
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);
  const error = useAppSelector(selectAppointmentsError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Schedule Appointment
          </button>
        </div>

        {loading && !appointments.length ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <AppointmentList
              appointments={appointments}
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
          <AppointmentForm
            initialData={selectedAppointment || undefined}
            onSubmit={selectedAppointment ? handleUpdateAppointment : handleAddAppointment}
            onCancel={handleCloseModal}
            loading={formLoading}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
