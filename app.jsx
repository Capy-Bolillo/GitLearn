// ============================================================
// app.jsx — shell principal: nav fija + secciones + Tweaks
// ============================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "acento": "#1a6cff",
  "densidad": "normal"
}/*EDITMODE-END*/;

const SECTIONS = [
  { id: "conceptos", num: "01", label: "Conceptos" },
  { id: "casos", num: "02", label: "Casos de Uso" },
  { id: "juego", num: "03", label: "Aprende Jugando" },
];

function NavProgress() {
  const totalStars = (window.GIT_MISSIONS ? window.GIT_MISSIONS.length : 30) * 3;
  const [stars, setStars] = React.useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("git-guide-progress-v1")) || {};
      return Object.values(p).reduce((a, b) => a + b, 0);
    } catch (e) { return 0; }
  });
  React.useEffect(() => {
    const fn = () => {
      try {
        const p = JSON.parse(localStorage.getItem("git-guide-progress-v1")) || {};
        setStars(Object.values(p).reduce((a, b) => a + b, 0));
      } catch (e) { }
    };
    window.addEventListener("git-progress-changed", fn);
    return () => window.removeEventListener("git-progress-changed", fn);
  }, []);
  return (
    <div className="nav-progress" title="Estrellas ganadas en las misiones">
      <span style={{ color: "var(--green)" }}>★</span>
      <span>{stars}/{totalStars}</span>
      <div className="bar"><div style={{ width: (stars / totalStars * 100) + "%" }}></div></div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState(() => {
    const h = location.hash.replace("#", "");
    return SECTIONS.some(s => s.id === h) ? h : "conceptos";
  });

  React.useEffect(() => {
    const fn = () => {
      const h = location.hash.replace("#", "");
      if (SECTIONS.some(s => s.id === h)) setTab(h);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);

  React.useEffect(() => {
    const r = document.documentElement.style;
    // migración: el acento naranja de la versión anterior pasa al azul nuevo
    const acento = t.acento === "#ec6f3f" ? "#1a6cff" : t.acento;
    r.setProperty("--accent", acento);
    r.setProperty("--accent-soft", "color-mix(in oklch, " + acento + " 14%, transparent)");
    r.setProperty("--accent-line", "color-mix(in oklch, " + acento + " 45%, transparent)");
    document.body.style.fontSize = t.densidad === "compacta" ? "14.5px" : "16px";
  }, [t]);

  function go(id) {
    setTab(id);
    history.replaceState(null, "", "#" + id);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="page">
      <header className="topnav">
        <div className="brand">
          <span className="brand-mark">⎇</span>
          <span className="brand-label">Git desde cero</span>
        </div>
        <nav>
          {SECTIONS.map(s => (
            <button key={s.id} className={"navtab" + (tab === s.id ? " active" : "")} onClick={() => go(s.id)}>
              <span className="navnum">{s.num}</span>{s.label}
            </button>
          ))}
        </nav>
        <div className="nav-right">
          <NavProgress />
          <a className="nav-cheat" href="Chuleta Git.html">⌘ Chuleta</a>
        </div>
      </header>

      {tab === "conceptos" && <ConceptsSection />}
      {tab === "casos" && <CasesSection />}
      {tab === "juego" && <GameSection />}

      <TweaksPanel>
        <TweakSection label="Apariencia" />
        <TweakColor label="Color de acento" value={t.acento}
          options={["#1a6cff", "#00e5a0", "#5ad7ff", "#7d8cff"]}
          onChange={(v) => setTweak("acento", v)} />
        <TweakRadio label="Densidad" value={t.densidad}
          options={["normal", "compacta"]}
          onChange={(v) => setTweak("densidad", v)} />
        <TweakSection label="Juego" />
        <TweakButton label="Reiniciar progreso (borra estrellas)" onClick={() => {
          localStorage.removeItem("git-guide-progress-v1");
          window.dispatchEvent(new Event("git-progress-changed"));
          location.reload();
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
