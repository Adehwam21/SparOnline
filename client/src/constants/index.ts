import { Client } from 'colyseus.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
export const COLYSEUS_WS_URL = import.meta.env.VITE_COLYSEUS_WS_URL;

export const colyseusSDK = new Client(COLYSEUS_WS_URL); // Replace with your server URL