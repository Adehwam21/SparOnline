import { Client } from 'colyseus.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL;

export const colyseusSDK = new Client(SERVER_BASE_URL);