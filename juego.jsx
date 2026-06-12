// ============================================================
// juego.jsx — Sección "Aprende Jugando"
// Terminal simulada + árbol de commits protagonista + 20 misiones
// ============================================================

const PROGRESS_KEY = "git-guide-progress-v1";
const LANE_COLORS = ["var(--accent)", "var(--cyan)", "var(--violet)", "var(--green)"];

function loadProgress() {
  try {return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};} catch (e) {return {};}
}
function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("git-progress-changed"));
}

// `code` -> <code>
function MdText({ text }) {
  const parts = String(text).split("`");
  return (
    <React.Fragment>
      {parts.map((p, i) => i % 2 === 1 ? <code key={i}>{p}</code> : <React.Fragment key={i}>{p}</React.Fragment>)}
    </React.Fragment>);

}

function Stars({ n, size }) {
  return (
    <span className={size === "big" ? "stars-big" : "mstars"}>
      {[1, 2, 3].map((i) =>
      <span key={i} className={i <= n ? "" : "off"}>★</span>
      )}
    </span>);

}

// ---------------- snapshot + diff: qué cambió con el último comando ----------------
function snapState(e) {
  const S = e.state;
  return {
    commits: new Set(Object.keys(S.commits)),
    branches: Object.assign({}, S.branches),
    head: S.HEAD ? S.HEAD.branch : null,
    headId: e.headId(),
    remote: S.remote ? Object.assign({}, S.remote.branches) : null,
    tracking: Object.assign({}, S.remoteTracking),
    initialized: S.initialized
  };
}

function diffEvents(before, e, cmd) {
  const S = e.state;
  const ev = [];
  const newCommits = Object.keys(S.commits).filter((id) => !before.commits.has(id));
  const movedRefs = [];
  const tok = cmd.trim().split(/\s+/);
  const isGit = tok[0] === "git";
  const sub = isGit ? tok[1] : null;

  if (!before.initialized && S.initialized && sub === "init")
  ev.push({ icon: "◉", text: "Repositorio creado — nace el árbol (vacío, sin commits aún)", color: "var(--accent)" });

  for (const id of newCommits) {
    const c = S.commits[id];
    if (sub === "fetch" || sub === "pull" || sub === "clone") continue; // los narramos abajo en bloque
    ev.push({
      icon: c.parents.length > 1 ? "⇥" : "✦",
      text: (c.parents.length > 1 ? "Commit de MERGE " : "Nuevo commit ") + id + " — “" + c.msg + "”",
      color: c.parents.length > 1 ? "var(--yellow)" : "var(--green)"
    });
  }

  for (const b in S.branches) {
    if (before.branches[b] === undefined) {
      ev.push({ icon: "⑂", text: "Rama '" + b + "' creada — nueva etiqueta en el árbol", color: "var(--violet)" });
      movedRefs.push(b);
    } else if (before.branches[b] !== S.branches[b]) {
      movedRefs.push(b);
    }
  }
  for (const b in before.branches) {
    if (S.branches[b] === undefined)
    ev.push({ icon: "✕", text: "Rama '" + b + "' borrada — su etiqueta desapareció; los commits que solo ella alcanzaba quedan huérfanos", color: "var(--red)" });
  }

  const newHead = S.HEAD ? S.HEAD.branch : null;
  if (newHead !== before.head && before.head !== null)
  ev.push({ icon: "➤", text: "HEAD saltó a '" + newHead + "' — el anillo azul marca dónde trabajas ahora", color: "var(--accent)" });

  // la rama actual se movió sin crear commits => reset (atrás) o fast-forward (adelante)
  if (newHead === before.head && before.headId && e.headId() && e.headId() !== before.headId && newCommits.length === 0) {
    if (e.isAncestor(e.headId(), before.headId))
    ev.push({ icon: "⟲", text: "Reset: '" + newHead + "' retrocedió. Los commits abandonados se ven atenuados (huérfanos)", color: "var(--red)" });else

    ev.push({ icon: "⏩", text: "Fast-forward: '" + newHead + "' solo avanzó hasta " + e.headId() + ", sin commit nuevo", color: "var(--green)" });
    movedRefs.push(newHead);
  }

  // red / remoto
  if (sub === "push" && before.remote && S.remote) {
    for (const b in S.remote.branches) {
      if (before.remote[b] !== S.remote.branches[b]) {
        ev.push({ icon: "↑", text: "Push: tus commits viajaron a origin — la etiqueta origin/" + b + " alcanzó a la tuya", color: "var(--cyan)" });
        movedRefs.push("origin/" + b);
      }
    }
  }
  if (sub === "fetch") {
    for (const b in S.remoteTracking) {
      if (before.tracking[b] !== S.remoteTracking[b]) {
        ev.push({ icon: "⇣", text: "Fetch: commits descargados — solo se movió la etiqueta origin/" + b + ", TU rama sigue donde estaba", color: "var(--cyan)" });
        movedRefs.push("origin/" + b);
      }
    }
  }
  if (sub === "pull" && newCommits.length) {
    ev.push({ icon: "⇣", text: "Pull: " + newCommits.length + " commit" + (newCommits.length > 1 ? "s" : "") + " del remoto entraron a tu árbol y se integraron", color: "var(--cyan)" });
  }
  if (sub === "clone" && newCommits.length) {
    ev.push({ icon: "⧉", text: "Clone: árbol completo descargado (" + newCommits.length + " commits) con su conexión a origin", color: "var(--cyan)" });
  }

  return { events: ev, newCommits, movedRefs, key: Date.now() };
}

