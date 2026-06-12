// ============================================================
// conceptos.jsx — Sección "Conceptos": analogía + diagrama
// ============================================================

// --- mini-diagramas SVG reutilizables (esquemáticos, no ilustraciones) ---
function DotRow({ n, color, mergeAt }) {
  const W = 280, y = 34;
  return (
    <svg viewBox="0 0 280 68" style={{ width: "100%", display: "block" }}>
      <line x1="20" y1={y} x2={20 + (n - 1) * 60} y2={y} stroke="var(--line)" strokeWidth="2" />
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} cx={20 + i * 60} cy={y} r="8" fill={color || "var(--accent)"} stroke="var(--bg-deep)" strokeWidth="2.5" />
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <text key={"t" + i} x={20 + i * 60} y={y + 26} textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--text-faint)" }}>v{i + 1}</text>
      ))}
    </svg>
  );
}

function ForkDiagram({ joined }) {
  return (
    <svg viewBox="0 0 280 78" style={{ width: "100%", display: "block" }}>
      <line x1="20" y1="28" x2="260" y2="28" stroke="var(--line)" strokeWidth="2" />
      <path d="M 80 28 C 110 28, 110 58, 140 58 L 175 58" fill="none" stroke="var(--line)" strokeWidth="2" />
      {joined && <path d="M 175 58 C 210 58, 210 28, 235 28" fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray={joined === "pending" ? "4 4" : "0"} />}
      {[20, 80, 150, 235].map((x, i) => <circle key={i} cx={x} cy="28" r="7.5" fill="var(--accent)" stroke="var(--bg-deep)" strokeWidth="2.5" />)}
      {[140, 175].map((x, i) => <circle key={i} cx={x} cy="58" r="7.5" fill="var(--violet)" stroke="var(--bg-deep)" strokeWidth="2.5" />)}
      {joined === true && <circle cx="235" cy="28" r="7.5" fill="var(--yellow)" stroke="var(--bg-deep)" strokeWidth="2.5" />}
      <text x="20" y="14" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--text-dim)" }}>main</text>
      <text x="140" y="74" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--violet)" }}>rama</text>
    </svg>
  );
}

function CloudDiagram({ arrows }) {
  return (
    <svg viewBox="0 0 280 88" style={{ width: "100%", display: "block" }}>
      <rect x="14" y="46" width="105" height="32" rx="8" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <text x="66" y="66" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--text-dim)" }}>tu repo local</text>
      <rect x="160" y="10" width="106" height="32" rx="16" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <text x="213" y="30" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--cyan)" }}>☁ origin</text>
      {(arrows === "push" || arrows === "both") && (
        <g>
          <path d="M 120 52 C 150 48, 160 42, 168 38" fill="none" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#arr-a)" />
          <text x="128" y="38" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fill: "var(--accent)" }}>push ↗</text>
        </g>
      )}
      {(arrows === "pull" || arrows === "both") && (
        <g>
          <path d="M 178 48 C 165 58, 150 64, 124 68" fill="none" stroke="var(--green)" strokeWidth="2" />
          <text x="150" y="80" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fill: "var(--green)" }}>↙ pull / fetch</text>
        </g>
      )}
    </svg>
  );
}

function StagingDiagram() {
  const box = (x, label, color) => (
    <g>
      <rect x={x} y="18" width="80" height="40" rx="8" fill="none" stroke={color} strokeWidth="1.5" />
      <text x={x + 40} y="42" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fill: color }}>{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 280 76" style={{ width: "100%", display: "block" }}>
      {box(8, "carpeta", "var(--red)")}
      {box(100, "staging", "var(--green)")}
      {box(192, "historial", "var(--violet)")}
      <text x="94" y="14" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--text-faint)" }}>add →</text>
      <text x="187" y="14" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--text-faint)" }}>commit →</text>
      <line x1="88" y1="38" x2="100" y2="38" stroke="var(--text-faint)" strokeWidth="1.5" />
      <line x1="180" y1="38" x2="192" y2="38" stroke="var(--text-faint)" strokeWidth="1.5" />
    </svg>
  );
}

