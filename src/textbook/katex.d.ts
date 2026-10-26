declare module "katex" {
  const katex: { render(tex: string, el: HTMLElement, opts?: Record<string, unknown>): void };
  export default katex;
}