// ---------------- Árbol de commits (animado, protagonista) ----------------
function CommitGraph({ engine, tick, fx }) {
  const S = engine.state;
  const [tip, setTip] = React.useState(null);
  const scrollRef = React.useRef(null);
  const commits = Object.values(S.commits).sort((a, b) => a.t - b.t);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [commits.length]);

  if (!S.initialized) {
    return <div className="tree-empty">Sin repositorio todavía — escribe <code>git init</code> y el árbol nacerá aquí.</div>;
  }
  if (!commits.length) {
    return <div className="tree-empty">Repositorio vacío — tu primer <code>git commit</code> dibujará el primer nodo. ✦</div>;
  }

  const lane = {},xi = {};
  let maxLane = 0,placed = 0;
  const claimed = {};
  commits.forEach((c, i) => {
    const p = c.parents[0];
    let l;
    if (p != null && lane[p] !== undefined && !claimed[p]) {l = lane[p];claimed[p] = true;} else
    if (placed === 0) {l = 0;} else
    {maxLane += 1;l = maxLane;}
    lane[c.id] = l;xi[c.id] = i;placed++;
  });

  const X = (id) => 56 + xi[id] * 112;
  const Y = (id) => 64 + lane[id] * 64;
  const W = 56 + commits.length * 112 + 30;
  const H = 64 + (maxLane + 1) * 64 + 34;
  const headCommit = engine.headId();

  // alcanzabilidad: nodos que ninguna rama/etiqueta alcanza = huérfanos
  const reachable = new Set();
  const tips = [...Object.values(S.branches), ...Object.values(S.remoteTracking), headCommit].filter(Boolean);
  const stack = [...tips];
  while (stack.length) {
    const id = stack.pop();
    if (!id || reachable.has(id) || !S.commits[id]) continue;
    reachable.add(id);
    stack.push(...S.commits[id].parents);
  }

  // refs por commit
  const refs = {};
  const pushRef = (id, label, kind) => {
    if (!id || !S.commits[id]) return;
    if (!refs[id]) refs[id] = [];
    refs[id].push({ label, kind });
  };
  for (const b in S.branches) {
    if (S.branches[b]) pushRef(S.branches[b], S.HEAD && S.HEAD.branch === b ? "HEAD → " + b : b, S.HEAD && S.HEAD.branch === b ? "head" : "branch");
  }
  for (const rb in S.remoteTracking) {
    pushRef(S.remoteTracking[rb], "origin/" + rb, "remote");
  }

  const refColor = (k) => k === "head" ? "var(--accent)" : k === "remote" ? "var(--cyan)" : "var(--violet)";
  const short = (m) => m.length > 13 ? m.slice(0, 12) + "…" : m;
  const tipC = tip ? S.commits[tip] : null;
  const isNew = (id) => fx && fx.newCommits.includes(id);
  const refMoved = (label) => fx && fx.movedRefs.some((r) => label === r || label === "HEAD → " + r || label === "origin/" + r);

  return (
    <div>
      <div className="graph-scroll" ref={scrollRef}>
        <div style={{ position: "relative", width: W }}>
          <svg width={W} height={H} style={{ display: "block" }}>
            {commits.map((c) =>
            c.parents.filter((p) => xi[p] !== undefined).map((p) => {
              const x1 = X(p),y1 = Y(p),x2 = X(c.id),y2 = Y(c.id);
              const mx = x1 + (x2 - x1) / 2;
              const ghost = !reachable.has(c.id);
              return (
                <path key={c.id + p} className="gedge" fill="none"
                stroke={ghost ? "rgb(93 99 120 / 0.35)" : y1 === y2 ? "var(--line)" : "rgb(125 140 255 / 0.55)"}
                strokeWidth="2" strokeDasharray={ghost ? "4 5" : undefined}
                d={y1 === y2 ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} />);

            })
            )}
            {commits.map((c) => {
              const isHead = c.id === headCommit;
              const ghost = !reachable.has(c.id);
              const fill = c.parents.length > 1 ? "var(--yellow)" : LANE_COLORS[lane[c.id] % LANE_COLORS.length];
              return (
                <g key={c.id} className={"gnode" + (ghost ? " gnode-ghost" : "")}
                onMouseEnter={() => setTip(c.id)} onMouseLeave={() => setTip((t) => t === c.id ? null : t)}>
                  <circle cx={X(c.id)} cy={Y(c.id)} r="20" fill="transparent" />
                  {isNew(c.id) && <circle key={fx.key} className="commit-flash" cx={X(c.id)} cy={Y(c.id)} r="10" fill="none" stroke={fill} strokeWidth="2" />}
                  {isHead && <circle className="head-pulse" cx={X(c.id)} cy={Y(c.id)} r="10" fill="none" stroke="var(--accent)" strokeWidth="2" />}
                  <g className="node-core">
                    <circle cx={X(c.id)} cy={Y(c.id)} r="9"
                    fill={ghost ? "transparent" : fill}
                    stroke={ghost ? "var(--text-faint)" : "var(--bg-deep)"}
                    strokeWidth={ghost ? "1.5" : "2.5"}
                    strokeDasharray={ghost ? "3 3" : undefined} />
                    {isHead && <circle cx={X(c.id)} cy={Y(c.id)} r="14" fill="none" stroke="var(--accent)" strokeWidth="1.5" />}
                  </g>
                  <text x={X(c.id)} y={Y(c.id) + 30} textAnchor="middle"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fill: ghost ? "rgb(93 99 120 / 0.6)" : isHead ? "var(--text)" : "var(--text-dim)" }}>
                    {short(c.msg)}
                  </text>
                  <text x={X(c.id)} y={Y(c.id) + 44} textAnchor="middle"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, fill: "var(--text-faint)", opacity: ghost ? 0.5 : 1 }}>
                    {c.id.slice(0, 7)}
                  </text>
                  {(refs[c.id] || []).map((r, ri) =>
                  <text key={r.label} className={refMoved(r.label) ? "ref-flash" : ""}
                  x={X(c.id)} y={Y(c.id) - 22 - ri * 14} textAnchor="middle"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, fill: refColor(r.kind) }}>
                      {r.label}
                    </text>
                  )}
                </g>);

            })}
          </svg>
          {tipC &&
          <div className="gtip" style={{
            left: Math.min(Math.max(X(tipC.id), 90), W - 100),
            top: Y(tipC.id) + 48,
            transform: "translateX(-50%)"
          }}>
              <div className="h">⬡ {tipC.id}</div>
              <div className="m">{tipC.msg}</div>
              {(refs[tipC.id] || []).length > 0 && <div className="r">{refs[tipC.id].map((r) => r.label).join(" · ")}</div>}
              {!reachable.has(tipC.id) && <div className="r" style={{ color: "var(--red)" }}>⚠ huérfano — ninguna rama lo alcanza</div>}
              <div className="p">{tipC.parents.length === 0 ? "commit raíz" : tipC.parents.length === 2 ? "merge · padres: " + tipC.parents.join(" + ") : "padre: " + tipC.parents[0]}</div>
            </div>
          }
        </div>
      </div>
      <div className="graph-legend">
        <span><span className="ldot" style={{ background: "var(--accent)" }}></span> HEAD (estás aquí)</span>
        <span><span className="ldot" style={{ background: "var(--violet)" }}></span> rama</span>
        <span><span className="ldot" style={{ background: "var(--cyan)" }}></span> remoto conocido</span>
        <span><span className="ldot" style={{ background: "var(--yellow)" }}></span> merge</span>
        <span><span className="ldot ldot-ghost"></span> huérfano</span>
        <span style={{ color: "var(--text-faint)" }}>· cursor sobre un nodo = hash y detalles</span>
      </div>
    </div>);

}

