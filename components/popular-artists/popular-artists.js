import { store } from "../../store.js";
import { escapeHtml } from '../../utils/common.js';

class PopularArtists extends HTMLElement {
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
      this.loadFile("./popular-artists.html"),
    ]);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        ${cssTexts.join("\n")}
      </style>
      ${htmlText}
    `;


    // 1. Lắng nghe khi artists thay đổi artists
    this.unsubscribe = store.subscribe("artists", (artists) => {
      if (artists.length) {
        this.renderPopularArtists(artists);
      }
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) return this.unsubscribe();
  }

  renderPopularArtists(artists) {
    const artistsGrid = this.shadowRoot.querySelector("#artists-grid");

    const html = artists.map((artist, index) => {
      return `
        <div class="artist-card">
          <div class="artist-card-cover">
            <img src=${escapeHtml(artist.image_url ? artist.image_url : "./../../placeholder.svg")}  alt="Đen" />
            <button class="artist-play-btn">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="artist-card-info">
            <h3 class="artist-card-name">${escapeHtml(artist.name)}</h3>
            <p class="artist-card-type">Artist</p>
          </div>
        </div>
      `;
    }).join("");

    artistsGrid.innerHTML = html;
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

customElements.define("popular-artists", PopularArtists);
