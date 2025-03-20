export type EbookVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
export type EbookLicenseType = 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'EDUCATIONAL' | 'ENTERPRISE'

export const EBOOK_CATEGORIES = [
  'Programming',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'DevOps',
  'Security',
  'Business',
  'Design',
  'Marketing',
  'Other'
] as const
export type EbookCategory = (typeof EBOOK_CATEGORIES)[number]

export const EBOOK_LANGUAGES = [
  'English',
  'Thai',
  'Chinese',
  'Japanese',
  'Korean',
  'Spanish',
  'French',
  'German',
  'Other'
] as const
export type EbookLanguage = (typeof EBOOK_LANGUAGES)[number]

export interface Ebook {
  id: string
  title: string
  description: string
  category: EbookCategory
  tags: string[]
  language: EbookLanguage
  author: string
  publishYear?: string
  publisher?: string
  isbn?: string
  pages?: number
  tableOfContents?: Record<string, any>
  sampleContent?: string
  coverImage?: string
  fileUrl?: string
  previewUrl?: string
  visibility: EbookVisibility
  licenseType: EbookLicenseType
  createdAt: Date
  updatedAt: Date
  userId: string
  productId?: string
  downloads: number
  rating?: number
}

export interface CreateEbookInput {
  title: string
  description: string
  category: EbookCategory
  tags: string[]
  language: EbookLanguage
  author: string
  publishYear?: string
  publisher?: string
  isbn?: string
  pages?: number
  tableOfContents?: Record<string, any>
  sampleContent?: string
  coverImage?: string
  price?: number
  visibility?: EbookVisibility
  licenseType: EbookLicenseType
}

export interface UpdateEbookInput extends Partial<CreateEbookInput> {
  id: string
}

export interface EbookQueryParams {
  category?: EbookCategory
  language?: EbookLanguage
  visibility?: EbookVisibility
  licenseType?: EbookLicenseType
  userId?: string
  productId?: string
  searchQuery?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'downloads' | 'rating'
  sortOrder?: 'asc' | 'desc'
}