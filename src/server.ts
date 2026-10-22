import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Course } from "./course.js";
export function application() {
  const courses = new Map<string, Course>();
  return createServer(async (req, res) => {
    const send = (status: number, body: unknown) => {
      res.writeHead(status, {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      res.end(JSON.stringify(body));
    };
    if (req.method === "GET" && req.url === "/health")
      return send(200, { status: "ok" });
    if (req.method !== "POST") return send(404, { error: "Not found." });
    if (req.headers["content-type"]?.split(";")[0] !== "application/json")
      return send(415, { error: "JSON is required." });
    let raw = "";
    try {
      for await (const chunk of req) {
        raw += String(chunk);
        if (Buffer.byteLength(raw) > 4096)
          return send(413, { error: "Request too large." });
      }
      let body: unknown;
      try {
        body = JSON.parse(raw);
      } catch {
        return send(400, { error: "Invalid JSON." });
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        return send(400, { error: "JSON object required." });
      const data = body as Record<string, unknown>;
      if (req.url === "/courses") {
        if (typeof data.title !== "string" || typeof data.capacity !== "number")
          return send(400, { error: "Title and capacity are required." });
        const course = new Course(data.title, data.capacity);
        courses.set(course.id, course);
        return send(201, {
          id: course.id,
          title: course.title,
          capacity: course.capacity,
        });
      }
      const match = /^\/courses\/([a-f0-9-]+)\/enrollments$/.exec(
        req.url || "",
      );
      if (!match) return send(404, { error: "Not found." });
      const course = courses.get(match[1]!);
      if (!course) return send(404, { error: "Course not found." });
      if (typeof data.studentId !== "string")
        return send(400, { error: "Student ID required." });
      course.enroll(data.studentId);
      send(200, { id: course.id, enrolled: course.enrolled });
    } catch (error) {
      send(error instanceof RangeError ? 400 : 409, {
        error:
          error instanceof RangeError
            ? "Invalid input."
            : "Course capacity exceeded.",
      });
    }
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  application().listen(5082, "127.0.0.1", () =>
    console.log("Workflow example: http://127.0.0.1:5082"),
  );
}
