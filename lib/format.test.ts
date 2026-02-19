import { getInitials, formatRelativeTime } from './format';

describe('getInitials', () => {
  it('returns both initials for first and last name', () => {
    expect(getInitials('John', 'Doe')).toBe('JD');
  });

  it('uppercases lowercase names', () => {
    expect(getInitials('john', 'doe')).toBe('JD');
  });

  it('returns first initial only when last name is null', () => {
    expect(getInitials('John', null)).toBe('J');
  });

  it('returns last initial only when first name is null', () => {
    expect(getInitials(null, 'Doe')).toBe('D');
  });

  it('returns "?" when both are null', () => {
    expect(getInitials(null, null)).toBe('?');
  });

  it('returns "?" when both are undefined', () => {
    expect(getInitials(undefined, undefined)).toBe('?');
  });

  it('returns "?" when both are empty strings', () => {
    expect(getInitials('', '')).toBe('?');
  });

  it('handles single character names', () => {
    expect(getInitials('A', 'B')).toBe('AB');
  });
});

describe('formatRelativeTime', () => {
  const NOW = new Date('2025-01-15T12:00:00Z').getTime();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns "now" for less than 1 minute ago', () => {
    const date = new Date(NOW - 30_000).toISOString(); // 30 seconds
    expect(formatRelativeTime(date)).toBe('now');
  });

  it('returns minutes for less than 1 hour', () => {
    const date = new Date(NOW - 5 * 60_000).toISOString(); // 5 minutes
    expect(formatRelativeTime(date)).toBe('5m');
  });

  it('returns hours for less than 1 day', () => {
    const date = new Date(NOW - 2 * 60 * 60_000).toISOString(); // 2 hours
    expect(formatRelativeTime(date)).toBe('2h');
  });

  it('returns days for less than 30 days', () => {
    const date = new Date(NOW - 3 * 24 * 60 * 60_000).toISOString(); // 3 days
    expect(formatRelativeTime(date)).toBe('3d');
  });

  it('returns months for less than 12 months', () => {
    const date = new Date(NOW - 60 * 24 * 60 * 60_000).toISOString(); // 60 days ≈ 2 months
    expect(formatRelativeTime(date)).toBe('2mo');
  });

  it('returns years for 12+ months', () => {
    const date = new Date(NOW - 400 * 24 * 60 * 60_000).toISOString(); // 400 days ≈ 1 year
    expect(formatRelativeTime(date)).toBe('1y');
  });

  it('returns "1m" at exactly 1 minute', () => {
    const date = new Date(NOW - 60_000).toISOString();
    expect(formatRelativeTime(date)).toBe('1m');
  });

  it('returns "1h" at exactly 60 minutes', () => {
    const date = new Date(NOW - 60 * 60_000).toISOString();
    expect(formatRelativeTime(date)).toBe('1h');
  });
});
