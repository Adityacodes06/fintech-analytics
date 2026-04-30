/* data.js — Data generation & CSV parsing */
const CATS=['Electronics','Apparel','Home & Kitchen','Beauty','Sports','Books','Toys','Grocery'];
const PRODS={Electronics:[['Wireless Headphones',89,149],['Smart Watch',129,249],['Bluetooth Speaker',39,79],['Phone Case',9,29],['USB Cable',5,15],['LED Desk Lamp',29,59],['Tablet Stand',19,39],['Power Bank',24,49]],Apparel:[['Running Shoes',59,129],['Cotton Polo',24,49],['Denim Jacket',49,99],['Yoga Pants',29,59],['Winter Coat',79,159],['Silk Scarf',19,39]],['Home & Kitchen']:[['Ergonomic Chair',149,299],['Water Bottle',14,29],['Coffee Maker',49,99],['Knife Set',29,69],['Storage Bins',9,24],['Air Purifier',89,199]],Beauty:[['Face Serum',24,59],['Moisturizer',14,34],['Lip Kit',9,24],['Hair Oil',12,29],['Sunscreen',9,19]],Sports:[['Yoga Mat',19,49],['Dumbbells',29,69],['Resistance Bands',9,24],['Jump Rope',7,19]],Books:[['Bestseller Novel',9,19],['Cookbook',14,29],['Self-Help',9,24]],Toys:[['Building Blocks',19,39],['Board Game',14,34],['Plush Toy',9,24]],Grocery:[['Protein Bars',14,29],['Coffee Beans',9,19],['Organic Honey',7,14]]};
const CHANNELS=['organic','paid','email','referral','social','direct'];
const STATES=['SP','RJ','MG','BA','PR','RS','SC','PE','CE','GO','PA','MA','DF','MT','ES','PB','RN','PI'];
const PAYMENTS=['credit_card','debit_card','pix','boleto'];
const STATUSES=['delivered','delivered','delivered','delivered','delivered','delivered','cancelled','returned'];

function seededRandom(s){return function(){s=(s*16807)%2147483647;return(s-1)/2147483646}}

function generateData(count=120000){
  const rng=seededRandom(42);const orders=[];const startDate=new Date(2023,0,1);const endDate=new Date(2024,5,30);const span=endDate-startDate;
  for(let i=0;i<count;i++){
    const t=rng();const d=new Date(startDate.getTime()+t*span);
    const dow=d.getDay();const hourBias=dow===0||dow===6?0.7:1;
    if(rng()>(hourBias*0.95+(d.getMonth()===11?0.3:0)))continue;
    const cat=CATS[Math.floor(rng()*CATS.length)];const prods=PRODS[cat];const prod=prods[Math.floor(rng()*prods.length)];
    const qty=Math.max(1,Math.floor(rng()*4));const price=+(prod[1]+(prod[2]-prod[1])*rng()).toFixed(2);
    const disc=rng()<0.3?+(rng()*20).toFixed(1):0;const rev=+(qty*price*(1-disc/100)).toFixed(2);
    const ch=CHANNELS[Math.floor(rng()*CHANNELS.length)];const st=STATES[Math.floor(rng()*STATES.length)];
    const pm=PAYMENTS[Math.floor(rng()*PAYMENTS.length)];const status=STATUSES[Math.floor(rng()*STATUSES.length)];
    const custId='C'+String(Math.floor(rng()*38000)).padStart(5,'0');
    const skuIdx=prods.indexOf(prod);const sku=cat.substring(0,3).toUpperCase()+'-'+String(skuIdx*1000+Math.floor(rng()*999)).padStart(4,'0');
    orders.push({order_id:'ORD-'+String(i).padStart(6,'0'),customer_id:custId,order_date:d.toISOString().split('T')[0],product_category:cat,product_name:prod[0],sku:sku,quantity:qty,unit_price:price,discount_pct:disc,revenue:rev,channel:ch,state:st,payment_method:pm,order_status:status,device:['mobile','desktop','tablet'][Math.floor(rng()*3)]});
  }
  return orders;
}

