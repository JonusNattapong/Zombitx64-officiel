import { Prisma } from "@prisma/client";

export type UserBasic = {
  id: string;
  name: string | null;
  image: string | null;
  createdAt: Date; // Add createdAt
};

// Base Product interface, matching the Prisma schema
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  fileHash: string;
  version: string;
  metrics: string | null;
  extendedMetrics: string | null;
  tags: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  datasetId: string | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
}

export interface ReviewWithUser extends Review {
  user: UserBasic; // Use UserBasic for the reviewer
}

export interface ProductWithOwner extends Product {
  owner: UserBasic;
  dataset: Dataset | null;
}

export type CreateProductInput = Prisma.ProductCreateInput;
export type UpdateProductInput = Prisma.ProductUpdateInput;

export interface Dataset {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  files: DatasetFile[];
  tags: string | null; // Corrected: Can be a single string or null
  metadata: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string | null;
  user: UserBasic;
}

export interface DatasetFile {
  id: string;
  datasetId: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
  fileSize: number; // Added missing fields from Prisma schema
  filePath: string;
  fileHash: string;
  metadata: string | null;
}

export type { Transaction } from "@prisma/client";
