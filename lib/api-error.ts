/**
 * Extract a user-facing error message from an api-nest error response.
 *
 * api-nest returns localized error messages via the `message` field
 * (based on the Accept-Language header). We prefer the API's message
 * over any hardcoded fallback because the backend has full i18n (en/es/ar).
 */
export function extractApiError(
  errorData: unknown,
  fallback = 'Something went wrong',
): string {
  if (
    errorData &&
    typeof errorData === 'object' &&
    'message' in errorData &&
    typeof (errorData as { message: unknown }).message === 'string'
  ) {
    return (errorData as { message: string }).message;
  }

  return fallback;
}

/**
 * Parse an error response from fetch and extract the error message.
 */
export async function parseApiError(
  response: Response,
  fallback?: string,
): Promise<string> {
  const errorData = await response.json().catch(() => null);
  return extractApiError(errorData, fallback);
}

/**
 * Transform api-nest's paginated response shape ({ data, total, skip, take })
 * into the frontend convention ({ items, total, skip, take }).
 */
export function toPaginated<T>(json: {
  data: T[];
  total: number;
  skip: number;
  take: number;
}): { items: T[]; total: number; skip: number; take: number } {
  return { items: json.data, total: json.total, skip: json.skip, take: json.take };
}
