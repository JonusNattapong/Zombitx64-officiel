export interface Course {
  id: string
  title: string
  description: string
  slug: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number // in minutes
  tags: string[]
  modules: Module[]
  prerequisites?: string[]
  objectives: string[]
  technologies: string[]
  category: "web3" | "blockchain" | "ai" | "cybersecurity" | "development"
  updatedAt: Date
}

export interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  duration: number // in minutes
}

export interface Lesson {
  id: string
  title: string
  description: string
  order: number
  content: string
  type: "video" | "text" | "quiz" | "exercise"
  duration: number // in minutes
  resources?: Resource[]
  quiz?: Quiz
}

export interface Resource {
  id: string
  title: string
  type: "link" | "pdf" | "github" | "video"
  url: string
  description?: string
}

export interface Quiz {
  id: string
  questions: Question[]
  passingScore: number
  timeLimit?: number // in minutes
}

export interface Question {
  id: string
  text: string
  type: "multiple-choice" | "single-choice" | "text"
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
}

export interface UserProgress {
  userId: string
  courseId: string
  moduleId: string
  lessonId: string
  completed: boolean
  score?: number
  lastAccessed: Date
  timeSpent: number // in seconds
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issueDate: Date
  expiryDate?: Date
  credential: {
    tokenId?: string
    transactionHash?: string
    metadata?: Record<string, any>
  }
}
