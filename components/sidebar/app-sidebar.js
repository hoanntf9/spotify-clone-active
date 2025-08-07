class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    // Import nhiều file CSS + 1 file HTML
    const [cssTexts, htmlText] = await Promise.all([
      this.loadMultipleFiles([
        "./components.css",
        "./layout.css",
        "./reset.css",
        "./responsive.css",
        "./variables.css",
      ]),
      this.loadFile("./app-sidebar.html"),
    ]);


    // Thêm link Font Awesome vào Shadow DOM
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.setAttribute("rel", "stylesheet");
    fontAwesomeLink.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");

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
    const contents = await Promise.all(paths.map(p => this.loadFile(p)));
    return contents;
  }
}

customElements.define("app-sidebar", AppSidebar);
