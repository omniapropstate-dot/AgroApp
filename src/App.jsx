import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase.js";
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const C = {
  bg:"#060e08", sb:"#0a1410", card:"#0f1f14", cb:"#1a3020", cb2:"#244530",
  ac:"#4ade80", ac2:"#22c55e", gr:"#86efac", re:"#f87171", am:"#fbbf24",
  bl:"#60a5fa", pu:"#a78bfa", tx:"#d1fae5", mu:"#4d7a5a", wh:"#f0fdf4",
};
const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_L = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const PIE_COLORS = [C.ac,C.bl,C.am,C.pu,C.re,"#34d399","#06b6d4","#f472b6"];
const FASES = ["siembra","maternidad","recria","terminacion","cosechando","cosechado"];
const FASES_LABEL = ["🌱 Siembra","🌿 Maternidad","☘️ Recría","🥬 Terminación","✂️ Cosechando","✅ Cosechado"];
const FASES_COLOR = ["#60a5fa","#34d399","#4ade80","#22c55e","#fbbf24","#4d7a5a"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.tx};-webkit-font-smoothing:antialiased}
input,select{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.cb2};border-radius:4px}
.app-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sidebar{width:210px;background:${C.sb};border-right:1px solid ${C.cb};display:flex;flex-direction:column;padding:18px 10px;flex-shrink:0;height:100vh;overflow-y:auto}
.app-body{display:flex;flex:1;overflow:hidden}
.main-content{flex:1;overflow-y:auto;padding:22px 20px}
.mobile-header{display:none}.bottom-nav{display:none}
@media(max-width:768px){
  .mobile-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${C.sb};border-bottom:1px solid ${C.cb};flex-shrink:0}
  .sidebar{display:none!important}.main-content{padding:12px 12px 88px}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${C.sb};border-top:1px solid ${C.cb};padding:6px 0 10px}
  .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;cursor:pointer;border:none;background:none}
  .bottom-nav-item .nav-icon{font-size:20px}.bottom-nav-item .nav-label{font-size:10px;font-weight:500;color:${C.mu}}
  .bottom-nav-item.active .nav-label{color:${C.ac}}
  .g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr 1fr!important}.g4{grid-template-columns:1fr 1fr!important}
}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:${C.mu};transition:all 0.15s;margin-bottom:2px}
.nav-item:hover{background:rgba(74,222,128,0.06);color:${C.tx}}.nav-item.active{background:rgba(74,222,128,0.1);color:${C.ac}}
.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all 0.15s;display:inline-flex;align-items:center;gap:6px}
.btn:hover{opacity:0.85}.btn:disabled{opacity:0.4;cursor:not-allowed}
.btn-sm{padding:5px 11px;font-size:12px}
.btn-primary{background:${C.ac};color:${C.bg};font-weight:600}.btn-secondary{background:${C.cb};color:${C.tx}}
.btn-ghost{background:transparent;color:${C.mu};border:1px solid ${C.cb}}.btn-ghost:hover{border-color:${C.cb2};color:${C.tx}}
.btn-success{background:rgba(74,222,128,0.1);color:${C.ac};border:1px solid rgba(74,222,128,0.2)}
.btn-danger{background:rgba(248,113,113,0.08);color:${C.re};border:1px solid rgba(248,113,113,0.15)}
.form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.form-label{font-size:10px;color:${C.mu};font-weight:600;text-transform:uppercase;letter-spacing:0.6px}
.form-input{background:${C.bg};border:1px solid ${C.cb};border-radius:8px;padding:9px 12px;color:${C.tx};font-size:13px;outline:none;transition:border-color 0.15s;width:100%}
.form-input:focus{border-color:${C.ac2}}
.card{background:${C.card};border:1px solid ${C.cb};border-radius:14px;padding:18px 20px}
.card-sm{background:${C.card};border:1px solid ${C.cb};border-radius:10px;padding:14px 16px}
.table-wrapper{overflow-x:auto;background:${C.card};border-radius:12px;border:1px solid ${C.cb}}
.data-table{width:100%;border-collapse:collapse}
.data-table th{font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:${C.mu};padding:11px 14px;text-align:left;font-weight:600;border-bottom:1px solid ${C.cb};white-space:nowrap}
.data-table td{padding:11px 14px;font-size:13px;border-bottom:1px solid rgba(26,48,32,0.7)}
.data-table tr:last-child td{border-bottom:none}.table-row:hover{background:rgba(74,222,128,0.02)}
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-box{background:${C.card};border:1px solid ${C.cb};border-radius:16px;padding:26px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
.toast{position:fixed;top:20px;right:20px;background:${C.card};border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;z-index:2000;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid ${C.cb};font-size:13px;max-width:320px;animation:slideIn 0.25s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${C.bg};padding:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.gkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:${C.wh};letter-spacing:-0.3px}
.section-sub{color:${C.mu};font-size:13px;margin-top:3px}
.chart-title{font-size:13px;font-weight:600;color:${C.wh};margin-bottom:4px}
.chart-sub{font-size:11px;color:${C.mu};margin-bottom:16px}
.progress-bar{background:${C.bg};border-radius:4px;height:6px;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;transition:width 0.5s ease}
.tab-bar{display:flex;gap:4px;background:${C.card};border-radius:10px;padding:4px;border:1px solid ${C.cb};margin-bottom:16px;flex-wrap:wrap}
.tab-btn{flex:1;padding:7px;border-radius:7px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;white-space:nowrap}
.insight-box{background:linear-gradient(135deg,rgba(74,222,128,0.06),rgba(96,165,250,0.04));border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:14px 16px}
`;

const hoy = () => new Date().toISOString().split("T")[0];
const fmt = (n) => Number(n||0).toLocaleString("es-BO");
const addDias = (fecha, dias) => { const d = new Date(fecha); d.setDate(d.getDate()+dias); return d; };
const diffDias = (fecha) => Math.round((new Date(fecha)-new Date())/86400000);

const getBadgeStyle = (type) => {
  const map = {
    activo:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},siembra:{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},
    maternidad:{bg:"rgba(52,211,153,0.12)",c:"#34d399"},recria:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
    terminacion:{bg:"rgba(34,197,94,0.12)",c:"#22c55e"},cosechando:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
    cosechado:{bg:"rgba(77,122,90,0.12)",c:"#4d7a5a"},inactivo:{bg:"rgba(77,122,90,0.12)",c:"#4d7a5a"},
    pagado:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},pendiente:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
    alta:{bg:"rgba(248,113,113,0.12)",c:"#f87171"},media:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
    baja:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},resuelto:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
    "en progreso":{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},excelente:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
    buena:{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},regular:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
  };
  return map[type]||{bg:"rgba(77,122,90,0.12)",c:"#4d7a5a"};
};
const Badge = ({type}) => { const s=getBadgeStyle(type); return <span className="badge" style={{background:s.bg,color:s.c}}>{type||"—"}</span>; };

const KPI = ({label,value,color,sub,icon}) => (
  <div className="card-sm" style={{position:"relative",overflow:"hidden"}}>
    {icon&&<div style={{position:"absolute",top:10,right:14,fontSize:24,opacity:0.12}}>{icon}</div>}
    <p style={{fontSize:10,color:C.mu,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:6}}>{label}</p>
    <p style={{fontSize:22,fontWeight:800,color:color||C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px"}}>{value}</p>
    {sub&&<p style={{fontSize:11,color:C.mu,marginTop:4}}>{sub}</p>}
  </div>
);

const Modal = ({title,onClose,children,wide}) => (
  <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal-box" style={wide?{maxWidth:680}:{}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <p style={{fontSize:16,fontWeight:600,color:C.wh,fontFamily:"'Syne',sans-serif"}}>{title}</p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmDialog = ({message,onConfirm,onCancel}) => (
  <div className="modal-overlay">
    <div className="modal-box" style={{maxWidth:360}}>
      <p style={{fontSize:15,color:C.wh,marginBottom:8,fontWeight:500}}>¿Confirmar?</p>
      <p style={{fontSize:13,color:C.mu,marginBottom:24}}>{message}</p>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Confirmar</button>
      </div>
    </div>
  </div>
);

const Toast = ({toast,onClose}) => {
  if(!toast) return null;
  const color=toast.type==="error"?C.re:toast.type==="warn"?C.am:C.ac;
  return (
    <div className="toast">
      <span style={{color,fontWeight:700}}>{toast.type==="error"?"✕":toast.type==="warn"?"⚠":"✓"}</span>
      <span style={{color:C.tx}}>{toast.message}</span>
      <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:C.mu,cursor:"pointer"}}>✕</button>
    </div>
  );
};

const CustomTooltip = ({active,payload,label,suffix=""}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,padding:"10px 14px",fontSize:12}}>
      <p style={{color:C.mu,marginBottom:6,fontSize:11}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{color:p.color,fontWeight:600}}>{p.name}: {fmt(p.value)}{suffix}</p>)}
    </div>
  );
};

function getPeriodos(n,anio,mes) {
  const r=[];
  for(let i=n-1;i>=0;i--){let m=mes-i,a=anio;while(m<=0){m+=12;a--;}while(m>12){m-=12;a++;}r.push({mes:m,anio:a,label:`${MESES[m]} ${a}`,labelCorto:MESES[m]});}
  return r;
}

function CircleGauge({pct,color,label,sub,size=80}) {
  const r=(size-10)/2, circ=2*Math.PI*r, dash=circ*(Math.min(pct,100)/100);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.cb} strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray 0.5s ease"}}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          style={{fontSize:13,fontWeight:700,fill:pct>100?C.re:C.wh,fontFamily:"'Syne',sans-serif"}}>{pct}%</text>
      </svg>
      <p style={{fontSize:11,color:C.wh,fontWeight:600,textAlign:"center"}}>{label}</p>
      {sub&&<p style={{fontSize:10,color:C.mu,textAlign:"center"}}>{sub}</p>}
    </div>
  );
}

function FaseBar({lote}) {
  const fases=[{key:"siembra",dias:lote.dias_siembra||3},{key:"maternidad",dias:lote.dias_maternidad||11},{key:"recria",dias:lote.dias_recria||12},{key:"terminacion",dias:lote.dias_terminacion||20}];
  const total=fases.reduce((a,b)=>a+b.dias,0);
  const idxActual=FASES.indexOf(lote.fase_actual||"siembra");
  return (
    <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:1}}>
      {fases.map((f,i)=>{const idx=FASES.indexOf(f.key);const done=idx<idxActual;const active=f.key===lote.fase_actual;return <div key={i} style={{flex:f.dias/total,background:done||active?FASES_COLOR[idx]:C.cb,opacity:active?1:done?0.7:0.3}}/>;  })}
    </div>
  );
}

function Login({onLogin}) {
  const [f,setF]=useState({email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const go=async()=>{setLoading(true);setErr("");const{error}=await supabase.auth.signInWithPassword(f);if(error)setErr("Email o contraseña incorrectos");else onLogin();setLoading(false);};
  return (
    <div className="login-bg">
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:72,height:72,background:`linear-gradient(135deg,${C.ac},${C.bl})`,borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:34}}>🌱</div>
          <p style={{fontSize:28,fontWeight:800,color:C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px"}}>AgroApp</p>
          <p style={{fontSize:13,color:C.mu,marginTop:4}}>Gestión Agrícola Inteligente</p>
        </div>
        <div className="card">
          {err&&<div style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:16}}><p style={{color:C.re,fontSize:13}}>{err}</p></div>}
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div className="form-group" style={{marginBottom:20}}><label className="form-label">Contraseña</label><input className="form-input" type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={go} disabled={loading}>{loading?"Ingresando...":"Ingresar"}</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({lotes,cosechas,ventas,gastos,incidencias}) {
  const now=new Date();const mes=now.getMonth()+1;const anio=now.getFullYear();
  const periodos=useMemo(()=>getPeriodos(6,anio,mes),[]);
  const cosechasMes=cosechas.filter(c=>{const d=new Date(c.fecha);return d.getMonth()+1===mes&&d.getFullYear()===anio;});
  const cosechasMesAnt=cosechas.filter(c=>{const d=new Date(c.fecha);const ma=mes===1?12:mes-1,aa=mes===1?anio-1:anio;return d.getMonth()+1===ma&&d.getFullYear()===aa;});
  const kgMes=cosechasMes.reduce((a,b)=>a+Number(b.cantidad_kg||0),0);
  const kgMesAnt=cosechasMesAnt.reduce((a,b)=>a+Number(b.cantidad_kg||0),0);
  const ventasMes=ventas.filter(v=>{const d=new Date(v.fecha);return d.getMonth()+1===mes&&d.getFullYear()===anio;});
  const ingresosMes=ventasMes.reduce((a,b)=>a+Number(b.total||0),0);
  const gastosMes=gastos.filter(g=>{const d=new Date(g.fecha);return d.getMonth()+1===mes&&d.getFullYear()===anio;});
  const totalGastosMes=gastosMes.reduce((a,b)=>a+Number(b.monto||0),0);
  const netoMes=ingresosMes-totalGastosMes;
  const incPendientes=incidencias.filter(i=>i.estado!=="resuelto").length;
  const lotesActivos=lotes.filter(l=>l.fase_actual!=="cosechado"&&l.fase_actual!=="inactivo").length;
  const deltaKg=kgMesAnt>0?((kgMes-kgMesAnt)/kgMesAnt*100).toFixed(1):null;

  const evolucion=useMemo(()=>periodos.map(p=>{
    const cM=cosechas.filter(c=>{const d=new Date(c.fecha);return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio;});
    const vM=ventas.filter(v=>{const d=new Date(v.fecha);return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio;});
    const gM=gastos.filter(g=>{const d=new Date(g.fecha);return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio;});
    return{...p,kg:cM.reduce((a,b)=>a+Number(b.cantidad_kg||0),0),ingresos:vM.reduce((a,b)=>a+Number(b.total||0),0),gastos:gM.reduce((a,b)=>a+Number(b.monto||0),0)};
  }),[periodos,cosechas,ventas,gastos]);

  const porCultivo=useMemo(()=>{
    const map={};cosechas.forEach(c=>{const l=lotes.find(x=>x.id===c.lote_id);const k=l?.cultivo||"Otros";map[k]=(map[k]||0)+Number(c.cantidad_kg||0);});
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,6);
  },[cosechas,lotes]);

  const mejorMes=evolucion.reduce((a,b)=>b.kg>a.kg?b:a,evolucion[0]||{});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">🌿 Dashboard</p><p className="section-sub">{MESES_L[mes]} {anio} · Vista general</p></div>
      </div>
      <div className="gkpi" style={{marginBottom:16}}>
        <KPI label="Cosechado este mes" value={`${fmt(kgMes)} kg`} color={C.ac} icon="🌾" sub={deltaKg?`${Number(deltaKg)>=0?"↑":"↓"} ${Math.abs(deltaKg)}% vs mes ant.`:""}/>
        <KPI label="Ingresos del mes" value={`Bs. ${fmt(ingresosMes)}`} color={C.gr} icon="💵"/>
        <KPI label="Gastos del mes" value={`Bs. ${fmt(totalGastosMes)}`} color={C.re} icon="💸"/>
        <KPI label="Resultado neto" value={`Bs. ${fmt(netoMes)}`} color={netoMes>=0?C.ac:C.re} icon="📊"/>
        <KPI label="Lotes activos" value={lotesActivos} color={C.bl} sub={`de ${lotes.length} totales`} icon="🌱"/>
        <KPI label="Incidencias" value={incPendientes} color={incPendientes>0?C.am:C.ac} sub="pendientes" icon="⚠️"/>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <p className="chart-title">Producción mensual (kg)</p>
        <p className="chart-sub">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evolucion}>
            <defs><linearGradient id="gKg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.ac} stopOpacity={0.3}/><stop offset="95%" stopColor={C.ac} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false}/>
            <XAxis dataKey="labelCorto" tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip suffix=" kg"/>}/>
            <Area type="monotone" dataKey="kg" name="Cosecha" stroke={C.ac} fill="url(#gKg)" strokeWidth={2} dot={{fill:C.ac,r:3}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="g2" style={{marginBottom:14}}>
        <div className="card">
          <p className="chart-title">Ingresos vs Gastos</p><p className="chart-sub">Mensual</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={evolucion} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false}/>
              <XAxis dataKey="labelCorto" tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.mu,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="ingresos" name="Ingresos" fill={C.ac} radius={[3,3,0,0]}/>
              <Bar dataKey="gastos" name="Gastos" fill={C.re} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <p className="chart-title">Cosecha por cultivo</p><p className="chart-sub">Distribución histórica</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart><Pie data={porCultivo} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                {porCultivo.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie><Tooltip formatter={v=>[`${fmt(v)} kg`,"Cosecha"]} contentStyle={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,fontSize:12}}/></PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>{porCultivo.slice(0,5).map((d,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cb}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length]}}/><span style={{fontSize:12}}>{d.name}</span></div>
                <span style={{fontSize:11,fontWeight:600,color:C.mu}}>{fmt(d.value)} kg</span>
              </div>
            ))}</div>
          </div>
        </div>
      </div>
      <div className="card">
        <p className="chart-title" style={{marginBottom:14}}>Resumen rápido</p>
        <div className="g3">
          <div className="insight-box"><p style={{fontSize:11,color:C.ac,fontWeight:600,marginBottom:3}}>🏆 Mejor mes</p><p style={{fontSize:13}}>{mejorMes?.label} — {fmt(mejorMes?.kg)} kg</p></div>
          <div className="insight-box" style={{borderColor:"rgba(96,165,250,0.15)"}}><p style={{fontSize:11,color:C.bl,fontWeight:600,marginBottom:3}}>📦 Ventas este mes</p><p style={{fontSize:13}}>{ventasMes.length} ventas · Bs. {fmt(ingresosMes)}</p></div>
          <div className="insight-box" style={{borderColor:incPendientes>0?"rgba(248,113,113,0.2)":"rgba(74,222,128,0.15)"}}><p style={{fontSize:11,color:incPendientes>0?C.re:C.ac,fontWeight:600,marginBottom:3}}>🌿 Estado del campo</p><p style={{fontSize:13}}>{incPendientes===0?"Todo en orden ✓":`${incPendientes} incidencias activas`}</p></div>
        </div>
      </div>
    </div>
  );
}

function Produccion({lotes,cosechas,reload,showToast}) {
  const [tab,setTab]=useState("lotes");
  const [modal,setModal]=useState(null);
  const [detalle,setDetalle]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [saving,setSaving]=useState(false);
  const CAP=300;
  const [fl,setFl]=useState({nombre:"",cultivo:"",seccion:"",fase_actual:"siembra",plantas_actuales:0,fecha_siembra:"",fecha_fase_actual:"",dias_siembra:3,dias_maternidad:11,dias_recria:12,dias_terminacion:20,notas:""});
  const [fc,setFc]=useState({lote_id:"",fecha:hoy(),cantidad_kg:"",calidad:"buena",precio_kg:"",notas:""});

  const saveLote=async()=>{
    if(!fl.nombre||!fl.cultivo)return showToast("Completá nombre y cultivo","error");setSaving(true);
    const data={...fl,plantas_actuales:Number(fl.plantas_actuales||0),dias_siembra:Number(fl.dias_siembra||3),dias_maternidad:Number(fl.dias_maternidad||11),dias_recria:Number(fl.dias_recria||12),dias_terminacion:Number(fl.dias_terminacion||20)};
    if(modal==="nuevo-lote")await supabase.from("lotes").insert([data]);else await supabase.from("lotes").update(data).eq("id",fl.id);
    setModal(null);reload();showToast(modal==="nuevo-lote"?"Lote registrado":"Actualizado");setSaving(false);
  };
  const saveCosecha=async()=>{
    if(!fc.lote_id||!fc.cantidad_kg)return showToast("Completá lote y cantidad","error");setSaving(true);
    await supabase.from("cosechas").insert([{...fc,cantidad_kg:Number(fc.cantidad_kg),precio_kg:Number(fc.precio_kg||0)}]);
    setModal(null);reload();showToast("Cosecha registrada");setSaving(false);
  };
  const avanzarFase=async(lote)=>{
    const idx=FASES.indexOf(lote.fase_actual||"siembra");if(idx>=FASES.length-1)return;
    await supabase.from("lotes").update({fase_actual:FASES[idx+1],fecha_fase_actual:hoy()}).eq("id",lote.id);
    reload();showToast(`Avanzado a ${FASES_LABEL[idx+1]}`);setDetalle(null);
  };
  const eliminarLote=async()=>{await supabase.from("lotes").delete().eq("id",confirmDelete);setConfirmDelete(null);reload();showToast("Eliminado");setDetalle(null);};

  const capPorFase=useMemo(()=>FASES.slice(0,5).map((fase,i)=>{
    const plantas=lotes.filter(l=>l.fase_actual===fase).reduce((a,b)=>a+Number(b.plantas_actuales||0),0);
    return{fase,label:FASES_LABEL[i],plantas,pct:Math.round((plantas/CAP)*100),color:FASES_COLOR[i]};
  }),[lotes]);

  const operaciones=useMemo(()=>{
    const ops=[];
    lotes.forEach(l=>{
      if(!l.fecha_fase_actual||l.fase_actual==="cosechado")return;
      const idx=FASES.indexOf(l.fase_actual||"siembra");
      const diasFase=[l.dias_siembra,l.dias_maternidad,l.dias_recria,l.dias_terminacion,7][idx]||7;
      const fechaTrans=addDias(new Date(l.fecha_fase_actual+"T12:00:00"),diasFase);
      const diff=diffDias(fechaTrans);
      if(diff>=-1&&diff<=14)ops.push({lote:l,accion:FASES_LABEL[idx+1]||"✅ Cosechar",diff,fecha:fechaTrans,color:FASES_COLOR[idx+1]||C.am});
    });
    return ops.sort((a,b)=>a.diff-b.diff);
  },[lotes]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">🌱 Producción</p><p className="section-sub">{lotes.filter(l=>l.fase_actual!=="cosechado").length} lotes en producción</p></div>
        <div style={{display:"flex",gap:6}}>
          {tab==="lotes"&&<button className="btn btn-primary btn-sm" onClick={()=>{setFl({nombre:"",cultivo:"",seccion:"",fase_actual:"siembra",plantas_actuales:0,fecha_siembra:"",fecha_fase_actual:hoy(),dias_siembra:3,dias_maternidad:11,dias_recria:12,dias_terminacion:20,notas:""});setModal("nuevo-lote");}}>+ Lote</button>}
          {tab==="cosechas"&&<button className="btn btn-primary btn-sm" onClick={()=>{setFc({lote_id:"",fecha:hoy(),cantidad_kg:"",calidad:"buena",precio_kg:"",notas:""});setModal("nuevo-cosecha");}}>+ Cosecha</button>}
        </div>
      </div>

      {/* Gauges */}
      <div className="card" style={{marginBottom:14}}>
        <p className="chart-title" style={{marginBottom:16}}>Capacidad por fase — {CAP} plantas máx.</p>
        <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:16}}>
          {capPorFase.map((f,i)=><CircleGauge key={i} pct={f.pct} color={f.color} label={f.label} sub={`${fmt(f.plantas)} plantas`} size={80}/>)}
        </div>
      </div>

      <div className="tab-bar">
        {[["lotes","🌿 Lotes"],["operaciones","📅 Operaciones"],["cosechas","🌾 Cosechas"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>
            {label}{id==="operaciones"&&operaciones.length>0&&<span style={{marginLeft:4,background:C.am,color:C.bg,borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700}}>{operaciones.length}</span>}
          </button>
        ))}
      </div>

      {tab==="lotes"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>
          {lotes.length===0&&<div className="card" style={{textAlign:"center",color:C.mu,padding:40,gridColumn:"1/-1"}}>Sin lotes. Creá el primero.</div>}
          {lotes.map(l=>{
            const idxFase=FASES.indexOf(l.fase_actual||"siembra");const color=FASES_COLOR[idxFase]||C.mu;
            const kgTotal=cosechas.filter(c=>c.lote_id===l.id).reduce((a,b)=>a+Number(b.cantidad_kg||0),0);
            const diasEnFase=l.fecha_fase_actual?Math.abs(diffDias(new Date(l.fecha_fase_actual+"T12:00:00"))):null;
            return (
              <div key={l.id} onClick={()=>setDetalle(l)} style={{background:C.card,border:`1px solid ${C.cb}`,borderRadius:14,padding:16,cursor:"pointer",transition:"all 0.15s",borderTop:`3px solid ${color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div><p style={{fontSize:13,fontWeight:700,color:C.wh}}>{l.nombre}</p><p style={{fontSize:12,color:C.mu,marginTop:2}}>{l.cultivo}</p></div>
                  <Badge type={l.fase_actual||"siembra"}/>
                </div>
                <FaseBar lote={l}/>
                <div style={{marginTop:12,display:"flex",justifyContent:"space-between"}}>
                  <div><p style={{fontSize:10,color:C.mu}}>PLANTAS</p><p style={{fontSize:15,fontWeight:700,color}}>{fmt(l.plantas_actuales||0)}</p></div>
                  <div style={{textAlign:"right"}}><p style={{fontSize:10,color:C.mu}}>COSECHADO</p><p style={{fontSize:15,fontWeight:700,color:C.ac}}>{fmt(kgTotal)} kg</p></div>
                </div>
                {diasEnFase!==null&&<p style={{fontSize:10,color:C.mu,marginTop:8}}>{diasEnFase}d en esta fase · {l.seccion||""}</p>}
              </div>
            );
          })}
        </div>
      )}

      {tab==="operaciones"&&(
        <div>
          {operaciones.length===0&&<div className="card" style={{textAlign:"center",padding:50,color:C.mu}}><p style={{fontSize:40,marginBottom:8}}>📅</p><p>Sin operaciones en los próximos 14 días</p></div>}
          {operaciones.map((op,i)=>{
            const esHoy=op.diff===0;const pasado=op.diff<0;
            return (
              <div key={i} style={{background:esHoy?"rgba(251,191,36,0.04)":C.card,border:`1px solid ${esHoy?"rgba(251,191,36,0.4)":C.cb}`,borderLeft:`4px solid ${esHoy?C.am:pasado?C.re:op.color}`,borderRadius:12,padding:"14px 18px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${op.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{esHoy?"🔔":pasado?"⏰":"📅"}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:600,color:C.wh}}>{op.lote.nombre} <span style={{color:C.mu}}>—</span> <span style={{color:op.color}}>{op.accion}</span></p>
                  <p style={{fontSize:12,color:C.mu,marginTop:2}}>{op.lote.cultivo} · {fmt(op.lote.plantas_actuales||0)} plantas</p>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:esHoy?C.am:pasado?C.re:C.wh}}>{esHoy?"¡Hoy!":pasado?`Hace ${Math.abs(op.diff)}d`:op.diff===1?"Mañana":`En ${op.diff}d`}</p>
                  <p style={{fontSize:11,color:C.mu,marginTop:2}}>{op.fecha.toLocaleDateString("es-BO",{day:"2-digit",month:"short"})}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="cosechas"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Lote</th><th>Cultivo</th><th>Fecha</th><th>Cantidad</th><th>Calidad</th><th>Precio/kg</th></tr></thead>
            <tbody>
              {cosechas.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:C.mu,padding:28}}>Sin cosechas registradas</td></tr>}
              {cosechas.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(c=>{
                const lote=lotes.find(l=>l.id===c.lote_id);
                return <tr key={c.id} className="table-row"><td style={{fontWeight:500}}>{lote?.nombre||"—"}</td><td style={{color:C.mu}}>{lote?.cultivo||"—"}</td><td style={{color:C.mu,fontSize:12}}>{c.fecha}</td><td style={{fontWeight:600,color:C.ac}}>{fmt(c.cantidad_kg)} kg</td><td><Badge type={c.calidad}/></td><td style={{color:C.mu}}>Bs. {fmt(c.precio_kg)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete&&<ConfirmDialog message="¿Eliminar este lote?" onConfirm={eliminarLote} onCancel={()=>setConfirmDelete(null)}/>}

      {detalle&&(
        <Modal title={`${detalle.nombre} — ${detalle.cultivo}`} onClose={()=>setDetalle(null)}>
          <div style={{marginBottom:16}}><FaseBar lote={detalle}/>
            <div style={{display:"flex",justifyContent:"space-around",marginTop:10}}>
              {FASES.slice(0,5).map((f,i)=><div key={i} style={{textAlign:"center",opacity:detalle.fase_actual===f?1:FASES.indexOf(detalle.fase_actual)>i?0.6:0.25}}><p style={{fontSize:16}}>{["🌱","🌿","☘️","🥬","✂️"][i]}</p><p style={{fontSize:9,color:FASES_COLOR[i]}}>{["S","M","R","T","C"][i]}</p></div>)}
            </div>
          </div>
          <div className="g2" style={{marginBottom:16}}>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>FASE</p><Badge type={detalle.fase_actual}/></div>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>PLANTAS</p><p style={{fontSize:16,fontWeight:700,color:C.ac}}>{fmt(detalle.plantas_actuales||0)}</p></div>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>SECCIÓN</p><p style={{fontSize:13}}>{detalle.seccion||"—"}</p></div>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>SIEMBRA</p><p style={{fontSize:13}}>{detalle.fecha_siembra||"—"}</p></div>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>DÍAS/FASE</p><p style={{fontSize:12}}>S:{detalle.dias_siembra}d M:{detalle.dias_maternidad}d R:{detalle.dias_recria}d T:{detalle.dias_terminacion}d</p></div>
            <div><p style={{fontSize:10,color:C.mu,marginBottom:3}}>KG COSECHADO</p><p style={{fontSize:16,fontWeight:700,color:C.ac}}>{fmt(cosechas.filter(c=>c.lote_id===detalle.id).reduce((a,b)=>a+Number(b.cantidad_kg||0),0))} kg</p></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {detalle.fase_actual!=="cosechado"&&<button className="btn btn-success btn-sm" onClick={()=>avanzarFase(detalle)}>⬆ Avanzar fase</button>}
            <button className="btn btn-ghost btn-sm" onClick={()=>{setFl(detalle);setDetalle(null);setModal("editar-lote");}}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={()=>setConfirmDelete(detalle.id)}>Eliminar</button>
          </div>
        </Modal>
      )}

      {(modal==="nuevo-lote"||modal==="editar-lote")&&(
        <Modal title={modal==="nuevo-lote"?"Nuevo Lote":"Editar Lote"} onClose={()=>setModal(null)}>
          <div className="g2">
            <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Lote A3" value={fl.nombre} onChange={e=>setFl(p=>({...p,nombre:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Cultivo *</label><input className="form-input" placeholder="Ej: Tomate cherry" value={fl.cultivo} onChange={e=>setFl(p=>({...p,cultivo:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Sección</label><input className="form-input" value={fl.seccion||""} onChange={e=>setFl(p=>({...p,seccion:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fase actual</label>
              <select className="form-input" value={fl.fase_actual} onChange={e=>setFl(p=>({...p,fase_actual:e.target.value}))}>
                {FASES.map((f,i)=><option key={f} value={f}>{FASES_LABEL[i]}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Plantas actuales</label><input className="form-input" type="number" value={fl.plantas_actuales||0} onChange={e=>setFl(p=>({...p,plantas_actuales:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha fase actual</label><input className="form-input" type="date" value={fl.fecha_fase_actual||""} onChange={e=>setFl(p=>({...p,fecha_fase_actual:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha siembra</label><input className="form-input" type="date" value={fl.fecha_siembra||""} onChange={e=>setFl(p=>({...p,fecha_siembra:e.target.value}))}/></div>
          </div>
          <p style={{fontSize:11,color:C.mu,marginBottom:8,marginTop:4}}>DÍAS POR FASE</p>
          <div className="g4">
            <div className="form-group"><label className="form-label">🌱 Siembra</label><input className="form-input" type="number" value={fl.dias_siembra||3} onChange={e=>setFl(p=>({...p,dias_siembra:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">🌿 Maternidad</label><input className="form-input" type="number" value={fl.dias_maternidad||11} onChange={e=>setFl(p=>({...p,dias_maternidad:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">☘️ Recría</label><input className="form-input" type="number" value={fl.dias_recria||12} onChange={e=>setFl(p=>({...p,dias_recria:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">🥬 Terminación</label><input className="form-input" type="number" value={fl.dias_terminacion||20} onChange={e=>setFl(p=>({...p,dias_terminacion:e.target.value}))}/></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fl.notas||""} onChange={e=>setFl(p=>({...p,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveLote} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {modal==="nuevo-cosecha"&&(
        <Modal title="Registrar Cosecha" onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Lote *</label>
            <select className="form-input" value={fc.lote_id} onChange={e=>setFc(p=>({...p,lote_id:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {lotes.map(l=><option key={l.id} value={l.id}>{l.nombre} — {l.cultivo}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Fecha *</label><input className="form-input" type="date" value={fc.fecha} onChange={e=>setFc(p=>({...p,fecha:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Cantidad (kg) *</label><input className="form-input" type="number" value={fc.cantidad_kg} onChange={e=>setFc(p=>({...p,cantidad_kg:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Calidad</label>
              <select className="form-input" value={fc.calidad} onChange={e=>setFc(p=>({...p,calidad:e.target.value}))}>
                {["excelente","buena","regular","baja"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Precio/kg (Bs.)</label><input className="form-input" type="number" value={fc.precio_kg} onChange={e=>setFc(p=>({...p,precio_kg:e.target.value}))}/></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveCosecha} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Finanzas({ventas,gastos,clientes,reload,showToast}) {
  const now=new Date();
  const [tab,setTab]=useState("resumen");
  const [modalVenta,setModalVenta]=useState(false);
  const [modalGasto,setModalGasto]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [deleteType,setDeleteType]=useState(null);
  const [saving,setSaving]=useState(false);
  const [mesesGraf,setMesesGraf]=useState(6);
  const [fv,setFv]=useState({cliente_id:"",fecha:hoy(),cantidad_kg:"",precio_kg:"",total:"",estado:"pendiente"});
  const [fg,setFg]=useState({categoria:"",descripcion:"",monto:"",fecha:hoy()});

  const periodos=useMemo(()=>getPeriodos(mesesGraf,now.getFullYear(),now.getMonth()+1),[mesesGraf]);
  const evolucion=useMemo(()=>periodos.map(p=>{
    const vM=ventas.filter(v=>{const d=new Date(v.fecha);return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio;});
    const gM=gastos.filter(g=>{const d=new Date(g.fecha);return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio;});
    const ingresos=vM.reduce((a,b)=>a+Number(b.total||0),0);const gasto=gM.reduce((a,b)=>a+Number(b.monto||0),0);
    return{...p,ingresos,gastos:gasto,neto:ingresos-gasto};
  }),[periodos,ventas,gastos]);

  const totalVentas=ventas.reduce((a,b)=>a+Number(b.total||0),0);
  const totalGastos=gastos.reduce((a,b)=>a+Number(b.monto||0),0);
  const totalNeto=totalVentas-totalGastos;
  const ventasPendientes=ventas.filter(v=>v.estado==="pendiente").reduce((a,b)=>a+Number(b.total||0),0);

  const rankingClientes=useMemo(()=>{
    const map={};ventas.forEach(v=>{const cli=clientes.find(c=>c.id===v.cliente_id);const key=cli?.nombre||"Directo";map[key]=(map[key]||0)+Number(v.total||0);});
    const max=Math.max(...Object.values(map),1);
    return Object.entries(map).map(([nombre,total])=>({nombre,total,pct:Math.round((total/max)*100)})).sort((a,b)=>b.total-a.total).slice(0,6);
  },[ventas,clientes]);

  const gastosPorCategoria=useMemo(()=>{
    const map={};gastos.forEach(g=>{map[g.categoria||"Otros"]=(map[g.categoria||"Otros"]||0)+Number(g.monto||0);});
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  },[gastos]);

  const saveVenta=async()=>{if(!fv.fecha||!fv.total)return showToast("Completá fecha y total","error");setSaving(true);await supabase.from("ventas").insert([{...fv,cantidad_kg:Number(fv.cantidad_kg||0),precio_kg:Number(fv.precio_kg||0),total:Number(fv.total)}]);setModalVenta(false);reload();showToast("Venta registrada");setSaving(false);};
  const saveGasto=async()=>{if(!fg.categoria||!fg.monto)return showToast("Completá categoría y monto","error");setSaving(true);await supabase.from("gastos").insert([{...fg,monto:Number(fg.monto)}]);setModalGasto(false);reload();showToast("Gasto registrado");setSaving(false);};
  const eliminar=async()=>{if(deleteType==="venta")await supabase.from("ventas").delete().eq("id",confirmDelete);else await supabase.from("gastos").delete().eq("id",confirmDelete);setConfirmDelete(null);setDeleteType(null);reload();showToast("Eliminado");};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">💰 Finanzas</p><p className="section-sub">Ventas, gastos y análisis</p></div>
        <div style={{display:"flex",gap:6}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>{setFg({categoria:"",descripcion:"",monto:"",fecha:hoy()});setModalGasto(true);}}>+ Gasto</button>
          <button className="btn btn-primary btn-sm" onClick={()=>{setFv({cliente_id:"",fecha:hoy(),cantidad_kg:"",precio_kg:"",total:"",estado:"pendiente"});setModalVenta(true);}}>+ Venta</button>
        </div>
      </div>

      {/* Stats grandes */}
      <div className="g4" style={{marginBottom:16}}>
        <div className="card-sm" style={{borderTop:`3px solid ${C.ac}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Total ingresos</p><p style={{fontSize:20,fontWeight:800,color:C.ac,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(totalVentas)}</p><p style={{fontSize:11,color:C.mu,marginTop:4}}>{ventas.length} ventas</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.re}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Total gastos</p><p style={{fontSize:20,fontWeight:800,color:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(totalGastos)}</p><p style={{fontSize:11,color:C.mu,marginTop:4}}>{gastos.length} registros</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${totalNeto>=0?C.ac:C.re}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Neto</p><p style={{fontSize:20,fontWeight:800,color:totalNeto>=0?C.ac:C.re,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(totalNeto)}</p><p style={{fontSize:11,color:totalNeto>=0?C.ac:C.re,marginTop:4}}>{totalNeto>=0?"Rentable ✓":"Déficit"}</p></div>
        <div className="card-sm" style={{borderTop:`3px solid ${C.am}`,textAlign:"center"}}><p style={{fontSize:10,color:C.mu,textTransform:"uppercase",marginBottom:6}}>Por cobrar</p><p style={{fontSize:20,fontWeight:800,color:C.am,fontFamily:"'Syne',sans-serif"}}>Bs. {fmt(ventasPendientes)}</p><p style={{fontSize:11,color:C.mu,marginTop:4}}>{ventas.filter(v=>v.estado==="pendiente").length} pendientes</p></div>
      </div>

      <div className="tab-bar">
        {[["resumen","📊 Resumen"],["ventas","💵 Ventas"],["gastos","💸 Gastos"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>{label}</button>
        ))}
      </div>

      {tab==="resumen"&&(
        <>
          <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center"}}>
            <span style={{fontSize:12,color:C.mu}}>Período:</span>
            {[3,6,12].map(n=><button key={n} className={`btn btn-sm ${mesesGraf===n?"btn-primary":"btn-ghost"}`} onClick={()=>setMesesGraf(n)}>{n}M</button>)}
          </div>
          <div className="card" style={{marginBottom:14}}>
            <p className="chart-title">Ingresos vs Gastos</p><p className="chart-sub">Evolución mensual</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={evolucion} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false}/>
                <XAxis dataKey="labelCorto" tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.mu,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="ingresos" name="Ingresos" fill={C.ac} radius={[3,3,0,0]}/>
                <Bar dataKey="gastos" name="Gastos" fill={C.re} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="g2">
            <div className="card">
              <p className="chart-title">Ranking de clientes</p><p className="chart-sub">Por volumen de compra</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {rankingClientes.map((c,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</span><span style={{fontSize:12}}>{c.nombre}</span></div>
                      <span style={{fontSize:12,fontWeight:600,color:C.ac}}>Bs. {fmt(c.total)}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${c.pct}%`,background:PIE_COLORS[i%PIE_COLORS.length]}}/></div>
                  </div>
                ))}
                {rankingClientes.length===0&&<p style={{color:C.mu,fontSize:13}}>Sin ventas</p>}
              </div>
            </div>
            <div className="card">
              <p className="chart-title">Gastos por categoría</p><p className="chart-sub">Distribución histórica</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart><Pie data={gastosPorCategoria} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {gastosPorCategoria.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie><Tooltip formatter={v=>[`Bs. ${fmt(v)}`,"Gasto"]} contentStyle={{background:C.card,border:`1px solid ${C.cb2}`,borderRadius:10,fontSize:12}}/></PieChart>
                </ResponsiveContainer>
                <div style={{flex:1}}>{gastosPorCategoria.slice(0,5).map((d,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${C.cb}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length]}}/><span style={{fontSize:11}}>{d.name}</span></div>
                    <span style={{fontSize:11,fontWeight:600,color:C.mu}}>Bs. {fmt(d.value)}</span>
                  </div>
                ))}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab==="ventas"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Fecha</th><th>Cantidad</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {ventas.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:C.mu,padding:28}}>Sin ventas</td></tr>}
              {ventas.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(v=>{
                const cli=clientes.find(c=>c.id===v.cliente_id);
                return <tr key={v.id} className="table-row"><td style={{fontWeight:500}}>{cli?.nombre||"Directo"}</td><td style={{color:C.mu,fontSize:12}}>{v.fecha}</td><td>{v.cantidad_kg?`${fmt(v.cantidad_kg)} kg`:"—"}</td><td style={{fontWeight:600,color:C.ac}}>Bs. {fmt(v.total)}</td><td><Badge type={v.estado}/></td><td><div style={{display:"flex",gap:4}}>{v.estado==="pendiente"&&<button className="btn btn-success btn-sm" onClick={async()=>{await supabase.from("ventas").update({estado:"pagado"}).eq("id",v.id);reload();showToast("Cobrado");}}>✓</button>}<button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(v.id);setDeleteType("venta");}}>✕</button></div></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab==="gastos"&&(
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Categoría</th><th>Descripción</th><th>Fecha</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {gastos.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:C.mu,padding:28}}>Sin gastos</td></tr>}
              {gastos.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(g=>(
                <tr key={g.id} className="table-row"><td style={{fontWeight:500}}>{g.categoria}</td><td style={{color:C.mu,fontSize:12}}>{g.descripcion||"—"}</td><td style={{color:C.mu,fontSize:12}}>{g.fecha}</td><td style={{fontWeight:600,color:C.re}}>Bs. {fmt(g.monto)}</td><td><button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(g.id);setDeleteType("gasto");}}>✕</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete&&<ConfirmDialog message="¿Eliminar este registro?" onConfirm={eliminar} onCancel={()=>{setConfirmDelete(null);setDeleteType(null);}}/>}

      {modalVenta&&(
        <Modal title="Registrar Venta" onClose={()=>setModalVenta(false)}>
          <div className="form-group"><label className="form-label">Cliente</label>
            <select className="form-input" value={fv.cliente_id} onChange={e=>setFv(p=>({...p,cliente_id:e.target.value}))}>
              <option value="">Sin cliente / directo</option>
              {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Fecha *</label><input className="form-input" type="date" value={fv.fecha} onChange={e=>setFv(p=>({...p,fecha:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Cantidad (kg)</label><input className="form-input" type="number" value={fv.cantidad_kg} onChange={e=>setFv(p=>({...p,cantidad_kg:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Precio/kg</label><input className="form-input" type="number" value={fv.precio_kg} onChange={e=>setFv(p=>({...p,precio_kg:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Total (Bs.) *</label><input className="form-input" type="number" value={fv.total} onChange={e=>setFv(p=>({...p,total:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={fv.estado} onChange={e=>setFv(p=>({...p,estado:e.target.value}))}>{["pendiente","pagado"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModalVenta(false)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveVenta} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {modalGasto&&(
        <Modal title="Registrar Gasto" onClose={()=>setModalGasto(false)}>
          <div className="form-group"><label className="form-label">Categoría *</label>
            <select className="form-input" value={fg.categoria} onChange={e=>setFg(p=>({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["Semillas","Nutrientes","Agua","Electricidad","Mano de obra","Mantenimiento","Transporte","Empaque","Otros"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fg.descripcion} onChange={e=>setFg(p=>({...p,descripcion:e.target.value}))}/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Monto (Bs.) *</label><input className="form-input" type="number" value={fg.monto} onChange={e=>setFg(p=>({...p,monto:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fg.fecha} onChange={e=>setFg(p=>({...p,fecha:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModalGasto(false)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Gestion({clientes,incidencias,inventario,reload,showToast}) {
  const [tab,setTab]=useState("incidencias");
  const [modal,setModal]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [deleteType,setDeleteType]=useState(null);
  const [saving,setSaving]=useState(false);
  const [fi,setFi]=useState({titulo:"",descripcion:"",area:"",prioridad:"media",estado:"pendiente",fecha:hoy()});
  const [fc,setFc]=useState({nombre:"",contacto:"",email:"",telefono:"",notas:""});
  const [finv,setFinv]=useState({nombre:"",categoria:"",cantidad:"",unidad:"",stock_minimo:"",notas:""});

  const saveInc=async()=>{if(!fi.titulo)return showToast("Completá el título","error");setSaving(true);if(modal==="nuevo-inc")await supabase.from("incidencias").insert([fi]);else await supabase.from("incidencias").update(fi).eq("id",fi.id);setModal(null);reload();showToast("Guardado");setSaving(false);};
  const saveCli=async()=>{if(!fc.nombre)return showToast("Completá el nombre","error");setSaving(true);if(modal==="nuevo-cli")await supabase.from("clientes").insert([fc]);else await supabase.from("clientes").update(fc).eq("id",fc.id);setModal(null);reload();showToast("Cliente guardado");setSaving(false);};
  const saveInv=async()=>{if(!finv.nombre||!finv.cantidad)return showToast("Completá nombre y cantidad","error");setSaving(true);const data={...finv,cantidad:Number(finv.cantidad),stock_minimo:Number(finv.stock_minimo||0)};if(modal==="nuevo-inv")await supabase.from("inventario").insert([data]);else await supabase.from("inventario").update(data).eq("id",finv.id);setModal(null);reload();showToast("Guardado");setSaving(false);};
  const eliminar=async()=>{if(deleteType==="incidencia")await supabase.from("incidencias").delete().eq("id",confirmDelete);else if(deleteType==="cliente")await supabase.from("clientes").delete().eq("id",confirmDelete);else await supabase.from("inventario").delete().eq("id",confirmDelete);setConfirmDelete(null);setDeleteType(null);reload();showToast("Eliminado");};

  const pend=incidencias.filter(i=>i.estado==="pendiente").length;
  const prog=incidencias.filter(i=>i.estado==="en progreso").length;
  const stockBajo=inventario.filter(i=>Number(i.cantidad)<=Number(i.stock_minimo||0)).length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div><p className="section-title">⚙️ Gestión</p><p className="section-sub">Incidencias, clientes e inventario</p></div>
        <div style={{display:"flex",gap:6}}>
          {tab==="incidencias"&&<button className="btn btn-primary btn-sm" onClick={()=>{setFi({titulo:"",descripcion:"",area:"",prioridad:"media",estado:"pendiente",fecha:hoy()});setModal("nuevo-inc");}}>+ Incidencia</button>}
          {tab==="clientes"&&<button className="btn btn-primary btn-sm" onClick={()=>{setFc({nombre:"",contacto:"",email:"",telefono:"",notas:""});setModal("nuevo-cli");}}>+ Cliente</button>}
          {tab==="inventario"&&<button className="btn btn-primary btn-sm" onClick={()=>{setFinv({nombre:"",categoria:"",cantidad:"",unidad:"",stock_minimo:"",notas:""});setModal("nuevo-inv");}}>+ Insumo</button>}
        </div>
      </div>

      <div className="tab-bar">
        {[["incidencias",`🐛 Incidencias${pend>0?` (${pend})`:""}`,],["clientes","👥 Clientes"],["inventario",`📦 Inventario${stockBajo>0?" ⚠":""}`,]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)} style={{background:tab===id?C.cb:"transparent",color:tab===id?C.wh:C.mu}}>{label}</button>
        ))}
      </div>

      {tab==="incidencias"&&(
        <>
          <div className="g3" style={{marginBottom:14}}>
            <div className="card-sm" style={{borderLeft:`3px solid ${C.re}`,display:"flex",alignItems:"center",gap:12}}><p style={{fontSize:32,fontWeight:800,color:pend>0?C.re:C.mu,fontFamily:"'Syne',sans-serif"}}>{pend}</p><div><p style={{fontSize:11,color:C.mu}}>PENDIENTES</p><p style={{fontSize:12,color:C.re}}>Requieren atención</p></div></div>
            <div className="card-sm" style={{borderLeft:`3px solid ${C.bl}`,display:"flex",alignItems:"center",gap:12}}><p style={{fontSize:32,fontWeight:800,color:prog>0?C.bl:C.mu,fontFamily:"'Syne',sans-serif"}}>{prog}</p><div><p style={{fontSize:11,color:C.mu}}>EN PROGRESO</p><p style={{fontSize:12,color:C.bl}}>Siendo atendidos</p></div></div>
            <div className="card-sm" style={{borderLeft:`3px solid ${C.ac}`,display:"flex",alignItems:"center",gap:12}}><p style={{fontSize:32,fontWeight:800,color:C.ac,fontFamily:"'Syne',sans-serif"}}>{incidencias.filter(i=>i.estado==="resuelto").length}</p><div><p style={{fontSize:11,color:C.mu}}>RESUELTOS</p><p style={{fontSize:12,color:C.ac}}>Histórico</p></div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {incidencias.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin incidencias ✓</div>}
            {incidencias.map(inc=>{
              const pc=inc.prioridad==="alta"?C.re:inc.prioridad==="media"?C.am:C.ac;
              return (
                <div key={inc.id} style={{background:C.card,border:`1px solid ${C.cb}`,borderLeft:`4px solid ${pc}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${pc}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{inc.prioridad==="alta"?"🔴":inc.prioridad==="media"?"🟡":"🟢"}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}><p style={{fontSize:13,fontWeight:600,color:C.wh}}>{inc.titulo}</p><Badge type={inc.estado}/><Badge type={inc.prioridad}/></div>
                    <p style={{fontSize:12,color:C.mu}}>{inc.descripcion||""}</p>
                    <p style={{fontSize:11,color:C.mu,marginTop:2}}>{inc.area||""}{inc.fecha?` · ${inc.fecha}`:""}</p>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    {inc.estado!=="resuelto"&&<button className="btn btn-success btn-sm" onClick={async()=>{await supabase.from("incidencias").update({estado:"resuelto"}).eq("id",inc.id);reload();showToast("Resuelta");}}>✓</button>}
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setFi(inc);setModal("editar-inc");}}>✏</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(inc.id);setDeleteType("incidencia");}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab==="clientes"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {clientes.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu,gridColumn:"1/-1"}}>Sin clientes</div>}
          {clientes.map(c=>(
            <div key={c.id} style={{background:C.card,border:`1px solid ${C.cb}`,borderRadius:14,padding:18}}>
              <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${C.ac}30,${C.bl}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12}}>👤</div>
              <p style={{fontSize:14,fontWeight:700,color:C.wh,marginBottom:2}}>{c.nombre}</p>
              {c.contacto&&<p style={{fontSize:12,color:C.mu,marginBottom:6}}>{c.contacto}</p>}
              <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:12}}>
                {c.telefono&&<p style={{fontSize:11,color:C.mu}}>📱 {c.telefono}</p>}
                {c.email&&<p style={{fontSize:11,color:C.mu}}>✉ {c.email}</p>}
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-ghost btn-sm" style={{flex:1,justifyContent:"center"}} onClick={()=>{setFc(c);setModal("editar-cli");}}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(c.id);setDeleteType("cliente");}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="inventario"&&(
        <>
          {stockBajo>0&&<div style={{background:"rgba(251,191,36,0.06)",border:`1px solid rgba(251,191,36,0.2)`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>⚠️</span><p style={{fontSize:13,color:C.am}}>{stockBajo} insumo{stockBajo>1?"s":""} bajo el mínimo</p></div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {inventario.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:C.mu}}>Sin insumos</div>}
            {inventario.map(inv=>{
              const bajo=Number(inv.cantidad)<=Number(inv.stock_minimo||0);
              const pct=inv.stock_minimo>0?Math.min(Math.round((Number(inv.cantidad)/Number(inv.stock_minimo))*100),200):100;
              const barColor=bajo?C.re:pct>150?C.ac:C.am;
              return (
                <div key={inv.id} style={{background:C.card,border:`1px solid ${bajo?"rgba(248,113,113,0.3)":C.cb}`,borderRadius:12,padding:"14px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <p style={{fontSize:13,fontWeight:600,color:C.wh}}>{inv.nombre}</p>
                        {bajo&&<span style={{fontSize:10,background:"rgba(248,113,113,0.12)",color:C.re,padding:"2px 7px",borderRadius:5,fontWeight:600}}>⚠ BAJO</span>}
                      </div>
                      <p style={{fontSize:11,color:C.mu}}>{inv.categoria||"—"}</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <p style={{fontSize:18,fontWeight:800,color:barColor,fontFamily:"'Syne',sans-serif"}}>{fmt(inv.cantidad)} <span style={{fontSize:11,fontWeight:400,color:C.mu}}>{inv.unidad||""}</span></p>
                      <div style={{display:"flex",gap:4}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{setFinv(inv);setModal("editar-inv");}}>✏</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(inv.id);setDeleteType("inventario");}}>✕</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.mu}}>Stock vs mínimo ({inv.stock_minimo||0} {inv.unidad||""})</span><span style={{fontSize:10,color:barColor,fontWeight:600}}>{bajo?"Bajo el mínimo":"OK ✓"}</span></div>
                    <div className="progress-bar" style={{height:8}}><div className="progress-fill" style={{width:`${Math.min(pct/2,100)}%`,background:barColor}}/></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {confirmDelete&&<ConfirmDialog message="¿Eliminar este registro?" onConfirm={eliminar} onCancel={()=>{setConfirmDelete(null);setDeleteType(null);}}/>}

      {(modal==="nuevo-inc"||modal==="editar-inc")&&(
        <Modal title={modal==="nuevo-inc"?"Nueva Incidencia":"Editar Incidencia"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Título *</label><input className="form-input" value={fi.titulo} onChange={e=>setFi(p=>({...p,titulo:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fi.descripcion||""} onChange={e=>setFi(p=>({...p,descripcion:e.target.value}))}/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Área</label><input className="form-input" value={fi.area||""} onChange={e=>setFi(p=>({...p,area:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Prioridad</label><select className="form-input" value={fi.prioridad} onChange={e=>setFi(p=>({...p,prioridad:e.target.value}))}>{["alta","media","baja"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={fi.estado} onChange={e=>setFi(p=>({...p,estado:e.target.value}))}>{["pendiente","en progreso","resuelto"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fi.fecha||""} onChange={e=>setFi(p=>({...p,fecha:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={saveInc} disabled={saving}>{saving?"Guardando...":"Guardar"}</button></div>
        </Modal>
      )}

      {(modal==="nuevo-cli"||modal==="editar-cli")&&(
        <Modal title={modal==="nuevo-cli"?"Nuevo Cliente":"Editar Cliente"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={fc.nombre} onChange={e=>setFc(p=>({...p,nombre:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Contacto</label><input className="form-input" value={fc.contacto||""} onChange={e=>setFc(p=>({...p,contacto:e.target.value}))}/></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={fc.telefono||""} onChange={e=>setFc(p=>({...p,telefono:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={fc.email||""} onChange={e=>setFc(p=>({...p,email:e.target.value}))}/></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={saveCli} disabled={saving}>{saving?"Guardando...":"Guardar"}</button></div>
        </Modal>
      )}

      {(modal==="nuevo-inv"||modal==="editar-inv")&&(
        <Modal title={modal==="nuevo-inv"?"Nuevo Insumo":"Editar Insumo"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Solución nutritiva A" value={finv.nombre} onChange={e=>setFinv(p=>({...p,nombre:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Categoría</label>
            <select className="form-input" value={finv.categoria||""} onChange={e=>setFinv(p=>({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["Semillas","Nutrientes","Herramientas","Empaque","Químicos","Agua","Otros"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Cantidad *</label><input className="form-input" type="number" value={finv.cantidad} onChange={e=>setFinv(p=>({...p,cantidad:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Unidad</label><input className="form-input" placeholder="kg, L, unidades..." value={finv.unidad||""} onChange={e=>setFinv(p=>({...p,unidad:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Stock mínimo</label><input className="form-input" type="number" value={finv.stock_minimo||""} onChange={e=>setFinv(p=>({...p,stock_minimo:e.target.value}))}/></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={finv.notas||""} onChange={e=>setFinv(p=>({...p,notas:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={saveInv} disabled={saving}>{saving?"Guardando...":"Guardar"}</button></div>
        </Modal>
      )}
    </div>
  );
}

const NAV=[{id:"dashboard",label:"Dashboard",icon:"🌿"},{id:"produccion",label:"Producción",icon:"🌱"},{id:"finanzas",label:"Finanzas",icon:"💰"},{id:"gestion",label:"Gestión",icon:"⚙️"}];

export default function App() {
  const [session,setSession]=useState(null);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [data,setData]=useState({lotes:[],cosechas:[],ventas:[],gastos:[],clientes:[],incidencias:[],inventario:[]});

  const showToast=(message,type="success")=>{setToast({message,type});setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setLoading(false);});supabase.auth.onAuthStateChange((_,s)=>setSession(s));},[]);

  const load=async()=>{
    const [l,c,v,g,cl,inc,inv]=await Promise.all([
      supabase.from("lotes").select("*").order("created_at"),
      supabase.from("cosechas").select("*").order("fecha").limit(10000),
      supabase.from("ventas").select("*").order("fecha").limit(10000),
      supabase.from("gastos").select("*").order("fecha").limit(10000),
      supabase.from("clientes").select("*").order("nombre"),
      supabase.from("incidencias").select("*").order("created_at"),
      supabase.from("inventario").select("*").order("nombre"),
    ]);
    setData({lotes:l.data||[],cosechas:c.data||[],ventas:v.data||[],gastos:g.data||[],clientes:cl.data||[],incidencias:inc.data||[],inventario:inv.data||[]});
  };

  useEffect(()=>{if(session)load();},[session]);

  if(loading) return <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,gap:16}}><div style={{fontSize:40}}>🌱</div><p style={{color:C.mu,fontSize:13}}>Cargando AgroApp...</p></div>;

  return (
    <>
      <style>{css}</style>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      {!session?<Login onLogin={load}/>:(
        <div className="app-shell">
          <div className="mobile-header">
            <span style={{fontSize:14,fontWeight:700,color:C.wh,fontFamily:"'Syne',sans-serif"}}>🌱 AgroApp</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>supabase.auth.signOut()} style={{fontSize:11,padding:"4px 10px"}}>Salir</button>
          </div>
          <div className="app-body">
            <div className="sidebar">
              <div style={{padding:"8px 6px 20px",borderBottom:`1px solid ${C.cb}`,marginBottom:12}}>
                <p style={{fontSize:16,fontWeight:700,color:C.wh,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.3px"}}>🌱 AgroApp</p>
                <p style={{fontSize:11,color:C.mu,marginTop:2}}>Gestión Agrícola</p>
              </div>
              {NAV.map(n=><div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}><span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span></div>)}
              <div style={{marginTop:"auto",padding:"12px 6px",borderTop:`1px solid ${C.cb}`}}>
                <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button>
              </div>
            </div>
            <div className="main-content">
              {tab==="dashboard"&&<Dashboard lotes={data.lotes} cosechas={data.cosechas} ventas={data.ventas} gastos={data.gastos} incidencias={data.incidencias}/>}
              {tab==="produccion"&&<Produccion lotes={data.lotes} cosechas={data.cosechas} reload={load} showToast={showToast}/>}
              {tab==="finanzas"&&<Finanzas ventas={data.ventas} gastos={data.gastos} clientes={data.clientes} reload={load} showToast={showToast}/>}
              {tab==="gestion"&&<Gestion clientes={data.clientes} incidencias={data.incidencias} inventario={data.inventario} reload={load} showToast={showToast}/>}
            </div>
          </div>
          <div className="bottom-nav">
            {NAV.map(n=><button key={n.id} className={`bottom-nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}><span className="nav-icon">{n.icon}</span><span className="nav-label">{n.label}</span></button>)}
          </div>
        </div>
      )}
    </>
  );
}
