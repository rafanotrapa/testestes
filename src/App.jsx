import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Approval from "./Approval";
import MasterData from "./MasterData";

export default function App() {
return (
<BrowserRouter>
<div style={ui.layout}>
<Sidebar />

    <div style={ui.content}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/approval" element={<Approval />} />
        <Route path="/master" element={<MasterData />} />
      </Routes>
    </div>
  </div>
</BrowserRouter>


);
}

const ui = {
layout: {
display: "flex",
minHeight: "100vh",
background: "#f1f5f9"
},
content: {
flex: 1,
padding: 24
}
};