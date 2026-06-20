import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { InputValidator, validateBody, validateQuery, validateParams, validateHeaders } from '../src/input-validation';

describe('InputValidator', () => {
  const validator = new InputValidator();

  describe('validate', () => {
    const userSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().min(18).optional(),
    });

    it('should validate valid data', () => {
      const result = validator.validate(userSchema, {
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John Doe', email: 'john@example.com' });
    });

    it('should return errors for invalid data', () => {
      const result = validator.validate(userSchema, {
        name: 'J', // Too short
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should return error details with field paths', () => {
      const result = validator.validate(userSchema, {
        name: 'J',
        email: 'invalid',
      });
      expect(result.success).toBe(false);
      const fields = result.errors!.map((e) => e.field);
      expect(fields).toContain('name');
      expect(fields).toContain('email');
    });

    it('should handle non-ZodError exceptions', () => {
      // Pass a string instead of object to trigger a different error
      const result = validator.validate(userSchema, 'not-an-object');
      expect(result.success).toBe(false);
      if (result.errors) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createMiddleware', () => {
    const bodySchema = z.object({
      title: z.string().min(1),
    });

    it('should create a middleware function', () => {
      const middleware = validator.createMiddleware('body', bodySchema);
      expect(typeof middleware).toBe('function');
    });

    it('should pass valid data and attach to request', () => {
      const middleware = validator.createMiddleware('body', bodySchema);
      const req = { body: { title: 'Test Title' } };
      let nextCalled = false;

      middleware(
        req,
        { status: () => ({ json: () => {} }) },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
      expect(req.body.title).toBe('Test Title');
    });

    it('should return 400 for invalid data', () => {
      const middleware = validator.createMiddleware('body', bodySchema);
      let nextCalled = false;
      let responseBody: unknown;

      middleware(
        { body: {} },
        {
          status(code: number) {
            return {
              json(body: unknown) {
                responseBody = body;
                return body;
              },
            };
          },
        },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(false);
      const body = responseBody as Record<string, unknown>;
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.status).toBe(400);
    });

    it('should handle missing request body', () => {
      const middleware = validator.createMiddleware('body', bodySchema);
      let nextCalled = false;

      middleware(
        {},
        {
          status(code: number) {
            return { json: () => {} };
          },
        },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(false);
    });

    it('should support query validation', () => {
      const querySchema = z.object({
        page: z.string().transform(Number).pipe(z.number().min(1)),
      });
      const middleware = validator.createMiddleware('query', querySchema);
      let nextCalled = false;

      middleware(
        { query: { page: '2' } },
        { status: () => ({ json: () => {} }) },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });

    it('should support params validation', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });
      const middleware = validator.createMiddleware('params', paramsSchema);
      let nextCalled = false;

      middleware(
        { params: { id: '550e8400-e29b-41d4-a716-446655440000' } },
        { status: () => ({ json: () => {} }) },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });

    it('should support headers validation', () => {
      const headersSchema = z.object({
        'x-api-version': z.string(),
      });
      const middleware = validator.createMiddleware('headers', headersSchema);
      let nextCalled = false;

      middleware(
        { headers: { 'x-api-version': 'v1' } },
        { status: () => ({ json: () => {} }) },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });
  });

  describe('validateBody helper', () => {
    it('should validate and return parsed body', () => {
      const schema = z.object({ count: z.number() });
      const result = validator.validateBody(schema, { count: 42 });
      expect(result).toEqual({ count: 42 });
    });

    it('should throw on invalid body', () => {
      const schema = z.object({ count: z.number() });
      expect(() => {
        validator.validateBody(schema, { count: 'not-a-number' });
      }).toThrow('Validation failed');
    });
  });

  describe('validateQuery helper', () => {
    it('should validate and return parsed query', () => {
      const schema = z.object({ q: z.string() });
      const result = validator.validateQuery(schema, { q: 'search' });
      expect(result).toEqual({ q: 'search' });
    });

    it('should throw on invalid query', () => {
      const schema = z.object({ q: z.string() });
      expect(() => {
        validator.validateQuery(schema, {});
      }).toThrow('Query validation failed');
    });
  });

  describe('validateParams helper', () => {
    it('should validate and return parsed params', () => {
      const schema = z.object({ id: z.string() });
      const result = validator.validateParams(schema, { id: '123' });
      expect(result).toEqual({ id: '123' });
    });

    it('should throw on invalid params', () => {
      const schema = z.object({ id: z.string() });
      expect(() => {
        validator.validateParams(schema, {});
      }).toThrow('Params validation failed');
    });
  });

  describe('convenience middleware factories', () => {
    it('should create body middleware', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);
      expect(typeof middleware).toBe('function');
    });

    it('should create query middleware', () => {
      const schema = z.object({ page: z.string() });
      const middleware = validateQuery(schema);
      expect(typeof middleware).toBe('function');
    });

    it('should create params middleware', () => {
      const schema = z.object({ id: z.string() });
      const middleware = validateParams(schema);
      expect(typeof middleware).toBe('function');
    });

    it('should create headers middleware', () => {
      const schema = z.object({ 'x-api-key': z.string() });
      const middleware = validateHeaders(schema);
      expect(typeof middleware).toBe('function');
    });
  });
});
