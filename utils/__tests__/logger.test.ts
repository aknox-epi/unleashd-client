import { logger } from '../logger';

describe('logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('in test environment', () => {
    it('should suppress error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should suppress warning messages', () => {
      logger.warn('Test warning message');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should suppress info messages', () => {
      logger.info('Test info message');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should suppress log messages', () => {
      logger.log('Test log message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should suppress error with additional arguments', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { context: 'test' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('in development environment', () => {
    const originalEnv = process.env.NODE_ENV;

    // eslint-disable-next-line no-undef
    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
    });

    // eslint-disable-next-line no-undef
    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message');
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Test warning message');
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('Test info message');
    });

    it('should log general messages', () => {
      logger.log('Test log message');
      expect(consoleLogSpy).toHaveBeenCalledWith('Test log message');
    });

    it('should log error with additional arguments', () => {
      const error = new Error('Test error');
      const context = { key: 'value' };
      logger.error('Error occurred', error, context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred',
        error,
        context
      );
    });
  });

  describe('in production environment', () => {
    const originalEnv = process.env.NODE_ENV;

    // eslint-disable-next-line no-undef
    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
    });

    // eslint-disable-next-line no-undef
    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should log error messages in production', () => {
      logger.error('Production error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Production error');
    });

    it('should log warning messages in production', () => {
      logger.warn('Production warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Production warning');
    });
  });
});
