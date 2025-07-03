import { ReactNode } from 'react';

export interface ProductI {
  [x: string]: ReactNode;
  _id: string;
  article: string;
  name: string;
  price: number;
  imageAddress: string | string[]; // Ссылка на изображение (строка или массив строк)
  stock: number; // Количество на складе
  source: string; // Источник данных
  visible?: boolean; // Видимость товара (для админки)
  quantity?: number; // Для корзины

  // Размеры
  height?: number; // Высота (мм)
  length?: number; // Длина (мм)
  width?: number;  // Ширина (мм)
  diameter?: number; // Диаметр (мм)
  
  // Характеристики светильника
  lightStyle?: string; // Стиль светильника (современный, классический, минимализм и т.д.)
  lampType?: string; // Вид лампы (LED, галогенная, накаливания и т.д.)
  color?: string; // Цвет
  socketType?: string; // Цоколь (E27, E14, GU10 и т.д.)
  lampsCount?: number; // Количество ламп
  lampPower?: number; // Мощность лампы (Вт)
  totalPower?: number; // Общая мощность (Вт)
  voltage?: number; // Напряжение (В)
  material?: string; // Материал (металл, пластик, стекло и т.д.)
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
