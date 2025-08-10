import { store } from "./../../store.js";
import { escapeHtml } from './../../utils/common.js';
// import httpRequest from "./../../utils/httpRequest.js";
// import endpoints from "./../../utils/endpoints.js";

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


    // 1. Lắng nghe khi playlists thay đổi playlists
    this.unsubscribe = store.subscribe("playlists", (playlists) => {
      if (playlists.length) {
        this.renderPlaylist(playlists);
      }
    });
  }
  disconnectedCallback() {
    if (this.unsubscribe) return this.unsubscribe();
  }
  renderPlaylist(playlists) {
    const libraryContent = this.shadowRoot.querySelector(".library-content");

    const html = playlists.map((playlist, index) => {
      return `
        <div class="library-item">
          <div class="item-img">
            <img src=${escapeHtml(playlist.image_url ? playlist.image_url : "./../../placeholder.svg")} alt="Đen" class="item-image" />
            <div class="icon-play">
              <i class="play fa-solid fa-play"></i>
            </div>
          </div>

          <div class="item-info">
            <div class="item-title">${escapeHtml(playlist.name)}</div>
            <div class="item-subtitle">
              <span class="item-subtitle-text">Playlist • ${escapeHtml(playlist.user_username ? playlist.user_username : "Han")}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    libraryContent.innerHTML = html;
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
