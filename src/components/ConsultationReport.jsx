import { useState, useEffect } from "react";

export function ConsultationReport({ messages, patient, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/consultation/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          patientName: patient.name,
          patientAge: patient.age,
          lang: patient.lang
        })
      });
      const data = await res.json();
      setReport(data);
    } catch {
      setError("Could not generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    low: { bg: "#0f2a0f", border: "#166534", text: "#4ade80", label: "Low" },
    medium: { bg: "#2a1f0a", border: "#854d0e", text: "#fbbf24", label: "Medium" },
    high: { bg: "#2a0a0a", border: "#991b1b", text: "#f87171", label: "High" },
  };

  const printReport = () => window.print();

  const sectionStyle = {
    background: "#0f1a2e", borderRadius: "10px",
    padding: "14px 16px", border: "1px solid #1a2d48",
    marginBottom: "12px"
  };

  const sectionTitle = (text) => (
    <p style={{ color: "#60a5fa", fontSize: "12px", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px" }}>
      {text}
    </p>
  );

  const listItem = (text, i) => (
    <div key={i} style={{
      display: "flex", gap: "8px", alignItems: "flex-start",
      marginBottom: "6px"
    }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: "#2a5298", flexShrink: 0, marginTop: "6px"
      }}/>
      <span style={{ color: "#c4d4ec", fontSize: "13px", lineHeight: "1.5" }}>{text}</span>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: "20px"
    }}>
      <div style={{
        background: "#0c1422", borderRadius: "16px", border: "1px solid #1a2d48",
        width: "100%", maxWidth: "600px", maxHeight: "88vh",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #131f35",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "linear-gradient(135deg, #0a1628, #112244)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "#1a3a6c", border: "1px solid #2a5298",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h2 style={{ color: "#e2e8f4", fontSize: "15px", fontWeight: "600", margin: 0 }}>
                {patient.lang === "fr" ? "Fiche de Consultation" : "Consultation Report"}
              </h2>
              <p style={{ color: "#3a5070", fontSize: "11px", margin: 0 }}>
                HealthCare Hospital — Dr. Adam Carter
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={printReport} style={{
              background: "#1a3a6c", border: "1px solid #2a5298", borderRadius: "8px",
              color: "#60a5fa", fontSize: "12px", padding: "6px 12px",
              cursor: "pointer", fontWeight: "500"
            }}>
              Print
            </button>
            <button onClick={onClose} style={{
              background: "#1a2d48", border: "none", borderRadius: "8px",
              color: "#c4d4ec", fontSize: "12px", padding: "6px 12px",
              cursor: "pointer", fontWeight: "500"
            }}>
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "16px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: "#2a5298", animation: "bounce 1.3s ease-in-out infinite",
                    animationDelay: `${i * 0.18}s`
                  }}/>
                ))}
              </div>
              <p style={{ color: "#4a6080", fontSize: "13px" }}>
                {patient.lang === "fr" ? "Generation de la fiche..." : "Generating report..."}
              </p>
            </div>
          )}

          {error && (
            <div style={{
              background: "#2a0a0a", borderRadius: "10px", padding: "16px",
              border: "1px solid #991b1b", textAlign: "center"
            }}>
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
              <button onClick={generateReport} style={{
                marginTop: "10px", background: "#1a3a6c", border: "none",
                borderRadius: "8px", color: "#60a5fa", fontSize: "12px",
                padding: "6px 14px", cursor: "pointer"
              }}>Retry</button>
            </div>
          )}

          {report && !loading && (
            <>
              {/* Patient info */}
              <div style={{
                ...sectionStyle,
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px", marginBottom: "12px"
              }}>
                <div>
                  <p style={{ color: "#3a5070", fontSize: "10px", fontWeight: "600",
                    textTransform: "uppercase", margin: "0 0 3px" }}>Patient</p>
                  <p style={{ color: "#e2e8f4", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    {patient.name}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#3a5070", fontSize: "10px", fontWeight: "600",
                    textTransform: "uppercase", margin: "0 0 3px" }}>Age</p>
                  <p style={{ color: "#e2e8f4", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    {patient.age || "Not specified"}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#3a5070", fontSize: "10px", fontWeight: "600",
                    textTransform: "uppercase", margin: "0 0 3px" }}>Date</p>
                  <p style={{ color: "#e2e8f4", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Urgency */}
              {report.urgencyLevel && (
                <div style={{
                  background: urgencyColor[report.urgencyLevel]?.bg || "#0f1a2e",
                  borderRadius: "10px", padding: "12px 16px",
                  border: `1px solid ${urgencyColor[report.urgencyLevel]?.border || "#1a2d48"}`,
                  marginBottom: "12px", display: "flex", alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <span style={{ color: "#c4d4ec", fontSize: "13px", fontWeight: "500" }}>
                    {patient.lang === "fr" ? "Niveau d'urgence" : "Urgency Level"}
                  </span>
                  <span style={{
                    color: urgencyColor[report.urgencyLevel]?.text || "#60a5fa",
                    fontSize: "13px", fontWeight: "700",
                    textTransform: "uppercase", letterSpacing: "0.5px"
                  }}>
                    {urgencyColor[report.urgencyLevel]?.label || report.urgencyLevel}
                  </span>
                </div>
              )}

              {/* Chief Complaint */}
              {report.chiefComplaint && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Motif de Consultation" : "Chief Complaint")}
                  <p style={{ color: "#c4d4ec", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                    {report.chiefComplaint}
                  </p>
                </div>
              )}

              {/* Symptoms */}
              {report.symptoms?.length > 0 && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Symptomes Rapportes" : "Reported Symptoms")}
                  {report.symptoms.map((s, i) => listItem(s, i))}
                </div>
              )}

              {/* Possible Diagnosis */}
              {report.possibleDiagnosis?.length > 0 && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Diagnostics Possibles" : "Possible Diagnosis")}
                  {report.possibleDiagnosis.map((d, i) => listItem(d, i))}
                </div>
              )}

              {/* Advice */}
              {report.adviceGiven?.length > 0 && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Conseils Donnes" : "Advice Given")}
                  {report.adviceGiven.map((a, i) => listItem(a, i))}
                </div>
              )}

              {/* Medications */}
              {report.medications?.length > 0 && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Medicaments Recommandes" : "Recommended Medications")}
                  {report.medications.map((m, i) => listItem(m, i))}
                </div>
              )}

              {/* Follow up */}
              {report.followUp && (
                <div style={sectionStyle}>
                  {sectionTitle(patient.lang === "fr" ? "Suivi Recommande" : "Follow-up")}
                  <p style={{ color: "#c4d4ec", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                    {report.followUp}
                  </p>
                </div>
              )}

              {/* Notes */}
              {report.notes && (
                <div style={{
                  ...sectionStyle,
                  background: "#0f1533", border: "1px solid #1e2d5e"
                }}>
                  {sectionTitle(patient.lang === "fr" ? "Notes Importantes" : "Important Notes")}
                  <p style={{ color: "#c4d4ec", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                    {report.notes}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                textAlign: "center", padding: "12px",
                borderTop: "1px solid #131f35", marginTop: "8px"
              }}>
                <p style={{ color: "#1e2d45", fontSize: "10px", margin: 0 }}>
                  {patient.lang === "fr"
                    ? "Cette fiche est generee par IA. Elle ne remplace pas un diagnostic medical professionnel."
                    : "This report is AI-generated. It does not replace a professional medical diagnosis."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}