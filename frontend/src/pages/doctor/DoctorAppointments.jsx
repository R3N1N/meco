import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Check, X, Clipboard, ArrowRight } from 'lucide-react';
import API from '../../services/api';

const DoctorAppointments = ({ onWritePrescription }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today'); // today, upcoming, all
  const [actionId, setActionId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionId(id);
    try {
      await API.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const getFilteredAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    return appointments.filter(appt => {
      // Split off date
      const apptDateStr = new Date(appt.appointment_date).toISOString().split('T')[0];

      if (filter === 'today') {
        return apptDateStr === todayStr && appt.status !== 'cancelled';
      }
      if (filter === 'upcoming') {
        return apptDateStr >= todayStr && ['pending', 'confirmed'].includes(appt.status);
      }
      return true; // All
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'completed': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-450 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading assigned appointments...</div>;
  }

  const filteredList = getFilteredAppointments();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Assigned Appointments</h2>
          <p className="text-xs text-slate-400">View checkups timetables and update patient check status</p>
        </div>
        <div className="flex gap-2">
          {['today', 'upcoming', 'all'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`py-1.5 px-3 border rounded-lg text-xs font-medium capitalize transition-all ${filter === type
                ? 'bg-teal-650 border-teal-500 text-black font-semibold'
                : 'bg-navy-950 border-slate-800 hover:bg-navy-900 text-slate-400'
                }`}
            >
              {type === 'today' ? "Today's" : type}
            </button>
          ))}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
          No appointments found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((appt) => (
            <div key={appt.id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] text-slate-500 font-bold font-mono uppercase">Appt ID: #{appt.id}</span>
                  <span className={`px-2.5 py-0.5 border text-[10px] rounded-full uppercase font-bold tracking-wider ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-black">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>{new Date(appt.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>{appt.appointment_time}</span>
                  </div>
                </div>

                {/* Patient context */}
                <div className="bg-navy-950/40 p-3 rounded-lg border border-slate-900 flex flex-col gap-1 text-[11px] text-black leading-normal">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-black text-xs">
                      {appt.patient_name || appt.guest_name || 'Guest User'}
                    </span>
                  </div>
                  <span>Email: {appt.patient_email || appt.guest_email || 'N/A'}</span>
                  {appt.patient_phone || appt.guest_phone ? (
                    <span className="flex items-center gap-1 mt-0.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {appt.patient_phone || appt.guest_phone}
                    </span>
                  ) : null}
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-black bg-navy-950/20 p-2.5 rounded-lg border border-slate-900/40 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Service Fee</span>
                  <span className="text-teal-450 font-bold">Rs. {parseFloat(appt.cost_price || 0).toFixed(2)}</span>
                </div>

                {appt.notes && (
                  <span className="text-[10px] text-slate-450 italic leading-tight">Notes: "{appt.notes}"</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-slate-900 pt-3 mt-1">
                {appt.status === 'pending' && (
                  <>
                    <button
                      disabled={actionId === appt.id}
                      onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                      className="flex-1 bg-teal-650 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                    <button
                      disabled={actionId === appt.id}
                      onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                      className="border border-red-900/40 hover:bg-red-950/30 text-red-400 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}

                {appt.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => onWritePrescription(appt)}
                      className="flex-1 bg-teal-650 hover:bg-teal-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/10"
                    >
                      <Clipboard className="w-3.5 h-3.5" /> Diagnose & Prescribe <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={actionId === appt.id}
                      onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                      className="border border-red-900/40 hover:bg-red-950/30 text-red-400 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