function parseCSV(file,cb){
  Papa.parse(file,{header:true,skipEmptyLines:true,dynamicTyping:true,complete:function(r){
    if(r.errors.length>5){cb(null,'Too many parsing errors');return}
    const mapped=r.data.map(row=>{
      return{order_id:row.order_id||row.id||'',customer_id:row.customer_id||row.cust_id||'',order_date:row.order_date||row.date||'',product_category:row.product_category||row.category||'Other',product_name:row.product_name||row.product||'Unknown',sku:row.sku||'N/A',quantity:+(row.quantity||row.qty||1),unit_price:+(row.unit_price||row.price||0),discount_pct:+(row.discount_pct||row.discount||0),revenue:+(row.revenue||row.total||(row.quantity||1)*(row.unit_price||row.price||0)),channel:row.channel||'organic',state:row.state||'N/A',payment_method:row.payment_method||'other',order_status:row.order_status||row.status||'delivered',device:row.device||'desktop'};
    }).filter(r=>r.order_date&&r.revenue>0);
    if(mapped.length<10){cb(null,'Not enough valid rows');return}
    cb(mapped,null);
  },error:function(e){cb(null,e.message)}});
}

function filterData(data,filters){
  return data.filter(r=>{
    if(filters.start&&r.order_date<filters.start)return false;
    if(filters.end&&r.order_date>filters.end)return false;
    if(filters.categories.length&&!filters.categories.includes(r.product_category))return false;
    if(filters.channels.length&&!filters.channels.includes(r.channel))return false;
    if(filters.status==='delivered'&&r.order_status!=='delivered')return false;
    if(filters.status==='with-returns'&&r.order_status==='cancelled')return false;
    return true;
  });
}

/* Analytics computations */
function groupByMonth(data){
  const m={};data.forEach(r=>{const k=r.order_date.substring(0,7);if(!m[k])m[k]={rev:0,orders:0,customers:new Set()};m[k].rev+=r.revenue;m[k].orders++;m[k].customers.add(r.customer_id)});
  return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>({month:k,rev:+v.rev.toFixed(2),orders:v.orders,customers:v.customers.size}));
}

function groupBy(data,key){
  const m={};data.forEach(r=>{const k=r[key]||'Other';if(!m[k])m[k]=0;m[k]+=r.revenue});
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:k,value:+v.toFixed(2)}));
}

function computeRFM(data){
  const now=new Date(Math.max(...data.map(r=>new Date(r.order_date))));
  const custs={};data.filter(r=>r.order_status==='delivered').forEach(r=>{
    if(!custs[r.customer_id])custs[r.customer_id]={lastDate:r.order_date,freq:0,monetary:0};
    const c=custs[r.customer_id];if(r.order_date>c.lastDate)c.lastDate=r.order_date;c.freq++;c.monetary+=r.revenue;
  });
  const arr=Object.entries(custs).map(([id,c])=>({id,recency:Math.floor((now-new Date(c.lastDate))/(86400000)),frequency:c.freq,monetary:+c.monetary.toFixed(2)}));
  const quintile=(arr,key)=>{const sorted=[...arr].sort((a,b)=>a[key]-b[key]);const n=sorted.length;sorted.forEach((item,i)=>{item[key+'_score']=Math.min(5,Math.floor(i/(n/5))+1)})};
  quintile(arr,'recency');quintile(arr,'frequency');quintile(arr,'monetary');
  arr.forEach(c=>{c.recency_score=6-c.recency_score;const s=c.recency_score+c.frequency_score+c.monetary_score;
    if(s>=13)c.segment='Champions';else if(s>=10)c.segment='Loyal';else if(s>=8)c.segment='Potential';else if(s>=6)c.segment='At Risk';else if(s>=4)c.segment='Hibernating';else c.segment='Lost'});
  return arr;
}

