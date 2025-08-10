import { store } from "./../../store.js";
console.log(store);
class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const [cssTexts, htmlText] = await Promise.all([
      this.loadMultipleFiles([]),
      this.loadFile("./app-footer.html"),
    ]);

    this.shadowRoot.innerHTML = `
      <style>
        ${cssTexts.join("\n")}
      </style>
      ${htmlText}
    `;
  }

  async loadFile(path) {
    const url = new URL(path, import.meta.url).href;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Không thể tải file: ${path}`);
    }
    return response.text();
  }

  async loadMultipleFiles(paths) {
    const contents = await Promise.all(paths.map((p) => this.loadFile(p)));
    return contents;
  }
}

customElements.define("app-footer", AppFooter);
