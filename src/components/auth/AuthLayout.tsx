import { ReactNode } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const features = [
  {
    name: 'Appointment Management',
    description: 'Efficiently schedule and manage patient appointments with our intuitive calendar system.',
    icon: CalendarIcon,
  },
  {
    name: 'Patient Records',
    description: 'Securely store and access patient records, treatment history, and medical documents.',
    icon: UserGroupIcon,
  },
  {
    name: 'Digital Invoicing',
    description: 'Generate and manage professional invoices and track payments effortlessly.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Financial Tracking',
    description: 'Monitor your clinics financial performance with detailed reports and analytics.',
    icon: CurrencyRupeeIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Get insights into your practice with comprehensive analytics and reporting.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure Platform',
    description: 'Enterprise-grade security to protect your clinic and patient data.',
    icon: ShieldCheckIcon,
  },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Streamline Your Dental Practice
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Everything you need to manage your dental clinic efficiently in one place
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="flex items-start">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{feature.name}</h3>
                  <p className="mt-1 text-base text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
