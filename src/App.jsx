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
        type,
        description,
        amount,
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

  const clientTerms = terms.filter(t => t.type === "client");
  const supplierTerms = terms.filter(t => t.type === "supplier");

  const totalClient = clientTerms.reduce((a, b) => a + Number(b.amount), 0);
  const totalSupplier = supplierTerms.reduce((a, b) => a + Number(b.amount), 0);
  const gap = totalClient - totalSupplier;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>ERP Cashflow Manager</h1>
        <span>Project • TOP • Cashflow</span>
      </header>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Master Project</h3>

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
            style={styles.primaryButton}
            disabled={!projectName || !projectValue}
            onClick={saveProject}
          >
            Simpan Project
          </button>
        </div>

        <div style={styles.card}>
          <h3>Term of Payment</h3>

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
            style={styles.primaryButton}
            disabled={!selectedProject}
            onClick={saveTerm}
          >
            Simpan TOP
          </button>
        </div>

        <div style={styles.card}>
          <h3>Ringkasan Cashflow</h3>

          <div style={styles.row}>
            <span>Client</span>
            <strong>{totalClient}</strong>
          </div>

          <div style={styles.row}>
            <span>Supplier</span>
            <strong>{totalSupplier}</strong>
          </div>

          <div
            style={{
              ...styles.row,
              color: gap < 0 ? "#dc2626" : "#16a34a"
            }}
          >
            <span>Gap</span>
            <strong>{gap}</strong>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Detail Term of Payment</h3>

        {terms.length === 0 && <p>Belum ada data</p>}

        {terms.map(t => (
          <div key={t.id} style={styles.termRow}>
            <span>{t.type}</span>
            <span>{t.description}</span>
            <span>{t.amount}</span>
            <span>H+{t.due_days}</span>
            <button
              style={styles.delete}
              onClick={() => deleteTerm(t.id)}
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: 32
  },
  header: {
    marginBottom: 32
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    marginBottom: 24
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1"
  },
  primaryButton: {
    width: "100%",
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
    marginBottom: 8
  },
  termRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr 1fr 80px",
    gap: 8,
    padding: 8,
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center"
  },
  delete: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};

export default App;
