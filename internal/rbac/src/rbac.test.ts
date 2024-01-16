import { describe, expect, test } from "vitest";
import { NestedQuery, and, or } from "./queries";
import { RBAC } from "./rbac";

describe("evaluating a query", () => {
  const testCases: {
    name: string;
    query: NestedQuery;
    roles: string[];
    valid: boolean;
  }[] = [
    {
      name: "Simple role check (Pass)",
      query: "admin",
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Simple role check (Fail)",
      query: "developer",
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "'and' of two roles (Pass)",
      query: and("admin", "user"),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "'and' of two roles (Fail)",
      query: and("admin", "developer"),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "'or' of two roles (Pass)",
      query: or("admin", "developer"),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "or' of two roles (Fail)",
      query: or("developer", "guest"),
      roles: ["admin", "user", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "and' and 'or' combination (Pass)",
      query: and("admin", or("user", "guest")),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "'and' and 'or' combination (Fail)",
      query: and("admin", or("developer", "editor")),
      roles: ["user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "Deep nesting of 'and'(Pass)",
      query: and("admin", and("user", and("guest", "moderator"))),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Deep nesting of 'and' (Fail)",
      query: and("admin", and("developer", "guest")),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "Deep nesting of 'or'(Pass)",
      query: or("admin", or("user", or("guest", "moderator"))),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Deep nesting of 'or' (Fail)",
      query: or("developer", or("editor", "viewer")),
      roles: ["admin", "user", "guest", "moderator"],
      valid: false,
    },
    {
      name: "Complex combination of 'and' and 'or'(Pass)",
      query: or(and("admin", "user"), and("guest", "moderator")),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Complex combination of 'and' and 'or' (Fail)",
      query: or(and("admin", "developer"), and("editor", "viewer")),
      roles: ["admin", "user", "guest", "moderator", "viewer"],
      valid: false,
    },
    {
      name: "Multiple levels of nesting(Pass)",
      query: or(and("admin", or("user", and("guest", "moderator"))), "editor"),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Multiple levels of nesting (Fail)",
      query: or(and("admin", or("developer", and("guest", "moderator"))), "viewer"),
      roles: ["user", "guest", "moderator", "editor"],
      valid: false,
    },
    {
      name: "Complex combination of 'and' and 'or' at different levels (Pass)",
      query: or(and("admin", or("user", and("guest", "moderator"))), and("editor", "viewer")),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Complex combination of 'and' and 'or' at different levels (Fail)",
      query: or(
        and("admin", or("developer", and("guest", "moderator"))),
        and("editor", "developer"),
      ),
      roles: ["user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
    {
      name: "Deep nesting of 'and' and 'or'(Pass)",
      query: and("admin", or("user", and("guest", or("moderator", "editor")))),
      roles: ["admin", "user", "guest", "moderator", "editor", "viewer"],
      valid: true,
    },
    {
      name: "Deep nesting of 'and' and 'or' (Fail)",
      query: and("admin", or("developer", and("guest", or("moderator", "editor")))),
      roles: ["user", "guest", "moderator", "editor", "viewer"],
      valid: false,
    },
  ];

  for (const tc of testCases) {
    test(tc.name, () => {
      const res = new RBAC().evaluateRoles({ version: 1, query: tc.query }, tc.roles);
      expect(res.error).toBeUndefined();
      expect(res.value!.valid).toBe(tc.valid);
    });
  }
});
