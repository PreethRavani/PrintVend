import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans">
      <header className="w-full max-w-4xl bg-blue-600 text-white rounded-t-lg p-6 text-center shadow-md">
        <h1 className="text-3xl font-bold">Print Kiosk System Ultra</h1>
        <p className="text-sm mt-2">Fast, Secure, and Easy Printing</p>
      </header>

      <section className="w-full max-w-4xl bg-white shadow-md rounded-b-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition">
            <svg
              className="w-12 h-12 mb-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-semibold">Tap to Upload Document</p>
            <p className="text-sm mt-2">PDF, DOCX, or Images supported</p>
          </div>

          {/* Options Section */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Print Settings</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Color Mode</label>
              <select className="border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-700">
                <option>Black & White (₹2/page)</option>
                <option>Color (₹10/page)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-600 font-medium">Copies</label>
              <input 
                type="number" 
                defaultValue={1} 
                min={1} 
                className="border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-700"
              />
            </div>

            <button className="mt-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform active:scale-95 text-lg">
              Pay & Print
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} PrintVend Solutions. All rights reserved.
      </footer>
    </main>
  );
}
