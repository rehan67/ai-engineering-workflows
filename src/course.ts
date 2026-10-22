import { randomUUID } from "node:crypto";
export class Course {
  readonly id = randomUUID();
  private readonly students = new Set<string>();
  constructor(
    readonly title: string,
    readonly capacity: number,
  ) {
    if (
      !title.trim() ||
      title.length > 120 ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 1000
    )
      throw new RangeError("Invalid course.");
  }
  enroll(studentId: string) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        studentId,
      )
    )
      throw new RangeError("Invalid student ID.");
    const key = studentId.toLowerCase();
    if (this.students.has(key)) return;
    if (this.students.size >= this.capacity) throw new Error("Course is full.");
    this.students.add(key);
  }
  get enrolled() {
    return this.students.size;
  }
}
