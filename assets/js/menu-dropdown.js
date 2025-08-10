import {
  getItemStorage,
} from "../../utils/storage.js";

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");

  if (!userAvatar) return;

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });
});

// Xử lý khi F5 `reload` lại trang thì check hiển thị avatar trên header.
document.addEventListener("DOMContentLoaded", async function () {
  const authButtons = document.querySelector(".auth-buttons");
  const userMenu = document.querySelector(".user-menu");
  const userAvatarImage = document.querySelector("#user-avatar-img");

  const accessToken = getItemStorage("accessToken");
  const user = getItemStorage("user");

  if (accessToken) {
    userMenu.classList.add("show");
    userAvatarImage.src = user?.avatar_url ? user?.avatar_url : "./../../default-avatar.jpg";
    return;
  }

  if (authButtons) {
    authButtons.classList.add("show");
  }

});