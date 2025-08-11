import endpoints from "./../../../utils/endpoints.js";
import { toast } from "./../../utils/toast.js";
import {
  setItemStorage,
  clearStorage
} from '../../utils/storage.js';

// Service Authentication
import { loginUser, registerUser, logout } from "./../../services/authen-service.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.querySelector("#authModal");
  const modalClose = document.querySelector("#modalClose");
  const signupForm = document.querySelector("#signupForm");
  const loginForm = document.querySelector("#loginForm");
  const showLoginBtn = document.querySelector("#showLogin");
  const showSignupBtn = document.querySelector("#showSignup");
  const authButtons = document.querySelector(".auth-buttons");
  const logoutBtn = document.querySelector("#logoutBtn");
  const userDropdown = document.getElementById("userDropdown");

  if (!signupBtn) return;

  // Function to show / hide `eye password` icon;
  function bindTogglePassword() {
    const eyeToggles = document.querySelectorAll(".input-with-eye .eye-toggle");

    eyeToggles.forEach((toggle) => {
      const icon = toggle.querySelector(".icon-eye");
      const input = toggle.closest(".input-with-eye")?.querySelector("input");

      if (!icon || !input) return;

      const clonedToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(clonedToggle, toggle);

      clonedToggle.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        icon.classList.toggle("fa-eye", !isPassword);
        icon.classList.toggle("fa-eye-slash", isPassword);

        input.focus();
      });
    });
  }

  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    bindTogglePassword();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    bindTogglePassword();
    openModal();
  });

  // Close modal function
  function closeModal() {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  // Tạo chức năng đăng nhập
  loginForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const authButtons = document.querySelector(".auth-buttons");
      const userMenu = document.querySelector(".user-menu");
      const email = document.querySelector("#loginEmail").value;
      const password = document.querySelector("#loginPassword").value;
      const userAvatarImage = document.querySelector("#user-avatar-img");

      const credentials = {
        email,
        password,
      };

      try {
        const { access_token, message, user } = await loginUser(
          endpoints.authLogin,
          credentials
        );

        if (user) {
          toast({
            text: message,
            type: "success",
          });

          setItemStorage("accessToken", access_token);
          setItemStorage("user", user);
          this.reset();
          closeModal();

          authButtons.classList.remove("show");
          userMenu.classList.add("show");

          const srcAvatar = user?.avatar_url ? user?.avatar_url : "./../../default-avatar.jpg";
          userAvatarImage.src = srcAvatar;
        }
      } catch (error) {
        const errorCode = error?.response?.code;
        const errorMessage = error?.response?.message;

        if (errorCode === "INVALID_CREDENTIALS" || errorCode === "VALIDATION_ERROR") {
          toast({
            text: errorMessage,
            type: "error",
          });
        }
      }
    });

  // Tạo chức năng đăng ký
  signupForm
    .querySelector(".auth-form-content")
    .addEventListener("submit", async (e) => {

      e.preventDefault();

      const email = document.querySelector("#signupEmail").value;
      const password = document.querySelector("#signupPassword").value;

      const credentials = {
        email,
        password,
      };

      try {
        const { user, access_token, message } = await registerUser(
          endpoints.authRegister,
          credentials
        );

        if (user) {
          toast({
            text: message,
            type: "success",
          });

          setItemStorage("accessToken", access_token);
          showLoginForm();
          authButtons.classList.add("show");
        }
      } catch (error) {
        const errorCode = error?.response?.code;
        const errorMessage = error?.response?.message;

        if (errorCode === "EMAIL_EXISTS") {
          toast({
            text: errorMessage || "Email Exists",
            type: "error",
          });
        }
      }
    });

  // Tạo chức năng logout
  logoutBtn.addEventListener("click", async function () {
    userDropdown.classList.remove("show");

    const { message } = await logout(endpoints.authLogout);

    if (message) {
      toast({
        text: "Logout successfully",
        type: "success",
      });

      clearStorage();
      window.location.href = "/";
    }
  });
});