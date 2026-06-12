// ============================================================
// casos.jsx — Sección "Casos de Uso": recetas paso a paso
// ============================================================

function CodeBox({ lines }) {
  return (
    <div className="codebox">
      <pre>{lines.map((l, i) => {
        if (l.startsWith("#")) return <div key={i} className="c-comment">{l}</div>;
        const isGit = l.trim().startsWith("git ");
        return <div key={i} className="c-cmd">{isGit ? <span><span className="c-git">git</span>{l.trim().slice(3)}</span> : l}</div>;
      })}</pre>
    </div>
  );
}

const USE_CASES = [
  {
    title: "Empezar un proyecto desde cero",
    when: "Tienes una carpeta con código y quieres empezar a versionarla.",
    steps: [
      { text: <span><strong>Inicializa el repositorio</strong> dentro de la carpeta del proyecto. Solo se hace una vez.</span>, code: ["git init"] },
      { text: <span><strong>Guarda la primera foto</strong> con todo lo que existe hasta ahora.</span>, code: ["git add .", 'git commit -m "primer commit"'] },
      { text: <span><strong>Conéctalo a la nube</strong> (crea un repo vacío en GitHub y copia su URL) y sube tu trabajo.</span>, code: ["git remote add origin <url>", "git push -u origin main"] },
    ],
    tip: <span><strong>Consejo:</strong> crea también un archivo <code style={{ fontSize: 12.5 }}>.gitignore</code> con lo que NO quieres versionar (node_modules, .env, archivos temporales…) antes del primer commit.</span>,
  },
  {
    title: "El día a día trabajando en equipo",
    when: "El flujo push/pull que repetirás todos los días.",
    steps: [
      { text: <span><strong>Empieza el día sincronizando.</strong> Trae lo que tu equipo subió mientras no estabas. Hazlo siempre ANTES de empezar a trabajar.</span>, code: ["git pull"] },
      { text: <span><strong>Trabaja y guarda en ciclos pequeños.</strong> Un commit por cada cambio con sentido propio — no uno gigante al final del día.</span>, code: ["# ...editas archivos...", "git add .", 'git commit -m "corrige cálculo de envío"'] },
      { text: <span><strong>Comparte al terminar.</strong> Si el push es rechazado, no es un error tuyo: alguien subió antes que tú. Haz pull y reintenta.</span>, code: ["git push", "# si dice [rejected]:", "git pull", "git push"] },
    ],
    tip: <span><strong>Regla de oro:</strong> pull al empezar, push al terminar. Cuanto más a menudo sincronices, más pequeños (y fáciles) serán los merges.</span>,
  },
  {
    title: "Contribuir a un proyecto existente",
    when: "Te unes a un equipo o quieres aportar a un proyecto open source.",
    steps: [
      { text: <span><strong>Clona el repositorio.</strong> Te descarga el código, todo el historial y la conexión al remoto. (En open source, primero haz <strong>fork</strong> en GitHub y clona TU copia.)</span>, code: ["git clone https://github.com/equipo/proyecto.git", "cd proyecto"] },
      { text: <span><strong>Crea una rama para tu cambio.</strong> Nunca trabajes directo sobre main: tu rama es tu espacio seguro.</span>, code: ["git switch -c arregla-login"] },
      { text: <span><strong>Trabaja, commitea y sube tu rama.</strong></span>, code: ["git add .", 'git commit -m "valida email en login"', "git push -u origin arregla-login"] },
      { text: <span><strong>Abre un Pull Request</strong> en GitHub: es la petición formal de que revisen y fusionen tu rama en main. La conversación y la revisión de código pasan ahí.</span>, code: ["# en github.com → botón \"Compare & pull request\""] },
    ],
    tip: <span><strong>Pull Request ≠ git pull.</strong> El PR es una función de GitHub (revisión + merge con botón); <code style={{ fontSize: 12.5 }}>git pull</code> es el comando para traer cambios. Nombre parecido, cosas distintas.</span>,
  },
  {
    title: "“Me equivoqué en el último commit”",
    when: "Mensaje mal escrito, archivo olvidado o commit que sobra — y AÚN no hiciste push.",
    steps: [
      { text: <span><strong>¿Mensaje equivocado u olvidaste un archivo?</strong> Amend rehace el último commit en lugar de crear otro.</span>, code: ["git add archivo-olvidado.js", 'git commit --amend -m "mensaje corregido"'] },
      { text: <span><strong>¿El commit entero sobra, pero quieres conservar los cambios?</strong> Reset suave: borra el commit, deja tus archivos intactos.</span>, code: ["git reset --soft HEAD~1"] },
      { text: <span><strong>¿Quieres que todo desaparezca de verdad?</strong> Reset duro: borra el commit Y los cambios. No hay vuelta atrás.</span>, code: ["git reset --hard HEAD~1"] },
    ],
    tip: <span><strong>⚠ Solo en local:</strong> amend y reset reescriben la historia. Son seguros únicamente si NO has hecho push. Si ya publicaste, usa el siguiente caso.</span>,
  },
  {
    title: "“Subí algo que no debía”",
    when: "El commit malo ya está en el remoto y tu equipo puede tenerlo.",
    steps: [
      { text: <span><strong>No reescribas la historia publicada.</strong> Usa revert: crea un commit NUEVO con los cambios opuestos. La historia queda intacta y honesta.</span>, code: ["git revert HEAD", "git push"] },
      { text: <span><strong>¿Fue hace varios commits?</strong> Encuentra su hash en el log y reviértelo directamente.</span>, code: ["git log --oneline", "git revert a1b2c3d"] },
      { text: <span><strong>¿Subiste un secreto (contraseña, API key)?</strong> Revertir NO basta: el secreto sigue en el historial. Invalida esa credencial inmediatamente y genera una nueva.</span>, code: ["# 1. rota la credencial en el servicio", "# 2. luego limpia el historial (avanzado)"] },
    ],
    tip: <span><strong>reset vs revert:</strong> reset borra commits (solo local); revert los compensa con uno nuevo (seguro en público). Ante la duda: revert.</span>,
  },
  {
    title: "Recuperar un archivo roto o borrado",
    when: "Editaste o borraste algo por accidente y quieres volver a la última versión guardada.",
    steps: [
      { text: <span><strong>Descarta los cambios de un archivo</strong> y vuelve a su última versión commiteada. (También funciona si lo borraste.)</span>, code: ["git restore estilos.css"] },
      { text: <span><strong>¿Lo metiste en staging sin querer?</strong> Sácalo sin perder tus ediciones.</span>, code: ["git restore --staged secreto.txt"] },
      { text: <span><strong>¿Necesitas la versión de hace 3 commits?</strong> Puedes traer un archivo desde cualquier punto del historial.</span>, code: ["git log --oneline", "git restore --source a1b2c3d estilos.css"] },
    ],
    tip: <span><strong>Por esto se commitea seguido:</strong> Git solo puede devolverte versiones que fotografiaste. Un commit pequeño cada rato es tu mejor seguro.</span>,
  },
];

