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