// ---------------- Feed de eventos: narra lo que acaba de pasar ----------------
function EventFeed({ fx }) {
  if (!fx || !fx.events.length) {
    return <div className="event-feed"><span className="efeed-idle">El árbol reacciona a cada comando: commit = nodo nuevo · branch = etiqueta nueva · push = origin se mueve…</span></div>;
  }
  return (
    <div className="event-feed" key={fx.key}>
      {fx.events.slice(0, 3).map((e, i) =>
      <span className="efeed-item" key={i} style={{ borderColor: "color-mix(in oklch, " + e.color + " 40%, transparent)", animationDelay: i * 0.12 + "s" }}>
          <b style={{ color: e.color }}>{e.icon}</b> {e.text}
        </span>
      )}
    </div>);

}

// ---------------- Paneles de estado (franja: carpeta · staging · remoto) ----------------
function FileZones({ engine, tick }) {
  const S = engine.state;
  const st = S.initialized ? engine.status() : { staged: [], modified: [], untracked: Object.keys(S.files), conflicted: [] };
  const clean = Object.keys(S.files).filter((f) =>
  !st.untracked.includes(f) && !st.modified.includes(f) && !st.conflicted.includes(f));

  const chip = (f, cls, tag) =>
  <span key={f + cls} className={"file-chip " + cls} title={tag}>{f}{tag ? <em style={{ opacity: 0.65, fontStyle: "normal", fontSize: 10 }}>{tag}</em> : null}</span>;


  return (
    <React.Fragment>
      <div className="viz-card zone-card">
        <h4><span className="zone-dot" style={{ background: "var(--red)" }}></span> Carpeta de trabajo <span className="zone-sub">donde editas</span></h4>
        <div className="file-chips">
          {Object.keys(S.files).length === 0 && <span className="empty-note">vacía</span>}
          {st.conflicted.map((f) => chip(f, "conflicted", "conflicto"))}
          {st.untracked.map((f) => chip(f, "untracked", "nuevo"))}
          {st.modified.map((f) => chip(f, "modified", "modificado"))}
          {clean.map((f) => chip(f, "clean", ""))}
        </div>
      </div>
      <div className="zone-flow"><span>git add</span><b>→</b></div>
      <div className="viz-card zone-card">
        <h4><span className="zone-dot" style={{ background: "var(--green)" }}></span> Staging <span className="zone-sub">listo para la foto</span></h4>
        <div className="file-chips">
          {Object.keys(S.staging).length === 0 ?
          <span className="empty-note">nada preparado</span> :
          Object.keys(S.staging).map((f) => chip(f, "staged", ""))}
        </div>
      </div>
      <div className="zone-flow"><span>git commit</span><b>→</b></div>
      <RemotePanel engine={engine} tick={tick} />
    </React.Fragment>);

}

