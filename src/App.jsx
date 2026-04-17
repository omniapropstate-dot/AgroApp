import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase.js";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── TEMA VERDE AGRO ──────────────────────────────────────────────────
const C = {
  bg:"#060e08", sb:"#0a1410", card:"#0f1f14", cb:"#1a3020", cb2:"#244530",
  ac:"#4ade80",  ac2:"#22c55e", gr:"#86efac", re:"#f87171", am:"#fbbf24",
  bl:"#60a5fa",  pu:"#a78bfa", tx:"#d1fae5", mu:"#4d7a5a", wh:"#f0fdf4",
};
const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_L = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const YEARS = [2023,2024,2025,2026,2027];
const PIE_COLORS = [C.ac,C.bl,C.am,C.pu,C.re,"#34d399","#06b6d4","#f472b6"];

// ─── CSS ──────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.tx};-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.cb2};border-radius:4px}
.app-shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.sidebar{width:210px;background:${C.sb};border-right:1px solid ${C.cb};display:flex;flex-direction:column;padding:18px 10px;flex-shrink:0;height:100vh;overflow-y:auto}
.app-body{display:flex;flex:1;overflow:hidden}
.main-content{flex:1;overflow-y:auto;padding:22px 20px}
.mobile-header{display:none}.bottom-nav{display:none}
@media(max-width:768px){
  .app-shell{flex-direction:column}.app-body{flex-direction:column}
  .mobile-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${C.sb};border-bottom:1px solid ${C.cb};flex-shrink:0}
  .sidebar{display:none!important}.main-content{padding:12px 12px 88px 12px;height:100%}
  .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${C.sb};border-top:1px solid ${C.cb};padding:6px 0 10px}
  .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 2px;cursor:pointer;transition:all 0.15s;border:none;background:none}
  .bottom-nav-item .nav-icon{font-size:20px;line-height:1}.bottom-nav-item .nav-label{font-size:10px;font-weight:500;color:${C.mu}}
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
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;letter-spacing:0.3px;white-space:nowrap}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-box{background:${C.card};border:1px solid ${C.cb};border-radius:16px;padding:26px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
.toast{position:fixed;top:20px;right:20px;background:${C.card};border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:10px;z-index:2000;box-shadow:0 4px 24px rgba(0,0,0,0.6);border:1px solid ${C.cb};font-size:13px;max-width:320px;animation:slideIn 0.25s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.login-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${C.bg};padding:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.gkpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:${C.wh};letter-spacing:-0.3px}
.section-sub{color:${C.mu};font-size:13px;margin-top:3px}
.chart-title{font-size:13px;font-weight:600;color:${C.wh};margin-bottom:4px}
.chart-sub{font-size:11px;color:${C.mu};margin-bottom:16px}
.progress-bar{background:${C.bg};border-radius:4px;height:6px;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;transition:width 0.5s ease}
.lote-card{background:${C.card};border:1px solid ${C.cb};border-radius:10px;padding:14px;cursor:pointer;transition:all 0.15s}
.lote-card:hover{border-color:${C.cb2};background:rgba(74,222,128,0.02)}
.lote-card.activo{border-left:3px solid ${C.ac}}.lote-card.cosechado{border-left:3px solid ${C.am}}.lote-card.inactivo{border-left:3px solid ${C.mu}}
.tab-bar{display:flex;gap:4px;background:${C.card};border-radius:10px;padding:4px;border:1px solid ${C.cb};margin-bottom:16px}
.tab-btn{flex:1;padding:7px;border-radius:7px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.15s}
.insight-box{background:linear-gradient(135deg,rgba(74,222,128,0.06),rgba(96,165,250,0.04));border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:14px 16px}
`;

// ─── UTILIDADES ────────────────────────────────────────────────────────
const hoy = () => new Date().toISOString().split("T")[0];
const fmt = (n) => Number(n || 0).toLocaleString("es-BO");
const fmtKg = (n) => `${fmt(n)} kg`;

const BADGE_STYLES = {
  activo:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
  cosechando:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
  creciendo:{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},
  cosechado:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
  pagado:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
  pendiente:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
  alta:{bg:"rgba(248,113,113,0.12)",c:"#f87171"},
  media:{bg:"rgba(251,191,36,0.12)",c:"#fbbf24"},
  baja:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
  resuelto:{bg:"rgba(74,222,128,0.12)",c:"#4ade80"},
  pendiente_incidencia:{bg:"rgba(248,113,113,0.12)",c:"#f87171"},
  inactivo:{bg:"rgba(77,122,90,0.15)",c:"#4d7a5a"},
  "en progreso":{bg:"rgba(96,165,250,0.12)",c:"#60a5fa"},
};
const Badge = ({ type }) => {
  const s = BADGE_STYLES[type] || { bg:"rgba(77,122,90,0.15)", c:"#4d7a5a" };
  return <span className="badge" style={{ background:s.bg, color:s.c }}>{type ? type.charAt(0).toUpperCase()+type.slice(1) : "—"}</span>;
};

const KPI = ({ label, value, color, sub, delta }) => (
  <div className="card-sm">
    <p style={{ fontSize:10, color:C.mu, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>{label}</p>
    <p style={{ fontSize:21, fontWeight:700, color:color||C.wh, letterSpacing:"-0.5px", fontFamily:"'Syne',sans-serif" }}>{value}</p>
    {delta !== undefined && delta !== null && (
      <p style={{ fontSize:11, color:Number(delta)>=0?C.ac:C.re, marginTop:3 }}>
        {Number(delta)>=0?"↑":"↓"} {Math.abs(delta).toFixed(1)}% vs mes ant.
      </p>
    )}
    {sub && <p style={{ fontSize:11, color:C.mu, marginTop:3 }}>{sub}</p>}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
    <div className="modal-box" style={wide?{maxWidth:700}:{}}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <p style={{ fontSize:16, fontWeight:600, color:C.wh, fontFamily:"'Syne',sans-serif" }}>{title}</p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-box" style={{ maxWidth:360 }}>
      <p style={{ fontSize:15, color:C.wh, marginBottom:8, fontWeight:500 }}>¿Confirmar acción?</p>
      <p style={{ fontSize:13, color:C.mu, marginBottom:24 }}>{message}</p>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Confirmar</button>
      </div>
    </div>
  </div>
);

const Toast = ({ toast, onClose }) => {
  if(!toast) return null;
  const color = toast.type==="error"?C.re:toast.type==="warn"?C.am:C.ac;
  const icon = toast.type==="error"?"✕":toast.type==="warn"?"⚠":"✓";
  return (
    <div className="toast">
      <span style={{ color, fontWeight:700, fontSize:14 }}>{icon}</span>
      <span style={{ color:C.tx }}>{toast.message}</span>
      <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", color:C.mu, cursor:"pointer", fontSize:14 }}>✕</button>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, suffix="" }) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cb2}`, borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color:C.mu, marginBottom:6, fontSize:11 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, fontWeight:600 }}>{p.name}: {fmt(p.value)}{suffix}</p>
      ))}
    </div>
  );
};

