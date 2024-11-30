import { Patient } from '../../types/patient';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientList({ patients, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="pl-8 pr-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Age/Gender
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Added On
            </th>
            <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="pl-8 pr-6 py-6 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">{patient.name}</span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-900">{patient.phone}</span>
                  <span className="text-sm text-gray-500">{patient.email}</span>
                </div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <span className="text-sm text-gray-900">
                  {patient.age} years / {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <span className="text-sm text-gray-500">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-right">
                <button
                  onClick={() => onEdit(patient)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                  aria-label="Edit patient"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(patient)}
                  className="text-red-600 hover:text-red-900"
                  aria-label="Delete patient"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {patients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found</p>
        </div>
      )}
    </div>
  );
}
