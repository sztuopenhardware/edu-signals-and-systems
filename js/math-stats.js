/**
 * 《概率论与数理统计》3D 交互式教学仿真平台
 * 核心数理统计计算与随机数生成引擎 (Math & Statistics Engine)
 */
window.ProbLab = window.ProbLab || {};

(function () {
  'use strict';

  const SQRT2 = Math.SQRT2;
  const SQRT2PI = Math.sqrt(2 * Math.PI);

  // Lanczos approximation for ln(Gamma(z))
  function lnGamma(z) {
    if (z <= 0) return Infinity;
    const g = 7;
    const p = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    }
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
      x += p[i] / (z + i);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  function gamma(z) {
    return Math.exp(lnGamma(z));
  }

  function lnChoose(n, k) {
    if (k < 0 || k > n) return -Infinity;
    if (k === 0 || k === n) return 0;
    return lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1);
  }

  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    return Math.round(Math.exp(lnChoose(n, k)));
  }

  // Error function erf(x) - Abramowitz & Stegun 7.1.26
  function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    const ax = Math.abs(x);
    const t = 1.0 / (1.0 + 0.3275911 * ax);
    const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
    return sign * y;
  }

  // Normal distribution
  function normalPDF(x, mu = 0, sigma = 1) {
    if (sigma <= 0) return 0;
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * SQRT2PI);
  }

  function normalCDF(x, mu = 0, sigma = 1) {
    if (sigma <= 0) return x >= mu ? 1 : 0;
    return 0.5 * (1 + erf((x - mu) / (sigma * SQRT2)));
  }

  // Acklam's inverse standard normal CDF: P(Z <= z) = p
  function normalInv(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;

    const a = [
      -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
      1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00
    ];
    const b = [
      -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
      6.680131188771972e+01, -1.328068155288572e+01
    ];
    const c = [
      -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
      -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00
    ];
    const d = [
      7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
      3.754408661907416e+00
    ];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    let q, r;

    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
             ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
              ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
  }

  // Bivariate Normal PDF
  function bivariateNormalPDF(x, y, mu1 = 0, mu2 = 0, s1 = 1, s2 = 1, rho = 0) {
    const r2 = Math.min(0.9999, rho * rho);
    const z1 = (x - mu1) / s1;
    const z2 = (y - mu2) / s2;
    const q = (z1 * z1 - 2 * rho * z1 * z2 + z2 * z2) / (2 * (1 - r2));
    return Math.exp(-q) / (2 * Math.PI * s1 * s2 * Math.sqrt(1 - r2));
  }

  // Discrete PMFs
  function binomialPMF(k, n, p) {
    if (k < 0 || k > n) return 0;
    if (p <= 0) return k === 0 ? 1 : 0;
    if (p >= 1) return k === n ? 1 : 0;
    return Math.exp(lnChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  }

  function poissonPMF(k, lambda) {
    if (k < 0 || lambda < 0) return 0;
    if (lambda === 0) return k === 0 ? 1 : 0;
    return Math.exp(k * Math.log(lambda) - lambda - lnGamma(k + 1));
  }

  function geometricPMF(k, p) {
    if (k < 1 || p <= 0 || p > 1) return 0;
    return p * Math.pow(1 - p, k - 1);
  }

  function hypergeometricPMF(k, N, M, n) {
    if (k < Math.max(0, n - (N - M)) || k > Math.min(n, M)) return 0;
    return Math.exp(lnChoose(M, k) + lnChoose(N - M, n - k) - lnChoose(N, n));
  }

  // Exponential & Uniform
  function expPDF(x, lambda = 1) {
    return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
  }

  function expCDF(x, lambda = 1) {
    return x < 0 ? 0 : 1 - Math.exp(-lambda * x);
  }

  function uniformPDF(x, a = 0, b = 1) {
    return (x >= a && x <= b && b > a) ? 1 / (b - a) : 0;
  }

  function uniformCDF(x, a = 0, b = 1) {
    if (x < a) return 0;
    if (x > b) return 1;
    return (x - a) / (b - a);
  }

  // Regularized Incomplete Gamma P(a, x)
  function gammaincP(a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a;
      let sum = 1.0 / a;
      let del = sum;
      for (let n = 1; n <= 200; n++) {
        ap += 1;
        del *= x / ap;
        sum += del;
        if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
      }
      return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
    } else {
      let b = x + 1 - a;
      let c = 1 / 1e-30;
      let d = 1 / b;
      let h = d;
      for (let i = 1; i <= 200; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        c = b + an / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        d = 1 / d;
        const del = d * c;
        h *= del;
        if (Math.abs(del - 1.0) < 1e-12) break;
      }
      return 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
    }
  }

  // Regularized Incomplete Beta I_x(a, b)
  function betacf(a, b, x) {
    const MAXIT = 200;
    const EPS = 3e-12;
    const FPMIN = 1e-30;
    const qab = a + b;
    const qap = a + 1.0;
    const qam = a - 1.0;
    let c = 1.0;
    let d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1.0 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1.0 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1.0 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1.0 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1.0 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < EPS) break;
    }
    return h;
  }

  function betainc(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) {
      return bt * betacf(a, b, x) / a;
    } else {
      return 1 - bt * betacf(b, a, 1 - x) / b;
    }
  }

  // Three Major Sampling Distributions: Chi-Square, Student's t, Snedecor's F
  function chi2PDF(x, df) {
    if (x <= 0 || df <= 0) return 0;
    const k2 = 0.5 * df;
    return Math.exp((k2 - 1) * Math.log(x) - 0.5 * x - k2 * Math.LN2 - lnGamma(k2));
  }

  function chi2CDF(x, df) {
    if (x <= 0) return 0;
    return gammaincP(0.5 * df, 0.5 * x);
  }

  function chi2Inv(p, df) {
    if (p <= 0) return 0;
    if (p >= 1) return Infinity;
    // Wilson-Hilferty initial guess
    const z = normalInv(p);
    const w = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df));
    let x = Math.max(0.001, df * Math.pow(Math.max(0.05, w), 3));
    let lo = 0, hi = Math.max(df * 10 + 50, x * 4);
    while (chi2CDF(hi, df) < p) hi *= 2;
    for (let i = 0; i < 45; i++) {
      const f = chi2CDF(x, df) - p;
      if (Math.abs(f) < 1e-9) break;
      if (f < 0) lo = x; else hi = x;
      const dfx = chi2PDF(x, df);
      const next = dfx > 1e-14 ? x - f / dfx : 0.5 * (lo + hi);
      x = (next > lo && next < hi) ? next : 0.5 * (lo + hi);
    }
    return x;
  }

  function tPDF(x, df) {
    const v = df;
    return Math.exp(lnGamma(0.5 * (v + 1)) - lnGamma(0.5 * v) - 0.5 * Math.log(v * Math.PI) - 0.5 * (v + 1) * Math.log(1 + (x * x) / v));
  }

  function tCDF(x, df) {
    const v = df;
    const ib = betainc(v / (v + x * x), 0.5 * v, 0.5);
    return x >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
  }

  function tInv(p, df) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;
    if (p < 0.5) return -tInv(1 - p, df);
    let x = normalInv(p);
    let lo = 0, hi = Math.max(20, x * 10 + 50);
    while (tCDF(hi, df) < p) hi *= 2;
    for (let i = 0; i < 45; i++) {
      const f = tCDF(x, df) - p;
      if (Math.abs(f) < 1e-9) break;
      if (f < 0) lo = x; else hi = x;
      const dfx = tPDF(x, df);
      const next = dfx > 1e-14 ? x - f / dfx : 0.5 * (lo + hi);
      x = (next > lo && next < hi) ? next : 0.5 * (lo + hi);
    }
    return x;
  }

  function fPDF(x, d1, d2) {
    if (x <= 0) return 0;
    const a = 0.5 * d1, b = 0.5 * d2;
    return Math.exp(
      lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
      a * Math.log(d1 / d2) + (a - 1) * Math.log(x) -
      (a + b) * Math.log(1 + (d1 * x) / d2)
    );
  }

  function fCDF(x, d1, d2) {
    if (x <= 0) return 0;
    return betainc((d1 * x) / (d1 * x + d2), 0.5 * d1, 0.5 * d2);
  }

  function fInv(p, d1, d2) {
    if (p <= 0) return 0;
    if (p >= 1) return Infinity;
    let lo = 0, hi = 20;
    while (fCDF(hi, d1, d2) < p) hi *= 2;
    let x = 1.0;
    for (let i = 0; i < 50; i++) {
      const f = fCDF(x, d1, d2) - p;
      if (Math.abs(f) < 1e-8) break;
      if (f < 0) lo = x; else hi = x;
      const dfx = fPDF(x, d1, d2);
      const next = dfx > 1e-14 ? x - f / dfx : 0.5 * (lo + hi);
      x = (next > lo && next < hi) ? next : 0.5 * (lo + hi);
    }
    return x;
  }

  // Random Variate Generators
  function randNormal(mu = 0, sigma = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mu + sigma * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function randBivariateNormal(mu1 = 0, mu2 = 0, s1 = 1, s2 = 1, rho = 0) {
    const z1 = randNormal(0, 1);
    const z2 = randNormal(0, 1);
    const x = mu1 + s1 * z1;
    const y = mu2 + s2 * (rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2);
    return [x, y];
  }

  function randExp(lambda = 1) {
    let u = 0;
    while (u === 0) u = Math.random();
    return -Math.log(u) / lambda;
  }

  function randBinomial(n, p) {
    let s = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) s++;
    }
    return s;
  }

  function randPoisson(lambda) {
    if (lambda > 30) {
      return Math.max(0, Math.round(randNormal(lambda, Math.sqrt(lambda))));
    }
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  function randGamma(shape, scale = 1) {
    if (shape < 1) {
      let u = 0;
      while (u === 0) u = Math.random();
      return randGamma(1 + shape, scale) * Math.pow(u, 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      let x, v;
      do {
        x = randNormal(0, 1);
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v * scale;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale;
    }
  }

  function randChi2(df) {
    return randGamma(0.5 * df, 2);
  }

  function randT(df) {
    return randNormal(0, 1) / Math.sqrt(randChi2(df) / df);
  }

  function randF(d1, d2) {
    return (randChi2(d1) / d1) / (randChi2(d2) / d2);
  }

  // Sample statistics helper
  function sampleStats(arr) {
    const n = arr.length;
    if (n === 0) return { n: 0, mean: 0, varUnbiased: 0, varMLE: 0, std: 0, min: 0, max: 0, median: 0 };
    let sum = 0;
    for (let i = 0; i < n; i++) sum += arr[i];
    const mean = sum / n;
    let sq = 0;
    for (let i = 0; i < n; i++) {
      const d = arr[i] - mean;
      sq += d * d;
    }
    const varMLE = sq / n;
    const varUnbiased = n > 1 ? sq / (n - 1) : 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const median = n % 2 === 1 ? sorted[(n - 1) >> 1] : 0.5 * (sorted[(n >> 1) - 1] + sorted[n >> 1]);
    return {
      n,
      mean,
      varUnbiased,
      varMLE,
      std: Math.sqrt(varUnbiased),
      min: sorted[0],
      max: sorted[n - 1],
      median,
      sorted
    };
  }

  window.ProbLab.MathStats = {
    lnGamma, gamma, lnChoose, choose, erf,
    normalPDF, normalCDF, normalInv, bivariateNormalPDF,
    binomialPMF, poissonPMF, geometricPMF, hypergeometricPMF,
    expPDF, expCDF, uniformPDF, uniformCDF,
    chi2PDF, chi2CDF, chi2Inv,
    tPDF, tCDF, tInv,
    fPDF, fCDF, fInv,
    randNormal, randBivariateNormal, randExp, randBinomial, randPoisson,
    randGamma, randChi2, randT, randF,
    sampleStats
  };
})();
