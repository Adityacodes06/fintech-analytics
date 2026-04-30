// ===== DATA GENERATION =====
const MONTHS = ['Jan 23','Feb 23','Mar 23','Apr 23','May 23','Jun 23','Jul 23','Aug 23','Sep 23','Oct 23','Nov 23','Dec 23','Jan 24','Feb 24','Mar 24','Apr 24','May 24','Jun 24'];
const monthlyRevenue = [284000,312000,298000,345000,378000,356000,401000,425000,467000,512000,548000,623000,487000,502000,534000,567000,598000,612000];
const monthlyOrders = [3200,3480,3350,3890,4120,3980,4350,4580,5020,5480,5890,6720,5240,5410,5760,6120,6450,6600];
const monthlyAOV = monthlyRevenue.map((r,i) => +(r/monthlyOrders[i]).toFixed(2));
const totalRevenue = monthlyRevenue.reduce((a,b)=>a+b,0);
const totalOrders = monthlyOrders.reduce((a,b)=>a+b,0);

const categories = ['Electronics','Apparel','Home & Kitchen','Beauty','Sports','Books','Toys','Grocery'];
const catRevenue = [2845000,1920000,1456000,1234000,890000,567000,423000,312000];
const channels = ['Organic Search','Paid Ads','Direct','Social Media','Email','Referral'];
const chanRevenue = [3120000,2560000,1890000,1234000,980000,863000];

const topSKUs = [
  {sku:'SKU-4821',name:'Wireless Pro Headphones',cat:'Electronics',rev:342000},
  {sku:'SKU-3019',name:'Smart Fitness Watch',cat:'Electronics',rev:289000},
  {sku:'SKU-7234',name:'Premium Yoga Mat',cat:'Sports',rev:234000},
  {sku:'SKU-1156',name:'Organic Face Serum',cat:'Beauty',rev:198000},
  {sku:'SKU-5502',name:'Ergonomic Office Chair',cat:'Home & Kitchen',rev:187000},
  {sku:'SKU-8891',name:'Running Shoes Elite',cat:'Apparel',rev:176000},
  {sku:'SKU-2247',name:'Bluetooth Speaker Mini',cat:'Electronics',rev:165000},
  {sku:'SKU-6673',name:'Stainless Water Bottle',cat:'Home & Kitchen',rev:145000},
  {sku:'SKU-9908',name:'Cotton Polo Shirt',cat:'Apparel',rev:134000},
  {sku:'SKU-4410',name:'LED Desk Lamp',cat:'Home & Kitchen',rev:128000}
];

const underperformSKUs = [
  {sku:'SKU-7701',name:'Basic Phone Case',cat:'Electronics',rev:23400,retRate:'34.2%',rating:2.1,leakage:'8.4%'},
  {sku:'SKU-3345',name:'Generic USB Cable',cat:'Electronics',rev:18900,retRate:'28.7%',rating:2.4,leakage:'7.8%'},
  {sku:'SKU-5589',name:'Plastic Storage Bins',cat:'Home & Kitchen',rev:15200,retRate:'31.5%',rating:1.9,leakage:'5.8%'}
];

const funnelData = [
  {stage:'Impressions',value:1850000,color:'#c4603c'},
  {stage:'Page Views',value:485000,color:'#d4a574'},
  {stage:'Add to Cart',value:142000,color:'#b8860b'},
  {stage:'Checkout Started',value:98000,color:'#2c3e6b'},
  {stage:'Purchase Completed',value:72000,color:'#5a7a5e'}
];

const rfmSegments = [
  {name:'Champions',count:4820,pct:'12.8%',recency:8,freq:14.2,monetary:1245,totalRev:5998900,cls:'champions'},
  {name:'Loyal Customers',count:7650,pct:'20.3%',recency:22,freq:9.8,monetary:834,totalRev:6380100,cls:'loyal'},
  {name:'Potential Loyalists',count:6230,pct:'16.5%',recency:35,freq:5.4,monetary:567,totalRev:3532410,cls:'potential'},
  {name:'New Customers',count:8900,pct:'23.6%',recency:12,freq:1.8,monetary:312,totalRev:2776800,cls:'new'},
  {name:'At Risk',count:5420,pct:'14.4%',recency:68,freq:3.2,monetary:423,totalRev:2292660,cls:'at-risk'},
  {name:'Lost',count:4680,pct:'12.4%',recency:120,freq:1.2,monetary:198,totalRev:926640,cls:'lost'}
];

