// Holder service for API integration
import axios from "axios";

const API_BASE = 'http://localhost:5000/api/holders/';


export interface Holder {
  id: number;
  name: string;
}

export interface HolderInput {
  name: string;
}

export const fetchHolders = async (): Promise<Holder[]> => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const addHolder = async (data: HolderInput): Promise<Holder> => {
  const res = await axios.post(API_BASE, data);
  return res.data;
};

export const removeHolder = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}${id}/`);
};
