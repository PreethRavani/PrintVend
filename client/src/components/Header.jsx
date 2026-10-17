import React from 'react';
import { Printer, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full py-3 sm:py-4 px-6 flex items-center justify-between relative bg-transparent z-10">
      {/* Balance spacer */}
      <div className="w-8"></div>

      {/* Centered CampusPrint Header Title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          CampusPrint
        </h1>
      </div>

      {/* Subtle Admin Link (discreet for staff/maintenance) */}
      <div className="w-8 flex justify-end">
        <Link
          to="/admin"
          title="Admin Portal"
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors opacity-30 hover:opacity-100"
        >
          <Shield className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}

