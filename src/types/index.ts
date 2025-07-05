export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  validityMinutes: number;
  expiryTime: Date;
  createdAt: Date;
}

export interface UrlInput {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface UrlValidationError {
  field: string;
  message: string;
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
} 