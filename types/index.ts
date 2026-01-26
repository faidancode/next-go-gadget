// types/index.ts

import { Review } from "./review";

/* ============================
   USERS
============================ */

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;

  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/* ============================
   ADDRESSES
============================ */

export type Address = {
  id: string;
  user_id: string;
  label: string;
  streetline: string;
  street?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  isPrimary: boolean;

  recipientName?: string | null;
  recipientPhone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/* ============================
   CATEGORIES
============================ */

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/* ============================
   AUTHORS
============================ */

export type Author = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/* ============================
   BOOKS
============================ */



/* ============================
   REVIEWS
============================ */



/* ============================
   CARTS
============================ */



/* ============================
   CART ITEMS
============================ */



/* ============================
   ORDERS
============================ */



/* ============================
   ORDER ITEMS
============================ */



/* ============================
   HERO CAROUSEL
============================ */

export type HeroCarousel = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};



export * from "./api";
