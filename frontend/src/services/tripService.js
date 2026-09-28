import api from './api';export const createTrip=d=>api.post('/trips',d);export const shareTrip=id=>api.post(`/trips/${id}/share`);
