import { ShortenedUrl, UrlInput, UrlValidationError } from '../types';
import { logger } from './logger';

class UrlService {
  private shortenedUrls: ShortenedUrl[] = [];
  private usedShortCodes: Set<string> = new Set();

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode: string;
    
    do {
      shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.usedShortCodes.has(shortCode));
    
    return shortCode;
  }

  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateShortCode(shortCode: string): boolean {
    // Allow alphanumeric characters and hyphens, 3-20 characters long
    const shortCodeRegex = /^[a-zA-Z0-9-]{3,20}$/;
    return shortCodeRegex.test(shortCode);
  }

  validateUrlInput(input: UrlInput): UrlValidationError[] {
    const errors: UrlValidationError[] = [];

    // Validate original URL
    if (!input.originalUrl.trim()) {
      errors.push({ field: 'originalUrl', message: 'Original URL is required' });
    } else if (!this.validateUrl(input.originalUrl)) {
      errors.push({ field: 'originalUrl', message: 'Please enter a valid URL' });
    }

    // Validate validity minutes
    if (input.validityMinutes !== undefined) {
      if (!Number.isInteger(input.validityMinutes) || input.validityMinutes <= 0) {
        errors.push({ field: 'validityMinutes', message: 'Validity must be a positive integer' });
      }
    }

    // Validate custom short code
    if (input.customShortCode) {
      if (!this.validateShortCode(input.customShortCode)) {
        errors.push({ 
          field: 'customShortCode', 
          message: 'Short code must be 3-20 characters long and contain only letters, numbers, and hyphens' 
        });
      } else if (this.usedShortCodes.has(input.customShortCode)) {
        errors.push({ field: 'customShortCode', message: 'This short code is already in use' });
      }
    }

    return errors;
  }

  shortenUrl(input: UrlInput): ShortenedUrl {
    logger.info('Shortening URL', { originalUrl: input.originalUrl });

    const validityMinutes = input.validityMinutes || 30;
    const shortCode = input.customShortCode || this.generateShortCode();
    
    if (input.customShortCode) {
      this.usedShortCodes.add(input.customShortCode);
    } else {
      this.usedShortCodes.add(shortCode);
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + validityMinutes * 60 * 1000);

    const shortenedUrl: ShortenedUrl = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      originalUrl: input.originalUrl,
      shortCode,
      shortUrl: `${window.location.origin}/${shortCode}`,
      validityMinutes,
      expiryTime,
      createdAt: now
    };

    this.shortenedUrls.push(shortenedUrl);
    
    logger.info('URL shortened successfully', { 
      shortCode, 
      originalUrl: input.originalUrl,
      expiryTime 
    });

    return shortenedUrl;
  }

  shortenMultipleUrls(inputs: UrlInput[]): ShortenedUrl[] {
    logger.info('Shortening multiple URLs', { count: inputs.length });
    
    const results: ShortenedUrl[] = [];
    const errors: UrlValidationError[] = [];

    // Validate all inputs first
    inputs.forEach((input, index) => {
      const inputErrors = this.validateUrlInput(input);
      inputErrors.forEach(error => {
        errors.push({ ...error, field: `${error.field}_${index}` });
      });
    });

    if (errors.length > 0) {
      logger.error('Validation errors found', { errors });
      throw new Error('Validation failed');
    }

    // Process all valid inputs
    inputs.forEach(input => {
      try {
        const result = this.shortenUrl(input);
        results.push(result);
      } catch (error) {
        logger.error('Failed to shorten URL', { input, error });
        throw error;
      }
    });

    logger.info('Multiple URLs shortened successfully', { count: results.length });
    return results;
  }

  getShortenedUrl(shortCode: string): ShortenedUrl | null {
    const url = this.shortenedUrls.find(u => u.shortCode === shortCode);
    
    if (url) {
      if (new Date() > url.expiryTime) {
        logger.warn('Attempted to access expired URL', { shortCode, expiryTime: url.expiryTime });
        return null;
      }
      logger.info('URL accessed', { shortCode, originalUrl: url.originalUrl });
      return url;
    }
    
    logger.warn('Short code not found', { shortCode });
    return null;
  }

  getAllShortenedUrls(): ShortenedUrl[] {
    // Filter out expired URLs
    const validUrls = this.shortenedUrls.filter(url => new Date() <= url.expiryTime);
    
    // Remove expired URLs from storage
    this.shortenedUrls = validUrls;
    
    return [...validUrls].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  clearExpiredUrls(): void {
    const beforeCount = this.shortenedUrls.length;
    this.shortenedUrls = this.shortenedUrls.filter(url => new Date() <= url.expiryTime);
    const afterCount = this.shortenedUrls.length;
    
    if (beforeCount !== afterCount) {
      logger.info('Cleared expired URLs', { 
        removed: beforeCount - afterCount,
        remaining: afterCount 
      });
    }
  }
}

export const urlService = new UrlService(); 