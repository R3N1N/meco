import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Clock, FileText, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import DoctorAppointments from './DoctorAppointments';
import DoctorSchedule from './DoctorSchedule';
import DoctorPrescriptions from './DoctorPrescriptions';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, schedules, prescriptions
  const [activeAppointmentForPresc, setActiveAppointmentForPresc] = useState(null);

  // Stats
  const [todayCount, setTodayCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await API.get('/appointments');
      const appts = res.data;
      const todayStr = new Date().toISOString().split('T')[0];

      const todayAppts = appts.filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === todayStr);
      const pendingAppts = appts.filter(a => a.status === 'pending');

      setTodayCount(todayAppts.length);
      setPendingCount(pendingAppts.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const handleWritePrescription = (appointment) => {
    setActiveAppointmentForPresc(appointment);
    setActiveTab('prescriptions');
  };

  const handleClearActiveAppointment = () => {
    setActiveAppointmentForPresc(null);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
          <div className="glass border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
            <h3 className="text-md font-extrabold text-white leading-none">Doctor Portal</h3>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Clinical Dashboard</span>

            <div className="flex flex-col gap-1.5 mt-4">
              {[
                { id: 'dashboard', label: 'Overview & Queue', icon: Activity },
                { id: 'schedules', label: 'Manage Schedules', icon: Clock },
                { id: 'prescriptions', label: 'Prescriptions Hub', icon: FileText },
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

          <div className="hidden md:flex flex-col gap-2 p-4 glass-accent border border-teal-800/20 rounded-2xl">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Logged In As</span>
            <div className="flex flex-col mt-0.5">
              <span className="text-xs font-bold text-black">{user?.name}</span>
              <span className="text-[9px] text-black truncate leading-none mt-1">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-extrabold text-black">Practitioner Overview</h2>
                <p className="text-xs text-slate-400">Review checkups queue and patient request logs.</p>
              </div>

              {/* Stats Widgets */}
              {loadingStats ? (
                <span className="text-xs text-slate-500">Checking patient list...</span>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black uppercase tracking-wider">Scheduled Today</span>
                      <span className="text-lg font-bold text-white leading-tight mt-0.5">{todayCount}</span>
                    </div>
                  </div>

                  <div className="glass rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-black uppercase tracking-wider">Pending Approvals</span>
                      <span className="text-lg font-bold text-white leading-tight mt-0.5">{pendingCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments module */}
              <DoctorAppointments onWritePrescription={handleWritePrescription} />
            </div>
          )}

          {activeTab === 'schedules' && <DoctorSchedule />}

          {activeTab === 'prescriptions' && (
            <DoctorPrescriptions
              activeAppointment={activeAppointmentForPresc}
              onClearActiveAppointment={handleClearActiveAppointment}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
