// ============================================================
// git-engine.js — Motor de Git simulado para la guía interactiva
// Plain JS. Expone window.GitEngine
// ============================================================
(function () {
  let hashCounter = 0;
  function newHash() {
    hashCounter++;
    const base = (hashCounter * 2654435761 % 0xfffffff).toString(16);
    return ("0000000" + base).slice(-7);
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function createEngine() {
    const S = {
      initialized: false,
      cwd: "proyecto",
      files: {},          // working dir: name -> content
      staging: {},        // name -> content
      commits: {},        // id -> {id,msg,parents,tree,t,author}
      branches: {},       // name -> commitId
      HEAD: null,         // {branch: name}
      remote: null,       // {url, branches:{}, commits:{}}
      remoteTracking: {}, // 'origin/main' -> commitId (local knowledge)
      conflicts: [],      // filenames
      mergingFrom: null,  // {id, label} pending merge commit
      t: 0,
      stats: { ranStatus: false, ranLog: false, ranFetch: false, counted: 0, total: 0, msgs: [] },
    };

    // ---------- helpers ----------
    function headId() {
      if (!S.HEAD) return null;
      return S.branches[S.HEAD.branch] || null;
    }
    function treeOf(id) { return id && S.commits[id] ? S.commits[id].tree : {}; }
    function headTree() { return treeOf(headId()); }

    function ancestors(id) {
      const seen = new Set(); const stack = [id];
      while (stack.length) {
        const c = stack.pop();
        if (!c || seen.has(c)) continue;
        seen.add(c);
        const cm = S.commits[c];
        if (cm) cm.parents.forEach(p => stack.push(p));
      }
      return seen;
    }
    function isAncestor(a, b) { // a es ancestro de b (o igual)
      if (!a) return true;
      if (!b) return false;
      return ancestors(b).has(a);
    }
    function mergeBase(a, b) {
      const ancA = ancestors(a);
      // BFS desde b, primer commit en ancA
      const q = [b]; const seen = new Set();
      while (q.length) {
        const c = q.shift();
        if (!c || seen.has(c)) continue;
        seen.add(c);
        if (ancA.has(c)) return c;
        const cm = S.commits[c];
        if (cm) q.push(...cm.parents);
      }
      return null;
    }

    function makeCommit(msg, tree, parents) {
      const id = newHash();
      S.t++;
      S.commits[id] = { id, msg, parents, tree: clone(tree), t: S.t };
      return id;
    }

    function status() {
      const head = headTree();
      const staged = [], modified = [], untracked = [], conflicted = [...S.conflicts];
      for (const f in S.staging) {
        if (S.conflicts.includes(f)) continue;
        if (head[f] === undefined || head[f] !== S.staging[f]) staged.push(f);
      }
      for (const f in S.files) {
        if (S.conflicts.includes(f)) continue;
        const base = S.staging[f] !== undefined ? S.staging[f] : head[f];
        if (base === undefined) untracked.push(f);
        else if (S.files[f] !== base) modified.push(f);
      }
      return { staged, modified, untracked, conflicted };
    }

    function isClean() {
      const st = status();
      return st.staged.length === 0 && st.modified.length === 0 && st.untracked.length === 0 && st.conflicted.length === 0;
    }

    function updateWorkdirTo(tree) {
      const head = headTree();
      const newFiles = {};
      // conservar archivos sin seguimiento
      for (const f in S.files) {
        if (head[f] === undefined && S.staging[f] === undefined) newFiles[f] = S.files[f];
      }
      for (const f in tree) newFiles[f] = tree[f];
      S.files = newFiles;
    }

    // copia commits alcanzables desde id de un almacén a otro
    function copyReachable(fromStore, toStore, id) {
      const stack = [id];
      while (stack.length) {
        const c = stack.pop();
        if (!c || toStore[c]) continue;
        if (fromStore[c]) {
          toStore[c] = clone(fromStore[c]);
          stack.push(...fromStore[c].parents);
        }
      }
    }

    // ---------- salida ----------
    function L(text, type) { return { text, type: type || "info" }; }
    const NOT_REPO = [L("fatal: no es un repositorio git (ejecuta primero: git init)", "err")];

    // ---------- comandos git ----------
    function gitInit() {
      if (S.initialized) return [L("El repositorio ya estaba inicializado.", "warn")];
      S.initialized = true;
      S.branches = { main: null };
      S.HEAD = { branch: "main" };
      return [L("Initialized empty Git repository in ~/" + S.cwd + "/.git/", "ok"),
              L("✓ Se creó la carpeta oculta .git — tu proyecto ahora tiene memoria.", "sys")];
    }

    function gitStatus() {
      if (!S.initialized) return NOT_REPO;
      S.stats.ranStatus = true;
      const st = status();
      const out = [L("On branch " + (S.HEAD ? S.HEAD.branch : "?"), "info")];
      if (S.mergingFrom) out.push(L("You have unmerged paths. (arregla los conflictos y haz commit)", "warn"));
      if (st.conflicted.length) {
        out.push(L("Unmerged paths:  (en conflicto)", "err"));
        st.conflicted.forEach(f => out.push(L("        both modified:   " + f, "err")));
      }
      if (st.staged.length) {
        out.push(L("Changes to be committed:  (en staging, listos para commit)", "ok"));
        st.staged.forEach(f => out.push(L("        modified/new:   " + f, "ok")));
      }
      if (st.modified.length) {
        out.push(L("Changes not staged for commit:  (modificados, sin preparar)", "warn"));
        st.modified.forEach(f => out.push(L("        modified:   " + f, "warn")));
      }
      if (st.untracked.length) {
        out.push(L("Untracked files:  (Git aún no los vigila)", "err"));
        st.untracked.forEach(f => out.push(L("        " + f, "err")));
      }
      if (!st.staged.length && !st.modified.length && !st.untracked.length && !st.conflicted.length)
        out.push(L("nothing to commit, working tree clean ✨", "ok"));
      return out;
    }

    function gitAdd(args) {
      if (!S.initialized) return NOT_REPO;
      if (!args.length) return [L("Indica qué añadir: git add <archivo>  ó  git add .", "err")];
      const st = status();
      let targets = [];
      if (args[0] === ".") {
        targets = [...st.untracked, ...st.modified, ...st.conflicted];
        if (!targets.length) return [L("No hay nada nuevo que añadir.", "warn")];
      } else {
        for (const a of args) {
          if (S.files[a] === undefined) return [L("fatal: la ruta '" + a + "' no existe", "err")];
          targets.push(a);
        }
      }
      const out = [];
      for (const f of targets) {
        S.staging[f] = S.files[f];
        if (S.conflicts.includes(f)) {
          S.conflicts = S.conflicts.filter(x => x !== f);
          out.push(L("✓ Conflicto en " + f + " marcado como resuelto.", "sys"));
        }
      }
      out.push(L("✓ " + targets.join(", ") + " → staging (listo para la foto).", "sys"));
      return out;
    }

    function gitCommit(args) {
      if (!S.initialized) return NOT_REPO;
      const mIdx = args.indexOf("-m");
      if (mIdx === -1 || !args[mIdx + 1])
        return [L("Te falta el mensaje:  git commit -m \"describe tu cambio\"", "err")];
      const msg = args[mIdx + 1];
      if (S.conflicts.length)
        return [L("error: aún hay conflictos sin resolver. Edita el archivo y usa git add.", "err")];
      const st = status();
      if (!st.staged.length && !S.mergingFrom)
        return [L("nada en staging para commitear (usa primero git add)", "err")];
      const tree = Object.assign({}, headTree(), S.staging);
      const parents = headId() ? [headId()] : [];
      if (S.mergingFrom) parents.push(S.mergingFrom.id);
      const id = makeCommit(msg, tree, parents);
      S.branches[S.HEAD.branch] = id;
      S.staging = {};
      const out = [L("[" + S.HEAD.branch + " " + id + "] " + msg, "ok")];
      if (S.mergingFrom) {
        out.push(L("✓ Merge completado: uniste '" + S.mergingFrom.label + "' con tu rama.", "sys"));
        S.mergingFrom = null;
      } else {
        out.push(L("✓ Foto guardada en el historial. ¡Nada se pierde ya!", "sys"));
      }
      return out;
    }

    function gitLog() {
      if (!S.initialized) return NOT_REPO;
      S.stats.ranLog = true;
      let id = headId();
      if (!id) return [L("fatal: aún no hay commits en esta rama", "err")];
      const out = [];
      const seen = new Set();
      // recorrido por t descendente desde HEAD
      const reach = [...ancestors(id)].map(c => S.commits[c]).filter(Boolean).sort((a, b) => b.t - a.t);
      for (const c of reach.slice(0, 8)) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        const refs = [];
        for (const b in S.branches) if (S.branches[b] === c.id) refs.push(b === S.HEAD.branch ? "HEAD -> " + b : b);
        for (const rb in S.remoteTracking) if (S.remoteTracking[rb] === c.id) refs.push("origin/" + rb);
        out.push(L(c.id + (refs.length ? " (" + refs.join(", ") + ")" : "") + " " + c.msg, "accent"));
      }
      return out;
    }

    function gitBranch(args) {
      if (!S.initialized) return NOT_REPO;
      if (args[0] === "-d" || args[0] === "-D") {
        const name = args[1];
        if (!name) return [L("¿Qué rama borro? git branch -d <rama>", "err")];
        if (S.branches[name] === undefined) return [L("error: la rama '" + name + "' no existe", "err")];
        if (name === S.HEAD.branch) return [L("error: no puedes borrar la rama en la que estás parado", "err")];
        if (args[0] === "-d" && S.branches[name] && !isAncestor(S.branches[name], headId()))
          return [L("error: la rama '" + name + "' no está fusionada en la tuya.", "err"),
                  L("hint: usa git branch -D " + name + " para forzar (sus commits quedarán huérfanos).", "warn")];
        delete S.branches[name];
        return [L("Deleted branch " + name, "ok"),
                L("✓ La etiqueta desapareció del árbol. Un commit sin rama que lo alcance queda huérfano.", "sys")];
      }
      if (!args.length) {
        return Object.keys(S.branches).map(b =>
          L((b === S.HEAD.branch ? "* " : "  ") + b, b === S.HEAD.branch ? "ok" : "info"));
      }
      const name = args[0];
      if (S.branches[name] !== undefined) return [L("fatal: la rama '" + name + "' ya existe", "err")];
      S.branches[name] = headId();
      return [L("✓ Rama '" + name + "' creada (apunta al mismo commit que estás). Cámbiate con git switch " + name, "sys")];
    }

    function gitSwitch(args) {
      if (!S.initialized) return NOT_REPO;
      let create = false;
      if (args[0] === "-c" || args[0] === "-b") { create = true; args = args.slice(1); }
      const name = args[0];
      if (!name) return [L("¿A qué rama? git switch <rama>  ó  git switch -c <nueva>", "err")];
      if (create) {
        if (S.branches[name] !== undefined) return [L("fatal: la rama '" + name + "' ya existe", "err")];
        S.branches[name] = headId();
      }
      if (S.branches[name] === undefined) return [L("fatal: la rama '" + name + "' no existe. ¿Querías -c para crearla?", "err")];
      S.HEAD = { branch: name };
      updateWorkdirTo(treeOf(S.branches[name]));
      return [L("Switched to " + (create ? "a new branch" : "branch") + " '" + name + "'", "ok"),
              L("✓ Tu carpeta de trabajo ahora muestra la versión de '" + name + "'.", "sys")];
    }

    function doMerge(targetId, label) {
      const myId = headId();
      if (!targetId) return [L("fatal: no hay nada que fusionar ahí", "err")];
      if (isAncestor(targetId, myId)) return [L("Already up to date. (ya tienes esos cambios)", "info")];
      if (isAncestor(myId, targetId) || !myId) {
        // fast-forward
        S.branches[S.HEAD.branch] = targetId;
        updateWorkdirTo(treeOf(targetId));
        return [L("Updating " + (myId || "(vacío)") + ".." + targetId, "info"),
                L("Fast-forward ✓ — tu rama solo avanzó, sin commit nuevo.", "ok")];
      }
      // merge de tres vías
      const base = treeOf(mergeBase(myId, targetId));
      const mine = treeOf(myId);
      const theirs = treeOf(targetId);
      const all = new Set([...Object.keys(mine), ...Object.keys(theirs)]);
      const merged = {}; const conflicts = [];
      for (const f of all) {
        const b = base[f], m = mine[f], t = theirs[f];
        if (m === t) { if (m !== undefined) merged[f] = m; }
        else if (m === b || m === undefined) { merged[f] = t; }
        else if (t === b || t === undefined) { merged[f] = m; }
        else { conflicts.push(f); merged[f] = "<<<<<<< HEAD\n" + m + "\n=======\n" + t + "\n>>>>>>> " + label; }
      }
      if (conflicts.length) {
        S.conflicts = conflicts;
        S.mergingFrom = { id: targetId, label };
        updateWorkdirTo(merged);
        return [
          L("Auto-merging " + conflicts.join(", "), "info"),
          L("CONFLICT (content): Merge conflict in " + conflicts.join(", "), "err"),
          L("Automatic merge failed; arregla los conflictos y haz commit.", "err"),
          L("✗ Ambas ramas cambiaron lo mismo. Mira el archivo con cat, decide el contenido final con echo, luego git add y git commit.", "sys"),
        ];
      }
      const id = makeCommit("Merge " + label + " into " + S.HEAD.branch, merged, [myId, targetId]);
      S.branches[S.HEAD.branch] = id;
      updateWorkdirTo(merged);
      return [L("Merge made by the 'ort' strategy.", "info"),
              L("✓ Commit de merge " + id + " creado: las dos historias se unieron.", "ok")];
    }

    function gitMerge(args) {
      if (!S.initialized) return NOT_REPO;
      const name = args[0];
      if (!name) return [L("¿Qué rama fusiono? git merge <rama>", "err")];
      if (name.startsWith("origin/")) {
        const rb = name.slice(7);
        if (S.remoteTracking[rb] === undefined) return [L("fatal: no conozco '" + name + "'. ¿Hiciste git fetch?", "err")];
        return doMerge(S.remoteTracking[rb], name);
      }
      if (S.branches[name] === undefined) return [L("fatal: la rama '" + name + "' no existe", "err")];
      if (name === S.HEAD.branch) return [L("No puedes fusionar una rama consigo misma.", "err")];
      return doMerge(S.branches[name], name);
    }

    function gitPush() {
      if (!S.initialized) return NOT_REPO;
      if (!S.remote) return [L("fatal: no hay remoto configurado ('origin' no existe en esta misión)", "err")];
      const b = S.HEAD.branch;
      const localId = headId();
      if (!localId) return [L("error: no tienes commits que subir", "err")];
      const remoteId = S.remote.branches[b];
      if (remoteId === localId) return [L("Everything up-to-date (el remoto ya tiene todo)", "info")];
      if (remoteId !== undefined && remoteId !== null) {
        // ¿el remoto tiene algo que yo no tengo?
        if (!S.commits[remoteId] || !isAncestor(remoteId, localId)) {
          return [
            L("! [rejected]        " + b + " -> " + b + " (fetch first)", "err"),
            L("error: failed to push some refs to 'origin'", "err"),
            L("hint: el remoto tiene commits que tú no tienes.", "warn"),
            L("hint: haz primero  git pull  para traerlos y luego vuelve a hacer push.", "warn"),
          ];
        }
      }
      copyReachable(S.commits, S.remote.commits, localId);
      const isNew = remoteId === undefined;
      S.remote.branches[b] = localId;
      S.remoteTracking[b] = localId;
      const out = [L("To " + S.remote.url, "info")];
      out.push(isNew
        ? L(" * [new branch]      " + b + " -> " + b, "ok")
        : L("   " + (remoteId || "(vacío)") + ".." + localId + "  " + b + " -> " + b, "ok"));
      out.push(L("✓ Tus commits ya están en el remoto. Tu equipo puede verlos.", "sys"));
      return out;
    }

    function gitFetch() {
      if (!S.initialized) return NOT_REPO;
      if (!S.remote) return [L("fatal: no hay remoto configurado", "err")];
      S.stats.ranFetch = true;
      const out = [L("From " + S.remote.url, "info")];
      let news = false;
      for (const b in S.remote.branches) {
        const rid = S.remote.branches[b];
        if (rid && S.remoteTracking[b] !== rid) {
          copyReachable(S.remote.commits, S.commits, rid);
          out.push(L("   " + (S.remoteTracking[b] || "(nuevo)") + ".." + rid + "  " + b + "     -> origin/" + b, "ok"));
          S.remoteTracking[b] = rid;
          news = true;
        }
      }
      if (!news) out.push(L("(ya estabas al día)", "info"));
      else out.push(L("✓ Descargaste los commits nuevos, pero tu rama NO cambió. Únelos con git merge origin/" + S.HEAD.branch + " (o usa git pull).", "sys"));
      return out;
    }

    function gitPull() {
      if (!S.initialized) return NOT_REPO;
      if (!S.remote) return [L("fatal: no hay remoto configurado", "err")];
      const b = S.HEAD.branch;
      const rid = S.remote.branches[b];
      if (rid === undefined) return [L("fatal: el remoto no tiene la rama '" + b + "'", "err")];
      copyReachable(S.remote.commits, S.commits, rid);
      S.remoteTracking[b] = rid;
      const out = [L("From " + S.remote.url + "  (fetch + merge)", "info")];
      return out.concat(doMerge(rid, "origin/" + b));
    }

    function gitClone(args) {
      if (S.initialized) return [L("Ya estás dentro de un repositorio.", "err")];
      const url = args[0];
      if (!url) return [L("¿Qué clono? git clone <url>", "err")];
      if (!S.remote || S.remote.url !== url)
        return [L("fatal: no se encontró el repositorio '" + url + "' (usa la URL de la misión)", "err")];
      S.initialized = true;
      const out = [L("Cloning into '" + url.split("/").pop().replace(".git", "") + "'...", "info")];
      S.branches = {}; S.commits = {};
      for (const b in S.remote.branches) {
        const rid = S.remote.branches[b];
        copyReachable(S.remote.commits, S.commits, rid);
        if (b === "main") S.branches.main = rid;
        S.remoteTracking[b] = rid;
      }
      S.HEAD = { branch: "main" };
      updateWorkdirTo(treeOf(S.branches.main));
      out.push(L("✓ Copia completa descargada: historial + archivos + conexión a 'origin'.", "sys"));
      return out;
    }

    function gitReset(args) {
      if (!S.initialized) return NOT_REPO;
      const mode = args.find(a => a === "--hard" || a === "--soft") || "--mixed";
      const ref = args.find(a => a.startsWith("HEAD~"));
      if (!ref) return [L("Uso en esta guía:  git reset --hard HEAD~1  (ó --soft)", "err")];
      const n = parseInt(ref.slice(5) || "1", 10);
      let id = headId();
      for (let i = 0; i < n; i++) {
        if (!id || !S.commits[id] || !S.commits[id].parents.length)
          return [L("fatal: no hay suficientes commits hacia atrás", "err")];
        id = S.commits[id].parents[0];
      }
      const out = [];
      S.branches[S.HEAD.branch] = id;
      if (mode === "--hard") {
        S.staging = {};
        updateWorkdirTo(treeOf(id));
        out.push(L("HEAD is now at " + id + " " + S.commits[id].msg, "ok"));
        out.push(L("✓ La rama retrocedió y tus archivos también. El commit borrado desapareció del historial.", "sys"));
      } else {
        out.push(L("HEAD is now at " + id + " (" + mode + ")", "ok"));
        out.push(L("✓ La rama retrocedió, pero tus archivos quedaron como estaban (los cambios siguen ahí).", "sys"));
      }
      return out;
    }

    function gitRestore(args) {
      if (!S.initialized) return NOT_REPO;
      if (args[0] === "--staged") {
        const f = args[1];
        if (!f || S.staging[f] === undefined) return [L("Ese archivo no está en staging.", "err")];
        delete S.staging[f];
        return [L("✓ " + f + " salió del staging. Sigue modificado en tu carpeta, pero ya no entrará en el commit.", "sys")];
      }
      const f = args[0];
      if (!f) return [L("Uso: git restore <archivo>  ó  git restore --staged <archivo>", "err")];
      const base = S.staging[f] !== undefined ? S.staging[f] : headTree()[f];
      if (base === undefined) return [L("error: '" + f + "' no tiene versión guardada que restaurar", "err")];
      S.files[f] = base;
      return [L("✓ " + f + " volvió a su última versión guardada. Cambios locales descartados.", "sys")];
    }

    function gitRevert(args) {
      if (!S.initialized) return NOT_REPO;
      if (args[0] !== "HEAD") return [L("Uso en esta guía:  git revert HEAD  (deshace el último commit con uno nuevo)", "err")];
      const id = headId();
      const c = S.commits[id];
      if (!c || !c.parents.length) return [L("fatal: no hay commit que revertir", "err")];
      const parentTree = treeOf(c.parents[0]);
      const tree = clone(headTree());
      for (const f in c.tree) {
        if (parentTree[f] === undefined) delete tree[f];
        else if (parentTree[f] !== c.tree[f]) tree[f] = parentTree[f];
      }
      const nid = makeCommit("Revert \"" + c.msg + "\"", tree, [id]);
      S.branches[S.HEAD.branch] = nid;
      updateWorkdirTo(tree);
      return [L("[" + S.HEAD.branch + " " + nid + "] Revert \"" + c.msg + "\"", "ok"),
              L("✓ Se creó un commit NUEVO que deshace el anterior. La historia no se reescribe: ideal para cambios ya publicados.", "sys")];
    }

    // ---------- shell ----------
    function tokenize(line) {
      const tokens = []; let cur = ""; let q = null;
      for (const ch of line) {
        if (q) { if (ch === q) { q = null; } else cur += ch; }
        else if (ch === '"' || ch === "'") q = ch;
        else if (ch === " ") { if (cur) { tokens.push(cur); cur = ""; } }
        else cur += ch;
      }
      if (cur) tokens.push(cur);
      return tokens;
    }

    function run(line) {
      line = line.trim();
      if (!line) return [];
      S.stats.total++;
      const tk = tokenize(line);
      const cmd = tk[0];

      if (cmd === "ls") {
        const names = Object.keys(S.files);
        return names.length ? [L(names.join("   "), "info")] : [L("(carpeta vacía)", "info")];
      }
      if (cmd === "cat") {
        const f = tk[1];
        if (!f || S.files[f] === undefined) return [L("cat: " + (f || "?") + ": no existe", "err")];
        return S.files[f].split("\n").map(l => L(l, "info"));
      }
      if (cmd === "touch") {
        const f = tk[1];
        if (!f) return [L("touch: indica un nombre de archivo", "err")];
        if (S.files[f] === undefined) S.files[f] = "";
        return [L("✓ Archivo " + f + " creado en tu carpeta de trabajo.", "sys")];
      }
      if (cmd === "echo") {
        const gt = tk.indexOf(">");
        const gtgt = tk.indexOf(">>");
        const idx = gt !== -1 ? gt : gtgt;
        if (idx === -1) return [L(tk.slice(1).join(" "), "info")];
        const content = tk.slice(1, idx).join(" ");
        const f = tk[idx + 1];
        if (!f) return [L("echo: ¿a qué archivo? echo \"texto\" > archivo.txt", "err")];
        if (gtgt !== -1 && S.files[f] !== undefined) S.files[f] += "\n" + content;
        else S.files[f] = content;
        if (S.conflicts.includes(f))
          return [L("✓ Escribiste el contenido final de " + f + ". Ahora márcalo resuelto: git add " + f, "sys")];
        return [L("✓ " + f + " " + (gtgt !== -1 ? "ampliado" : "guardado") + " en tu carpeta de trabajo.", "sys")];
      }

      if (cmd !== "git") {
        return [L("comando no reconocido: " + cmd + "  (prueba: git, ls, cat, echo, touch, help)", "err")];
      }

      const sub = tk[1];
      const args = tk.slice(2);
      const counted = !["status", "log", "branch", "help", undefined].includes(sub) || (sub === "branch" && args.length > 0);
      if (counted) S.stats.counted++;

      switch (sub) {
        case "init": return gitInit();
        case "status": return gitStatus();
        case "add": return gitAdd(args);
        case "commit": return gitCommit(args);
        case "log": return gitLog();
        case "branch": return gitBranch(args);
        case "switch": return gitSwitch(args);
        case "checkout": return gitSwitch(args); // alias simplificado
        case "merge": return gitMerge(args);
        case "push": return gitPush();
        case "pull": return gitPull();
        case "fetch": return gitFetch();
        case "clone": return gitClone(args);
        case "reset": return gitReset(args);
        case "restore": return gitRestore(args);
        case "revert": return gitRevert(args);
        default:
          return [L("git: '" + (sub || "") + "' no está soportado en este simulador.", "err"),
                  L("Soportados: init, status, add, commit, log, branch, switch, merge, push, pull, fetch, clone, reset, restore, revert", "info")];
      }
    }

    // ---------- API ----------
    return {
      get state() { return S; },
      run,
      status,
      isClean,
      headId,
      treeOf,
      isAncestor,
      // util para misiones (montaje de escenarios)
      _setup: {
        init() { S.initialized = true; S.branches = { main: null }; S.HEAD = { branch: "main" }; },
        writeFile(name, content) { S.files[name] = content; },
        stage(name) { S.staging[name] = S.files[name]; },
        commit(msg, onBranch) {
          const b = onBranch || S.HEAD.branch;
          const parent = S.branches[b];
          const tree = Object.assign({}, treeOf(parent), S.staging);
          const id = makeCommit(msg, tree, parent ? [parent] : []);
          S.branches[b] = id;
          S.staging = {};
          if (b === S.HEAD.branch) updateWorkdirTo(tree);
          return id;
        },
        branch(name, at) { S.branches[name] = at !== undefined ? at : S.branches[S.HEAD.branch]; },
        switchTo(name) { S.HEAD = { branch: name }; updateWorkdirTo(treeOf(S.branches[name])); },
        addRemote(url) {
          S.remote = { url, branches: {}, commits: {} };
          for (const b in S.branches) {
            const id = S.branches[b];
            if (id) { copyReachable(S.commits, S.remote.commits, id); S.remote.branches[b] = id; S.remoteTracking[b] = id; }
          }
        },
        // commit hecho "por un compañero" directamente en el remoto
        remoteCommit(msg, fileChanges, branch) {
          const b = branch || "main";
          const parent = S.remote.branches[b] || null;
          const parentTree = parent && S.remote.commits[parent] ? S.remote.commits[parent].tree : {};
          const tree = Object.assign({}, clone(parentTree), fileChanges);
          const id = newHash();
          S.t++;
          S.remote.commits[id] = { id, msg, parents: parent ? [parent] : [], tree, t: S.t };
          S.remote.branches[b] = id;
          return id;
        },
        remoteOnly(url) { S.remote = { url, branches: {}, commits: {} }; },
      },
    };
  }

  window.GitEngine = { create: createEngine };
})();
