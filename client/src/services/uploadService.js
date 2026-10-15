import api from './api';

export const uploadFiles = async (sessionId, files, onUploadProgress) => {
  const formData = new FormData();
  formData.append('sessionId', sessionId);

  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const res = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-session-id': sessionId
    },
    onUploadProgress
  });

  return res.data.documents;
};

export const getSessionDocuments = async (sessionId) => {
  const res = await api.get(`/uploads/session/${sessionId}`);
  return res.data.documents;
};

export const removeDocument = async (docId, sessionId) => {
  const res = await api.delete(`/uploads/${docId}`, {
    headers: {
      'x-session-id': sessionId
    }
  });
  return res;
};
