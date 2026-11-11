/**
 * 《概率论与数理统计》3D 交互式教学仿真平台
 * Three.js 科学可视化渲染与交互相机引擎 (Scene & Scientific 3D Plotting Engine)
 */
window.ProbLab = window.ProbLab || {};

(function () {
  'use strict';

  /**
   * Right-handed Math-to-World Coordinate Isomorphism:
   * Math (mx, my, mz) -> Three.js World (x = mx, y = mz, z = -my)
   * Notice: (1,0,0) x (0,0,-1) = (0,1,0), preserving right-handedness and surface normals!
   */
  function m2w(mx, my, mz) {
    return new THREE.Vector3(mx, mz, -my);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Scientific Colormaps returning [r, g, b] in [0..1]
  function colormap(t, scheme = 'cyber') {
    const u = clamp(t, 0, 1);
    const stops = {
      cyber: [
        [0.08, 0.22, 0.58],
        [0.04, 0.62, 0.88],
        [0.12, 0.88, 0.72],
        [0.96, 0.82, 0.22],
        [0.98, 0.38, 0.32]
      ],
      plasma: [
        [0.15, 0.08, 0.52],
        [0.52, 0.12, 0.68],
        [0.85, 0.28, 0.48],
        [0.98, 0.62, 0.22],
        [0.99, 0.94, 0.38]
      ],
      emerald: [
        [0.06, 0.28, 0.38],
        [0.08, 0.58, 0.62],
        [0.16, 0.84, 0.64],
        [0.62, 0.95, 0.48]
      ],
      warmRed: [
        [0.35, 0.08, 0.18],
        [0.78, 0.15, 0.25],
        [0.98, 0.42, 0.22],
        [1.00, 0.78, 0.32]
      ]
    };
    const arr = stops[scheme] || stops.cyber;
    const scaled = u * (arr.length - 1);
    const idx = Math.min(arr.length - 2, Math.floor(scaled));
    const f = scaled - idx;
    return [
      lerp(arr[idx][0], arr[idx + 1][0], f),
      lerp(arr[idx][1], arr[idx + 1][1], f),
      lerp(arr[idx][2], arr[idx + 1][2], f)
    ];
  }

  function createEngine(canvas) {
    const scene = new THREE.Scene();
    let theme = 'dark';
    scene.background = new THREE.Color(0x070c18);
    scene.fog = new THREE.FogExp2(0x070c18, 0.014);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(12, 22, 16);
    scene.add(dirLight);

    const rimLight1 = new THREE.PointLight(0x38bdf8, 0.55, 65);
    rimLight1.position.set(-14, 12, -12);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xf59e0b, 0.35, 65);
    rimLight2.position.set(14, 10, 12);
    scene.add(rimLight2);

    // Persistent stage group & dynamic case group
    const stageGroup = new THREE.Group();
    const caseGroup = new THREE.Group();
    scene.add(stageGroup);
    scene.add(caseGroup);

    // Subtle ground grid
    let baseGrid = null;
    function rebuildStageGrid() {
      if (baseGrid) {
        stageGroup.remove(baseGrid);
        if (baseGrid.geometry) baseGrid.geometry.dispose();
        if (baseGrid.material) baseGrid.material.dispose();
      }
      const c1 = theme === 'dark' ? 0x1e3a5f : 0x94a3b8;
      const c2 = theme === 'dark' ? 0x0f1f38 : 0xcbd5e1;
      baseGrid = new THREE.GridHelper(24, 24, c1, c2);
      baseGrid.position.y = -0.01;
      if (Array.isArray(baseGrid.material)) {
        baseGrid.material.forEach(m => { m.transparent = true; m.opacity = theme === 'dark' ? 0.45 : 0.55; });
      } else {
        baseGrid.material.transparent = true;
        baseGrid.material.opacity = theme === 'dark' ? 0.45 : 0.55;
      }
      stageGroup.add(baseGrid);
    }
    rebuildStageGrid();

    // Custom Smooth Spherical Orbit Controller
    const orbit = {
      target: new THREE.Vector3(0, 1.6, 0),
      goalTarget: new THREE.Vector3(0, 1.6, 0),
      radius: 13.5,
      goalRadius: 13.5,
      theta: 0.62,       // horizontal azimuth angle (rad)
      goalTheta: 0.62,
      phi: 1.08,         // polar angle from +Y up (rad)
      goalPhi: 1.08,
      defaultPreset: { radius: 13.5, theta: 0.62, phi: 1.08, target: [0, 1.6, 0] },
      autoRotate: false,
      paused: false,
      isDragging: false,
      dragMode: 'orbit', // 'orbit' | 'pan'
      lastX: 0,
      lastY: 0,
      pinchDist: 0
    };

    function applyCameraFromOrbit() {
      orbit.phi = clamp(orbit.phi, 0.08, Math.PI * 0.495);
      orbit.goalPhi = clamp(orbit.goalPhi, 0.08, Math.PI * 0.495);
      orbit.radius = clamp(orbit.radius, 2.5, 65);
      orbit.goalRadius = clamp(orbit.goalRadius, 2.5, 65);

      const sinPhi = Math.sin(orbit.phi);
      const x = orbit.target.x + orbit.radius * sinPhi * Math.sin(orbit.theta);
      const y = orbit.target.y + orbit.radius * Math.cos(orbit.phi);
      const z = orbit.target.z + orbit.radius * sinPhi * Math.cos(orbit.theta);
      camera.position.set(x, y, z);
      camera.lookAt(orbit.target);
    }

    function setDefaultView({ radius = 13.5, theta = 0.62, phi = 1.08, target = [0, 1.6, 0] } = {}, immediate = false) {
      orbit.defaultPreset = { radius, theta, phi, target: target.slice() };
      orbit.goalRadius = radius;
      orbit.goalTheta = theta;
      orbit.goalPhi = phi;
      orbit.goalTarget.set(target[0], target[1], target[2]);
      if (immediate) {
        orbit.radius = radius;
        orbit.theta = theta;
        orbit.phi = phi;
        orbit.target.copy(orbit.goalTarget);
        applyCameraFromOrbit();
      }
    }

    function setCameraPreset(mode) {
      const def = orbit.defaultPreset;
      orbit.goalTarget.set(def.target[0], def.target[1], def.target[2]);
      if (mode === 'iso') {
        orbit.goalRadius = def.radius;
        orbit.goalTheta = def.theta;
        orbit.goalPhi = def.phi;
      } else if (mode === 'top') {
        orbit.goalRadius = def.radius * 1.05;
        orbit.goalTheta = 0;
        orbit.goalPhi = 0.09;
      } else if (mode === 'front') {
        orbit.goalRadius = def.radius * 0.98;
        orbit.goalTheta = 0;
        orbit.goalPhi = Math.PI * 0.44;
      } else if (mode === 'side') {
        orbit.goalRadius = def.radius * 0.98;
        orbit.goalTheta = Math.PI * 0.5;
        orbit.goalPhi = Math.PI * 0.44;
      }
    }

    // Pointer & Touch Events on Canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousedown', (e) => {
      orbit.isDragging = true;
      orbit.dragMode = (e.button === 2 || e.shiftKey) ? 'pan' : 'orbit';
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!orbit.isDragging) return;
      const dx = e.clientX - orbit.lastX;
      const dy = e.clientY - orbit.lastY;
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;

      if (orbit.dragMode === 'orbit') {
        orbit.goalTheta -= dx * 0.0065;
        orbit.goalPhi = clamp(orbit.goalPhi - dy * 0.0065, 0.08, Math.PI * 0.495);
      } else {
        const panScale = orbit.radius * 0.0014;
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        camera.matrix.extractBasis(right, up, new THREE.Vector3());
        orbit.goalTarget.addScaledVector(right, -dx * panScale);
        orbit.goalTarget.addScaledVector(up, dy * panScale);
      }
    });

    window.addEventListener('mouseup', () => {
      orbit.isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.09 : 0.91;
      orbit.goalRadius = clamp(orbit.goalRadius * factor, 2.5, 65);
    }, { passive: false });

    // Touch controls
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        orbit.isDragging = true;
        orbit.dragMode = 'orbit';
        orbit.lastX = e.touches[0].clientX;
        orbit.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        orbit.isDragging = true;
        orbit.dragMode = 'pinch';
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        orbit.pinchDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!orbit.isDragging) return;
      if (e.touches.length === 1 && orbit.dragMode === 'orbit') {
        const dx = e.touches[0].clientX - orbit.lastX;
        const dy = e.touches[0].clientY - orbit.lastY;
        orbit.lastX = e.touches[0].clientX;
        orbit.lastY = e.touches[0].clientY;
        orbit.goalTheta -= dx * 0.007;
        orbit.goalPhi = clamp(orbit.goalPhi - dy * 0.007, 0.08, Math.PI * 0.495);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (orbit.pinchDist > 10) {
          orbit.goalRadius = clamp(orbit.goalRadius * (orbit.pinchDist / dist), 2.5, 65);
        }
        orbit.pinchDist = dist;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      orbit.isDragging = false;
    });

    // Resize handling
    function resize() {
      const parent = canvas.parentElement || document.body;
      const w = Math.max(300, parent.clientWidth);
      const h = Math.max(260, parent.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', resize);
    resize();
    applyCameraFromOrbit();

    // Theme switching
    function setTheme(nextTheme) {
      theme = nextTheme === 'light' ? 'light' : 'dark';
      const bg = theme === 'dark' ? 0x070c18 : 0xeef3fb;
      scene.background.setHex(bg);
      scene.fog.color.setHex(bg);
      hemiLight.intensity = theme === 'dark' ? 0.85 : 1.05;
      dirLight.intensity = theme === 'dark' ? 0.9 : 0.95;
      rebuildStageGrid();
    }

    function getTheme() {
      return theme;
    }

    // Active animation hook per case
    let caseTick = null;
    function setOnTick(fn) {
      caseTick = typeof fn === 'function' ? fn : null;
    }

    // Dispose helper to prevent WebGL memory leaks
    function disposeObjectTree(root) {
      root.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
    }

    function clearCase() {
      caseTick = null;
      while (caseGroup.children.length > 0) {
        const child = caseGroup.children[0];
        caseGroup.remove(child);
        disposeObjectTree(child);
      }
    }

    // High-DPI 3D Text Sprite Label
    function createLabel(text, mathPos, opts = {}) {
      const {
        color = theme === 'dark' ? '#e2e8f0' : '#0f172a',
        bg = theme === 'dark' ? 'rgba(10, 18, 34, 0.82)' : 'rgba(255, 255, 255, 0.88)',
        border = opts.accent || 'rgba(56, 189, 248, 0.55)',
        fontSize = 26,
        scale = 0.72,
        alwaysOnTop = false
      } = opts;

      const cnv = document.createElement('canvas');
      const ctx = cnv.getContext('2d');
      const font = `600 ${fontSize}px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.font = font;
      const padX = 18;
      const padY = 10;
      const textW = Math.ceil(ctx.measureText(text).width);
      const w = textW + padX * 2;
      const h = fontSize + padY * 2 + 4;
      cnv.width = w * 2;
      cnv.height = h * 2;
      ctx.scale(2, 2);

      // Rounded badge
      const r = 10;
      ctx.beginPath();
      ctx.moveTo(r, 1);
      ctx.lineTo(w - r, 1);
      ctx.quadraticCurveTo(w - 1, 1, w - 1, r);
      ctx.lineTo(w - 1, h - r);
      ctx.quadraticCurveTo(w - 1, h - 1, w - r, h - 1);
      ctx.lineTo(r, h - 1);
      ctx.quadraticCurveTo(1, h - 1, 1, h - r);
      ctx.lineTo(1, r);
      ctx.quadraticCurveTo(1, 1, r, 1);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = border;
      ctx.stroke();

      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, h / 2 + 1);

      const tex = new THREE.CanvasTexture(cnv);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: !alwaysOnTop,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      const aspect = w / h;
      sprite.scale.set(scale * aspect * 0.9, scale * 0.9, 1);
      if (Array.isArray(mathPos)) {
        sprite.position.copy(m2w(mathPos[0], mathPos[1], mathPos[2]));
      } else {
        sprite.position.copy(mathPos);
      }
      if (alwaysOnTop) sprite.renderOrder = 999;
      return sprite;
    }

    // 3D Coordinate Axes in Math Space (mx, my, mz)
    function createAxes3D({
      xRange = [-4, 4],
      yRange = [-4, 4],
      zRange = [0, 4.5],
      xLabel = 'X',
      yLabel = 'Y',
      zLabel = 'f(x)',
      showY = true,
      ticksX = [],
      ticksY = [],
      ticksZ = []
    } = {}) {
      const grp = new THREE.Group();
      const axisColor = theme === 'dark' ? 0x64748b : 0x475569;
      const lineMat = new THREE.LineBasicMaterial({ color: axisColor });

      // X Axis
      const xPts = [m2w(xRange[0], 0, 0), m2w(xRange[1], 0, 0)];
      grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(xPts), lineMat));
      const xCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.28, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      xCone.position.copy(m2w(xRange[1], 0, 0));
      xCone.rotation.z = -Math.PI / 2;
      grp.add(xCone);
      grp.add(createLabel(xLabel, [xRange[1] + 0.48, 0, 0.12], { accent: '#38bdf8', scale: 0.62 }));

      // Y Axis (Depth)
      if (showY) {
        const yPts = [m2w(0, yRange[0], 0), m2w(0, yRange[1], 0)];
        grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(yPts), lineMat));
        const yCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.09, 0.28, 12),
          new THREE.MeshBasicMaterial({ color: 0x34d399 })
        );
        yCone.position.copy(m2w(0, yRange[1], 0));
        yCone.rotation.x = -Math.PI / 2;
        grp.add(yCone);
        grp.add(createLabel(yLabel, [0, yRange[1] + 0.48, 0.12], { accent: '#34d399', scale: 0.62 }));
      }

      // Z Axis (Vertical Height)
      const zPts = [m2w(0, 0, zRange[0]), m2w(0, 0, zRange[1])];
      grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(zPts), lineMat));
      const zCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.28, 12),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      zCone.position.copy(m2w(0, 0, zRange[1]));
      grp.add(zCone);
      grp.add(createLabel(zLabel, [0, 0, zRange[1] + 0.38], { accent: '#fbbf24', scale: 0.62 }));

      // Optional tick labels
      ticksX.forEach((tx) => {
        grp.add(createLabel(String(tx), [tx, -0.28, -0.18], { scale: 0.46, border: 'rgba(100,116,139,0.4)' }));
      });
      ticksY.forEach((ty) => {
        grp.add(createLabel(String(ty), [-0.28, ty, -0.18], { scale: 0.46, border: 'rgba(100,116,139,0.4)' }));
      });
      ticksZ.forEach((tz) => {
        grp.add(createLabel(String(tz), [-0.32, 0, tz], { scale: 0.46, border: 'rgba(100,116,139,0.4)' }));
      });

      return grp;
    }

    // 3D Bar Pillar in Math Space
    function createBar3D({
      x = 0,
      y = 0,
      zBase = 0,
      height = 1,
      width = 0.42,
      depth = 0.42,
      color = 0x38bdf8,
      opacity = 0.85,
      edgeColor = 0xe0f2fe
    } = {}) {
      const h = Math.max(0.004, Math.abs(height));
      const sign = height >= 0 ? 1 : -1;
      const grp = new THREE.Group();
      const geo = new THREE.BoxGeometry(width, h, depth);
      const mat = new THREE.MeshPhongMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        shininess: 65
      });
      const mesh = new THREE.Mesh(geo, mat);
      const centerZ = zBase + sign * (h * 0.5);
      mesh.position.copy(m2w(x, y, centerZ));
      grp.add(mesh);

      if (edgeColor !== null) {
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.45 })
        );
        line.position.copy(mesh.position);
        grp.add(line);
      }
      return grp;
    }

    // 3D Curve + Optional Vertical Curtain Ribbon to basePlane
    function createRibbonCurve({
      points = [], // Array of [mx, my, mz]
      color = 0x38bdf8,
      fillColor = null,
      fillOpacity = 0.26,
      baseZ = 0,
      closedCurtain = true
    } = {}) {
      const grp = new THREE.Group();
      if (points.length < 2) return grp;

      const worldPts = points.map((p) => m2w(p[0], p[1], p[2]));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(worldPts);
      const lineMat = new THREE.LineBasicMaterial({ color });
      grp.add(new THREE.Line(lineGeo, lineMat));

      // Also add thin glowing spheres/tubes at endpoints or continuous curtain
      if (closedCurtain && fillOpacity > 0) {
        const n = points.length;
        const positions = new Float32Array(n * 2 * 3);
        const indices = [];
        for (let i = 0; i < n; i++) {
          const top = worldPts[i];
          const bot = m2w(points[i][0], points[i][1], baseZ);
          positions[i * 6 + 0] = bot.x;
          positions[i * 6 + 1] = bot.y;
          positions[i * 6 + 2] = bot.z;
          positions[i * 6 + 3] = top.x;
          positions[i * 6 + 4] = top.y;
          positions[i * 6 + 5] = top.z;
          if (i < n - 1) {
            const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
            indices.push(a, c, b, b, c, d);
          }
        }
        const ribGeo = new THREE.BufferGeometry();
        ribGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        ribGeo.setIndex(indices);
        ribGeo.computeVertexNormals();
        const ribMat = new THREE.MeshBasicMaterial({
          color: fillColor !== null ? fillColor : color,
          transparent: true,
          opacity: fillOpacity,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        grp.add(new THREE.Mesh(ribGeo, ribMat));
      }
      return grp;
    }

    // 3D Parametric Surface z = fn(mx, my)
    function createParametricSurface({
      fn,
      xMin = -3.5, xMax = 3.5, nx = 64,
      yMin = -3.5, yMax = 3.5, ny = 64,
      zScale = 1.0,
      zMaxRef = null,
      scheme = 'cyber',
      opacity = 0.88,
      wireframeOverlay = true,
      highlightFn = null, // (mx, my) => boolean
      dimOpacityFactor = 0.25
    } = {}) {
      const grp = new THREE.Group();
      const cols = nx + 1;
      const rows = ny + 1;
      const positions = new Float32Array(cols * rows * 3);
      const colors = new Float32Array(cols * rows * 3);
      const zVals = new Float32Array(cols * rows);
      let maxZ = 1e-6;

      for (let j = 0; j < rows; j++) {
        const my = lerp(yMin, yMax, j / ny);
        for (let i = 0; i < cols; i++) {
          const mx = lerp(xMin, xMax, i / nx);
          const rawZ = fn(mx, my);
          const mz = Number.isFinite(rawZ) ? rawZ * zScale : 0;
          const idx = j * cols + i;
          zVals[idx] = mz;
          if (mz > maxZ) maxZ = mz;
          const wp = m2w(mx, my, mz);
          positions[idx * 3 + 0] = wp.x;
          positions[idx * 3 + 1] = wp.y;
          positions[idx * 3 + 2] = wp.z;
        }
      }

      const normZ = zMaxRef || maxZ || 1;
      for (let j = 0; j < rows; j++) {
        const my = lerp(yMin, yMax, j / ny);
        for (let i = 0; i < cols; i++) {
          const mx = lerp(xMin, xMax, i / nx);
          const idx = j * cols + i;
          const t = clamp(zVals[idx] / normZ, 0, 1);
          let rgb = colormap(t, scheme);
          if (highlightFn && !highlightFn(mx, my)) {
            rgb = [rgb[0] * dimOpacityFactor, rgb[1] * dimOpacityFactor, rgb[2] * dimOpacityFactor + 0.12];
          }
          colors[idx * 3 + 0] = rgb[0];
          colors[idx * 3 + 1] = rgb[1];
          colors[idx * 3 + 2] = rgb[2];
        }
      }

      const indices = [];
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const a = j * cols + i;
          const b = a + 1;
          const c = (j + 1) * cols + i;
          const d = c + 1;
          indices.push(a, b, d, a, d, c);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        transparent: opacity < 1,
        opacity,
        side: THREE.DoubleSide,
        shininess: 48
      });
      grp.add(new THREE.Mesh(geo, mat));

      if (wireframeOverlay) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: theme === 'dark' ? 0xffffff : 0x1e293b,
          wireframe: true,
          transparent: true,
          opacity: 0.07,
          depthWrite: false
        });
        grp.add(new THREE.Mesh(geo, wireMat));
      }
      return grp;
    }

    // Glowing Laser Slice Plane in Math Space
    function createSlicePlane({
      axis = 'x', // 'x' | 'y' | 'z'
      value = 0,
      uRange = [-4, 4],
      vRange = [0, 4],
      color = 0x38bdf8,
      opacity = 0.18
    } = {}) {
      const grp = new THREE.Group();
      let corners;
      if (axis === 'x') {
        corners = [
          m2w(value, uRange[0], vRange[0]),
          m2w(value, uRange[1], vRange[0]),
          m2w(value, uRange[1], vRange[1]),
          m2w(value, uRange[0], vRange[1])
        ];
      } else if (axis === 'y') {
        corners = [
          m2w(uRange[0], value, vRange[0]),
          m2w(uRange[1], value, vRange[0]),
          m2w(uRange[1], value, vRange[1]),
          m2w(uRange[0], value, vRange[1])
        ];
      } else {
        corners = [
          m2w(uRange[0], vRange[0], value),
          m2w(uRange[1], vRange[0], value),
          m2w(uRange[1], vRange[1], value),
          m2w(uRange[0], vRange[1], value)
        ];
      }

      const pos = new Float32Array([
        corners[0].x, corners[0].y, corners[0].z,
        corners[1].x, corners[1].y, corners[1].z,
        corners[2].x, corners[2].y, corners[2].z,
        corners[3].x, corners[3].y, corners[3].z
      ]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setIndex([0, 1, 2, 0, 2, 3]);
      geo.computeVertexNormals();
      grp.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false
      })));

      const borderPts = [...corners, corners[0]];
      grp.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(borderPts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: Math.min(1, opacity * 3.2) })
      ));
      return grp;
    }

    // Main Render Loop
    let lastTime = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (orbit.autoRotate && !orbit.isDragging) {
        orbit.goalTheta += dt * 0.26;
      }

      // Smooth inertial damping
      const damp = 1 - Math.exp(-10 * dt);
      orbit.theta = lerp(orbit.theta, orbit.goalTheta, damp);
      orbit.phi = lerp(orbit.phi, orbit.goalPhi, damp);
      orbit.radius = lerp(orbit.radius, orbit.goalRadius, damp);
      orbit.target.lerp(orbit.goalTarget, damp);
      applyCameraFromOrbit();

      if (caseTick && !orbit.paused) {
        caseTick(dt, now * 0.001);
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    return {
      scene,
      camera,
      renderer,
      caseGroup,
      orbit,
      m2w,
      colormap,
      resize,
      setTheme,
      getTheme,
      setDefaultView,
      setCameraPreset,
      setOnTick,
      clearCase,
      disposeObjectTree,
      createLabel,
      createAxes3D,
      createBar3D,
      createRibbonCurve,
      createParametricSurface,
      createSlicePlane
    };
  }

  window.ProbLab.SceneEngine = {
    m2w,
    colormap,
    createEngine
  };
})();
