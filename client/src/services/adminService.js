import api from './api';

export const loginAdmin = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getAdminMe = async () => {
  const res = await api.get('/auth/me');
  return res.data.user;
};

export const getOverview = async () => {
  const res = await api.get('/admin/overview');
  return res.data;
};

export const getJobs = async (params) => {
  const res = await api.get('/admin/jobs', { params });
  return res.data;
};

export const getAnalytics = async () => {
  const res = await api.get('/admin/analytics');
  return res.data.analytics;
};

export const getPricing = async () => {
  const res = await api.get('/admin/pricing');
  return res.data.pricing;
};

export const updatePricing = async (payload) => {
  const res = await api.patch('/admin/pricing', payload);
  return res.data;
};

export const updateKiosk = async (id, payload) => {
  const res = await api.patch(`/kiosks/${id}`, payload);
  return res.data.kiosk;
};
