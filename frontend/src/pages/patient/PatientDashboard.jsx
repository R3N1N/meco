import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, User, Eye, PlusCircle, Activity, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import PatientAppointments from './PatientAppointments';
import PatientPrescriptions from './PatientPrescriptions';
import PatientProfile from './PatientProfile';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, prescriptions, profile
  const [recentAppt, setRecentAppt] = useState(null);
  const [latestPresc, setLatestPresc] = useState(null);
  const [stats, setStats] = useState({ appointmentsCount: 0, prescriptionsCount: 0, testCount: 0 });
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoadingOverview(true);
      try {
        // Fetch appointments
        const apptRes = await API.get('/appointments');
        const appointments = apptRes.data;

        // Find next upcoming appointment
        const upcoming = appointments
          .filter(a => ['pending', 'confirmed'].includes(a.status))
          .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0];
        setRecentAppt(upcoming);

        // Fetch prescriptions
        const prescRes = await API.get('/prescriptions');
        const prescriptions = prescRes.data;
        setLatestPresc(prescriptions[0]); // Sort order is DESC by backend

        // Fetch tests
        const testRes = await API.get('/va-tests');
        const tests = testRes.data;

        setStats({
          appointmentsCount: appointments.length,
          prescriptionsCount: prescriptions.length,
          testCount: tests.length
        });
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoadingOverview(false);
      }
    };

    if (activeTab === 'overview') {
      fetchOverviewData();
    }
  }, [activeTab]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Sidebar Controls */}
        <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
          <div className="glass border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
            <h3 className="text-md font-extrabold text-white leading-none">Patient Area</h3>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Medical Portal</span>

            <div className="flex flex-col gap-1.5 mt-4">
              {[
                { id: 'overview', label: 'Overview Dashboard', icon: Activity },
                { id: 'appointments', label: 'My Bookings', icon: Calendar },
                { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
                { id: 'profile', label: 'Profile Settings', icon: User },
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
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Self Screener</span>
            <p className="text-[11px] text-slate-400 leading-normal leading-tight">
              Acuity checks can be performed instantly.
            </p>
            <Link
              to="/va-test"
              className="text-[10px] font-bold text-teal-400 flex items-center gap-0.5 hover:text-white transition-colors"
            >
              Start Eye Test <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Content Panels */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* Profile Intro header */}
              <div>
                <h2 className="text-2xl font-extrabold text-black">Welcome back, {user?.name}!</h2>
                <p className="text-xs text-slate-400">Manage your ophthalmic records and view clinic appointments.</p>
              </div>

              {/* Stats widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-black uppercase tracking-wider">Booked Exams</span>
                    <span className="text-lg font-bold text-white leading-tight mt-0.5">{stats.appointmentsCount}</span>
                  </div>
                </div>

                <div className="glass rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-black uppercase tracking-wider">Prescriptions</span>
                    <span className="text-lg font-bold text-white leading-tight mt-0.5">{stats.prescriptionsCount}</span>
                  </div>
                </div>

                <div className="glass rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-black uppercase tracking-wider">Visual Acuity Logs</span>
                    <span className="text-lg font-bold text-white leading-tight mt-0.5">{stats.testCount}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Info section */}
              {loadingOverview ? (
                <div className="text-xs text-slate-500 py-6 text-center">Loading portal summary...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Next Booking widget */}
                  <div className="glass rounded-2xl p-6 border border-slate-850 flex flex-col justify-between gap-4 text-left">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-3">
                      Upcoming Appointment
                    </h3>

                    {recentAppt ? (
                      <div className="flex flex-col gap-3 py-2">
                        <div className="flex justify-between items-center text-xs text-black font-semibold">
                          <span className="text-slate-350">{new Date(recentAppt.appointment_date).toLocaleDateString()}</span>
                          <span className="text-teal-400">{recentAppt.appointment_time}</span>
                        </div>
                        {recentAppt.appointment_type === 'clinic' ? (
                          <span className="text-xs text-slate-400">In-clinic Visit: {recentAppt.doctor_name}</span>
                        ) : (
                          <div className="flex gap-1.5 text-xs text-slate-400 items-start">
                            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{recentAppt.address}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full px-3 py-0.5 self-start uppercase font-bold tracking-wider">
                            Status: {recentAppt.status}
                          </span>
                          <span className="text-xs font-bold text-teal-400">
                            Fee: Rs. {parseFloat(recentAppt.cost_price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-white flex flex-col items-center gap-2">
                        <span>No upcoming appointments scheduled.</span>
                        <Link to="/book" className="text-teal-400 underline font-semibold flex items-center gap-0.5">
                          <PlusCircle className="w-4.5 h-4.5 text-teal-400 inline" /> Book one now
                        </Link>
                      </div>
                    )}

                    {recentAppt && (
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="w-full bg-navy-950 border border-slate-900 hover:bg-slate-900 py-2 rounded-xl text-xs font-bold text-black transition-colors"
                      >
                        Manage Booking
                      </button>
                    )}
                  </div>

                  {/* Latest prescription widget */}
                  <div className="glass rounded-2xl p-6 border border-slate-850 flex flex-col justify-between gap-4 text-left">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-3">
                      Latest Prescription
                    </h3>

                    {latestPresc ? (
                      <div className="flex flex-col gap-2 py-2">
                        <span className="text-xs font-bold text-black">Diagnosis: {latestPresc.diagnosis}</span>
                        <span className="text-xs text-black">Written by:  {latestPresc.doctor_name}</span>
                        <span className="text-[10px] text-black">Issued on: {new Date(latestPresc.created_at).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No prescription logs found.
                      </div>
                    )}

                    {latestPresc && (
                      <button
                        onClick={() => setActiveTab('prescriptions')}
                        className="w-full bg-navy-950 border border-slate-900 hover:bg-slate-900 py-2 rounded-xl text-xs font-bold text-black transition-colors"
                      >
                        View Full Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && <PatientAppointments />}
          {activeTab === 'prescriptions' && <PatientPrescriptions />}
          {activeTab === 'profile' && <PatientProfile />}
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
