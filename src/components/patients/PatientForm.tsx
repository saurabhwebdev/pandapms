import { useState, FormEvent } from 'react';
import { PatientFormData } from '../../types/patient';

interface Props {
  initialData?: PatientFormData;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const defaultFormData: PatientFormData = {
  name: '',
  email: '',
  phone: '',
  age: 0,
  gender: 'male',
  address: '',
  medicalHistory: '',
};

export default function PatientForm({ initialData, onSubmit, onCancel, loading }: Props) {
  const [formData, setFormData] = useState<PatientFormData>(initialData || defaultFormData);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-black";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelClasses}>
          Name
        </label>
        <input
          type="text"
          id="name"
          className={inputClasses}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          type="email"
          id="email"
          className={inputClasses}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClasses}>
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          className={inputClasses}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="age" className={labelClasses}>
          Age
        </label>
        <input
          type="number"
          id="age"
          className={inputClasses}
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          required
          min="0"
          max="150"
        />
      </div>

      <div>
        <label htmlFor="gender" className={labelClasses}>
          Gender
        </label>
        <select
          id="gender"
          className={inputClasses}
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="address" className={labelClasses}>
          Address
        </label>
        <textarea
          id="address"
          className={inputClasses}
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="medicalHistory" className={labelClasses}>
          Medical History
        </label>
        <textarea
          id="medicalHistory"
          className={inputClasses}
          value={formData.medicalHistory}
          onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
          rows={4}
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
            initialData ? 'Update Patient' : 'Add Patient'
          )}
        </button>
      </div>
    </form>
  );
}
