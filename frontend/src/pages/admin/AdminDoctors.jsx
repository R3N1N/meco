import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle, ArrowLeft, Loader, UserPlus } from 'lucide-react';
import API from '../../services/api';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, create, edit
  const [submitting, setSubmitting] = useState(false);

  // Form states (create/edit)
  const [editingDoc, setEditingDoc] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [fee, setFee] = useState(50);
  const [bio, setBio] = useState('');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleCreateView = () => {
    setView('create');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
    setSpecialization('');
    setExperience(0);
    setFee(50);
    setBio('');
  };

  const handleEditView = (doc) => {
    setEditingDoc(doc);
    setView('edit');
    setName(doc.name);
    setPhone(doc.phone || '');
    setAddress(doc.address || '');
    setSpecialization(doc.specialization);
    setExperience(doc.experience_years);
    setFee(doc.consultation_fee);
    setBio(doc.biography || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        address,
        specialization,
        experience_years: parseInt(experience) || 0,
        consultation_fee: parseFloat(fee) || 0.00,
        biography: bio
      };

      if (view === 'create') {
        payload.email = email;
        payload.password = password;
        await API.post('/admin/doctors', payload);
        alert('Doctor user and credentials profile added successfully!');
      } else {
        await API.put(`/admin/doctors/${editingDoc.doctor_id}`, payload);
        alert('Doctor credentials profile updated successfully!');
      }

      setView('list');
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit doctor configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor and clear all scheduled availability templates?')) return;
    try {
      await API.delete(`/admin/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate doctor');
    }
  };

  if (loading && view === 'list') {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading clinical directory...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">

      {/* VIEW 1: LISTING */}
      {view === 'list' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">Practitioners Management</h2>
              <p className="text-xs text-slate-400">View specialized doctors directory and edit entries</p>
            </div>
            <button
              onClick={handleCreateView}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Doctor
            </button>
          </div>

          {doctors.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
              No doctors enrolled in system directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc.doctor_id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{doc.name}</span>
                        <span className="text-[10px] text-teal-400 mt-0.5">{doc.specialization}</span>
                      </div>
                      <span className="text-[9px] text-slate-550 font-bold font-mono">DOC-ID: #{doc.doctor_id}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 leading-normal flex flex-col gap-1">
                      <span>Email: {doc.email}</span>
                      <span>Phone: {doc.phone || 'N/A'}</span>
                      <span>Consultation Fee: <strong className="text-teal-400">Rs.{doc.consultation_fee}</strong></span>
                      <span>Experience: {doc.experience_years} years</span>
                      {doc.biography && (
                        <p className="text-[10px] text-slate-500 italic mt-1.5 border-t border-slate-900/50 pt-1.5">
                          "{doc.biography.slice(0, 100)}..."
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-900 pt-3 mt-1">
                    <button
                      onClick={() => handleEditView(doc)}
                      className="flex-1 bg-navy-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <button
                      onClick={() => handleDelete(doc.doctor_id)}
                      className="border border-red-900/40 hover:bg-red-950/30 text-red-400 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                      title="Deactivate and Delete schedules"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2 & 3: CREATE / EDIT FORM */}
      {(view === 'create' || view === 'edit') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('list')}
              className="p-1.5 bg-navy-900 hover:bg-navy-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">{view === 'create' ? 'Enroll New Practitioner' : 'Edit Doctor Credentials'}</h2>
              <p className="text-xs text-slate-400">Update system records and consultation pricing</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-slate-800 flex flex-col gap-5 text-xs font-semibold">

            {/* Primary account settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Full Name</label>
                <input required type="text" placeholder="Dr. John Watson" value={name} onChange={e => setName(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>

              {view === 'create' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-450">Email Address (Username)</label>
                  <input required type="email" placeholder="john@eyecare.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
                </div>
              )}
            </div>

            {view === 'create' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Initial Password</label>
                <input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Phone Number</label>
                <input type="text" placeholder="555-0103" value={phone} onChange={e => setPhone(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Office Address</label>
                <input type="text" placeholder="Clinic Suite 4B, Medical Center" value={address} onChange={e => setAddress(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>
            </div>

            {/* Medical spec / pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-5 mt-1">
              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-slate-450">Specialization</label>
                <input required type="text" placeholder="Optometrist, Eye Surgeon, etc." value={specialization} onChange={e => setSpecialization(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Experience (Years)</label>
                <input type="number" min="0" value={experience} onChange={e => setExperience(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-450">Consultation Fee (Rs.)</label>
                <input type="number" min="0" step="0.5" value={fee} onChange={e => setFee(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-450">Practitioner Biography</label>
              <textarea rows={3} placeholder="Write experience summaries, certifications, and details..." value={bio} onChange={e => setBio(e.target.value)} className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 focus:outline-none focus:border-teal-500 text-xs resize-none" />
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
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/15"
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {view === 'create' ? 'Register Practitioner' : 'Update Credentials'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDoctors;
