const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const buildFileUrl = (filePath) => {
  if (!filePath) return '';

  const value = String(filePath).trim();
  if (/^https?:\/\//i.test(value)) return value;

  const cleanPath = value.replace(/^\/+/, '');
  const path = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;

  return API_BASE_URL ? `${API_BASE_URL}/${path}` : `/${path}`;
};

export { API_BASE_URL, buildFileUrl };
