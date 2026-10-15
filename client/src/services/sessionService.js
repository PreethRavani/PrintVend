import api from './api';

export const createSession = async (kioskId, studentId = null) => {
  const res = await api.post('/sessions', { kioskId, studentId });
  return res.data;
};

export const getSession = async (sessionId) => {
  const res = await api.get(`/sessions/${sessionId}`);
  return res.data;
};

export const closeSession = async (sessionId) => {
  const res = await api.post(`/sessions/${sessionId}/close`);
  return res;
};
