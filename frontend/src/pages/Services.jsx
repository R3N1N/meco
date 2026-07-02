import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Sparkles, FileSpreadsheet, ShieldAlert, HeartPulse } from 'lucide-react';

const Services = () => {
  const serviceList = [
    {
      icon: Eye,
      title: 'Comprehensive Eye Examination',
      description: 'Traditional in-office tests covering refraction, glaucoma, and ocular health diagnostics. Booked in 15-minute slots directly linked to doctor timetables.',
      price: 'Rs. 550.00'
    },
    {
      icon: MapPin,
      title: 'Home Service Vision Checkup',
      description: 'Request an visual examiner to visit you at home. Set dates, times, and drag a custom map pin to coordinate your exact service location.',
      price: 'Rs. 500.00'
    },
    {
      icon: Sparkles,
      title: 'Interactive Visual Acuity Test',
      description: 'Free, standalone visual acuity screening using our calibrated Snellen chart module. Access fullscreen checkups for both eyes and get logs instantly.',
      price: 'Free'
    },
    {
      icon: FileSpreadsheet,
      title: 'Digital Prescription Porting',
      description: 'Check clinical notes, diagnostics summaries, and medicine list instructions directly from your portal. Download encrypted PDF documents securely.',
      price: 'Included'
    }
  ];

  return (
    <div className="flex flex-col gap-12 py-12 max-w-5xl mx-auto px-4">
      {/* Intro */}
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-black font-sans">Our Eye Care Services</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          From digital acuity self-checks to certified clinic examinations, select the care delivery that suits your needs.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {serviceList.map((service, idx) => (
          <div key={idx} className="glass rounded-2xl p-6 border border-slate-800 flex flex-col justify-between gap-4 group hover:border-teal-500/20 transition-all">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center">
                <service.icon className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-md font-bold text-white group-hover:text-teal-400 transition-colors">{service.title}</h3>
              <p className="text-xs text-white leading-relaxed text-left">{service.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs text-black">Service Fee: <strong className="text-teal-400">{service.price}</strong></span>
              <Link
                to="/book"
                className="text-xs font-bold bg-teal-950/50 border border-teal-800/50 hover:bg-teal-900/50 text-teal-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
