import { useState, FormEvent, useEffect } from 'react';
import { AppointmentFormData, AppointmentStatus } from '../../types/appointment';
import { useAppSelector } from '../../store/store';
import { selectPatients } from '../../store/features/patientSlice';

interface Props {
  initialData?: AppointmentFormData;
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const defaultFormData: AppointmentFormData = {
  patientId: '',
  patientName: '',
  date: '',
  time: '',
  notes: '',
  status: 'scheduled',
  treatmentType: '',
  duration: 30,
};

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

export default function AppointmentForm({ initialData, onSubmit, onCancel, loading }: Props) {
  const [formData, setFormData] = useState<AppointmentFormData>(initialData || defaultFormData);
  const patients = useAppSelector(selectPatients);

  // Set default date to today if not provided
  useEffect(() => {
    if (!initialData) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId,
        patientName: patient.name
      }));
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="patient" className={labelClasses}>
          Patient
        </label>
        <select
          id="patient"
          className={inputClasses}
          value={formData.patientId}
          onChange={(e) => handlePatientSelect(e.target.value)}
          required
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className={labelClasses}>
            Date
          </label>
          <input
            type="date"
            id="date"
            className={inputClasses}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="time" className={labelClasses}>
            Time
          </label>
          <input
            type="time"
            id="time"
            className={inputClasses}
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="treatmentType" className={labelClasses}>
          Treatment Type
        </label>
        <input
          type="text"
          id="treatmentType"
          className={inputClasses}
          value={formData.treatmentType}
          onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
          placeholder="e.g., Dental Cleaning, Root Canal"
        />
      </div>

      <div>
        <label htmlFor="duration" className={labelClasses}>
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          className={inputClasses}
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          min="15"
          max="240"
          step="15"
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClasses}>
          Status
        </label>
        <select
          id="status"
          className={inputClasses}
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
          required
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className={labelClasses}>
          Notes
        </label>
        <textarea
          id="notes"
          className={inputClasses}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any special instructions or notes"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            initialData ? 'Update Appointment' : 'Schedule Appointment'
          )}
        </button>
      </div>
    </form>
  );
}
