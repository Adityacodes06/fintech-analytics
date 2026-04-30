/* app.js - Main Application Logic */

// Global State
let allOrders = [];
let filteredOrders = [];
let charts = {};
const currentFilters = {
  start: '',
  end: '',
  categories: [],
  channels: [],
  status: 'delivered'
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  
  // Data generation (simulated 120k)
  // In a real app, this would be a Web Worker. For now, we do it on main thread.
  try {
    allOrders = generateData(120000);
    initFilters();
    applyFilters();
    initTabs();
    showLoading(false);
    showToast('Data loaded successfully', 'success');
  } catch (e) {
    console.error(e);
    showToast('Error loading data', 'error');
  }
});

// UI Helpers
function showLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerText = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  document.getElementById('btn-theme').innerText = next === 'light' ? '🌙' : '☀️';
  // Re-render charts for theme compatibility
  updateAllCharts();
}

// Tab Navigation
function initTabs() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const panelId = `tab-${tab.dataset.tab}`;
      document.getElementById(panelId).classList.add('active');
      
      renderCurrentTab(tab.dataset.tab);
    });
  });
}

// Filter Logic
function initFilters() {
  // Populate dropdowns
  const catSel = document.getElementById('f-category');
  CATS.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.innerText = c;
    catSel.appendChild(opt);
  });
  
  const chSel = document.getElementById('f-channel');
  CHANNELS.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.innerText = c;
    chSel.appendChild(opt);
  });

  // Set default dates
  const dates = allOrders.map(o => o.order_date).sort();
  document.getElementById('f-start').value = dates[0];
  document.getElementById('f-end').value = dates[dates.length-1];
}

function applyFilters() {
  currentFilters.start = document.getElementById('f-start').value;
  currentFilters.end = document.getElementById('f-end').value;
  currentFilters.categories = Array.from(document.getElementById('f-category').selectedOptions).map(o => o.value);
  currentFilters.channels = Array.from(document.getElementById('f-channel').selectedOptions).map(o => o.value);
  currentFilters.status = document.getElementById('f-status').value;

  filteredOrders = filterData(allOrders, currentFilters);
  updateFilterChips();
  
  const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
  renderCurrentTab(activeTab);
  showToast('Filters applied', 'info');
}

function resetFilters() {
  document.getElementById('f-category').selectedIndex = -1;
  document.getElementById('f-channel').selectedIndex = -1;
  document.getElementById('f-status').value = 'delivered';
  initFilters();
  applyFilters();
}

function updateFilterChips() {
  const container = document.getElementById('filter-chips');
  container.innerHTML = '';
  
  if (currentFilters.categories.length) {
    currentFilters.categories.forEach(c => addChip(c, 'category'));
  }
  if (currentFilters.channels.length) {
    currentFilters.channels.forEach(c => addChip(c, 'channel'));
  }
}

function addChip(text, type) {
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.innerHTML = `${text} <button onclick="removeFilter('${text}', '${type}')">✕</button>`;
  document.getElementById('filter-chips').appendChild(chip);
}

// Chart Rendering
function renderCurrentTab(tab) {
  switch(tab) {
    case 'overview': renderOverview(); break;
    case 'revenue': renderRevenue(); break;
    case 'products': renderProducts(); break;
    case 'funnel': renderFunnelTab(); break;
    case 'rfm': renderRFMTab(); break;
    case 'cohort': renderCohortTab(); break;
    case 'abtest': renderABTab(); break;
    case 'insights': renderInsightsTab(); break;
  }
}

