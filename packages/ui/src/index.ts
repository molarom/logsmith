export function Hello({ name }: { name: string }) {
  const el = document.createElement("div");
  el.textContent = `Hello ${name}!`;
  return el;
}
