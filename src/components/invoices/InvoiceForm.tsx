import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { selectPatients } from '../../store/features/patientSlice';
import { InvoiceFormData, InvoiceItem } from '../../types/invoice';
import { format } from 'date-fns';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
}

const defaultItem: InvoiceItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const patients = useSelector(selectPatients);
  const [formData, setFormData] = useState<InvoiceFormData>({
    patientId: '',
    patientName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    items: [{ ...defaultItem }],
    subtotal: 0,
    taxRate: 18, // Default GST rate
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 0,
    status: 'draft',
    currency: 'INR',
    ...initialData,
  });

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * formData.discountRate) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * formData.taxRate) / 100;
    const total = discountedSubtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatient = patients.find(p => p.id === e.target.value);
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
      }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = Number(item.quantity) * Number(item.unitPrice);
    }
    
    updatedItems[index] = item;
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }],
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals(updatedItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select
              value={formData.patientId}
              onChange={handlePatientChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="Select due date"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Invoice Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="Select date"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
            <select
              value={formData.currency}
              onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Items Header */}
        <div className="grid grid-cols-12 gap-4 mb-2 px-4 text-sm font-medium text-gray-700">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-lg border border-gray-200">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Enter item description"
                  className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                  placeholder="Qty"
                  min="1"
                  className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.amount}
                  readOnly
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 shadow-sm sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax and Discount Inputs */}
          <div className="space-y-4">
            {/* Discount Rate Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                value={formData.discountRate || 0}
                onChange={e => {
                  const newDiscountRate = Number(e.target.value);
                  setFormData(prev => {
                    const discountAmount = (prev.subtotal * newDiscountRate) / 100;
                    const discountedSubtotal = prev.subtotal - discountAmount;
                    const newTaxAmount = (discountedSubtotal * prev.taxRate) / 100;
                    return {
                      ...prev,
                      discountRate: newDiscountRate,
                      discountAmount: discountAmount,
                      taxAmount: newTaxAmount,
                      total: discountedSubtotal + newTaxAmount
                    };
                  });
                }}
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter discount percentage"
                className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* GST Rate Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={e => {
                  const newTaxRate = Number(e.target.value);
                  setFormData(prev => {
                    const discountedSubtotal = prev.subtotal - prev.discountAmount;
                    const newTaxAmount = (discountedSubtotal * newTaxRate) / 100;
                    return {
                      ...prev,
                      taxRate: newTaxRate,
                      taxAmount: newTaxAmount,
                      total: discountedSubtotal + newTaxAmount
                    };
                  });
                }}
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter GST rate"
                className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Totals Display */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900">{formData.currency} {formData.subtotal.toFixed(2)}</span>
            </div>
            {formData.discountRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Discount ({formData.discountRate}%):</span>
                <span className="text-red-600">-{formData.currency} {formData.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">GST ({formData.taxRate}%):</span>
              <span className="text-gray-900">{formData.currency} {formData.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">{formData.currency} {formData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="Enter any additional notes"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Terms and Conditions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terms and Conditions</label>
          <textarea
            value={formData.termsAndConditions || ''}
            onChange={e => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
            rows={4}
            placeholder="Enter terms and conditions"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
