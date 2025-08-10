import { store } from "./../../store.js";
import httpRequest from "./../../utils/httpRequest.js";
import endpoints from "./../../utils/endpoints.js";

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  async connectedCallback() {
    const [cssTexts, htmlText] = await Promise.all([
      this.loadMultipleFiles([
        "./../../css/components.css",
        "./../../css/layout.css",
        "./../../css/reset.css",
        "./../../css/responsive.css",
        "./../../css/variables.css",
      ]),
      this.loadFile("./app-sidebar.html"),
    ]);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        ${cssTexts.join("\n")}
      </style>
      ${htmlText}
    `;

    // Lắng nghe store
    let prevPlaylists = null;
    this.unsubscribe = store.subscribe((state) => {
      if (state.playlists !== prevPlaylists) {
        prevPlaylists = state.playlists;
        this.renderPlaylist(state.playlists || []);
      }
    });

    // Lấy dữ liệu ban đầu
    // let playlists = store.get("playlists");
    // if (playlists && playlists.length > 0) {
    //   this.renderPlaylist(playlists);
    // } else {
    //   console.log("Chưa có dữ liệu playlists");
    // }
  }

  disconnectedCallback() {
    if (this.unsubscribe) return this.unsubscribe();
  }

  renderPlaylist(playlists) {
    console.log("playlist render...", playlists);
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

customElements.define("app-sidebar", AppSidebar);
