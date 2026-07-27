const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");

const { app } = require("../index");

test("health endpoint reports a disconnected database", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));

  await once(server, "listening");

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.deepEqual(body, {
    status: "unavailable",
    database: "disconnected",
  });
});
