import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, BarChart2, Shield, Settings, CheckCircle2, ShoppingBag, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import AdminUsers from './AdminUsers';
import AdminDoctors from './AdminDoctors';
import AdminAppointments from './AdminAppointments';
import AdminReports from './AdminReports';
import AdminInquiries from './AdminInquiries';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, doctors, appointments, reports

  // Overview stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
          <div className="glass border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
            <h3 className="text-md font-extrabold text-white leading-none">Admin Area</h3>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Control Center</span>

            <div className="flex flex-col gap-1.5 mt-4">
              {[
                { id: 'overview', label: 'Overview Metrics', icon: Activity },
                { id: 'users', label: 'Manage Users', icon: Users },
                { id: 'doctors', label: 'Manage Doctors', icon: Shield },
                { id: 'appointments', label: 'Appointments Queue', icon: Calendar },
                { id: 'reports', label: 'Service Reports', icon: BarChart2 },
                { id: 'inquiries', label: 'Contact Inquiries', icon: Mail },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${activeTab === tab.id
                    ? 'bg-teal-600/15 border-teal-500 text-teal-400 font-bold'
                    : 'bg-navy-950/30 border-transparent hover:bg-navy-900 text-slate-400'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>


        </div>

        {/* Contents Grid */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* Header */}
              <div>
                <h2 className="text-2xl font-extrabold text-black">System Administration</h2>
                <p className="text-xs text-slate-400">Compile counts, update doctor listings, and deactivate credentials</p>
              </div>

              {/* Statistics Widgets Grid */}
              {loadingStats ? (
                <div className="text-xs text-slate-500 py-6 text-center">Checking stats dashboard...</div>
              ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Total Bookings</span>
                    <span className="text-2xl font-extrabold text-white block leading-tight mt-0.5">{stats.totalAppointments}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Today's Visits</span>
                    <span className="text-2xl font-extrabold text-teal-400 block leading-tight mt-0.5">{stats.todayAppointments}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Clinic / Home</span>
                    <span className="text-2xl font-extrabold text-black  block leading-tight mt-1">{stats.clinicVisits} / {stats.homeVisits}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Completions</span>
                    <span className="text-2xl font-extrabold text-green-400 block leading-tight mt-0.5">{stats.completedAppointments}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Cancellations</span>
                    <span className="text-2xl font-extrabold text-red-400 block leading-tight mt-0.5">{stats.cancelledAppointments}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Active Doctors</span>
                    <span className="text-2xl font-extrabold text-blue-400 block leading-tight mt-0.5">{stats.activeDoctors}</span>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 text-left">
                    <span className="text-[12px] text-black uppercase font-semibold">Registered Patients</span>
                    <span className="text-2xl font-extrabold text-white block leading-tight mt-0.5">{stats.registeredPatients}</span>
                  </div>



                </div>
              ) : null}

              {/* Quick info panel */}
              <div className="bg-navy-900 border border-slate-850 rounded-2xl p-6 text-left flex flex-col gap-3">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider">System Settings Summary</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  You are viewing the clinical operations board. Administrators hold privileges to override clinic dates, reassign specialists to bookings, modify user status, register clinical personnel, and inspect metrics diagrams.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setActiveTab('appointments')} className="text-xs font-bold bg-teal-650 hover:bg-teal-500 text-black py-2 px-4 rounded-xl transition-all shadow-md shadow-teal-500/10">Manage Bookings Queue</button>
                  <button onClick={() => setActiveTab('doctors')} className="text-xs font-semibold border border-slate-700 hover:bg-slate-800 text-slate-300 py-2 px-4 rounded-xl transition-colors">Edit Doctors Registry</button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'doctors' && <AdminDoctors />}
          {activeTab === 'appointments' && <AdminAppointments />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'inquiries' && <AdminInquiries />}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
