import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCoordinatorReport,
  createAttendanceCsv,
  filterRows,
  validateCoordinatorReport,
} from "./coordinator.mjs";
import { DEMO_EVENTS, DEMO_REGISTRATIONS } from "./coordinator-demo-data.mjs";

const sampleReport = {
  summary: {
    totalEvents: 2,
    registeredStudents: 120,
    presentStudents: 90,
    attendancePercentage: 75,
  },
  events: [
    {
      id: "orientation",
      name: "Orientation",
      registeredStudents: 80,
      presentStudents: 64,
      attendancePercentage: 80,
    },
    {
      id: "fair",
      name: "Clubs Fair",
      registeredStudents: 40,
      presentStudents: 26,
      attendancePercentage: 65,
    },
  ],
  departments: [
    {
      id: "engineering",
      name: "Engineering",
      registeredStudents: 70,
      presentStudents: 56,
      attendancePercentage: 80,
    },
  ],
};

test("accepts a complete coordinator report", () => {
  assert.equal(validateCoordinatorReport(sampleReport), sampleReport);
});

test("demo data contains realistic events and registrations", () => {
  assert.equal(DEMO_EVENTS.length, 3);
  assert.equal(DEMO_REGISTRATIONS.length, 15);
  assert.ok(DEMO_REGISTRATIONS.every((registration) => typeof registration.present === "boolean"));
});

test("calculates summary, event, and department attendance from source records", () => {
  const report = calculateCoordinatorReport(DEMO_EVENTS, DEMO_REGISTRATIONS);
  assert.deepEqual(report.summary, {
    totalEvents: 3,
    registeredStudents: 15,
    presentStudents: 12,
    attendancePercentage: 80,
  });
  assert.deepEqual(
    report.events.map(({ name, registeredStudents, presentStudents, attendancePercentage }) => ({
      name,
      registeredStudents,
      presentStudents,
      attendancePercentage,
    })),
    [
      { name: "New Student Orientation", registeredStudents: 6, presentStudents: 5, attendancePercentage: 83.33 },
      { name: "Campus Innovation Fair", registeredStudents: 5, presentStudents: 4, attendancePercentage: 80 },
      { name: "Cultural Night", registeredStudents: 4, presentStudents: 3, attendancePercentage: 75 },
    ],
  );
  assert.deepEqual(
    report.departments.map(({ name, registeredStudents, presentStudents, attendancePercentage }) => ({
      name,
      registeredStudents,
      presentStudents,
      attendancePercentage,
    })),
    [
      { name: "Computer Science", registeredStudents: 5, presentStudents: 5, attendancePercentage: 100 },
      { name: "Engineering", registeredStudents: 4, presentStudents: 2, attendancePercentage: 50 },
      { name: "Business", registeredStudents: 3, presentStudents: 3, attendancePercentage: 100 },
      { name: "Arts and Humanities", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
    ],
  );
});

test("calculates empty report data with zero attendance and keeps events visible", () => {
  const report = calculateCoordinatorReport([{ id: "quiet-event", name: "Quiet Event" }], []);
  assert.deepEqual(report.summary, {
    totalEvents: 1,
    registeredStudents: 0,
    presentStudents: 0,
    attendancePercentage: 0,
  });
  assert.deepEqual(report.events, [{
    id: "quiet-event",
    name: "Quiet Event",
    registeredStudents: 0,
    presentStudents: 0,
    attendancePercentage: 0,
  }]);
  assert.deepEqual(report.departments, []);
});

test("rejects missing summary metrics and invalid report rows", () => {
  assert.throws(
    () => validateCoordinatorReport({ ...sampleReport, summary: { totalEvents: 2 } }),
    /invalid value/,
  );
  assert.throws(
    () => validateCoordinatorReport({ ...sampleReport, events: [{ id: "bad", name: "Bad" }] }),
    /invalid row/,
  );
  assert.throws(
    () =>
      validateCoordinatorReport({
        ...sampleReport,
        departments: [{
          ...sampleReport.departments[0],
          attendancePercentage: 101,
        }],
      }),
    /invalid row/,
  );
});

test("rejects missing or invalid source data and duplicate event registrations", () => {
  assert.throws(() => calculateCoordinatorReport(undefined, []), /both be arrays/);
  assert.throws(() => calculateCoordinatorReport([{ id: "e", name: "Event" }], [{ eventId: "missing", studentId: "s", department: "CS", present: true }]), /invalid entry/);
  assert.throws(
    () =>
      calculateCoordinatorReport(
        [{ id: "e", name: "Event" }],
        [
          { eventId: "e", studentId: "s", department: "CS", present: true },
          { eventId: "e", studentId: "s", department: "CS", present: false },
        ],
      ),
    /duplicate student/,
  );
});

test("filters a report by selected id and leaves all rows for an empty filter", () => {
  assert.deepEqual(filterRows(sampleReport.events, "fair"), [sampleReport.events[1]]);
  assert.deepEqual(filterRows(sampleReport.events, ""), sampleReport.events);
});

test("creates a CSV containing the event and department report rows", () => {
  const csv = createAttendanceCsv(sampleReport.events, sampleReport.departments);
  assert.equal(
    csv,
    [
      '"report_type","name","registered_students","present_students","attendance_percentage"',
      '"event","Orientation","80","64","80"',
      '"event","Clubs Fair","40","26","65"',
      '"department","Engineering","70","56","80"',
    ].join("\r\n"),
  );
});

test("escapes CSV quotes and neutralizes formula-like report names", () => {
  const csv = createAttendanceCsv(
    [{ id: "bad", name: '=HYPERLINK("https://example.test")', registeredStudents: 1, presentStudents: 1, attendancePercentage: 100 }],
    [],
  );
  assert.equal(
    csv.split("\r\n")[1],
    '"event","\'=HYPERLINK(""https://example.test"")","1","1","100"',
  );
});
