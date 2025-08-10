function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return String(str).replace(/[&<>"'\/]/g, (char) => map[char]);
}

export {
  escapeHtml
};