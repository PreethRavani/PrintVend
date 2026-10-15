import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Printer,
  CreditCard,
  TrendingUp,
  Settings,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  Sliders,
  DollarSign,
  PieChart,
  UserCheck,
  XCircle,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  getOverview,
  getJobs,
  getAnalytics,
  getPricing,
  updatePricing,
  updateKiosk
} from '../services/adminService';
import { getKiosks } from '../services/kioskService';

export default function AdminPage() {
  const { isAuthenticated, adminUser, login, logout, loading: authLoading } = useAdminAuth();

  // Tabs: 'overview' | 'jobs' | 'kiosks' | 'pricing' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');

  // Login form state
  const [emailInput, setEmailInput] = useState('admin@campusprint.edu');
  const [passwordInput, setPasswordInput] = useState('Admin@12345');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [kiosksData, setKiosksData] = useState([]);
  const [pricingData, setPricingData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Filters & search
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kioskFilter, setKioskFilter] = useState('');

  // Notifications
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit Kiosk Modal
  const [editingKiosk, setEditingKiosk] = useState(null);

  // Fetch tab data
  const loadTabData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const data = await getOverview();
        setOverviewData(data);
      } else if (activeTab === 'jobs') {
        const data = await getJobs({
          search: jobSearch,
          status: statusFilter,
          kioskId: kioskFilter
        });
        setJobsData(data.jobs);
      } else if (activeTab === 'kiosks') {
        const kiosks = await getKiosks();
        setKiosksData(kiosks);
      } else if (activeTab === 'pricing') {
        const pricing = await getPricing();
        setPricingData(pricing);
      } else if (activeTab === 'analytics') {
        const analytics = await getAnalytics();
        setAnalyticsData(analytics);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setNotice({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab, jobSearch, statusFilter, kioskFilter]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await login(emailInput, passwordInput);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check administrative credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePricingSave = async (e) => {
    e.preventDefault();
    try {
      await updatePricing({
        rates: pricingData.rates,
        duplexDiscountPercentage: pricingData.duplexDiscountPercentage
      });
      setNotice({ type: 'success', text: 'Pricing rates updated successfully!' });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleKioskSave = async (e) => {
    e.preventDefault();
    if (!editingKiosk) return;
    try {
      await updateKiosk(editingKiosk.kioskId, editingKiosk);
      setEditingKiosk(null);
      setNotice({ type: 'success', text: `Kiosk ${editingKiosk.kioskId} updated successfully!` });
      loadTabData();
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  // If not logged in, show Login Screen
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-white space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mx-auto border border-brand-400/30">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black">Campus Print Administration</h1>
            <p className="text-xs text-slate-400">Restricted Access • System Operators Only</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 text-[11px] text-slate-400">
              <span>Seeded Prototype Credentials:</span><br />
              <code className="text-cyan-300">admin@campusprint.edu</code> / <code className="text-cyan-300">Admin@12345</code>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="touch-btn w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Kiosk</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-navy-900 text-white border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight">Smart Campus Print • Admin Hub</div>
            <div className="text-[11px] text-slate-400">Operator: {adminUser?.name || 'Administrator'}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Kiosk UI</span>
          </Link>

          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'jobs', label: 'Print Jobs', icon: Printer },
            { id: 'kiosks', label: 'Kiosk Terminals', icon: Layers },
            { id: 'pricing', label: 'Tariff & Pricing', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`touch-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={loadTabData}
            className="ml-auto p-2.5 bg-white hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 transition"
            title="Refresh active view"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {notice && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              notice.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {notice.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && overviewData && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Jobs</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {overviewData.stats.totalJobs}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">In Queue</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {overviewData.stats.queuedJobs}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {overviewData.stats.completedJobs}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Failed</span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {overviewData.stats.failedJobs}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Online Kiosks</span>
                <div className="text-2xl font-black text-brand-600 mt-1">
                  {overviewData.stats.activeKiosks} / {overviewData.stats.totalKiosks}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Simulated Revenue</span>
                <div className="text-2xl font-black text-teal-600 mt-1">
                  ₹{overviewData.stats.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Recent Jobs Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Recent Print Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                      <th className="py-3 px-2">Job Number</th>
                      <th className="py-3 px-2">Kiosk</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Settings</th>
                      <th className="py-3 px-2">Total Amount</th>
                      <th className="py-3 px-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {overviewData.recentJobs.map((j) => (
                      <tr key={j.jobNumber}>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900">{j.jobNumber}</td>
                        <td className="py-3 px-2">{j.kioskId}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              j.status === 'COLLECTED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : j.status === 'PRINTING'
                                ? 'bg-brand-50 text-brand-700'
                                : j.status === 'QUEUED'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {j.settings?.paperSize} • {j.settings?.printMode} • {j.quote?.totalSides} sides
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900">₹{j.quote?.totalAmount?.toFixed(2)}</td>
                        <td className="py-3 px-2 text-slate-400">
                          {new Date(j.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRINT JOBS */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Job Number..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
              >
                <option value="">All Statuses</option>
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                <option value="PAID">Paid</option>
                <option value="QUEUED">Queued</option>
                <option value="PRINTING">Printing</option>
                <option value="READY_FOR_COLLECTION">Ready for Collection</option>
                <option value="COLLECTED">Collected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={kioskFilter}
                onChange={(e) => setKioskFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
              >
                <option value="">All Kiosks</option>
                <option value="KIOSK-LIB-01">KIOSK-LIB-01 (Library)</option>
                <option value="KIOSK-ENG-02">KIOSK-ENG-02 (Engineering)</option>
                <option value="KIOSK-CAF-03">KIOSK-CAF-03 (Cafeteria)</option>
                <option value="KIOSK-MED-04">KIOSK-MED-04 (Medical)</option>
              </select>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-2">Job Number</th>
                    <th className="py-3 px-2">Kiosk</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Pages/Sheets</th>
                    <th className="py-3 px-2">Mode</th>
                    <th className="py-3 px-2">Duplex</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">PIN</th>
                    <th className="py-3 px-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {jobsData.map((job) => (
                    <tr key={job.jobNumber} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-2 font-mono font-bold text-slate-900">{job.jobNumber}</td>
                      <td className="py-3 px-2">{job.kioskId}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            job.status === 'COLLECTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : job.status === 'PRINTING'
                              ? 'bg-brand-50 text-brand-700'
                              : job.status === 'QUEUED'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {job.quote?.totalSides} sides ({job.quote?.totalSheets} sheets)
                      </td>
                      <td className="py-3 px-2">
                        {job.settings?.paperSize} • {job.settings?.printMode}
                      </td>
                      <td className="py-3 px-2">
                        {job.settings?.duplex ? (
                          <span className="text-emerald-600 font-bold">Yes (Eco)</span>
                        ) : (
                          'No'
                        )}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-900">₹{job.quote?.totalAmount?.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono font-bold text-brand-600">
                        {job.collectionCode || '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: KIOSKS */}
        {activeTab === 'kiosks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kiosksData.map((k) => (
              <div key={k.kioskId} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-600">{k.kioskId}</span>
                    <h3 className="text-base font-bold text-slate-900">{k.name}</h3>
                    <p className="text-xs text-slate-500">{k.location}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      k.status === 'ONLINE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : k.status === 'BUSY'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {k.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Paper Tray</span>
                    <span className="font-bold text-slate-800">{k.paperLevel}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Black Toner</span>
                    <span className="font-bold text-slate-800">{k.tonerBlack}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Color Toner</span>
                    <span className="font-bold text-slate-800">{k.tonerColor}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">
                    Active Queue: <strong>{k.queueLength} jobs</strong>
                  </span>
                  <button
                    onClick={() => setEditingKiosk(k)}
                    className="touch-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Manage Hardware
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PRICING CONFIGURATION */}
        {activeTab === 'pricing' && pricingData && (
          <form onSubmit={handlePricingSave} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campus Printing Tariff Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust base per-side rates. Changes apply to all future quotes created across campus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">A4 Standard Rates</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">Black & White (₹/side)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={pricingData.rates?.A4?.BW ?? 2}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          rates: {
                            ...pricingData.rates,
                            A4: { ...pricingData.rates.A4, BW: parseFloat(e.target.value) }
                          }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Color (₹/side)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={pricingData.rates?.A4?.COLOR ?? 10}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          rates: {
                            ...pricingData.rates,
                            A4: { ...pricingData.rates.A4, COLOR: parseFloat(e.target.value) }
                          }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">A3 Poster Rates</span>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">Black & White (₹/side)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={pricingData.rates?.A3?.BW ?? 5}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          rates: {
                            ...pricingData.rates,
                            A3: { ...pricingData.rates.A3, BW: parseFloat(e.target.value) }
                          }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Color (₹/side)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={pricingData.rates?.A3?.COLOR ?? 20}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          rates: {
                            ...pricingData.rates,
                            A3: { ...pricingData.rates.A3, COLOR: parseFloat(e.target.value) }
                          }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase block">
                Duplex Eco-Friendly Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={pricingData.duplexDiscountPercentage ?? 5}
                onChange={(e) =>
                  setPricingData({
                    ...pricingData,
                    duplexDiscountPercentage: parseFloat(e.target.value)
                  })
                }
                className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold"
              />
              <p className="text-[11px] text-slate-400">
                Discount applied to double-sided print jobs to incentivize paper savings.
              </p>
            </div>

            <button
              type="submit"
              className="touch-btn px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Pricing Changes</span>
            </button>
          </form>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Color vs Monochrome</span>
                <div className="flex justify-between items-baseline pt-2">
                  <div className="text-center flex-1">
                    <span className="text-2xl font-black text-slate-900">{analyticsData.modes?.BW || 0}</span>
                    <span className="text-xs text-slate-400 block">B&W Jobs</span>
                  </div>
                  <div className="text-center flex-1 border-l border-slate-100">
                    <span className="text-2xl font-black text-brand-600">{analyticsData.modes?.COLOR || 0}</span>
                    <span className="text-xs text-slate-400 block">Color Jobs</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Paper Size Distribution</span>
                <div className="flex justify-between items-baseline pt-2">
                  <div className="text-center flex-1">
                    <span className="text-2xl font-black text-slate-900">{analyticsData.paperSizes?.A4 || 0}</span>
                    <span className="text-xs text-slate-400 block">A4 Standard</span>
                  </div>
                  <div className="text-center flex-1 border-l border-slate-100">
                    <span className="text-2xl font-black text-teal-600">{analyticsData.paperSizes?.A3 || 0}</span>
                    <span className="text-xs text-slate-400 block">A3 Poster</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Duplex Eco Adoption</span>
                <div className="flex justify-between items-baseline pt-2">
                  <div className="text-center flex-1">
                    <span className="text-2xl font-black text-emerald-600">{analyticsData.duplexVsSimplex?.duplex || 0}</span>
                    <span className="text-xs text-slate-400 block">2-Sided</span>
                  </div>
                  <div className="text-center flex-1 border-l border-slate-100">
                    <span className="text-2xl font-black text-slate-700">{analyticsData.duplexVsSimplex?.simplex || 0}</span>
                    <span className="text-xs text-slate-400 block">1-Sided</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">System Reliability & Failure Rate</span>
              <div className="flex items-center space-x-3 pt-1">
                <span className="text-3xl font-black text-slate-900">
                  {analyticsData.failureRatePercentage || 0}%
                </span>
                <span className="text-xs text-slate-500">
                  Transaction and hardware fault rate across {analyticsData.totalProcessed || 0} recorded jobs.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Kiosk Modal */}
      {editingKiosk && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleKioskSave} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Manage Kiosk: {editingKiosk.kioskId}</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Operational Status</label>
              <select
                value={editingKiosk.status}
                onChange={(e) => setEditingKiosk({ ...editingKiosk, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="ONLINE">ONLINE</option>
                <option value="BUSY">BUSY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Paper Level %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingKiosk.paperLevel}
                  onChange={(e) =>
                    setEditingKiosk({ ...editingKiosk, paperLevel: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Black Toner %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingKiosk.tonerBlack}
                  onChange={(e) =>
                    setEditingKiosk({ ...editingKiosk, tonerBlack: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Color Toner %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingKiosk.tonerColor}
                  onChange={(e) =>
                    setEditingKiosk({ ...editingKiosk, tonerColor: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingKiosk(null)}
                className="touch-btn flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="touch-btn flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
