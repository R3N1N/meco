import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MapPin, Edit, XCircle, ChevronLeft, Loader } from 'lucide-react';
import API from '../../services/api';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, edit

  // Edit states
  const [editingAppt, setEditingAppt] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAppointments(), fetchDoctors()]);
      setLoading(false);
    };
    initData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This cannot be undone.')) return;
    try {
      await API.put(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleEditClick = (appt) => {
    setEditingAppt(appt);
    setView('edit');
    // Parse formatting: YYYY-MM-DD
    const isoDate = new Date(appt.appointment_date).toISOString().split('T')[0];
    setDate(isoDate);
    setTime(appt.appointment_time);
    setDoctorId(appt.doctor_id || '');
    setStatus(appt.status);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/appointments/${editingAppt.id}`, {
        appointment_date: date,
        appointment_time: time,
        doctor_id: doctorId || null,
        status: status
      });
      alert('Appointment rescheduled successfully!');
      setView('list');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment parameters');
    } finally {
      setSaving(false);
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

  if (loading && view === 'list') {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading system appointments registry...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">

      {/* VIEW 1: LISTING */}
      {view === 'list' && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-black">System Appointments</h2>
            <p className="text-xs text-slate-400">View bookings queue, assign doctors, and reschedule times</p>
          </div>

          {appointments.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
              No appointments scheduled in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => (
                <div key={appt.id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold font-mono">ID: #{appt.id}</span>
                        <span className="text-[9px] text-teal-400 uppercase tracking-widest font-extrabold mt-0.5">{appt.appointment_type} visit</span>
                      </div>
                      <span className={`px-2.5 py-0.5 border text-[10px] rounded-full uppercase tracking-wider font-bold ${getStatusStyle(appt.status)}`}>
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

                    {/* Patient Context */}
                    <div className="bg-navy-950/45 p-3 rounded-lg border border-slate-900 flex flex-col gap-0.5 text-[10px] text-slate-400">
                      <span className="font-bold text-black text-xs flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-black" /> {appt.patient_name || appt.guest_name || 'Guest User'}
                      </span>
                      <span>Email: {appt.patient_email || appt.guest_email || 'N/A'}</span>
                      <span>Phone: {appt.patient_phone || appt.guest_phone || 'N/A'}</span>
                    </div>

                    {appt.appointment_type === 'clinic' ? (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <User className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Doctor:  {appt.doctor_name || 'Unassigned specialist'}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-1.5 text-[11px] text-black leading-tight">
                          <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                          <span>Location: {appt.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Doctor:  {appt.doctor_name || 'Unassigned specialist'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-slate-900 pt-3 mt-1">
                    <button
                      onClick={() => handleEditClick(appt)}
                      className="flex-1 bg-navy-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-black font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit / Assign
                    </button>
                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="border border-red-900/40 hover:bg-red-950/30 text-red-400 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EDIT / RESCHEDULE FORM */}
      {view === 'edit' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className="p-1.5 bg-navy-900 hover:bg-navy-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">Modify Appointment</h2>
              <p className="text-xs text-slate-400">Reschedule calendar configurations and assign clinical specialists</p>
            </div>
          </div>

          <form onSubmit={handleEditSubmit} className="glass rounded-2xl p-8 border border-slate-800 flex flex-col gap-5 text-xs font-semibold">

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Reschedule Date</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400">Reschedule Time (e.g. 10:15)</label>
                <input
                  required
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400">
                {editingAppt.appointment_type === 'clinic' ? 'Assign Clinic Doctor' : 'Assign Home Visiting Doctor / Optometrist'}
              </label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="w-full bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Choose specialist --</option>
                {doctors.map(doc => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>Dr. {doc.name} ({doc.specialization})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400">Appointment Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
              >
                {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-900 pt-6 mt-1">
              <button
                type="button"
                onClick={() => setView('list')}
                className="py-2.5 px-5 border border-slate-700 hover:bg-navy-900 text-slate-350 hover:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/15"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : null}
                Save Rescheduling Details
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default AdminAppointments;
