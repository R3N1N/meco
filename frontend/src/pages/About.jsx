import React from 'react';
import { Eye, Shield, Users, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col gap-12 py-12 max-w-4xl mx-auto px-4">
      {/* Introduction */}
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-black">About MECO Eyewear</h1>
        <p className="text-slate-400 text-sm md:text-md max-w-xl mx-auto">
          Combining professional optometry practices with modern geolocation technology to make visual healthcare convenient and accessible.
        </p>
      </div>

      {/* Core values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="glass rounded-2xl p-6 border border-slate-800 flex gap-4">
          <Shield className="w-8 h-8 text-teal-400 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-md font-bold text-white">Clinical Compliance</h3>
            <p className="text-xs text-white leading-relaxed">
              We operate strictly under digital clinical guidance, securing visual acuity records, prescriptions, and health summaries safely.
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800 flex gap-4">
          <Users className="w-8 h-8 text-teal-400 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-md font-bold text-white">Specialized Personnel</h3>
            <p className="text-xs text-white leading-relaxed">
              Our clinic links directly with board-certified optometrists and ophthalmologist, ensuring high-quality examinations.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default About;
