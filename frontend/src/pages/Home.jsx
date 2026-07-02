import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, MapPin, ClipboardList, Shield, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col gap-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950/45 via-navy-900 to-navy-950 border border-slate-800 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-teal-400 text-2xl font-bold rounded-full uppercase tracking-wider">
            Premium Clinical EyeCare
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Complete Eye Health, <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Brought to Your Door.</span>
          </h1>
          <p className="text-slate-350 text-sm md:text-md leading-relaxed max-w-lg">
            Schedule a traditional clinic visit with our certified Ophthalmologist or request a comprehensive home service examination at your preferred location from our certified Optometrist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
            <Link
              to="/book"
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/15"
            >
              <Calendar className="w-4.5 h-4.5" /> Book Appointment
            </Link>
            <Link
              to="/va-test"
              className="border border-slate-700 hover:bg-navy-800 text-slate-350 hover:text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4.5 h-4.5 text-teal-400" /> Start Free Eye Test
            </Link>
          </div>
        </div>

        {/* Hero Interactive UI Card Display */}
        <div className="w-full md:w-80 flex flex-col gap-3 relative">
          <div className="glass-dark rounded-2xl p-5 border border-white shadow-xl hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-black uppercase tracking-widest">Clinic Status</span>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Dr. Sarah Miller</h4>
            <p className="text-[10px] text-black mb-3">Optometrist • In-office today</p>
            <div className="flex justify-between border-t border-slate-800/80 pt-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-white uppercase">Fee</span>
                <span className="text-xs font-bold text-teal-400">Rs. 500.00</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-white uppercase">Available</span>
                <span className="text-xs font-bold text-white">10:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className="glass-light rounded-2xl p-5  shadow-xl hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Home Service</span>
            </div>
            <p className="text-[11px] text-white mb-3">
              Book a licensed optometrist for a professional eye examination at the comfort of your home.
            </p>
          </div>
        </div>
      </div>

      {/* THREE STEP VALUE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-md font-bold text-white">Dynamic Appointment Slots</h3>
          <p className="text-xs text-white leading-relaxed">
            In-clinic sessions align perfectly with real-time doctor timetables, preventing double-bookings.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center shadow-md">
            <Eye className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-md font-bold text-white">Standalone Vision Checks</h3>
          <p className="text-xs text-white leading-relaxed">
            Test visual acuity instantly via our responsive, fullscreen Snellen chart module. Save logs directly to your patient records.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 bg-teal-950/60 border border-teal-800/40 rounded-xl flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-teal-400" />
          </div>
          <h3 className="text-md font-bold text-white">Secure PDF Prescriptions</h3>
          <p className="text-xs text-white leading-relaxed">
            Doctors create eye charts, refraction data (OD/OS details), and medicine frequencies. Patients print or download PDFs securely.
          </p>
        </div>
      </div>

      {/* CLINICAL STATS BANNER */}
      <div className="bg-navy-900 border border-black rounded-2xl p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center place-items-center">

          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-teal-400 font-mono">
              2,500+
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Exams Scheduled
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-teal-400 font-mono">
              15 Mins
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Interval Slots
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-teal-400 font-mono">
              99.8%
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              User Approval
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