const cohortRetention = [
  [100,42,31,24,19,16],
  [100,45,33,26,21,18],
  [100,43,32,25,20,17],
  [100,48,36,28,23,19],
  [100,46,35,27,22,18],
  [100,50,38,30,25,21]
];
const cohortLabels = ['Jan 23','Feb 23','Mar 23','Apr 23','May 23','Jun 23'];

const abMetrics = [
  {metric:'Conversion Rate',ctrl:'8.2%',treat:'9.18%',delta:'+12.0%',p:'0.003',sig:'✓ Yes'},
  {metric:'AOV',ctrl:'$86.40',treat:'$92.10',delta:'+6.6%',p:'0.028',sig:'✓ Yes'},
  {metric:'Cart Abandon Rate',ctrl:'67.3%',treat:'61.8%',delta:'-8.2%',p:'0.011',sig:'✓ Yes'},
  {metric:'Revenue/Visitor',ctrl:'$7.08',treat:'$8.45',delta:'+19.4%',p:'0.001',sig:'✓ Yes'},
  {metric:'Bounce Rate',ctrl:'45.2%',treat:'42.1%',delta:'-6.9%',p:'0.087',sig:'✗ No'},
  {metric:'Session Duration',ctrl:'4.2 min',treat:'4.8 min',delta:'+14.3%',p:'0.042',sig:'✓ Yes'}
];

// ===== CHART DEFAULTS =====
Chart.defaults.color = '#8c7e6a';
Chart.defaults.borderColor = 'rgba(212,165,116,0.15)';
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.animation.duration = 1200;
Chart.defaults.animation.easing = 'easeOutQuart';

function gradientFill(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  return g;
}

// ===== NAV =====
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('section-' + tab.dataset.section).classList.add('active');
  });
});

