import crypto from "node:crypto";

export const ADMIN_ROLES = ["support", "finance", "security", "super_admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminClaims = {
  sub: string;
  email: string;
  role: AdminRole;
  sid: string;
  iat: number;
  exp: number;
};

const AUTH_USERS: Record<string, AdminRole> = {
  "ops@annlite.org": "super_admin",
  "finance@annlite.org": "finance",
  "support@annlite.org": "support",
  "security@annlite.org": "security",
};

const getJwtSecret = () =>
  process.env.ANNLITE_JWT_SECRET ?? "annlite-local-dev-secret-change-me";

const encodeBase64Url = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url");

const decodeBase64Url = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const createSignature = (header: string, payload: string) =>
  crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");

export function createAdminToken({ sub, email, role }: { sub: string; email: string; role: AdminRole }) {
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error(`Unsupported admin role: ${role}`);
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const claims: AdminClaims = {
    sub,
    email,
    role,
    sid: crypto.randomUUID(),
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 8,
  };

  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(JSON.stringify(claims));
  const signature = createSignature(header, payload);

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string): AdminClaims {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid admin token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid admin token");
  }

  const [headerBase64, payloadBase64, signature] = parts;
  const expectedSignature = createSignature(headerBase64, payloadBase64);

  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new Error("Invalid admin token");
  }

  let payload: Partial<AdminClaims>;
  try {
    payload = JSON.parse(decodeBase64Url(payloadBase64)) as Partial<AdminClaims>;
  } catch {
    throw new Error("Invalid admin token");
  }

  if (!payload.sub || !payload.email || !payload.role || !ADMIN_ROLES.includes(payload.role as AdminRole)) {
    throw new Error("Invalid admin token");
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Admin token has expired");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role as AdminRole,
    sid: payload.sid ?? crypto.randomUUID(),
    iat: payload.iat ?? 0,
    exp: payload.exp ?? 0,
  };
}

export function authorize(token: string, allowedRoles: AdminRole[]) {
  const claims = verifyAdminToken(token);

  if (!allowedRoles.includes(claims.role)) {
    throw new Error(`Role '${claims.role}' is not allowed for this endpoint`);
  }

  return claims;
}

export function parseBearerToken(headerValue?: string | null) {
  if (!headerValue) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  return match ? match[1] : null;
}

export function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const allowedRole = AUTH_USERS[normalizedEmail];

  if (!allowedRole) {
    throw new Error("Unknown admin account");
  }

  const expectedPassword = process.env.ANNLITE_ADMIN_PASSWORD ?? "annlite-admin-dev";
  const provided = Buffer.from(password ?? "", "utf8");
  const expected = Buffer.from(expectedPassword, "utf8");

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid admin credentials");
  }

  return {
    sub: `admin:${normalizedEmail}`,
    email: normalizedEmail,
    role: allowedRole,
  };
}