function getPeriodos(mesesAtras, anioBase, mesBase) {
  const result = [];
  for(let i=mesesAtras-1; i>=0; i--) {
    let m = mesBase - i;
    let a = anioBase;
    while(m <= 0) { m += 12; a--; }
    while(m > 12) { m -= 12; a++; }
    result.push({ mes:m, anio:a, label:`${MESES[m]} ${a}`, labelCorto:MESES[m] });
  }
  return result;
}

// ─── LOGIN ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [f, setF] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword(f);
    if(error) setErr("Email o contraseña incorrectos"); else onLogin();
    setLoading(false);
  };
  return (
    <div className="login-bg">
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:64, height:64, background:`linear-gradient(135deg,${C.ac},${C.bl})`, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:30 }}>🌱</div>
          <p style={{ fontSize:26, fontWeight:700, color:C.wh, fontFamily:"'Syne',sans-serif" }}>AgroApp</p>
          <p style={{ fontSize:13, color:C.mu, marginTop:4 }}>Gestión Agrícola Inteligente</p>
        </div>
        <div className="card">
          {err && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:16 }}><p style={{ color:C.re, fontSize:13 }}>{err}</p></div>}
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()} /></div>
          <div className="form-group" style={{ marginBottom:20 }}><label className="form-label">Contraseña</label><input className="form-input" type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&go()} /></div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={go} disabled={loading}>{loading?"Ingresando...":"Ingresar"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SECCIÓN 1: DASHBOARD ──────────────────────────────────────────────
function Dashboard({ lotes, siembras, cosechas, ventas, gastos, incidencias }) {
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();
  const periodos = useMemo(() => getPeriodos(6, anioActual, mesActual), []);

  const cosechasMes = cosechas.filter(c => {
    const d = new Date(c.fecha);
    return d.getMonth()+1 === mesActual && d.getFullYear() === anioActual;
  });
  const cosechasMesAnt = cosechas.filter(c => {
    const d = new Date(c.fecha);
    const mAnt = mesActual === 1 ? 12 : mesActual - 1;
    const aAnt = mesActual === 1 ? anioActual - 1 : anioActual;
    return d.getMonth()+1 === mAnt && d.getFullYear() === aAnt;
  });

  const kgMes = cosechasMes.reduce((a,b) => a + Number(b.cantidad_kg||0), 0);
  const kgMesAnt = cosechasMesAnt.reduce((a,b) => a + Number(b.cantidad_kg||0), 0);
  const deltaKg = kgMesAnt > 0 ? ((kgMes - kgMesAnt) / kgMesAnt) * 100 : null;

  const ventasMes = ventas.filter(v => {
    const d = new Date(v.fecha);
    return d.getMonth()+1 === mesActual && d.getFullYear() === anioActual;
  });
  const ingresosMes = ventasMes.reduce((a,b) => a + Number(b.total||0), 0);

  const gastosMes = gastos.filter(g => {
    const d = new Date(g.fecha);
    return d.getMonth()+1 === mesActual && d.getFullYear() === anioActual;
  });
  const totalGastosMes = gastosMes.reduce((a,b) => a + Number(b.monto||0), 0);
  const netoMes = ingresosMes - totalGastosMes;

  const lotesActivos = lotes.filter(l => l.estado === "activo").length;
  const incPendientes = incidencias.filter(i => i.estado !== "resuelto").length;

  // Evolución mensual
  const evolucion = useMemo(() => periodos.map(p => {
    const cMes = cosechas.filter(c => {
      const d = new Date(c.fecha);
      return d.getMonth()+1 === p.mes && d.getFullYear() === p.anio;
    });
    const vMes = ventas.filter(v => {
      const d = new Date(v.fecha);
      return d.getMonth()+1 === p.mes && d.getFullYear() === p.anio;
    });
    const gMes = gastos.filter(g => {
      const d = new Date(g.fecha);
      return d.getMonth()+1 === p.mes && d.getFullYear() === p.anio;
    });
    const kg = cMes.reduce((a,b) => a + Number(b.cantidad_kg||0), 0);
    const ingresos = vMes.reduce((a,b) => a + Number(b.total||0), 0);
    const gTotal = gMes.reduce((a,b) => a + Number(b.monto||0), 0);
    return { ...p, kg, ingresos, gastos: gTotal, neto: ingresos - gTotal };
  }), [periodos, cosechas, ventas, gastos]);

  // Cosecha por cultivo (pie)
  const porCultivo = useMemo(() => {
    const map = {};
    cosechas.forEach(c => {
      const lote = lotes.find(l => l.id === c.lote_id);
      const key = lote?.cultivo || "Otros";
      map[key] = (map[key]||0) + Number(c.cantidad_kg||0);
    });
    return Object.entries(map).map(([name,value]) => ({name,value})).sort((a,b)=>b.value-a.value).slice(0,6);
  }, [cosechas, lotes]);

  // Lotes por estado
  const lotesPorEstado = useMemo(() => {
    const map = {};
    lotes.forEach(l => { map[l.estado||"inactivo"] = (map[l.estado||"inactivo"]||0)+1; });
    return Object.entries(map).map(([name,value]) => ({name,value}));
  }, [lotes]);

  const mejorMes = evolucion.reduce((a,b) => b.kg > a.kg ? b : a, evolucion[0]);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <p className="section-title">🌿 Dashboard</p>
          <p className="section-sub">Vista general de tu operación — {MESES_L[mesActual]} {anioActual}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="gkpi" style={{ marginBottom:16 }}>
        <KPI label="Cosechado este mes" value={fmtKg(kgMes)} color={C.ac} delta={deltaKg} />
        <KPI label="Ingresos del mes" value={`Bs. ${fmt(ingresosMes)}`} color={C.gr} />
        <KPI label="Gastos del mes" value={`Bs. ${fmt(totalGastosMes)}`} color={C.re} />
        <KPI label="Resultado neto" value={`Bs. ${fmt(netoMes)}`} color={netoMes>=0?C.ac:C.re} />
        <KPI label="Lotes activos" value={lotesActivos} color={C.bl} sub={`de ${lotes.length} totales`} />
        <KPI label="Incidencias" value={incPendientes} color={incPendientes>0?C.am:C.ac} sub="sin resolver" />
      </div>

      {/* Gráfica producción + financiera */}
      <div className="card" style={{ marginBottom:14 }}>
        <p className="chart-title">Producción mensual</p>
        <p className="chart-sub">Kg cosechados por mes — últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={evolucion}>
            <defs>
              <linearGradient id="gradKg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.ac} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={C.ac} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false} />
            <XAxis dataKey="labelCorto" tick={{ fill:C.mu, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.mu, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}kg`} />
            <Tooltip content={<CustomTooltip suffix=" kg" />} />
            <Area type="monotone" dataKey="kg" name="Cosecha" stroke={C.ac} fill="url(#gradKg)" strokeWidth={2} dot={{ fill:C.ac, r:3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="g2" style={{ marginBottom:14 }}>
        {/* Ingresos vs Gastos */}
        <div className="card">
          <p className="chart-title">Ingresos vs Gastos</p>
          <p className="chart-sub">Evolución financiera mensual</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={evolucion} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false} />
              <XAxis dataKey="labelCorto" tick={{ fill:C.mu, fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.mu, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill={C.ac} radius={[3,3,0,0]} opacity={0.85} />
              <Bar dataKey="gastos" name="Gastos" fill={C.re} radius={[3,3,0,0]} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cosecha por cultivo */}
        <div className="card">
          <p className="chart-title">Cosecha por cultivo</p>
          <p className="chart-sub">Distribución histórica en kg</p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={porCultivo} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {porCultivo.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>[`${fmt(v)} kg`,"Cosecha"]} contentStyle={{ background:C.card, border:`1px solid ${C.cb2}`, borderRadius:10, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {porCultivo.slice(0,5).map((d,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${C.cb}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:PIE_COLORS[i%PIE_COLORS.length] }} />
                    <span style={{ fontSize:12, color:C.tx }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:C.mu }}>{fmt(d.value)} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card" style={{ marginBottom:14 }}>
        <p className="chart-title">Insights del campo</p>
        <p className="chart-sub" style={{ marginBottom:14 }}>Análisis automático</p>
        <div className="g3">
          <div className="insight-box">
            <p style={{ fontSize:11, color:C.ac, fontWeight:600, marginBottom:3 }}>🌾 Mejor mes productivo</p>
            <p style={{ fontSize:13, color:C.tx }}>{mejorMes?.label} — {fmt(mejorMes?.kg)} kg</p>
          </div>
          <div className="insight-box" style={{ borderColor:"rgba(96,165,250,0.15)", background:"linear-gradient(135deg,rgba(96,165,250,0.06),rgba(96,165,250,0.02))" }}>
            <p style={{ fontSize:11, color:C.bl, fontWeight:600, marginBottom:3 }}>📦 Ventas este mes</p>
            <p style={{ fontSize:13, color:C.tx }}>{ventasMes.length} transacciones · Bs. {fmt(ingresosMes)}</p>
          </div>
          <div className="insight-box" style={{ borderColor:"rgba(248,113,113,0.15)", background:"linear-gradient(135deg,rgba(248,113,113,0.04),rgba(248,113,113,0.02))" }}>
            <p style={{ fontSize:11, color:incPendientes>0?C.re:C.ac, fontWeight:600, marginBottom:3 }}>⚠ Incidencias activas</p>
            <p style={{ fontSize:13, color:C.tx }}>{incPendientes === 0 ? "Todo en orden ✓" : `${incPendientes} requieren atención`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECCIÓN 2: PRODUCCIÓN ─────────────────────────────────────────────
function Produccion({ lotes, siembras, cosechas, reload, showToast }) {
  const [tab, setTab] = useState("lotes");
  const [modal, setModal] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fl, setFl] = useState({ nombre:"", cultivo:"", seccion:"", estado:"activo", fecha_siembra:"", notas:"" });
  const [fc, setFc] = useState({ lote_id:"", fecha:"", cantidad_kg:"", calidad:"buena", precio_kg:"", notas:"" });

  const saveLote = async () => {
    if(!fl.nombre||!fl.cultivo) return showToast("Completá nombre y cultivo","error");
    setSaving(true);
    if(modal==="nuevo-lote") await supabase.from("lotes").insert([fl]);
    else await supabase.from("lotes").update(fl).eq("id",fl.id);
    setModal(null); reload(); showToast(modal==="nuevo-lote"?"Lote registrado":"Lote actualizado"); setSaving(false);
  };
  const saveCosecha = async () => {
    if(!fc.lote_id||!fc.cantidad_kg) return showToast("Completá lote y cantidad","error");
    setSaving(true);
    await supabase.from("cosechas").insert([{...fc, cantidad_kg:Number(fc.cantidad_kg), precio_kg:Number(fc.precio_kg||0)}]);
    setModal(null); reload(); showToast("Cosecha registrada"); setSaving(false);
  };
  const eliminar = async () => {
    if(deleteType==="lote") await supabase.from("lotes").delete().eq("id",confirmDelete);
    else await supabase.from("cosechas").delete().eq("id",confirmDelete);
    setConfirmDelete(null); setDeleteType(null); reload(); showToast("Eliminado");
  };

  const cosechasPorLote = (loteId) => cosechas.filter(c=>c.lote_id===loteId);
  const kgTotalLote = (loteId) => cosechasPorLote(loteId).reduce((a,b)=>a+Number(b.cantidad_kg||0),0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <p className="section-title">🌱 Producción</p>
          <p className="section-sub">{lotes.filter(l=>l.estado==="activo").length} lotes activos · {lotes.length} totales</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {tab==="lotes" && <button className="btn btn-primary btn-sm" onClick={()=>{setFl({nombre:"",cultivo:"",seccion:"",estado:"activo",fecha_siembra:"",notas:""});setModal("nuevo-lote");}}>+ Lote</button>}
          {tab==="cosechas" && <button className="btn btn-primary btn-sm" onClick={()=>{setFc({lote_id:"",fecha:hoy(),cantidad_kg:"",calidad:"buena",precio_kg:"",notas:""});setModal("nuevo-cosecha");}}>+ Cosecha</button>}
        </div>
      </div>

      <div className="tab-bar">
        {[["lotes","🌿 Lotes"],["cosechas","🌾 Cosechas"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)}
            style={{ background:tab===id?C.cb:"transparent", color:tab===id?C.wh:C.mu }}>{label}
          </button>
        ))}
      </div>

      {tab==="lotes" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
          {lotes.length===0 && <div className="card" style={{ textAlign:"center", color:C.mu, padding:40, gridColumn:"1/-1" }}>Sin lotes registrados. Creá el primero.</div>}
          {lotes.map(l => {
            const kg = kgTotalLote(l.id);
            const cant = cosechasPorLote(l.id).length;
            return (
              <div key={l.id} className={`lote-card ${l.estado}`} onClick={()=>setDetalle(l)}>
                <p style={{ fontSize:11, fontWeight:700, color:C.ac, marginBottom:3 }}>🌿 {l.nombre}</p>
                <p style={{ fontSize:13, fontWeight:600, color:C.wh, marginBottom:2 }}>{l.cultivo}</p>
                <p style={{ fontSize:11, color:C.mu, marginBottom:8 }}>{l.seccion||"Sin sección"}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:11, color:C.tx }}>{fmt(kg)} kg</p>
                  <Badge type={l.estado} />
                </div>
                <p style={{ fontSize:10, color:C.mu, marginTop:4 }}>{cant} cosechas</p>
              </div>
            );
          })}
        </div>
      )}

      {tab==="cosechas" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Lote</th><th>Cultivo</th><th>Fecha</th><th>Cantidad</th><th>Calidad</th><th>Precio/kg</th><th></th></tr></thead>
            <tbody>
              {cosechas.length===0 && <tr><td colSpan={7} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin cosechas registradas</td></tr>}
              {cosechas.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(c => {
                const lote = lotes.find(l=>l.id===c.lote_id);
                return (
                  <tr key={c.id} className="table-row">
                    <td><p style={{ fontWeight:500 }}>{lote?.nombre||"—"}</p></td>
                    <td style={{ color:C.mu }}>{lote?.cultivo||"—"}</td>
                    <td style={{ color:C.mu, fontSize:12 }}>{c.fecha}</td>
                    <td style={{ fontWeight:600, color:C.ac }}>{fmt(c.cantidad_kg)} kg</td>
                    <td><Badge type={c.calidad} /></td>
                    <td style={{ color:C.mu }}>Bs. {fmt(c.precio_kg)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(c.id);setDeleteType("cosecha");}}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && <ConfirmDialog message="¿Eliminar este registro permanentemente?" onConfirm={eliminar} onCancel={()=>{setConfirmDelete(null);setDeleteType(null);}} />}

      {/* Detalle lote */}
      {detalle && (
        <Modal title={`${detalle.nombre} — ${detalle.cultivo}`} onClose={()=>setDetalle(null)}>
          <div className="g2" style={{ marginBottom:16 }}>
            <div><p style={{ fontSize:11, color:C.mu, marginBottom:3 }}>SECCIÓN</p><p style={{ fontSize:15, fontWeight:600, color:C.wh }}>{detalle.seccion||"—"}</p></div>
            <div><p style={{ fontSize:11, color:C.mu, marginBottom:3 }}>ESTADO</p><Badge type={detalle.estado} /></div>
            <div><p style={{ fontSize:11, color:C.mu, marginBottom:3 }}>SIEMBRA</p><p style={{ fontSize:13, color:C.tx }}>{detalle.fecha_siembra||"—"}</p></div>
            <div><p style={{ fontSize:11, color:C.mu, marginBottom:3 }}>KG TOTAL</p><p style={{ fontSize:15, fontWeight:600, color:C.ac }}>{fmt(kgTotalLote(detalle.id))} kg</p></div>
          </div>
          {detalle.notas && <p style={{ fontSize:13, color:C.mu, marginBottom:16 }}>{detalle.notas}</p>}
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setFl(detalle);setDetalle(null);setModal("editar-lote");}}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(detalle.id);setDeleteType("lote");setDetalle(null);}}>Eliminar</button>
          </div>
        </Modal>
      )}

      {(modal==="nuevo-lote"||modal==="editar-lote") && (
        <Modal title={modal==="nuevo-lote"?"Nuevo Lote":"Editar Lote"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Lote A3" value={fl.nombre} onChange={e=>setFl(p=>({...p,nombre:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Cultivo *</label><input className="form-input" placeholder="Ej: Tomate cherry" value={fl.cultivo} onChange={e=>setFl(p=>({...p,cultivo:e.target.value}))} /></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Sección</label><input className="form-input" placeholder="Ej: Zona B" value={fl.seccion||""} onChange={e=>setFl(p=>({...p,seccion:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Estado</label>
              <select className="form-input" value={fl.estado} onChange={e=>setFl(p=>({...p,estado:e.target.value}))}>
                {["activo","creciendo","cosechando","cosechado","inactivo"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Fecha siembra</label><input className="form-input" type="date" value={fl.fecha_siembra||""} onChange={e=>setFl(p=>({...p,fecha_siembra:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fl.notas||""} onChange={e=>setFl(p=>({...p,notas:e.target.value}))} /></div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveLote} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {modal==="nuevo-cosecha" && (
        <Modal title="Registrar Cosecha" onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Lote *</label>
            <select className="form-input" value={fc.lote_id} onChange={e=>setFc(p=>({...p,lote_id:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {lotes.map(l=><option key={l.id} value={l.id}>{l.nombre} — {l.cultivo}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Fecha *</label><input className="form-input" type="date" value={fc.fecha} onChange={e=>setFc(p=>({...p,fecha:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Cantidad (kg) *</label><input className="form-input" type="number" value={fc.cantidad_kg} onChange={e=>setFc(p=>({...p,cantidad_kg:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Calidad</label>
              <select className="form-input" value={fc.calidad} onChange={e=>setFc(p=>({...p,calidad:e.target.value}))}>
                {["excelente","buena","regular","baja"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Precio/kg (Bs.)</label><input className="form-input" type="number" value={fc.precio_kg} onChange={e=>setFc(p=>({...p,precio_kg:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))} /></div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveCosecha} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SECCIÓN 3: FINANZAS ───────────────────────────────────────────────
function Finanzas({ ventas, gastos, clientes, lotes, cosechas, reload, showToast }) {
  const now = new Date();
  const [tab, setTab] = useState("ventas");
  const [modalVenta, setModalVenta] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mesesGraf, setMesesGraf] = useState(6);
  const [fv, setFv] = useState({ cliente_id:"", cosecha_id:"", fecha:hoy(), cantidad_kg:"", precio_kg:"", total:"", estado:"pendiente" });
  const [fg, setFg] = useState({ categoria:"", descripcion:"", monto:"", fecha:hoy() });

  const periodos = useMemo(() => getPeriodos(mesesGraf, now.getFullYear(), now.getMonth()+1), [mesesGraf]);

  const evolucion = useMemo(() => periodos.map(p => {
    const vMes = ventas.filter(v => { const d=new Date(v.fecha); return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio; });
    const gMes = gastos.filter(g => { const d=new Date(g.fecha); return d.getMonth()+1===p.mes&&d.getFullYear()===p.anio; });
    return { ...p, ingresos:vMes.reduce((a,b)=>a+Number(b.total||0),0), gastos:gMes.reduce((a,b)=>a+Number(b.monto||0),0) };
  }), [periodos, ventas, gastos]);

  const gastosPorCategoria = useMemo(() => {
    const map = {};
    gastos.forEach(g => { map[g.categoria||"Otros"] = (map[g.categoria||"Otros"]||0)+Number(g.monto||0); });
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }, [gastos]);

  const saveVenta = async () => {
    if(!fv.fecha||!fv.total) return showToast("Completá fecha y total","error");
    setSaving(true);
    await supabase.from("ventas").insert([{...fv, cantidad_kg:Number(fv.cantidad_kg||0), precio_kg:Number(fv.precio_kg||0), total:Number(fv.total)}]);
    setModalVenta(false); reload(); showToast("Venta registrada"); setSaving(false);
  };
  const saveGasto = async () => {
    if(!fg.categoria||!fg.monto) return showToast("Completá categoría y monto","error");
    setSaving(true);
    await supabase.from("gastos").insert([{...fg, monto:Number(fg.monto)}]);
    setModalGasto(false); reload(); showToast("Gasto registrado"); setSaving(false);
  };
  const eliminar = async () => {
    if(deleteType==="venta") await supabase.from("ventas").delete().eq("id",confirmDelete);
    else await supabase.from("gastos").delete().eq("id",confirmDelete);
    setConfirmDelete(null); setDeleteType(null); reload(); showToast("Eliminado");
  };

  const totalVentas = ventas.reduce((a,b)=>a+Number(b.total||0),0);
  const totalGastos = gastos.reduce((a,b)=>a+Number(b.monto||0),0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <p className="section-title">💰 Finanzas</p>
          <p className="section-sub">Ventas, gastos y flujo de caja</p>
        </div>
      </div>

      <div className="tab-bar">
        {[["ventas","💵 Ventas"],["gastos","💸 Gastos"],["analisis","📊 Análisis"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)}
            style={{ background:tab===id?C.cb:"transparent", color:tab===id?C.wh:C.mu }}>{label}</button>
        ))}
      </div>

      {tab==="ventas" && (
        <>
          <div className="g2" style={{ marginBottom:14 }}>
            <div className="card-sm" style={{ borderLeft:`3px solid ${C.ac}` }}>
              <p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>Total ventas</p>
              <p style={{ fontSize:20, fontWeight:700, color:C.ac }}>Bs. {fmt(totalVentas)}</p>
            </div>
            <div className="card-sm" style={{ borderLeft:`3px solid ${C.bl}` }}>
              <p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>Transacciones</p>
              <p style={{ fontSize:20, fontWeight:700, color:C.bl }}>{ventas.length}</p>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <button className="btn btn-primary btn-sm" onClick={()=>{setFv({cliente_id:"",cosecha_id:"",fecha:hoy(),cantidad_kg:"",precio_kg:"",total:"",estado:"pendiente"});setModalVenta(true);}}>+ Venta</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Cliente</th><th>Fecha</th><th>Cantidad</th><th>Total</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {ventas.length===0 && <tr><td colSpan={6} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin ventas registradas</td></tr>}
                {ventas.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(v => {
                  const cli = clientes.find(c=>c.id===v.cliente_id);
                  return (
                    <tr key={v.id} className="table-row">
                      <td style={{ fontWeight:500 }}>{cli?.nombre||"Cliente directo"}</td>
                      <td style={{ color:C.mu, fontSize:12 }}>{v.fecha}</td>
                      <td>{v.cantidad_kg ? `${fmt(v.cantidad_kg)} kg` : "—"}</td>
                      <td style={{ fontWeight:600, color:C.ac }}>Bs. {fmt(v.total)}</td>
                      <td><Badge type={v.estado} /></td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          {v.estado==="pendiente" && <button className="btn btn-success btn-sm" onClick={async()=>{await supabase.from("ventas").update({estado:"pagado"}).eq("id",v.id);reload();showToast("Marcado como cobrado");}}>✓</button>}
                          <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(v.id);setDeleteType("venta");}}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="gastos" && (
        <>
          <div className="card-sm" style={{ borderLeft:`3px solid ${C.re}`, marginBottom:14 }}>
            <p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>Total gastos</p>
            <p style={{ fontSize:20, fontWeight:700, color:C.re }}>Bs. {fmt(totalGastos)}</p>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <button className="btn btn-primary btn-sm" onClick={()=>{setFg({categoria:"",descripcion:"",monto:"",fecha:hoy()});setModalGasto(true);}}>+ Gasto</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Categoría</th><th>Descripción</th><th>Fecha</th><th>Monto</th><th></th></tr></thead>
              <tbody>
                {gastos.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin gastos registrados</td></tr>}
                {gastos.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(g => (
                  <tr key={g.id} className="table-row">
                    <td style={{ fontWeight:500 }}>{g.categoria}</td>
                    <td style={{ color:C.mu, fontSize:12 }}>{g.descripcion||"—"}</td>
                    <td style={{ color:C.mu, fontSize:12 }}>{g.fecha}</td>
                    <td style={{ fontWeight:600, color:C.re }}>Bs. {fmt(g.monto)}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(g.id);setDeleteType("gasto");}}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="analisis" && (
        <>
          <div style={{ display:"flex", gap:6, marginBottom:16, alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.mu }}>Período:</span>
            {[3,6,12].map(n=>(
              <button key={n} className={`btn btn-sm ${mesesGraf===n?"btn-primary":"btn-ghost"}`} onClick={()=>setMesesGraf(n)}>{n}M</button>
            ))}
          </div>
          <div className="g2" style={{ marginBottom:14 }}>
            <div className="card">
              <p className="chart-title">Evolución financiera</p>
              <p className="chart-sub">Ingresos vs gastos mensuales</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={evolucion}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.cb} vertical={false} />
                  <XAxis dataKey="labelCorto" tick={{ fill:C.mu, fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:C.mu, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" name="Ingresos" fill={C.ac} radius={[3,3,0,0]} />
                  <Bar dataKey="gastos" name="Gastos" fill={C.re} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p className="chart-title">Distribución de gastos</p>
              <p className="chart-sub">Por categoría</p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={gastosPorCategoria} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {gastosPorCategoria.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v=>[`Bs. ${fmt(v)}`,"Gasto"]} contentStyle={{ background:C.card, border:`1px solid ${C.cb2}`, borderRadius:10, fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1 }}>
                  {gastosPorCategoria.slice(0,5).map((d,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${C.cb}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:PIE_COLORS[i%PIE_COLORS.length] }} />
                        <span style={{ fontSize:11, color:C.tx }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:C.mu }}>Bs. {fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmDelete && <ConfirmDialog message="¿Eliminar este registro?" onConfirm={eliminar} onCancel={()=>{setConfirmDelete(null);setDeleteType(null);}} />}

      {modalVenta && (
        <Modal title="Registrar Venta" onClose={()=>setModalVenta(false)}>
          <div className="form-group"><label className="form-label">Cliente</label>
            <select className="form-input" value={fv.cliente_id} onChange={e=>setFv(p=>({...p,cliente_id:e.target.value}))}>
              <option value="">Cliente directo / sin registro</option>
              {clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Fecha *</label><input className="form-input" type="date" value={fv.fecha} onChange={e=>setFv(p=>({...p,fecha:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Cantidad (kg)</label><input className="form-input" type="number" value={fv.cantidad_kg} onChange={e=>setFv(p=>({...p,cantidad_kg:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Precio/kg (Bs.)</label><input className="form-input" type="number" value={fv.precio_kg} onChange={e=>setFv(p=>({...p,precio_kg:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Total (Bs.) *</label><input className="form-input" type="number" value={fv.total} onChange={e=>setFv(p=>({...p,total:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Estado</label>
              <select className="form-input" value={fv.estado} onChange={e=>setFv(p=>({...p,estado:e.target.value}))}>
                {["pendiente","pagado"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModalVenta(false)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveVenta} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {modalGasto && (
        <Modal title="Registrar Gasto" onClose={()=>setModalGasto(false)}>
          <div className="form-group"><label className="form-label">Categoría *</label>
            <select className="form-input" value={fg.categoria} onChange={e=>setFg(p=>({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["Semillas","Nutrientes","Agua","Electricidad","Mano de obra","Mantenimiento","Transporte","Empaque","Otros"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fg.descripcion} onChange={e=>setFg(p=>({...p,descripcion:e.target.value}))} /></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Monto (Bs.) *</label><input className="form-input" type="number" value={fg.monto} onChange={e=>setFg(p=>({...p,monto:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fg.fecha} onChange={e=>setFg(p=>({...p,fecha:e.target.value}))} /></div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModalGasto(false)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SECCIÓN 4: GESTIÓN ────────────────────────────────────────────────
function Gestion({ clientes, incidencias, inventario, reload, showToast }) {
  const [tab, setTab] = useState("incidencias");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fi, setFi] = useState({ titulo:"", descripcion:"", area:"", prioridad:"media", estado:"pendiente", fecha:hoy() });
  const [fc, setFc] = useState({ nombre:"", contacto:"", email:"", telefono:"", notas:"" });
  const [finv, setFinv] = useState({ nombre:"", categoria:"", cantidad:"", unidad:"", stock_minimo:"", notas:"" });

  const saveIncidencia = async () => {
    if(!fi.titulo) return showToast("Completá el título","error");
    setSaving(true);
    if(modal==="nuevo-inc") await supabase.from("incidencias").insert([fi]);
    else await supabase.from("incidencias").update(fi).eq("id",fi.id);
    setModal(null); reload(); showToast("Incidencia guardada"); setSaving(false);
  };
  const saveCliente = async () => {
    if(!fc.nombre) return showToast("Completá el nombre","error");
    setSaving(true);
    if(modal==="nuevo-cli") await supabase.from("clientes").insert([fc]);
    else await supabase.from("clientes").update(fc).eq("id",fc.id);
    setModal(null); reload(); showToast("Cliente guardado"); setSaving(false);
  };
  const saveInventario = async () => {
    if(!finv.nombre||!finv.cantidad) return showToast("Completá nombre y cantidad","error");
    setSaving(true);
    if(modal==="nuevo-inv") await supabase.from("inventario").insert([{...finv, cantidad:Number(finv.cantidad), stock_minimo:Number(finv.stock_minimo||0)}]);
    else await supabase.from("inventario").update({...finv, cantidad:Number(finv.cantidad), stock_minimo:Number(finv.stock_minimo||0)}).eq("id",finv.id);
    setModal(null); reload(); showToast("Inventario guardado"); setSaving(false);
  };
  const eliminar = async () => {
    if(deleteType==="incidencia") await supabase.from("incidencias").delete().eq("id",confirmDelete);
    else if(deleteType==="cliente") await supabase.from("clientes").delete().eq("id",confirmDelete);
    else await supabase.from("inventario").delete().eq("id",confirmDelete);
    setConfirmDelete(null); setDeleteType(null); reload(); showToast("Eliminado");
  };

  const pend = incidencias.filter(i=>i.estado==="pendiente").length;
  const prog = incidencias.filter(i=>i.estado==="en progreso").length;
  const stockBajo = inventario.filter(i=>Number(i.cantidad)<=Number(i.stock_minimo||0)).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <p className="section-title">⚙️ Gestión</p>
          <p className="section-sub">Incidencias, clientes e inventario</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {tab==="incidencias" && <button className="btn btn-primary btn-sm" onClick={()=>{setFi({titulo:"",descripcion:"",area:"",prioridad:"media",estado:"pendiente",fecha:hoy()});setModal("nuevo-inc");}}>+ Incidencia</button>}
          {tab==="clientes" && <button className="btn btn-primary btn-sm" onClick={()=>{setFc({nombre:"",contacto:"",email:"",telefono:"",notas:""});setModal("nuevo-cli");}}>+ Cliente</button>}
          {tab==="inventario" && <button className="btn btn-primary btn-sm" onClick={()=>{setFinv({nombre:"",categoria:"",cantidad:"",unidad:"",stock_minimo:"",notas:""});setModal("nuevo-inv");}}>+ Insumo</button>}
        </div>
      </div>

      <div className="tab-bar">
        {[["incidencias","🐛 Incidencias"],["clientes","👥 Clientes"],["inventario","📦 Inventario"]].map(([id,label])=>(
          <button key={id} className="tab-btn" onClick={()=>setTab(id)}
            style={{ background:tab===id?C.cb:"transparent", color:tab===id?C.wh:C.mu }}>{label}</button>
        ))}
      </div>

      {tab==="incidencias" && (
        <>
          <div className="g3" style={{ marginBottom:14 }}>
            <div className="card-sm" style={{ borderLeft:`3px solid ${C.re}` }}><p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>Pendientes</p><p style={{ fontSize:22, fontWeight:700, color:pend>0?C.re:C.mu }}>{pend}</p></div>
            <div className="card-sm" style={{ borderLeft:`3px solid ${C.bl}` }}><p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>En progreso</p><p style={{ fontSize:22, fontWeight:700, color:prog>0?C.bl:C.mu }}>{prog}</p></div>
            <div className="card-sm" style={{ borderLeft:`3px solid ${C.ac}` }}><p style={{ fontSize:10, color:C.mu, textTransform:"uppercase" }}>Resueltos</p><p style={{ fontSize:22, fontWeight:700, color:C.ac }}>{incidencias.filter(i=>i.estado==="resuelto").length}</p></div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Título</th><th>Área</th><th>Prioridad</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {incidencias.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin incidencias registradas ✓</td></tr>}
                {incidencias.map(inc => (
                  <tr key={inc.id} className="table-row">
                    <td><p style={{ fontWeight:500 }}>{inc.titulo}</p><p style={{ fontSize:11, color:C.mu }}>{inc.descripcion}</p></td>
                    <td style={{ color:C.mu }}>{inc.area||"—"}</td>
                    <td><Badge type={inc.prioridad} /></td>
                    <td><Badge type={inc.estado} /></td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        {inc.estado!=="resuelto" && <button className="btn btn-success btn-sm" onClick={async()=>{await supabase.from("incidencias").update({estado:"resuelto"}).eq("id",inc.id);reload();showToast("Incidencia resuelta");}}>✓</button>}
                        <button className="btn btn-ghost btn-sm" onClick={()=>{setFi(inc);setModal("editar-inc");}}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(inc.id);setDeleteType("incidencia");}}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="clientes" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {clientes.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin clientes registrados</td></tr>}
              {clientes.map(c => (
                <tr key={c.id} className="table-row">
                  <td style={{ fontWeight:500 }}>{c.nombre}</td>
                  <td style={{ color:C.mu }}>{c.contacto||"—"}</td>
                  <td style={{ color:C.mu, fontSize:12 }}>{c.telefono||"—"}</td>
                  <td style={{ color:C.mu, fontSize:12 }}>{c.email||"—"}</td>
                  <td>
                    <div style={{ display:"flex", gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{setFc(c);setModal("editar-cli");}}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(c.id);setDeleteType("cliente");}}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="inventario" && (
        <>
          {stockBajo > 0 && (
            <div style={{ background:"rgba(251,191,36,0.06)", border:`1px solid rgba(251,191,36,0.2)`, borderRadius:10, padding:"10px 16px", marginBottom:14 }}>
              <p style={{ fontSize:13, color:C.am }}>⚠ {stockBajo} insumo{stockBajo>1?"s":""} con stock bajo mínimo</p>
            </div>
          )}
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Insumo</th><th>Categoría</th><th>Cantidad</th><th>Unidad</th><th>Stock mín.</th><th></th></tr></thead>
              <tbody>
                {inventario.length===0 && <tr><td colSpan={6} style={{ textAlign:"center", color:C.mu, padding:28 }}>Sin insumos registrados</td></tr>}
                {inventario.map(inv => {
                  const bajo = Number(inv.cantidad) <= Number(inv.stock_minimo||0);
                  return (
                    <tr key={inv.id} className="table-row">
                      <td style={{ fontWeight:500 }}>{inv.nombre}</td>
                      <td style={{ color:C.mu }}>{inv.categoria||"—"}</td>
                      <td style={{ fontWeight:600, color:bajo?C.re:C.ac }}>{fmt(inv.cantidad)}</td>
                      <td style={{ color:C.mu }}>{inv.unidad||"—"}</td>
                      <td style={{ color:C.mu }}>{inv.stock_minimo||"—"}</td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>{setFinv(inv);setModal("editar-inv");}}>Editar</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>{setConfirmDelete(inv.id);setDeleteType("inventario");}}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {confirmDelete && <ConfirmDialog message="¿Eliminar este registro permanentemente?" onConfirm={eliminar} onCancel={()=>{setConfirmDelete(null);setDeleteType(null);}} />}

      {(modal==="nuevo-inc"||modal==="editar-inc") && (
        <Modal title={modal==="nuevo-inc"?"Nueva Incidencia":"Editar Incidencia"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Título *</label><input className="form-input" value={fi.titulo} onChange={e=>setFi(p=>({...p,titulo:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Descripción</label><input className="form-input" value={fi.descripcion||""} onChange={e=>setFi(p=>({...p,descripcion:e.target.value}))} /></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Área / Lote</label><input className="form-input" value={fi.area||""} onChange={e=>setFi(p=>({...p,area:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Prioridad</label>
              <select className="form-input" value={fi.prioridad} onChange={e=>setFi(p=>({...p,prioridad:e.target.value}))}>
                {["alta","media","baja"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Estado</label>
              <select className="form-input" value={fi.estado} onChange={e=>setFi(p=>({...p,estado:e.target.value}))}>
                {["pendiente","en progreso","resuelto"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={fi.fecha||""} onChange={e=>setFi(p=>({...p,fecha:e.target.value}))} /></div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveIncidencia} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {(modal==="nuevo-cli"||modal==="editar-cli") && (
        <Modal title={modal==="nuevo-cli"?"Nuevo Cliente":"Editar Cliente"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={fc.nombre} onChange={e=>setFc(p=>({...p,nombre:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Persona de contacto</label><input className="form-input" value={fc.contacto||""} onChange={e=>setFc(p=>({...p,contacto:e.target.value}))} /></div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={fc.telefono||""} onChange={e=>setFc(p=>({...p,telefono:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={fc.email||""} onChange={e=>setFc(p=>({...p,email:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={fc.notas||""} onChange={e=>setFc(p=>({...p,notas:e.target.value}))} /></div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveCliente} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}

      {(modal==="nuevo-inv"||modal==="editar-inv") && (
        <Modal title={modal==="nuevo-inv"?"Nuevo Insumo":"Editar Insumo"} onClose={()=>setModal(null)}>
          <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Solución nutritiva A" value={finv.nombre} onChange={e=>setFinv(p=>({...p,nombre:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Categoría</label>
            <select className="form-input" value={finv.categoria||""} onChange={e=>setFinv(p=>({...p,categoria:e.target.value}))}>
              <option value="">Seleccionar...</option>
              {["Semillas","Nutrientes","Herramientas","Empaque","Químicos","Agua","Otros"].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Cantidad *</label><input className="form-input" type="number" value={finv.cantidad} onChange={e=>setFinv(p=>({...p,cantidad:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Unidad</label><input className="form-input" placeholder="kg, L, unidades..." value={finv.unidad||""} onChange={e=>setFinv(p=>({...p,unidad:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Stock mínimo</label><input className="form-input" type="number" value={finv.stock_minimo||""} onChange={e=>setFinv(p=>({...p,stock_minimo:e.target.value}))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notas</label><input className="form-input" value={finv.notas||""} onChange={e=>setFinv(p=>({...p,notas:e.target.value}))} /></div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" onClick={saveInventario} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",   label:"Dashboard",   icon:"🌿" },
  { id:"produccion",  label:"Producción",  icon:"🌱" },
  { id:"finanzas",    label:"Finanzas",    icon:"💰" },
  { id:"gestion",     label:"Gestión",     icon:"⚙️" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({
    lotes:[], siembras:[], cosechas:[], ventas:[], gastos:[], clientes:[], incidencias:[], inventario:[]
  });

  const showToast = (message, type="success") => {
    setToast({ message, type });
    setTimeout(()=>setToast(null), 3000);
  };

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setSession(session); setLoading(false); });
    supabase.auth.onAuthStateChange((_,s)=>setSession(s));
  },[]);

  const load = async () => {
    const [l,s,c,v,g,cl,inc,inv] = await Promise.all([
      supabase.from("lotes").select("*").order("created_at"),
      supabase.from("siembras").select("*").order("created_at"),
      supabase.from("cosechas").select("*").order("fecha").limit(10000),
      supabase.from("ventas").select("*").order("fecha").limit(10000),
      supabase.from("gastos").select("*").order("fecha").limit(10000),
      supabase.from("clientes").select("*").order("nombre"),
      supabase.from("incidencias").select("*").order("created_at"),
      supabase.from("inventario").select("*").order("nombre"),
    ]);
    setData({
      lotes:l.data||[], siembras:s.data||[], cosechas:c.data||[],
      ventas:v.data||[], gastos:g.data||[], clientes:cl.data||[],
      incidencias:inc.data||[], inventario:inv.data||[]
    });
  };

  useEffect(()=>{ if(session) load(); },[session]);

  if(loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, color:C.mu, fontSize:13 }}>
      Cargando AgroApp...
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <Toast toast={toast} onClose={()=>setToast(null)} />
      {!session ? <Login onLogin={load} /> : (
        <div className="app-shell">
          {/* Header móvil */}
          <div className="mobile-header">
            <span style={{ fontSize:14, fontWeight:700, color:C.wh, fontFamily:"'Syne',sans-serif" }}>🌱 AgroApp</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>supabase.auth.signOut()} style={{ fontSize:11, padding:"4px 10px" }}>Salir</button>
          </div>

          <div className="app-body">
            {/* Sidebar desktop */}
            <div className="sidebar">
              <div style={{ padding:"8px 6px 20px", borderBottom:`1px solid ${C.cb}`, marginBottom:12 }}>
                <p style={{ fontSize:16, fontWeight:700, color:C.wh, fontFamily:"'Syne',sans-serif", letterSpacing:"-0.3px" }}>🌱 AgroApp</p>
                <p style={{ fontSize:11, color:C.mu, marginTop:2 }}>Gestión Agrícola</p>
              </div>
              {NAV.map(n=>(
                <div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>
                  <span>{n.label}</span>
                </div>
              ))}
              <div style={{ marginTop:"auto", padding:"12px 6px", borderTop:`1px solid ${C.cb}` }}>
                <button className="btn btn-ghost btn-sm" style={{ width:"100%", justifyContent:"center" }} onClick={()=>supabase.auth.signOut()}>Cerrar sesión</button>
              </div>
            </div>

            {/* Contenido */}
            <div className="main-content">
              {tab==="dashboard"  && <Dashboard lotes={data.lotes} siembras={data.siembras} cosechas={data.cosechas} ventas={data.ventas} gastos={data.gastos} incidencias={data.incidencias} />}
              {tab==="produccion" && <Produccion lotes={data.lotes} siembras={data.siembras} cosechas={data.cosechas} reload={load} showToast={showToast} />}
              {tab==="finanzas"   && <Finanzas ventas={data.ventas} gastos={data.gastos} clientes={data.clientes} lotes={data.lotes} cosechas={data.cosechas} reload={load} showToast={showToast} />}
              {tab==="gestion"    && <Gestion clientes={data.clientes} incidencias={data.incidencias} inventario={data.inventario} reload={load} showToast={showToast} />}
            </div>
          </div>

          {/* Bottom nav móvil */}
          <div className="bottom-nav">
            {NAV.map(n=>(
              <button key={n.id} className={`bottom-nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
