import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addInventoryItem, updateInventoryItem } from '../../store/features/inventorySlice';
import { InventoryItem, InventoryFormData } from '../../types/inventory';
import { selectSuppliers } from '../../store/features/inventorySlice';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InventoryFormProps {
  item?: InventoryItem;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
}

const defaultFormData: InventoryFormData = {
  name: '',
  sku: '',
  description: '',
  category: '',
  unit: '',
  currentStock: 0,
  minimumStock: 0,
  reorderPoint: 0,
  price: 0,
  supplierId: '',
  location: '',
};

const categories = [
  'Dental Materials',
  'Instruments',
  'Equipment',
  'PPE',
  'Cleaning Supplies',
  'Office Supplies',
  'Other'
];

const units = [
  'pieces',
  'boxes',
  'packs',
  'sets',
  'bottles',
  'tubes',
  'pairs',
  'rolls',
  'kits'
];

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onClose, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const suppliers = useSelector(selectSuppliers);
  const [formData, setFormData] = useState<InventoryFormData>(item || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormData, string>>>({});

  const validate = (data: InventoryFormData) => {
    const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};

    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.sku.trim()) newErrors.sku = 'SKU is required';
    if (!data.category) newErrors.category = 'Category is required';
    if (!data.unit) newErrors.unit = 'Unit is required';
    if (data.currentStock < 0) newErrors.currentStock = 'Stock cannot be negative';
    if (data.minimumStock < 0) newErrors.minimumStock = 'Minimum stock cannot be negative';
    if (data.reorderPoint < data.minimumStock) {
      newErrors.reorderPoint = 'Reorder point must be greater than minimum stock';
    }
    if (data.price < 0) newErrors.price = 'Price cannot be negative';
    if (!data.supplierId) newErrors.supplierId = 'Supplier is required';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (item) {
        await dispatch(updateInventoryItem({ id: item.id, data: formData })).unwrap();
      } else {
        await dispatch(addInventoryItem(formData)).unwrap();
      }
      onSubmit(formData);
    } catch (error) {
      console.error('Failed to save inventory item:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                value={formData.unit}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={e => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.currentStock && <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>}
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock *</label>
              <input
                type="number"
                value={formData.minimumStock}
                onChange={e => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.minimumStock && <p className="mt-1 text-sm text-red-600">{errors.minimumStock}</p>}
            </div>

            {/* Reorder Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point *</label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={e => setFormData(prev => ({ ...prev, reorderPoint: Number(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.reorderPoint && <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={formData.supplierId}
                onChange={e => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter storage location"
                className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Enter item description"
              className="w-full px-3 py-2 bg-white text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