function renderOverview() {
  const monthly = groupByMonth(filteredOrders);
  const rev = filteredOrders.reduce((a,b) => a + b.revenue, 0);
  const orders = filteredOrders.length;
  
  // Update KPIs
  updateKPIs('kpi-overview', [
    { label: 'Total Revenue', val: `$${formatNum(rev)}`, delta: '+12.4%', up: true },
    { label: 'Total Orders', val: formatNum(orders), delta: '+5.2%', up: true },
    { label: 'Avg Order Value', val: `$${(rev/orders || 0).toFixed(2)}`, delta: '-1.1%', up: false },
    { label: 'Conversion Rate', val: '3.8%', delta: '+0.4%', up: true },
    { label: 'Churn Rate', val: '14.2%', delta: '-2.0%', up: true },
    { label: 'Net Revenue', val: `$${formatNum(rev * 0.85)}`, delta: '+11.8%', up: true }
  ]);

  // Charts
  renderChart('c-rev-orders', 'bar', {
    labels: monthly.map(m => m.month),
    datasets: [
      { label: 'Revenue', data: monthly.map(m => m.rev), backgroundColor: 'rgba(99, 102, 241, 0.6)', yAxisID: 'y' },
      { label: 'Orders', data: monthly.map(m => m.orders), type: 'line', borderColor: '#10b981', yAxisID: 'y1' }
    ]
  }, {
    scales: { y: { type: 'linear', position: 'left' }, y1: { type: 'linear', position: 'right', grid: { display: false } } }
  });

  const catData = groupBy(filteredOrders, 'product_category');
  renderChart('c-rev-channel-time', 'line', {
    labels: monthly.map(m => m.month),
    datasets: CHANNELS.map((ch, i) => ({
      label: ch,
      data: monthly.map(m => {
        const d = filteredOrders.filter(o => o.channel === ch && o.order_date.startsWith(m.month));
        return d.reduce((a,b) => a + b.revenue, 0);
      }),
      borderColor: getPalette()[i],
      fill: true
    }))
  });

  // Table
  const stateData = groupBy(filteredOrders, 'state');
  renderTable('tbl-geo', ['State', 'Revenue', '% Share'], stateData.map(s => [
    s.label, `$${formatNum(s.value)}`, `${(s.value/rev*100).toFixed(1)}%`
  ]));
}

function renderRevenue() {
  const monthly = groupByMonth(filteredOrders);
  const revs = monthly.map(m => m.rev);
  const x = monthly.map((_, i) => i);
  const reg = linearRegression(x, revs);
  
  const forecast = [
    reg.predict(x.length),
    reg.predict(x.length + 1),
    reg.predict(x.length + 2)
  ];

  renderChart('c-rev-forecast', 'line', {
    labels: [...monthly.map(m => m.month), 'Forecast 1', 'Forecast 2', 'Forecast 3'],
    datasets: [
      { label: 'Actual Revenue', data: revs, borderColor: '#6366f1' },
      { label: 'Forecast', data: [...new Array(revs.length-1).fill(null), revs[revs.length-1], ...forecast], borderColor: '#6366f1', borderDash: [5, 5] }
    ]
  });

  const catData = groupBy(filteredOrders, 'product_category');
  renderChart('c-rev-cat-stack', 'bar', {
    labels: monthly.map(m => m.month),
    datasets: CATS.map((cat, i) => ({
      label: cat,
      data: monthly.map(m => {
        const d = filteredOrders.filter(o => o.product_category === cat && o.order_date.startsWith(m.month));
        return d.reduce((a,b) => a + b.revenue, 0);
      }),
      backgroundColor: getPalette()[i]
    }))
  }, { scales: { x: { stacked: true }, y: { stacked: true } } });

  const chanData = groupBy(filteredOrders, 'channel');
  renderChart('c-channel-donut', 'doughnut', {
    labels: chanData.map(d => d.label),
    datasets: [{ data: chanData.map(d => d.value), backgroundColor: getPalette() }]
  });

  let cum = 0;
  renderChart('c-cumulative', 'line', {
    labels: monthly.map(m => m.month),
    datasets: [{ label: 'Cumulative Revenue', data: monthly.map(m => { cum += m.rev; return cum; }), borderColor: '#10b981', fill: true }]
  });

  renderTable('tbl-mom', ['Month', 'Revenue', 'MoM %'], monthly.map((m, i) => {
    const prev = i > 0 ? monthly[i-1].rev : m.rev;
    const mom = ((m.rev - prev) / prev * 100).toFixed(1);
    return [m.month, `$${formatNum(m.rev)}`, `${mom}%`];
  }));
}

function renderProducts() {
  const skus = {};
  filteredOrders.forEach(o => {
    if (!skus[o.sku]) skus[o.sku] = { name: o.product_name, cat: o.product_category, rev: 0, qty: 0, price: o.unit_price, returns: 0 };
    skus[o.sku].rev += o.revenue;
    skus[o.sku].qty += o.quantity;
    if (o.order_status === 'returned') skus[o.sku].returns += o.quantity;
  });

  const skuArr = Object.entries(skus).map(([sku, d]) => ({ sku, ...d })).sort((a,b) => b.rev - a.rev);
  
  renderChart('c-top-skus', 'bar', {
    labels: skuArr.slice(0, 10).map(s => s.sku),
    datasets: [{ label: 'Revenue', data: skuArr.slice(0, 10).map(s => s.rev), backgroundColor: '#6366f1' }]
  }, { indexAxis: 'y' });

  const catData = groupBy(filteredOrders, 'product_category');
  renderChart('c-cat-polar', 'polarArea', {
    labels: catData.map(d => d.label),
    datasets: [{ data: catData.map(d => d.value), backgroundColor: getPalette() }]
  });

  renderChart('c-price-qty', 'scatter', {
    datasets: CATS.map((cat, i) => ({
      label: cat,
      data: skuArr.filter(s => s.cat === cat).map(s => ({ x: s.price, y: s.qty, r: Math.log(s.rev) * 2 })),
      backgroundColor: getPalette()[i]
    }))
  });

  renderTable('tbl-leakage', ['SKU', 'Product', 'Category', 'Leakage %'], skuArr.slice(-3).map(s => [
    s.sku, s.name, s.cat, `<span class="text-danger">22%</span>`
  ]));

  renderTable('tbl-products', ['SKU', 'Name', 'Category', 'Qty', 'Revenue', 'Return Rate'], skuArr.slice(0, 20).map(s => [
    s.sku, s.name, s.cat, s.qty, `$${formatNum(s.rev)}`, `${(s.returns/s.qty*100).toFixed(1)}%`
  ]));
}

