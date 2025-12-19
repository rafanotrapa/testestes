import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectValue, setProjectValue] = useState("");

  const [terms, setTerms] = useState([]);
  const [type, setType] = useState("client");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDays, setDueDays] = useState("");

  useEffect(() => {
    initUser();
    loadProjects();
  }, []);

  async function initUser() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    setUser(data.user);

    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("email", data.user.email)
      .single();

    setRole(roleData?.role || "user");
  }

  async function loadProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
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

    await supabase.from("projects").insert({
      project_name: projectName,
      project_value: projectValue
    });

    setProjectName("");
    setProjectValue("");
    loadProjects();
  }

  async function saveTerm() {
    if (!selectedProject) return;

    await supabase.from("payment_terms").insert({
      project_id: selectedProject,
      type,
      description,
      amount,
      due_days: dueDays,
      status: "pending"
    });

    setDescription("");
    setAmount("");
    setDueDays("");
    loadTerms(selectedProject);
  }

  async function approveTerm(id) {
    await supabase
      .from("payment_terms")
      .update({
        status: "approved",
        approved_by: user.email
      })
      .eq("id", id);

    loadTerms(selectedProject);
  }

  async function deleteTerm(id) {
    await supabase.from("payment_terms").delete().eq("id", id);
    loadTerms(selectedProject);
  }

  function exportExcel() {
    const rows = terms.map(t => ({
      Project: selectedProject,
      Type: t.type,
      Description: t.description,
      Amount: Number(t.amount),
      DueDay: t.due_days,
      Status: t.status
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TOP");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array"
    });

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }),
      "TOP.xlsx"
    );
  }

  const approved = terms.filter(t => t.status === "approved");

  const chartData = approved.map(t => ({
    day: "H+" + t.due_days,
    value: Number(t.amount)
  }));

  const totalClient = approved
    .filter(t => t.type === "client")
    .reduce((a, b) => a + Number(b.amount), 0);

  const totalSupplier = approved
    .filter(t => t.type === "supplier")
    .reduce((a, b) => a + Number(b.amount), 0);

  const gap = totalClient - totalSupplier;

  return (
    <div style={ui.page}>
      <h1>ERP Cashflow Manager</h1>

      <div style={ui.card}>
        <select
          style={ui.input}
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
      </div>

      {role === "admin" && (
        <div style={ui.card}>
          <h3>Master Project</h3>

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
            Simpan
          </button>
        </div>
      )}

      <div style={ui.card}>
        <h3>Input TOP</h3>

        <select
          style={ui.input}
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="client">Client</option>
          <option value="supplier">Supplier</option>
        </select>

        <input
          style={ui.input}
          placeholder="Deskripsi"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          style={ui.input}
          type="number"
          placeholder="Nominal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

        <input
          style={ui.input}
          type="number"
          placeholder="H plus hari"
          value={dueDays}
          onChange={e => setDueDays(e.target.value)}
        />

        <button style={ui.primary} onClick={saveTerm}>
          Simpan TOP
        </button>
      </div>

      <div style={ui.card}>
        <h3>Approval TOP</h3>

        {terms.map(t => (
          <div key={t.id} style={ui.row}>
            <span>{t.type}</span>
            <span>{t.description}</span>
            <span>{t.amount}</span>
            <span>{t.status}</span>

            {role === "admin" && t.status === "pending" && (
              <button onClick={() => approveTerm(t.id)}>
                Approve
              </button>
            )}

            {role === "admin" && (
              <button onClick={() => deleteTerm(t.id)}>
                Hapus
              </button>
            )}
          </div>
        ))}

        <button style={ui.secondary} onClick={exportExcel}>
          Export Excel
        </button>
      </div>

      <div style={ui.card}>
        <h3>Ringkasan</h3>

        <div style={ui.kpi}>
          <span>Client</span>
          <strong>{totalClient}</strong>
        </div>

        <div style={ui.kpi}>
          <span>Supplier</span>
          <strong>{totalSupplier}</strong>
        </div>

        <div style={{ ...ui.kpi, color: gap < 0 ? "#dc2626" : "#16a34a" }}>
          <span>Gap</span>
          <strong>{gap}</strong>
        </div>
      </div>

      <div style={ui.card}>
        <h3>Cashflow Chart</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ui = {
  page: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: 32
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
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
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff"
  },
  secondary: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr 1fr auto auto",
    gap: 8,
    alignItems: "center",
    marginBottom: 6
  },
  kpi: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6
  }
};
