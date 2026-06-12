// ============================================================
// missions-data.js — 20 misiones con dificultad
// Cada misión: setup(engine) -> ctx, goal(engine, ctx) -> bool
// "par" = nº de comandos git que cuentan (ver engine) para 3★
// ============================================================
(function () {
  const M = [];

  function m(def) { M.push(def); }

  // ---------------- FÁCIL ----------------
  m({
    id: "init", num: 1, diff: "facil", title: "Hola, Git",
    briefing: "Tienes una carpeta con un archivo, pero Git aún no la conoce. Sin repositorio, no hay historial: cualquier cambio se pierde para siempre.",
    objective: "Convierte esta carpeta en un repositorio Git con `git init`.",
    par: 1,
    hints: ["Solo necesitas un comando: `git init`.", "Después puedes comprobar con `git status` que todo funcionó."],
    setup(e) { e._setup.writeFile("readme.md", "# Mi proyecto"); return {}; },
    goal(e) { return e.state.initialized; },
  });

  m({
    id: "add", num: 2, diff: "facil", title: "A la mesa de preparación",
    briefing: "Git ve tu archivo readme.md pero no lo vigila (está 'untracked'). Antes de guardar una foto del proyecto, debes decidir qué entra en ella.",
    objective: "Pon `readme.md` en el área de staging con `git add`.",
    par: 1,
    hints: ["`git add readme.md` — mira cómo el archivo cambia de zona en el panel de la derecha.", "`git status` te dice siempre en qué zona está cada archivo."],
    setup(e) { e._setup.init(); e._setup.writeFile("readme.md", "# Mi proyecto"); return {}; },
    goal(e) { return e.state.staging["readme.md"] !== undefined; },
  });

  m({
    id: "commit", num: 3, diff: "facil", title: "Tu primera foto",
    briefing: "readme.md ya está en staging, listo para posar. Un commit es una foto permanente del proyecto: queda guardada para siempre con autor, fecha y mensaje.",
    objective: "Crea tu primer commit con `git commit -m \"mensaje\"`.",
    par: 1,
    hints: ["`git commit -m \"primer commit\"` — el mensaje va entre comillas.", "Un buen mensaje describe el cambio: \"agrega readme\" es mejor que \"cambios\"."],
    setup(e) { e._setup.init(); e._setup.writeFile("readme.md", "# Mi proyecto"); e._setup.stage("readme.md"); return {}; },
    goal(e) { return e.headId() !== null; },
  });

  m({
    id: "ciclo", num: 4, diff: "facil", title: "El ciclo completo",
    briefing: "Apareció un archivo nuevo: recetas.md. Esta vez harás el ciclo entero tú solo: prepararlo y fotografiarlo.",
    objective: "Haz que `recetas.md` quede guardado en un commit (add + commit).",
    par: 2,
    hints: ["Primero `git add recetas.md`, luego `git commit -m \"...\"`.", "El ciclo add → commit es el latido de Git. Lo harás miles de veces."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# Recetario"); e._setup.stage("readme.md");
      e._setup.commit("primer commit");
      e._setup.writeFile("recetas.md", "1. Tortilla de papas");
      return {};
    },
    goal(e) { return e.treeOf(e.headId())["recetas.md"] !== undefined; },
  });

  m({
    id: "inspeccion", num: 5, diff: "facil", title: "¿Qué está pasando aquí?",
    briefing: "Llegas a un proyecto a mitad de camino: hay historial y alguien dejó un archivo a medio editar. Antes de tocar nada, un buen dev investiga.",
    objective: "Inspecciona el repo: ejecuta `git status` y también `git log`.",
    par: 0,
    hints: ["`git status` = ¿cómo están mis archivos AHORA?", "`git log` = ¿qué commits hay en el historial? Necesitas ejecutar ambos."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("app.js", "console.log('v1')"); e._setup.stage("app.js");
      e._setup.commit("versión inicial");
      e._setup.writeFile("notas.md", "pendientes"); e._setup.stage("notas.md");
      e._setup.commit("agrega notas");
      e._setup.writeFile("app.js", "console.log('v2 a medias...')");
      return {};
    },
    goal(e) { return e.state.stats.ranStatus && e.state.stats.ranLog; },
  });

  m({
    id: "editar", num: 6, diff: "facil", title: "Editar y volver a guardar",
    briefing: "saludo.txt ya vive en el historial, pero su contenido quedó viejo. Los commits no se editan: se crea uno nuevo encima.",
    objective: "Cambia el contenido de `saludo.txt` (usa `echo \"texto\" > saludo.txt`) y guarda el cambio en un nuevo commit.",
    par: 2,
    hints: ["Edita con: `echo \"hola mundo\" > saludo.txt`", "Luego el ciclo de siempre: `git add saludo.txt` y `git commit -m \"...\"`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("saludo.txt", "hola"); e._setup.stage("saludo.txt");
      e._setup.commit("agrega saludo");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      const st = e.status();
      return t["saludo.txt"] !== undefined && t["saludo.txt"] !== "hola" && st.modified.length === 0 && st.staged.length === 0;
    },
  });

  m({
    id: "addtodo", num: 7, diff: "facil", title: "Todo de una vez",
    briefing: "Acabas de maquetar una página: tres archivos nuevos. Añadirlos uno por uno es lento — Git tiene un atajo.",
    objective: "Guarda los 3 archivos en un solo commit. Pista: `git add .` añade todo lo nuevo de golpe.",
    par: 2,
    hints: ["`git add .` — el punto significa \"todo lo de esta carpeta\".", "Después: `git commit -m \"primera versión de la página\"`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("base.md", "proyecto web"); e._setup.stage("base.md");
      e._setup.commit("inicio");
      e._setup.writeFile("index.html", "<h1>Hola</h1>");
      e._setup.writeFile("estilos.css", "h1 { color: tomato }");
      e._setup.writeFile("app.js", "console.log('hey')");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return t["index.html"] !== undefined && t["estilos.css"] !== undefined && t["app.js"] !== undefined;
    },
  });

  // ---------------- MEDIA ----------------
  m({
    id: "push", num: 8, diff: "media", title: "Comparte tu trabajo",
    briefing: "Hiciste un commit en tu máquina, pero tu equipo no lo ve: solo existe en TU repositorio local. El remoto ('origin') sigue desactualizado.",
    objective: "Sube tu commit al remoto con `git push`. Observa cómo se actualiza el panel ☁ Remoto.",
    par: 1,
    hints: ["`git push` empuja tus commits locales hacia origin.", "Mira el grafo: la etiqueta origin/main se moverá hasta tu commit."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# API"); e._setup.stage("readme.md");
      e._setup.commit("inicio");
      e._setup.addRemote("github.com/equipo/api.git");
      e._setup.writeFile("rutas.js", "GET /usuarios"); e._setup.stage("rutas.js");
      e._setup.commit("agrega rutas");
      return {};
    },
    goal(e) { return e.state.remote.branches.main === e.headId(); },
  });

  m({
    id: "pull", num: 9, diff: "media", title: "Tráete lo nuevo",
    briefing: "Tu compañera Ana subió un commit al remoto mientras dormías: un archivo api.js. Tu repositorio local no se entera solo — hay que pedirle los cambios.",
    objective: "Descarga e integra el trabajo de Ana con `git pull`. Al final debes tener `api.js` en tu carpeta.",
    par: 1,
    hints: ["`git pull` = fetch (descargar) + merge (integrar) en un solo paso.", "Después haz `ls` para confirmar que api.js apareció en tu carpeta."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# API"); e._setup.stage("readme.md");
      e._setup.commit("inicio");
      e._setup.addRemote("github.com/equipo/api.git");
      e._setup.remoteCommit("Ana: agrega api.js", { "api.js": "export const api = {}" });
      return {};
    },
    goal(e) { return e.headId() === e.state.remote.branches.main && e.state.files["api.js"] !== undefined; },
  });

  m({
    id: "rechazado", num: 10, diff: "media", title: "Push rechazado",
    briefing: "Tú hiciste un commit local (menu.js) y, a la vez, Luis subió otro al remoto (estilos.css). Las historias divergieron. Intenta hacer push y mira qué pasa…",
    objective: "Logra que tu commit Y el de Luis estén en el remoto. Empieza con `git push` y lee el error con calma.",
    par: 2,
    hints: ["El push falla porque el remoto tiene commits que tú no tienes.", "La receta de siempre: `git pull` primero (integra lo de Luis), luego `git push`.", "El pull creará un commit de merge automático: las dos historias se unen."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# Web"); e._setup.stage("readme.md");
      e._setup.commit("inicio");
      e._setup.addRemote("github.com/equipo/web.git");
      e._setup.remoteCommit("Luis: agrega estilos", { "estilos.css": "body { margin: 0 }" });
      e._setup.writeFile("menu.js", "const menu = []"); e._setup.stage("menu.js");
      e._setup.commit("agrega menú");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.remote.branches.main === e.headId() && t["estilos.css"] !== undefined && t["menu.js"] !== undefined;
    },
  });

  m({
    id: "rama", num: 11, diff: "media", title: "Universos paralelos",
    briefing: "Quieres experimentar sin romper la versión estable. Una rama es exactamente eso: una línea de trabajo paralela que nace del mismo punto.",
    objective: "Crea una rama llamada `experimento` y cámbiate a ella. Atajo: `git switch -c experimento`.",
    par: 1,
    hints: ["`git switch -c experimento` crea Y cambia en un solo paso.", "También vale el camino largo: `git branch experimento` + `git switch experimento`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("app.js", "v1"); e._setup.stage("app.js");
      e._setup.commit("versión estable");
      return {};
    },
    goal(e) { return e.state.HEAD && e.state.HEAD.branch !== "main"; },
  });

  m({
    id: "ramacommit", num: 12, diff: "media", title: "Trabaja en tu rama",
    briefing: "Ya existe la rama 'oscuro' para diseñar el modo oscuro. Trabaja ahí: lo que hagas no tocará main hasta que tú decidas fusionarlo.",
    objective: "Cámbiate a la rama `oscuro`, crea `tema.css` (con `echo`) y haz commit ahí.",
    par: 3,
    hints: ["Primero: `git switch oscuro`.", "Luego crea el archivo: `echo \"body { background: black }\" > tema.css`", "Y el ciclo: `git add tema.css` + `git commit -m \"tema oscuro\"`. Mira el grafo divergir."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("index.html", "<h1>Web</h1>"); e._setup.stage("index.html");
      e._setup.commit("versión estable");
      e._setup.branch("oscuro");
      return {};
    },
    goal(e) {
      const o = e.state.branches["oscuro"];
      return o && e.treeOf(o)["tema.css"] !== undefined && o !== e.state.branches.main;
    },
  });

  m({
    id: "ff", num: 13, diff: "media", title: "Fusión limpia (fast-forward)",
    briefing: "El tema oscuro quedó listo en su rama y main no se movió desde entonces. Fusionar será trivial: main solo necesita 'avanzar' hasta donde está oscuro.",
    objective: "Vuelve a `main` y fusiona la rama `oscuro` con `git merge`.",
    par: 2,
    hints: ["`git switch main` y luego `git merge oscuro`.", "Verás 'Fast-forward': no hace falta commit nuevo, main solo avanza."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("index.html", "<h1>Web</h1>"); e._setup.stage("index.html");
      e._setup.commit("versión estable");
      e._setup.branch("oscuro");
      e._setup.switchTo("oscuro");
      e._setup.writeFile("tema.css", "body { background: #111 }"); e._setup.stage("tema.css");
      e._setup.commit("tema oscuro listo");
      return {};
    },
    goal(e) {
      return e.state.HEAD.branch === "main" && e.state.branches.main === e.state.branches.oscuro;
    },
  });

  m({
    id: "fetch", num: 14, diff: "media", title: "Mirar antes de mezclar",
    briefing: "Hay cambios nuevos en el remoto, pero esta vez quieres VERLOS antes de integrarlos. `git fetch` descarga sin tocar tu rama — `git pull` haría las dos cosas de golpe.",
    objective: "Descarga lo nuevo con `git fetch`, revísalo si quieres (`git log`), y luego intégralo con `git merge origin/main`.",
    par: 2,
    hints: ["`git fetch` descarga los commits y mueve la etiqueta origin/main, pero TU main no cambia.", "Cuando estés convencido: `git merge origin/main` integra lo descargado.", "fetch + merge = pull. Son lo mismo, en dos pasos."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# Docs"); e._setup.stage("readme.md");
      e._setup.commit("inicio");
      e._setup.addRemote("github.com/equipo/docs.git");
      e._setup.remoteCommit("Sara: guía de instalación", { "instalacion.md": "1. npm install" });
      return {};
    },
    goal(e) { return e.state.stats.ranFetch && e.headId() === e.state.remote.branches.main; },
  });

  // ---------------- DIFÍCIL ----------------
  m({
    id: "conflicto", num: 15, diff: "dificil", title: "¡Conflicto!",
    briefing: "Tú renombraste el proyecto a 'Proyecto Mercurio' en main. En la rama 'rename' alguien lo llamó 'Proyecto Géminis'. Mismo archivo, misma línea: Git no puede decidir solo.",
    objective: "Fusiona la rama `rename` en main, resuelve el conflicto en `titulo.txt` y completa el merge con un commit.",
    par: 3,
    hints: ["Empieza con `git merge rename` y lee el error: CONFLICT.", "Mira el archivo: `cat titulo.txt`. Verás las marcas <<<<<<< y >>>>>>>.", "Decide el contenido final: `echo \"Proyecto Géminis\" > titulo.txt` (o el nombre que prefieras).", "Marca resuelto con `git add titulo.txt` y termina con `git commit -m \"resuelve conflicto\"`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("titulo.txt", "Proyecto Apollo"); e._setup.stage("titulo.txt");
      e._setup.commit("nombre inicial");
      e._setup.branch("rename");
      e._setup.switchTo("rename");
      e._setup.writeFile("titulo.txt", "Proyecto Géminis"); e._setup.stage("titulo.txt");
      e._setup.commit("renombra a Géminis");
      e._setup.switchTo("main");
      e._setup.writeFile("titulo.txt", "Proyecto Mercurio"); e._setup.stage("titulo.txt");
      e._setup.commit("renombra a Mercurio");
      return {};
    },
    goal(e) {
      const h = e.state.commits[e.headId()];
      const content = e.state.files["titulo.txt"] || "";
      return h && h.parents.length === 2 && e.state.conflicts.length === 0 && !e.state.mergingFrom && !content.includes("<<<<<<<");
    },
  });

  m({
    id: "revert", num: 16, diff: "dificil", title: "Deshacer en público",
    briefing: "El último commit rompió producción… y ya está en el remoto. No puedes borrarlo: tu equipo ya lo tiene. La salida elegante es un commit nuevo que lo deshaga.",
    objective: "Deshaz el último commit con `git revert HEAD` y sube la corrección con `git push`.",
    par: 2,
    hints: ["`git revert HEAD` crea un commit nuevo con los cambios opuestos. La historia no se reescribe.", "No olvides el `git push` final: la corrección también hay que publicarla.", "Regla de oro: lo publicado se deshace con revert, nunca con reset."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("app.js", "function pagar() { /* ok */ }"); e._setup.stage("app.js");
      e._setup.commit("módulo de pagos estable");
      e._setup.writeFile("app.js", "function pagar() { throw 'BUG' }"); e._setup.stage("app.js");
      e._setup.commit("optimiza pagos (rompe todo)");
      e._setup.addRemote("github.com/equipo/tienda.git");
      return {};
    },
    goal(e) {
      const h = e.state.commits[e.headId()];
      return h && h.msg.startsWith("Revert") && e.state.remote.branches.main === e.headId();
    },
  });

  m({
    id: "reset", num: 17, diff: "dificil", title: "Borrar el último commit (local)",
    briefing: "Commiteaste pruebas.tmp por error. Buena noticia: AÚN no hiciste push — nadie lo ha visto. Aquí sí puedes reescribir la historia sin consecuencias.",
    objective: "Elimina el último commit (y sus archivos) con `git reset --hard HEAD~1`.",
    par: 1,
    hints: ["`git reset --hard HEAD~1` = retrocede la rama 1 commit y descarta esos cambios.", "HEAD~1 significa \"un commit antes de donde estoy\".", "⚠ --hard borra de verdad. Solo para commits que NO has publicado."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("informe.md", "# Informe anual"); e._setup.stage("informe.md");
      const good = e._setup.commit("informe listo");
      e._setup.writeFile("pruebas.tmp", "basura temporal 9MB"); e._setup.stage("pruebas.tmp");
      e._setup.commit("ups, archivos de prueba");
      return { good };
    },
    goal(e, ctx) { return e.headId() === ctx.good && e.state.files["pruebas.tmp"] === undefined; },
  });

  m({
    id: "unstage", num: 18, diff: "dificil", title: "Sácalo del staging",
    briefing: "Preparaste dos archivos para el commit… pero secreto.txt contiene una contraseña. ¡No debe entrar en la foto! Hay que sacarlo del staging antes de commitear.",
    objective: "Saca `secreto.txt` del staging con `git restore --staged secreto.txt` y luego commitea solo `notas.md`.",
    par: 2,
    hints: ["`git restore --staged secreto.txt` lo devuelve a tu carpeta sin tocar su contenido.", "Comprueba con `git status` que solo notas.md sigue en verde.", "Luego `git commit -m \"...\"` guardará únicamente lo que quedó en staging."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("readme.md", "# App"); e._setup.stage("readme.md");
      e._setup.commit("inicio");
      e._setup.writeFile("notas.md", "ideas para la demo");
      e._setup.writeFile("secreto.txt", "password=hunter2");
      e._setup.stage("notas.md"); e._setup.stage("secreto.txt");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      const h = e.state.commits[e.headId()];
      return h && h.parents.length === 1 && t["notas.md"] !== undefined && t["secreto.txt"] === undefined;
    },
  });

  m({
    id: "clone", num: 19, diff: "dificil", title: "Clona y contribuye",
    briefing: "Te uniste a un equipo nuevo. Su proyecto vive en github.com/equipo/web.git y tu primera tarea es agregar un footer. Flujo profesional completo: clonar, crear rama, trabajar, subir.",
    objective: "1) `git clone github.com/equipo/web.git` · 2) crea la rama `footer` y cámbiate · 3) crea `footer.html` con `echo` · 4) add + commit · 5) `git push`.",
    par: 5,
    hints: ["`git clone github.com/equipo/web.git` te trae el proyecto entero con su historial.", "`git switch -c footer` para trabajar en tu propia rama, como se hace en equipo.", "`echo \"<footer>© 2026</footer>\" > footer.html`, luego add + commit.", "`git push` publicará tu rama nueva en el remoto."],
    setup(e) {
      e._setup.remoteOnly("github.com/equipo/web.git");
      e._setup.remoteCommit("estructura inicial", { "index.html": "<h1>Equipo Web</h1>" });
      e._setup.remoteCommit("agrega estilos", { "estilos.css": "h1 { color: teal }" });
      return {};
    },
    goal(e) {
      const r = e.state.remote;
      if (!r) return false;
      for (const b in r.branches) {
        if (b !== "main" && r.branches[b] && r.branches[b] !== r.branches.main) {
          const c = r.commits[r.branches[b]];
          if (c && c.tree["footer.html"] !== undefined) return true;
        }
      }
      return false;
    },
  });

  m({
    id: "final", num: 20, diff: "dificil", title: "Misión final: un día de trabajo",
    briefing: "El examen final. Es lunes por la mañana: Marta subió algo al remoto durante el fin de semana, y a ti te toca agregar la página de contacto. Haz el flujo completo de un día real.",
    objective: "1) `git pull` para empezar al día · 2) rama nueva `contacto` · 3) crea `contacto.html`, add + commit · 4) vuelve a main y fusiona · 5) `git push`. Todo debe acabar en el remoto.",
    par: 7,
    hints: ["Siempre se empieza el día con `git pull`.", "`git switch -c contacto`, crea el archivo con echo, y el ciclo add + commit.", "`git switch main` y `git merge contacto` (será fast-forward).", "Cierra con `git push`. El grafo y el remoto deben quedar idénticos."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("index.html", "<h1>Estudio</h1>"); e._setup.stage("index.html");
      e._setup.commit("sitio base");
      e._setup.addRemote("github.com/equipo/estudio.git");
      e._setup.remoteCommit("Marta: cabecera nueva", { "header.css": "header { display: flex }" });
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.HEAD.branch === "main"
        && e.state.remote.branches.main === e.headId()
        && t["header.css"] !== undefined
        && t["contacto.html"] !== undefined;
    },
  });

  window.GIT_MISSIONS = M;
  window.GIT_DIFF_LABEL = { facil: "Fácil", media: "Media", dificil: "Difícil" };
})();