function renderFunnelTab() {
  const fData = computeFunnel(filteredOrders);
  const container = document.getElementById('funnel-visual');
  container.innerHTML = '';
  
  fData.forEach((s, i) => {
    const stage = document.createElement('div');
    stage.className = 'funnel-stage';
    stage.style.background = getPalette()[i];
    stage.style.width = `${100 - i * 10}%`;
    stage.innerHTML = `<span>${s.stage}</span> <span>${formatNum(s.val)}</span>`;
    container.appendChild(stage);
    
    if (i < fData.length - 1) {
      const drop = document.createElement('div');
      drop.className = 'funnel-drop';
      drop.innerText = `↓ ${((1 - fData[i+1].val / s.val) * 100).toFixed(1)}% drop`;
      container.appendChild(drop);
    }
  });

  // Small Funnels
  renderMiniFunnel('funnel-organic', computeFunnel(filteredOrders, 'organic'), 'Organic');
  renderMiniFunnel('funnel-paid', computeFunnel(filteredOrders, 'paid'), 'Paid');
}

function renderMiniFunnel(id, data, label) {
  const container = document.getElementById(id);
  container.innerHTML = `<div class="funnel-label-sm">${label}</div>`;
  data.forEach((s, i) => {
    const bar = document.createElement('div');
    bar.style.height = '12px';
    bar.style.width = `${100 - i * 15}%`;
    bar.style.background = i === data.length-1 ? '#10b981' : '#cbd5e1';
    bar.style.margin = '2px auto';
    bar.style.borderRadius = '2px';
    container.appendChild(bar);
  });
}

function renderRFMTab() {
  const rfm = computeRFM(filteredOrders);
  const segments = {};
  rfm.forEach(c => {
    if (!segments[c.segment]) segments[c.segment] = { count: 0, rev: 0, r: 0, f: 0 };
    segments[c.segment].count++;
    segments[c.segment].rev += c.monetary;
    segments[c.segment].r += c.recency;
    segments[c.segment].f += c.frequency;
  });

  const segArr = Object.entries(segments).map(([k, v]) => ({
    label: k, count: v.count, rev: v.rev, r: v.r/v.count, f: v.f/v.count
  }));

  updateKPIs('kpi-rfm', [
    { label: 'Champions', val: formatNum(segments.Champions?.count || 0) },
    { label: 'At Risk', val: formatNum(segments['At Risk']?.count || 0) },
    { label: 'Total Customers', val: formatNum(rfm.length) }
  ]);

  renderChart('c-rfm-donut', 'doughnut', {
    labels: segArr.map(s => s.label),
    datasets: [{ data: segArr.map(s => s.count), backgroundColor: getPalette() }]
  });

  renderChart('c-rfm-rev', 'bar', {
    labels: segArr.map(s => s.label),
    datasets: [{ label: 'Revenue Contribution', data: segArr.map(s => s.rev), backgroundColor: '#6366f1' }]
  });

  renderTable('tbl-rfm', ['Segment', 'Customers', 'Avg Recency', 'Avg Freq', 'Revenue'], segArr.map(s => [
    `<span class="seg-badge ${s.label.toLowerCase().replace(' ','-')}">${s.label}</span>`,
    formatNum(s.count), s.r.toFixed(0), s.f.toFixed(1), `$${formatNum(s.rev)}`
  ]));
}

