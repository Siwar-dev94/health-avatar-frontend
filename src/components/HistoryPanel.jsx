import { useState, useEffect } from "react";

export function HistoryPanel({ patientName, onLoadSession, onClose }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const all = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("session_")) {
        try { all.push(JSON.parse(localStorage.getItem(key))); } catch {}
      }
    }
    all.sort((a,b) => new Date(b.date) - new Date(a.date));
    setSessions(all);
  }, []);

  const deleteSession = (id) => {
    localStorage.removeItem("session_"+id);
    setSessions(s => s.filter(x => x.id !== id));
  };

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.7)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:1000
    }}>
      <div style={{
        width:"500px", maxHeight:"70vh", background:"#0c1422",
        borderRadius:"16px", border:"1px solid #1a2d48",
        display:"flex", flexDirection:"column", overflow:"hidden"
      }}>
        <div style={{
          padding:"16px 20px", borderBottom:"1px solid #131f35",
          display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          <h3 style={{ color:"#e2e8f4", fontSize:"15px", fontWeight:"600", margin:0 }}>
            Conversation History
          </h3>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:"#4a6080",
            fontSize:"18px", cursor:"pointer", fontWeight:"700"
          }}>X</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
          {sessions.length === 0 ? (
            <p style={{ color:"#3a5070", textAlign:"center", padding:"30px", fontSize:"13px" }}>
              No saved conversations yet.
            </p>
          ) : (
            sessions.map(s => (
              <div key={s.id} style={{
                background:"#0f1a2e", borderRadius:"10px",
                border:"1px solid #1a2d48", padding:"12px 14px",
                marginBottom:"8px"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div onClick={() => { onLoadSession(s); onClose(); }}
                    style={{ flex:1, cursor:"pointer" }}>
                    <p style={{ color:"#60a5fa", fontSize:"13px", fontWeight:"500", margin:"0 0 3px" }}>
                      {s.patientName} {s.age ? "- "+s.age+" ans" : ""}
                    </p>
                    <p style={{ color:"#3a5070", fontSize:"11px", margin:"0 0 6px" }}>
                      {new Date(s.date).toLocaleString()} - {s.lang?.toUpperCase()}
                    </p>
                    <p style={{ color:"#4a6080", fontSize:"12px", margin:0 }}>
                      {s.messages.filter(m=>m.role==="user").length} questions
                    </p>
                  </div>
                  <button onClick={() => deleteSession(s.id)} style={{
                    background:"none", border:"1px solid #1a2d48", borderRadius:"6px",
                    color:"#3a5070", cursor:"pointer", fontSize:"11px",
                    padding:"3px 8px", marginLeft:"8px"
                  }}>Del</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
