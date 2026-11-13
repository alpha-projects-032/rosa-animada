const svg = document.getElementById("roseSvg");
const roseContainer = document.getElementById("roseContainer");
const petalsOuter = document.getElementById("petalsOuter");
const petalsMiddle = document.getElementById("petalsMiddle");
const petalsInner = document.getElementById("petalsInner");
const sparklesGroup = document.getElementById("sparkles");
const message = document.getElementById("message");
const ambientLight = document.getElementById("ambientLight");
const leafLeft = document.querySelector(".leaf-left");
const leafRight = document.querySelector(".leaf-right");
const sepalGroup = document.getElementById("sepalGroup");
const budCore = document.getElementById("budCore");

const SVG_NS = "http://www.w3.org/2000/svg";
const petals = [];
const sparkles = [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function petalPath(width, height, pinch = 0.35) {
  const w = width;
  const h = height;
  const mid = w * pinch;

  return `
    M 0 0
    C ${mid} ${-h * 0.12}, ${w * 0.94} ${-h * 0.40}, ${w * 0.38} ${-h}
    C ${w * 0.16} ${-h * 1.10}, ${-w * 0.16} ${-h * 1.10}, ${-w * 0.38} ${-h}
    C ${-w * 0.94} ${-h * 0.40}, ${-mid} ${-h * 0.12}, 0 0
    Z
  `;
}

function createPetal({
  group,
  width,
  height,
  angle,
  radiusClosed,
  radiusOpen,
  openClosed,
  openTarget,
  liftClosed,
  liftOpen,
  scaleClosed,
  scaleOpen,
  fill,
  opacity = 1,
  wobble = 0
}) {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", petalPath(width, height));
  path.setAttribute("fill", fill);
  path.setAttribute("opacity", opacity);
  path.setAttribute("filter", "url(#softGlow)");
  group.appendChild(path);

  petals.push({
    node: path,
    angle,
    radiusClosed,
    radiusOpen,
    openClosed,
    openTarget,
    liftClosed,
    liftOpen,
    scaleClosed,
    scaleOpen,
    wobble
  });
}

function buildPetals() {
  // Exteriores
  for (let i = 0; i < 8; i++) {
    createPetal({
      group: petalsOuter,
      width: 64,
      height: 112,
      angle: i * 45,
      radiusClosed: 4,
      radiusOpen: 54,
      openClosed: 8,
      openTarget: 48,
      liftClosed: -8,
      liftOpen: -22,
      scaleClosed: 0.25,
      scaleOpen: 1.02,
      fill: "url(#petalGradientOuter)",
      opacity: 0.95,
      wobble: 1.8
    });
  }

  // Medios
  for (let i = 0; i < 6; i++) {
    createPetal({
      group: petalsMiddle,
      width: 56,
      height: 96,
      angle: i * 60 + 20,
      radiusClosed: 2,
      radiusOpen: 34,
      openClosed: 18,
      openTarget: 28,
      liftClosed: -3,
      liftOpen: -14,
      scaleClosed: 0.22,
      scaleOpen: 0.9,
      fill: "url(#petalGradientInner)",
      opacity: 0.98,
      wobble: 1.1
    });
  }

  // Interiores
  for (let i = 0; i < 5; i++) {
    createPetal({
      group: petalsInner,
      width: 42,
      height: 70,
      angle: i * 72 + 12,
      radiusClosed: 0,
      radiusOpen: 16,
      openClosed: 14,
      openTarget: 12,
      liftClosed: 8,
      liftOpen: 0,
      scaleClosed: 0.18,
      scaleOpen: 0.72,
      fill: "url(#petalGradientInner)",
      opacity: 1,
      wobble: 0.7
    });
  }
}

function createSparkles() {
  const positions = [
    { x: 170, y: 180, r: 2.6 },
    { x: 320, y: 160, r: 2.2 },
    { x: 132, y: 280, r: 1.8 },
    { x: 360, y: 260, r: 2.4 },
    { x: 230, y: 135, r: 1.6 },
    { x: 280, y: 315, r: 1.7 },
    { x: 110, y: 220, r: 1.4 },
    { x: 388, y: 212, r: 1.9 }
  ];

  positions.forEach((pos, index) => {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", pos.r);
    circle.setAttribute("fill", "rgba(255, 214, 224, 0.95)");
    circle.setAttribute("filter", "url(#softGlow)");
    circle.setAttribute("class", "sparkle");
    sparklesGroup.appendChild(circle);

    sparkles.push({
      node: circle,
      x: pos.x,
      y: pos.y,
      baseR: pos.r,
      phase: index * 0.9
    });
  });
}

function updatePetals(bloom, time) {
  petals.forEach((petal) => {
    const t = bloom;
    const radius =
      petal.radiusClosed + (petal.radiusOpen - petal.radiusClosed) * t;

    const openAngle =
      petal.openClosed + (petal.openTarget - petal.openClosed) * t;

    const lift =
      petal.liftClosed + (petal.liftOpen - petal.liftClosed) * t;

    const scale =
      petal.scaleClosed + (petal.scaleOpen - petal.scaleClosed) * t;

    const wobble =
      Math.sin(time * 0.0012 + petal.angle * 0.06) * petal.wobble * bloom;

    const transform = `
      rotate(${petal.angle + wobble})
      translate(0 ${-radius + lift})
      rotate(${openAngle})
      scale(${scale})
    `;

    petal.node.setAttribute("transform", transform);
  });
}

function updateBudCore(bloom) {
  const scaleX = 0.62 + bloom * 0.52;
  const scaleY = 0.72 + bloom * 0.40;
  const lift = 6 - bloom * 14;
  budCore.setAttribute(
    "transform",
    `translate(0 ${lift}) scale(${scaleX} ${scaleY})`
  );
}

function updateSepals(bloom, time) {
  const sway = Math.sin(time * 0.0014) * 1.2 * bloom;
  const lift = 20 + (1 - bloom) * 5;
  const spread = 1 + bloom * 0.08;
  sepalGroup.setAttribute(
    "transform",
    `translate(0, ${lift}) rotate(${sway}) scale(${spread})`
  );
}

function updateLeaves(time, bloom) {
  const leftSway = Math.sin(time * 0.0015) * (3 + bloom * 1.4);
  const rightSway = Math.cos(time * 0.00135) * (3 + bloom * 1.4);

  leafLeft.setAttribute(
    "transform",
    `translate(-10,145) rotate(${-25 + leftSway}) scale(${0.92 + bloom * 0.10})`
  );

  leafRight.setAttribute(
    "transform",
    `translate(8,95) rotate(${20 + rightSway}) scale(${0.92 + bloom * 0.10})`
  );
}

function updateSparkles(time, bloom) {
  sparkles.forEach((sparkle) => {
    const pulse = 0.65 + Math.sin(time * 0.0026 + sparkle.phase) * 0.35;
    const drift = Math.sin(time * 0.0012 + sparkle.phase) * 3.5;
    const opacity = clamp((0.18 + bloom * 0.72) * pulse, 0, 1);

    sparkle.node.setAttribute("cy", sparkle.y + drift);
    sparkle.node.setAttribute("opacity", opacity.toFixed(2));
    sparkle.node.setAttribute("r", (sparkle.baseR * (0.8 + pulse * 0.35)).toFixed(2));
  });
}

function updateAmbientLight(time, bloom) {
  const ellipse = ambientLight.querySelector("ellipse");
  const scale = 0.92 + bloom * 0.18 + Math.sin(time * 0.0015) * 0.01;
  const opacity = 0.18 + bloom * 0.20;
  ellipse.setAttribute("transform", `translate(250 250) scale(${scale}) translate(-250 -250)`);
  ellipse.setAttribute("opacity", opacity.toFixed(2));
}

function animate() {
  const start = performance.now();
  const bloomDuration = prefersReducedMotion ? 50 : 5400;
  const loopRotationAmplitude = prefersReducedMotion ? 0 : 6;

  function frame(now) {
    const elapsed = now - start;
    const linearBloom = clamp(elapsed / bloomDuration, 0, 1);
    const bloom = linearBloom < 0.86
      ? easeInOutCubic(linearBloom)
      : easeOutBack(linearBloom);

    updatePetals(clamp(bloom, 0, 1), now);
    updateBudCore(clamp(bloom, 0, 1));
    updateSepals(clamp(bloom, 0, 1), now);
    updateLeaves(now, clamp(bloom, 0, 1));
    updateSparkles(now, clamp(bloom, 0, 1));
    updateAmbientLight(now, clamp(bloom, 0, 1));

    const rotation =
      Math.sin(now * 0.00075) * loopRotationAmplitude;

    const floating =
      Math.sin(now * 0.0013) * (prefersReducedMotion ? 0 : 4);

    roseContainer.setAttribute(
      "transform",
      `translate(250 405) rotate(${rotation}) translate(0 ${floating})`
    );

    if (elapsed > bloomDuration * 0.72) {
      message.classList.add("visible");
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function init() {
  buildPetals();
  createSparkles();
  animate();
}

init();