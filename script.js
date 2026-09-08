const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Intro sequence
const loader = document.querySelector(".loader");
const loaderCount = document.querySelector(".loader__count");
let loaded = 0;
const loadTimer = window.setInterval(() => {
  loaded = Math.min(100, loaded + Math.ceil(Math.random() * 15));
  loaderCount.textContent = String(loaded).padStart(2, "0");
  if (loaded >= 100) {
    window.clearInterval(loadTimer);
    window.setTimeout(() => loader.classList.add("done"), reduceMotion ? 0 : 250);
  }
}, reduceMotion ? 10 : 45);

// Mobile navigation
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const header = document.querySelector(".site-header");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenu.classList.remove("open");
  header.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (isOpen) return closeMenu();
  menuButton.setAttribute("aria-expanded", "true");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenu.classList.add("open");
  header.classList.add("menu-active");
  document.body.classList.add("menu-open");
});
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

// Scroll reveals
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Work filters
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    document.querySelectorAll(".project").forEach((project) => {
      project.classList.toggle("is-hidden", filter !== "all" && !project.dataset.category.includes(filter));
    });
  });
});

// Reel dialog
const reel = document.querySelector("[data-reel]");
const openReel = () => {
  reel.showModal();
  document.body.classList.add("reel-open");
};
const closeReel = () => {
  reel.close();
  document.body.classList.remove("reel-open");
};
document.querySelector("[data-reel-open]").addEventListener("click", openReel);
document.querySelector("[data-reel-close]").addEventListener("click", closeReel);
reel.addEventListener("click", (event) => event.target === reel && closeReel());
reel.addEventListener("close", () => document.body.classList.remove("reel-open"));

// Newsletter demo interaction
document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  document.querySelector(".form-message").textContent = "You're on the list. Welcome to the signal.";
  input.value = "";
});

// Custom project cursor
const cursor = document.querySelector(".cursor");
window.addEventListener("pointermove", (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});
document.querySelectorAll(".cursor-target").forEach((target) => {
  target.addEventListener("pointerenter", () => cursor.classList.add("visible"));
  target.addEventListener("pointerleave", () => cursor.classList.remove("visible"));
});

// Subtle magnetic buttons
document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  button.addEventListener("pointerleave", () => (button.style.transform = ""));
});

// Procedural canvas artwork. Every project has a distinct, continuously evolving scene.
const canvases = [...document.querySelectorAll("canvas[data-scene]")];
const scenes = [];

function setupCanvas(canvas) {
  const context = canvas.getContext("2d");
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    return { width: rect.width, height: rect.height };
  };
  let size = resize();
  const observer = new ResizeObserver(() => (size = resize()));
  observer.observe(canvas);
  return { canvas, context, get size() { return size; }, type: canvas.dataset.scene, visible: true };
}

canvases.forEach((canvas) => scenes.push(setupCanvas(canvas)));
const canvasObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const scene = scenes.find((item) => item.canvas === entry.target);
    if (scene) scene.visible = entry.isIntersecting;
  });
}, { rootMargin: "150px" });
scenes.forEach((scene) => canvasObserver.observe(scene.canvas));

