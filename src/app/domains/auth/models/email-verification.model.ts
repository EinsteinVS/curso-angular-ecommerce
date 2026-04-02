export interface EmailVerificationRequest {
  email: string;
  verificationToken: string;
}

export interface EmailVerificationResponse {
  message?: string;
  success?: boolean;
  redirectUrl?: string;
}

export interface EmailVerificationState {
  email: string;
  verificationLink?: string;
  message: string;
}
