import { extractApiError, parseApiError, toPaginated } from './api-error';

describe('extractApiError', () => {
  it('extracts message from valid error object', () => {
    expect(extractApiError({ message: 'Bad request' })).toBe('Bad request');
  });

  it('returns fallback for null', () => {
    expect(extractApiError(null, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback for undefined', () => {
    expect(extractApiError(undefined, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback for empty object', () => {
    expect(extractApiError({}, 'Fallback')).toBe('Fallback');
  });

  it('returns fallback when message is not a string', () => {
    expect(extractApiError({ message: 123 }, 'Fallback')).toBe('Fallback');
  });

  it('returns default fallback when none provided', () => {
    expect(extractApiError(null)).toBe('Something went wrong');
  });

  it('extracts message from nested error with extra fields', () => {
    expect(extractApiError({ message: 'Not found', statusCode: 404 })).toBe('Not found');
  });
});

describe('parseApiError', () => {
  it('parses JSON response and extracts message', async () => {
    const response = {
      json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
    } as unknown as Response;

    expect(await parseApiError(response)).toBe('Unauthorized');
  });

  it('returns fallback when json() throws', async () => {
    const response = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Response;

    expect(await parseApiError(response, 'Network error')).toBe('Network error');
  });

  it('returns fallback when json() returns null', async () => {
    const response = {
      json: jest.fn().mockResolvedValue(null),
    } as unknown as Response;

    expect(await parseApiError(response, 'Error')).toBe('Error');
  });
});

describe('toPaginated', () => {
  it('maps data to items', () => {
    const result = toPaginated({
      data: [{ id: '1' }, { id: '2' }],
      total: 10,
      skip: 0,
      take: 2,
    });

    expect(result).toEqual({
      items: [{ id: '1' }, { id: '2' }],
      total: 10,
      skip: 0,
      take: 2,
    });
  });

  it('handles empty data', () => {
    const result = toPaginated({ data: [], total: 0, skip: 0, take: 20 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
