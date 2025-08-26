// Minimal vanilla log viewer with basic virtualization using IntersectionObserver

// ----------------------------------------------------------------------
// Layout

const ROW_HEIGHT = 32;
const BUFFER = 10;

const listEl = document.getElementById("list");
// Content spacer inside scroller.
const contentEl = document.createElement('div') as HTMLDivElement;
contentEl.style.position = 'relative';
listEl.appendChild(contentEl);

const filterEl = document.getElementById("filter") as HTMLInputElement;
const clearEl = document.getElementById("clear") as HTMLButtonElement;

// ----------------------------------------------------------------------
// State (memoized)

let lastStart = -1;
let lastEnd = -1;
let lastViewportBucket = -1;  // rows, not pixels
let lastContentHeight = '';   // px string

// ----------------------------------------------------------------------
// Log lines

type LogLevel = "INFO" | "WARN" | "ERROR";

interface LogLine {
  id: number;
  ts: string;
  level: LogLevel;
  message: string;
}

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

// ----------------------------------------------------------------------
// Rendering


// 3. Minimal row pooling
type RowRef = {
    root: HTMLDivElement;
    ts: HTMLSpanElement;
    lvl: HTMLSpanElement;
    msg: HTMLSpanElement;
}

let pool: RowRef[] = [];
let poolSize = 0;

// Stop clearing and rebuilding the entire list.
function ensurePool(n: number) {
    if (n <= poolSize) return;
    const frag = document.createDocumentFragment();
    for (let i = poolSize; i < n; i++) {
        const root = document.createElement('div');
        root.className = 'row';

        // Prebuild children so we can update textContent without innerHTML
        const ts = document.createElement('span'); ts.className = 'ts';
        const lvl = document.createElement('span'); lvl.className = 'lvl';
        const dash = document.createTextNode(' - ');
        const msg = document.createElement('span'); msg.className = 'msg';
        root.append(ts, lvl, dash, msg);
        frag.appendChild(root);
        pool.push({root, ts, lvl, msg});
    }
    // Attach new rows once.
    contentEl.appendChild(frag);
    poolSize = n;
}

function render() {
  // Reads
  const total = filteredLogs.length;
  // Scroller height.
  const viewportHeight = listEl.getBoundingClientRect().height;

  // Bucket by row height so small pixel changes don't force work.
  const viewportBucket = Math.ceil(viewportHeight / ROW_HEIGHT);
  const rowsInView = viewportBucket + BUFFER;

  // Clamp startIndex to prevent overshooting.
  startIndex = Math.min(startIndex, Math.max(0, total - rowsInView));
  const endIndex = Math.min(startIndex + rowsInView, total);

  // Set spacer height when needed.
  const neededHeightPx = `${Math.max(total * ROW_HEIGHT, viewportHeight)}px`;
  if (neededHeightPx !== lastContentHeight) {
    contentEl.style.height = neededHeightPx;
    lastContentHeight = neededHeightPx
  }


  // Writes
  listEl.style.height = `${Math.max(total * ROW_HEIGHT, viewportHeight)}px`;
  ensurePool(rowsInView);

  // Grow pool only when bucket increases
  if (viewportBucket !== lastViewportBucket) {
    ensurePool(rowsInView);
    lastViewportBucket = viewportBucket;
  }

  // If the visible slice hasn't changed, skip repositioning rows.
  if (startIndex === lastStart && endIndex === lastEnd) {
    return;
  }

  // Update
  for (let j = 0; j < rowsInView; j++) {
    const i = startIndex + j;
    const ref = pool[j]

    // Park offscreen
    if (i >= endIndex) {
        ref.root.style.transform = 'translateY(-9999px)';
        ref.root.setAttribute('aria-hidden', 'true'); // a11y
        ref.root.style.pointerEvents = 'none'; // remove click interception.
        continue;
    }

    // 3. Update children without touching innerHTML
    const row = filteredLogs[i];
    ref.root.style.transform = `translateY(${i * ROW_HEIGHT}px)`;
    ref.root.removeAttribute('aria-hidden');
    ref.root.style.pointerEvents = '';

    ref.ts.textContent = row.ts;
    ref.lvl.textContent = row.level;

    // Keep level color as a class only (avoid inline style churn);
    ref.lvl.className = `lvl ${row.level}`;
    ref.msg.textContent = row.message;
  }

  // Maintain row position in state.
  lastStart = startIndex;
  lastEnd = endIndex;
}

// 1. Render scheduler: If scroll fires 10x in one frame, only render once.

let renderScheduled = false;

function scheduleRender() {
  if (renderScheduled) return; 
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    render();
  });
}

// Event Callback: Scrolling
function onScroll() {
  // Read
  const scrollTop = listEl.scrollTop;
  startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  scheduleRender(); 
}

// ----------------------------------------------------------------------
// Filtering

// Event Callback
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
  // Batch rendering for better key-repeat behavior.
  scheduleRender();
}

// ----------------------------------------------------------------------
// Bootstrap (main)

function bootstrap() {
  allLogs = generateMockLogs(100_000);
  filteredLogs = allLogs;

  // Resize listeners
  new ResizeObserver(() => scheduleRender()).observe(listEl);

  // Div event listeners
  listEl.addEventListener("scroll", onScroll, { passive: true });
  filterEl.addEventListener("input", () => applyFilter());
  clearEl.addEventListener("click", () => { filterEl.value = ""; applyFilter(); });
  render();
}

bootstrap();
