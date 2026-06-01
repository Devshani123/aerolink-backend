import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// AUTH
export const registerUser = (data) =>
    axios.post(`${BASE_URL}/api/auth/register`, data);

export const loginUser = (data) =>
    axios.post(`${BASE_URL}/api/auth/login`, data);

// FLIGHTS
export const getAllFlights = () =>
    axios.get(`${BASE_URL}/api/flights`);

export const getFlightById = (id) =>
    axios.get(`${BASE_URL}/api/flights/${id}`);

// NEW: Update flight (Admin only)
export const updateFlight = (id, data) =>
    axios.put(`${BASE_URL}/api/flights/${id}/update`, data, authHeaders());

// BOOKINGS
export const createBooking = (data) =>
    axios.post(`${BASE_URL}/api/bookings`, data, authHeaders());

export const getAllBookings = () =>
    axios.get(`${BASE_URL}/api/bookings`, authHeaders());

// BAGGAGE
export const scanBaggage = (data) =>
    axios.post(`${BASE_URL}/api/baggage/scan`, data, authHeaders());

export const getBaggageByBooking = (bookingId) =>
    axios.get(`${BASE_URL}/api/baggage/${bookingId}`, authHeaders());

export const cancelBooking = (bookingId) =>
    axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, authHeaders());