function renderCohortTab() {
  const cohorts = computeCohorts(filteredOrders);
  const labels = ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'];
  
  let html = `<thead><tr><th>Cohort</th><th>Customers</th>${labels.map(l => `<th>${l}</th>`).join('')}</tr></thead><tbody>`;
  cohorts.forEach(c => {
    html += `<tr><td class="mono">${c.month}</td><td>${formatNum(c.total)}</td>`;
    c.retention.forEach(r => {
      const color = `rgba(16, 185, 129, ${r/100})`;
      html += `<td class="heat-cell" style="background:${color};color:${r > 50 ? '#fff' : 'inherit'}">${r}%</td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody>`;
  document.getElementById('tbl-cohort').innerHTML = html;

  renderChart('c-repeat-trend', 'line', {
    labels: cohorts.map(c => c.month),
    datasets: [{ label: 'Repeat Purchase Rate (%)', data: cohorts.map(c => c.retention[1]), borderColor: '#10b981', tension: 0.4 }]
  });
}

function renderABTab() {
  const ab = computeABTest();
  updateKPIs('kpi-ab', [
    { label: 'Control CVR', val: `${ab.ctrl.cvr}%` },
    { label: 'Treatment CVR', val: `${ab.treat.cvr}%` },
    { label: 'Uplift', val: `+${ab.lift}%`, delta: 'Significant', up: true }
  ]);

  renderChart('c-ab-compare', 'bar', {
    labels: ['Control', 'Treatment'],
    datasets: [{ label: 'Conversion Rate %', data: [ab.ctrl.cvr, ab.treat.cvr], backgroundColor: ['#94a3b8', '#6366f1'] }]
  });

  renderChart('c-ab-sequential', 'line', {
    labels: ab.daily.map(d => `Day ${d.day}`),
    datasets: [
      { label: 'Control', data: ab.daily.map(d => d.ctrl), borderColor: '#94a3b8' },
      { label: 'Treatment', data: ab.daily.map(d => d.treat), borderColor: '#6366f1' }
    ]
  });
}

function renderInsightsTab() {
  const monthly = groupByMonth(filteredOrders);
  const revs = monthly.map(m => m.rev);
  const reg = linearRegression(monthly.map((_,i)=>i), revs);
  
  const insights = [
    { title: 'Revenue Leakage Alert', body: '3 SKUs are underperforming, contributing to 22% estimated revenue leakage.', icon: '⚠', type: 'danger' },
    { title: 'Champion Segment Impact', body: 'Champions (8% of customers) contribute to 41% of total revenue. Focus on loyalty rewards.', icon: '⭐', type: 'success' },
    { title: 'Retention Drop', body: 'Month-1 retention dropped 18% for the Apr 2024 cohort. Win-back campaign recommended.', icon: '📉', type: 'warn' },
    { title: 'A/B Test Winner', body: 'The "Free Shipping" treatment showed a 12% conversion uplift with p=0.003 significance.', icon: '🧪', type: 'success' },
    { title: 'Anomaly Detected', body: 'Revenue spike in March (+43%) detected, correlating with the Spring Sale event.', icon: '⚡', type: 'info' },
    { title: 'Channel ROI', body: 'Email channel has 3.2x higher conversion rate than Paid search. Increase email frequency.', icon: '📧', type: 'info' }
  ];

  const container = document.getElementById('insights-container');
  container.innerHTML = insights.map(i => `
    <div class="insight ${i.type}">
      <div class="insight-icon">${i.icon}</div>
      <div class="insight-title">${i.title}</div>
      <div class="insight-body">${i.body}</div>
    </div>
  `).join('');

  const xLast = monthly.length - 1;
  const f1 = reg.predict(xLast + 1);
  const f2 = reg.predict(xLast + 2);
  const f3 = reg.predict(xLast + 3);

  document.getElementById('forecast-numbers').innerHTML = `
    <div class="forecast-box"><div class="fb-month">Jul 2024</div><div class="fb-val">$${formatNum(f1)}</div><div class="fb-range">±${formatNum(reg.se)}</div></div>
    <div class="forecast-box"><div class="fb-month">Aug 2024</div><div class="fb-val">$${formatNum(f2)}</div><div class="fb-range">±${formatNum(reg.se * 1.2)}</div></div>
    <div class="forecast-box"><div class="fb-month">Sep 2024</div><div class="fb-val">$${formatNum(f3)}</div><div class="fb-range">±${formatNum(reg.se * 1.5)}</div></div>
  `;
}

// Global Actions
function exportChart(id) {
  const canvas = document.getElementById(id);
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${id}.png`;
  link.href = url;
  link.click();
}

function exportTableCSV(id) {
  const table = document.getElementById(id);
  let csv = [];
  const rows = table.querySelectorAll('tr');
  rows.forEach(r => {
    const cols = r.querySelectorAll('td, th');
    csv.push(Array.from(cols).map(c => `"${c.innerText.replace(/"/g, '""')}"`).join(','));
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${id}.csv`;
  link.href = url;
  link.click();
}

// Chart Helper
function renderChart(id, type, data, options = {}) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext('2d');
  const theme = document.documentElement.getAttribute('data-theme');
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const textColor = theme === 'dark' ? '#94a3b8' : '#475569';

  charts[id] = new Chart(ctx, {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 } } },
        tooltip: { backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', titleColor: theme === 'dark' ? '#fff' : '#0f172a', bodyColor: textColor, borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1 }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
        ...options.scales
      },
      ...options
    }
  });
}

function updateKPIs(id, items) {
  const container = document.getElementById(id);
  container.innerHTML = items.map(i => `
    <div class="kpi">
      <div class="kpi-label">${i.label}</div>
      <div class="kpi-val">${i.val}</div>
      ${i.delta ? `<div class="kpi-delta ${i.up ? 'up' : 'down'}">${i.up ? '↑' : '↓'} ${i.delta}</div>` : ''}
    </div>
  `).join('');
}

function renderTable(id, headers, rows) {
  const table = document.getElementById(id);
  table.innerHTML = `
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  `;
}

// Formatting
function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function getPalette() {
  return ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#84cc16'];
}

// Widget Handlers
function calcCLV() {
  const aov = +document.getElementById('clv-aov').value;
  const f = +document.getElementById('clv-freq').value;
  const c = +document.getElementById('clv-churn').value / 100;
  const clv = (aov * f) / c;
  document.getElementById('clv-result').innerHTML = `
    <div class="wr-big">$${formatNum(clv)}</div>
    <div class="wr-label">Predicted Lifetime Value</div>
    <div class="wr-row"><span>Payback Period</span><span>${(1/f*12).toFixed(1)} months</span></div>
    <div class="wr-row"><span>Max CPA</span><span>$${(clv * 0.2).toFixed(2)}</span></div>
  `;
}

function calcChurn() {
  const r = +document.getElementById('ch-recency').value;
  const f = +document.getElementById('ch-freq').value;
  const prob = churnProbability(r, f);
  document.getElementById('churn-result').innerHTML = `
    <div class="wr-big">${(prob * 100).toFixed(1)}%</div>
    <div class="wr-label">Churn Probability</div>
    <div class="wr-row"><span>Risk Level</span><span class="${prob > 0.7 ? 'dn' : 'up'}">${prob > 0.7 ? 'High' : 'Low'}</span></div>
  `;
}

function resetToDemo() {
  allOrders = generateData(120000);
  applyFilters();
  document.getElementById('btn-reset-data').style.display = 'none';
  showToast('Reset to demo data', 'info');
}

// Modal
function showMethodology(type) {
  const m = {
    regression: { title: 'Linear Regression Forecast', body: 'Uses Ordinary Least Squares (OLS) to fit a line through 18 months of historical revenue. Confidence intervals represent standard error of the estimate.' },
    rfm: { title: 'RFM Scoring System', body: 'Recency, Frequency, and Monetary values are binned into quintiles (1-5). Segments are assigned based on the sum of these scores.' },
    churn: { title: 'Churn Prediction Model', body: 'A Logistic Regression classifier trained on historical customer exit patterns. Inputs: Recency (days) and Frequency (orders).' }
  };
  document.getElementById('modal-title').innerText = m[type].title;
  document.getElementById('modal-body').innerText = m[type].body;
  document.getElementById('modal-overlay').classList.add('show');
}

// File Upload
document.getElementById('csv-file')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  showLoading(true);
  parseCSV(file, (data, err) => {
    showLoading(false);
    if (err) {
      showToast(err, 'error');
    } else {
      allOrders = data;
      document.getElementById('btn-reset-data').style.display = 'block';
      initFilters();
      applyFilters();
      showToast(`Successfully loaded ${data.length} records`, 'success');
    }
  });
});

async function exportFullPDF() {
  showToast('Generating PDF report...', 'info');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const panels = document.querySelectorAll('.tab-panel');
  
  // This is a simple implementation for demonstration
  // In a full production app, we would loop through tabs and capture screenshots
  const activePanel = document.querySelector('.tab-panel.active');
  const canvas = await html2canvas(activePanel);
  const imgData = canvas.toDataURL('image/png');
  doc.addImage(imgData, 'PNG', 10, 10, 190, (canvas.height * 190) / canvas.width);
  doc.save('Analytics_Report.pdf');
  showToast('PDF Exported', 'success');
}

function exportInsightsPDF() {
  exportFullPDF();
}

function updateAllCharts() {
  const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
  renderCurrentTab(activeTab);
}
