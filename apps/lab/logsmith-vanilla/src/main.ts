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

function render() {
  const total = filteredLogs.length;
  const viewportHeight = listEl.clientHeight || window.innerHeight - 100;
  const rowsInView = Math.ceil(viewportHeight / ROW_HEIGHT) + BUFFER;
  const endIndex = Math.min(startIndex + rowsInView, total);

  const fragment = document.createDocumentFragment();
  listEl.innerHTML = "";
  listEl.style.height = `${Math.max(total * ROW_HEIGHT, viewportHeight)}px`;

  for (let i = startIndex; i < endIndex; i++) {
    const row = filteredLogs[i];
    const div = document.createElement("div");
    div.className = "row";
    div.style.top = `${i * ROW_HEIGHT}px`;
    div.innerHTML = `<span class="ts">${row.ts}</span><span class="lvl ${row.level}">${row.level}</span> — ${row.message}`;
    fragment.appendChild(div);
  }

  listEl.appendChild(fragment);
}

function onScroll() {
  const scrollTop = listEl.scrollTop;
  startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  render();
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
