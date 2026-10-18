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
  assert.equal(DEMO_REGISTRATIONS.length, 23);
  assert.ok(DEMO_REGISTRATIONS.every((registration) => typeof registration.present === "boolean"));
});

test("calculates summary, event, and department attendance from source records", () => {
  const report = calculateCoordinatorReport(DEMO_EVENTS, DEMO_REGISTRATIONS);
  assert.deepEqual(report.summary, {
    totalEvents: 3,
    registeredStudents: 23,
    presentStudents: 17,
    attendancePercentage: 73.91,
  });
  assert.deepEqual(
    report.events.map(({ name, registeredStudents, presentStudents, attendancePercentage }) => ({
      name,
      registeredStudents,
      presentStudents,
      attendancePercentage,
    })),
    [
      { name: "New Student Orientation", registeredStudents: 8, presentStudents: 6, attendancePercentage: 75 },
      { name: "Campus Innovation Fair", registeredStudents: 8, presentStudents: 6, attendancePercentage: 75 },
      { name: "Cultural Night", registeredStudents: 7, presentStudents: 5, attendancePercentage: 71.43 },
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
      { name: "CSE", registeredStudents: 2, presentStudents: 2, attendancePercentage: 100 },
      { name: "AIML", registeredStudents: 3, presentStudents: 3, attendancePercentage: 100 },
      { name: "CST", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
      { name: "ECE", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
      { name: "EEE", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
      { name: "MECH", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
      { name: "CIVIL", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
      { name: "IT", registeredStudents: 3, presentStudents: 2, attendancePercentage: 66.67 },
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

test("filters demo event and department reports by selected id", () => {
  const report = calculateCoordinatorReport(DEMO_EVENTS, DEMO_REGISTRATIONS);
  assert.deepEqual(filterRows(report.events, "innovation-fair-2026"), [report.events[1]]);
  assert.deepEqual(filterRows(report.departments, "AIML"), [report.departments[1]]);
  assert.deepEqual(filterRows(report.events, ""), report.events);
  assert.deepEqual(filterRows(report.departments, ""), report.departments);
});

test("creates a CSV containing current demo event and department report rows", () => {
  const report = calculateCoordinatorReport(DEMO_EVENTS, DEMO_REGISTRATIONS);
  const csv = createAttendanceCsv(report.events, report.departments);
  assert.equal(
    csv,
    [
      '"report_type","name","registered_students","present_students","attendance_percentage"',
      '"event","New Student Orientation","8","6","75"',
      '"event","Campus Innovation Fair","8","6","75"',
      '"event","Cultural Night","7","5","71.43"',
      '"department","CSE","2","2","100"',
      '"department","AIML","3","3","100"',
      '"department","CST","3","2","66.67"',
      '"department","ECE","3","2","66.67"',
      '"department","EEE","3","2","66.67"',
      '"department","MECH","3","2","66.67"',
      '"department","CIVIL","3","2","66.67"',
      '"department","IT","3","2","66.67"',
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