function RemotePanel({ engine }) {
  const S = engine.state;
  if (!S.remote) {
    return (
      <div className="viz-card zone-card">
        <h4><span className="zone-dot" style={{ background: "var(--cyan)" }}></span> Remoto <span className="zone-sub">origin · la nube</span></h4>
        <span className="empty-note">esta misión no usa remoto</span>
      </div>);

  }
  const branches = Object.keys(S.remote.branches);
  return (
    <div className="viz-card zone-card">
      <h4><span className="zone-dot" style={{ background: "var(--cyan)" }}></span> Remoto <span className="zone-sub">{S.remote.url}</span></h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {branches.length === 0 && <span className="empty-note">remoto vacío</span>}
        {branches.map((b) => {
          const id = S.remote.branches[b];
          const c = id ? S.remote.commits[id] : null;
          const synced = S.branches[b] === id;
          return (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}>
              <span style={{ color: "var(--cyan)" }}>{b}</span>
              <span style={{ color: "var(--text-faint)" }}>@ {id ? id.slice(0, 5) : "—"}</span>
              <span style={{ color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c ? c.msg : ""}</span>
              {S.initialized && S.branches[b] !== undefined &&
              <span style={{ color: synced ? "var(--green)" : "var(--yellow)", fontSize: 10.5, flex: "none" }}>
                  {synced ? "✓ sync" : "≠ difiere"}
                </span>
              }
            </div>);

        })}
      </div>
    </div>);

}

