import DashboardLayout from '../../components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import {
  UserGroupIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;

      try {
        // Get total patients
        const patientsQuery = query(
          collection(db, 'clinics', auth.currentUser.uid, 'patients')
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const totalPatients = patientsSnapshot.size;

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsQuery = query(
          collection(db, 'clinics', auth.currentUser.uid, 'appointments'),
          where('date', '>=', today.toISOString()),
          where('date', '<', tomorrow.toISOString())
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const todayAppointments = appointmentsSnapshot.size;

        // Get monthly revenue and pending invoices
        const invoicesQuery = query(
          collection(db, 'clinics', auth.currentUser.uid, 'invoices')
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        
        let monthlyRevenue = 0;
        let pendingInvoices = 0;
        
        const currentMonth = new Date().getMonth();
        invoicesSnapshot.forEach((doc) => {
          const data = doc.data();
          const invoiceDate = new Date(data.date);
          
          if (invoiceDate.getMonth() === currentMonth) {
            monthlyRevenue += data.amount || 0;
          }
          
          if (data.status === 'pending') {
            pendingInvoices++;
          }
        });

        setStats({
          totalPatients,
          todayAppointments,
          monthlyRevenue,
          pendingInvoices,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const stats_cards = [
    {
      name: 'Total Patients',
      value: stats.totalPatients,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats_cards.map((stat) => (
            <div key={stat.name} className="overflow-hidden bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon
                      className={`w-6 h-6 text-white p-1 rounded ${stat.color}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 w-0 ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add more dashboard content here */}
      </div>
    </DashboardLayout>
  );
}
