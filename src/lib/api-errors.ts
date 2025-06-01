import { NextResponse } from 'next/server';

// Standard error codes
export enum ApiErrorCode {
  // Authentication errors (1000-1099)
  MISSING_API_KEY = 1001,
  INVALID_API_KEY = 1002,
  EXPIRED_API_KEY = 1003,
  USER_NOT_FOUND = 1004,
  
  // Authorization errors (1100-1199)
  ACCESS_DENIED = 1101,
  INSUFFICIENT_PERMISSIONS = 1102,
  RESOURCE_NOT_FOUND = 1103,
  
  // Rate limiting errors (1200-1299)
  RATE_LIMIT_EXCEEDED = 1201,
  QUOTA_EXCEEDED = 1202,
  
  // Validation errors (1300-1399)
  INVALID_REQUEST_DATA = 1301,
  MISSING_REQUIRED_FIELD = 1302,
  INVALID_FIELD_FORMAT = 1303,
  INVALID_QUERY_PARAMETERS = 1304,
  
  // Business logic errors (1400-1499)
  RESOURCE_ALREADY_EXISTS = 1401,
  RESOURCE_IN_USE = 1402,
  OPERATION_NOT_ALLOWED = 1403,
  
  // Server errors (1500-1599)
  INTERNAL_SERVER_ERROR = 1500,
  DATABASE_ERROR = 1501,
  EXTERNAL_SERVICE_ERROR = 1502,
  
  // Feature availability errors (1600-1699)
  FEATURE_NOT_AVAILABLE = 1601,
  PREMIUM_FEATURE_REQUIRED = 1602,
}

// Standard error response interface
export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    type: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  };
  success: false;
}

// Standard success response interface
export interface ApiSuccessResponse<T = any> {
  data: T;
  success: true;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
    timestamp: string;
    requestId?: string;
  };
}

// Create standardized error response
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  httpStatus: number,
  details?: Record<string, any>,
  requestId?: string
): NextResponse {
  const errorType = getErrorType(code);
  
  const errorResponse: ApiErrorResponse = {
    error: {
      code,
      type: errorType,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId
    },
    success: false
  };

  return NextResponse.json(errorResponse, { status: httpStatus });
}

// Create standardized success response
export function createSuccessResponse<T>(
  data: T,
  httpStatus: number = 200,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse {
  const successResponse: ApiSuccessResponse<T> = {
    data,
    success: true,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  return NextResponse.json(successResponse, { status: httpStatus });
}

// Get error type from error code
function getErrorType(code: ApiErrorCode): string {
  if (code >= 1000 && code < 1100) return 'AUTHENTICATION_ERROR';
  if (code >= 1100 && code < 1200) return 'AUTHORIZATION_ERROR';
  if (code >= 1200 && code < 1300) return 'RATE_LIMIT_ERROR';
  if (code >= 1300 && code < 1400) return 'VALIDATION_ERROR';
  if (code >= 1400 && code < 1500) return 'BUSINESS_LOGIC_ERROR';
  if (code >= 1500 && code < 1600) return 'SERVER_ERROR';
  if (code >= 1600 && code < 1700) return 'FEATURE_AVAILABILITY_ERROR';
  return 'UNKNOWN_ERROR';
}

// Common error responses
export const CommonErrors = {
  missingApiKey: () => createErrorResponse(
    ApiErrorCode.MISSING_API_KEY,
    'Přístup k API vyžaduje platný API klíč v hlavičce X-API-Key',
    401
  ),

  invalidApiKey: () => createErrorResponse(
    ApiErrorCode.INVALID_API_KEY,
    'Poskytnutý API klíč je neplatný nebo byl zrušen',
    401
  ),

  userNotFound: () => createErrorResponse(
    ApiErrorCode.USER_NOT_FOUND,
    'Uživatel spojený s tímto API klíčem nebyl nalezen',
    401
  ),

  accessDenied: (resource?: string) => createErrorResponse(
    ApiErrorCode.ACCESS_DENIED,
    `Přístup odepřen${resource ? ` k prostředku: ${resource}` : ''}`,
    403
  ),

  resourceNotFound: (resource: string) => createErrorResponse(
    ApiErrorCode.RESOURCE_NOT_FOUND,
    `${resource} nebylo nalezeno`,
    404
  ),

  rateLimitExceeded: (retryAfter: number, resetTime: Date) => createErrorResponse(
    ApiErrorCode.RATE_LIMIT_EXCEEDED,
    `Překročen limit požadavků. Zkuste to znovu za ${retryAfter} sekund.`,
    429,
    {
      retryAfter,
      resetTime: resetTime.toISOString()
    }
  ),

  invalidRequestData: (details?: Record<string, any>) => createErrorResponse(
    ApiErrorCode.INVALID_REQUEST_DATA,
    'Neplatné údaje v požadavku',
    400,
    details
  ),

  missingRequiredField: (field: string) => createErrorResponse(
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    `Povinné pole '${field}' chybí`,
    400,
    { field }
  ),

  resourceAlreadyExists: (resource: string) => createErrorResponse(
    ApiErrorCode.RESOURCE_ALREADY_EXISTS,
    `${resource} již existuje`,
    409
  ),

  internalServerError: (details?: Record<string, any>) => createErrorResponse(
    ApiErrorCode.INTERNAL_SERVER_ERROR,
    'Nastala chyba na serveru. Zkuste to prosím později.',
    500,
    details
  ),

  premiumFeatureRequired: (feature: string) => createErrorResponse(
    ApiErrorCode.PREMIUM_FEATURE_REQUIRED,
    `Funkce '${feature}' je dostupná pouze pro premium uživatele`,
    403,
    { feature, upgradeUrl: '/dashboard/settings' }
  ),

  invalidQueryParameters: (details?: Record<string, any>) => createErrorResponse(
    ApiErrorCode.INVALID_QUERY_PARAMETERS,
    'Neplatné parametry dotazu',
    400,
    details
  )
};

// Validation error builder
export class ValidationErrorBuilder {
  private errors: Record<string, string[]> = {};

  addError(field: string, message: string): this {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
    return this;
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  build(): NextResponse {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST_DATA,
      'Neplatné údaje v požadavku',
      400,
      { validation: this.errors }
    );
  }
}

// Request ID generator (simple implementation)
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}