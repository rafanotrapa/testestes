import { useState } from "react";
import Dashboard from "./Dashboard";
import Approval from "./Approval";

export default function App() {
const [menu, setMenu] = useState("dashboard");

return (
<div style={ui.layout}>
<aside style={ui.sidebar}>
<h2 style={ui.logo}>ERP</h2>

    <button
      style={menu === "dashboard" ? ui.active : ui.menu}
      onClick={() => setMenu("dashboard")}
    >
      Dashboard
    </button>

    <button
      style={menu === "approval" ? ui.active : ui.menu}
      onClick={() => setMenu("approval")}
    >
      Approval
    </button>
  </aside>

  <main style={ui.content}>
    {menu === "dashboard" && <Dashboard />}
    {menu === "approval" && <Approval />}
  </main>
</div>


);
}

const ui = {
layout: {
display: "flex",
minHeight: "100vh",
background: "#f1f5f9"
},
sidebar: {
width: 220,
background: "#0f172a",
padding: 20,
color: "#fff"
},
logo: {
marginBottom: 24
},
menu: {
width: "100%",
padding: 12,
marginBottom: 8,
borderRadius: 8,
border: "none",
background: "transparent",
color: "#cbd5e1",
textAlign: "left",
cursor: "pointer"
},
active: {
width: "100%",
padding: 12,
marginBottom: 8,
borderRadius: 8,
border: "none",
background: "#2563eb",
color: "#fff",
textAlign: "left",
cursor: "pointer"
},
content: {
flex: 1,
padding: 32
}
};