import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, ChevronLeft, Loader, CheckCircle2, Edit } from 'lucide-react';
import API from '../../services/api';

const DoctorPrescriptions = ({ activeAppointment, onClearActiveAppointment }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, create

  // Form state
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Refraction state
  const [sphOd, setSphOd] = useState('0.00');
  const [cylOd, setCylOd] = useState('0.00');
  const [sphOs, setSphOs] = useState('0.00');
  const [cylOs, setCylOs] = useState('0.00');
  const [pd, setPd] = useState('62');
  const [addPower, setAddPower] = useState('0.00');
  const [addOd, setAddOd] = useState('0.00');
  const [addOs, setAddOs] = useState('0.00');
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);

  // Visual acuity states (unaided and aided in meters)
  const [vaUnaidedOd, setVaUnaidedOd] = useState('6/6');
  const [vaAidedOd, setVaAidedOd] = useState('6/6');
  const [vaUnaidedOs, setVaUnaidedOs] = useState('6/6');
  const [vaAidedOs, setVaAidedOs] = useState('6/6');

  // Axis refs since they are integers
  const [axOd, setAxOd] = useState(0);
  const [axOs, setAxOs] = useState(0);

  // Dynamic medicine array
  const [medicines, setMedicines] = useState([]);

  const [saving, setSaving] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      const res = await API.get('/prescriptions');
      setPrescriptions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get('/admin/users'); // Admins and Doctors can fetch users
      setPatients(res.data.filter(u => u.role === 'patient'));
    } catch (e) {
      console.error(e);
      // Fallback: if user fetch fails due to role permissions (e.g. if endpoint is strictly admin), we can allow search/text inputs or fallback patient queries
      const [apptRes] = await Promise.all([API.get('/appointments')]);
      const uniquePatients = [];
      const seen = new Set();
      apptRes.data.forEach(appt => {
        if (appt.patient_id && !seen.has(appt.patient_id)) {
          seen.add(appt.patient_id);
          uniquePatients.push({ id: appt.patient_id, name: appt.patient_name || 'Patient' });
        }
      });
      setPatients(uniquePatients);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchPrescriptions(), fetchPatients()]);
      setLoading(false);
    };
    initData();
  }, []);

  // Handle auto-selected appointment transition
  useEffect(() => {
    if (activeAppointment) {
      setView('create');
      setPatientId(activeAppointment.patient_id || '');
      setPatientName(activeAppointment.patient_name || activeAppointment.guest_name || 'Guest Patient');
    }
  }, [activeAppointment]);

  const addMedRow = () => {
    setMedicines([...medicines, { medicine_name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedRow = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedChange = (idx, field, value) => {
    const updated = medicines.map((med, i) => {
      if (i === idx) {
        return { ...med, [field]: value };
      }
      return med;
    });
    setMedicines(updated);
  };

  const handleBack = () => {
    setView('list');
    if (onClearActiveAppointment) {
      onClearActiveAppointment();
    }
    // Reset Form
    setPatientId('');
    setPatientName('');
    setDiagnosis('');
    setNotes('');
    setSphOd('0.00');
    setCylOd('0.00');
    setAxOd(0);
    setSphOs('0.00');
    setCylOs('0.00');
    setAxOs(0);
    setPd('62');
    setAddPower('0.00');
    setAddOd('0.00');
    setAddOs('0.00');
    setVaUnaidedOd('6/6');
    setVaAidedOd('6/6');
    setVaUnaidedOs('6/6');
    setVaAidedOs('6/6');
    setMedicines([]);
    setEditingPrescriptionId(null);
  };

  const handleEdit = async (pr) => {
    setLoading(true);
    try {
      const res = await API.get(`/prescriptions/${pr.id}`);
      const details = res.data;

      setEditingPrescriptionId(pr.id);
      setPatientId(details.patient_id || '');
      setPatientName(details.patient_name || 'Patient');
      setDiagnosis(details.diagnosis || '');
      setNotes(details.notes || '');

      setSphOd(details.sph_od !== null ? String(details.sph_od) : '0.00');
      setCylOd(details.cyl_od !== null ? String(details.cyl_od) : '0.00');
      setAxOd(details.axis_od || 0);

      setSphOs(details.sph_os !== null ? String(details.sph_os) : '0.00');
      setCylOs(details.cyl_os !== null ? String(details.cyl_os) : '0.00');
      setAxOs(details.axis_os || 0);

      setPd(details.pd !== null ? String(details.pd) : '62');
      setAddPower(details.add_power !== null ? String(details.add_power) : '0.00');
      setAddOd(details.add_od !== null ? String(details.add_od) : '0.00');
      setAddOs(details.add_os !== null ? String(details.add_os) : '0.00');

      setVaUnaidedOd(details.va_unaided_od || '6/6');
      setVaAidedOd(details.va_aided_od || '6/6');
      setVaUnaidedOs(details.va_unaided_os || '6/6');
      setVaAidedOs(details.va_aided_os || '6/6');

      setMedicines(details.medicines || []);

      setView('create');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch prescription details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId && !activeAppointment?.id && !editingPrescriptionId) {
      alert('Please select a valid patient.');
      return;
    }
    if (!diagnosis) {
      alert('Diagnosis is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        appointment_id: activeAppointment?.id || null,
        patient_id: patientId || activeAppointment?.patient_id || null,
        diagnosis,
        notes,
        sph_od: parseFloat(sphOd),
        cyl_od: parseFloat(cylOd),
        axis_od: parseInt(axOd),
        sph_os: parseFloat(sphOs),
        cyl_os: parseFloat(cylOs),
        axis_os: parseInt(axOs),
        va_unaided_od: vaUnaidedOd,
        va_aided_od: vaAidedOd,
        va_unaided_os: vaUnaidedOs,
        va_aided_os: vaAidedOs,
        pd: parseFloat(pd),
        add_power: parseFloat(addOd) || parseFloat(addPower) || null,
        add_od: parseFloat(addOd),
        add_os: parseFloat(addOs),
        // Filter out empty medicines
        medicines: medicines.filter(m => m.medicine_name.trim() !== '')
      };

      if (editingPrescriptionId) {
        await API.put(`/prescriptions/${editingPrescriptionId}`, payload);
        alert('Prescription updated successfully!');
      } else {
        await API.post('/prescriptions', payload);
        alert('Prescription created successfully! Linked appointment has been set to completed.');
      }
      handleBack();
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading prescriptions module...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">

      {/* VIEW 1: LISTING */}
      {view === 'list' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">Prescriptions Written</h2>
              <p className="text-xs text-slate-400">Registry of patient diagnostic summaries written by you</p>
            </div>
            <button
              onClick={() => setView('create')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Prescription
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
              No prescriptions recorded yet. Click create or complete appointments to write one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((pr) => (
                <div key={pr.id} className="glass rounded-xl p-5 border border-slate-850 flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Patient</span>
                      <span className="text-xs font-bold text-white mt-0.5">{pr.patient_name}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold font-mono">ID: #{pr.id}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] text-black leading-normal leading-tight">
                    <span><strong>Diagnosis:</strong> {pr.diagnosis}</span>
                    {pr.notes && <span><strong>Notes:</strong> {pr.notes}</span>}
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900/65">
                    <span className="flex items-center gap-1 text-[9px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Issued on {new Date(pr.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleEdit(pr)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-navy-950 border border-slate-800 hover:bg-slate-900 rounded-lg text-[10px] text-teal-400 font-bold transition-all"
                    >
                      <Edit className="w-3 h-3 text-teal-400" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CREATION FORM */}
      {view === 'create' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-1.5 bg-navy-900 hover:bg-navy-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-black">{editingPrescriptionId ? 'Edit Diagnostics Form' : 'Create Diagnostics Form'}</h2>
              <p className="text-xs text-slate-400">Write visual refraction scores and select medicine drop details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-slate-800 flex flex-col gap-6">

            {/* Patient selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-black">Diagnosing Patient</label>
              {(activeAppointment || editingPrescriptionId) ? (
                <input
                  type="text"
                  disabled
                  value={patientName}
                  className="w-full bg-navy-950/60 text-slate-400 rounded-lg p-2.5 border border-slate-900 text-xs cursor-not-allowed font-bold"
                />
              ) : (
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Refraction tables (OD / OS) */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Ocular Refraction Parameters</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Right Eye (OD) */}
                <div className="bg-navy-950 border border-slate-900 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-1.5">Right Eye (OD)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>SPH</span>
                      <input type="text" value={sphOd} onChange={e => setSphOd(e.target.value)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>CYL</span>
                      <input type="text" value={cylOd} onChange={e => setCylOd(e.target.value)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>AXIS (Deg)</span>
                      <input type="number" value={axOd} onChange={e => setAxOd(parseInt(e.target.value) || 0)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2.5">
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>Unaided VA (m)</span>
                      <select value={vaUnaidedOd} onChange={e => setVaUnaidedOd(e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 py-1 px-1.5 text-xs focus:outline-none focus:border-teal-500">
                        {['6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '1/60', 'PL', 'NPL'].map(v => (
                          <option key={v} value={v} className="text-black">{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>Aided VA (m)</span>
                      <select value={vaAidedOd} onChange={e => setVaAidedOd(e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 py-1 px-1.5 text-xs focus:outline-none focus:border-teal-500">
                        {['6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '1/60', 'PL', 'NPL'].map(v => (
                          <option key={v} value={v} className="text-black">{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Left Eye (OS) */}
                <div className="bg-navy-950 border border-slate-900 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-1.5">Left Eye (OS)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>SPH</span>
                      <input type="text" value={sphOs} onChange={e => setSphOs(e.target.value)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-slate-550 font-semibold">
                      <span>CYL</span>
                      <input type="text" value={cylOs} onChange={e => setCylOs(e.target.value)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-slate-550 font-semibold">
                      <span>AXIS (Deg)</span>
                      <input type="number" value={axOs} onChange={e => setAxOs(parseInt(e.target.value) || 0)} className="bg-navy-900 text-slate-100 text-center rounded border border-slate-800 py-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2.5">
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>Unaided VA (m)</span>
                      <select value={vaUnaidedOs} onChange={e => setVaUnaidedOs(e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 py-1 px-1.5 text-xs focus:outline-none focus:border-teal-500">
                        {['6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '1/60', 'PL', 'NPL'].map(v => (
                          <option key={v} value={v} className="text-black">{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-white font-semibold">
                      <span>Aided VA (m)</span>
                      <select value={vaAidedOs} onChange={e => setVaAidedOs(e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 py-1 px-1.5 text-xs focus:outline-none focus:border-teal-500">
                        {['6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', '3/60', '1/60', 'PL', 'NPL'].map(v => (
                          <option key={v} value={v} className="text-black">{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra pd add power */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="flex flex-col gap-1 text-[10px] text-black font-semibold text-left">
                  <span>Pupillary Distance (PD mm)</span>
                  <input type="text" value={pd} onChange={e => setPd(e.target.value)} className="bg-navy-950 text-slate-100 rounded border border-slate-850 p-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-black font-semibold text-left">
                  <span>ADD Power OD (Right Eye)</span>
                  <input type="text" value={addOd} onChange={e => setAddOd(e.target.value)} className="bg-navy-950 text-slate-100 rounded border border-slate-850 p-2 text-xs" />
                </div>
                <div className="flex flex-col gap-1 text-[10px] text-black font-semibold text-left">
                  <span>ADD Power OS (Left Eye)</span>
                  <input type="text" value={addOs} onChange={e => setAddOs(e.target.value)} className="bg-navy-950 text-slate-100 rounded border border-slate-850 p-2 text-xs" />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-black">Diagnosis Summary</label>
              <textarea
                required
                rows={2}
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Presbyopia, Myopic Astigmatism, Dry Eye Syndrome, etc..."
                className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 focus:outline-none focus:border-teal-500 text-xs resize-none"
              ></textarea>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-black">Clinical Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Recommend computer eyewear, 20-20-20 visual rules, follow up in 6 months..."
                className="bg-navy-950 text-slate-100 rounded-lg p-2.5 border border-slate-850 focus:outline-none focus:border-teal-500 text-xs resize-none"
              ></textarea>
            </div>

            {/* Dynamic Medicines */}
            <div className="flex flex-col gap-3 text-left border-t border-slate-900 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Prescribed Medicines</span>
                <button
                  type="button"
                  onClick={addMedRow}
                  className="bg-navy-950 border border-slate-800 hover:bg-navy-900 text-slate-300 font-bold py-1 px-3 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              {medicines.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-xl py-6 text-center text-xs text-slate-500 bg-navy-950/20">
                  No medicines prescribed. Click 'Add Medicine' if drops or lenses are required.
                </div>
              ) : (
                medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-navy-950/45 p-3 rounded-lg border border-slate-900">
                    <div className="sm:col-span-4 flex flex-col gap-1 text-[9px] text-white uppercase">
                      <span>Name</span>
                      <input required type="text" placeholder="e.g. Systane Drops" value={med.medicine_name} onChange={e => handleMedChange(idx, 'medicine_name', e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 p-1.5 text-xs" />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1 text-[9px] text-white uppercase">
                      <span>Dosage</span>
                      <input type="text" placeholder="1 drop" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 p-1.5 text-xs" />
                    </div>
                    <div className="sm:col-span-3 flex flex-col gap-1 text-[9px] text-white uppercase">
                      <span>Frequency</span>
                      <input type="text" placeholder="Twice daily" value={med.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 p-1.5 text-xs" />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1 text-[9px] text-white uppercase">
                      <span>Duration</span>
                      <input type="text" placeholder="10 days" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} className="bg-navy-900 text-slate-100 rounded border border-slate-800 p-1.5 text-xs" />
                    </div>
                    <div className="sm:col-span-1 flex justify-center pt-4">
                      <button
                        type="button"
                        onClick={() => removeMedRow(idx)}
                        className="p-1.5 text-black hover:text-red-400 rounded hover:bg-slate-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-900 mt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-4 border border-slate-700 hover:bg-navy-900 text-slate-350 hover:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-650 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/15"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {editingPrescriptionId ? 'Update Diagnostics Report' : 'Save Diagnostics Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
