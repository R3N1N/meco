import React, { useState, useEffect } from 'react';
import { Mail, Clock, User, MessageSquare } from 'lucide-react';
import API from '../../services/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const res = await API.get('/admin/contacts');
      setInquiries(res.data);
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading inquiries...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-black">Contact Inquiries</h2>
        <p className="text-xs text-slate-400">View user-submitted contact messages and questions</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
          No inquiries found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" /> {inq.name}
                  </span>
                  <span className="text-[10px] text-slate-450 mt-0.5">{inq.email}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(inq.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-teal-400">Subject: {inq.subject}</span>
                <p className="text-xs text-black leading-relaxed whitespace-pre-wrap mt-1 p-3 bg-navy-950/40 border border-slate-900 rounded-lg">
                  {inq.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
