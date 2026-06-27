const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const adminCredentials = {
  username: "admin",
  password: "techwiz123",
};

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
const sessionKey = "techwiz-payroll-authenticated";
const savedEmployees = JSON.parse(localStorage.getItem(storageKey) || "null");
let employees = Array.isArray(savedEmployees) ? savedEmployees : defaultEmployees;
let selectedEmployeeId = employees[0]?.id || null;

const elements = {
  appShell: document.querySelector(".app-shell"),
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  logoutButton: document.querySelector("#logoutButton"),
  employeeRows: document.querySelector("#employeeRows"),
  employeeSelect: document.querySelector("#employeeSelect"),
  employeeSearch: document.querySelector("#employeeSearch"),
  employeeForm: document.querySelector("#employeeForm"),
  departmentSummary: document.querySelector("#departmentSummary"),
  payPeriod: document.querySelector("#payPeriod"),
  basicSalary: document.querySelector("#basicSalary"),
  allowances: document.querySelector("#allowances"),
  overtime: document.querySelector("#overtime"),
  bonus: document.querySelector("#bonus"),
  tax: document.querySelector("#tax"),
  benefits: document.querySelector("#benefits"),
  paidStatus: document.querySelector("#paidStatus"),
  calculator: document.querySelector("#calculator"),
  deleteEmployee: document.querySelector("#deleteEmployee"),
  exportCsv: document.querySelector("#exportCsv"),
  resetData: document.querySelector("#resetData"),
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
  payslipBreakdown: document.querySelector("#payslipBreakdown"),
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
  return employees.find((employee) => employee.id === selectedEmployeeId) || employees[0] || null;
}

function setAuthState(isAuthenticated) {
  sessionStorage.setItem(sessionKey, String(isAuthenticated));
  elements.loginScreen.classList.toggle("hidden", isAuthenticated);
  elements.appShell.classList.toggle("locked", !isAuthenticated);
  if (isAuthenticated) {
    elements.loginError.textContent = "";
    render();
  }
}

function createEmployeeId() {
  const nextNumber = employees.length + 1;
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `tw-${String(nextNumber).padStart(3, "0")}-${randomPart}`;
}

