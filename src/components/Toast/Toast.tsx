import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { removeToast, Toast as ToastType } from '../../store/features/toastSlice';

const Toast: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id!));
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast: ToastType) => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-3 text-white shadow-lg transform transition-all duration-300 ease-in-out ${getToastColorClass(
            toast.type
          )}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

const getToastColorClass = (type: ToastType['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'info':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default Toast;
