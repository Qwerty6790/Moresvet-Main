import { ReactNode } from 'react';

export interface ProductI {
  [x: string]: ReactNode;
  _id: string;
  article: string;
  name: string;
  source: string;
  stock: string;
  price: number;
  imageAddresses: string | string[]; // Может быть строкой или массивом строк
  quantity: number;
}

export interface OrderI {
  _id: string;
  products: { productId: string; quantity: number; status: string }[];
  totalAmount: number;
  status: string;
}

export interface Item {
  productId: string;
  quantity: number;
  status: string;
}
