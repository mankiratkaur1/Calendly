import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3007/api',
});

// Event Types
export const getEventTypes = () => api.get('/event-types');
export const createEventType = (data) => api.post('/event-types', data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`);

// Availability
export const getAvailability = () => api.get('/availability');
export const updateAvailability = (data) => api.put('/availability', data);

// Slots
export const getSlots = (eventTypeId, date) => api.get('/slots', { params: { eventTypeId, date } });

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getBookings = (filter) => api.get('/bookings', { params: { filter } });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// meeting Polls
export const getPolls = () => api.get('/polls');
export const createPoll = (data) => api.post('/polls', data);
export const deletePoll = (id) => api.delete(`/polls/${id}`);

export default api;