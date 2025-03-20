# E-book System Documentation

This document describes the e-book system implementation, including its features, API endpoints, and usage.

## Features

- Create, read, update, and delete e-books
- Support for multiple license types (FREE, PAID, SUBSCRIPTION, EDUCATIONAL, ENTERPRISE)
- Visibility control (PUBLIC, PRIVATE, UNLISTED)
- File upload support (PDF and EPUB formats)
- Integration with product system for paid e-books
- Download tracking
- Category and language organization
- Search and filtering capabilities
- JSON-based table of contents support

## API Endpoints

### List E-books
```http
GET /api/ebooks
```
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `language`: Filter by language
- `visibility`: Filter by visibility
- `licenseType`: Filter by license type
- `searchQuery`: Search in title, description, and author
- `sortBy`: Sort field (title, createdAt, downloads, rating)
- `sortOrder`: Sort order (asc, desc)

### Get Single E-book
```http
GET /api/ebooks/{id}
```

### Create E-book
```http
POST /api/ebooks
```
Required fields:
- `title`: String
- `description`: String
- `category`: EbookCategory
- `language`: EbookLanguage
- `author`: String
- `licenseType`: EbookLicenseType

Optional fields:
- `tags`: String[]
- `publishYear`: String
- `publisher`: String
- `isbn`: String
- `pages`: Number
- `tableOfContents`: Object
- `sampleContent`: String
- `coverImage`: String (URL)
- `price`: Number (required for PAID license type)
- `visibility`: EbookVisibility (default: PUBLIC)

### Update E-book
```http
PATCH /api/ebooks/{id}
```
All fields from the create endpoint are optional for updates.

### Delete E-book
```http
DELETE /api/ebooks/{id}
```

### Upload E-book File
```http
POST /api/ebooks/{id}/upload
```
Form data:
- `file`: File (PDF or EPUB, max 100MB)

## Categories
```typescript
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
]
```

## Languages
```typescript
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
]
```

## License Types
```typescript
export type EbookLicenseType = 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'EDUCATIONAL' | 'ENTERPRISE'
```

## Visibility Options
```typescript
export type EbookVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
```

## Usage Example

```typescript
// Create an e-book
const response = await fetch('/api/ebooks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Introduction to TypeScript',
    description: 'A comprehensive guide to TypeScript',
    category: 'Programming',
    language: 'English',
    author: 'John Doe',
    tags: ['typescript', 'programming', 'javascript'],
    licenseType: 'PAID',
    price: 29.99,
    visibility: 'PUBLIC'
  }),
})

const ebook = await response.json()

// Upload the e-book file
const fileData = new FormData()
fileData.append('file', pdfFile)

await fetch(`/api/ebooks/${ebook.id}/upload`, {
  method: 'POST',
  body: fileData,
})