function HeadDiagram() {
  return (
    <svg viewBox="0 0 280 68" style={{ width: "100%", display: "block" }}>
      <line x1="20" y1="40" x2="260" y2="40" stroke="var(--line)" strokeWidth="2" />
      {[20, 80, 140, 200, 260].map((x, i) => (
        <circle key={i} cx={x} cy="40" r="7" fill={i === 3 ? "var(--accent)" : "var(--surface-2)"} stroke={i === 3 ? "var(--bg-deep)" : "var(--line)"} strokeWidth="2" />
      ))}
      <text x="200" y="18" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, fill: "var(--accent)" }}>HEAD</text>
      <line x1="200" y1="22" x2="200" y2="30" stroke="var(--accent)" strokeWidth="2" />
      <text x="260" y="62" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "var(--text-faint)" }}>último</text>
    </svg>
  );
}

function CloneDiagram() {
  return (
    <svg viewBox="0 0 280 76" style={{ width: "100%", display: "block" }}>
      <rect x="14" y="12" width="110" height="34" rx="16" fill="none" stroke="var(--cyan)" strokeWidth="1.5" />
      <text x="69" y="33" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--cyan)" }}>☁ github.com</text>
      <rect x="156" y="36" width="110" height="34" rx="8" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <text x="211" y="57" textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--text-dim)" }}>tu máquina</text>
      <path d="M 128 32 C 145 36, 150 44, 158 48" fill="none" stroke="var(--green)" strokeWidth="2" />
      <text x="120" y="64" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fill: "var(--green)" }}>clone: copia TODO</text>
    </svg>
  );
}