function computeCohorts(data){
  const custs={};data.filter(r=>r.order_status==='delivered').forEach(r=>{
    if(!custs[r.customer_id])custs[r.customer_id]={first:r.order_date,months:new Set()};
    const c=custs[r.customer_id];if(r.order_date<c.first)c.first=r.order_date;c.months.add(r.order_date.substring(0,7));
  });
  const cohorts={};Object.values(custs).forEach(c=>{
    const cm=c.first.substring(0,7);if(!cohorts[cm])cohorts[cm]={total:0,retained:[0,0,0,0,0,0]};cohorts[cm].total++;
    const baseMonth=new Date(cm+'-01');c.months.forEach(m=>{const d=new Date(m+'-01');const diff=(d.getFullYear()-baseMonth.getFullYear())*12+(d.getMonth()-baseMonth.getMonth());if(diff>=0&&diff<6)cohorts[cm].retained[diff]++});
  });
  return Object.entries(cohorts).sort((a,b)=>a[0].localeCompare(b[0])).slice(0,6).map(([m,v])=>({month:m,total:v.total,retention:v.retained.map(r=>+(r/v.total*100).toFixed(1))}));
}

function linearRegression(x,y){
  const n=x.length;const sx=x.reduce((a,b)=>a+b,0);const sy=y.reduce((a,b)=>a+b,0);
  const sxy=x.reduce((a,v,i)=>a+v*y[i],0);const sxx=x.reduce((a,v)=>a+v*v,0);
  const slope=(n*sxy-sx*sy)/(n*sxx-sx*sx);const intercept=(sy-slope*sx)/n;
  const yPred=x.map(v=>slope*v+intercept);const ssRes=y.reduce((a,v,i)=>a+(v-yPred[i])**2,0);
  const ssTot=y.reduce((a,v)=>a+(v-sy/n)**2,0);const r2=1-ssRes/ssTot;
  const se=Math.sqrt(ssRes/(n-2));
  return{slope,intercept,r2,se,predict:(v)=>slope*v+intercept};
}

function detectAnomalies(monthly){
  const revs=monthly.map(m=>m.rev);const anomalies=[];
  for(let i=3;i<revs.length;i++){
    const window=revs.slice(i-4,i);const mean=window.reduce((a,b)=>a+b,0)/4;
    const std=Math.sqrt(window.reduce((a,v)=>a+(v-mean)**2,0)/4);
    if(Math.abs(revs[i]-mean)>2*std)anomalies.push({index:i,month:monthly[i].month,value:revs[i],mean,deviation:((revs[i]-mean)/mean*100).toFixed(1)});
  }
  return anomalies;
}

function computeABTest(){
  const ctrl={n:12400,conversions:1017,cvr:8.2,aov:86.40,rpv:7.08,sessions:4.2};
  const treat={n:12400,conversions:1138,cvr:9.18,aov:92.10,rpv:8.45,sessions:4.8};
  const p1=ctrl.conversions/ctrl.n,p2=treat.conversions/treat.n;
  const pPool=(ctrl.conversions+treat.conversions)/(ctrl.n+treat.n);
  const se=Math.sqrt(pPool*(1-pPool)*(1/ctrl.n+1/treat.n));
  const z=(p2-p1)/se;const pVal=2*(1-normalCDF(Math.abs(z)));
  return{ctrl,treat,z,pValue:+pVal.toFixed(4),significant:pVal<0.05,lift:+((p2-p1)/p1*100).toFixed(1),
    daily:Array.from({length:30},(_,i)=>({day:i+1,ctrl:+(7.5+Math.sin(i/4)*1.2+seededRandom(i+100)()*0.8).toFixed(1),treat:+(8.5+Math.sin(i/4)*1.1+seededRandom(i+200)()*0.9).toFixed(1)}))};
}

