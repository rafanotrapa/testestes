import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function App() {
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState("");

const [projectName, setProjectName] = useState("");
const [projectValue, setProjectValue] = useState("");

const [type, setType] = useState("client");
const [description, setDescription] = useState("");
const [amount, setAmount] = useState("");
const [dueDays, setDueDays] = useState("");

const [terms, setTerms] = useState([]);

useEffect(() => {
loadProjects();
}, []);

async function loadProjects() {
const { data } = await supabase
.from("projects")
.select("id, project_name")
.order("id");

setProjects(data || []);


}

async function loadTerms(projectId) {
if (!projectId) {
setTerms([]);
return;
}

const { data } = await supabase
  .from("payment_terms")
  .select("*")
  .eq("project_id", projectId)
  .order("due_days");

setTerms(data || []);


}

async function saveProject() {
if (!projectName || !projectValue) return;

await supabase.from("projects").insert([
  {
    project_name: projectName,
    project_value: projectValue
  }
]);

setProjectName("");
setProjectValue("");
loadProjects();


}

async function saveTerm() {
if (!selectedProject) return;

await supabase.from("payment_terms").insert([
  {
    project_id: selectedProject,
    type: type,
    description: description,
    amount: amount,
    due_days: dueDays
  }
]);

setDescription("");
setAmount("");
setDueDays("");
loadTerms(selectedProject);


}

async function deleteTerm(id) {
await supabase.from("payment_terms").delete().eq("id", id);
loadTerms(selectedProject);
}

function buildTimeline(data, type) {
let total = 0;
return data
.filter(t => t.type === type)
.sort((a, b) => a.due_days - b.due_days)
.map(t => {
total += Number(t.amount);
return { day: t.due_days, total };
});
}

const clientTerms = terms.filter(t => t.type === "client");
const supplierTerms = terms.filter(t => t.type === "supplier");

const totalClient = clientTerms.reduce((a, b) => a + Number(b.amount), 0);
const totalSupplier = supplierTerms.reduce((a, b) => a + Number(b.amount), 0);
const gap = totalClient - totalSupplier;

const clientTimeline = buildTimeline(terms, "client");
const supplierTimeline = buildTimeline(terms, "supplier");

return (
<div style={styles.page}>
<div style={styles.card}>
<h2 style={styles.title}>Project</h2>

    <input
      style={styles.input}
      placeholder="Nama Project"
      value={projectName}
      onChange={e => setProjectName(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="Nilai Project"
      value={projectValue}
      onChange={e => setProjectValue(e.target.value)}
    />

    <button
      style={{
        ...styles.button,
        opacity: !projectName || !projectValue ? 0.5 : 1
      }}
      disabled={!projectName || !projectValue}
      onClick={saveProject}
    >
      Simpan Project
    </button>
  </div>

  <div style={styles.card}>
    <h2 style={styles.title}>Term of Payment</h2>

    <select
      style={styles.input}
      value={selectedProject}
      onChange={e => {
        setSelectedProject(e.target.value);
        loadTerms(e.target.value);
      }}
    >
      <option value="">Pilih Project</option>
      {projects.map(p => (
        <option key={p.id} value={p.id}>
          {p.project_name}
        </option>
      ))}
    </select>

    <select
      style={styles.input}
      value={type}
      onChange={e => setType(e.target.value)}
    >
      <option value="client">TOP Client</option>
      <option value="supplier">TOP Supplier</option>
    </select>

    <input
      style={styles.input}
      placeholder="Deskripsi"
      value={description}
      onChange={e => setDescription(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="Nominal"
      value={amount}
      onChange={e => setAmount(e.target.value)}
    />

    <input
      style={styles.input}
      type="number"
      placeholder="H plus hari"
      value={dueDays}
      onChange={e => setDueDays(e.target.value)}
    />

    <button
      style={{
        ...styles.button,
        opacity: !selectedProject ? 0.5 : 1
      }}
      disabled={!selectedProject}
      onClick={saveTerm}
    >
      Simpan TOP
    </button>
  </div>

  <div style={styles.card}>
    <h2 style={styles.title}>Ringkasan Cashflow</h2>

    <div style={styles.row}>
      <span>Client</span>
      <span>{totalClient}</span>
    </div>

    <div style={styles.row}>
      <span>Supplier</span>
      <span>{totalSupplier}</span>
    </div>

    <div
      style={{
        ...styles.row,
        color: gap < 0 ? "#dc2626" : "#16a34a",
        fontWeight: "600"
      }}
    >
      <span>Gap</span>
      <span>{gap}</span>
    </div>
  </div>

  <div style={styles.card}>
    <h2 style={styles.title}>Timeline Cashflow</h2>

    <strong>Client</strong>
    {clientTimeline.map((c, i) => (
      <div key={i} style={styles.barRow}>
        <span>H+{c.day}</span>
        <div
          style={{
            ...styles.bar,
            width: Math.min(c.total / 1000000, 100) + "%"
          }}
        />
        <span>{c.total}</span>
      </div>
    ))}

    <br />

    <strong>Supplier</strong>
    {supplierTimeline.map((s, i) => (
      <div key={i} style={styles.barRow}>
        <span>H+{s.day}</span>
        <div
          style={{
            ...styles.bar,
            background: "#dc2626",
            width: Math.min(s.total / 1000000, 100) + "%"
          }}
        />
        <span>{s.total}</span>
      </div>
    ))}
  </div>

  <div style={styles.card}>
    <h2 style={styles.title}>Detail TOP</h2>

    {terms.map(t => (
      <div key={t.id} style={styles.term}>
        <span>{t.type}</span>
        <span>{t.description}</span>
        <span>{t.amount}</span>
        <span>H+{t.due_days}</span>
        <button
          style={styles.delete}
          onClick={() => deleteTerm(t.id)}
        >
          X
        </button>
      </div>
    ))}
  </div>
</div>


);
}

const styles = {
page: {
maxWidth: 900,
margin: "40px auto",
padding: 16,
display: "grid",
gap: 20
},
card: {
background: "#ffffff",
borderRadius: 12,
padding: 20,
boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
},
title: {
marginBottom: 12
},
input: {
width: "100%",
padding: 10,
marginBottom: 10,
borderRadius: 8,
border: "1px solid #ddd"
},
button: {
padding: 12,
borderRadius: 8,
border: "none",
background: "#2563eb",
color: "#fff",
cursor: "pointer"
},
row: {
display: "flex",
justifyContent: "space-between",
marginBottom: 6
},
term: {
display: "grid",
gridTemplateColumns: "1fr 2fr 1fr 1fr 40px",
gap: 8,
padding: 8,
borderBottom: "1px solid #eee",
alignItems: "center"
},
delete: {
border: "none",
background: "#ef4444",
color: "#fff",
borderRadius: 6,
cursor: "pointer"
},
barRow: {
display: "grid",
gridTemplateColumns: "60px 1fr 100px",
alignItems: "center",
gap: 8,
marginBottom: 6
},
bar: {
height: 12,
background: "#16a34a",
borderRadius: 6
}
};

export default App;