// ===== HELPER: Build KPI =====
function buildKPIs(containerId, kpis) {
  const c = document.getElementById(containerId);
  c.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" style="color:${k.color || 'var(--text-heading)'}">${k.value}</div>
      ${k.change ? `<span class="kpi-change ${k.changeDir}">${k.changeDir === 'up' ? '↑' : '↓'} ${k.change}</span>` : ''}
    </div>`).join('');
}

// ===== OVERVIEW =====
buildKPIs('kpi-overview', [
  {label:'Total Revenue',value:'$' + (totalRevenue/1e6).toFixed(2) + 'M',change:'+18.4% YoY',changeDir:'up',color:'var(--accent-sage)'},
  {label:'Total Orders',value:totalOrders.toLocaleString(),change:'+22.1% YoY',changeDir:'up'},
  {label:'Avg Order Value',value:'$' + (totalRevenue/totalOrders).toFixed(2),change:'+3.2%',changeDir:'up',color:'var(--accent-teal)'},
  {label:'Repeat Purchase Rate',value:'38.6%',change:'+5.1pp',changeDir:'up',color:'var(--accent-plum)'},
  {label:'Customer Churn',value:'12.4%',change:'-2.3pp',changeDir:'up',color:'var(--accent-gold)'},
  {label:'Active Customers',value:'37,700',change:'+14.8%',changeDir:'up'}
]);

// Revenue trend chart
new Chart(document.getElementById('chart-overview-revenue'), {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Revenue ($)',
      data: monthlyRevenue,
      borderColor: '#c4603c',
      backgroundColor: function(context) {
        const ctx = context.chart.ctx;
        return gradientFill(ctx, 'rgba(196,96,60,0.2)', 'rgba(196,96,60,0)');
      },
      fill: true, tension: 0.4, borderWidth: 2.5,
      pointRadius: 3, pointBackgroundColor: '#c4603c', pointBorderColor: '#fff', pointBorderWidth: 1.5,
      pointHoverRadius: 6
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + (v/1000) + 'K' } } } }
});

// Orders vs AOV
new Chart(document.getElementById('chart-overview-orders'), {
  type: 'bar',
  data: {
    labels: MONTHS,
    datasets: [
      { label: 'Orders', data: monthlyOrders, backgroundColor: 'rgba(44,62,107,0.55)', borderRadius: 4, yAxisID: 'y', barPercentage: 0.6 },
      { label: 'AOV ($)', data: monthlyAOV, type: 'line', borderColor: '#b8860b', backgroundColor: 'transparent', tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#b8860b', yAxisID: 'y1' }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { position: 'left', ticks: { callback: v => v.toLocaleString() } },
      y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: v => '$' + v } }
    }
  }
});

// ===== REVENUE SECTION =====
buildKPIs('kpi-revenue', [
  {label:'Peak Month',value:'Dec 2023',color:'var(--accent-gold)'},
  {label:'Peak Revenue',value:'$623K',change:'+16.2% MoM',changeDir:'up',color:'var(--accent-sage)'},
  {label:'Avg Monthly Rev',value:'$' + (totalRevenue/18/1000).toFixed(0) + 'K'},
  {label:'Growth Rate',value:'+115%',change:'Jan–Jun 24',changeDir:'up',color:'var(--accent-terracotta)'}
]);

new Chart(document.getElementById('chart-rev-category'), {
  type: 'bar',
  data: {
    labels: categories,
    datasets: [{
      label: 'Revenue',
      data: catRevenue,
      backgroundColor: ['#c4603c','#5a7a5e','#2c3e6b','#b8860b','#7b4a7d','#2a7a7a','#d4a574','#8c7e6a'],
      borderRadius: 6, barPercentage: 0.65
    }]
  },
  options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
});

new Chart(document.getElementById('chart-rev-channel'), {
  type: 'doughnut',
  data: {
    labels: channels,
    datasets: [{
      data: chanRevenue,
      backgroundColor: ['#c4603c','#5a7a5e','#2c3e6b','#b8860b','#7b4a7d','#2a7a7a'],
      borderWidth: 2, borderColor: '#ffffff', hoverOffset: 12
    }]
  },
  options: { responsive: true, cutout: '62%', plugins: { legend: { position: 'bottom' } } }
});

const cumulativeRev = monthlyRevenue.reduce((acc, v) => { acc.push((acc.length ? acc[acc.length-1] : 0) + v); return acc; }, []);
new Chart(document.getElementById('chart-rev-cumulative'), {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Cumulative Revenue',
      data: cumulativeRev,
      borderColor: '#5a7a5e',
      backgroundColor: function(context) { return gradientFill(context.chart.ctx, 'rgba(90,122,94,0.18)', 'rgba(90,122,94,0)'); },
      fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#5a7a5e'
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
});

// ===== PRODUCTS =====
new Chart(document.getElementById('chart-prod-top'), {
  type: 'bar',
  data: {
    labels: topSKUs.map(s => s.name.substring(0, 20)),
    datasets: [{
      label: 'Revenue',
      data: topSKUs.map(s => s.rev),
      backgroundColor: topSKUs.map((_, i) => `hsla(${15 + i * 8}, ${55 + i*2}%, ${45 + i*2}%, 0.75)`),
      borderRadius: 6, barPercentage: 0.65
    }]
  },
  options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => '$' + (v/1000) + 'K' } } } }
});

new Chart(document.getElementById('chart-prod-pie'), {
  type: 'polarArea',
  data: {
    labels: categories,
    datasets: [{
      data: catRevenue,
      backgroundColor: ['rgba(196,96,60,0.6)','rgba(90,122,94,0.6)','rgba(44,62,107,0.6)','rgba(184,134,11,0.6)','rgba(123,74,125,0.6)','rgba(42,122,122,0.6)','rgba(212,165,116,0.6)','rgba(140,126,106,0.6)'],
      borderWidth: 1, borderColor: '#ffffff'
    }]
  },
  options: { responsive: true, plugins: { legend: { position: 'right' } }, scales: { r: { display: false } } }
});

const tbody = document.getElementById('tbody-underperform');
underperformSKUs.forEach(s => {
  tbody.innerHTML += `<tr>
    <td style="font-family:'DM Mono',monospace;color:var(--accent-terracotta)">${s.sku}</td>
    <td>${s.name}</td><td>${s.cat}</td>
    <td>$${s.rev.toLocaleString()}</td>
    <td class="highlight">${s.retRate}</td>
    <td class="highlight">${s.rating} ★</td>
    <td class="highlight">${s.leakage}</td>
  </tr>`;
});

// ===== FUNNEL =====
const funnelEl = document.getElementById('funnel-visual');
const maxW = funnelData[0].value;
funnelData.forEach((step, i) => {
  const widthPct = 40 + 60 * (step.value / maxW);
  funnelEl.innerHTML += `
    <div class="funnel-step" style="width:${widthPct}%;background:${step.color};opacity:${1 - i * 0.12}">
      <span class="funnel-label">${step.stage}</span>
      <span class="funnel-value">${(step.value/1000).toFixed(0)}K</span>
    </div>`;
  if (i < funnelData.length - 1) {
    const dropPct = (100 - (funnelData[i+1].value / step.value * 100)).toFixed(1);
    funnelEl.innerHTML += `<div class="funnel-drop">↓ ${dropPct}% drop-off</div>`;
  }
});

const funnelRates = funnelData.map((s, i) => i === 0 ? 100 : +((s.value / funnelData[0].value) * 100).toFixed(1));
new Chart(document.getElementById('chart-funnel-rates'), {
  type: 'bar',
  data: {
    labels: funnelData.map(s => s.stage),
    datasets: [{
      label: 'Conversion %',
      data: funnelRates,
      backgroundColor: ['#c4603c','#d4a574','#b8860b','#2c3e6b','#5a7a5e'],
      borderRadius: 6, barPercentage: 0.55
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' } } } }
});

// ===== RFM =====
buildKPIs('kpi-rfm', [
  {label:'Total Segments',value:'6',color:'var(--accent-navy)'},
  {label:'Champions',value:'12.8%',color:'var(--accent-sage)',change:'High-value core',changeDir:'up'},
  {label:'At Risk + Lost',value:'26.8%',color:'var(--accent-terracotta)',change:'Retention target',changeDir:'down'},
  {label:'Avg CLV',value:'$587',color:'var(--accent-teal)'}
]);

new Chart(document.getElementById('chart-rfm-dist'), {
  type: 'doughnut',
  data: {
    labels: rfmSegments.map(s => s.name),
    datasets: [{
      data: rfmSegments.map(s => s.count),
      backgroundColor: ['#2c3e6b','#5a7a5e','#2a7a7a','#7b4a7d','#b8860b','#c4603c'],
      borderWidth: 2, borderColor: '#ffffff', hoverOffset: 10
    }]
  },
  options: { responsive: true, cutout: '55%', plugins: { legend: { position: 'bottom' } } }
});

new Chart(document.getElementById('chart-rfm-revenue'), {
  type: 'bar',
  data: {
    labels: rfmSegments.map(s => s.name),
    datasets: [{
      label: 'Total Revenue',
      data: rfmSegments.map(s => s.totalRev),
      backgroundColor: ['rgba(44,62,107,0.7)','rgba(90,122,94,0.7)','rgba(42,122,122,0.7)','rgba(123,74,125,0.7)','rgba(184,134,11,0.7)','rgba(196,96,60,0.7)'],
      borderRadius: 6, barPercentage: 0.6
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + (v/1e6).toFixed(1) + 'M' } } } }
});

const rfmBody = document.getElementById('tbody-rfm');
rfmSegments.forEach(s => {
  rfmBody.innerHTML += `<tr>
    <td><span class="segment-badge ${s.cls}">${s.name}</span></td>
    <td>${s.count.toLocaleString()}</td><td>${s.pct}</td>
    <td>${s.recency}</td><td>${s.freq}</td>
    <td>$${s.monetary}</td><td class="positive">$${s.totalRev.toLocaleString()}</td>
  </tr>`;
});

// ===== COHORT HEATMAP =====
const heatmapEl = document.getElementById('cohort-heatmap');
let tableHTML = '<table class="data-table"><thead><tr><th>Cohort</th>';
for (let m = 0; m <= 5; m++) tableHTML += `<th>Month ${m}</th>`;
tableHTML += '</tr></thead><tbody>';
cohortRetention.forEach((row, i) => {
  tableHTML += `<tr><td style="font-weight:600;color:var(--accent-terracotta)">${cohortLabels[i]}</td>`;
  row.forEach(val => {
    const intensity = val / 100;
    const bg = `rgba(196,96,60,${0.06 + intensity * 0.45})`;
    const color = intensity > 0.4 ? '#ffffff' : '#3d3424';
    tableHTML += `<td class="cohort-cell" style="background:${bg};color:${color};text-align:center;font-family:'DM Mono',monospace">${val}%</td>`;
  });
  tableHTML += '</tr>';
});
tableHTML += '</tbody></table>';
heatmapEl.innerHTML = tableHTML;

new Chart(document.getElementById('chart-cohort-trend'), {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Repeat Purchase Rate',
      data: [32,33,34,35,34,36,37,36,38,39,38,41,37,38,39,40,41,42],
      borderColor: '#7b4a7d',
      backgroundColor: function(ctx) { return gradientFill(ctx.chart.ctx, 'rgba(123,74,125,0.18)', 'rgba(123,74,125,0)'); },
      fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#7b4a7d'
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v + '%' }, min: 25, max: 50 } } }
});

// ===== A/B TEST =====
buildKPIs('kpi-abtest', [
  {label:'Control CVR',value:'8.2%',color:'var(--text-muted)'},
  {label:'Treatment CVR',value:'9.18%',color:'var(--accent-sage)',change:'+12.0%',changeDir:'up'},
  {label:'p-value',value:'0.003',color:'var(--accent-navy)'},
  {label:'Sample Size',value:'24,800',change:'per variant',changeDir:'up'}
]);

new Chart(document.getElementById('chart-ab-conversion'), {
  type: 'bar',
  data: {
    labels: ['Conversion Rate','AOV','Rev/Visitor','Session Duration'],
    datasets: [
      { label: 'Control (A)', data: [8.2,86.4,7.08,4.2], backgroundColor: 'rgba(140,126,106,0.45)', borderRadius: 6 },
      { label: 'Treatment (B)', data: [9.18,92.1,8.45,4.8], backgroundColor: 'rgba(196,96,60,0.7)', borderRadius: 6 }
    ]
  },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

const dailyCtrl = Array.from({length:30}, (_,i) => +(7.5 + Math.sin(i/4)*1.2 + Math.random()*0.8).toFixed(1));
const dailyTreat = Array.from({length:30}, (_,i) => +(8.5 + Math.sin(i/4)*1.1 + Math.random()*0.9).toFixed(1));
new Chart(document.getElementById('chart-ab-daily'), {
  type: 'line',
  data: {
    labels: Array.from({length:30}, (_,i) => 'Day ' + (i+1)),
    datasets: [
      { label: 'Control', data: dailyCtrl, borderColor: '#8c7e6a', borderWidth: 2, tension: 0.4, pointRadius: 2, borderDash: [4,4] },
      { label: 'Treatment', data: dailyTreat, borderColor: '#c4603c', borderWidth: 2.5, tension: 0.4, pointRadius: 2 }
    ]
  },
  options: { responsive: true, scales: { y: { ticks: { callback: v => v + '%' } } } }
});

const abBody = document.getElementById('tbody-abtest');
abMetrics.forEach(m => {
  const sigColor = m.sig.startsWith('✓') ? 'positive' : '';
  abBody.innerHTML += `<tr>
    <td style="font-weight:600">${m.metric}</td>
    <td>${m.ctrl}</td><td>${m.treat}</td>
    <td class="${m.delta.startsWith('+') ? 'positive' : 'highlight'}">${m.delta}</td>
    <td style="font-family:'DM Mono',monospace">${m.p}</td>
    <td class="${sigColor}">${m.sig}</td>
  </tr>`;
});

// ===== INSIGHTS =====
const insights = [
  {icon:'🚨',title:'22% Revenue Leakage from 3 SKUs',text:'SKU-7701, SKU-3345, and SKU-5589 have return rates above 28% and ratings below 2.5★. Discontinue or renegotiate with suppliers to recover ~$57K in lost revenue.',cls:'danger',metric:'$57.5K'},
  {icon:'🏆',title:'Champions Drive 27% of Revenue',text:'Top 12.8% of customers (Champions segment) contribute $5.99M. Implement VIP loyalty tier with exclusive perks to maintain engagement and increase AOV by 8-12%.',cls:'success',metric:'$5.99M'},
  {icon:'📈',title:'12% Conversion Uplift Validated',text:'A/B test confirms promotional strategy B yields statistically significant improvement (p=0.003) in conversion rate for high-value segments. Ready for full rollout.',cls:'success',metric:'+12.0%'},
  {icon:'⚠️',title:'26.8% Customers At-Risk or Lost',text:'Over 10,100 customers show declining engagement. Deploy targeted win-back campaigns with personalized offers — projected 15% uplift in retention based on cohort data.',cls:'warning',metric:'10,100'},
  {icon:'💰',title:'Electronics Category Dominates',text:'Electronics commands 29.3% revenue share ($2.85M) but also has the highest return rates. Focus QA on top-selling electronics SKUs to reduce returns by 15%.',cls:'',metric:'29.3%'},
  {icon:'📊',title:'Cohort Retention Improving',text:'Month-1 retention improved from 42% (Jan cohort) to 50% (Jun cohort), an 8pp gain. Attribute to improved onboarding flow and post-purchase email sequence.',cls:'success',metric:'+8pp'}
];

const insightsGrid = document.getElementById('insights-grid');
insights.forEach(ins => {
  insightsGrid.innerHTML += `
    <div class="insight-card ${ins.cls}">
      <div class="insight-icon">${ins.icon}</div>
      <div class="insight-title">${ins.title}</div>
      <div class="insight-text">${ins.text}</div>
      <div style="margin-top:0.75rem"><span class="insight-metric">${ins.metric}</span></div>
    </div>`;
});
