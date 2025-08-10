import endpoints from "./../utils/endpoints.js";
import httpRequest from "./../utils/httpRequest.js";
import { store } from "./../../store.js";
class AppContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Quản lý dữ liệu chung
    this.state = {
      playlists: [],
      tracks: [],
      artists: [],
      albums: [],
    };
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.fetchData();
  }

  // Lấy dữ liệu từ API về và set vào store
  // Call nhiều API song song
  async fetchData() {
    try {
      const [{ playlists }, { tracks }, { artists }, { albums }] =
        await Promise.all([
          httpRequest.get(endpoints.playlists),
          httpRequest.get(endpoints.tracks),
          httpRequest.get(endpoints.artists),
          httpRequest.get(endpoints.albums),
        ]);

      // Cập nhật lại dữ liệu state
      store.set("playlists", playlists);
      store.set("tracks", tracks);
      store.set("artists", artists);
      store.set("albums", albums);
    } catch (error) {
      console.error("API Error:", error);
    }
  }

  // Hàm cập nhật state và truyền xuống tất cả các con
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.propagateData();
  }

  // Truyền dữ liệu xuống tất cả web component con
  propagateData() {
    const children = this.shadowRoot.querySelector("slot").assignedElements();
    children.forEach((child) => {
      if (typeof child.setData === "function") {
        child.setData(this.state);
      }
    });
  }

  // bindEvents
  bindEvents() {
    // Nghe sự kiện từ component con
    this.addEventListener("update-user", (e) => {
      this.setState({
        users: e.detail,
      });
    });
  }

  // render
  render() {
    this.shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }
}

customElements.define("app-container", AppContainer);