// --- tarjetas de conceptos ---
const CONCEPT_CARDS = [
  {
    title: "Repositorio", cmd: "git init", color: "var(--accent)", glyph: "◉",
    analogy: <React.Fragment>El <strong>álbum de fotos</strong> de tu proyecto. Una carpeta normal, más una memoria oculta (<code style={{ fontSize: 12 }}>.git</code>) que recuerda cada versión que decidas guardar. Nada se pierde nunca.</React.Fragment>,
    diagram: <DotRow n={5} />,
  },
  {
    title: "Commit", cmd: "git commit -m \"…\"", color: "var(--violet)", glyph: "✦",
    analogy: <React.Fragment>Una <strong>foto instantánea</strong> del proyecto completo en un momento dado, con autor, fecha y un mensaje que explica el cambio. El historial es la secuencia de estas fotos.</React.Fragment>,
    diagram: <DotRow n={4} color="var(--violet)" />,
  },
  {
    title: "Staging", cmd: "git add", color: "var(--green)", glyph: "▣",
    analogy: <React.Fragment>La <strong>mesa donde colocas lo que saldrá en la foto</strong>. Editas en tu carpeta, pero solo lo que pongas en staging con <code style={{ fontSize: 12 }}>git add</code> entra al próximo commit. Te deja fotografiar solo una parte de tus cambios.</React.Fragment>,
    diagram: <StagingDiagram />,
  },
  {
    title: "Rama (branch)", cmd: "git switch -c", color: "var(--violet)", glyph: "⑂",
    analogy: <React.Fragment>Un <strong>universo paralelo</strong> que nace de un commit. Experimentas ahí sin tocar la versión estable (<code style={{ fontSize: 12 }}>main</code>). Si sale bien, lo fusionas; si sale mal, la borras y no pasó nada.</React.Fragment>,
    diagram: <ForkDiagram />,
  },
  {
    title: "Merge", cmd: "git merge", color: "var(--yellow)", glyph: "⇥",
    analogy: <React.Fragment><strong>Unir dos universos</strong> de vuelta en uno. Git mezcla los cambios solo. Únicamente cuando ambos lados tocaron la misma línea te pide decidir: eso es un <strong>conflicto</strong>, y se resuelve editando el archivo.</React.Fragment>,
    diagram: <ForkDiagram joined={true} />,
  },
  {
    title: "Remoto (origin)", cmd: "git push / pull", color: "var(--cyan)", glyph: "☁",
    analogy: <React.Fragment>La <strong>copia del álbum en la nube</strong> (GitHub, GitLab…) que comparte el equipo. Tu repo local y el remoto solo se comunican cuando tú lo pides: <code style={{ fontSize: 12 }}>push</code> sube, <code style={{ fontSize: 12 }}>pull</code> baja.</React.Fragment>,
    diagram: <CloudDiagram arrows="both" />,
  },
  {
    title: "Clone", cmd: "git clone <url>", color: "var(--green)", glyph: "⧉",
    analogy: <React.Fragment><strong>Descargar el álbum completo</strong>: archivos + todo el historial + la conexión al remoto. Es lo primero que haces al unirte a un proyecto que ya existe.</React.Fragment>,
    diagram: <CloneDiagram />,
  },
  {
    title: "Fetch vs Pull", cmd: "git fetch / git pull", color: "var(--cyan)", glyph: "⇊",
    analogy: <React.Fragment><code style={{ fontSize: 12 }}>fetch</code> es <strong>recoger el correo y dejarlo sobre la mesa</strong> (descarga sin tocar tu trabajo). <code style={{ fontSize: 12 }}>pull</code> es recogerlo <strong>y abrirlo</strong>: fetch + merge en un paso.</React.Fragment>,
    diagram: <CloudDiagram arrows="pull" />,
  },
  {
    title: "HEAD", cmd: "git log", color: "var(--accent)", glyph: "➤",
    analogy: <React.Fragment>El <strong>marcapáginas</strong>: señala en qué commit y en qué rama estás parado ahora mismo. Cuando cambias de rama, HEAD se mueve y tu carpeta se reescribe para mostrar esa versión.</React.Fragment>,
    diagram: <HeadDiagram />,
  },
];

