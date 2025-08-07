import httpRequest from "../../../utils/httpRequest.js";

async function loginUser(path, credentials) {
  const res = await httpRequest.post(path, credentials);
  return res;
}

async function registerUser(path, credentials) {
  const res = await httpRequest.post(path, credentials);
  return res;
}

async function logout(path) {
  const res = await httpRequest.post(path);
  return res;
}

export {
  loginUser,
  registerUser,
  logout
};