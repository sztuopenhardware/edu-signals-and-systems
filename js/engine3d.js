/**
 * Engine3D — Interactive Scientific 3D Visualization Engine
 * Supports Perspective <-> Orthographic seamless projection tweening,
 * 3D Surfaces, Helices, Ribbons, Stems, Vectors, Pole-Zero Markers, ROC Regions,
 * Back-wall Coordinate Grids, and 2D Orthogonal Wall Projections.
 */
(function () {
  'use strict';

  const SigSys = (window.SigSys = window.SigSys || {});

  class Engine3D {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });

      // Camera spherical state
      this.defaultCam = {
        azimuth: -0.98,
        elevation: 0.46,
        zoom: 1.0,
        ortho: 0.0,
        panX: 0,
        panY: 0
      };
      this.cam = { ...this.defaultCam };
      this.tween = null;

      // Interaction state
      this.isDragging = false;
      this.dragMode = 'orbit'; // 'orbit' | 'pan'
      this.lastX = 0;
      this.lastY = 0;
      this.velAz = 0;
      this.velEl = 0;
      this.autoRotate = false;
      this.showProjections = true;
      this.showGrid = true;
      this.theme = 'dark';

      // Hover state
      this.mouseX = -9999;
      this.mouseY = -9999;
      this.hoverInfo = null;

      // Cached sizing
      this.width = 800;
      this.height = 520;
      this.dpr = 1;

      this._bindEvents();
      this.resize();
    }

    setTheme(theme) {
      this.theme = theme === 'light' ? 'light' : 'dark';
    }

    setDefaultCamera(cfg = {}) {
      this.defaultCam = {
        azimuth: cfg.azimuth ?? -0.98,
        elevation: cfg.elevation ?? 0.46,
        zoom: cfg.zoom ?? 1.0,
        ortho: cfg.ortho ?? 0.0,
        panX: cfg.panX ?? 0,
        panY: cfg.panY ?? 0
      };
      this.cam = { ...this.defaultCam };
      this.tween = null;
      this.velAz = 0;
      this.velEl = 0;
    }

    setCameraPreset(preset) {
      this.velAz = 0;
      this.velEl = 0;
      this.autoRotate = false;
      let target;
      if (preset === 'xz') {
        target = { azimuth: -Math.PI / 2, elevation: 0, ortho: 1.0, zoom: 1.04, panX: 0, panY: 0 };
      } else if (preset === 'yz') {
        target = { azimuth: 0, elevation: 0, ortho: 1.0, zoom: 1.04, panX: 0, panY: 0 };
      } else if (preset === 'xy') {
        target = { azimuth: -Math.PI / 2, elevation: Math.PI / 2 - 0.001, ortho: 1.0, zoom: 1.02, panX: 0, panY: 0 };
      } else {
        target = { ...this.defaultCam };
      }
      // Normalize shortest azimuth rotation
      let da = target.azimuth - this.cam.azimuth;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      target.azimuth = this.cam.azimuth + da;

      this.tween = {
        from: { ...this.cam },
        to: target,
        start: performance.now(),
        duration: 420
      };
    }

    resize() {
      const rect = this.canvas.parentElement
        ? this.canvas.parentElement.getBoundingClientRect()
        : this.canvas.getBoundingClientRect();
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(260, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w !== this.width || h !== this.height || dpr !== this.dpr) {
        this.width = w;
        this.height = h;
        this.dpr = dpr;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
      }
    }

    _bindEvents() {
      const c = this.canvas;
      c.addEventListener('contextmenu', (e) => e.preventDefault());

      c.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.tween = null;
        this.dragMode = e.button === 2 || e.shiftKey ? 'pan' : 'orbit';
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velAz = 0;
        this.velEl = 0;
      });

      window.addEventListener('mousemove', (e) => {
        const rect = c.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (!this.isDragging) return;
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;

        if (this.dragMode === 'pan') {
          this.cam.panX += dx;
          this.cam.panY += dy;
        } else {
          this.autoRotate = false;
          // Smoothly relax orthographic lock back toward 3D perspective when manually orbiting
          if (this.cam.ortho > 0) {
            this.cam.ortho = Math.max(0, this.cam.ortho - 0.12);
          }
          const dAz = -dx * 0.0075;
          const dEl = dy * 0.0075;
          this.cam.azimuth += dAz;
          this.cam.elevation = Math.max(-Math.PI / 2 + 0.02, Math.min(Math.PI / 2 - 0.02, this.cam.elevation + dEl));
          this.velAz = dAz * 0.45;
          this.velEl = dEl * 0.45;
        }
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      c.addEventListener('mouseleave', () => {
        if (!this.isDragging) {
          this.mouseX = -9999;
          this.mouseY = -9999;
        }
      });

      c.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          const factor = e.deltaY < 0 ? 1.09 : 0.92;
          this.cam.zoom = Math.max(0.48, Math.min(2.8, this.cam.zoom * factor));
        },
        { passive: false }
      );

      // Touch support
      let touchDist = 0;
      c.addEventListener(
        'touchstart',
        (e) => {
          this.tween = null;
          if (e.touches.length === 1) {
            this.isDragging = true;
            this.dragMode = 'orbit';
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
          } else if (e.touches.length === 2) {
            this.isDragging = false;
            touchDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
          }
        },
        { passive: true }
      );

      c.addEventListener(
        'touchmove',
        (e) => {
          if (e.touches.length === 1 && this.isDragging) {
            e.preventDefault();
            const dx = e.touches[0].clientX - this.lastX;
            const dy = e.touches[0].clientY - this.lastY;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
            this.cam.ortho = Math.max(0, this.cam.ortho - 0.12);
            this.cam.azimuth -= dx * 0.008;
            this.cam.elevation = Math.max(-1.53, Math.min(1.53, this.cam.elevation + dy * 0.008));
          } else if (e.touches.length === 2) {
            e.preventDefault();
            const d = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            if (touchDist > 10) {
              this.cam.zoom = Math.max(0.5, Math.min(2.6, this.cam.zoom * (d / touchDist)));
            }
            touchDist = d;
          }
        },
        { passive: false }
      );

      c.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    _updateCamera(now) {
      if (this.tween) {
        const u = Math.min(1, (now - this.tween.start) / this.tween.duration);
        const ease = 1 - Math.pow(1 - u, 3);
        for (const k of ['azimuth', 'elevation', 'zoom', 'ortho', 'panX', 'panY']) {
          this.cam[k] = this.tween.from[k] + (this.tween.to[k] - this.tween.from[k]) * ease;
        }
        if (u >= 1) this.tween = null;
      } else if (!this.isDragging) {
        if (this.autoRotate) {
          this.cam.ortho = Math.max(0, this.cam.ortho - 0.04);
          this.cam.azimuth += 0.0065;
        } else if (Math.abs(this.velAz) > 1e-4 || Math.abs(this.velEl) > 1e-4) {
          this.cam.azimuth += this.velAz;
          this.cam.elevation = Math.max(-1.54, Math.min(1.54, this.cam.elevation + this.velEl));
          this.velAz *= 0.91;
          this.velEl *= 0.91;
        }
      }
    }

    /**
     * Render complete 3D scene descriptor
     */
    render(scene, now = performance.now()) {
      if (!scene) return;
      this.resize();
      this._updateCamera(now);

      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;
      const isLight = this.theme === 'light';

      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      // 1. Background gradient
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 30, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      if (isLight) {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(1, '#e8eef7');
      } else {
        bgGrad.addColorStop(0, '#101a2e');
        bgGrad.addColorStop(1, '#070b14');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Axis ranges -> normalized [-1, 1] box with aspect proportions
      const axCfg = scene.axes || {};
      const xr = axCfg.x || { min: -4, max: 4, label: 'X' };
      const yr = axCfg.y || { min: -2, max: 2, label: 'Y' };
      const zr = axCfg.z || { min: -1.5, max: 1.5, label: 'Z' };

      const boxScale = scene.boxScale || [1.22, 1.0, 0.82];
      const bx = boxScale[0];
      const by = boxScale[1];
      const bz = boxScale[2];

      const mapX = (x) => (((x - xr.min) / Math.max(xr.max - xr.min, 1e-9)) * 2 - 1) * bx;
      const mapY = (y) => (((y - yr.min) / Math.max(yr.max - yr.min, 1e-9)) * 2 - 1) * by;
      const mapZ = (z) => (((z - zr.min) / Math.max(zr.max - zr.min, 1e-9)) * 2 - 1) * bz;

      // Orthonormal camera basis
      const th = this.cam.azimuth;
      const ph = this.cam.elevation;
      const cosT = Math.cos(th), sinT = Math.sin(th);
      const cosP = Math.cos(ph), sinP = Math.sin(ph);

      // Right vector r, Up vector u, Camera direction n
      const rx = -sinT, ry = cosT, rz = 0;
      const ux = -sinP * cosT, uy = -sinP * sinT, uz = cosP;
      const nx = cosP * cosT, ny = cosP * sinT, nz = sinP;

      const camDist = 4.5;
      const baseScale = Math.min(w, h) * 0.315 * this.cam.zoom;
      const cx = w * 0.5 + this.cam.panX;
      const cy = h * 0.52 + this.cam.panY;
      const ortho = this.cam.ortho;

      const projectNorm = (qx, qy, qz) => {
        const depth = qx * nx + qy * ny + qz * nz; // larger = closer to camera
        const persp = camDist / Math.max(0.6, camDist - depth);
        const s = ((1 - ortho) * persp + ortho) * baseScale;
        const sx = cx + (qx * rx + qy * ry + qz * rz) * s;
        const sy = cy - (qx * ux + qy * uy + qz * uz) * s;
        return { sx, sy, depth, scale: s };
      };

      const project = (wx, wy, wz) => projectNorm(mapX(wx), mapY(wy), mapZ(wz));

      // 2. Draw Back-Face Coordinate Box & Grid First
      if (this.showGrid && !scene.hideBox) {
        this._drawCoordinateBox(ctx, xr, yr, zr, bx, by, bz, nx, ny, nz, projectNorm, mapX, mapY, mapZ, isLight);
      }

      // 3. Build Unified Depth-Sorted Render Queue
      const queue = [];
      const pickCandidates = [];

      // 3a. Planes / ROC regions / Circles
      if (scene.planes) {
        for (const pl of scene.planes) {
          this._enqueuePlane(queue, pl, xr, yr, zr, project, isLight);
        }
      }

      // 3b. 2D Wall Shadow Projections (behind main 3D curves)
      if (this.showProjections && scene.curves) {
        for (const cv of scene.curves) {
          if (!cv.points || cv.points.length < 2) continue;
          const backX = nx >= 0 ? xr.min : xr.max;
          const backY = ny >= 0 ? yr.min : yr.max;
          const backZ = nz >= 0 ? zr.min : zr.max;
          const shadowAlpha = isLight ? 0.24 : 0.26;
          if (cv.shadowXZ) {
            this._enqueueShadowCurve(queue, cv.points, (p) => [p[0], backY, p[2]], cv.color, shadowAlpha, project);
          }
          if (cv.shadowYZ) {
            this._enqueueShadowCurve(queue, cv.points, (p) => [backX, p[1], p[2]], cv.color, shadowAlpha, project);
          }
          if (cv.shadowXY) {
            this._enqueueShadowCurve(queue, cv.points, (p) => [p[0], p[1], backZ], cv.color, shadowAlpha, project);
          }
        }
      }

      // 3c. 3D Surfaces
      if (scene.surfaces) {
        for (const surf of scene.surfaces) {
          this._enqueueSurface(queue, surf, project, mapX, mapY, mapZ, isLight);
        }
      }

      // 3d. 3D Ribbons (curtains under curves)
      if (scene.ribbons) {
        for (const rb of scene.ribbons) {
          this._enqueueRibbon(queue, rb, project);
        }
      }

      // 3e. Zero-reference internal axes (e.g., t-axis, Re/Im origin axes)
      if (axCfg.zeroAxes !== false) {
        this._enqueueZeroAxes(queue, xr, yr, zr, project, isLight);
      }

      // 3f. 3D Curves
      if (scene.curves) {
        for (const cv of scene.curves) {
          this._enqueueCurve(queue, cv, project, pickCandidates);
        }
      }

      // 3g. 3D Stems (Discrete signals / Dirac impulses)
      if (scene.stems) {
        for (const st of scene.stems) {
          this._enqueueStems(queue, st, project, pickCandidates);
        }
      }

      // 3h. 3D Vectors / Phasors
      if (scene.vectors) {
        for (const vec of scene.vectors) {
          this._enqueueVector(queue, vec, project);
        }
      }

      // 3i. 3D Markers (Poles ×, Zeros ○, Points)
      if (scene.markers) {
        for (const mk of scene.markers) {
          this._enqueueMarker(queue, mk, project, pickCandidates);
        }
      }

      // 3j. 3D World Labels
      if (scene.labels) {
        for (const lb of scene.labels) {
          const p = project(lb.pos[0], lb.pos[1], lb.pos[2]);
          queue.push({
            depth: p.depth + 0.08,
            draw: (c) => {
              c.save();
              c.font = lb.font || '600 12px "Inter", "Microsoft YaHei", sans-serif';
              c.textAlign = lb.align || 'center';
              c.textBaseline = 'middle';
              const text = lb.text;
              if (lb.bg) {
                const tw = c.measureText(text).width + 10;
                c.fillStyle = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(10,16,30,0.78)';
                c.beginPath();
                c.roundRect(p.sx - tw / 2, p.sy - 10, tw, 20, 4);
                c.fill();
              }
              c.fillStyle = lb.color || (isLight ? '#1e293b' : '#e2e8f0');
              c.fillText(text, p.sx + (lb.dx || 0), p.sy + (lb.dy || 0));
              c.restore();
            }
          });
        }
      }

      // Sort back-to-front (ascending depth)
      queue.sort((a, b) => a.depth - b.depth);
      for (let i = 0; i < queue.length; i++) {
        queue[i].draw(ctx);
      }

      // 4. Outer Axis Ticks & Titles
      if (!scene.hideBox) {
        this._drawAxisLabels(ctx, xr, yr, zr, bx, by, bz, nx, ny, nz, projectNorm, mapX, mapY, mapZ, isLight);
      }

      // 5. Legend & Hover Tooltip
      if (scene.legend && scene.legend.length) {
        this._drawLegend(ctx, scene.legend, w, isLight);
      }

      this._drawHoverTooltip(ctx, pickCandidates, w, h, isLight);

      ctx.restore();
    }

    _drawCoordinateBox(ctx, xr, yr, zr, bx, by, bz, nx, ny, nz, projectNorm, mapX, mapY, mapZ, isLight) {
      const gridColor = isLight ? 'rgba(100,116,139,0.18)' : 'rgba(148,163,184,0.12)';
      const borderColor = isLight ? 'rgba(71,85,105,0.34)' : 'rgba(148,163,184,0.26)';
      const wallFill = isLight ? 'rgba(226,232,240,0.28)' : 'rgba(15,23,42,0.36)';

      // Choose the 3 back faces farthest from camera
      const backX = nx >= 0 ? -bx : bx;
      const backY = ny >= 0 ? -by : by;
      const backZ = nz >= 0 ? -bz : bz;

      const drawQuad = (pts) => {
        const sp = pts.map((p) => projectNorm(p[0], p[1], p[2]));
        ctx.fillStyle = wallFill;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sp[0].sx, sp[0].sy);
        for (let i = 1; i < 4; i++) ctx.lineTo(sp[i].sx, sp[i].sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Floor/Ceiling XY back wall
      drawQuad([
        [-bx, -by, backZ],
        [bx, -by, backZ],
        [bx, by, backZ],
        [-bx, by, backZ]
      ]);
      // Back XZ wall
      drawQuad([
        [-bx, backY, -bz],
        [bx, backY, -bz],
        [bx, backY, bz],
        [-bx, backY, bz]
      ]);
      // Side YZ wall
      drawQuad([
        [backX, -by, -bz],
        [backX, by, -bz],
        [backX, by, bz],
        [backX, -by, bz]
      ]);

      // Grid lines along ticks
      const xTicks = xr.ticks || this._autoTicks(xr.min, xr.max, 5);
      const yTicks = yr.ticks || this._autoTicks(yr.min, yr.max, 5);
      const zTicks = zr.ticks || this._autoTicks(zr.min, zr.max, 5);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const xv of xTicks) {
        const qx = mapX(xv);
        if (qx < -bx - 1e-4 || qx > bx + 1e-4) continue;
        let a = projectNorm(qx, -by, backZ), b = projectNorm(qx, by, backZ);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        a = projectNorm(qx, backY, -bz); b = projectNorm(qx, backY, bz);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
      }
      for (const yv of yTicks) {
        const qy = mapY(yv);
        if (qy < -by - 1e-4 || qy > by + 1e-4) continue;
        let a = projectNorm(-bx, qy, backZ), b = projectNorm(bx, qy, backZ);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        a = projectNorm(backX, qy, -bz); b = projectNorm(backX, qy, bz);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
      }
      for (const zv of zTicks) {
        const qz = mapZ(zv);
        if (qz < -bz - 1e-4 || qz > bz + 1e-4) continue;
        let a = projectNorm(-bx, backY, qz), b = projectNorm(bx, backY, qz);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        a = projectNorm(backX, -by, qz); b = projectNorm(backX, by, qz);
        ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
      }
      ctx.stroke();
    }

    _drawAxisLabels(ctx, xr, yr, zr, bx, by, bz, nx, ny, nz, projectNorm, mapX, mapY, mapZ, isLight) {
      const frontY = ny >= 0 ? by : -by;
      const frontX = nx >= 0 ? bx : -bx;
      const bottomZ = nz >= 0 ? -bz : bz;
      const backY = -frontY;

      const tickColor = isLight ? '#475569' : '#94a3b8';
      const titleXColor = isLight ? '#0284c7' : '#38bdf8';
      const titleYColor = isLight ? '#d97706' : '#fbbf24';
      const titleZColor = isLight ? '#059669' : '#34d399';

      ctx.font = '500 11px "JetBrains Mono", "Consolas", monospace';
      ctx.fillStyle = tickColor;

      // X ticks along front-bottom edge
      const xTicks = xr.ticks || this._autoTicks(xr.min, xr.max, 5);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const xv of xTicks) {
        const qx = mapX(xv);
        if (qx < -bx - 1e-3 || qx > bx + 1e-3) continue;
        const p = projectNorm(qx, frontY, bottomZ);
        const lbl = xr.format ? xr.format(xv) : this._fmtTick(xv);
        ctx.fillText(lbl, p.sx, p.sy + 6);
      }
      const xMid = projectNorm(0, frontY * 1.16, bottomZ - 0.1);
      ctx.font = '600 12.5px "Inter", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = titleXColor;
      ctx.fillText(xr.label || 'X', xMid.sx, xMid.sy + 14);

      // Y ticks along side-bottom edge
      ctx.font = '500 11px "JetBrains Mono", "Consolas", monospace';
      ctx.fillStyle = tickColor;
      const yTicks = yr.ticks || this._autoTicks(yr.min, yr.max, 5);
      for (const yv of yTicks) {
        const qy = mapY(yv);
        if (qy < -by - 1e-3 || qy > by + 1e-3) continue;
        const p = projectNorm(frontX, qy, bottomZ);
        const lbl = yr.format ? yr.format(yv) : this._fmtTick(yv);
        ctx.fillText(lbl, p.sx + (nx >= 0 ? 14 : -14), p.sy + 5);
      }
      const yMid = projectNorm(frontX * 1.18, 0, bottomZ - 0.1);
      ctx.font = '600 12.5px "Inter", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = titleYColor;
      ctx.fillText(yr.label || 'Y', yMid.sx + (nx >= 0 ? 18 : -18), yMid.sy + 12);

      // Z ticks along vertical outer edge
      ctx.font = '500 11px "JetBrains Mono", "Consolas", monospace';
      ctx.fillStyle = tickColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const zTicks = zr.ticks || this._autoTicks(zr.min, zr.max, 5);
      const zEdgeX = -frontX;
      const zEdgeY = frontY;
      for (const zv of zTicks) {
        const qz = mapZ(zv);
        if (qz < -bz - 1e-3 || qz > bz + 1e-3) continue;
        const p = projectNorm(zEdgeX, zEdgeY, qz);
        const lbl = zr.format ? zr.format(zv) : this._fmtTick(zv);
        ctx.fillText(lbl, p.sx - 8, p.sy);
      }
      const zTop = projectNorm(zEdgeX, zEdgeY, bz + 0.14);
      ctx.font = '600 12.5px "Inter", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = titleZColor;
      ctx.textAlign = 'center';
      ctx.fillText(zr.label || 'Z', zTop.sx - 6, zTop.sy - 6);
    }

    _enqueueZeroAxes(queue, xr, yr, zr, project, isLight) {
      const col = isLight ? 'rgba(51,65,85,0.45)' : 'rgba(203,213,225,0.34)';
      const z0 = zr.min <= 0 && zr.max >= 0 ? 0 : zr.min;
      const y0 = yr.min <= 0 && yr.max >= 0 ? 0 : yr.min;
      const x0 = xr.min <= 0 && xr.max >= 0 ? 0 : xr.min;

      const addSeg = (p1, p2) => {
        const a = project(p1[0], p1[1], p1[2]);
        const b = project(p2[0], p2[1], p2[2]);
        queue.push({
          depth: (a.depth + b.depth) * 0.5 - 0.01,
          draw: (c) => {
            c.strokeStyle = col;
            c.lineWidth = 1.2;
            c.beginPath();
            c.moveTo(a.sx, a.sy);
            c.lineTo(b.sx, b.sy);
            c.stroke();
          }
        });
      };

      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const x1 = xr.min + ((xr.max - xr.min) * i) / steps;
        const x2 = xr.min + ((xr.max - xr.min) * (i + 1)) / steps;
        addSeg([x1, y0, z0], [x2, y0, z0]);

        const y1 = yr.min + ((yr.max - yr.min) * i) / steps;
        const y2 = yr.min + ((yr.max - yr.min) * (i + 1)) / steps;
        addSeg([x0, y1, z0], [x0, y2, z0]);
      }
    }

    _enqueuePlane(queue, pl, xr, yr, zr, project, isLight) {
      if (pl.type === 'circle') {
        const segs = 72;
        const r = pl.radius ?? 1;
        const z = pl.z ?? 0;
        const cx0 = pl.cx ?? 0;
        const cy0 = pl.cy ?? 0;
        for (let i = 0; i < segs; i++) {
          const a1 = (i / segs) * Math.PI * 2;
          const a2 = ((i + 1) / segs) * Math.PI * 2;
          const p1 = project(cx0 + r * Math.cos(a1), cy0 + r * Math.sin(a1), z);
          const p2 = project(cx0 + r * Math.cos(a2), cy0 + r * Math.sin(a2), z);
          queue.push({
            depth: (p1.depth + p2.depth) * 0.5 + 0.005,
            draw: (c) => {
              c.save();
              c.strokeStyle = pl.color || '#fbbf24';
              c.lineWidth = pl.width || 2;
              if (pl.dashed) c.setLineDash([5, 4]);
              c.beginPath();
              c.moveTo(p1.sx, p1.sy);
              c.lineTo(p2.sx, p2.sy);
              c.stroke();
              c.restore();
            }
          });
        }
        return;
      }

      if (pl.type === 'annulus') {
        const rIn = Math.max(0, pl.rMin ?? 0);
        const rOut = Math.max(rIn + 0.02, pl.rMax ?? 2);
        const z = pl.z ?? zr.min;
        const nAng = 48;
        const nRad = 5;
        for (let ir = 0; ir < nRad; ir++) {
          const ra = rIn + ((rOut - rIn) * ir) / nRad;
          const rb = rIn + ((rOut - rIn) * (ir + 1)) / nRad;
          for (let ia = 0; ia < nAng; ia++) {
            const t1 = (ia / nAng) * Math.PI * 2;
            const t2 = ((ia + 1) / nAng) * Math.PI * 2;
            const q = [
              project(ra * Math.cos(t1), ra * Math.sin(t1), z),
              project(rb * Math.cos(t1), rb * Math.sin(t1), z),
              project(rb * Math.cos(t2), rb * Math.sin(t2), z),
              project(ra * Math.cos(t2), ra * Math.sin(t2), z)
            ];
            const d = (q[0].depth + q[1].depth + q[2].depth + q[3].depth) * 0.25 - 0.03;
            queue.push({
              depth: d,
              draw: (c) => {
                c.fillStyle = pl.color || 'rgba(16,185,129,0.18)';
                c.beginPath();
                c.moveTo(q[0].sx, q[0].sy);
                c.lineTo(q[1].sx, q[1].sy);
                c.lineTo(q[2].sx, q[2].sy);
                c.lineTo(q[3].sx, q[3].sy);
                c.closePath();
                c.fill();
              }
            });
          }
        }
        return;
      }

      // Rectangular plane subdivided into grid patches for accurate depth sorting
      const axis = pl.axis || 'z';
      const val = pl.value ?? 0;
      const x1 = pl.xMin ?? xr.min, x2 = pl.xMax ?? xr.max;
      const y1 = pl.yMin ?? yr.min, y2 = pl.yMax ?? yr.max;
      const z1 = pl.zMin ?? zr.min, z2 = pl.zMax ?? zr.max;
      const nu = 8, nv = 8;

      for (let i = 0; i < nu; i++) {
        for (let j = 0; j < nv; j++) {
          let corners;
          if (axis === 'z') {
            const xa = x1 + ((x2 - x1) * i) / nu, xb = x1 + ((x2 - x1) * (i + 1)) / nu;
            const ya = y1 + ((y2 - y1) * j) / nv, yb = y1 + ((y2 - y1) * (j + 1)) / nv;
            corners = [[xa, ya, val], [xb, ya, val], [xb, yb, val], [xa, yb, val]];
          } else if (axis === 'x') {
            const ya = y1 + ((y2 - y1) * i) / nu, yb = y1 + ((y2 - y1) * (i + 1)) / nu;
            const za = z1 + ((z2 - z1) * j) / nv, zb = z1 + ((z2 - z1) * (j + 1)) / nv;
            corners = [[val, ya, za], [val, yb, za], [val, yb, zb], [val, ya, zb]];
          } else {
            const xa = x1 + ((x2 - x1) * i) / nu, xb = x1 + ((x2 - x1) * (i + 1)) / nu;
            const za = z1 + ((z2 - z1) * j) / nv, zb = z1 + ((z2 - z1) * (j + 1)) / nv;
            corners = [[xa, val, za], [xb, val, za], [xb, val, zb], [xa, val, zb]];
          }
          const sp = corners.map((p) => project(p[0], p[1], p[2]));
          const d = (sp[0].depth + sp[1].depth + sp[2].depth + sp[3].depth) * 0.25 - 0.02;
          queue.push({
            depth: d,
            draw: (c) => {
              c.fillStyle = pl.color || 'rgba(56,189,248,0.14)';
              c.beginPath();
              c.moveTo(sp[0].sx, sp[0].sy);
              c.lineTo(sp[1].sx, sp[1].sy);
              c.lineTo(sp[2].sx, sp[2].sy);
              c.lineTo(sp[3].sx, sp[3].sy);
              c.closePath();
              c.fill();
            }
          });
        }
      }

      if (pl.borderColor) {
        let bCorners;
        if (axis === 'z') bCorners = [[x1, y1, val], [x2, y1, val], [x2, y2, val], [x1, y2, val]];
        else if (axis === 'x') bCorners = [[val, y1, z1], [val, y2, z1], [val, y2, z2], [val, y1, z2]];
        else bCorners = [[x1, val, z1], [x2, val, z1], [x2, val, z2], [x1, val, z2]];
        const sp = bCorners.map((p) => project(p[0], p[1], p[2]));
        const d = (sp[0].depth + sp[1].depth + sp[2].depth + sp[3].depth) * 0.25;
        queue.push({
          depth: d,
          draw: (c) => {
            c.save();
            c.strokeStyle = pl.borderColor;
            c.lineWidth = 1.4;
            if (pl.dashed) c.setLineDash([5, 4]);
            c.beginPath();
            c.moveTo(sp[0].sx, sp[0].sy);
            for (let k = 1; k < 4; k++) c.lineTo(sp[k].sx, sp[k].sy);
            c.closePath();
            c.stroke();
            c.restore();
          }
        });
      }
    }

    _enqueueSurface(queue, surf, project, mapX, mapY, mapZ, isLight) {
      const xs = surf.xGrid;
      const ys = surf.yGrid;
      const zm = surf.zMatrix; // zm[ix][iy]
      if (!xs || !ys || !zm) return;
      const nx = xs.length;
      const ny = ys.length;
      const zMin = surf.zMin ?? 0;
      const zMax = surf.zMax ?? 4;
      const alpha = surf.opacity ?? 0.78;
      const wire = surf.wireframe !== false;
      const wireCol = isLight ? 'rgba(15,23,42,0.16)' : 'rgba(255,255,255,0.13)';

      // Pre-project all vertices
      const proj = new Array(nx);
      for (let i = 0; i < nx; i++) {
        proj[i] = new Array(ny);
        for (let j = 0; j < ny; j++) {
          proj[i][j] = project(xs[i], ys[j], zm[i][j]);
        }
      }

      for (let i = 0; i < nx - 1; i++) {
        for (let j = 0; j < ny - 1; j++) {
          const z00 = zm[i][j], z10 = zm[i + 1][j], z11 = zm[i + 1][j + 1], z01 = zm[i][j + 1];
          if (!Number.isFinite(z00) || !Number.isFinite(z10) || !Number.isFinite(z11) || !Number.isFinite(z01)) continue;
          const p00 = proj[i][j], p10 = proj[i + 1][j], p11 = proj[i + 1][j + 1], p01 = proj[i][j + 1];
          const avgZ = (z00 + z10 + z11 + z01) * 0.25;
          const u = Math.max(0, Math.min(1, (avgZ - zMin) / Math.max(zMax - zMin, 1e-6)));

          // Subtle directional shading from slope
          const dzdx = mapZ(z10) - mapZ(z00);
          const dzdy = mapZ(z01) - mapZ(z00);
          const shade = Math.max(0.75, Math.min(1.18, 1.0 - dzdx * 1.1 + dzdy * 0.8));

          const fillStyle = surf.colorFn
            ? surf.colorFn(avgZ, (xs[i] + xs[i + 1]) * 0.5, (ys[j] + ys[j + 1]) * 0.5, u, shade)
            : SigSys.Math.colormap(Math.min(1, u * shade), alpha);

          const depth = (p00.depth + p10.depth + p11.depth + p01.depth) * 0.25;
          queue.push({
            depth,
            draw: (c) => {
              c.fillStyle = fillStyle;
              c.beginPath();
              c.moveTo(p00.sx, p00.sy);
              c.lineTo(p10.sx, p10.sy);
              c.lineTo(p11.sx, p11.sy);
              c.lineTo(p01.sx, p01.sy);
              c.closePath();
              c.fill();
              if (wire) {
                c.strokeStyle = wireCol;
                c.lineWidth = 0.65;
                c.stroke();
              }
            }
          });
        }
      }
    }

    _enqueueRibbon(queue, rb, project) {
      const pts = rb.points;
      if (!pts || pts.length < 2) return;
      const baseZ = rb.baseZ ?? 0;
      const col = rb.color || 'rgba(56,189,248,0.18)';
      const stride = Math.max(1, Math.floor(pts.length / 90));

      for (let i = 0; i < pts.length - stride; i += stride) {
        const j = Math.min(pts.length - 1, i + stride);
        const a = pts[i], b = pts[j];
        const p0 = project(a[0], a[1], baseZ);
        const p1 = project(a[0], a[1], a[2]);
        const p2 = project(b[0], b[1], b[2]);
        const p3 = project(b[0], b[1], baseZ);
        const d = (p0.depth + p1.depth + p2.depth + p3.depth) * 0.25 - 0.005;
        queue.push({
          depth: d,
          draw: (c) => {
            c.fillStyle = col;
            c.beginPath();
            c.moveTo(p0.sx, p0.sy);
            c.lineTo(p1.sx, p1.sy);
            c.lineTo(p2.sx, p2.sy);
            c.lineTo(p3.sx, p3.sy);
            c.closePath();
            c.fill();
          }
        });
      }
    }

    _enqueueShadowCurve(queue, pts, mapper, baseColor, alpha, project) {
      const sp = new Array(pts.length);
      let sumD = 0;
      for (let i = 0; i < pts.length; i++) {
        const mp = mapper(pts[i]);
        sp[i] = project(mp[0], mp[1], mp[2]);
        sumD += sp[i].depth;
      }
      queue.push({
        depth: sumD / pts.length - 0.4,
        draw: (c) => {
          c.save();
          c.globalAlpha = alpha;
          c.strokeStyle = baseColor || '#38bdf8';
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(sp[0].sx, sp[0].sy);
          for (let i = 1; i < sp.length; i++) c.lineTo(sp[i].sx, sp[i].sy);
          c.stroke();
          c.restore();
        }
      });
    }

    _enqueueCurve(queue, cv, project, pickCandidates) {
      const pts = cv.points;
      if (!pts || pts.length < 2) return;
      const width = cv.width ?? 2.4;
      const color = cv.color || '#38bdf8';
      const chunkSize = cv.dashed ? pts.length : 12;

      for (let start = 0; start < pts.length - 1; start += chunkSize) {
        const end = Math.min(pts.length - 1, start + chunkSize);
        const seg = [];
        let dSum = 0;
        for (let k = start; k <= end; k++) {
          const p = project(pts[k][0], pts[k][1], pts[k][2]);
          seg.push(p);
          dSum += p.depth;
          if (cv.pickable && k % 6 === 0) {
            pickCandidates.push({ sx: p.sx, sy: p.sy, pos: pts[k], label: cv.label || '' });
          }
        }
        const segColor = cv.segmentColor ? cv.segmentColor(start / pts.length, pts[start]) : color;
        queue.push({
          depth: dSum / seg.length,
          draw: (c) => {
            c.save();
            if (cv.glow) {
              c.shadowColor = segColor;
              c.shadowBlur = cv.glow === true ? 9 : cv.glow;
            }
            if (cv.dashed) c.setLineDash([6, 4]);
            c.strokeStyle = segColor;
            c.lineWidth = width;
            c.lineCap = 'round';
            c.lineJoin = 'round';
            c.beginPath();
            c.moveTo(seg[0].sx, seg[0].sy);
            for (let i = 1; i < seg.length; i++) c.lineTo(seg[i].sx, seg[i].sy);
            c.stroke();
            c.restore();
          }
        });
      }
    }

    _enqueueStems(queue, st, project, pickCandidates) {
      const pts = st.points;
      if (!pts || !pts.length) return;
      const baseZ = st.baseZ ?? 0;
      const color = st.color || '#38bdf8';
      const lw = st.width ?? 2.0;
      const rad = st.radius ?? 4.0;
      const isImpulse = !!st.impulse;

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        const pBase = project(pt[0], pt[1], baseZ);
        const pTip = project(pt[0], pt[1], pt[2]);
        const itemColor = st.pointColor ? st.pointColor(i, pt) : color;
        pickCandidates.push({
          sx: pTip.sx,
          sy: pTip.sy,
          pos: pt,
          label: st.label || (isImpulse ? '冲激强度' : '序列样本')
        });

        queue.push({
          depth: (pBase.depth + pTip.depth) * 0.5 + 0.01,
          draw: (c) => {
            c.save();
            c.strokeStyle = itemColor;
            c.fillStyle = itemColor;
            c.lineWidth = lw;
            c.beginPath();
            c.moveTo(pBase.sx, pBase.sy);
            c.lineTo(pTip.sx, pTip.sy);
            c.stroke();

            if (isImpulse) {
              const ang = Math.atan2(pTip.sy - pBase.sy, pTip.sx - pBase.sx);
              const head = 8;
              c.beginPath();
              c.moveTo(pTip.sx, pTip.sy);
              c.lineTo(pTip.sx - head * Math.cos(ang - 0.45), pTip.sy - head * Math.sin(ang - 0.45));
              c.lineTo(pTip.sx - head * Math.cos(ang + 0.45), pTip.sy - head * Math.sin(ang + 0.45));
              c.closePath();
              c.fill();
            } else {
              c.beginPath();
              c.arc(pTip.sx, pTip.sy, rad, 0, Math.PI * 2);
              c.fill();
            }
            c.restore();
          }
        });
      }
    }

    _enqueueVector(queue, vec, project) {
      const a = project(vec.from[0], vec.from[1], vec.from[2]);
      const b = project(vec.to[0], vec.to[1], vec.to[2]);
      const col = vec.color || '#f43f5e';
      queue.push({
        depth: (a.depth + b.depth) * 0.5 + 0.03,
        draw: (c) => {
          c.save();
          c.strokeStyle = col;
          c.fillStyle = col;
          c.lineWidth = vec.width || 2.2;
          if (vec.dashed) c.setLineDash([4, 3]);
          c.beginPath();
          c.moveTo(a.sx, a.sy);
          c.lineTo(b.sx, b.sy);
          c.stroke();
          c.setLineDash([]);

          const ang = Math.atan2(b.sy - a.sy, b.sx - a.sx);
          const len = Math.hypot(b.sx - a.sx, b.sy - a.sy);
          if (len > 4) {
            const hs = 8.5;
            c.beginPath();
            c.moveTo(b.sx, b.sy);
            c.lineTo(b.sx - hs * Math.cos(ang - 0.42), b.sy - hs * Math.sin(ang - 0.42));
            c.lineTo(b.sx - hs * Math.cos(ang + 0.42), b.sy - hs * Math.sin(ang + 0.42));
            c.closePath();
            c.fill();
          }
          if (vec.label) {
            c.font = '600 11px "JetBrains Mono", monospace';
            c.textAlign = 'center';
            c.fillText(vec.label, (a.sx + b.sx) * 0.5, (a.sy + b.sy) * 0.5 - 7);
          }
          c.restore();
        }
      });
    }

    _enqueueMarker(queue, mk, project, pickCandidates) {
      const p = project(mk.pos[0], mk.pos[1], mk.pos[2]);
      const sz = mk.size ?? 6.5;
      const shape = mk.shape || 'dot';
      const col = mk.color || (shape === 'pole' ? '#fb7185' : shape === 'zero' ? '#38bdf8' : '#fbbf24');

      pickCandidates.push({
        sx: p.sx,
        sy: p.sy,
        pos: mk.pos,
        label: mk.label || (shape === 'pole' ? '极点 Pole' : shape === 'zero' ? '零点 Zero' : '特征点')
      });

      queue.push({
        depth: p.depth + 0.05,
        draw: (c) => {
          c.save();
          c.strokeStyle = col;
          c.fillStyle = col;
          c.lineWidth = 2.5;
          c.shadowColor = col;
          c.shadowBlur = 7;

          if (shape === 'pole') {
            c.beginPath();
            c.moveTo(p.sx - sz, p.sy - sz);
            c.lineTo(p.sx + sz, p.sy + sz);
            c.moveTo(p.sx - sz, p.sy + sz);
            c.lineTo(p.sx + sz, p.sy - sz);
            c.stroke();
          } else if (shape === 'zero') {
            c.beginPath();
            c.arc(p.sx, p.sy, sz, 0, Math.PI * 2);
            c.stroke();
          } else if (shape === 'diamond') {
            c.beginPath();
            c.moveTo(p.sx, p.sy - sz);
            c.lineTo(p.sx + sz, p.sy);
            c.lineTo(p.sx, p.sy + sz);
            c.lineTo(p.sx - sz, p.sy);
            c.closePath();
            c.fill();
          } else {
            c.beginPath();
            c.arc(p.sx, p.sy, sz * 0.78, 0, Math.PI * 2);
            c.fill();
          }

          if (mk.label) {
            c.shadowBlur = 0;
            c.font = '600 11.5px "Inter", "Microsoft YaHei", sans-serif';
            c.textAlign = 'left';
            c.textBaseline = 'middle';
            c.fillText(mk.label, p.sx + sz + 5, p.sy - 2);
          }
          c.restore();
        }
      });
    }

    _drawLegend(ctx, items, w, isLight) {
      const padX = 12;
      const startY = 14;
      let curX = w - 14;

      ctx.save();
      ctx.font = '500 11.5px "Inter", "Microsoft YaHei", sans-serif';
      const widths = items.map((it) => ctx.measureText(it.label).width + 26);
      const totalW = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 10 + padX * 2;
      const boxX = Math.max(12, curX - totalW);

      ctx.fillStyle = isLight ? 'rgba(255,255,255,0.86)' : 'rgba(11,18,32,0.80)';
      ctx.strokeStyle = isLight ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, startY, totalW, 28, 7);
      ctx.fill();
      ctx.stroke();

      let x = boxX + padX;
      const cy = startY + 14;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        ctx.fillStyle = it.color;
        ctx.strokeStyle = it.color;
        ctx.lineWidth = 2.4;
        if (it.type === 'pole') {
          ctx.beginPath();
          ctx.moveTo(x + 2, cy - 4); ctx.lineTo(x + 10, cy + 4);
          ctx.moveTo(x + 2, cy + 4); ctx.lineTo(x + 10, cy - 4);
          ctx.stroke();
        } else if (it.type === 'zero') {
          ctx.beginPath();
          ctx.arc(x + 6, cy, 4.5, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, cy);
          ctx.lineTo(x + 14, cy);
          ctx.stroke();
        }
        ctx.fillStyle = isLight ? '#1e293b' : '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(it.label, x + 19, cy + 0.5);
        x += widths[i] + 10;
      }
      ctx.restore();
    }

    _drawHoverTooltip(ctx, candidates, w, h, isLight) {
      if (this.mouseX < 0 || !candidates.length) {
        this.hoverInfo = null;
        return;
      }
      let best = null;
      let bestDist = 18;
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        const d = Math.hypot(c.sx - this.mouseX, c.sy - this.mouseY);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (!best) {
        this.hoverInfo = null;
        return;
      }
      this.hoverInfo = best;

      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(best.sx, best.sy, 7, 0, Math.PI * 2);
      ctx.stroke();

      const fmt = SigSys.Math.fmt;
      const coordStr = `(${fmt(best.pos[0], 2)}, ${fmt(best.pos[1], 2)}, ${fmt(best.pos[2], 2)})`;
      const txt = best.label ? `${best.label}: ${coordStr}` : coordStr;
      ctx.font = '600 11.5px "JetBrains Mono", "Microsoft YaHei", monospace';
      const tw = ctx.measureText(txt).width + 16;
      const tx = Math.min(w - tw - 8, Math.max(8, best.sx + 12));
      const ty = Math.max(10, best.sy - 30);

      ctx.fillStyle = isLight ? 'rgba(15,23,42,0.92)' : 'rgba(15,23,42,0.92)';
      ctx.strokeStyle = 'rgba(251,191,36,0.65)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, tx + 8, ty + 12);
      ctx.restore();
    }

    _autoTicks(min, max, count) {
      const span = max - min;
      if (span <= 0) return [min];
      const raw = span / Math.max(2, count - 1);
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const norm = raw / mag;
      const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
      const start = Math.ceil((min - 1e-9) / step) * step;
      const res = [];
      for (let v = start; v <= max + 1e-9; v += step) {
        res.push(Math.abs(v) < 1e-10 ? 0 : Number(v.toPrecision(6)));
      }
      return res;
    }

    _fmtTick(v) {
      if (Math.abs(v) < 1e-9) return '0';
      if (Math.abs(v) >= 100 || Math.abs(v) < 0.05) return v.toFixed(1);
      return Number(v.toFixed(2)).toString();
    }
  }

  SigSys.Engine3D = Engine3D;
})();
