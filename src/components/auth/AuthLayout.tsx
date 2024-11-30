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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="flex min-h-screen">
        {/* Left side - Auth Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-3 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center bg-gray-900 px-4 py-12 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Streamline Your Dental Practice
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Everything you need to manage your dental clinic efficiently in one place
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className="relative rounded-2xl border border-gray-800 bg-gray-800/50 p-6 hover:bg-gray-800/75 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-8 w-8 text-purple-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{feature.name}</h3>
                      <p className="mt-2 text-sm text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-base text-gray-300">
                Join thousands of dental professionals who trust our platform
              </p>
              <div className="mt-4 flex justify-center space-x-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">1000+</p>
                  <p className="mt-1 text-sm text-gray-300">Dental Clinics</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">50K+</p>
                  <p className="mt-1 text-sm text-gray-300">Patients Managed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="mt-1 text-sm text-gray-300">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
