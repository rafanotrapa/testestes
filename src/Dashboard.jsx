import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function Dashboard() {
const [data, setData] = useState([]);
const [kpi, setKpi] = useState({
client: 0,
supplier: 0,
gap: 0
});

useEffect(() => {
loadDashboard();
}, []);

async function loadDashboard() {
const { data: terms } = await supabase
.from("payment_terms")
.select("*")
.eq("status", "approved_final")
.order("due_days");

let saldo = 0;
let totalClient = 0;
let totalSupplier = 0;

const chart = (terms || []).map(t => {
  const value = Number(t.amount);

  if (t.type === "client") {
    saldo += value;
    totalClient += value;
  } else {
    saldo -= value;
    totalSupplier += value;
  }

  return {
    day: "H+" + t.due_days,
    saldo
  };
});

setData(chart);
setKpi({
  client: totalClient,
  supplier: totalSupplier,
  gap: totalClient - totalSupplier
});


}

return (
<div>
<h1>Dashboard Cashflow</h1>

  <div style={ui.kpiGrid}>
    <div style={ui.kpi}>
      <span>Client</span>
      <strong>{kpi.client}</strong>
    </div>

    <div style={ui.kpi}>
      <span>Supplier</span>
      <strong>{kpi.supplier}</strong>
    </div>

    <div
      style={{
        ...ui.kpi,
        color: kpi.gap < 0 ? "#dc2626" : "#16a34a"
      }}
    >
      <span>Gap</span>
      <strong>{kpi.gap}</strong>
    </div>
  </div>

  <div style={ui.card}>
    <h3>Cashflow Kumulatif</h3>

    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line
          dataKey="saldo"
          stroke="#2563eb"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>


);
}

const ui = {
kpiGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
gap: 20,
marginBottom: 24
},
kpi: {
background: "#ffffff",
borderRadius: 14,
padding: 20,
boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
display: "flex",
justifyContent: "space-between"
},
card: {
background: "#ffffff",
borderRadius: 14,
padding: 24,
boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
}
};