import crypto from 'crypto';

const DEFAULT_SECRET = 'novahosting-admin-secret-key-2026';
const COOKIE_NAME = 'admin_session';

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  };
}

function getSecret(): string {
  return process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET;
}

export interface AdminSession {
  user: string;
  exp: number;
}

export function createSessionToken(username: string): string {
  const payload: AdminSession = {
    user: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(payloadB64)
      .digest('base64url');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const session = JSON.parse(payloadJson) as AdminSession;

    if (!session.exp || session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };

