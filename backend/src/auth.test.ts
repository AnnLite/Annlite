import test from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_ROLES,
  authorize,
  createAdminToken,
  verifyAdminToken,
} from "./auth.js";

test("creates a valid token with the requested role and session metadata", () => {
  const token = createAdminToken({
    sub: "admin-123",
    email: "ops@annlite.org",
    role: "super_admin",
  });

  assert.ok(token.length > 80, "token should be non-empty and signed");

  const payload = verifyAdminToken(token);
  assert.equal(payload.sub, "admin-123");
  assert.equal(payload.email, "ops@annlite.org");
  assert.equal(payload.role, "super_admin");
  assert.ok(ADMIN_ROLES.includes(payload.role));
});

test("authorizes users by exact role and denies forbidden roles", () => {
  const token = createAdminToken({
    sub: "support-7",
    email: "support@annlite.org",
    role: "support",
  });

  assert.doesNotThrow(() => authorize(token, ["support"]));
  assert.throws(() => authorize(token, ["super_admin"]), /role/i);
  assert.throws(() => authorize("not-a-token", ["support"]), /token|invalid/i);
});
