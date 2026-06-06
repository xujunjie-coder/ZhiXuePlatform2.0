import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Inject global fetch interceptor to handle Bearer Token, User ID, and Course ID propagation
const { fetch: originalFetch } = window;
window.fetch = async (input, init) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const currentCourseId = localStorage.getItem('currentCourseId');

  init = init || {};
  const headers = new Headers(init.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (userId) {
    headers.set('X-User-Id', userId);
  }
  if (currentCourseId) {
    headers.set('X-Course-Id', currentCourseId);
  }
  
  init.headers = headers;
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
