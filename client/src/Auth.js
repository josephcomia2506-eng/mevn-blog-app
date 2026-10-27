import { ref } from 'vue';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export const user = ref(getStoredUser());

export function setAuth(token, userData) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
  user.value = userData;
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  user.value = null;
}