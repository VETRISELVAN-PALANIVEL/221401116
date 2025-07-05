import { LogEntry } from '../types';

class Logger {
  private logs: LogEntry[] = [];

  private addLog(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // In a real application, you might want to send logs to a server
    // For now, we'll just store them in memory and optionally log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${logEntry.level.toUpperCase()}] ${logEntry.message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    this.addLog('info', message, data);
  }

  warn(message: string, data?: any) {
    this.addLog('warn', message, data);
  }

  error(message: string, data?: any) {
    this.addLog('error', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger(); 