// --- diagrama interactivo de las 4 zonas ---
function FlowSim() {
  // zona del archivo propio: 0 carpeta, 1 staging, 2 local, 3 remoto
  const [zone, setZone] = React.useState(0);
  const [version, setVersion] = React.useState(1);
  const [pulled, setPulled] = React.useState(false);
  const [explain, setExplain] = React.useState(
    <span>Acabas de crear <code>receta.md</code>. Vive solo en tu carpeta de trabajo: Git lo ve, pero aún no lo protege. Pulsa los comandos en orden y mira cómo viaja.</span>
  );
  const [lit, setLit] = React.useState(null);

  function light(z) { setLit(z); setTimeout(() => setLit(null), 900); }

  const actions = [
    {
      label: "git add receta.md", enabled: zone === 0,
      run() { setZone(1); light(1); setExplain(<span><code>git add</code> puso el archivo en el <strong>staging</strong>: la lista de lo que entrará en la próxima foto. Aún no hay nada guardado.</span>); },
    },
    {
      label: 'git commit -m "receta"', enabled: zone === 1,
      run() { setZone(2); light(2); setExplain(<span><code>git commit</code> guardó la foto v{version} en tu <strong>repositorio local</strong>. Ya es historia permanente… pero solo en TU máquina.</span>); },
    },
    {
      label: "git push", enabled: zone === 2,
      run() { setZone(3); light(3); setExplain(<span><code>git push</code> subió tus commits al <strong>remoto</strong>. Ahora todo el equipo puede verlos. Este es el ciclo completo.</span>); },
    },
    {
      label: "✏️ editar de nuevo", enabled: zone === 3,
      run() { setZone(0); setVersion(v => v + 1); light(0); setExplain(<span>Editaste el archivo: vuelve a la <strong>carpeta de trabajo</strong> como “modificado”. El ciclo empieza otra vez: add → commit → push. Así es el día a día.</span>); },
    },
    {
      label: "git pull", enabled: zone === 3 && !pulled,
      run() { setPulled(true); light(0); setExplain(<span><code>git pull</code> trajo el trabajo de tu compañera Ana desde el remoto: <code>salsa.md</code> apareció en tu repo local y en tu carpeta. Push comparte; pull recibe.</span>); },
    },
  ];

  const chip = (label, color, extra) => (
    <span className="fchip" style={extra}><span className="dot" style={{ background: color }}></span>{label}</span>
  );

  const zones = [
    { name: "Carpeta de trabajo", label: "donde editas", color: "var(--red)" },
    { name: "Staging", label: "lo que entrará en la foto", color: "var(--green)" },
    { name: "Repo local", label: "tu historial (.git)", color: "var(--violet)" },
    { name: "Remoto ☁", label: "compartido con el equipo", color: "var(--cyan)" },
  ];

  return (
    <div className="flow-panel">
      <h3 style={{ fontSize: 22 }}>Las 4 zonas de Git <span style={{ color: "var(--text-faint)", fontWeight: 400, fontSize: 15 }}>— pruébalo tú</span></h3>
      <div className="flow-zones">
        {zones.map((z, i) => (
          <div key={i} className={"fzone" + (lit === i ? " lit" : "")}>
            <span className="fzone-label" style={{ color: z.color }}>{String(i + 1).padStart(2, "0")}</span>
            <span className="fzone-name">{z.name}</span>
            <span className="fzone-label" style={{ textTransform: "none", letterSpacing: 0 }}>{z.label}</span>
            {i === zone && chip("receta.md" + (version > 1 ? " (v" + version + ")" : ""), "var(--accent)")}
            {i === 2 && zone === 3 && chip("receta.md ✓", "var(--violet)")}
            {i === 2 && version > 1 && zone < 2 && chip("receta.md v" + (version - 1), "var(--violet)")}
            {i === 3 && (zone === 3 || version > 1) && chip("receta.md" + (zone !== 3 && version > 1 ? " v" + (version - 1) : ""), "var(--cyan)")}
            {i === 3 && !pulled && chip("salsa.md (de Ana)", "var(--cyan)", { opacity: 0.65 })}
            {pulled && (i === 0 || i === 2) && chip("salsa.md", "var(--green)")}
            {pulled && i === 3 && chip("salsa.md (de Ana)", "var(--cyan)")}
          </div>
        ))}
      </div>
      <div className="flow-actions">
        {actions.map((a, i) => (
          <button key={i} className="flow-btn" disabled={!a.enabled} onClick={a.run}>{a.label}</button>
        ))}
      </div>
      <div className="flow-explain">{explain}</div>
    </div>
  );
}

function ConceptsSection() {
  return (
    <div className="section-wrap">
      <div className="sec-kicker">01 · Conceptos</div>
      <h2 className="sec-title">Git en 9 ideas</h2>
      <p className="sec-sub">
        Git es un sistema de control de versiones: guarda fotos de tu proyecto para que puedas
        viajar en el tiempo, trabajar en paralelo y colaborar sin pisarte con nadie.
        Cada idea, con su analogía y su comando.
      </p>

      <FlowSim />

      <div className="concept-grid">
        {CONCEPT_CARDS.map((c, i) => (
          <div className="ccard" key={i}>
            <div className="ccard-head">
              <span className="ccard-icon" style={{ background: "color-mix(in oklch, " + c.color + " 14%, transparent)", color: c.color, fontSize: 19 }}>{c.glyph}</span>
              <h3>{c.title}</h3>
              <span className="cmd-chip">{c.cmd}</span>
            </div>
            <p className="analogy">{c.analogy}</p>
            <div className="ccard-diagram">{c.diagram}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ConceptsSection = ConceptsSection;
