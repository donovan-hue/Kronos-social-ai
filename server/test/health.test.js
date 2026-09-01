const test = require("node:test");
const assert = require("node:assert");

test("health check básico", async () => {
  const response = await fetch("http://localhost:5000/health");

  assert.strictEqual(response.status, 200);

  const data = await response.json();

  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.service, "kronos-social-ai");
});
