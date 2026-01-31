export type Cart = {
  id: string;
  userId: string;

  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productCoverUrl: string;
  categoryId: string;
  quantity: number;
  priceCentsAtAdd: number;

  createdAt: string;
  updatedAt: string;
};

export type CartWithItems = Cart & {
  data?: CartItem[];
  items?: CartItem[];
};

export type CartItemInput = {
  productId: string;
  quantity: number;
  priceCentsAtAdd: number;
};

export type CartMergeInput = {
  userId: string;
  items: CartItemInput[];
};
