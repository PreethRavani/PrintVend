import api from './api';

export const getKiosks = async () => {
  const res = await api.get('/kiosks');
  return res.data.kiosks;
};

export const getKioskById = async (id) => {
  const res = await api.get(`/kiosks/${id}`);
  return res.data;
};
