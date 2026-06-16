export type AuthStatus = 'unknown' | 'checking' | 'anonymous' | 'authenticated';

export interface AuthenticatedUser {
  subject: string;
  displayName: string;
  email: string | null;
  authorities: string[];
  avatar: string;
}

export interface CsrfTokenResponse {
  parameterName: string;
  headerName: string;
  token: string;
}
