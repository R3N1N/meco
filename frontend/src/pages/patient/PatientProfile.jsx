import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, MapPin, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
  const { user, updateProfile } = useAuth();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });

  const onSubmit = async (data) => {
    setSuccess(false);
    setError('');
    setSaving(true);
    try {
      await updateProfile(data.name, data.phone, data.address);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e || 'Failed to update user profile information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-black">Patient Profile</h2>
        <p className="text-xs text-slate-400">Manage your contact credentials and demographic logs</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-slate-800 flex flex-col gap-6 relative">
        {success && (
          <div className="bg-teal-950/35 border border-teal-900/40 text-teal-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Profile information synchronized successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-950/35 border border-red-900/45 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Account Role</label>
            <input
              type="text"
              disabled
              value={user?.role?.toUpperCase() || ''}
              className="w-full bg-navy-950/60 text-slate-500 rounded-lg p-2.5 border border-slate-900 text-xs cursor-not-allowed font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-navy-950/60 text-slate-500 rounded-lg p-2.5 border border-slate-900 text-xs cursor-not-allowed font-mono"
            />
            <span className="text-[10px] text-slate-600">Registered email accounts cannot be modified manually.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Full Name</label>
            <div className="relative">
              <input
                type="text"
                className={`w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 border text-xs focus:outline-none focus:border-teal-500 ${errors.name ? 'border-red-500/50' : 'border-slate-850'}`}
                {...register('name', { required: 'Name parameter is required' })}
              />
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
            {errors.name && <span className="text-red-400 text-[10px]">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
                {...register('phone')}
              />
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Residential Address</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-navy-950 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
                {...register('address')}
              />
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-850 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-2 shadow-md shadow-teal-500/10"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Modifications'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
