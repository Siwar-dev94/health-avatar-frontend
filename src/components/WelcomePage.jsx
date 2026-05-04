import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Francais", flag: "FR" },
];

export function WelcomePage({ onEnter }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [lang, setLang] = useState("en");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!name.trim()) { setError("Please enter your name"); return; }
    onEnter({ name: name.trim(), age: age.trim(), lang });
  };

  const labels = {
    en: { namePh:"Your full name", agePh:"Your age (optional)", btn:"Start Consultation", privacy:"Your information is confidential and secure." },
    fr: { namePh:"Votre nom complet", agePh:"Votre age (optionnel)", btn:"Commencer la Consultation", privacy:"Vos informations sont confidentielles et securisees." },
  };
  const t = labels[lang];

  return (
    <div style={{
      minHeight:"100vh", background:"#080e1a",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding:"20px"
    }}>
      <div style={{
        width:"100%", maxWidth:"440px",
        background:"#0c1422", borderRadius:"20px",
        border:"1px solid #131f35", overflow:"hidden"
      }}>
        {/* Header */}
        <div style={{
          background:"linear-gradient(135deg, #0a1628 0%, #112244 100%)",
          padding:"32px 32px 24px", textAlign:"center",
          borderBottom:"1px solid #1a2d48"
        }}>
          <div style={{
            width:"72px", height:"72px", borderRadius:"18px",
            background:"#1a3a6c", border:"2px solid #2a5298",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 16px"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{ color:"#e2e8f4", fontSize:"22px", fontWeight:"700", margin:"0 0 6px", letterSpacing:"-0.3px" }}>
            HealthCare Hospital
          </h1>
          <p style={{ color:"#60a5fa", fontSize:"13px", margin:"0 0 4px", fontWeight:"500" }}>
            Virtual Health Assistant
          </p>
          <p style={{ color:"#3a5070", fontSize:"11px", margin:0 }}>
            Powered by AI  |  Available 24/7
          </p>
        </div>

        {/* Form */}
        <div style={{ padding:"28px 32px" }}>

          {/* Language selector */}
          <div style={{ marginBottom:"20px" }}>
            <label style={{ fontSize:"12px", color:"#4a6080", display:"block", marginBottom:"8px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {lang === "fr" ? "Langue" : "Language"}
            </label>
            <div style={{ display:"flex", gap:"10px" }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)} style={{
                  flex:1, padding:"12px 8px", borderRadius:"12px",
                  border: lang===l.code ? "2px solid #2a5298" : "1px solid #1a2d48",
                  background: lang===l.code ? "#1a3a6c" : "#0f1a2e",
                  color: lang===l.code ? "#60a5fa" : "#4a6080",
                  cursor:"pointer", fontSize:"13px", fontWeight:"600",
                  transition:"all .2s"
                }}>
                  {l.flag}<br/>
                  <span style={{ fontSize:"11px", fontWeight:"400" }}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom:"14px" }}>
            <label style={{ fontSize:"12px", color:"#4a6080", display:"block", marginBottom:"6px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {lang==="fr" ? "Nom *" : "Name *"}
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder={t.namePh}
              onKeyDown={e => e.key==="Enter" && handleStart()}
              style={{
                width:"100%", padding:"12px 14px",
                background:"#0f1a2e",
                border: error ? "1px solid #ef4444" : "1px solid #1a2d48",
                borderRadius:"10px", color:"#e2e8f4", fontSize:"14px",
                outline:"none", fontFamily:"inherit", boxSizing:"border-box"
              }}
            />
            {error && <p style={{ color:"#ef4444", fontSize:"11px", margin:"4px 0 0" }}>{error}</p>}
          </div>

          {/* Age */}
          <div style={{ marginBottom:"24px" }}>
            <label style={{ fontSize:"12px", color:"#4a6080", display:"block", marginBottom:"6px", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {lang==="fr" ? "Age (optionnel)" : "Age (optional)"}
            </label>
            <input
              value={age} onChange={e => setAge(e.target.value)}
              placeholder={t.agePh} type="number" min="1" max="120"
              style={{
                width:"100%", padding:"12px 14px",
                background:"#0f1a2e", border:"1px solid #1a2d48",
                borderRadius:"10px", color:"#e2e8f4", fontSize:"14px",
                outline:"none", fontFamily:"inherit", boxSizing:"border-box"
              }}
            />
          </div>

          {/* Button */}
          <button onClick={handleStart} style={{
            width:"100%", padding:"14px",
            background:"linear-gradient(135deg, #1a3a6c, #2a5298)",
            border:"none", borderRadius:"12px",
            color:"#e2e8f4", fontSize:"15px", fontWeight:"600",
            cursor:"pointer", letterSpacing:"0.3px"
          }}>
            {t.btn} &rarr;
          </button>

          <p style={{ textAlign:"center", fontSize:"11px", color:"#1e2d45", marginTop:"16px" }}>
            {t.privacy}
          </p>
        </div>
      </div>
    </div>
  );
}
