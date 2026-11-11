/**
 * Plot2D — Precision HiDPI 2D Oscilloscope & Spectrum Companion Renderer
 */
(function () {
  'use strict';

  const SigSys = (window.SigSys = window.SigSys || {});

  class Plot2D {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.theme = 'dark';
    }

    setTheme(theme) {
      this.theme = theme === 'light' ? 'light' : 'dark';
    }

    render(cfg) {
      if (!cfg || !this.canvas) return;
      const rect = this.canvas.parentElement
        ? this.canvas.parentElement.getBoundingClientRect()
        : this.canvas.getBoundingClientRect();
      const w = Math.max(200, Math.floor(rect.width));
      const h = Math.max(120, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
      }

      const ctx = this.ctx;
      const isLight = this.theme === 'light';
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = isLight ? '#ffffff' : '#0b1220';
      ctx.fillRect(0, 0, w, h);

      const pad = { left: 42, right: 14, top: 26, bottom: 24 };
      const pw = Math.max(40, w - pad.left - pad.right);
      const ph = Math.max(30, h - pad.top - pad.bottom);

      const xMin = cfg.xMin ?? -4;
      const xMax = cfg.xMax ?? 4;
      const yMin = cfg.yMin ?? -1.2;
      const yMax = cfg.yMax ?? 1.2;

      const mx = (x) => pad.left + ((x - xMin) / Math.max(xMax - xMin, 1e-9)) * pw;
      const my = (y) => pad.top + ph - ((y - yMin) / Math.max(yMax - yMin, 1e-9)) * ph;

      // Grid
      ctx.strokeStyle = isLight ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) {
        const gx = pad.left + (pw * i) / 4;
        ctx.moveTo(gx, pad.top);
        ctx.lineTo(gx, pad.top + ph);
      }
      for (let j = 0; j <= 3; j++) {
        const gy = pad.top + (ph * j) / 3;
        ctx.moveTo(pad.left, gy);
        ctx.lineTo(pad.left + pw, gy);
      }
      ctx.stroke();

      // Zero axes
      ctx.strokeStyle = isLight ? 'rgba(71,85,105,0.45)' : 'rgba(148,163,184,0.34)';
      ctx.beginPath();
      if (yMin <= 0 && yMax >= 0) {
        const zy = my(0);
        ctx.moveTo(pad.left, zy);
        ctx.lineTo(pad.left + pw, zy);
      }
      if (xMin <= 0 && xMax >= 0) {
        const zx = mx(0);
        ctx.moveTo(zx, pad.top);
        ctx.lineTo(zx, pad.top + ph);
      }
      ctx.stroke();

      // Shaded vertical bands (e.g., passband or ROC)
      if (cfg.vBands) {
        for (const b of cfg.vBands) {
          const bx1 = Math.max(pad.left, mx(b.from));
          const bx2 = Math.min(pad.left + pw, mx(b.to));
          if (bx2 > bx1) {
            ctx.fillStyle = b.color || 'rgba(16,185,129,0.14)';
            ctx.fillRect(bx1, pad.top, bx2 - bx1, ph);
          }
        }
      }

      // Clip plot area
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.left, pad.top, pw, ph);
      ctx.clip();

      if (cfg.series) {
        for (const s of cfg.series) {
          const pts = s.points || [];
          if (!pts.length) continue;
          const color = s.color || '#38bdf8';

          if (s.type === 'stems') {
            const zy = my(0);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 1.6;
            for (let i = 0; i < pts.length; i++) {
              const px = mx(pts[i][0]);
              const py = my(pts[i][1]);
              ctx.beginPath();
              ctx.moveTo(px, zy);
              ctx.lineTo(px, py);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(px, py, s.radius || 3.0, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            if (s.fill) {
              const zy = my(0);
              ctx.fillStyle = s.fill;
              ctx.beginPath();
              ctx.moveTo(mx(pts[0][0]), zy);
              for (let i = 0; i < pts.length; i++) ctx.lineTo(mx(pts[i][0]), my(pts[i][1]));
              ctx.lineTo(mx(pts[pts.length - 1][0]), zy);
              ctx.closePath();
              ctx.fill();
            }
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = s.width || 1.9;
            if (s.dashed) ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(mx(pts[0][0]), my(pts[0][1]));
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(mx(pts[i][0]), my(pts[i][1]));
            }
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      if (cfg.vLines) {
        for (const vl of cfg.vLines) {
          const vx = mx(vl.x);
          ctx.save();
          ctx.strokeStyle = vl.color || '#fbbf24';
          ctx.lineWidth = 1.3;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(vx, pad.top);
          ctx.lineTo(vx, pad.top + ph);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();

      // Title & Axis Labels
      ctx.fillStyle = isLight ? '#0f172a' : '#e2e8f0';
      ctx.font = '600 11.5px "Inter", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(cfg.title || '', pad.left, 13);

      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(SigSys.Math.fmt(yMax, 1), pad.left - 5, pad.top + 4);
      ctx.fillText(SigSys.Math.fmt(yMin, 1), pad.left - 5, pad.top + ph - 2);

      ctx.textAlign = 'left';
      ctx.fillText(SigSys.Math.fmt(xMin, 1), pad.left, h - 9);
      ctx.textAlign = 'right';
      ctx.fillText(`${SigSys.Math.fmt(xMax, 1)} ${cfg.xLabel || ''}`, pad.left + pw, h - 9);

      ctx.restore();
    }
  }

  SigSys.Plot2D = Plot2D;
})();
