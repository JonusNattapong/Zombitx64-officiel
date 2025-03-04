import { Prisma } from "@prisma/client"

export type UserBasic = {
  id: string
  name: string | null
  image: string | null
}

export interface ReviewWithUser {
  id: string
  productId: string
  userId: string
  sellerId: string
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
  verified: boolean
  helpful: number
  user: UserBasic
}

export interface ProductWithOwner {
  id: string
  title: string
  description: string
  price: number
  fileHash: string
  version: string
  category: string
  tags: string
  metrics: string | null
  extendedMetrics: string | null
  createdAt: Date
  updatedAt: Date
  ownerId: string
  owner: {
    id: string
    name: string | null
    image: string | null
    role: string
    createdAt: Date
  }
}

export type CreateProductInput = Prisma.ProductCreateInput
export type UpdateProductInput = Prisma.ProductUpdateInput
