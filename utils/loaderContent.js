function sendRequest(method, url, callback, jsPath = null) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status >= 200 && this.status < 400) {
      if (typeof callback === "function") {
        callback(this.responseText);

        // Gọi JS sau khi innerHTML xong;
        // if (jsPath) {
        //   const script = document.createElement("script");
        //   script.src = jsPath;
        //   script.defer = true;
        //   document.body.appendChild(script);
        // }
      }
    }
  };

  xhr.open(method, url, true);
  xhr.send();
}

const headerContainer = document.querySelector("#header-container");

const pathHeader = "./../components/header.html";
const pathHeaderJS = "./../components/header.js";

sendRequest(
  "GET",
  pathHeader,
  function (responseText) {
    headerContainer.innerHTML = responseText;

    // Load lại script để gắn event cho nút
    const script = document.createElement("script");
    script.src = pathHeaderJS;
    script.type = "module"; // nếu authen.js dùng module
    document.body.appendChild(script);
  },
  pathHeaderJS
);
