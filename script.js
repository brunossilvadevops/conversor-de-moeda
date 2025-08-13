const amountEl = document.getElementById("amount");
const baseEl = document.getElementById("base");
const targetEl = document.getElementById("target");
const resultEl = document.getElementById("result");
const ratesTableEl = document.getElementById("ratesTable");
const baseLabel = document.getElementById("baseLabel");
const statusEl = document.getElementById("status");
const lastUpdatedEl = document.getElementById("lastUpdated");
const quickEl = document.getElementById("quick");

const API_URL = "https://api.exchangerate.host/latest";
const fallbackRates = {
  USD: { BRL: 5.0, EUR: 0.9, GBP: 0.78, JPY: 144.0, ARS: 350.0, CLP: 850.0, CAD: 1.33, AUD: 1.48 },
  BRL: { USD: 0.2, EUR: 0.18, GBP: 0.16, JPY: 28.8, ARS: 70.0, CLP: 170.0, CAD: 0.27, AUD: 0.29 },
  EUR: { USD: 1.1, BRL: 5.55, GBP: 0.87, JPY: 160.0, ARS: 390.0, CLP: 950.0, CAD: 1.47, AUD: 1.62 },
};
const currencies = ["USD", "BRL", "EUR", "GBP", "JPY", "ARS", "CLP", "CAD", "AUD"];
let rates = {};
let baseCurrency = "USD";

function populateCurrencySelects() {
  currencies.forEach(cur => {
    const opt1 = document.createElement("option");
    opt1.value = cur;
    opt1.textContent = cur;
    baseEl.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = cur;
    opt2.textContent = cur;
    targetEl.appendChild(opt2);
  });
  baseEl.value = "USD";
  targetEl.value = "BRL";
}

async function fetchRates(base = "USD") {
  setStatus("Carregando taxas...", "warn");
  try {
    const res = await fetch(`${API_URL}?base=${base}`);
    if (!res.ok) throw new Error("Falha na API");
    const data = await res.json();
    rates = data.rates;
    setStatus("Taxas atualizadas", "ok");
    lastUpdatedEl.innerHTML = `Taxas carregadas: <span class="mono">${new Date().toLocaleString()}</span>`;
    updateTable();
  } catch (err) {
    setStatus("Usando taxas offline", "err");
    rates = fallbackRates[base] || {};
    lastUpdatedEl.innerHTML = `Taxas carregadas (offline): <span class="mono">${new Date().toLocaleString()}</span>`;
    updateTable();
  }
}

function convert() {
  const amount = parseFloat(amountEl.value);
  if (isNaN(amount) || amount <= 0) {
    resultEl.textContent = "Digite um valor válido.";
    return;
  }
  const base = baseEl.value;
  const target = targetEl.value;
  const rate = rates[target];
  if (!rate) {
    resultEl.textContent = "Taxa não encontrada.";
    return;
  }
  const converted = amount * rate;
  resultEl.textContent = `${amount.toFixed(2)} ${base} = ${converted.toFixed(2)} ${target}`;
  quickEl.textContent = `1 ${base} = ${rate.toFixed(4)} ${target}`;
}

function updateTable() {
  baseLabel.textContent = baseEl.value;
  ratesTableEl.innerHTML = "";
  Object.entries(rates).forEach(([cur, rate]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${cur}</td><td>${rate.toFixed(4)}</td>`;
    ratesTableEl.appendChild(row);
  });
}

function swapCurrencies() {
  const temp = baseEl.value;
  baseEl.value = targetEl.value;
  targetEl.value = temp;
  baseCurrency = baseEl.value;
  fetchRates(baseCurrency);
}

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

document.getElementById("convert").addEventListener("click", convert);
document.getElementById("swap").addEventListener("click", swapCurrencies);
document.getElementById("update").addEventListener("click", () => fetchRates(baseEl.value));
baseEl.addEventListener("change", () => fetchRates(baseEl.value));
amountEl.addEventListener("keyup", e => {
  if (e.key === "Enter") convert();
});
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "i") swapCurrencies();
});

populateCurrencySelects();
fetchRates(baseCurrency);
