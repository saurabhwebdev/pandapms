import { useState } from 'react';
import { useAppSelector } from '../../store/store';
import { selectPatients } from '../../store/features/patientSlice';
import { Medicine, PrescriptionFormData } from '../../types/prescription';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  initialData?: PrescriptionFormData;
  onSubmit: (data: PrescriptionFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const emptyMedicine: Medicine = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

export default function PrescriptionForm({ initialData, onSubmit, onCancel, loading }: Props) {
  const patients = useAppSelector(selectPatients);
  const [formData, setFormData] = useState<PrescriptionFormData>(
    initialData || {
      patientId: '',
      patientName: '',
      date: new Date().toISOString().split('T')[0],
      medicines: [{ ...emptyMedicine }],
      notes: '',
    }
  );

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = patients.find(p => p.id === e.target.value);
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patientId: '',
        patientName: '',
      }));
    }
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = {
      ...newMedicines[index],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { ...emptyMedicine }],
    }));
  };

  const removeMedicine = (index: number) => {
    if (formData.medicines.length > 1) {
      const newMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, medicines: newMedicines }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            id="patient"
            value={formData.patientId}
            onChange={handlePatientChange}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Medicines</h3>
          <button
            type="button"
            onClick={addMedicine}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Medicine
          </button>
        </div>

        {formData.medicines.map((medicine, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-900">Medicine #{index + 1}</h4>
              {formData.medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={medicine.name}
                  onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage</label>
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <input
                  type="text"
                  value={medicine.frequency}
                  onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  placeholder="e.g., 3 times a day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  value={medicine.duration}
                  onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  placeholder="e.g., 7 days"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <input
                  type="text"
                  value={medicine.instructions}
                  onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
                  placeholder="e.g., Take after meals"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Prescription' : 'Create Prescription'}
        </button>
      </div>
    </form>
  );
}
