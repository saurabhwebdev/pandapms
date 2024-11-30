import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchSettings, updateClinicProfile, updateInvoiceSettings, updateCurrency } from '../../store/features/settingsSlice';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface ClinicProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

interface InvoiceSettingsForm {
  taxRate: number;
  termsAndConditions: string;
  template: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'invoice'>('profile');
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const profileForm = useForm<ClinicProfileForm>({
    defaultValues: {
      name: settings.clinicProfile.name || '',
      email: settings.clinicProfile.email || '',
      phone: settings.clinicProfile.phone || '',
      address: settings.clinicProfile.address || '',
      website: settings.clinicProfile.website || ''
    }
  });

  const invoiceForm = useForm<InvoiceSettingsForm>({
    defaultValues: {
      taxRate: settings.invoiceSettings.taxRate || 0,
      termsAndConditions: settings.invoiceSettings.termsAndConditions || '',
      template: settings.invoiceSettings.template || 'default'
    }
  });

  // Update form values when settings are loaded
  useEffect(() => {
    profileForm.reset({
      name: settings.clinicProfile.name || '',
      email: settings.clinicProfile.email || '',
      phone: settings.clinicProfile.phone || '',
      address: settings.clinicProfile.address || '',
      website: settings.clinicProfile.website || ''
    });

    invoiceForm.reset({
      taxRate: settings.invoiceSettings.taxRate || 0,
      termsAndConditions: settings.invoiceSettings.termsAndConditions || '',
      template: settings.invoiceSettings.template || 'default'
    });
  }, [settings, profileForm, invoiceForm]);

  const handleProfileSubmit = async (data: ClinicProfileForm) => {
    try {
      setLoading(true);
      await dispatch(updateClinicProfile(data)).unwrap();
      toast.success('Clinic profile updated successfully');
    } catch (error) {
      toast.error('Failed to update clinic profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceSubmit = async (data: InvoiceSettingsForm) => {
    try {
      setLoading(true);
      await dispatch(updateInvoiceSettings(data as any)).unwrap();
      toast.success('Invoice settings updated successfully');
    } catch (error) {
      toast.error('Failed to update invoice settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    try {
      await dispatch(updateCurrency(currency)).unwrap();
      toast.success('Currency updated successfully');
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="mb-6">
          <div className="flex gap-4 border-b">
            <button
              className={`pb-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              Clinic Profile
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === 'invoice' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('invoice')}
            >
              Invoice Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Clinic Name</label>
                  <input
                    {...profileForm.register('name')}
                    className="w-full p-2 border rounded bg-white text-black"
                    placeholder="Enter clinic name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...profileForm.register('email')}
                    type="email"
                    className="w-full p-2 border rounded bg-white text-black"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    {...profileForm.register('phone')}
                    className="w-full p-2 border rounded bg-white text-black"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    {...profileForm.register('website')}
                    className="w-full p-2 border rounded bg-white text-black"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  {...profileForm.register('address')}
                  className="w-full p-2 border rounded bg-white text-black"
                  rows={3}
                  placeholder="Enter clinic address"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          ) : (
            <form onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  {...invoiceForm.register('taxRate', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Enter tax rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Terms and Conditions</label>
                <textarea
                  {...invoiceForm.register('termsAndConditions')}
                  className="w-full p-2 border rounded bg-white text-black"
                  rows={4}
                  placeholder="Enter terms and conditions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Template</label>
                <select
                  {...invoiceForm.register('template')}
                  className="w-full p-2 border rounded bg-white text-black"
                >
                  <option value="default">Default Template</option>
                  <option value="professional">Professional Template</option>
                  <option value="minimal">Minimal Template</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full p-2 border rounded bg-white text-black"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Invoice Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