function clear(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function glow(ctx, x, y, radius, inner, outer = "transparent") {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHero(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  const x = width * 0.54;
  const y = height * 0.48;
  const radius = Math.min(width, height) * 0.31;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 0.00008);
  for (let ring = 0; ring < 34; ring += 1) {
    ctx.beginPath();
    const phase = ring * 0.34 + time * 0.0005;
    for (let point = 0; point <= 100; point += 1) {
      const angle = (point / 100) * Math.PI * 2;
      const wave = Math.sin(angle * 3 + phase) * radius * 0.08;
      const rx = radius * (0.64 + ring / 100) + wave;
      const ry = radius * (0.34 + ring / 180);
      const px = Math.cos(angle) * rx;
      const py = Math.sin(angle) * ry;
      point ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.strokeStyle = ring % 9 === 0 ? "rgba(0,222,239,.52)" : `rgba(16,20,21,${0.055 + ring * 0.002})`;
    ctx.lineWidth = ring % 9 === 0 ? 1.2 : 0.75;
    ctx.stroke();
  }
  ctx.restore();
}

function drawChrome(ctx, width, height, time) {
  clear(ctx, width, height, "#07090a");
  glow(ctx, width * 0.62, height * 0.44, Math.max(width, height) * 0.55, "rgba(0,222,239,.16)");
  const cx = width * 0.52;
  const cy = height * 0.5;
  const r = Math.min(width, height) * 0.32;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.00005);
  for (let i = 0; i < 46; i += 1) {
    const a = (i / 46) * Math.PI * 2;
    const variance = 1 + Math.sin(i * 2.1 + time * 0.0008) * 0.12;
    const x = Math.cos(a) * r * variance;
    const y = Math.sin(a) * r * 0.72 * variance;
    ctx.beginPath();
    ctx.moveTo(x * 0.25, y * 0.25);
    ctx.quadraticCurveTo(x * 1.38, y * 0.22, x, y);
    ctx.strokeStyle = i % 7 === 0 ? "rgba(0,222,239,.85)" : `rgba(225,235,237,${0.12 + (i % 5) * 0.055})`;
    ctx.lineWidth = i % 7 === 0 ? 2 : 1;
    ctx.stroke();
  }
  ctx.restore();
  glow(ctx, cx, cy, r * 0.35, "rgba(255,255,255,.15)");
}

function drawFabric(ctx, width, height, time) {
  clear(ctx, width, height, "#d7dbd8");
  const rows = 42;
  const cols = 34;
  for (let row = 0; row < rows; row += 1) {
    ctx.beginPath();
    for (let col = 0; col <= cols; col += 1) {
      const x = (col / cols) * width;
      const baseY = (row / (rows - 1)) * height;
      const dist = Math.abs(x - width * 0.48) / width;
      const fold = Math.sin(col * 0.6 + row * 0.17 + time * 0.0007) * (18 + dist * 52);
      const y = baseY + fold * Math.sin((row / rows) * Math.PI);
      col ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = row % 8 === 0 ? "rgba(255,70,61,.72)" : `rgba(17,23,24,${0.08 + row * 0.002})`;
    ctx.lineWidth = row % 8 === 0 ? 1.3 : 0.65;
    ctx.stroke();
  }
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255,255,255,.5)");
  gradient.addColorStop(0.5, "transparent");
  gradient.addColorStop(1, "rgba(0,0,0,.16)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawRings(ctx, width, height, time) {
  clear(ctx, width, height, "#090c0e");
  const cx = width * 0.5;
  const cy = height * 0.46;
  glow(ctx, cx, cy, Math.min(width, height) * 0.65, "rgba(18,76,83,.5)");
  for (let i = 0; i < 22; i += 1) {
    const pulse = (Math.sin(time * 0.001 + i * 0.7) + 1) * 0.5;
    const radius = 24 + i * Math.min(width, height) * 0.026 + pulse * 10;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.42, radius * 0.52, -0.23, 0, Math.PI * 2);
    ctx.strokeStyle = i % 6 === 0 ? `rgba(0,222,239,${0.4 + pulse * 0.4})` : `rgba(230,247,249,${0.08 + pulse * 0.13})`;
    ctx.lineWidth = i % 6 === 0 ? 1.5 : 0.7;
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.beginPath();
  ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
}

function drawTerrain(ctx, width, height, time) {
  clear(ctx, width, height, "#191d1d");
  const horizon = height * 0.34;
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
  gradient.addColorStop(0, "#050809");
  gradient.addColorStop(1, "#16383b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, horizon);
  glow(ctx, width * 0.24, horizon * 0.65, Math.min(width, height) * 0.24, "rgba(0,222,239,.32)");
  for (let line = 0; line < 44; line += 1) {
    const z = line / 43;
    const y = horizon + Math.pow(z, 1.55) * (height - horizon);
    ctx.beginPath();
    for (let x = 0; x <= width; x += 8) {
      const peak = Math.sin(x * 0.018 + line * 0.31 + time * 0.00028) * 19 * (1 - z);
      const ridge = Math.sin(x * 0.006 - line * 0.16) * 47 * (1 - z);
      x ? ctx.lineTo(x, y + peak + ridge) : ctx.moveTo(x, y + peak + ridge);
    }
    ctx.strokeStyle = line % 9 === 0 ? "rgba(0,222,239,.42)" : "rgba(210,226,225,.13)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
}

function drawType(ctx, width, height, time) {
  clear(ctx, width, height, "#e9e9e3");
  ctx.save();
  ctx.translate(width * 0.66, height * 0.34);
  ctx.rotate(time * 0.00008);
  for (let i = 0; i < 18; i += 1) {
    const size = 35 + i * Math.min(width, height) * 0.025;
    ctx.strokeStyle = i === 11 ? "rgba(255,70,61,.95)" : `rgba(12,14,15,${0.08 + i * 0.018})`;
    ctx.lineWidth = i === 11 ? 2 : 1;
    ctx.strokeRect(-size / 2, -size / 2, size, size);
  }
  ctx.restore();
}

function drawPortal(ctx, width, height, time) {
  clear(ctx, width, height, "#08090a");
  const cx = width * 0.5;
  const cy = height * 0.5;
  for (let i = 26; i > 0; i -= 1) {
    const depth = i / 26;
    const size = depth * Math.min(width, height) * 0.77;
    const offset = Math.sin(time * 0.00045 + i * 0.22) * 12 * (1 - depth);
    ctx.save();
    ctx.translate(cx + offset, cy);
    ctx.rotate(i * 0.03 + time * 0.00003);
    ctx.strokeStyle = i % 5 === 0 ? "rgba(0,222,239,.5)" : `rgba(240,244,245,${0.03 + (1 - depth) * 0.2})`;
    ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.8;
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }
  glow(ctx, cx, cy, 85, "rgba(255,70,61,.28)");
}

function drawCta(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.33;
  glow(ctx, cx, cy, radius * 1.25, "rgba(0,222,239,.15)");
  for (let i = 0; i < 62; i += 1) {
    const a = (i / 62) * Math.PI * 2;
    const wobble = Math.sin(i * 1.8 + time * 0.0005) * radius * 0.13;
    const r = radius + wobble;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * radius * 0.35, cy + Math.sin(a) * radius * 0.35);
    ctx.lineTo(x, y);
    ctx.strokeStyle = i % 11 === 0 ? "rgba(0,222,239,.6)" : "rgba(255,255,255,.09)";
    ctx.stroke();
  }
}

function drawReel(ctx, width, height, time) {
  clear(ctx, width, height, "#080a0b");
  const blocks = 18;
  for (let i = 0; i < blocks; i += 1) {
    const x = ((i * 193 + time * 0.035) % (width + 400)) - 200;
    const y = (i * 127) % height;
    const size = 80 + (i % 5) * 55;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.00015 * (i % 2 ? 1 : -1));
    ctx.strokeStyle = i % 4 === 0 ? "rgba(0,222,239,.32)" : "rgba(255,255,255,.07)";
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }
  glow(ctx, width * 0.72, height * 0.42, Math.min(width, height) * 0.45, "rgba(255,70,61,.12)");
}

const renderers = { hero: drawHero, chrome: drawChrome, fabric: drawFabric, rings: drawRings, terrain: drawTerrain, type: drawType, portal: drawPortal, cta: drawCta, reel: drawReel };
function animate(time) {
  scenes.forEach((scene) => {
    if (!scene.visible) return;
    const { width, height } = scene.size;
    renderers[scene.type]?.(scene.context, width, height, reduceMotion ? 1000 : time);
  });
  if (!reduceMotion) window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);
