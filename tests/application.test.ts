import { test } from "node:test";
import assert from "node:assert/strict";
import { Course } from "../src/course.js";
import { application } from "../src/server.js";
const student = "11111111-1111-4111-8111-111111111111";
test("course capacity and replay invariants", () => {
  const course = new Course("Architecture", 1);
  course.enroll(student);
  course.enroll(student.toUpperCase());
  assert.equal(course.enrolled, 1);
  assert.throws(() => course.enroll("22222222-2222-4222-8222-222222222222"));
  assert.throws(() => new Course("", 1));
  assert.throws(() => new Course("X", 1.5));
  assert.throws(() => course.enroll("bad"));
});
test("HTTP business flow and bounded validation", async () => {
  const server = application();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const base = "http://127.0.0.1:" + address.port;
  const post = (url: string, body: unknown) =>
    fetch(base + url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  try {
    const created = await post("/courses", {
      title: "Architecture",
      capacity: 1,
    });
    assert.equal(created.status, 201);
    const course = (await created.json()) as { id: string };
    const route = "/courses/" + course.id + "/enrollments";
    assert.equal((await post(route, { studentId: student })).status, 200);
    assert.equal((await post(route, { studentId: student })).status, 200);
    assert.equal(
      (await post(route, { studentId: "22222222-2222-4222-8222-222222222222" }))
        .status,
      409,
    );
    assert.equal((await post("/courses", null)).status, 400);
    assert.equal(
      (await post("/courses", { title: "X".repeat(5000), capacity: 1 })).status,
      413,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
