// Minimal vanilla log viewer with basic virtualization using IntersectionObserver
type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogLine {
  id: number;
  ts: string;
  level: LogLevel;
  message: string;
}

const ROW_HEIGHT = 32;
const VISIBLE_ROWS = 30;
const BUFFER = 10;

const listEl = document.getElementById("list")!;
const filterEl = document.getElementById("filter") as HTMLInputElement;
const clearEl = document.getElementById("clear") as HTMLButtonElement;

let allLogs: LogLine[] = [];
let filteredLogs: LogLine[] = [];
let startIndex = 0;

function generateMockLogs(n: number): LogLine[] {
  const levels: LogLevel[] = ["INFO", "WARN", "ERROR"];
  const arr: LogLine[] = [];
  for (let i = 0; i < n; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = `${level} event #${i} user:${(i % 37) + 1} payload=${Math.random().toString(36).slice(2)}`;
    arr.push({ id: i, ts: new Date(Date.now() - i * 500).toISOString(), level, message });
  }
  return arr;
}

function applyFilter() {
  const q = filterEl.value.trim().toLowerCase();
  if (!q) {
    filteredLogs = allLogs;
  } else {
    filteredLogs = allLogs.filter(l =>
      l.level.toLowerCase().includes(q) || l.message.toLowerCase().includes(q),
    );
  }
  startIndex = 0;
  render();
}
// ----------------------------------------------------------------------
// 3. Minimal row pooling
//
// Stop clearing and rebuilding the entire list.

let pool: HTMLDivElement[] = [];
let poolSize = 0;

function ensurePool(n: number) {
    if (n <= poolSize) return;
    const frag = document.createDocumentFragment();
    for (let i = poolSize; i < n; i++) {
        const div = document.createElement('div');
        div.className = 'row';

        // Prebuild children so we can update textContent without innerHTML
        const ts = document.createElement('span'); ts.className = 'ts';
        const lvl = document.createElement('span'); lvl.className = 'lvl';
        const dash = document.createTextNode(' - ');
        const msg = document.createElement('span'); msg.className = 'msg';
        div.append(ts, lvl, dash, msg);
        frag.appendChild(div);
        pool.push(div);
    }
    // Attach new rows once.
    listEl.appendChild(frag);
    poolSize = n;
}


function render() {
  // Reads
  const total = filteredLogs.length;
  const viewportHeight = listEl.clientHeight || (window.innerHeight - 100);
  const rowsInView = Math.ceil(viewportHeight / ROW_HEIGHT) + BUFFER;
  const endIndex = Math.min(startIndex + rowsInView, total);

  // Writes
  listEl.style.height = `${Math.max(total * ROW_HEIGHT, viewportHeight)}px`;
  ensurePool(rowsInView);

  for (let j = 0; j < rowsInView; j++) {
    const i = startIndex + j;
    const rowDiv = pool[j]
    if (i >= endIndex) {
        rowDiv.style.transform = 'translateY(-9999px)';
        continue;
    }

    // 3. Update children without touching innerHTML
    const row = filteredLogs[i];
    rowDiv.style.transform = `translateY(${i * ROW_HEIGHT}px)`;
    const ts = rowDiv.querySelector('.ts')!;
    const lvl = rowDiv.querySelector('.lvl')!;
    const msg = rowDiv.querySelector('.msg')!;
    ts.textContent = row.ts;
    lvl.textContent = row.level;
    // 3. keep level color as a class only (avoid inline style churn);
    lvl.className = `lvl ${row.level}`;
    msg.textContent = row.message;
  }
}

// ----------------------------------------------------------------------
// Render scheduler
//
// 1. If scroll fires 10x in one frame, only render once.

let renderScheduled = false;

function scheduleRender() {
  if (renderScheduled) return; 
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    render();
  });
}

function onScroll() {
  // Read
  const scrollTop = listEl.scrollTop;
  startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  scheduleRender(); 
}

function bootstrap() {
  allLogs = generateMockLogs(100_000);
  filteredLogs = allLogs;
  listEl.addEventListener("scroll", onScroll, { passive: true });
  filterEl.addEventListener("input", () => applyFilter());
  clearEl.addEventListener("click", () => { filterEl.value = ""; applyFilter(); });
  render();
}

bootstrap();
