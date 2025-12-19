import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function MasterData() {
const [projects, setProjects] = useState([]);
const [projectName, setProjectName] = useState("");
const [projectValue, setProjectValue] = useState("");

useEffect(() => {
loadProjects();
}, []);

async function loadProjects() {
const { data } = await supabase
.from("projects")
.select("*")
.order("id");
setProjects(data || []);
}

async function saveProject() {
if (!projectName || !projectValue) return;

await supabase.from("projects").insert({
  project_name: projectName,
  project_value: projectValue
});

setProjectName("");
setProjectValue("");
loadProjects();


}

async function deleteProject(id) {
await supabase.from("projects").delete().eq("id", id);
loadProjects();
}

return (
<div style={ui.page}>
<h2>Master Project</h2>

  <div style={ui.card}>
    <input
      style={ui.input}
      placeholder="Nama Project"
      value={projectName}
      onChange={e => setProjectName(e.target.value)}
    />

    <input
      style={ui.input}
      type="number"
      placeholder="Nilai Project"
      value={projectValue}
      onChange={e => setProjectValue(e.target.value)}
    />

    <button style={ui.primary} onClick={saveProject}>
      Simpan Project
    </button>
  </div>

  <div style={ui.card}>
    {projects.map(p => (
      <div key={p.id} style={ui.row}>
        <span>{p.project_name}</span>
        <span>{p.project_value}</span>
        <button
          style={ui.delete}
          onClick={() => deleteProject(p.id)}
        >
          Hapus
        </button>
      </div>
    ))}
  </div>
</div>


);
}

const ui = {
page: {
padding: 24
},
card: {
background: "#ffffff",
padding: 20,
borderRadius: 12,
marginBottom: 20,
boxShadow: "0 8px 16px rgba(0,0,0,0.08)"
},
input: {
width: "100%",
padding: 10,
marginBottom: 10,
borderRadius: 8,
border: "1px solid #cbd5e1"
},
primary: {
padding: 12,
width: "100%",
borderRadius: 8,
border: "none",
background: "#2563eb",
color: "#fff"
},
row: {
display: "grid",
gridTemplateColumns: "2fr 1fr auto",
gap: 12,
alignItems: "center",
padding: 8,
borderBottom: "1px solid #e5e7eb"
},
delete: {
background: "#ef4444",
border: "none",
color: "#fff",
borderRadius: 6,
padding: "6px 10px"
}
};