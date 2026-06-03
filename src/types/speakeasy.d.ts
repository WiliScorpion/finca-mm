declare module 'speakeasy' {
  export function generateSecret(options: {
    name: string;
    issuer: string;
    length?: number;
  }): {
    secret: string;
    ascii: string;
    hex: string;
    base32: string;
    qr_code_ascii: string;
    qr_code_ascii_unicode: string;
    google_auth_qr: string;
    otpauth_url: string;
  };

  namespace totp {
    function verify(options: {
      secret: string;
      encoding: string;
      token: string;
      window?: number;
    }): boolean | null;
  }

  export const totp: {
    verify: (options: {
      secret: string;
      encoding: string;
      token: string;
      window?: number;
    }) => boolean | null;
  };
}
