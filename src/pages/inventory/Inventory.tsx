import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import {
  fetchInventoryItems,
  fetchSuppliers,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryError
} from '../../store/features/inventorySlice';
import { useAuth } from '../../hooks/useAuth';
import InventoryList from '../../components/inventory/InventoryList';
import InventoryForm from '../../components/inventory/InventoryForm';
import Alert from '../../components/common/Alert';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Inventory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const inventoryItems = useSelector(selectInventoryItems);
  const loading = useSelector(selectInventoryLoading);
  const error = useSelector(selectInventoryError);

  useEffect(() => {
    if (user) {
      dispatch(fetchInventoryItems());
      dispatch(fetchSuppliers());
    }
  }, [dispatch, user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Item
        </button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <InventoryList
          items={inventoryItems}
          onEdit={(id) => {
            // Handle edit
          }}
          onDelete={(id) => {
            // Handle delete
          }}
        />
      )}

      {isFormOpen && (
        <InventoryForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => {
            // Handle form submission
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
};

export default Inventory;
