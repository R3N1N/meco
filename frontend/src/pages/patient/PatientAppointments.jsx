import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, FileText, XCircle, AlertCircle } from 'lucide-react';
import API from '../../services/api';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await API.put(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'completed': return 'bg-teal-500/10 border-teal-500/30 text-teal-400';
      case 'cancelled': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-450';
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading bookings history...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-black">My Appointments</h2>
        <p className="text-xs text-slate-400">View upcoming visits and complete history log</p>
      </div>

      {appointments.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
          You do not have any appointments booked.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">ID: #{appt.id}</span>
                  <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusStyle(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-black shrink-0" />
                    <span className="text-xs text-black font-semibold">{new Date(appt.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black shrink-0" />
                    <span className="text-xs text-black font-semibold">{appt.appointment_time}</span>
                  </div>
                </div>

                {appt.appointment_type === 'clinic' ? (
                  <div className="flex items-center gap-2 bg-navy-950/40 p-2 rounded-lg border border-slate-900">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase">Clinic Practitioner</span>
                      <span className="text-xs text-black font-medium"> {appt.doctor_name || 'Assigned Specialist'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 bg-navy-950/40 p-2 rounded-lg border border-slate-900 items-start">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 uppercase">Home Service Location</span>
                      <span className="text-xs text-slate-300 leading-tight leading-relaxed">{appt.address}</span>
                    </div>
                  </div>
                )}

                {appt.notes && (
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="italic">Note: "{appt.notes}"</span>
                  </div>
                )}
              </div>

              {appt.status === 'pending' && (
                <button
                  disabled={cancellingId === appt.id}
                  onClick={() => handleCancel(appt.id)}
                  className="w-full mt-2 border border-red-900/40 bg-red-950/20 hover:bg-red-900/20 text-red-400 hover:text-red-300 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> {cancellingId === appt.id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
