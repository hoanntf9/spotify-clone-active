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

    const recentBtn = this.shadowRoot.querySelector("#recentsBtn");
    const toolbarMenu = this.shadowRoot.querySelector(".toolbar-menu");


    const layoutMenuItems = this.shadowRoot.querySelectorAll(".layout-menu-list-item");
    const iconRecentBtn = this.shadowRoot.querySelector("#icon-recent-btn");

    const libraryContent = this.shadowRoot.querySelector(".library-content");
    const libraryItems = this.shadowRoot.querySelectorAll(".library-item");

    // Khi click chuột vào nút `create` playlist
    createMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      createMenu.classList.toggle("show");
      toolbarMenu.classList.remove("show");
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

    // Xử lý phần recent khi click vào recent thì hiển thị modal recent
    recentBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toolbarMenu.classList.toggle("show");

    });

    // Khi click ra ngoài modal recent thì đóng modal
    window.addEventListener("click", function (e) {
      // Lấy đường đi của sự kiện xuyên cả shadow DOM
      const path = e.composedPath();

      if (!path.includes(recentBtn) && !path.includes(toolbarMenu)) {
        toolbarMenu.classList.remove("show");
      }

    });

    // Khi nhấn Escape thì modal rencent bị đóng
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        toolbarMenu.classList.remove("show");
      }
    });

    // Xử lý khi click vào từng layout thì layout sẽ thay đổi
    layoutMenuItems.forEach((layoutItem, index) => {
      layoutItem.addEventListener("click", function () {


        // Khi click vào item layout nào thì active item đó lên
        layoutMenuItems.forEach(item => item.classList.remove("active"));
        layoutItem.classList.add("active");

        // Icon layout gần phần recent cũng thay đổi theo
        const icon = layoutItem.querySelector("i");
        if (icon && iconRecentBtn) {
          const classLayoutIcon = icon.className;
          iconRecentBtn.innerHTML = `<i class="${classLayoutIcon}"></i>`;
        }

        // Khi click vào từng layout thì bind layout sang giao diện

        const positions = {
          menuItem1: 1, // List View
          menuItem2: 2, // Default View(Remove list- view);
          menuItem3: 3, // Grid View
          menuItem4: 4, // Compact Grid View
        };


        function resetLibraryView() {
          libraryContent.classList.remove("grid-view", "compact-grid-view");

          libraryItems.forEach(libraryItem => {
            libraryItem.classList.remove("list-view", "grid-view", "compact-grid-view");
          });
        }

        const positionMenuItem = index + 1;
        resetLibraryView();

        if (positions.menuItem1 === positionMenuItem) {
          libraryItems.forEach(libraryItem => {
            libraryItem.classList.add("list-view");
          });
          return;
        }

        if (positions.menuItem2 === positionMenuItem) {
          return;
        }

        if (positions.menuItem3 === positionMenuItem) {
          libraryContent.classList.add("grid-view");

          libraryItems.forEach(libraryItem => {
            libraryItem.classList.add("grid-view");
          });
          return;
        }

        if (positions.menuItem4 === positionMenuItem) {
          libraryContent.classList.add("compact-grid-view");
          libraryItems.forEach(libraryItem => {
            libraryItem.classList.add("compact-grid-view");
          });
          return;
        }
      });
    });

  }
  disconnectedCallback() {
    if (this.unsubscribe) return this.unsubscribe();
  }
  renderPlaylist(playlists) {
    const libraryElement = this.shadowRoot.querySelector("#library-content");

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

    libraryElement.innerHTML = html;
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
