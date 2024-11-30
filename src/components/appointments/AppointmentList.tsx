import { Appointment } from '../../types/appointment';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no-show':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AppointmentList({ appointments, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="pl-8 pr-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Treatment
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-gray-50">
              <td className="pl-8 pr-6 py-6 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {appointment.patientName}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-900">
                    {new Date(appointment.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {appointment.time}
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-900">
                    {appointment.treatmentType || 'General Checkup'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {appointment.duration} mins
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-right">
                <button
                  onClick={() => onEdit(appointment)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                  aria-label="Edit appointment"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(appointment)}
                  className="text-red-600 hover:text-red-900"
                  aria-label="Delete appointment"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
}
