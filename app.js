const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const defaultEmployees = [
  {
    id: "tw-001",
    name: "Amina Mwangi",
    role: "Frontend Engineer",
    department: "Product",
    basicSalary: 4200,
    allowances: 550,
    overtime: 180,
    bonus: 300,
    tax: 760,
    benefits: 230,
    paid: true,
  },
  {
    id: "tw-002",
    name: "Brian Okello",
    role: "Backend Engineer",
    department: "Platform",
    basicSalary: 4700,
    allowances: 600,
    overtime: 120,
    bonus: 250,
    tax: 830,
    benefits: 260,
    paid: false,
  },
  {
    id: "tw-003",
    name: "Grace Njeri",
    role: "UX Designer",
    department: "Design",
    basicSalary: 3800,
    allowances: 420,
    overtime: 90,
    bonus: 200,
    tax: 620,
    benefits: 210,
    paid: true,
  },
  {
    id: "tw-004",
    name: "David Kimani",
    role: "QA Analyst",
    department: "Quality",
    basicSalary: 3200,
    allowances: 360,
    overtime: 160,
    bonus: 150,
    tax: 510,
    benefits: 180,
    paid: false,
  },
];

const storageKey = "techwiz-payroll-employees";
const savedEmployees = JSON.parse(localStorage.getItem(storageKey) || "null");
let employees = Array.isArray(savedEmployees) ? savedEmployees : defaultEmployees;
let selectedEmployeeId = employees[0]?.id;

const elements = {
  employeeRows: document.querySelector("#employeeRows"),
  employeeSelect: document.querySelector("#employeeSelect"),
  employeeSearch: document.querySelector("#employeeSearch"),
  payPeriod: document.querySelector("#payPeriod"),
  basicSalary: document.querySelector("#basicSalary"),
  allowances: document.querySelector("#allowances"),
  overtime: document.querySelector("#overtime"),
  bonus: document.querySelector("#bonus"),
  tax: document.querySelector("#tax"),
  benefits: document.querySelector("#benefits"),
  paidStatus: document.querySelector("#paidStatus"),
  calculator: document.querySelector("#calculator"),
  exportCsv: document.querySelector("#exportCsv"),
  printPayslip: document.querySelector("#printPayslip"),
  metricPayroll: document.querySelector("#metricPayroll"),
  metricNet: document.querySelector("#metricNet"),
  metricEmployees: document.querySelector("#metricEmployees"),
  metricDeductions: document.querySelector("#metricDeductions"),
  payslipName: document.querySelector("#payslipName"),
  payslipRole: document.querySelector("#payslipRole"),
  payslipDepartment: document.querySelector("#payslipDepartment"),
  payslipGross: document.querySelector("#payslipGross"),
  payslipDeductions: document.querySelector("#payslipDeductions"),
  payslipNet: document.querySelector("#payslipNet"),
  paidBadge: document.querySelector("#paidBadge"),
};

function calculatePay(employee) {
  const gross = Number(employee.basicSalary) + Number(employee.allowances) + Number(employee.overtime) + Number(employee.bonus);
  const deductions = Number(employee.tax) + Number(employee.benefits);
  return {
    gross,
    deductions,
    net: gross - deductions,
  };
}

function persistEmployees() {
  localStorage.setItem(storageKey, JSON.stringify(employees));
}

