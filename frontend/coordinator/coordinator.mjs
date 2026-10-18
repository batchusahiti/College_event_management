import { DEMO_EVENTS, DEMO_REGISTRATIONS } from "./coordinator-demo-data.mjs";

const requiredSummaryMetrics = [
  "totalEvents",
  "registeredStudents",
  "presentStudents",
  "attendancePercentage",
];

function isCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isPercentage(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function percentage(present, registered) {
  return registered === 0 ? 0 : Math.round((present / registered) * 10000) / 100;
}

function validateSourceData(events, registrations) {
  if (!Array.isArray(events) || !Array.isArray(registrations)) {
    throw new TypeError("Events and registrations must both be arrays.");
  }

  const eventIds = new Set();
  for (const [index, event] of events.entries()) {
    if (
      event === null ||
      typeof event !== "object" ||
      typeof event.id !== "string" ||
      event.id.trim() === "" ||
      typeof event.name !== "string" ||
      event.name.trim() === "" ||
      eventIds.has(event.id)
    ) {
      throw new TypeError(`Events contain an invalid or duplicate entry at index ${index}.`);
    }
    eventIds.add(event.id);
  }

  const registrationKeys = new Set();
  for (const [index, registration] of registrations.entries()) {
    if (
      registration === null ||
      typeof registration !== "object" ||
      !eventIds.has(registration.eventId) ||
      typeof registration.studentId !== "string" ||
      registration.studentId.trim() === "" ||
      typeof registration.department !== "string" ||
      registration.department.trim() === "" ||
      typeof registration.present !== "boolean"
    ) {
      throw new TypeError(`Registrations contain an invalid entry at index ${index}.`);
    }

    const key = `${registration.eventId}\u0000${registration.studentId}`;
    if (registrationKeys.has(key)) {
      throw new TypeError(`Registrations contain a duplicate student for an event at index ${index}.`);
    }
    registrationKeys.add(key);
  }
}

export function calculateCoordinatorReport(events, registrations) {
  validateSourceData(events, registrations);

  const eventCounts = new Map(
    events.map((event) => [event.id, { id: event.id, name: event.name, registeredStudents: 0, presentStudents: 0 }]),
  );
  const departmentCounts = new Map();

  for (const registration of registrations) {
    const event = eventCounts.get(registration.eventId);
    event.registeredStudents += 1;
    if (registration.present) {
      event.presentStudents += 1;
    }

    if (!departmentCounts.has(registration.department)) {
      departmentCounts.set(registration.department, {
        id: registration.department,
        name: registration.department,
        registeredStudents: 0,
        presentStudents: 0,
      });
    }
    const department = departmentCounts.get(registration.department);
    department.registeredStudents += 1;
    if (registration.present) {
      department.presentStudents += 1;
    }
  }

  const eventRows = [...eventCounts.values()].map((event) => ({
    ...event,
    attendancePercentage: percentage(event.presentStudents, event.registeredStudents),
  }));
  const departmentRows = [...departmentCounts.values()].map((department) => ({
    ...department,
    attendancePercentage: percentage(department.presentStudents, department.registeredStudents),
  }));
  const presentStudents = registrations.filter((registration) => registration.present).length;

  return {
    summary: {
      totalEvents: events.length,
      registeredStudents: registrations.length,
      presentStudents,
      attendancePercentage: percentage(presentStudents, registrations.length),
    },
    events: eventRows,
    departments: departmentRows,
  };
}

function validateRows(rows, label) {
  if (!Array.isArray(rows)) {
    throw new TypeError(`Coordinator report "${label}" must be an array.`);
  }

  for (const [index, row] of rows.entries()) {
    if (
      row === null ||
      typeof row !== "object" ||
      typeof row.id !== "string" ||
      typeof row.name !== "string" ||
      !isCount(row.registeredStudents) ||
      !isCount(row.presentStudents) ||
      row.presentStudents > row.registeredStudents ||
      !isPercentage(row.attendancePercentage)
    ) {
      throw new TypeError(`Coordinator report "${label}" has an invalid row at index ${index}.`);
    }
  }
}

export function validateCoordinatorReport(report) {
  if (report === null || typeof report !== "object" || report.summary === null || typeof report.summary !== "object") {
    throw new TypeError("Coordinator report must include summary, events, and departments.");
  }

  for (const metric of requiredSummaryMetrics) {
    const valid = metric === "attendancePercentage"
      ? isPercentage(report.summary[metric])
      : isCount(report.summary[metric]);
    if (!valid) {
      throw new TypeError(`Coordinator report summary "${metric}" has an invalid value.`);
    }
  }

  validateRows(report.events, "events");
  validateRows(report.departments, "departments");
  return report;
}

export function filterRows(rows, selectedId) {
  return selectedId ? rows.filter((row) => row.id === selectedId) : rows;
}

function csvCell(value) {
  let text = String(value ?? "");
  if (typeof value === "string" && /^[\s]*[=+\-@]/.test(value)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function createAttendanceCsv(events, departments) {
  const rows = [
    ["report_type", "name", "registered_students", "present_students", "attendance_percentage"],
    ...events.map((event) => [
      "event",
      event.name,
      event.registeredStudents,
      event.presentStudents,
      event.attendancePercentage,
    ]),
    ...departments.map((department) => [
      "department",
      department.name,
      department.registeredStudents,
      department.presentStudents,
      department.attendancePercentage,
    ]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function formatPercentage(value) {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`;
}

function renderTable(body, rows, emptyMessage) {
  body.replaceChildren();
  if (rows.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "table-message";
    cell.colSpan = 4;
    cell.textContent = emptyMessage;
    row.append(cell);
    body.append(row);
    return;
  }

  for (const item of rows) {
    const row = document.createElement("tr");
    for (const value of [
      item.name,
      formatNumber(item.registeredStudents),
      formatNumber(item.presentStudents),
      formatPercentage(item.attendancePercentage),
    ]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }
    body.append(row);
  }
}

function populateFilter(select, rows, allLabel) {
  select.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = allLabel;
  select.append(allOption);

  for (const item of rows) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.append(option);
  }
  select.disabled = false;
}

function initializeDashboard() {
  const status = document.querySelector("#page-status");
  const dataSource = document.querySelector("#data-source");
  const eventFilter = document.querySelector("#event-filter");
  const departmentFilter = document.querySelector("#department-filter");
  const eventBody = document.querySelector("#event-report");
  const departmentBody = document.querySelector("#department-report");
  const downloadButton = document.querySelector("#download-csv");
  let report;

  const renderReports = () => {
    renderTable(
      eventBody,
      filterRows(report.events, eventFilter.value),
      "No event attendance matches this filter.",
    );
    renderTable(
      departmentBody,
      filterRows(report.departments, departmentFilter.value),
      "No department attendance matches this filter.",
    );
  };

  eventFilter.addEventListener("change", renderReports);
  departmentFilter.addEventListener("change", renderReports);
  downloadButton.addEventListener("click", () => {
    const csv = createAttendanceCsv(
      filterRows(report.events, eventFilter.value),
      filterRows(report.departments, departmentFilter.value),
    );
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "coordinator-attendance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  const api = window.coordinatorReportsApi;
  const useApi = api && typeof api.loadReport === "function";
  dataSource.hidden = Boolean(useApi);

  status.textContent = "Loading attendance reports…";
  Promise.resolve()
    .then(() =>
      useApi
        ? api.loadReport()
        : calculateCoordinatorReport(DEMO_EVENTS, DEMO_REGISTRATIONS),
    )
    .then((data) => {
      report = validateCoordinatorReport(data);
      for (const metric of requiredSummaryMetrics) {
        const value = report.summary[metric];
        const card = document.querySelector(`[data-metric="${metric}"] .metric-value`);
        card.textContent = metric === "attendancePercentage" ? formatPercentage(value) : formatNumber(value);
      }

      populateFilter(eventFilter, report.events, "All events");
      populateFilter(departmentFilter, report.departments, "All departments");
      renderReports();
      downloadButton.disabled = report.events.length + report.departments.length === 0;
      status.hidden = true;
    })
    .catch((error) => {
      status.dataset.state = "error";
      const reason = error instanceof Error ? error.message : String(error);
      status.textContent = `Unable to load attendance reports: ${reason}`;
      downloadButton.disabled = true;
      eventBody.querySelector(".table-message").textContent = "Event attendance could not be loaded.";
      departmentBody.querySelector(".table-message").textContent = "Department attendance could not be loaded.";
    });
}

if (typeof document !== "undefined") {
  initializeDashboard();
}