function renderEmployeeOptions() {
  if (!employees.length) {
    elements.employeeSelect.innerHTML = "<option>No employees</option>";
    elements.employeeSelect.disabled = true;
    return;
  }

  elements.employeeSelect.disabled = false;
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

  if (!visibleEmployees.length) {
    elements.employeeRows.innerHTML = `
      <tr>
        <td colspan="7" class="empty-cell">No employees found.</td>
      </tr>
    `;
    return;
  }

  elements.employeeRows.innerHTML = visibleEmployees
    .map((employee) => {
      const pay = calculatePay(employee);
      const selectedClass = employee.id === selectedEmployeeId ? " class=\"selected\"" : "";
      const statusClass = employee.paid ? "paid" : "";
      return `
        <tr data-id="${employee.id}"${selectedClass}>
          <td><strong>${employee.name}</strong><small>${employee.id}</small></td>
          <td>${employee.role}</td>
          <td>${employee.department}</td>
          <td>${currency.format(pay.gross)}</td>
          <td>${currency.format(pay.net)}</td>
          <td><span class="status-badge ${statusClass}">${employee.paid ? "Paid" : "Pending"}</span></td>
          <td><button class="row-action" type="button" data-edit="${employee.id}">Edit</button></td>
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

function renderDepartmentSummary() {
  const departments = employees.reduce((summary, employee) => {
    const pay = calculatePay(employee);
    if (!summary[employee.department]) {
      summary[employee.department] = { employees: 0, net: 0 };
    }
    summary[employee.department].employees += 1;
    summary[employee.department].net += pay.net;
    return summary;
  }, {});

  elements.departmentSummary.innerHTML = Object.entries(departments)
    .map(([department, summary]) => `
      <article class="department-card">
        <span>${department}</span>
        <strong>${currency.format(summary.net)}</strong>
        <small>${summary.employees} employee${summary.employees === 1 ? "" : "s"}</small>
      </article>
    `)
    .join("");
}

function clearPayrollFields() {
  elements.basicSalary.value = "";
  elements.allowances.value = "";
  elements.overtime.value = "";
  elements.bonus.value = "";
  elements.tax.value = "";
  elements.benefits.value = "";
  elements.paidStatus.checked = false;
}

function renderCalculator(employee) {
  if (!employee) {
    clearPayrollFields();
    elements.calculator.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = true;
    });
    return;
  }

  elements.calculator.querySelectorAll("input, select, button").forEach((control) => {
    control.disabled = false;
  });
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
  if (!employee) {
    elements.payslipName.textContent = "No employee selected";
    elements.payslipRole.textContent = "-";
    elements.payslipDepartment.textContent = "-";
    elements.payslipGross.textContent = currency.format(0);
    elements.payslipDeductions.textContent = currency.format(0);
    elements.payslipBreakdown.textContent = currency.format(0);
    elements.payslipNet.textContent = currency.format(0);
    elements.paidBadge.textContent = "Pending";
    elements.paidBadge.classList.remove("paid");
    return;
  }

  const pay = calculatePay(employee);
  elements.payslipName.textContent = employee.name;
  elements.payslipRole.textContent = employee.role;
  elements.payslipDepartment.textContent = employee.department;
  elements.payslipGross.textContent = currency.format(pay.gross);
  elements.payslipDeductions.textContent = currency.format(pay.deductions);
  elements.payslipBreakdown.textContent = `${currency.format(employee.tax)} + ${currency.format(employee.benefits)}`;
  elements.payslipNet.textContent = currency.format(pay.net);
  elements.paidBadge.textContent = employee.paid ? "Paid" : "Pending";
  elements.paidBadge.classList.toggle("paid", Boolean(employee.paid));
}

function render() {
  const selectedEmployee = getSelectedEmployee();
  selectedEmployeeId = selectedEmployee?.id || null;
  renderEmployeeOptions();
  renderEmployees();
  renderMetrics();
  renderDepartmentSummary();
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

function addEmployee() {
  const formData = new FormData(elements.employeeForm);
  const employee = {
    id: createEmployeeId(),
    name: elements.employeeForm.querySelector("#newName").value.trim(),
    role: elements.employeeForm.querySelector("#newRole").value.trim(),
    department: elements.employeeForm.querySelector("#newDepartment").value.trim(),
    basicSalary: Number(formData.get("newBasicSalary") || elements.employeeForm.querySelector("#newBasicSalary").value || 0),
    allowances: Number(elements.employeeForm.querySelector("#newAllowances").value || 0),
    overtime: Number(elements.employeeForm.querySelector("#newOvertime").value || 0),
    bonus: Number(elements.employeeForm.querySelector("#newBonus").value || 0),
    tax: Number(elements.employeeForm.querySelector("#newTax").value || 0),
    benefits: Number(elements.employeeForm.querySelector("#newBenefits").value || 0),
    paid: false,
  };

  employees.push(employee);
  selectedEmployeeId = employee.id;
  persistEmployees();
  elements.employeeForm.reset();
  render();
  document.querySelector("#calculator").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteSelectedEmployee() {
  const selectedEmployee = getSelectedEmployee();
  if (!selectedEmployee) return;
  const confirmed = window.confirm(`Delete ${selectedEmployee.name} from payroll?`);
  if (!confirmed) return;

  employees = employees.filter((employee) => employee.id !== selectedEmployee.id);
  selectedEmployeeId = employees[0]?.id || null;
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

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    setAuthState(true);
    return;
  }

  elements.loginError.textContent = "Incorrect admin username or password.";
});

elements.logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(sessionKey);
  setAuthState(false);
  elements.loginPassword.value = "";
});

elements.employeeRows.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-edit]");
  const row = event.target.closest("tr[data-id]");
  if (!row) return;

  selectedEmployeeId = actionButton?.dataset.edit || row.dataset.id;
  render();

  if (actionButton) {
    document.querySelector("#calculator").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

elements.employeeSelect.addEventListener("change", (event) => {
  selectedEmployeeId = event.target.value;
  render();
});

elements.employeeSearch.addEventListener("input", renderEmployees);

elements.employeeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addEmployee();
});

elements.calculator.addEventListener("submit", (event) => {
  event.preventDefault();
  updateSelectedEmployee();
});

elements.deleteEmployee.addEventListener("click", deleteSelectedEmployee);
elements.exportCsv.addEventListener("click", exportPayrollCsv);
elements.printPayslip.addEventListener("click", () => window.print());
elements.resetData.addEventListener("click", () => {
  const confirmed = window.confirm("Reset payroll data back to the Techwiz demo employees?");
  if (!confirmed) return;
  employees = structuredClone(defaultEmployees);
  selectedEmployeeId = employees[0].id;
  persistEmployees();
  render();
});

setCurrentMonth();
setAuthState(sessionStorage.getItem(sessionKey) === "true");
