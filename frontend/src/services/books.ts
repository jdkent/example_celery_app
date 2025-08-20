// frontend/src/services/books.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/books/';

export interface Book {
  id: number;
  title: string;
  author: string;
  published_year: number;
  // Add more fields as needed
}

export interface BookInput {
  title: string;
  author: string;
  published_year: number;
}

export const fetchBooks = async (): Promise<Book[]> => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const addBook = async (data: BookInput): Promise<Book> => {
  const res = await axios.post(API_BASE, data);
  return res.data;
};

export const removeBook = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}${id}/`);
};

export const checkoutBook = async (bookId: number, holderId: number): Promise<any> => {
  const res = await axios.post(`/api/books/${bookId}/checkout/`, { holder_id: holderId });
  return res.data;
};

export const returnBook = async (bookId: number): Promise<any> => {
  const res = await axios.post(`/api/books/${bookId}/return/`);
  return res.data;
};
