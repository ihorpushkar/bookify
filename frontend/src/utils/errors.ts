export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Please check your connection and try again.') {
    super(message);
    this.name = 'NetworkError';
  }
}

const FRIENDLY_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This time slot is no longer available.',
  500: 'Something went wrong on our end. Please try again later.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof NetworkError) return error.message;

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

    if (serverMessage) return serverMessage;
    if (status && FRIENDLY_MESSAGES[status]) return FRIENDLY_MESSAGES[status];
  }

  if (error instanceof Error && error.message) return error.message;

  return 'An unexpected error occurred. Please try again.';
}

export function parseAxiosError(error: unknown): ApiError | NetworkError {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return new ApiError(getErrorMessage(error), axiosError.response?.status);
  }

  if (error && typeof error === 'object' && 'request' in error) {
    return new NetworkError();
  }

  return new ApiError(getErrorMessage(error));
}
