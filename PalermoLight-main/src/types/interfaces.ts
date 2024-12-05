import { ReactNode } from 'react';

export interface ProductI {
    [x: string]: ReactNode;
    _id: string;
    article: string;
    name: string;
    source: string;
    stock: string;
    price: number;
    imageAddress: string;
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
