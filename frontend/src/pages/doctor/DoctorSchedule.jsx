import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Plus, Trash2, Loader, CheckCircle2, Edit } from 'lucide-react';
import API from '../../services/api';

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      day_of_week: 'Monday',
      start_time: '10:00',
      end_time: '17:00',
      slot_duration: 15
    }
  });

  const fetchSchedules = async () => {
    try {
      const res = await API.get('/doctors/me/schedules');
      setSchedules(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    setSuccessMsg('');
    try {
      if (editingSchedule) {
        await API.put(`/doctors/schedules/${editingSchedule.id}`, data);
        setSuccessMsg('Schedule updated successfully!');
        setEditingSchedule(null);
      } else {
        await API.post('/doctors/schedules', data);
        setSuccessMsg('Schedule saved successfully!');
      }
      reset({
        day_of_week: 'Monday',
        start_time: '10:00',
        end_time: '17:00',
        slot_duration: 15
      });
      fetchSchedules();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save schedule template');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sch) => {
    setEditingSchedule(sch);
    reset({
      day_of_week: sch.day_of_week,
      start_time: sch.start_time,
      end_time: sch.end_time,
      slot_duration: sch.slot_duration
    });
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    reset({
      day_of_week: 'Monday',
      start_time: '10:00',
      end_time: '17:00',
      slot_duration: 15
    });
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule template? All future clinic slots generated under this day template will not be generated.')) return;
    setDeletingId(id);
    try {
      await API.delete(`/doctors/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete schedule');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading weekly schedule logs...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-start">
      {/* Existing list */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Active Schedule Templates</h2>
          <p className="text-xs text-slate-400">Your general weekly availability configuration</p>
        </div>

        {schedules.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
            No schedule templates active. Patients will not be able to book clinic appointments.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className={`glass rounded-xl p-4 border transition-all duration-200 flex items-center justify-between ${
                  editingSchedule?.id === sch.id
                    ? 'border-teal-500 bg-teal-950/15'
                    : 'border-slate-850'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-teal-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{sch.day_of_week}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {sch.start_time} - {sch.end_time} • {sch.slot_duration} min intervals
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(sch)}
                    className={`p-2 rounded-lg transition-all ${
                      editingSchedule?.id === sch.id
                        ? 'text-teal-400 bg-teal-950/45 hover:bg-teal-950/60'
                        : 'text-slate-500 hover:text-teal-400 hover:bg-slate-800/30'
                    }`}
                    title="Edit Schedule"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    disabled={deletingId === sch.id || editingSchedule?.id === sch.id}
                    onClick={() => handleDelete(sch.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/30 rounded-lg transition-all disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent"
                    title="Remove Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form */}
      <div className="lg:col-span-1 glass rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
          {editingSchedule ? 'Edit Availability' : 'Configure Availability'}
        </h3>

        {successMsg && (
          <div className="bg-teal-950/30 border border-teal-900/40 text-teal-400 text-[10px] px-3 py-2 rounded-lg flex items-center gap-1.5 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-xs font-medium">

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Day of Week</label>
            <select
              className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
              {...register('day_of_week', { required: true })}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d} className="text-black">{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400">Start Time</label>
              <input
                type="text"
                placeholder="10:00"
                className={`bg-navy-950 text-slate-100 rounded-lg p-2.5 border text-xs focus:outline-none focus:border-teal-500 ${errors.start_time ? 'border-red-500/50' : 'border-slate-850'}`}
                {...register('start_time', {
                  required: 'Required',
                  pattern: { value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Use HH:MM' }
                })}
              />
              {errors.start_time && <span className="text-red-400 text-[9px]">{errors.start_time.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400">End Time</label>
              <input
                type="text"
                placeholder="17:00"
                className={`bg-navy-950 text-slate-100 rounded-lg p-2.5 border text-xs focus:outline-none focus:border-teal-500 ${errors.end_time ? 'border-red-500/50' : 'border-slate-850'}`}
                {...register('end_time', {
                  required: 'Required',
                  pattern: { value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, message: 'Use HH:MM' }
                })}
              />
              {errors.end_time && <span className="text-red-400 text-[9px]">{errors.end_time.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Slot Duration (Minutes)</label>
            <select
              className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
              {...register('slot_duration', { valueAsNumber: true })}
            >
              {[15, 30, 45, 60].map(val => (
                <option key={val} value={val} className="text-black">{val} minutes</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/10"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : editingSchedule ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
            </button>

            {editingSchedule && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorSchedule;
