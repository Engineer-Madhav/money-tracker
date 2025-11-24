let totalMoney = 0;
let expenses = [];
let savings = [];

// ---------- INITIALIZATION ----------
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  attachNavHandlers();
  attachFormHandlers();
  renderDashboard();
  renderExpenses();
  renderSavings();
});

// ---------- STORAGE ----------
function saveToStorage() {
  localStorage.setItem("totalMoney", String(totalMoney));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("savings", JSON.stringify(savings));
}

function loadFromStorage() {
  totalMoney = Number(localStorage.getItem("totalMoney")) || 0;
  expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  savings = JSON.parse(localStorage.getItem("savings")) || [];
}

// ---------- NAVIGATION ----------
function attachNavHandlers() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach(btn => {
    btn.addEventListener("click", () => {
      links.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.dataset.target;
      document.querySelectorAll("main section").forEach(sec => {
        sec.classList.toggle("active", sec.id === targetId);
      });
    });
  });
}

// ---------- FORMS ----------
function attachFormHandlers() {
  // total money
  document.getElementById("total-form").addEventListener("submit", e => {
    e.preventDefault();
    const value = Number(document.getElementById("total-input").value);
    if (value >= 0) {
      totalMoney = value;
      saveToStorage();
      renderDashboard();
      e.target.reset();
    }
  });

  // expense form
  document.getElementById("expense-form").addEventListener("submit", e => {
    e.preventDefault();
    const amount = Number(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;
    if (!amount || !category) {
      alert("Amount and category are required.");
      return;
    }

    const exp = {
      id: Date.now(),
      amount,
      date: document.getElementById("expense-date").value,
      time: document.getElementById("expense-time").value,
      category,
      subCategory: document.getElementById("expense-subcategory").value,
      reason: document.getElementById("expense-reason").value.trim()
    };

    expenses.push(exp);
    saveToStorage();
    renderDashboard();
    renderExpenses();
    e.target.reset();
  });

  // savings form
  document.getElementById("saving-form").addEventListener("submit", e => {
    e.preventDefault();
    const amount = Number(document.getElementById("saving-amount").value);
    const month = document.getElementById("saving-month").value;
    const reason = document.getElementById("saving-reason").value.trim();

    if (!amount || !month || !reason) {
      alert("All saving fields are required.");
      return;
    }

    const sav = {
      id: Date.now(),
      amount,
      month,
      reason
    };

    savings.push(sav);
    saveToStorage();
    renderDashboard();
    renderSavings();
    e.target.reset();
  });

  // filters
  document.getElementById("apply-filters").addEventListener("click", () => {
    applyFilters();
  });

  // delete expense / saving (event delegation)
  document.querySelector("#expense-table tbody")
    .addEventListener("click", e => {
      if (e.target.classList.contains("btn-delete")) {
        const id = Number(e.target.dataset.id);
        expenses = expenses.filter(exp => exp.id !== id);
        saveToStorage();
        renderDashboard();
        renderExpenses();
        applyFilters(); // keep reports in sync
      }
    });

  document.querySelector("#saving-table tbody")
    .addEventListener("click", e => {
      if (e.target.classList.contains("btn-delete")) {
        const id = Number(e.target.dataset.id);
        savings = savings.filter(s => s.id !== id);
        saveToStorage();
        renderDashboard();
        renderSavings();
      }
    });
}

// ---------- DASHBOARD ----------
function getTotalSpent() {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function getTotalSaved() {
  return savings.reduce((sum, s) => sum + s.amount, 0);
}

function renderDashboard() {
  const balance = totalMoney - getTotalSpent();
  document.getElementById("current-balance").textContent = "₹" + balance;
  document.getElementById("total-spent").textContent = "₹" + getTotalSpent();
  document.getElementById("total-saved").textContent = "₹" + getTotalSaved();
}

// ---------- EXPENSES ----------
function renderExpenses(list = expenses) {
  const tbody = document.querySelector("#expense-table tbody");
  tbody.innerHTML = "";

  list.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.date || "-"}</td>
      <td>${exp.time || "-"}</td>
      <td>${exp.category}</td>
      <td>${exp.subCategory || "-"}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.reason || "-"}</td>
      <td><button class="btn-delete" data-id="${exp.id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- SAVINGS ----------
function renderSavings() {
  const tbody = document.querySelector("#saving-table tbody");
  tbody.innerHTML = "";

  savings.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.month}</td>
      <td>₹${s.amount}</td>
      <td>${s.reason}</td>
      <td><button class="btn-delete" data-id="${s.id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- REPORTS / FILTERS ----------
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const month = document.getElementById("filter-month").value; // yyyy-mm

  let filtered = expenses.slice();

  if (cat !== "all") {
    filtered = filtered.filter(e => e.category === cat);
  }

  if (month) {
    filtered = filtered.filter(e => e.date && e.date.startsWith(month));
  }

  renderReportTable(filtered);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("report-spent").textContent = "₹" + total;
}

function renderReportTable(list) {
  const tbody = document.querySelector("#report-table tbody");
  tbody.innerHTML = "";

  list.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.date || "-"}</td>
      <td>${exp.time || "-"}</td>
      <td>${exp.category}</td>
      <td>${exp.subCategory || "-"}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.reason || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}
