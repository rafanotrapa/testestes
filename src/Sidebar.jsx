import { NavLink } from "react-router-dom";

export default function Sidebar() {
return (
<div style={ui.sidebar}>
<h3 style={ui.title}>ERP</h3>

  <NavLink to="/" style={ui.link}>
    Dashboard
  </NavLink>

  <NavLink to="/approval" style={ui.link}>
    Approval
  </NavLink>

  <NavLink to="/master" style={ui.link}>
    Master Data
  </NavLink>
</div>


);
}

const ui = {
sidebar: {
width: 220,
background: "#0f172a",
color: "#fff",
padding: 20,
display: "flex",
flexDirection: "column",
gap: 12
},
title: {
marginBottom: 20
},
link: {
color: "#e5e7eb",
textDecoration: "none",
padding: 10,
borderRadius: 8
}
};