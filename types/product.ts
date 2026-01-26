import { Review } from "./review";

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPriceCents?: number | null;
  stock: number;
  imageUrl: string;
  description: string;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;

  sold?: number;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type ProductDetail = Product & {
  description?: string;
  isWishlisted?: boolean;
  reviews: Review[];
  totalReviews?: number;
  averageRating?: number;
};

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
};
