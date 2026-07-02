import React, { useState, useEffect } from 'react';
import { Award, FileText, Calendar, TrendingUp, Users } from 'lucide-react';
import API from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/admin/reports');
        setReports(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Compiling database analytics summaries...</div>;
  }

  if (!reports) {
    return <div className="text-xs text-slate-500 py-6 text-center">Failed to load reports.</div>;
  }

  // Calculate totals
  const totalByStatus = reports.statusStats.reduce((sum, item) => sum + item.count, 0);
  const totalByType = reports.typeStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-xl font-bold text-black">Clinical Analytics & Reports</h2>
        <p className="text-xs text-slate-400">Database compilation metrics and practitioner activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service distribution ratios */}
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-3">
            Service Distribution Ratio
          </h3>
          <div className="flex flex-col gap-4 py-2">
            {reports.typeStats.map((item, idx) => {
              const pct = totalByType > 0 ? (item.count / totalByType) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-black">{item.label} Examination</span>
                    <span className="text-black">{item.count} bookings ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden border border-slate-900 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.label === 'home' ? 'bg-teal-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {reports.typeStats.length === 0 && (
              <span className="text-xs text-slate-500 text-center py-4">No service data records.</span>
            )}
          </div>
        </div>

        {/* Appointment completion indexes */}
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-3">
            Exam Completion Ratios
          </h3>
          <div className="flex flex-col gap-4 py-2">
            {reports.statusStats.map((item, idx) => {
              const pct = totalByStatus > 0 ? (item.count / totalByStatus) * 100 : 0;
              const barColor = item.label === 'completed' ? 'bg-teal-500' : item.label === 'cancelled' ? 'bg-red-500' : item.label === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500';
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-black">{item.label}</span>
                    <span className="text-black">{item.count} items ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden border border-slate-900 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {reports.statusStats.length === 0 && (
              <span className="text-xs text-slate-500 text-center py-4">No records in queue.</span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline graph */}
      <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4.5 h-4.5 text-teal-400" /> Bookings Timeline (Last 7 Days)
        </h3>

        <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-4 bg-navy-950/45 border border-slate-900 rounded-xl mt-2 overflow-x-auto">
          {reports.timeline.map((day, idx) => {
            // Find max count to scale
            const maxVal = Math.max(...reports.timeline.map(d => d.count), 1);
            const heightPct = (day.count / maxVal) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[50px]">
                <span className="text-[9px] text-teal-400 font-bold font-mono">{day.count}</span>
                <div className="w-6 bg-teal-650/40 border border-teal-500/30 hover:bg-teal-650 transition-all rounded-t-sm" style={{ height: `${Math.max(heightPct * 0.8, 4)}px` }}></div>
                <span className="text-[8px] text-slate-500 font-semibold font-mono rotate-12 sm:rotate-0 mt-1">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctor activity table */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col gap-1">
        <div className="p-5 border-b border-slate-900 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-teal-400" />
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Specialist Activity Summary</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-350">
            <thead>
              <tr className="bg-navy-950/60 text-slate-500 border-b border-slate-900">
                <th className="p-4 font-semibold uppercase text-black">Practitioner</th>
                <th className="p-4 font-semibold uppercase text-black">Specialization</th>
                <th className="p-4 font-semibold uppercase text-center text-black">Assigned Exams</th>
                <th className="p-4 font-semibold uppercase text-center text-black">Completions</th>
                <th className="p-4 font-semibold uppercase text-right text-black">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {reports.doctorActivity.map((doc, idx) => {
                const completionRate = doc.total_appointments > 0 ? (doc.completed_appointments / doc.total_appointments) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-850/15">
                    <td className="p-4 font-bold text-white">{doc.doctor_name}</td>
                    <td className="p-4 text-black">{doc.specialization}</td>
                    <td className="p-4 text-black text-center font-bold font-mono">{doc.total_appointments}</td>
                    <td className="p-4 text-center font-bold font-mono text-teal-400">{doc.completed_appointments}</td>
                    <td className="p-4 text-right font-bold text-teal-400 font-mono">{completionRate.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {reports.doctorActivity.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No doctor activity records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
