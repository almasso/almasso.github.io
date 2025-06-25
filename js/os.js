import Arkanoid from "./programs/arkanoid.js";

/* LOADING OS */
document.addEventListener("DOMContentLoaded", () => {
  
  /* TIME */
  setInterval(updateTime, 1000);
  updateTime();

  loadPrograms();

});

/* TIME FUNCTIONS */
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('time-text').textContent = `${hours}:${minutes}`;
}

/* PROGRAMS */
function loadPrograms() {
  const ark = new Arkanoid();
}