# Beslut: idéintag och prioritet (2026-11-14)

**D37 – "Ny idé: …" blir uppgifter via grenen `claude/idea-<slug>`**
Den interaktiva sessionen stämmer av idén mot VISION.md och HÅRDA STOPP. Vid krock skapas ingenting. Annars
skapas 1–3 uppgifter (och fler som förslag om idén inte ryms), som committas med `[ready]` och pushas.
Sessionen implementerar inget själv. `auto-pr.sh` har ett idé-läge: titeln tas från den första nya
uppgiften, beskrivningen listar uppgifter och ändrade filer, och etiketten blir `automerge` bara om diffen
enbart rör `tasks/` (annars `needs-review`). Idégrenar räknas inte som lås (`claude/task-*` gör det).

**D38 – Fältet `priority: high|normal` (standard `normal`)**
Urvalsordningen är high före normal och därefter lägsta id. Prioritet går aldrig före `depends` eller lås.
"Ny idé (prio): …" ger `high`. Valideringen ligger nu i `validateTasks()` i `tasks-lib.mjs`, så att den kan
enhetstestas (`check-tasks.mjs` anropar den). `next-task.mjs --queue` visar hela kön med placering.

**D39 – Refaktoreringsrytmen för nya id:n**
Landar ett nytt id på en multipel av 5 läggs en refaktoreringsuppgift där (`depends`: de fyra föregående).
Nya idéuppgifter beror inte på spärrar, annars kunde `high` aldrig gå före.
