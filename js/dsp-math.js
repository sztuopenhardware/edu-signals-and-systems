/**
 * Signals & Systems 3D Teaching Simulation Platform
 * Core DSP, Complex Analysis, Filter & Transform Math Library
 */
(function () {
  'use strict';

  const SigSys = (window.SigSys = window.SigSys || {
    chapters: [],
    casesById: {}
  });

  const TWO_PI = Math.PI * 2;
  const EPS = 1e-12;

  /* ==================== Complex Arithmetic ==================== */
  function cplx(re, im = 0) {
    return { re, im };
  }

  function cAdd(a, b) {
    return { re: a.re + b.re, im: a.im + b.im };
  }

  function cSub(a, b) {
    return { re: a.re - b.re, im: a.im - b.im };
  }

  function cMul(a, b) {
    return {
      re: a.re * b.re - a.im * b.im,
      im: a.re * b.im + a.im * b.re
    };
  }

  function cDiv(a, b) {
    const den = b.re * b.re + b.im * b.im;
    if (den < 1e-18) {
      const mag = Math.hypot(a.re, a.im) * 1e9;
      return { re: mag, im: 0 };
    }
    return {
      re: (a.re * b.re + a.im * b.im) / den,
      im: (a.im * b.re - a.re * b.im) / den
    };
  }

  function cExp(re, im = 0) {
    const r = Math.exp(re);
    return { re: r * Math.cos(im), im: r * Math.sin(im) };
  }

  function cAbs(z) {
    return Math.hypot(z.re, z.im);
  }

  function cArg(z) {
    return Math.atan2(z.im, z.re);
  }

  /**
   * Evaluate rational H(s) or H(z) from gain K, zeros[], poles[]
   */
  function evalZeroPole(s, zeros, poles, gain = 1) {
    let num = { re: gain, im: 0 };
    for (let i = 0; i < zeros.length; i++) {
      num = cMul(num, cSub(s, zeros[i]));
    }
    let den = { re: 1, im: 0 };
    for (let i = 0; i < poles.length; i++) {
      den = cMul(den, cSub(s, poles[i]));
    }
    return cDiv(num, den);
  }

  /* ==================== Special Signals & Functions ==================== */
  /** Sampling function Sa(x) = sin(x)/x */
  function sa(x) {
    if (Math.abs(x) < 1e-7) return 1 - (x * x) / 6;
    return Math.sin(x) / x;
  }

  /** Normalized sinc(x) = sin(pi*x)/(pi*x) */
  function sinc(x) {
    return sa(Math.PI * x);
  }

  /** Dirichlet periodic sinc: sin(M*w/2) / sin(w/2) */
  function dirichlet(w, M) {
    const half = w * 0.5;
    const s = Math.sin(half);
    if (Math.abs(s) < 1e-7) {
      const k = Math.round(half / Math.PI);
      const sign = ((M - 1) * k) % 2 === 0 ? 1 : -1;
      return sign * M;
    }
    return Math.sin(M * half) / s;
  }

  function rect(t, width = 1) {
    const a = Math.abs(t);
    const hw = width * 0.5;
    if (a < hw - 1e-9) return 1;
    if (Math.abs(a - hw) <= 1e-9) return 0.5;
    return 0;
  }

  function tri(t, halfBase = 1) {
    const u = Math.abs(t) / Math.max(halfBase, 1e-6);
    return u < 1 ? 1 - u : 0;
  }

  function uStep(t) {
    if (t > 1e-9) return 1;
    if (t < -1e-9) return 0;
    return 0.5;
  }

  /**
   * Accurate Sine Integral Si(x) = integral_0^x sin(t)/t dt
   * Used for Ideal Lowpass Filter step response s(t) = 0.5 + Si(wc*t)/pi
   */
  function siIntegral(x) {
    if (x === 0) return 0;
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    if (ax <= 4.0) {
      let sum = ax;
      let term = ax;
      const x2 = ax * ax;
      for (let k = 1; k <= 18; k++) {
        term *= -x2 / ((2 * k) * (2 * k + 1));
        sum += term / (2 * k + 1);
      }
      return sign * sum;
    }
    // Rational asymptotic approximation for x > 4
    const x2 = ax * ax;
    const f = (1 + 7.444370681619367e2 / x2 + 1.963963728951468e5 / (x2 * x2) + 2.377503101254318e7 / (x2 * x2 * x2)) /
              (ax * (1 + 7.464370681619276e2 / x2 + 1.978652470315839e5 / (x2 * x2) + 2.415356701651268e7 / (x2 * x2 * x2) + 4.746505089135e7 / (x2 * x2 * x2 * x2)));
    const g = (1 + 8.135952011516861e2 / x2 + 2.352391816264782e5 / (x2 * x2) + 3.125575707957787e7 / (x2 * x2 * x2)) /
              (x2 * (1 + 8.195952011514515e2 / x2 + 2.400367528355787e5 / (x2 * x2) + 3.260266616470908e7 / (x2 * x2 * x2) + 7.0646727789e7 / (x2 * x2 * x2 * x2)));
    const res = Math.PI * 0.5 - f * Math.cos(ax) - g * Math.sin(ax);
    return sign * res;
  }

  /* ==================== Numerical Transforms & Convolution ==================== */
  function linspace(min, max, n) {
    const arr = new Float64Array(n);
    if (n <= 1) {
      arr[0] = min;
      return arr;
    }
    const step = (max - min) / (n - 1);
    for (let i = 0; i < n; i++) arr[i] = min + i * step;
    return arr;
  }

  /**
   * Numerical CTFT via Simpson/Trapezoidal quadrature:
   * X(jw) = integral x(t) e^{-jwt} dt
   */
  function computeCTFT(tArr, xArr, wArr) {
    const nt = tArr.length;
    const nw = wArr.length;
    const dt = nt > 1 ? (tArr[nt - 1] - tArr[0]) / (nt - 1) : 0.01;
    const re = new Float64Array(nw);
    const im = new Float64Array(nw);
    const mag = new Float64Array(nw);
    const phase = new Float64Array(nw);

    for (let k = 0; k < nw; k++) {
      const w = wArr[k];
      let sr = 0;
      let si = 0;
      for (let i = 0; i < nt; i++) {
        const wt = w * tArr[i];
        const weight = (i === 0 || i === nt - 1) ? 0.5 : 1.0;
        const xv = xArr[i] * weight;
        sr += xv * Math.cos(wt);
        si -= xv * Math.sin(wt);
      }
      sr *= dt;
      si *= dt;
      re[k] = sr;
      im[k] = si;
      mag[k] = Math.hypot(sr, si);
      phase[k] = mag[k] > 1e-5 ? Math.atan2(si, sr) : 0;
    }
    return { re, im, mag, phase };
  }

  /**
   * Exact DTFT evaluation: X(e^{jw}) = sum_{n} x[n] e^{-jwn}
   */
  function computeDTFT(nArr, xArr, wArr) {
    const nn = nArr.length;
    const nw = wArr.length;
    const re = new Float64Array(nw);
    const im = new Float64Array(nw);
    const mag = new Float64Array(nw);
    const phase = new Float64Array(nw);

    for (let k = 0; k < nw; k++) {
      const w = wArr[k];
      let sr = 0;
      let si = 0;
      for (let i = 0; i < nn; i++) {
        const wn = w * nArr[i];
        const xv = xArr[i];
        sr += xv * Math.cos(wn);
        si -= xv * Math.sin(wn);
      }
      re[k] = sr;
      im[k] = si;
      mag[k] = Math.hypot(sr, si);
      phase[k] = mag[k] > 1e-5 ? Math.atan2(si, sr) : 0;
    }
    return { re, im, mag, phase };
  }

  /**
   * Exact DTFS coefficients for period N sequence x[0..N-1]:
   * a_k = (1/N) sum_{n=0}^{N-1} x[n] e^{-j 2*pi*k*n / N}
   */
  function computeDTFS(xPeriod) {
    const N = xPeriod.length;
    const ak = [];
    for (let k = 0; k < N; k++) {
      let sr = 0;
      let si = 0;
      for (let n = 0; n < N; n++) {
        const ang = (TWO_PI * k * n) / N;
        sr += xPeriod[n] * Math.cos(ang);
        si -= xPeriod[n] * Math.sin(ang);
      }
      sr /= N;
      si /= N;
      ak.push({
        k,
        re: sr,
        im: si,
        mag: Math.hypot(sr, si),
        phase: Math.hypot(sr, si) > 1e-6 ? Math.atan2(si, sr) : 0
      });
    }
    return ak;
  }

  /* ==================== Analog Filter Pole Generators ==================== */
  /**
   * Causal LHP Butterworth poles for cutoff wc and order N
   */
  function butterworthPoles(N, wc = 1) {
    const poles = [];
    for (let k = 1; k <= N; k++) {
      const theta = (Math.PI * (2 * k + N - 1)) / (2 * N);
      poles.push({ re: wc * Math.cos(theta), im: wc * Math.sin(theta) });
    }
    return poles;
  }

  /**
   * Causal LHP Chebyshev Type I poles for cutoff wc, order N, ripple eps
   */
  function chebyshevPoles(N, wc = 1, eps = 0.5) {
    const poles = [];
    const beta = Math.asinh(1 / Math.max(eps, 0.05)) / N;
    const sh = Math.sinh(beta);
    const ch = Math.cosh(beta);
    for (let k = 1; k <= N; k++) {
      const phi = (Math.PI * (2 * k - 1)) / (2 * N);
      poles.push({
        re: -wc * sh * Math.sin(phi),
        im: wc * ch * Math.cos(phi)
      });
    }
    return poles;
  }

  /**
   * Second-order CT unit step response s(t) for natural freq wn and damping zeta (t >= 0)
   */
  function secondOrderStepCT(t, wn, zeta) {
    if (t < 0) return 0;
    if (Math.abs(zeta - 1) < 1e-4) {
      // Critically damped
      return 1 - (1 + wn * t) * Math.exp(-wn * t);
    }
    if (zeta < 1) {
      // Underdamped
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      const phi = Math.acos(zeta);
      return 1 - (Math.exp(-zeta * wn * t) / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t + phi);
    }
    // Overdamped
    const sq = Math.sqrt(zeta * zeta - 1);
    const p1 = wn * (zeta - sq);
    const p2 = wn * (zeta + sq);
    return 1 - (p2 * Math.exp(-p1 * t) - p1 * Math.exp(-p2 * t)) / (p2 - p1);
  }

  /**
   * Second-order CT unit impulse response h(t)
   */
  function secondOrderImpulseCT(t, wn, zeta) {
    if (t < 0) return 0;
    if (Math.abs(zeta - 1) < 1e-4) {
      return wn * wn * t * Math.exp(-wn * t);
    }
    if (zeta < 1) {
      const wd = wn * Math.sqrt(1 - zeta * zeta);
      return (wn / Math.sqrt(1 - zeta * zeta)) * Math.exp(-zeta * wn * t) * Math.sin(wd * t);
    }
    const sq = Math.sqrt(zeta * zeta - 1);
    return (wn / (2 * sq)) * (Math.exp(-wn * (zeta - sq) * t) - Math.exp(-wn * (zeta + sq) * t));
  }

  /* ==================== Colormaps & Formatting ==================== */
  /**
   * Scientific plasma-cyan-amber colormap for normalized u in [0, 1]
   */
  function colormap(u, alpha = 0.85) {
    const t = Math.max(0, Math.min(1, u));
    let r, g, b;
    if (t < 0.35) {
      const k = t / 0.35;
      r = Math.round(18 + 20 * k);
      g = Math.round(62 + 128 * k);
      b = Math.round(138 + 102 * k);
    } else if (t < 0.7) {
      const k = (t - 0.35) / 0.35;
      r = Math.round(38 + 200 * k);
      g = Math.round(190 + 28 * k);
      b = Math.round(240 - 150 * k);
    } else {
      const k = (t - 0.7) / 0.3;
      r = Math.round(238 + 17 * k);
      g = Math.round(218 - 115 * k);
      b = Math.round(90 + 30 * k);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function phaseColor(rad, alpha = 0.9) {
    const deg = (((rad * 180) / Math.PI) % 360 + 360) % 360;
    return `hsla(${deg.toFixed(0)}, 86%, 62%, ${alpha})`;
  }

  function fmt(val, digits = 2) {
    if (!Number.isFinite(val)) return '∞';
    if (Math.abs(val) < 1e-9) return (0).toFixed(digits);
    return Number(val).toFixed(digits);
  }

  SigSys.registerChapter = function (chapter) {
    SigSys.chapters.push(chapter);
    if (Array.isArray(chapter.cases)) {
      for (const c of chapter.cases) {
        c.chapterId = chapter.id;
        c.chapterTitle = chapter.title;
        SigSys.casesById[c.id] = c;
      }
    }
  };

  SigSys.Math = {
    TWO_PI,
    EPS,
    cplx,
    cAdd,
    cSub,
    cMul,
    cDiv,
    cExp,
    cAbs,
    cArg,
    evalZeroPole,
    sa,
    sinc,
    dirichlet,
    rect,
    tri,
    uStep,
    siIntegral,
    linspace,
    computeCTFT,
    computeDTFT,
    computeDTFS,
    butterworthPoles,
    chebyshevPoles,
    secondOrderStepCT,
    secondOrderImpulseCT,
    colormap,
    phaseColor,
    fmt
  };
})();
