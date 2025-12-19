import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Approval() {
const [terms, setTerms] = useState([]);

useEffect(() => {
loadPending();
}, []);

async function loadPending() {
const { data } = await supabase
.from("payment_terms")
.select("*")
.eq("status", "pending")
.order("due_days");

setTerms(data || []);


}

async function approve(id) {
await supabase
.from("payment_terms")
.update({ status: "approved_final" })
.eq("id", id);

loadPending();


}

return (
<div>
<h1>Approval TOP</h1>

  {terms.map(t => (
    <div key={t.id} style={ui.row}>
      <span>{t.type}</span>
      <span>{t.description}</span>
      <span>{t.amount}</span>
      <span>H+{t.due_days}</span>

      <button onClick={() => approve(t.id)}>
        Approve
      </button>
    </div>
  ))}
</div>


);
}

const ui = {
row: {
display: "grid",
gridTemplateColumns: "1fr 2fr 1fr 1fr auto",
gap: 12,
padding: 10,
background: "#ffffff",
borderRadius: 10,
marginBottom: 8
}
};