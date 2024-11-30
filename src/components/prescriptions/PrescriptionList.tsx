import { useState } from 'react';
import { Prescription } from '../../types/prescription';
import { PencilIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Props {
  prescriptions: Prescription[];
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescription: Prescription) => void;
  onPrint: (prescription: Prescription) => void;
}

export default function PrescriptionList({ prescriptions, onEdit, onDelete, onPrint }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="pl-8 pr-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
              Medicines
            </th>
            <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prescriptions.map((prescription) => (
            <tr
              key={prescription.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleExpand(prescription.id)}
            >
              <td className="pl-8 pr-6 py-6 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {prescription.patientName || 'Unknown Patient'}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-center">
                <span className="text-sm text-gray-900">
                  {format(new Date(prescription.date), 'MMM dd, yyyy')}
                </span>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="text-sm text-gray-900">
                  {prescription.medicines.length} {prescription.medicines.length === 1 ? 'medicine' : 'medicines'}
                </span>
              </td>
              <td className="px-6 py-6 whitespace-nowrap text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrint(prescription);
                  }}
                  className="text-gray-600 hover:text-gray-900 mr-4"
                  aria-label="Print prescription"
                >
                  <PrinterIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(prescription);
                  }}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                  aria-label="Edit prescription"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(prescription);
                  }}
                  className="text-red-600 hover:text-red-900"
                  aria-label="Delete prescription"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {prescriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      )}

      {/* Expanded View */}
      {expandedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {(() => {
              const prescription = prescriptions.find(p => p.id === expandedId);
              if (!prescription) return null;

              return (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Prescription Details
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {format(new Date(prescription.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="border-t border-b border-gray-200 py-4">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Patient Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{prescription.patientName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {format(new Date(prescription.date), 'MMMM dd, yyyy')}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Medicines</h4>
                    <div className="space-y-4">
                      {prescription.medicines.map((medicine, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Name</dt>
                              <dd className="mt-1 text-sm text-gray-900">{medicine.name}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Dosage</dt>
                              <dd className="mt-1 text-sm text-gray-900">{medicine.dosage}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                              <dd className="mt-1 text-sm text-gray-900">{medicine.frequency}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Duration</dt>
                              <dd className="mt-1 text-sm text-gray-900">{medicine.duration}</dd>
                            </div>
                            {medicine.instructions && (
                              <div className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Instructions</dt>
                                <dd className="mt-1 text-sm text-gray-900">{medicine.instructions}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-600">{prescription.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setExpandedId(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => onPrint(prescription)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Print Prescription
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
