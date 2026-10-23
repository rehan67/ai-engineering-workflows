import { test } from "node:test";
import assert from "node:assert/strict";
import { Course } from "../src/course.js";
import { application } from "../src/server.js";
import { request } from "node:http";
const student = "11111111-1111-4111-8111-111111111111";

test("HTTP preserves Unicode when a UTF-8 character crosses body chunks", async () => {
  const server = application();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const title = "Architecture 🚀";
  const bytes = Buffer.from(JSON.stringify({ title, capacity: 1 }));
  const split = bytes.indexOf(Buffer.from("🚀")) + 1;
  try {
    const result = await new Promise<{
      status: number | undefined;
      title: string;
    }>((resolve, reject) => {
      const req = request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path: "/courses",
          method: "POST",
          headers: { "content-type": "application/json" },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            try {
              resolve({
                status: res.statusCode,
                title: JSON.parse(Buffer.concat(chunks).toString("utf8")).title,
              });
            } catch (error) {
              reject(error);
            }
          });
          res.on("error", reject);
        },
      );
      req.on("error", reject);
      req.write(bytes.subarray(0, split));
      setTimeout(() => req.end(bytes.subarray(split)), 30);
    });
    assert.equal(result.status, 201);
    assert.equal(result.title, title);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
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
