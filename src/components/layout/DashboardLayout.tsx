import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase/config';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import TypewriterText from '../common/TypewriterText';

interface Props {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
  { name: 'Prescriptions', href: '/prescriptions', icon: DocumentTextIcon },
  { name: 'Invoices', href: '/invoices', icon: CurrencyRupeeIcon },
  { 
    name: 'Inventory', 
    href: '#', 
    icon: ClipboardDocumentListIcon,
    disabled: true,
    tooltip: 'Coming Soon'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon
  },
];

export default function DashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center px-4">
            <Link to="/" className="text-xl font-semibold text-primary-600">
              <TypewriterText text="Panda Dentist" speed={100} />
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <ul>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <div 
                      className="group relative"
                      title={item.tooltip}
                    >
                      <Link
                        to={item.href}
                        onClick={(e) => item.disabled && e.preventDefault()}
                        className={`${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : item.disabled
                            ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                            : 'text-gray-600 hover:bg-gray-50'
                        } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? 'text-primary-600' : item.disabled ? 'text-gray-400' : 'text-gray-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                      {item.disabled && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.tooltip}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col bg-white border-r border-gray-200 px-6">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="text-xl font-semibold text-primary-600">
              <TypewriterText text="Panda Dentist" speed={100} />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <div 
                          className="group relative"
                          title={item.tooltip}
                        >
                          <Link
                            to={item.href}
                            onClick={(e) => item.disabled && e.preventDefault()}
                            className={`${
                              isActive
                                ? 'bg-primary-50 text-primary-600'
                                : item.disabled
                                ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                                : 'text-gray-600 hover:bg-gray-50'
                            } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive ? 'text-primary-600' : item.disabled ? 'text-gray-400' : 'text-gray-600'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                          {item.disabled && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.tooltip}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
              {/* Divider */}
              <li className="mt-auto -mx-6 px-6">
                <div className="h-px bg-gray-200"></div>
              </li>
              {/* Sign out button */}
              <li className="-mx-2">
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowLeftOnRectangleIcon
                    className="h-6 w-6 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="p-2 -ml-2 text-gray-600 rounded-md lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="ml-2 text-xl font-semibold text-primary-600 flex items-center">
            <TypewriterText text="Panda Dentist" speed={100} />
          </span>
        </div>
        <main className="flex-1 p-6 w-full bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
