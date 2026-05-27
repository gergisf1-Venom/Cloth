/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string; // unique system-generated ID (e.g., "PRD-XXXX")
  name: string;
  category: string;
  sizes: string[]; // e.g., ["S", "M", "L", "XL"]
  colors: string[]; // e.g., ["Black", "White", "Navy"]
  costPrice: number;
  sellingPrice: number;
  createdAt: string;
}

export interface Reseller {
  id: string; // unique system-generated ID
  name: string;
  phone: string;
  socialMedia?: string; // e.g., Instagram handles or TikTok URL
  createdAt: string;
}

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'PAYMENT';

export interface BaseTransaction {
  id: string;
  type: TransactionType;
  date: string;
  notes: string;
}

export interface StockTransaction extends BaseTransaction {
  type: 'STOCK_IN' | 'STOCK_OUT';
  productId: string;
  size: string;
  color: string;
  quantity: number;
  resellerId?: string; // Present only for STOCK_OUT
}

export interface PaymentTransaction extends BaseTransaction {
  type: 'PAYMENT';
  resellerId: string;
  amount: number;
}

export type Transaction = StockTransaction | PaymentTransaction;

export interface LowStockAlert {
  product: Product;
  size: string;
  color: string;
  stock: number;
}
