const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const buildFileUrl = (filePath) => {
  if (!filePath) return '';

  const path = String(filePath).replace(/^\//, '');
  return API_BASE_URL ? `${API_BASE_URL}/${path}` : `/${path}`;
};

export { API_BASE_URL, buildFileUrl };
