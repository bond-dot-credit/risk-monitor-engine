export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  source?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  enablePerformanceTracking: boolean;
  enableErrorReporting: boolean;
  errorReportingService?: string;
  errorReportingKey?: string;
}

export interface LogTransport {
  log(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}

export class ConsoleTransport implements LogTransport {
  async log(entry: LogEntry): Promise<void> {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? `\n${entry.error.stack}` : '';
    
    const message = `[${timestamp}] ${level}: ${entry.message}${context}${error}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        break;
    }
  }

  async flush(): Promise<void> {
    // Console transport doesn't need flushing
  }

  async close(): Promise<void> {
    // Console transport doesn't need closing
  }
}

export class RemoteTransport implements LogTransport {
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor(
    private endpoint: string,
    private batchSize: number,
    private flushInterval: number,
    private maxRetries: number,
    private retryDelay: number
  ) {
    this.startFlushTimer();
  }

  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) {
      return;
    }

    this.isFlushing = true;
    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await this.sendBatch(entries);
    } catch (error) {
      // Re-add entries to buffer on failure
      this.buffer.unshift(...entries);
      console.error('Failed to send logs to remote endpoint:', error);
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendBatch(entries: LogEntry[], retryCount = 0): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: entries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        return this.sendBatch(entries, retryCount + 1);
      }
      throw error;
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

export class Logger {
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private performanceMarks = new Map<string, number>();
  private errorCount = 0;
  private warningCount = 0;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      batchSize: 100,
      flushInterval: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      enablePerformanceTracking: true,
      enableErrorReporting: true,
      ...config,
    };

    this.initializeTransports();
  }

  private initializeTransports(): void {
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.transports.push(
        new RemoteTransport(
          this.config.remoteEndpoint,
          this.config.batchSize,
          this.config.flushInterval,
          this.config.maxRetries,
          this.config.retryDelay
        )
      );
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private async log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId(),
      source: this.getCallerSource(),
    };

    // Update counters
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      this.errorCount++;
    } else if (level === LogLevel.WARN) {
      this.warningCount++;
    }

    // Send to all transports
    await Promise.allSettled(
      this.transports.map(transport => transport.log(entry))
    );
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Performance tracking methods
  startTimer(name: string): void {
    if (this.config.enablePerformanceTracking) {
      this.performanceMarks.set(name, performance.now());
    }
  }

  endTimer(name: string, context?: Record<string, unknown>): void {
    if (this.config.enablePerformanceTracking) {
      const startTime = this.performanceMarks.get(name);
      if (startTime) {
        const duration = performance.now() - startTime;
        this.info(`Timer: ${name} completed in ${duration.toFixed(2)}ms`, {
          ...context,
          duration,
          timerName: name,
        });
        this.performanceMarks.delete(name);
      }
    }
  }

  // Error reporting
  reportError(error: Error, context?: Record<string, unknown>): void {
    if (this.config.enableErrorReporting) {
      this.error('Error reported', context, error);
      
      // Send to external error reporting service if configured
      if (this.config.errorReportingService && this.config.errorReportingKey) {
        this.sendToErrorReportingService(error, context);
      }
    }
  }

  private async sendToErrorReportingService(error: Error, context?: Record<string, unknown>): Promise<void> {
    try {
      const payload = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      await fetch(this.config.errorReportingService!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.errorReportingKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (reportError) {
      console.error('Failed to send error to reporting service:', reportError);
    }
  }

  // Utility methods
  getStats(): { errorCount: number; warningCount: number } {
    return {
      errorCount: this.errorCount,
      warningCount: this.warningCount,
    };
  }

  async flush(): Promise<void> {
    await Promise.allSettled(
      this.transports.map(transport => transport.flush())
    );
  }

  async close(): Promise<void> {
    await Promise.allSettled(
      this.transports.map(transport => transport.close())
    );
  }

  // Private helper methods
  private getCurrentUserId(): string | undefined {
    // Implementation depends on your auth system
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // Implementation depends on your session management
    return undefined;
  }

  private getCurrentRequestId(): string | undefined {
    // Implementation depends on your request tracking
    return undefined;
  }

  private getCallerSource(): string | undefined {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        const callerLine = lines[3]; // Skip Error constructor, getCallerSource, and log method
        if (callerLine) {
          const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
          if (match) {
            return `${match[1]} (${match[2]}:${match[3]})`;
          }
        }
      }
    } catch {
      // Ignore errors in source detection
    }
    return undefined;
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions
export const debug = (message: string, context?: Record<string, unknown>) => logger.debug(message, context);
export const info = (message: string, context?: Record<string, unknown>) => logger.info(message, context);
export const warn = (message: string, context?: Record<string, unknown>) => logger.warn(message, context);
export const error = (message: string, context?: Record<string, unknown>, err?: Error) => logger.error(message, context, err);
export const fatal = (message: string, context?: Record<string, unknown>, err?: Error) => logger.fatal(message, context, err);

// Performance tracking helpers
export const startTimer = (name: string) => logger.startTimer(name);
export const endTimer = (name: string, context?: Record<string, unknown>) => logger.endTimer(name, context);

// Error reporting helper
export const reportError = (err: Error, context?: Record<string, unknown>) => logger.reportError(err, context);