function normalCDF(x){const t=1/(1+0.2316419*Math.abs(x));const d=0.3989422804*Math.exp(-x*x/2);const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p}

function calcSampleSizeFormula(base,mde,alpha,power){
  const za=normalInv(1-alpha/2);const zb=normalInv(power);
  const p1=base/100;const p2=p1*(1+mde/100);
  const n=Math.ceil((za*Math.sqrt(2*p1*(1-p1))+zb*Math.sqrt(p1*(1-p1)+p2*(1-p2)))**2/(p2-p1)**2);
  return n;
}

function normalInv(p){
  const a1=-3.969683028665376e+01,a2=2.209460984245205e+02,a3=-2.759285104469687e+02,a4=1.383577518672690e+02,a5=-3.066479806614716e+01,a6=2.506628277459239e+00;
  const b1=-5.447609879822406e+01,b2=1.615858368580409e+02,b3=-1.556989798598866e+02,b4=6.680131188771972e+01,b5=-1.328068155288572e+01;
  const c1=-7.784894002430293e-03,c2=-3.223964580411365e-01,c3=-2.400758277161838e+00,c4=-2.549732539343734e+00,c5=4.374664141464968e+00,c6=2.938163982698783e+00;
  const d1=7.784695709041462e-03,d2=3.224671290700398e-01,d3=2.445134137142996e+00,d4=3.754408661907416e+00;
  const pLow=0.02425,pHigh=1-pLow;let q,r;
  if(p<pLow){q=Math.sqrt(-2*Math.log(p));return(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/(((((d1*q+d2)*q+d3)*q+d4)*q+1))}
  if(p<=pHigh){q=p-0.5;r=q*q;return(((((a1*r+a2)*r+a3)*r+a4)*r+a5)*r+a6)*q/(((((b1*r+b2)*r+b3)*r+b4)*r+b5)*r+1)}
  q=Math.sqrt(-2*Math.log(1-p));return-(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/(((((d1*q+d2)*q+d3)*q+d4)*q+1));
}

function bayesianAB(aConv,aN,bConv,bN,sims=50000){
  const rng=seededRandom(777);let bWins=0;
  for(let i=0;i<sims;i++){
    const a=betaSample(aConv+1,aN-aConv+1,rng);const b=betaSample(bConv+1,bN-bConv+1,rng);if(b>a)bWins++;
  }
  return+(bWins/sims*100).toFixed(1);
}

function betaSample(alpha,beta,rng){
  const ga=gammaSample(alpha,rng);const gb=gammaSample(beta,rng);return ga/(ga+gb);
}

function gammaSample(shape,rng){
  if(shape<1){return gammaSample(shape+1,rng)*Math.pow(rng(),1/shape)}
  const d=shape-1/3;const c=1/Math.sqrt(9*d);let x,v;
  while(true){do{x=normalSample(rng);v=1+c*x}while(v<=0);v=v*v*v;const u=rng();
    if(u<1-0.0331*(x*x)*(x*x))return d*v;if(Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v}
}

function normalSample(rng){const u=rng();const v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

function churnProbability(recency,frequency){
  const b0=-1.5,b1=0.025,b2=-0.35;const z=b0+b1*recency+b2*frequency;return 1/(1+Math.exp(-z));
}

function computeFunnel(data,channelFilter){
  let d=channelFilter?data.filter(r=>r.channel===channelFilter):data;
  const orders=d.filter(r=>r.order_status==='delivered').length;
  const ratio=orders/72000;
  return[{stage:'Impressions',val:Math.round(1850000*ratio)},{stage:'Sessions',val:Math.round(620000*ratio)},{stage:'Product Views',val:Math.round(310000*ratio)},{stage:'Add to Cart',val:Math.round(145000*ratio)},{stage:'Checkout',val:Math.round(89000*ratio)},{stage:'Purchase',val:Math.round(orders)}];
}