// ---------------- Terminal ----------------
const HELP_LINES = [
{ text: "Comandos de Git:  init · status · add · commit -m \"msg\" · log · branch [-d] · switch [-c] · merge · push · pull · fetch · clone · reset · restore · revert", type: "info" },
{ text: "De la carpeta:    ls · cat <archivo> · touch <archivo> · echo \"texto\" > <archivo>", type: "info" },
{ text: "Del juego:        pista (te doy una ayuda) · reiniciar (reinicia la misión) · clear", type: "info" }];


function Terminal({ engine, mission, onCommand, lines, setLines, tick }) {
  const [input, setInput] = React.useState("");
  const [hist, setHist] = React.useState([]);
  const [hi, setHi] = React.useState(-1);
  const outRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const prompt = "~/" + engine.state.cwd + (engine.state.initialized && engine.state.HEAD ? " (" + engine.state.HEAD.branch + ")" : "") + " $";

  function submit() {
    const cmd = input.trim();
    if (!cmd) return;
    setHist((h) => [...h, cmd]);setHi(-1);
    setInput("");
    onCommand(cmd, prompt);
  }

  function onKey(e) {
    if (e.key === "Enter") submit();else
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => {
        const ni = i === -1 ? hist.length - 1 : Math.max(0, i - 1);
        if (hist[ni] !== undefined) setInput(hist[ni]);
        return ni;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => {
        const ni = i + 1;
        if (ni >= hist.length) {setInput("");return -1;}
        setInput(hist[ni]);return ni;
      });
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="term-bar">
        <span className="term-dot" style={{ background: "#ff4757" }}></span>
        <span className="term-dot" style={{ background: "#ffc24b" }}></span>
        <span className="term-dot" style={{ background: "#00e5a0" }}></span>
        <span className="term-title">terminal — misión {String(mission.num).padStart(2, "0")}</span>
      </div>
      <div className="term-out" ref={outRef}>
        {lines.map((l, i) =>
        l.type === "in" ?
        <div key={i} className="t-in"><span className="prompt">{l.prompt} </span>{l.text}</div> :
        <div key={i} className={"t-" + l.type}>{l.text}</div>
        )}
      </div>
      <div className="term-input-row">
        <span className="prompt">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="escribe un comando… (help para ayuda)"
          spellCheck="false"
          autoComplete="off" />
        
      </div>
    </div>);

}

