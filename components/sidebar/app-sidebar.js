import { store } from "./../../store.js";
import { escapeHtml } from './../../utils/common.js';
import { createPlaylist, getPlaylists } from './../../services/playlist-service.js';
// import httpRequest from "./../../utils/httpRequest.js";
import endpoints from "./../../utils/endpoints.js";
import { toast } from "./../../utils/toast.js";

class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.unsubscribe = null;
  }

  async connectedCallback() {
    const [cssTexts, htmlText] = await Promise.all([
      this.loadMultipleFiles([
        "./../../assets/css/components.css",
        "./../../assets/css/layout.css",
        "./../../assets/css/reset.css",
        "./../../assets/css/responsive.css",
        "./../../assets/css/variables.css",
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

    // DOM events
    const createMenuBtn = this.shadowRoot.querySelector("#create-btn");
    const createMenu = this.shadowRoot.querySelector("#create-menu");
    const createPlaylistBtn = this.shadowRoot.querySelector("#create-item-playlist");


    // Khi click chuột vào nút `create` playlist
    createMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      createMenu.classList.toggle("show");
    });

    // Khi click ra ngoài vùng modal `create` playlist thì đóng modal
    // Lắng nghe click ngoài shadowRoot
    window.addEventListener("click", function (e) {
      // Lấy đường đi của sự kiện xuyên cả shadow DOM
      const path = e.composedPath();

      if (!path.includes(createMenu) && !path.includes(createMenuBtn)) {
        createMenu.classList.remove("show");
      }
    });

    // Đóng khi bấm `Escape` thì đóng modal
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        createMenu.classList.remove("show");
      }
    });

    // Khi click vào `Create a playlist with song...`
    createPlaylistBtn.addEventListener("click", async function () {
      const playlistItem = {
        name: "My Playlist",
        description: "My favorite playlist",
        is_public: true,
        image_url: ""
      };

      try {
        const { message } = await createPlaylist(endpoints.playlists, playlistItem);

        toast({
          type: "success",
          text: message
        });

        // Sau khi tạo thành công lấy lại danh sách playlists 
        const { playlists } = await getPlaylists(endpoints.playlists);

        // Cập nhật lại store, AppSidebar sẽ render lại tự động
        store.set("playlists", playlists);

        // Đóng menu create
        createMenu.classList.remove("show");
      } catch (error) {
        console.log(error);
        toast({
          type: "error",
          message: "Playlist create fail"
        });
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
