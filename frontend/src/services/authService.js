import api from './api';export const login=d=>api.post('/auth/login',d);export const register=d=>api.post('/auth/register',d);
