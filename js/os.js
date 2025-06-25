document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".desktop-icon");
  const windowsContainer = document.getElementById("windows-container");
  let zIndexCounter = 2;

  icons.forEach(icon => {
    icon.addEventListener("click", () => {
      const appId = icon.getAttribute("data-app");
      openWindow(appId);
    });
  });

  function openWindow(appId) {
    let existingWindow = document.getElementById(appId);
    if (!existingWindow) {
      const win = document.createElement("div");
      win.className = "window";
      win.id = appId;
      win.innerHTML = `
        <div class="window-header">${appId}</div>
        <div class="window-body">Welcome to ${appId}!</div>
      `;
      windowsContainer.appendChild(win);
      makeDraggable(win);
      focusWindow(win);
    } else {
      existingWindow.style.display = "flex";
      focusWindow(existingWindow);
    }
  }

  function focusWindow(win) {
    win.style.zIndex = zIndexCounter++;
  }

  function makeDraggable(win) {
    const header = win.querySelector(".window-header");
    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }
});