import { Suspense, useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Avatar3D } from "./components/Avatar3D";
import { WelcomePage } from "./components/WelcomePage";
import { HistoryPanel } from "./components/HistoryPanel";
import { useSpeech } from "./hooks/useSpeech";
import "./App.css";
import { AdminPage } from "./components/AdminPage";
import { ConsultationReport } from "./components/ConsultationReport";
import { AvatarEffects } from "./components/AvatarEffects";
import { SoundWave } from "./components/SoundWave";

export default function App() {
  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentiment, setSentiment] = useState("neutral");
  const [lipValue, setLipValue] = useState(0);
  const [mode, setMode] = useState("text");
  const [showHistory, setShowHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [sessionId] = useState(() => Date.now().toString());

  const messagesRef = useRef([]);
  const isLoadingRef = useRef(false);
  const handleLipSync = useCallback((val) => setLipValue(val), []);
  const [currentViseme, setCurrentViseme] = useState("viseme_sil");

  const getInitialMessage = (lang, name) => {
    if (lang === "fr") return `Bonjour ${name} ! Je suis le Dr. Adam, votre assistant medical virtuel. Comment puis-je vous aider aujourd'hui ?`;
    return `Hello ${name}! I'm Dr. Adam, your virtual health assistant. How can I help you today?`;
  };

  const saveSession = useCallback((msgs) => {
    if (!patient || msgs.length < 2) return;
    localStorage.setItem("session_" + sessionId, JSON.stringify({
      id: sessionId, patientName: patient.name, age: patient.age,
      lang: patient.lang, date: new Date().toISOString(), messages: msgs
    }));
  }, [patient, sessionId]);

  const sendMessage = useCallback(async (text, isVoice = false) => {
    if (!text || !text.trim() || isLoadingRef.current) return;
    const userMsg = { role: "user", content: text.trim() };
    const updatedHistory = [...messagesRef.current, userMsg];
    messagesRef.current = updatedHistory;
    if (!isVoice) { setMessages([...updatedHistory]); setInput(""); }
    setIsLoading(true);
    isLoadingRef.current = true;
    try {
      const res = await fetch("https://health-avatar-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messagesRef.current.slice(0,-1).map(m => ({ role: m.role, content: m.content })),
          lang: patient?.lang || "en",
          patientName: patient?.name || "",
          patientAge: patient?.age || ""
        })
      });
      const data = await res.json();
      setSentiment(data.sentiment || "neutral");
      const assistantMsg = { role: "assistant", content: data.response };
      const finalHistory = [...updatedHistory, assistantMsg];
      messagesRef.current = finalHistory;
      if (!isVoice) setMessages([...finalHistory]);
      saveSession(finalHistory);
      speak(data.response);
    } catch {
      const err = { role: "assistant", content: "Sorry, connection error. Please try again." };
      if (!isVoice) { messagesRef.current = [...updatedHistory, err]; setMessages([...messagesRef.current]); }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [patient, saveSession]);

  const handleUserSpeech = useCallback((transcript) => {
    if (transcript && transcript.trim()) sendMessage(transcript.trim(), true);
  }, [sendMessage]);

  const { isListening, isSpeaking, speak, stopSpeaking, startListening, stopListening } =
    useSpeech({
      onLipSync: handleLipSync,
      onUserSpeech: handleUserSpeech,
      onViseme: (viseme, intensity) => setCurrentViseme(viseme),
      lang: patient?.lang || "en"
    });

  const handleEnter = (info) => {
    const initMsg = { role: "assistant", content: getInitialMessage(info.lang, info.name) };
    messagesRef.current = [initMsg];
    setMessages([initMsg]);
    setPatient(info);
    setTimeout(() => speak(initMsg.content), 600);
  };

  const handleBack = () => {
    stopSpeaking();
    setPatient(null);
    setMessages([]);
    messagesRef.current = [];
    setInput("");
    setSentiment("neutral");
  };

  const handleLoadSession = (session) => {
    setMessages(session.messages);
    messagesRef.current = session.messages;
    setPatient({ name: session.patientName, age: session.age, lang: session.lang });
  };

  if (!patient) return <WelcomePage onEnter={handleEnter} />;

  const micBtnStyle = {
    width:"52px", height:"52px", borderRadius:"50%",
    background: isListening ? "#dc262622" : "#0f1a2e",
    border: isListening ? "2px solid #dc2626" : "2px solid #1a2d48",
    color: isListening ? "#dc2626" : "#4a6080",
    fontSize:"13px", fontWeight:"600",
    cursor: (isSpeaking||isLoading) ? "not-allowed" : "pointer",
    opacity: (isSpeaking||isLoading) ? 0.4 : 1,
    transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center"
  };

  const stopBtnStyle = {
    width:"52px", height:"52px", borderRadius:"50%",
    background: isSpeaking ? "#f59e0b22" : "#0f1a2e",
    border: isSpeaking ? "2px solid #f59e0b" : "2px solid #1a2d48",
    color: isSpeaking ? "#f59e0b" : "#4a6080",
    fontSize:"13px", fontWeight:"600",
    cursor: isSpeaking ? "pointer" : "not-allowed",
    opacity: isSpeaking ? 1 : 0.3,
    transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center"
  };

  const langLabel = patient.lang === "fr" ? "FR" : "EN";
  const statusText = isListening
    ? (patient.lang==="fr" ? "Ecoute en cours..." : "Listening...")
    : isSpeaking
    ? (patient.lang==="fr" ? "Dr. Adam parle - cliquez Stop" : "Dr. Adam speaking - click Stop")
    : isLoading
    ? (patient.lang==="fr" ? "Traitement..." : "Thinking...")
    : (patient.lang==="fr" ? "Pret" : "Ready");

  return (
    <div className="app-layout">
      {showHistory && (
        <HistoryPanel
          patientName={patient.name}
          onLoadSession={handleLoadSession}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showAdmin && <AdminPage onClose={() => setShowAdmin(false)} />}
      {showReport && (
  <ConsultationReport
    messages={messages}
    patient={patient}
    onClose={() => setShowReport(false)}
  />
)}

      {/* AVATAR SECTION */}
      <div className="avatar-section">
        <AvatarEffects isSpeaking={isSpeaking} isLoading={isLoading} sentiment={sentiment} />
        <Canvas camera={{ position:[0,0.08,1.2], fov:30 }} dpr={[1,2]}>
          <ambientLight intensity={0.75}/>
          <directionalLight position={[1.5,3,2]} intensity={1.3}/>
          <pointLight position={[-2,2,1.5]} intensity={0.45} color="#a8c8ff"/>
          <Suspense fallback={null}>
            <Avatar3D isSpeaking={isSpeaking} sentiment={sentiment} lipValue={lipValue}/>
            <Environment preset="studio"/>
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false}
            minPolarAngle={Math.PI*0.33} maxPolarAngle={Math.PI*0.58}
            minAzimuthAngle={-0.35} maxAzimuthAngle={0.35}/>
        </Canvas>
        <SoundWave
  isSpeaking={isSpeaking}
  isListening={isListening}
  isLoading={isLoading}
  lipValue={lipValue}
  sentiment={sentiment}
/>

        {/* Top bar */}
        <div style={{
          position:"absolute", top:"16px", left:"16px", right:"16px",
          display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          <div style={{
            background:"rgba(12,20,34,0.9)", borderRadius:"10px",
            padding:"8px 14px", border:"1px solid #1a2d48"
          }}>
            <p style={{ color:"#60a5fa", fontSize:"13px", fontWeight:"600", margin:0 }}>
              {patient.name} {patient.age ? "- " + patient.age + " ans" : ""}
            </p>
            <p style={{ color:"#3a5070", fontSize:"10px", margin:0 }}>
              {langLabel}
            </p>
          </div>

          <button onClick={handleBack} style={{
            background:"rgba(12,20,34,0.9)", border:"1px solid #1a2d48",
            borderRadius:"10px", color:"#c4d4ec", fontSize:"13px",
            padding:"8px 16px", cursor:"pointer", fontWeight:"500"
          }}>
            {patient.lang==="fr" ? "Retour" : "Back"}
          </button>
        </div>

        {/* Status pill top center */}
        <div className={`status-pill ${isSpeaking?"s-speak":isLoading?"s-think":"s-idle"}`}>
          {isSpeaking ? (patient.lang==="fr"?"Parle...":"Speaking...") : isLoading ? (patient.lang==="fr"?"Reflechit...":"Thinking...") : (patient.lang==="fr"?"Pret":"Ready")}
        </div>

        {/* Mic + Stop buttons */}
        <div style={{
          position:"absolute", bottom:"28px", left:"50%",
          transform:"translateX(-50%)", display:"flex",
          flexDirection:"column", alignItems:"center", gap:"10px"
        }}>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              <button onClick={() => isListening ? stopListening() : startListening()}
                disabled={isSpeaking||isLoading} style={micBtnStyle}>
                {isListening ? "REC" : "MIC"}
              </button>
              <span style={{ fontSize:"10px", color:isListening?"#dc2626":"#3a5070" }}>
                {patient.lang==="fr" ? "Parler" : "Speak"}
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              <button onClick={stopSpeaking} disabled={!isSpeaking} style={stopBtnStyle}>
                STOP
              </button>
              <span style={{ fontSize:"10px", color:isSpeaking?"#f59e0b":"#3a5070" }}>Stop</span>
            </div>
          </div>
          <span style={{
            fontSize:"11px", fontWeight:"500", textAlign:"center", maxWidth:"220px",
            color:isListening?"#dc2626":isSpeaking?"#60a5fa":isLoading?"#fb923c":"#3a5070"
          }}>
            {statusText}
          </span>
        </div>
      </div>

      {/* CHAT PANEL */}
      <div className="chat-panel">
        <div className="chat-header">
          <div style={{
            width:"32px", height:"32px", borderRadius:"8px",
            background:"#1a3a6c", border:"1px solid #2a5298",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="header-title">Dr. Adam</span>
          <div style={{ display:"flex", gap:"6px", marginLeft:"auto", alignItems:"center" }}>
            <button onClick={() => setShowHistory(true)} style={{
              background:"#0f1a2e", border:"1px solid #1a2d48", borderRadius:"8px",
              color:"#4a6080", fontSize:"11px", padding:"5px 10px", cursor:"pointer", fontWeight:"500"
            }}>
              {patient.lang==="fr" ? "Historique" : "History"}
            </button>
            <button onClick={() => setShowReport(true)}
  disabled={messages.length < 3}
  style={{
    background:"#0f1a2e", border:"1px solid #1a2d48", borderRadius:"8px",
    color: messages.length < 3 ? "#1e2d45" : "#4a6080",
    fontSize:"11px", padding:"5px 10px",
    cursor: messages.length < 3 ? "not-allowed" : "pointer",
    fontWeight:"500"
  }}>
  {patient?.lang === "fr" ? "Fiche" : "Report"}
</button>
            <button onClick={() => setShowAdmin(true)} style={{
  background:"#0f1a2e", border:"1px solid #1a2d48", borderRadius:"8px",
  color:"#4a6080", fontSize:"11px", padding:"5px 10px", cursor:"pointer", fontWeight:"500"
}}>
  Admin
</button>
            <div style={{ display:"flex", background:"#0f1a2e", borderRadius:"8px", padding:"2px", border:"1px solid #1a2d48" }}>
              <button onClick={() => setMode("voice")} style={{
                padding:"4px 10px", borderRadius:"6px", border:"none",
                background:mode==="voice"?"#1a3a6c":"transparent",
                color:mode==="voice"?"#60a5fa":"#4a6080", fontSize:"11px",
                cursor:"pointer", fontWeight:"500"
              }}>
                {patient.lang==="fr" ? "Voix" : "Voice"}
              </button>
              <button onClick={() => setMode("text")} style={{
                padding:"4px 10px", borderRadius:"6px", border:"none",
                background:mode==="text"?"#1a3a6c":"transparent",
                color:mode==="text"?"#60a5fa":"#4a6080", fontSize:"11px",
                cursor:"pointer", fontWeight:"500"
              }}>
                {patient.lang==="fr" ? "Texte" : "Text"}
              </button>
            </div>
          </div>
        </div>

        {/* VOICE MODE */}
        {mode==="voice" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"20px", padding:"30px" }}>
            <div style={{
              width:"80px", height:"80px", borderRadius:"50%",
              background:isListening?"#2d0a0a":isSpeaking?"#0a1a3d":"#0f1a2e",
              border:isListening?"2px solid #dc2626":isSpeaking?"2px solid #60a5fa":"2px solid #1a2d48",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={isListening?"#dc2626":isSpeaking?"#60a5fa":"#3a5070"} strokeWidth="2">
                {isListening
                  ? <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                  : isSpeaking
                  ? <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>
                  : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
                }
              </svg>
            </div>
            <p style={{ fontSize:"14px", color:"#c4d4ec", fontWeight:"500", textAlign:"center" }}>
              {isListening
                ? (patient.lang==="fr" ? "Ecoute... parlez maintenant" : "Listening... speak now")
                : isSpeaking
                ? (patient.lang==="fr" ? "Dr. Adam parle..." : "Dr. Adam is speaking...")
                : isLoading
                ? (patient.lang==="fr" ? "En cours..." : "Processing...")
                : (patient.lang==="fr" ? "Cliquez sur MIC pour parler" : "Click MIC button to speak")}
            </p>
            {(isListening||isSpeaking) && (
              <div style={{ display:"flex", gap:"4px", alignItems:"center", height:"28px" }}>
                {[1,2,3,4,5,6,7].map(i=>(
                  <div key={i} style={{
                    width:"3px", borderRadius:"2px",
                    background:isListening?"#dc2626":"#60a5fa",
                    animation:"wave 0.8s ease-in-out infinite",
                    animationDelay:`${i*0.1}s`, height:`${12+i*3}px`
                  }}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEXT MODE */}
        {mode==="text" && (
          <>
            <div className="messages-list">
              {messages.map((msg,i)=>(
                <div key={i} className={`msg msg-${msg.role}`}>
                  {msg.role==="assistant" && <div className="msg-icon">Dr</div>}
                  <div className="bubble">{msg.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="msg msg-assistant">
                  <div className="msg-icon">Dr</div>
                  <div className="bubble bubble-loading">
                    <div className="dot-anim"/><div className="dot-anim"/><div className="dot-anim"/>
                  </div>
                </div>
              )}
            </div>
            <div className="input-row">
              <input className="text-input" value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(input,false);}}}
                placeholder={patient.lang==="fr" ? "Votre question medicale..." : "Type your health question..."}
                disabled={isLoading}/>
              <button className="send-btn" onClick={()=>sendMessage(input,false)}
                disabled={isLoading||!input.trim()}>
                &rarr;
              </button>
            </div>
            <p className="disclaimer">
              {patient.lang==="fr"
                ? "A titre informatif uniquement. Consultez toujours un medecin qualifie."
                : "For informational purposes only. Always consult a qualified doctor."}
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}
