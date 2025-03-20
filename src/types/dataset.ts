export type DatasetCategory =
  | 'Machine Learning'
  | 'Computer Vision'
  | 'Natural Language'
  | 'Time Series'
  | 'Structured Data'
  | 'Audio'
  | 'Video'
  | 'IoT'
  | 'Healthcare'
  | 'Financial'
  | 'Social Media'
  | 'Other'

export type DatasetVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
export type DatasetStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'
export type DatasetLicenseType = 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'RESEARCH' | 'ENTERPRISE'

export const DATASET_CATEGORIES: DatasetCategory[] = [
  'Machine Learning',
  'Computer Vision',
  'Natural Language',
  'Time Series',
  'Structured Data',
  'Audio',
  'Video',
  'IoT',
  'Healthcare',
  'Financial',
  'Social Media',
  'Other'
]

export interface DatasetMetadata {
  format: string
  size: number
  columns?: string[]
  rows?: number
  features?: string[]
  sampleRate?: number
  duration?: number
  resolution?: string
  dimensions?: {
    width: number
    height: number
  }
  dataTypes?: Record<string, string>
  hasNullValues?: boolean
  valueRanges?: Record<string, { min: number; max: number }>
  categories?: Record<string, string[]>
  dataPeriod?: {
    start: string
    end: string
  }
  sources?: string[]
  preprocessing?: string[]
  annotations?: {
    type: string
    count: number
    classes?: string[]
  }
}

export interface Dataset {
  id: string
  title: string
  description: string
  category: DatasetCategory
  tags: string[]
  visibility: DatasetVisibility
  status: DatasetStatus
  licenseType: DatasetLicenseType
  coverImage?: string
  metadata: DatasetMetadata
  fileCount: number
  totalSize: number
  downloadCount: number
  rating?: number
  price?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  productId?: string
}

export interface CreateDatasetInput {
  title: string
  description: string
  category: DatasetCategory
  tags: string[]
  visibility: DatasetVisibility
  licenseType: DatasetLicenseType
  coverImage?: string
  metadata: DatasetMetadata
  price?: number
}

export interface UpdateDatasetInput extends Partial<CreateDatasetInput> {
  id: string
  status?: DatasetStatus
}

export interface DatasetFile {
  id: string
  filename: string
  fileType: string
  fileUrl: string
  fileSize: number
  filePath: string
  fileHash: string
  metadata?: Record<string, any>
  datasetId: string
  createdAt: Date
}

export interface DatasetQueryParams {
  category?: DatasetCategory
  visibility?: DatasetVisibility
  status?: DatasetStatus
  licenseType?: DatasetLicenseType
  userId?: string
  searchQuery?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  hasFiles?: boolean
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: 'title' | 'createdAt' | 'downloadCount' | 'rating' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface DatasetStats {
  totalDatasets: number
  totalDownloads: number
  totalSize: number
  categoryDistribution: Record<DatasetCategory, number>
  licenseDistribution: Record<DatasetLicenseType, number>
  popularTags: Array<{ tag: string; count: number }>
  averageRating: number
  monthlyUploads: Array<{ month: string; count: number }>
}