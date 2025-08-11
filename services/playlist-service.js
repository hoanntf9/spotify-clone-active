import httpRequest from "../../../utils/httpRequest.js";


async function getPlaylists(path) {
  const res = await httpRequest.get(path);
  return res;
}

async function createPlaylist(path, playlist) {
  const res = await httpRequest.post(path, playlist);
  return res;
}

export {
  getPlaylists,
  createPlaylist,
};