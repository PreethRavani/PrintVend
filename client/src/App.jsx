import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KioskProvider } from './context/KioskContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import KioskPage from './pages/KioskPage';
import MobileUploadPage from './pages/MobileUploadPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AdminAuthProvider>
      <KioskProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<KioskPage />} />
            <Route path="/mobile-upload" element={<MobileUploadPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </KioskProvider>
    </AdminAuthProvider>
  );
}
