import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mb-4">
        <Printer className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-800">Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The terminal route you requested does not exist on this campus printing network.
      </p>
      <Link
        to="/"
        className="touch-btn mt-6 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Student Kiosk</span>
      </Link>
    </div>
  );
}
