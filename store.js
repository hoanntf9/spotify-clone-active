class Store {
  constructor() {
    this.state = {
      playlists: [],
      tracks: [],
      artists: [],
      albums: []
    };
    this.listeners = {};
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify(key, value);
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) this.listeners[key] = new Set();
    this.listeners[key].add(callback);
    return () => this.listeners[key].delete(callback);
  }

  notify(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(value));
    }
  }
}


export const store = new Store();
