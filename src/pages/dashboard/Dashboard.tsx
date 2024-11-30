import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../services/firebase/config';
import {
  UserGroupIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SubscriptionStatus from '../../components/SubscriptionStatus';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchStaticStats = async () => {
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

        setStats(prev => ({
          ...prev,
          totalPatients,
          todayAppointments,
        }));
      } catch (error) {
        console.error('Error fetching static stats:', error);
      }
    };

    // Fetch static stats once
    fetchStaticStats();

    // Set up real-time listener for invoices
    const invoicesQuery = query(
      collection(db, 'clinics', auth.currentUser.uid, 'invoices')
    );

    const unsubscribe = onSnapshot(invoicesQuery, (snapshot) => {
      let monthlyRevenue = 0;
      let pendingInvoices = 0;
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Count both draft and pending invoices
        if (data.status === 'draft' || data.status === 'pending') {
          pendingInvoices++;
        }
        
        // Calculate monthly revenue from paid invoices
        if (data.status === 'paid') {
          const invoiceDate = new Date(data.date);
          if (invoiceDate.getMonth() === currentMonth && 
              invoiceDate.getFullYear() === currentYear) {
            monthlyRevenue += data.total || 0;
          }
        }
      });

      setStats(prev => ({
        ...prev,
        monthlyRevenue,
        pendingInvoices,
      }));
    }, (error) => {
      console.error('Error in invoice listener:', error);
    });

    // Cleanup subscription
    return () => unsubscribe();
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
      color: 'bg-yellow-500',
    },
    {
      name: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: ClockIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <SubscriptionStatus />
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {stats_cards.map((card) => (
            <div
              key={card.name}
              className="flex items-center p-4 bg-white rounded-lg shadow-xs"
            >
              <div className={`p-3 mr-4 rounded-full ${card.color} text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-lg font-semibold text-gray-700">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
