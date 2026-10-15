import api from './api';

export const getQuote = async (params) => {
  const res = await api.post('/pricing/quote', params);
  return res.data.quote;
};

export const createJob = async (payload) => {
  const res = await api.post('/jobs', payload);
  return res.data.job;
};

export const getJob = async (id) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data.job;
};

export const getJobStatus = async (id) => {
  const res = await api.get(`/jobs/${id}/status`);
  return res.data;
};

export const simulatePayment = async (payload) => {
  const res = await api.post('/jobs/simulate-payment', payload);
  return res.data;
};

export const confirmCollection = async (id, collectionCode) => {
  const res = await api.post(`/jobs/${id}/confirm-collection`, { collectionCode });
  return res.data;
};

export const cancelJob = async (id) => {
  const res = await api.post(`/jobs/${id}/cancel`);
  return res;
};

export const simulateStep = async (id) => {
  const res = await api.post(`/jobs/${id}/simulate-step`);
  return res;
};
