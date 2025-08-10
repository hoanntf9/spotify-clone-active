import { store } from "./../../store.js";
import { escapeHtml } from './../../utils/common.js';

class TodayBiggestHits extends HTMLElement {
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
      this.loadFile("./today-biggest-hits.html"),
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
        this.renderTodayBiggestHits(playlists);
      }
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) return this.unsubscribe();
  }

  renderTodayBiggestHits(playlists) {
    const hitsGrid = this.shadowRoot.querySelector(".hits-grid");
    console.log("🚀 ~ TodayBiggestHits ~ renderTodayBiggestHits ~ hitsGrid:", hitsGrid);

    const html = playlists.map((playlist, index) => {
      return `
        <div class="hit-card">
          <div class="hit-card-cover">
            <img src=${escapeHtml(playlist.image_url ? playlist.image_url : "./../../placeholder.svg")} alt=${playlist?.image_url} />
            <button class="hit-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="hit-card-info">
            <h3 class="hit-card-title">Flowers</h3>
            <p class="hit-card-artist">Miley Cyrus</p>
          </div>
        </div>
      `;
    }).join("");

    hitsGrid.innerHTML = html;
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

customElements.define("today-biggest-hits", TodayBiggestHits);
