import React from 'react';
import { Eye, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-navy-950/60 mt-auto py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-black-600" />
          <span className="font-bold text-teal tracking-tight">MECO Eyewear</span>
          <span className="text-[10px] text-slate-600">| © 2026. All rights reserved.</span>
        </div>


      </div>
    </footer>
  );
};

export default Footer;
