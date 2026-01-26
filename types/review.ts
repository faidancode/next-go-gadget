export type Review = {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};
