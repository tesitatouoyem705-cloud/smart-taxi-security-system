import api from './api';export const reportIncident=d=>api.post('/incidents',d);export const myIncidents=()=>api.get('/incidents/mine');
