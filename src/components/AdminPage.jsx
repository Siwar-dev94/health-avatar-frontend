import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "admin123";

export function AdminPage({ onClose }) {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    doctorName: "Dr. Adam",
    specialty: "General Medicine",
    hospital: "HealthCare Hospital",
    welcomeEn: "Hello! I'm Dr. Adam, your virtual health assistant. How can I help you today?",
    welcomeFr: "Bonjour ! Je suis le Dr. Adam, votre assistant medical virtuel. Comment puis-je vous aider ?",
  });

  const [newDisease, setNewDisease] = useState({
    name: "",
    symptoms: "",
    treatment: "",
    urgent: "",
  });

  const [knowledge, setKnowledge] = useState([]);
  const [statsMsg, setStatsMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("avatarConfig");
    if (saved) setConfig(JSON.parse(saved));
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/knowledge");
      const data = await res.json();
      setKnowledge(data.topics || []);
      setStatsMsg(`${data.total} medical topics loaded`);
    } catch {
      setStatsMsg("Could not connect to server");
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setIsAuth(true); setError(""); }
    else setError("Wrong password");
  };

  const saveConfig = () => {
    localStorage.setItem("avatarConfig", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addDisease = async () => {
    if (!newDisease.name || !newDisease.symptoms) return;
    try {
      await fetch("http://localhost:3001/api/knowledge/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDisease)
      });
      setNewDisease({ name: "", symptoms: "", treatment: "", urgent: "" });
      fetchKnowledge();
      alert("Disease added successfully!");
    } catch {
      alert("Error adding disease");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    background: "#0f1a2e", border: "1px solid #1a2d48",
    borderRadius: "8px", color: "#e2e8f4", fontSize: "13px",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    marginTop: "4px"
  };

  const labelStyle = {
    fontSize: "11px", color: "#4a6080", fontWeight: "600",
    textTransform: "uppercase", letterSpacing: "0.5px", display: "block"
  };

  const tabStyle = (active) => ({
    padding: "8px 16px", borderRadius: "8px", border: "none",
    background: active ? "#1a3a6c" : "transparent",
    color: active ? "#60a5fa" : "#4a6080",
    fontSize: "12px", cursor: "pointer", fontWeight: "500"
  });

  if (!isAuth) return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
    }}>
      <div style={{
        background: "#0c1422", borderRadius: "16px", padding: "32px",
        border: "1px solid #1a2d48", width: "340px", textAlign: "center"
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "12px",
          background: "#1a3a6c", border: "2px solid #2a5298",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ color: "#e2e8f4", fontSize: "18px", fontWeight: "600", margin: "0 0 6px" }}>
          Admin Panel
        </h2>
        <p style={{ color: "#3a5070", fontSize: "12px", margin: "0 0 20px" }}>
          HealthCare Hospital — Restricted Access
        </p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Enter admin password"
          style={{ ...inputStyle, textAlign: "center", letterSpacing: "4px" }}
        />
        {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}>{error}</p>}
        <button onClick={handleLogin} style={{
          width: "100%", marginTop: "16px", padding: "12px",
          background: "linear-gradient(135deg, #1a3a6c, #2a5298)",
          border: "none", borderRadius: "10px", color: "#e2e8f4",
          fontSize: "14px", fontWeight: "600", cursor: "pointer"
        }}>
          Login
        </button>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: "#3a5070",
          fontSize: "12px", cursor: "pointer", marginTop: "12px"
        }}>
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "20px"
    }}>
      <div style={{
        background: "#0c1422", borderRadius: "16px",
        border: "1px solid #1a2d48", width: "100%", maxWidth: "680px",
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #131f35",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ color: "#e2e8f4", fontSize: "16px", fontWeight: "600", margin: 0 }}>
              Admin Panel
            </h2>
            <p style={{ color: "#3a5070", fontSize: "11px", margin: 0 }}>
              {statsMsg}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#1a2d48", border: "none", borderRadius: "8px",
            color: "#c4d4ec", fontSize: "13px", padding: "6px 12px",
            cursor: "pointer", fontWeight: "500"
          }}>
            Close
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "4px", padding: "12px 20px",
          borderBottom: "1px solid #131f35", background: "#0a1020", flexShrink: 0
        }}>
          <button style={tabStyle(activeTab === "config")} onClick={() => setActiveTab("config")}>
            Avatar Config
          </button>
          <button style={tabStyle(activeTab === "knowledge")} onClick={() => setActiveTab("knowledge")}>
            Knowledge Base
          </button>
          <button style={tabStyle(activeTab === "add")} onClick={() => setActiveTab("add")}>
            Add Disease
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* TAB 1 : Avatar Config */}
          {activeTab === "config" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "#0f1a2e", borderRadius: "10px",
                padding: "14px", border: "1px solid #1a2d48"
              }}>
                <p style={{ color: "#60a5fa", fontSize: "13px", fontWeight: "600", margin: "0 0 12px" }}>
                  Doctor Identity
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Doctor Name</label>
                    <input style={inputStyle} value={config.doctorName}
                      onChange={e => setConfig({...config, doctorName: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Specialty</label>
                    <input style={inputStyle} value={config.specialty}
                      onChange={e => setConfig({...config, specialty: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Hospital Name</label>
                    <input style={inputStyle} value={config.hospital}
                      onChange={e => setConfig({...config, hospital: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{
                background: "#0f1a2e", borderRadius: "10px",
                padding: "14px", border: "1px solid #1a2d48"
              }}>
                <p style={{ color: "#60a5fa", fontSize: "13px", fontWeight: "600", margin: "0 0 12px" }}>
                  Welcome Messages
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>English Welcome</label>
                    <textarea style={{ ...inputStyle, height: "70px", resize: "vertical" }}
                      value={config.welcomeEn}
                      onChange={e => setConfig({...config, welcomeEn: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>French Welcome</label>
                    <textarea style={{ ...inputStyle, height: "70px", resize: "vertical" }}
                      value={config.welcomeFr}
                      onChange={e => setConfig({...config, welcomeFr: e.target.value})} />
                  </div>
                </div>
              </div>

              <button onClick={saveConfig} style={{
                padding: "12px", background: saved ? "#166534" : "linear-gradient(135deg, #1a3a6c, #2a5298)",
                border: "none", borderRadius: "10px", color: "#e2e8f4",
                fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all .3s"
              }}>
                {saved ? "Saved!" : "Save Configuration"}
              </button>
            </div>
          )}

          {/* TAB 2 : Knowledge Base */}
          {activeTab === "knowledge" && (
            <div>
              <p style={{ color: "#4a6080", fontSize: "12px", marginBottom: "14px" }}>
                {knowledge.length} medical topics in the knowledge base
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {knowledge.map((topic, i) => (
                  <div key={i} style={{
                    background: "#0f1a2e", borderRadius: "8px", padding: "10px 14px",
                    border: "1px solid #1a2d48", display: "flex", alignItems: "center", gap: "10px"
                  }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "6px",
                      background: "#1a3a6c", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "11px", color: "#60a5fa",
                      fontWeight: "700", flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ color: "#c4d4ec", fontSize: "13px" }}>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 : Add Disease */}
          {activeTab === "add" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "#0f1533", borderRadius: "10px", padding: "12px 14px",
                border: "1px solid #1e2d5e"
              }}>
                <p style={{ color: "#60a5fa", fontSize: "12px", margin: 0 }}>
                  Add a new disease or condition to Dr. Adam's knowledge base.
                  It will be used immediately in conversations.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Disease / Condition Name *</label>
                <input style={inputStyle} value={newDisease.name}
                  placeholder="e.g. Pneumonia, Eczema, Arthritis..."
                  onChange={e => setNewDisease({...newDisease, name: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Symptoms *</label>
                <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }}
                  value={newDisease.symptoms}
                  placeholder="List the main symptoms separated by commas..."
                  onChange={e => setNewDisease({...newDisease, symptoms: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Treatment & Advice</label>
                <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }}
                  value={newDisease.treatment}
                  placeholder="Treatment options, medications, dosages, lifestyle advice..."
                  onChange={e => setNewDisease({...newDisease, treatment: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Urgent Warning Signs</label>
                <input style={inputStyle} value={newDisease.urgent}
                  placeholder="When should the patient seek immediate emergency care?"
                  onChange={e => setNewDisease({...newDisease, urgent: e.target.value})} />
              </div>
              <button
                onClick={addDisease}
                disabled={!newDisease.name || !newDisease.symptoms}
                style={{
                  padding: "12px",
                  background: (!newDisease.name || !newDisease.symptoms) ? "#1a2d48" : "linear-gradient(135deg, #1a3a6c, #2a5298)",
                  border: "none", borderRadius: "10px", color: "#e2e8f4",
                  fontSize: "14px", fontWeight: "600",
                  cursor: (!newDisease.name || !newDisease.symptoms) ? "not-allowed" : "pointer",
                  opacity: (!newDisease.name || !newDisease.symptoms) ? 0.5 : 1
                }}
              >
                Add to Knowledge Base
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}