export enum ErrorCode {
  AUTH_REQUIRED = 'E1001',
  AUTH_TOKEN_EXPIRED = 'E1002',
  AUTH_INVALID_CREDENTIALS = 'E1003',
  AUTH_USER_NOT_FOUND = 'E1004',
  
  GACHA_NO_CREDITS = 'E3001',
  GACHA_DAILY_LIMIT = 'E3002',
  GACHA_NO_PLACES = 'E3003',
  
  VALIDATION_ERROR = 'E4001',
  NOT_FOUND = 'E4004',
  
  SERVER_ERROR = 'E5001',
}

export interface ApiError {
  errorCode: string;
  message: string;
}
