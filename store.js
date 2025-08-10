class Store {
  constructor() {
    this.state = {}; // Lưu dữ liệu
    this.listeners = new Set();
  }

  // Lấy dữ liệu
  get(key) {
    return this.state[key];
  }

  // Set dữ liệu và thông báo
  set(key, value) {
    this.state[key] = value;
    this.notify();
  }

  // Lắng nghe thay đổi
  subscribe(callback) {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback); // Trả hàm huỷ lắng nghe
  }

  // Gọi tất cả listener
  notify() {
    this.listeners.forEach((listener) => {
      listener(this.state);
    });
  }
}

export const store = new Store();
