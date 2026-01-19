// types/index.ts

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

export type Book = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  authorId?: string | null;
  authorName?: string | null;
  isbn?: string | null;
  priceCents: number;
  discountPriceCents?: number | null;
  stock: number;
  coverUrl: string;
  description: string;
  pages?: number | null;
  language?: string | null;
  publisher?: string | null;
  publishedAt?: string | null;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;

  sold?: number;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type BookListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  isFlashSale?: boolean;
};

/* ============================
   REVIEWS
============================ */

export type Review = {
  id: string;
  userId: string;
  userName: string;
  productId: string; // refer ke Book.id
  rating: number;
  title?: string | null;
  body?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

/* ============================
   CARTS
============================ */

export type Cart = {
  id: string;
  userId: string;

  createdAt: string;
  updatedAt: string;
};

/* ============================
   CART ITEMS
============================ */

export type CartItem = {
  id: string;
  cartId: string;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  bookAuthor: string;
  bookCoverUrl: string;
  categoryId: string;
  quantity: number;
  priceCentsAtAdd: number;

  createdAt: string;
  updatedAt: string;
};

/* ============================
   ORDERS
============================ */

export type OrderAddressSnapshot = {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;

  status: string;
  paymentMethod: string;
  paymentStatus: string;

  addressSnapshot: OrderAddressSnapshot;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  note?: string | null;
  placedAt: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  receiptNo?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  items: OrderItem[];
};

/* ============================
   ORDER ITEMS
============================ */

export type OrderItem = {
  id: string;
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string;
  bookAuthor: string;
  bookSlug: string;
  titleSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;

  createdAt: string;
  updatedAt?: string | null;
};

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

export type BookDetail = Book & {
  description?: string;
  publisher?: string;
  isbn?: string;
  publishedAt?: string; // ISO date
  pages?: number;
  isWishlisted?: boolean;
  reviews: Review[];
  totalReviews?: number;
  averageRating?: number;
};

export * from "./api";
