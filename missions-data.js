// ============================================================
// missions-data.js — 30 misiones con dificultad
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

  // ---------------- ÁMBITO REAL ----------------
  m({
    id: "onboarding-repo", num: 21, diff: "media", title: "Onboarding a un repo vivo",
    context: "Primer día en el equipo de plataforma. Te pasan `github.com/acme/platform.git`; antes de tocar código necesitas clonar, revisar que el árbol esté limpio y entender los últimos commits.",
    briefing: "Te unes a un proyecto existente y necesitas entrar con calma: clonar, mirar estado y leer historial antes de editar.",
    deliverable: "Clona `github.com/acme/platform.git`, ejecuta `git status` y revisa el historial con `git log`.",
    objective: "Clona el repositorio, inspecciona el estado y revisa el historial.",
    watch: "El árbol debe aparecer completo después de `git clone`; `HEAD → main` y `origin/main` quedan sobre el mismo commit.",
    par: 1,
    hints: ["Empieza con `git clone github.com/acme/platform.git`.", "Después usa `git status` para comprobar que no hay cambios locales.", "`git log` te da el mapa inicial del historial."],
    setup(e) {
      e._setup.remoteOnly("github.com/acme/platform.git");
      e._setup.remoteCommit("bootstrap del servicio", { "README.md": "# Platform" });
      e._setup.remoteCommit("agrega healthcheck", { "healthcheck.js": "export const ok = true" });
      e._setup.remoteCommit("documenta despliegue", { "deploy.md": "npm run deploy" });
      return {};
    },
    goal(e) {
      return e.state.initialized
        && e.state.stats.ranStatus
        && e.state.stats.ranLog
        && e.state.files["README.md"] !== undefined;
    },
  });

  m({
    id: "ticket-branch", num: 22, diff: "media", title: "Rama para un ticket",
    context: "Te asignan el ticket LOGIN-184. Antes de abrir la rama, main recibió pruebas nuevas de QA; si no sincronizas, empezarás desde una base vieja.",
    briefing: "En un equipo real, una rama de tarea debe nacer desde main actualizado, no desde el main que tenías ayer.",
    deliverable: "Trae lo último con `git pull` y crea/cámbiate a `feature/login-rate-limit`.",
    objective: "Sincroniza main y crea la rama de trabajo `feature/login-rate-limit`.",
    watch: "Después del pull, main avanza hasta origin/main; después de `switch -c`, la etiqueta HEAD salta a tu rama nueva.",
    par: 2,
    hints: ["Primero `git pull` para traer el commit de QA.", "Luego `git switch -c feature/login-rate-limit`.", "La rama nueva debe quedar parada en el último commit de main."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("login.js", "export function login() {}"); e._setup.stage("login.js");
      e._setup.commit("login base");
      e._setup.addRemote("github.com/acme/auth.git");
      e._setup.remoteCommit("QA: pruebas de login", { "tests/login.spec.js": "it('valida bloqueo')" });
      return {};
    },
    goal(e) {
      return e.state.HEAD
        && e.state.HEAD.branch === "feature/login-rate-limit"
        && e.state.files["tests/login.spec.js"] !== undefined;
    },
  });

  m({
    id: "commit-selectivo", num: 23, diff: "media", title: "Commit quirúrgico",
    context: "Tocaste dos archivos: `checkout.js` corrige el cupón del ticket y `analytics.js` tiene pruebas locales que todavía no deben salir. El PR debe llevar solo el arreglo.",
    briefing: "Un commit profesional cuenta una historia pequeña. No metas ruido local si no pertenece al cambio.",
    deliverable: "Commitea solo `checkout.js`; deja `analytics.js` modificado en tu carpeta, pero fuera del historial.",
    objective: "Haz un commit selectivo con solo el archivo del arreglo.",
    watch: "El nuevo nodo debe cambiar `checkout.js`; `analytics.js` seguirá como modificado en la carpeta de trabajo.",
    par: 2,
    hints: ["No uses `git add .` aquí.", "Prepara solo el archivo correcto: `git add checkout.js`.", "Luego `git commit -m \"corrige cupon en checkout\"`."],
    setup(e) {
      e._setup.init();
      e._setup.writeFile("checkout.js", "export const total = carrito.total");
      e._setup.writeFile("analytics.js", "track('view')");
      e._setup.stage("checkout.js"); e._setup.stage("analytics.js");
      e._setup.commit("checkout inicial");
      e._setup.writeFile("checkout.js", "export const total = aplicarCupon(carrito.total)");
      e._setup.writeFile("analytics.js", "track('debug-local')");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      const h = e.state.commits[e.headId()];
      return h
        && h.parents.length === 1
        && t["checkout.js"] === "export const total = aplicarCupon(carrito.total)"
        && t["analytics.js"] === "track('view')"
        && e.state.files["analytics.js"] === "track('debug-local')";
    },
  });

  m({
    id: "pr-sync", num: 24, diff: "dificil", title: "Actualiza tu PR",
    context: "Tu rama `feature/carrito` ya tiene un commit, pero main avanzó en remoto con cambios de diseño. Antes de pedir review, integra origin/main y publica tu rama.",
    briefing: "Cuando un PR queda atrasado, lo normal es traer main, mezclarlo en tu rama y empujar la rama actualizada.",
    deliverable: "Ejecuta `git fetch`, fusiona `origin/main` en tu rama y publica `feature/carrito` con `git push`.",
    objective: "Actualiza tu rama de PR con lo último de main y súbela al remoto.",
    watch: "Fetch mueve `origin/main`; el merge une tu rama con la base nueva; push crea `origin/feature/carrito`.",
    par: 3,
    hints: ["Estás parado en `feature/carrito`.", "`git fetch` descarga el main nuevo sin tocar tu rama.", "Después usa `git merge origin/main` y cierra con `git push`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("cart.js", "export const cart = []"); e._setup.stage("cart.js");
      e._setup.commit("carrito base");
      e._setup.addRemote("github.com/acme/shop.git");
      e._setup.branch("feature/carrito");
      e._setup.switchTo("feature/carrito");
      e._setup.writeFile("cart.js", "export const cart = ['coupon']");
      e._setup.stage("cart.js"); e._setup.commit("agrega cupones al carrito");
      e._setup.remoteCommit("UI: header responsive", { "header.css": "header { display: grid }" });
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.HEAD.branch === "feature/carrito"
        && e.state.remote.branches["feature/carrito"] === e.headId()
        && t["cart.js"] === "export const cart = ['coupon']"
        && t["header.css"] !== undefined;
    },
  });

  m({
    id: "hotfix-produccion", num: 25, diff: "dificil", title: "Hotfix de producción",
    context: "Producción está cobrando doble en algunos pedidos. Necesitas aislar el arreglo en una rama `hotfix/pagos`, probarlo rápido, fusionarlo a main y publicarlo.",
    briefing: "Un hotfix real no se mezcla con otros cambios: rama corta, commit claro, merge a main y push.",
    deliverable: "Crea `hotfix/pagos`, corrige `payments.js`, haz commit, vuelve a main, fusiona y empuja.",
    objective: "Resuelve el hotfix en una rama y deja main publicado con el arreglo.",
    watch: "El árbol primero abre una rama corta y luego main avanza hasta ese commit por fast-forward.",
    par: 6,
    hints: ["Crea la rama con `git switch -c hotfix/pagos`.", "Edita con `echo \"export const cobrar = total => total\" > payments.js`.", "Haz add + commit, vuelve a `main`, `git merge hotfix/pagos` y `git push`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("payments.js", "export const cobrar = total => total * 2"); e._setup.stage("payments.js");
      e._setup.commit("servicio de pagos");
      e._setup.addRemote("github.com/acme/billing.git");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.HEAD.branch === "main"
        && e.state.remote.branches.main === e.headId()
        && t["payments.js"] === "export const cobrar = total => total";
    },
  });

  m({
    id: "release-branch", num: 26, diff: "dificil", title: "Integra una release branch",
    context: "El equipo de release preparó `release/1.4` directamente en origin. Tu main local aún no conoce esa rama; tráela, revisa el mapa y mézclala.",
    briefing: "Las ramas remotas no aparecen por magia. Fetch actualiza tu vista de origin y luego decides qué integrar.",
    deliverable: "Haz `git fetch`, revisa con `git log` si quieres, y fusiona `origin/release/1.4` en main.",
    objective: "Trae e integra la rama remota `release/1.4`.",
    watch: "Fetch crea la etiqueta `origin/release/1.4`; el merge avanza main hasta la release.",
    par: 2,
    hints: ["Primero `git fetch`.", "La rama remota se fusiona como `git merge origin/release/1.4`.", "`git log` no penaliza estrellas y te ayuda a ver la ruta."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("app.js", "export const version = '1.3'"); e._setup.stage("app.js");
      e._setup.commit("release 1.3");
      e._setup.addRemote("github.com/acme/app.git");
      const base = e.state.remote.branches.main;
      e.state.remote.branches["release/1.4"] = base;
      e._setup.remoteCommit("release 1.4 preparada", { "CHANGELOG.md": "## 1.4\n- mejoras de pago" }, "release/1.4");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.stats.ranFetch
        && e.state.HEAD.branch === "main"
        && t["CHANGELOG.md"] !== undefined;
    },
  });

  m({
    id: "conflicto-pr", num: 27, diff: "dificil", title: "Conflicto antes del review",
    context: "Tu PR cambia el cálculo de precios, pero main también tocó `pricing.js`. Antes de pedir review debes traer main a tu rama y resolver el conflicto.",
    briefing: "Resolver conflictos en tu rama mantiene el PR revisable: integras main, decides el contenido final y cierras el merge.",
    deliverable: "Fusiona `main` en `feature/pricing`, resuelve `pricing.js` y completa el commit de merge.",
    objective: "Resuelve el conflicto entre main y tu rama de PR.",
    watch: "El merge crea un nodo con dos padres; si quedan marcas `<<<<<<<`, la misión no termina.",
    par: 3,
    hints: ["Empieza con `git merge main`.", "Mira el archivo con `cat pricing.js`.", "Puedes resolver con `echo \"export const price = base => base * 0.9\" > pricing.js`, luego `git add pricing.js` y `git commit -m \"resuelve conflicto de precios\"`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("pricing.js", "export const price = base => base"); e._setup.stage("pricing.js");
      e._setup.commit("pricing base");
      e._setup.branch("feature/pricing");
      e._setup.switchTo("feature/pricing");
      e._setup.writeFile("pricing.js", "export const price = base => base * 0.9"); e._setup.stage("pricing.js");
      e._setup.commit("descuento del ticket");
      e._setup.switchTo("main");
      e._setup.writeFile("pricing.js", "export const price = base => Math.round(base)"); e._setup.stage("pricing.js");
      e._setup.commit("redondea precios");
      e._setup.switchTo("feature/pricing");
      return {};
    },
    goal(e) {
      const h = e.state.commits[e.headId()];
      const content = e.state.files["pricing.js"] || "";
      return e.state.HEAD.branch === "feature/pricing"
        && h && h.parents.length === 2
        && e.state.conflicts.length === 0
        && !content.includes("<<<<<<<");
    },
  });

  m({
    id: "secreto-prepush", num: 28, diff: "dificil", title: "Secreto antes del push",
    context: "Preparaste `.env` y `.env.example`, pero solo la plantilla debe llegar al PR. El secreto real debe quedarse local y sin commitear.",
    briefing: "El error más caro en Git suele ser publicar secretos. Antes del commit, revisa staging y saca lo que no pertenece.",
    deliverable: "Saca `.env` del staging, commitea `.env.example` y sube tu rama `feature/env-template`.",
    objective: "Publica solo la plantilla de entorno, no el secreto local.",
    watch: "El panel de staging debe quedarse solo con `.env.example`; origin recibe la rama sin `.env` en el árbol.",
    par: 3,
    hints: ["Usa `git restore --staged .env`.", "Después `git commit -m \"agrega plantilla de entorno\"`.", "Cierra con `git push` desde `feature/env-template`."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("README.md", "# API"); e._setup.stage("README.md");
      e._setup.commit("inicio api");
      e._setup.addRemote("github.com/acme/api.git");
      e._setup.branch("feature/env-template");
      e._setup.switchTo("feature/env-template");
      e._setup.writeFile(".env", "STRIPE_SECRET=sk_live_123");
      e._setup.writeFile(".env.example", "STRIPE_SECRET=");
      e._setup.stage(".env"); e._setup.stage(".env.example");
      return {};
    },
    goal(e) {
      const r = e.state.remote;
      const id = r && r.branches["feature/env-template"];
      const t = id ? r.commits[id].tree : {};
      return id === e.headId()
        && t[".env.example"] !== undefined
        && t[".env"] === undefined
        && e.state.files[".env"] === "STRIPE_SECRET=sk_live_123";
    },
  });

  m({
    id: "rollback-release", num: 29, diff: "dificil", title: "Rollback de release publicada",
    context: "La release 2.7 ya está en origin/main y rompió el login. Como está publicada, no se borra: se revierte con un commit nuevo y se empuja.",
    briefing: "Cuando el commit malo ya salió al remoto, revertir mantiene una historia clara para todo el equipo.",
    deliverable: "Ejecuta `git revert HEAD` y publica el rollback con `git push`.",
    objective: "Deshaz la release publicada sin reescribir historia.",
    watch: "Debe aparecer un commit nuevo `Revert ...` encima del release malo, y origin/main debe moverse a ese rollback.",
    par: 2,
    hints: ["No uses reset en historia publicada.", "`git revert HEAD` crea el commit de rollback.", "Luego `git push` comparte el arreglo."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("login.js", "export const login = () => true"); e._setup.stage("login.js");
      e._setup.commit("login estable");
      e._setup.writeFile("login.js", "export const login = () => false"); e._setup.stage("login.js");
      e._setup.commit("release 2.7");
      e._setup.addRemote("github.com/acme/app.git");
      return {};
    },
    goal(e) {
      const h = e.state.commits[e.headId()];
      const t = e.treeOf(e.headId());
      return h && h.msg.startsWith("Revert")
        && t["login.js"] === "export const login = () => true"
        && e.state.remote.branches.main === e.headId();
    },
  });

  m({
    id: "sprint-cierre", num: 30, diff: "dificil", title: "Cierre de sprint",
    context: "Última tarea del sprint: main recibió un contrato API nuevo y tú debes agregar `reportes.js`. Hay un `debug.log` local que no debe subirse.",
    briefing: "Este flujo junta lo cotidiano: sincronizar, abrir rama, commitear solo lo correcto, fusionar y publicar main limpio.",
    deliverable: "Haz pull, crea `feature/reportes`, agrega `reportes.js`, commitea solo ese archivo, vuelve a main, fusiona y haz push.",
    objective: "Completa un flujo real de principio a fin sin publicar `debug.log`.",
    watch: "El árbol debe integrar el commit remoto y tu rama; al final main y origin/main quedan en el mismo nodo.",
    par: 7,
    hints: ["Arranca con `git pull`.", "Crea rama: `git switch -c feature/reportes`.", "Crea el archivo con `echo \"export const reportes = []\" > reportes.js`.", "Usa `git add reportes.js`, no `git add .`, luego commit, switch main, merge y push."],
    setup(e) {
      e._setup.init(); e._setup.writeFile("index.js", "export const app = true"); e._setup.stage("index.js");
      e._setup.commit("base del sprint");
      e._setup.addRemote("github.com/acme/dashboard.git");
      e._setup.remoteCommit("API: contrato de reportes", { "api-contract.json": "{ \"reportes\": true }" });
      e._setup.writeFile("debug.log", "trace local");
      return {};
    },
    goal(e) {
      const t = e.treeOf(e.headId());
      return e.state.HEAD.branch === "main"
        && e.state.remote.branches.main === e.headId()
        && t["api-contract.json"] !== undefined
        && t["reportes.js"] === "export const reportes = []"
        && t["debug.log"] === undefined;
    },
  });

  window.GIT_MISSIONS = M;
  window.GIT_DIFF_LABEL = { facil: "Fácil", media: "Media", dificil: "Difícil" };
})();