// ---------------- Sección principal del juego ----------------
function GameSection() {
  const missions = window.GIT_MISSIONS;
  const [progress, setProgress] = React.useState(loadProgress);
  const [activeIdx, setActiveIdx] = React.useState(() => {
    const p = loadProgress();
    const idx = missions.findIndex((mm) => !p[mm.id]);
    return idx === -1 ? 0 : idx;
  });
  const [tick, setTick] = React.useState(0);
  const [lines, setLines] = React.useState([]);
  const [hintIdx, setHintIdx] = React.useState(0);
  const [doneStars, setDoneStars] = React.useState(null);
  const [fx, setFx] = React.useState(null);

  const mission = missions[activeIdx];
  const engineRef = React.useRef(null);
  const ctxRef = React.useRef({});

  const startMission = React.useCallback((idx) => {
    const mm = missions[idx];
    const e = window.GitEngine.create();
    ctxRef.current = mm.setup(e) || {};
    engineRef.current = e;
    setActiveIdx(idx);
    setHintIdx(0);
    setDoneStars(null);
    setFx(null);
    setLines([
    { text: "── Misión " + String(mm.num).padStart(2, "0") + ": " + mm.title + " ──", type: "accent" },
    { text: mm.briefing, type: "info" },
    { text: "Escribe help si te pierdes · pista si necesitas ayuda.", type: "sys" }]
    );
    setTick((t) => t + 1);
  }, [missions]);

  React.useEffect(() => {startMission(activeIdx);}, []); // eslint-disable-line

  function starsFor(counted, par) {
    if (counted <= par) return 3;
    if (counted <= par + 2) return 2;
    return 1;
  }

  function handleCommand(cmd, prompt) {
    const e = engineRef.current;
    const newLines = [{ text: cmd, type: "in", prompt }];
    const low = cmd.toLowerCase();

    if (low === "clear") {setLines([]);return;}
    if (low === "help" || low === "ayuda") {
      setLines((ls) => [...ls, ...newLines, ...HELP_LINES]);return;
    }
    if (low === "reiniciar" || low === "reset-mision") {
      startMission(activeIdx);
      return;
    }
    if (low === "pista") {
      const h = mission.hints[Math.min(hintIdx, mission.hints.length - 1)];
      setHintIdx((i) => i + 1);
      setLines((ls) => [...ls, ...newLines, { text: "💡 " + h, type: "warn" }]);
      return;
    }

    const before = snapState(e);
    const out = e.run(cmd);
    setFx(diffEvents(before, e, cmd));
    let allLines = [...newLines, ...out];

    if (!doneStars && mission.goal(e, ctxRef.current)) {
      const stars = starsFor(e.state.stats.counted, mission.par);
      const prev = progress[mission.id] || 0;
      const np = Object.assign({}, progress, { [mission.id]: Math.max(prev, stars) });
      setProgress(np);saveProgress(np);
      setDoneStars(stars);
      allLines.push({ text: "", type: "info" });
      allLines.push({ text: "★ ¡MISIÓN COMPLETADA! " + "★".repeat(stars) + "☆".repeat(3 - stars), type: "ok" });
    }
    setLines((ls) => [...ls, ...allLines]);
    setTick((t) => t + 1);
  }

  const totalStars = missions.reduce((a, mm) => a + (progress[mm.id] || 0), 0);
  const completedCount = missions.filter((mm) => progress[mm.id]).length;

  const groups = [
  { key: "facil", color: "var(--green)" },
  { key: "media", color: "var(--yellow)" },
  { key: "dificil", color: "var(--red)" }];


  const S = engineRef.current ? engineRef.current.state : null;

  return (
    <div className="section-wrap wide">
      <div className="sec-kicker">03 · Aprende jugando</div>
      <h2 className="sec-title">20 misiones, una terminal de verdad</h2>
      <p className="sec-sub">
        Escribe comandos reales de Git y mira el árbol reaccionar en vivo: cada commit dibuja un nodo,
        cada rama una etiqueta, cada push mueve a origin. Menos comandos = más estrellas.
      </p>
      <div className="game-hero-stats">
        <div className="gstat"><span className="v">{completedCount}<span style={{ color: "var(--text-faint)", fontSize: 17 }}>/20</span></span><span className="l">misiones completadas</span></div>
        <div className="gstat"><span className="v" style={{ color: "var(--green)" }}>{totalStars}<span style={{ color: "var(--text-faint)", fontSize: 17 }}>/60</span></span><span className="l">estrellas</span></div>
      </div>

      <div className="game-layout">
        <aside className="mission-list">
          <div className="mission-list-head"><h3>Misiones</h3></div>
          <div className="mission-scroll">
            {groups.map((g) =>
            <React.Fragment key={g.key}>
                <div className="diff-group-label" style={{ color: g.color }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color, display: "inline-block" }}></span>
                  {window.GIT_DIFF_LABEL[g.key]}
                  <span className="group-count">
                    {missions.filter((mm) => mm.diff === g.key && progress[mm.id]).length}/{missions.filter((mm) => mm.diff === g.key).length}
                  </span>
                </div>
                {missions.filter((mm) => mm.diff === g.key).map((mm) => {
                const idx = missions.indexOf(mm);
                return (
                  <button key={mm.id} className={"mrow" + (idx === activeIdx ? " active" : "")}
                  onClick={() => startMission(idx)}>
                      <span className="mnum">{String(mm.num).padStart(2, "0")}</span>
                      <span>{mm.title}</span>
                      <Stars n={progress[mm.id] || 0} />
                    </button>);

              })}
              </React.Fragment>
            )}
          </div>
        </aside>

        <div className="game-main">
          <div className="mission-brief">
            <div className="brief-numeral">
              <span className="bn-label">misión</span>
              <span className="bn-num">{String(mission.num).padStart(2, "0")}</span>
            </div>
            <div className="brief-body">
              <div className="brief-headrow">
                <h3>{mission.title}</h3>
                <span className={"diff-badge diff-" + mission.diff}>{window.GIT_DIFF_LABEL[mission.diff]}</span>
                {progress[mission.id] ? <Stars n={progress[mission.id]} /> : null}
              </div>
              <p className="objective"><strong>Objetivo · </strong><MdText text={mission.objective} /></p>
              <div className="brief-foot">
                <span className="par-chip">3★ ≤ {mission.par === 0 ? "inspección" : mission.par + " cmd" + (mission.par > 1 ? "s" : "")}</span>
                <button className="mhint-btn" onClick={() => setHintIdx((i) => i + 1)}>
                  💡 pedir pista <span className="hint-count">{Math.min(hintIdx, mission.hints.length)}/{mission.hints.length}</span>
                </button>
                <button className="mreset-btn" onClick={() => startMission(activeIdx)}>↺ reiniciar</button>
              </div>
              {hintIdx > 0 &&
              <div className="mhint">
                  {mission.hints.slice(0, Math.min(hintIdx, mission.hints.length)).map((h, i) =>
                <div key={i} style={{ padding: "2px 0" }}>💡 <MdText text={h} /></div>
                )}
                </div>
              }
            </div>
          </div>

          {doneStars &&
          <div className="mission-done-card">
              <div className="done-text">
                <div className="done-title-row">
                  <h3>¡Misión completada!</h3>
                  <Stars n={doneStars} size="big" />
                </div>
                <p>
                  {doneStars === 3 ? "Perfecto: lo resolviste con el mínimo de comandos." :
                doneStars === 2 ? "¡Muy bien! Con un par de comandos menos serían 3 estrellas." :
                "Completada. Reiníciala cuando quieras para intentar las 3 estrellas."}
                </p>
              </div>
              <div className="done-actions">
                <button className="btn-ghost" onClick={() => startMission(activeIdx)}>↺ Reintentar</button>
                {activeIdx < missions.length - 1 &&
              <button className="btn-primary" onClick={() => startMission(activeIdx + 1)}>Siguiente misión →</button>
              }
              </div>
            </div>
          }

          <div className="tree-row">
            {engineRef.current &&
            <div className="viz-card tree-card">
                <h4>
                  <span className="zone-dot" style={{ background: "var(--violet)" }}></span>
                  Árbol del repositorio
                  {S && S.initialized && S.HEAD ? <span className="tree-branch">· rama {S.HEAD.branch}</span> : null}
                </h4>
                <EventFeed fx={fx} />
                <div className="tree-canvas">
                  <CommitGraph engine={engineRef.current} tick={tick} fx={fx} />
                </div>
              </div>
            }
          </div>

          <div className="console-row">
            {engineRef.current &&
            <Terminal engine={engineRef.current} mission={mission}
            onCommand={handleCommand} lines={lines} setLines={setLines} tick={tick} />
            }
            {engineRef.current &&
            <div className="repo-side">
                <FileZones engine={engineRef.current} tick={tick} />
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}

window.GameSection = GameSection;