function setCurrentMonth() {
  const now = new Date();
  elements.payPeriod.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getSelectedEmployee() {
  return employees.find((employee) => employee.id === selectedEmployeeId) || employees[0];
}

function renderEmployeeOptions() {
  elements.employeeSelect.innerHTML = employees
    .map((employee) => `<option value="${employee.id}">${employee.name}</option>`)
    .join("");
  elements.employeeSelect.value = selectedEmployeeId;
}

function renderEmployees() {
  const query = elements.employeeSearch.value.trim().toLowerCase();
  const visibleEmployees = employees.filter((employee) => {
    const record = `${employee.name} ${employee.role} ${employee.department}`.toLowerCase();
    return record.includes(query);
  });

  elements.employeeRows.innerHTML = visibleEmployees
    .map((employee) => {
      const pay = calculatePay(employee);
      const selectedClass = employee.id === selectedEmployeeId ? " class=\"selected\"" : "";
      return `
        <tr data-id="${employee.id}"${selectedClass}>
          <td><strong>${employee.name}</strong></td>
          <td>${employee.role}</td>
          <td>${employee.department}</td>
          <td>${currency.format(pay.gross)}</td>
          <td>${currency.format(pay.net)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderMetrics() {
  const totals = employees.reduce(
    (summary, employee) => {
      const pay = calculatePay(employee);
      summary.gross += pay.gross;
      summary.net += pay.net;
      summary.deductions += pay.deductions;
      return summary;
    },
    { gross: 0, net: 0, deductions: 0 },
  );

  elements.metricPayroll.textContent = currency.format(totals.gross);
  elements.metricNet.textContent = currency.format(totals.net);
  elements.metricDeductions.textContent = currency.format(totals.deductions);
  elements.metricEmployees.textContent = String(employees.length);
}

function renderCalculator(employee) {
  elements.employeeSelect.value = employee.id;
  elements.basicSalary.value = employee.basicSalary;
  elements.allowances.value = employee.allowances;
  elements.overtime.value = employee.overtime;
  elements.bonus.value = employee.bonus;
  elements.tax.value = employee.tax;
  elements.benefits.value = employee.benefits;
  elements.paidStatus.checked = Boolean(employee.paid);
}

function renderPayslip(employee) {
  const pay = calculatePay(employee);
  elements.payslipName.textContent = employee.name;
  elements.payslipRole.textContent = employee.role;
  elements.payslipDepartment.textContent = employee.department;
  elements.payslipGross.textContent = currency.format(pay.gross);
  elements.payslipDeductions.textContent = currency.format(pay.deductions);
  elements.payslipNet.textContent = currency.format(pay.net);
  elements.paidBadge.textContent = employee.paid ? "Paid" : "Pending";
  elements.paidBadge.classList.toggle("paid", Boolean(employee.paid));
}

function render() {
  const selectedEmployee = getSelectedEmployee();
  selectedEmployeeId = selectedEmployee.id;
  renderEmployeeOptions();
  renderEmployees();
  renderMetrics();
  renderCalculator(selectedEmployee);
  renderPayslip(selectedEmployee);
}

function updateSelectedEmployee() {
  const employeeIndex = employees.findIndex((employee) => employee.id === selectedEmployeeId);
  if (employeeIndex === -1) return;

  employees[employeeIndex] = {
    ...employees[employeeIndex],
    basicSalary: Number(elements.basicSalary.value || 0),
    allowances: Number(elements.allowances.value || 0),
    overtime: Number(elements.overtime.value || 0),
    bonus: Number(elements.bonus.value || 0),
    tax: Number(elements.tax.value || 0),
    benefits: Number(elements.benefits.value || 0),
    paid: elements.paidStatus.checked,
  };

  persistEmployees();
  render();
}

function exportPayrollCsv() {
  const headings = ["Pay Period", "Employee ID", "Name", "Role", "Department", "Gross Pay", "Deductions", "Net Pay", "Status"];
  const rows = employees.map((employee) => {
    const pay = calculatePay(employee);
    return [
      elements.payPeriod.value,
      employee.id,
      employee.name,
      employee.role,
      employee.department,
      pay.gross,
      pay.deductions,
      pay.net,
      employee.paid ? "Paid" : "Pending",
    ];
  });

  const csv = [headings, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `techwiz-payroll-${elements.payPeriod.value || "period"}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.employeeRows.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;
  selectedEmployeeId = row.dataset.id;
  render();
});

elements.employeeSelect.addEventListener("change", (event) => {
  selectedEmployeeId = event.target.value;
  render();
});

elements.employeeSearch.addEventListener("input", renderEmployees);

elements.calculator.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSelectedEmployee();
});

elements.exportCsv.addEventListener("click", exportPayrollCsv);
elements.printPayslip.addEventListener("click", () => window.print());

setCurrentMonth();
render();