function UseCase({ uc, num, open, onToggle }) {
  return (
    <div className={"case" + (open ? " open" : "")}>
      <button className="case-head" onClick={onToggle}>
        <span className="case-num">{String(num).padStart(2, "0")}</span>
        <span>
          <h3>{uc.title}</h3>
          <div className="case-when">{uc.when}</div>
        </span>
        <span className="case-caret">›</span>
      </button>
      {open && (
        <div className="case-body">
          <div className="steps">
            {uc.steps.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-rail">
                  <span className="step-dot">{i + 1}</span>
                  {i < uc.steps.length - 1 && <span className="step-line"></span>}
                </div>
                <div className="step-content">
                  <p>{s.text}</p>
                  <CodeBox lines={s.code} />
                </div>
              </div>
            ))}
          </div>
          <div className="case-tip">{uc.tip}</div>
        </div>
      )}
    </div>
  );
}

function CasesSection() {
  const [open, setOpen] = React.useState(0);
  return (
    <div className="section-wrap">
      <div className="sec-kicker">02 · Casos de uso</div>
      <h2 className="sec-title">Recetas para la vida real</h2>
      <p className="sec-sub">
        Las seis situaciones que te vas a encontrar sí o sí. Cada una es una receta paso a paso:
        cópiala, adáptala, y con el tiempo te saldrá sola.
      </p>
      <div className="case-list">
        {USE_CASES.map((uc, i) => (
          <UseCase key={i} uc={uc} num={i + 1} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}

window.CasesSection = CasesSection;
