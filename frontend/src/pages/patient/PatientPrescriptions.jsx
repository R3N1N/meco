import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Award, ChevronDown, ChevronUp } from 'lucide-react';
import API from '../../services/api';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await API.get('/prescriptions');
        setPrescriptions(res.data);
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedId(id);
    setLoadingDetails(true);
    try {
      const res = await API.get(`/prescriptions/${id}`);
      setExpandedDetails(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to load prescription items');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    setDownloadingId(id);
    try {
      const res = await API.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF. Make sure server is active.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-500 py-6 text-center">Loading prescriptions list...</div>;
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-black">Prescriptions Registry</h2>
        <p className="text-xs text-slate-400">View diagnostic results and download pharmacy bills</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center text-xs text-slate-500">
          No prescriptions written yet. Your ophthalmologist will upload details after checks.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {prescriptions.map((pr) => {
            const isExpanded = expandedId === pr.id;
            return (
              <div key={pr.id} className="glass rounded-xl border border-slate-850 overflow-hidden transition-all">
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(pr.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white">Diagnosis: {pr.diagnosis}</span>
                      <span className="text-[10px] text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-black" /> Issued on {new Date(pr.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white hidden sm:inline">{pr.doctor_name}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-850 bg-navy-950/30 flex flex-col gap-6">
                    {loadingDetails ? (
                      <div className="text-[11px] text-slate-500 py-3 text-center">Loading refraction charts...</div>
                    ) : expandedDetails ? (
                      <>
                        {/* Refraction grid */}
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-4 h-4" /> Refraction Metrics (Rx)
                          </h4>
                          <div className="overflow-x-auto bg-navy-950/80 rounded-xl border border-slate-900 p-4 mt-1">
                            <table className="w-full text-xs text-left text-slate-300">
                              <thead>
                                <tr className="text-white border-b border-slate-900">
                                  <th className="pb-2">Eye</th>
                                  <th className="pb-2">SPH</th>
                                  <th className="pb-2">CYL</th>
                                  <th className="pb-2">AXIS</th>
                                  <th className="pb-2">Unaided VA</th>
                                  <th className="pb-2">Aided VA</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-slate-900/50">
                                  <td className="py-2 font-bold text-white">Right (OD)</td>
                                  <td className="py-2 font-mono">{expandedDetails.sph_od !== null ? expandedDetails.sph_od : '-'}</td>
                                  <td className="py-2 font-mono">{expandedDetails.cyl_od !== null ? expandedDetails.cyl_od : '-'}</td>
                                  <td className="py-2 font-mono">{expandedDetails.axis_od !== null ? expandedDetails.axis_od : '-'}</td>
                                  <td className="py-2 font-mono text-teal-400">{expandedDetails.va_unaided_od !== null ? expandedDetails.va_unaided_od : '-'}</td>
                                  <td className="py-2 font-mono text-teal-400">{expandedDetails.va_aided_od !== null ? expandedDetails.va_aided_od : '-'}</td>
                                </tr>
                                <tr>
                                  <td className="py-2 font-bold text-white">Left (OS)</td>
                                  <td className="py-2 font-mono">{expandedDetails.sph_os !== null ? expandedDetails.sph_os : '-'}</td>
                                  <td className="py-2 font-mono">{expandedDetails.cyl_os !== null ? expandedDetails.cyl_os : '-'}</td>
                                  <td className="py-2 font-mono">{expandedDetails.axis_os !== null ? expandedDetails.axis_os : '-'}</td>
                                  <td className="py-2 font-mono text-teal-400">{expandedDetails.va_unaided_os !== null ? expandedDetails.va_unaided_os : '-'}</td>
                                  <td className="py-2 font-mono text-teal-400">{expandedDetails.va_aided_os !== null ? expandedDetails.va_aided_os : '-'}</td>
                                </tr>
                              </tbody>
                            </table>
                            <div className="flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-white border-t border-slate-900/80 pt-3 mt-2">
                              <span>Pupillary Distance (PD): <strong>{expandedDetails.pd ? `${expandedDetails.pd} mm` : '-'}</strong></span>
                              <span>ADD OD (Right): <strong>{expandedDetails.add_od !== null && expandedDetails.add_od !== undefined ? `+${expandedDetails.add_od}` : '-'}</strong></span>
                              <span>ADD OS (Left): <strong>{expandedDetails.add_os !== null && expandedDetails.add_os !== undefined ? `+${expandedDetails.add_os}` : '-'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Prescribed Medicines */}
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Medicines Dosage List</h4>
                          {expandedDetails.medicines && expandedDetails.medicines.length > 0 ? (
                            <div className="overflow-x-auto bg-navy-950/80 rounded-xl border border-slate-900 p-4">
                              <table className="w-full text-xs text-left text-slate-350">
                                <thead>
                                  <tr className="text-white border-b border-slate-900">
                                    <th className="pb-2">Medicine</th>
                                    <th className="pb-2">Dosage</th>
                                    <th className="pb-2">Frequency</th>
                                    <th className="pb-2">Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedDetails.medicines.map((med, index) => (
                                    <tr key={index} className="border-b border-slate-900/40 last:border-b-0">
                                      <td className="py-2 font-bold text-white">{med.medicine_name}</td>
                                      <td className="py-2">{med.dosage}</td>
                                      <td className="py-2 text-[11px]">{med.frequency}</td>
                                      <td className="py-2 text-[11px]">{med.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No specific medical drops or lenses written.</span>
                          )}
                        </div>

                        {/* Extra Notes */}
                        {expandedDetails.notes && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Clinical Notes</span>
                            <p className="text-xs text-white leading-relaxed italic bg-navy-950/45 p-3 rounded-lg border border-slate-900">
                              "{expandedDetails.notes}"
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                          <button
                            onClick={() => handleDownloadPDF(pr.id)}
                            disabled={downloadingId === pr.id}
                            className="bg-teal-650 hover:bg-teal-650/80 disabled:bg-teal-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-4 h-4" /> {downloadingId === pr.id ? 'Generating...' : 'Download PDF Script'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Failed to render details.</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
