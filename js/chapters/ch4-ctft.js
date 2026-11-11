/**
 * 第 4 章：连续时间傅里叶变换 (Chapter 4) — 6 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 4 章全部 7 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch4',
    number: '第 4 章',
    title: '第 4 章：连续时间傅里叶变换',
    shortTitle: 'Ch4 连续时间傅里叶变换',
    weeks: '第 7–8 周 · 4 学时',
    syllabusItems: 'CTFT定义与包络导出、周期信号FT、CTFT性质与变换对、卷积性质、相乘调制性质、微分方程系统频域分析',
    cases: [
      /* ==================== 4.1 ==================== */
      {
        id: '4.1',
        code: 'Ch4-(1)',
        level: '掌握',
        title: '4.1 从周期到非周期：CTFT 导出与三维频谱加密极限 (T → ∞)',
        summary: '固定矩形脉宽 τ 不变，随周期 T 增大到 ∞，观察离散谱线 T·a_k 间距 ω₀=2π/T 加密融合为连续 Sa(ωτ/2) 频谱密度！',
        presets: [
          { label: '短周期 T = 3s (稀疏离散谱线)', values: { T: 3.0, tau: 1.0 } },
          { label: '中周期 T = 8s (谱线明显加密贴合包络)', values: { T: 8.0, tau: 1.0 } },
          { label: '长周期 T = 18s (逼近非周期连续频谱!)', values: { T: 18.0, tau: 1.0 } },
          { label: '窄脉宽 τ = 0.5s (主瓣展宽 4π/τ)', values: { T: 12.0, tau: 0.5 } }
        ],
        controls: [
          { key: 'T', label: '周期信号重复周期 T (越大越逼近非周期!)', type: 'range', min: 2.5, max: 20.0, step: 0.5, default: 8.0, unit: 's' },
          { key: 'tau', label: '单个矩形脉冲宽度 τ', type: 'range', min: 0.4, max: 2.0, step: 0.1, default: 1.0, unit: 's' }
        ],
        theory: {
          formula: 'X(jω) = ∫_{-∞}^{+∞} x(t)e^{-jωt}dt = lim_{T→∞} (T · a_k)|_{kω₀=ω},   x(t) = (1/2π) ∫_{-∞}^{+∞} X(jω)e^{jωt}dω',
          objectives: [
            '【掌握】连续时间傅里叶变换（CTFT）与逆变换的定义，非周期门函数频谱 X(jω) = τ·Sa(ωτ/2) 及其第一零点频谱宽度 2π/τ；',
            '【理解】周期信号谱线幅度 a_k 虽随 T→∞ 趋于 0，但“频谱密度包络 T·a_k”保持形状不变并收敛为连续谱 X(jω)！'
          ],
          guide3d: '三维空间将时域与频域正交布置：前排青色为周期 T 的矩形脉冲串（随 T 增大两侧脉冲远离原点，退化为孤立脉冲），后排黄色针状图为离散样值 T·a_k，绿色发光带即为非周期连续频谱包络 X(jω) = τ·Sa(ωτ/2)！'
        },
        matlab(p) {
          return `% Ch4.1 周期矩形波随周期 T -> inf 向非周期连续傅里叶变换 X(jw) 的过渡
tau = ${M.fmt(p.tau, 2)}; T = ${M.fmt(p.T, 2)}; w0 = 2*pi/T;
w = -20:0.05:20;
X_env = tau * sinc(w * tau / (2*pi)); % MATLAB sinc(x) = sin(pi*x)/(pi*x)
k = floor(-20/w0) : ceil(20/w0);
wk = k * w0;
T_ak = tau * sinc(wk * tau / (2*pi));
plot(w, X_env, 'g', 'LineWidth', 2.2); hold on;
stem(wk, T_ak, 'y', 'filled', 'MarkerSize', 4); grid on;
title(sprintf('T = %.1fs (谱线间隔 \\omega_0 = %.3f rad/s), 主瓣零点 \\pm%.2f rad/s', T, w0, 2*pi/tau));`;
        },
        quiz: {
          question: '宽度为 τ、幅度为 E 的非周期矩形门脉冲 x(t) = E·rect(t/τ)，其傅里叶变换 X(jω) 的过零点主瓣半宽度（即第一个零点正频率 ω₁）为：',
          options: ['ω₁ = 2π / τ（脉宽 τ 越窄，频谱宽度越宽！）', 'ω₁ = π / τ', 'ω₁ = 1 / τ', 'ω₁ = 2π · τ'],
          answer: 0,
          explanation: 'X(jω) = Eτ·Sa(ωτ/2)，令 ωτ/2 = π 解得第一过零点角频率 ω₁ = 2π/τ（对应频率 f₁ = 1/τ Hz），完美体现时域压缩则频域展宽的反比规律！'
        },
        compute(p) {
          const w0 = M.TWO_PI / p.T;
          const ws = M.linspace(-18, 18, 320);
          const env3 = [], env2d = [];
          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const v = p.tau * M.sa((w * p.tau) * 0.5);
            env3.push([w * (6 / 18), 0.9, v]);
            env2d.push([w, v]);
          }

          const stems3 = [], stems2d = [];
          const kMax = Math.floor(18 / w0);
          for (let k = -kMax; k <= kMax; k++) {
            const wk = k * w0;
            const tak = p.tau * M.sa((wk * p.tau) * 0.5);
            stems3.push([wk * (6 / 18), 0.9, tak]);
            stems2d.push([wk, tak]);
          }

          // Time-domain pulse train on front track
          const ts = M.linspace(-6, 6, 360);
          const timeCurve = [], time2d = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const modT = t - Math.round(t / p.T) * p.T;
            const xv = Math.abs(modT) <= p.tau * 0.5 ? 1.0 : 0.0;
            timeCurve.push([t, -1.0, xv]);
            time2d.push([t, xv]);
          }

          return {
            scene: {
              axes: {
                x: { min: -6, max: 6, label: '时间 t (s)  /  缩放角频率轴 ω' },
                y: { min: -1.6, max: 1.6, label: '时域与频域层', ticks: [-1.0, 0.9], format: (v) => (v < 0 ? '时域x_T(t)' : '频域T·a_k→X(jω)') },
                z: { min: -0.6, max: Math.max(1.4, p.tau * 1.15), label: '幅值 / 频谱密度' }
              },
              ribbons: [
                { points: env3, baseZ: 0, color: 'rgba(52,211,153,0.18)' },
                { points: timeCurve, baseZ: 0, color: 'rgba(56,189,248,0.2)' }
              ],
              curves: [
                { points: timeCurve, color: '#38bdf8', width: 2.6, glow: true, label: '时域脉冲 x_T(t)' },
                { points: env3, color: '#34d399', width: 3.0, glow: true, label: '连续包络 X(jω)=τSa(ωτ/2)' }
              ],
              stems: [
                { points: stems3, baseZ: 0, color: '#fbbf24', width: 1.7, radius: p.T > 12 ? 2.4 : 3.5, label: '离散谱样值 T·a_k' }
              ],
              legend: [
                { color: '#38bdf8', label: `时域脉冲串 (T=${M.fmt(p.T, 1)}s, τ=${M.fmt(p.tau, 1)}s)` },
                { color: '#fbbf24', label: `加密谱线 T·a_k (Δω=${M.fmt(w0, 2)})` },
                { color: '#34d399', label: '极限连续谱 X(jω)=τ·Sa(ωτ/2)' }
              ]
            },
            plots2d: [
              { title: '时域波形 x_T(t) (随 T→∞ 相邻脉冲移出视野，剩单个门函数)', xMin: -6, xMax: 6, yMin: -0.1, yMax: 1.3, xLabel: 't(s)', series: [{ points: time2d, color: '#38bdf8', fill: 'rgba(56,189,248,0.18)', width: 2.1 }] },
              {
                title: `频域过渡：离散谱 T·a_k [黄针] → 连续傅里叶变换 X(jω) [绿线]`,
                xMin: -18, xMax: 18, yMin: -0.5, yMax: Math.max(1.3, p.tau * 1.15), xLabel: 'ω(rad/s)',
                series: [
                  { points: env2d, color: '#34d399', width: 2.3 },
                  { points: stems2d, type: 'stems', color: '#fbbf24', radius: 2.3 }
                ]
              }
            ],
            metrics: [
              { label: '谱线间隔 ω₀ = 2π/T', value: `${M.fmt(w0, 3)} rad/s`, status: 'ok' },
              { label: '直流峰值 X(j0) = τ', value: M.fmt(p.tau, 2) },
              { label: '第一零点带宽 2π/τ', value: `${M.fmt(M.TWO_PI / p.tau, 2)} rad/s` },
              { label: '主瓣内包含谐波数', value: `${2 * Math.floor(p.T / p.tau) + 1} 根` }
            ]
          };
        }
      },

      /* ==================== 4.2 ==================== */
      {
        id: '4.2',
        code: 'Ch4-(2)',
        level: '掌握',
        title: '4.2 周期信号的傅里叶变换：频域冲激串统一表示',
        summary: '引入冲激函数后，周期信号亦纳入 CTFT 框架：X(jω) = ∑ 2π·a_k·δ(ω - kω₀)，打通周期与非周期频谱！',
        presets: [
          { label: '余弦信号 cos(ω₀t) ↔ π[δ(ω-ω₀)+δ(ω+ω₀)]', values: { sig: 'cos', w0: 2.5 } },
          { label: '正弦信号 sin(ω₀t) ↔ (π/j)[δ(ω-ω₀)-δ(ω+ω₀)]', values: { sig: 'sin', w0: 2.5 } },
          { label: '周期单位冲激串 δ_T(t) ↔ ω₀·∑δ(ω-kω₀)', values: { sig: 'comb', w0: 2.2 } },
          { label: '周期对称方波 ↔ ∑ (4/k)δ(ω-kω₀) (奇次)', values: { sig: 'square', w0: 1.8 } }
        ],
        controls: [
          {
            key: 'sig', label: '典型周期信号', type: 'select', default: 'cos',
            options: [
              { value: 'cos', label: '余弦波 cos(ω₀t)  ↔  πδ(ω-ω₀) + πδ(ω+ω₀)' },
              { value: 'sin', label: '正弦波 sin(ω₀t)  ↔  -jπδ(ω-ω₀) + jπδ(ω+ω₀)' },
              { value: 'comb', label: '周期冲激串 ∑δ(t-nT)  ↔  ω₀∑δ(ω-kω₀)  [采样定理基石!]' },
              { value: 'square', label: '对称周期方波  ↔  ∑_{奇k} (2πa_k)δ(ω-kω₀)' }
            ]
          },
          { key: 'w0', label: '基波角频率 ω₀ (= 2π/T)', type: 'range', min: 1.2, max: 4.0, step: 0.2, default: 2.4, unit: 'rad/s' }
        ],
        theory: {
          formula: 'x(t) = ∑_{k=-∞}^{+∞} a_k e^{jkω₀t}   ◄──CTFT──►   X(jω) = ∑_{k=-∞}^{+∞} 2π a_k δ(ω - kω₀)',
          objectives: [
            '【掌握】典型周期信号（正余弦、复指数、周期冲激串、周期方波）的连续时间傅里叶变换公式与冲激谱图；',
            '【理解】周期冲激串的傅里叶变换仍是周期冲激串（时域周期 T 越短，频域冲激间距 ω₀=2π/T 越宽！）。'
          ],
          guide3d: '三维空间将频域冲激串绘制在复频谱空间 (ω, Re, Im) 中：余弦波对应实平面两根正向冲激箭头 π；正弦波对应虚平面一正一负两根冲激箭头 ±jπ；周期冲激串对应等高冲激阵列 ω₀！'
        },
        matlab(p) {
          return `% Ch4.2 典型周期信号的连续时间傅里叶变换 (频域冲激强度 2*pi*a_k)
w0 = ${M.fmt(p.w0, 2)}; T = 2*pi/w0;
${p.sig === 'cos' ? 'wk = [-w0, w0]; weights = [pi, pi]; % cos(w0*t)' :
  p.sig === 'sin' ? 'wk = [-w0, w0]; weights = [1j*pi, -1j*pi]; % sin(w0*t)' :
  p.sig === 'comb' ? 'k = -4:4; wk = k*w0; weights = w0 * ones(size(k)); % 周期冲激串' :
  'k = [-5 -3 -1 1 3 5]; wk = k*w0; weights = -1j * 4 ./ k; % 周期奇谐方波'}
stem3(wk, real(weights), imag(weights), '^', 'filled', 'LineWidth', 2); grid on;
xlabel('角频率 \omega'); ylabel('实部冲激强度'); zlabel('虚部冲激强度');`;
        },
        quiz: {
          question: '单位周期冲激串 δ_T(t) = ∑_{n=-∞}^{+∞} δ(t - nT) 的连续时间傅里叶变换为：',
          options: [
            '(2π / T) ∑_{k=-∞}^{+∞} δ(ω - k·2π/T)',
            'T ∑_{k=-∞}^{+∞} δ(ω - k·2π/T)',
            '∑_{k=-∞}^{+∞} δ(ω - kT)',
            '2π δ(ω)'
          ],
          answer: 0,
          explanation: '周期冲激串的傅里叶级数系数恒为 a_k = 1/T，代入 X(jω) = 2π ∑ a_k δ(ω - kω₀) 即得 (2π/T) ∑ δ(ω - kω₀)，这是第 7 章采样定理推导的最关键公式！'
        },
        compute(p) {
          const T = M.TWO_PI / p.w0;
          const ts = M.linspace(-5, 5, 300);
          const timeCurve = [];
          const timeImpulses = [];
          const specImpulses = [];
          const p2dTime = [], p2dSpec = [];

          if (p.sig === 'comb') {
            const nMax = Math.floor(5 / T);
            for (let n = -nMax; n <= nMax; n++) {
              timeImpulses.push([n * T, -1.2, 1.5]);
              p2dTime.push([n * T, 1.0]);
            }
          } else {
            for (let i = 0; i < ts.length; i++) {
              const t = ts[i];
              const v = p.sig === 'cos' ? Math.cos(p.w0 * t) : p.sig === 'sin' ? Math.sin(p.w0 * t) : Math.sin(p.w0 * t) >= 0 ? 1 : -1;
              timeCurve.push([t, -1.2, v * 1.2]);
              p2dTime.push([t, v]);
            }
          }

          if (p.sig === 'cos') {
            specImpulses.push([-p.w0 * 0.5, 0.9, Math.PI], [p.w0 * 0.5, 0.9, Math.PI]);
            p2dSpec.push([-p.w0, Math.PI], [p.w0, Math.PI]);
          } else if (p.sig === 'sin') {
            specImpulses.push([-p.w0 * 0.5, 0.9, Math.PI], [p.w0 * 0.5, 0.9, -Math.PI]);
            p2dSpec.push([-p.w0, Math.PI], [p.w0, -Math.PI]);
          } else if (p.sig === 'comb') {
            const kMax = Math.floor(9 / p.w0);
            for (let k = -kMax; k <= kMax; k++) {
              specImpulses.push([k * p.w0 * 0.5, 0.9, p.w0]);
              p2dSpec.push([k * p.w0, p.w0]);
            }
          } else {
            for (let k = -5; k <= 5; k += 2) {
              const wgt = 4 / Math.abs(k); // |2*pi*a_k| = 2*pi*(2/(pi*|k|)) = 4/|k|
              specImpulses.push([k * p.w0 * 0.5, 0.9, k > 0 ? -wgt : wgt]);
              p2dSpec.push([k * p.w0, wgt]);
            }
          }

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '时间 t (s)  /  缩放频率 ω' },
                y: { min: -1.7, max: 1.6, label: '时域 / 频域冲激层', ticks: [-1.2, 0.9], format: (v) => (v < 0 ? '时域x(t)' : '频域X(jω)') },
                z: { min: -4.2, max: 4.5, label: '信号幅值 / 冲激强度 (2πa_k)' }
              },
              curves: timeCurve.length ? [{ points: timeCurve, color: '#38bdf8', width: 2.6, glow: true, label: '周期信号 x(t)' }] : [],
              stems: [
                ...(timeImpulses.length ? [{ points: timeImpulses, baseZ: 0, color: '#38bdf8', width: 2.4, impulse: true, label: '时域冲激串 δ_T(t)' }] : []),
                { points: specImpulses, baseZ: 0, color: '#f43f5e', width: 2.8, impulse: true, label: '频域冲激 2πa_k·δ(ω-kω₀)' }
              ],
              legend: [
                { color: '#38bdf8', label: '时域周期信号 x(t)' },
                { color: '#f43f5e', label: '频域狄拉克冲激串 X(jω) (箭头代表冲激面积)' }
              ]
            },
            plots2d: [
              { title: '时域周期波形 x(t)', xMin: -5, xMax: 5, yMin: -1.4, yMax: 1.4, xLabel: 't', series: [{ points: p2dTime, type: p.sig === 'comb' ? 'stems' : 'line', color: '#38bdf8', width: 2.0 }] },
              { title: '频域冲激强度谱 (2π·a_k)', xMin: -10, xMax: 10, yMin: p.sig === 'sin' ? -3.6 : 0, yMax: 4.4, xLabel: 'ω', series: [{ points: p2dSpec, type: 'stems', color: '#f43f5e' }] }
            ],
            metrics: [
              { label: '基波周期 T = 2π/ω₀', value: `${M.fmt(T, 3)} s`, status: 'ok' },
              { label: '频域冲激间距 ω₀', value: `${M.fmt(p.w0, 2)} rad/s` },
              { label: '单根主冲激面积', value: p.sig === 'comb' ? `ω₀ = ${M.fmt(p.w0, 2)}` : p.sig === 'square' ? '±4 (k=±1)' : 'π ≈ 3.142' },
              { label: '时频间距互反律', value: 'T · ω₀ ≡ 2π (恒定)' }
            ]
          };
        }
      },

      /* ==================== 4.3 ==================== */
      {
        id: '4.3',
        code: 'Ch4-(3)(6)',
        level: '掌握',
        title: '4.3 CTFT 核心性质、时频测不准原理、对偶性与变换对画廊',
        summary: '交互浏览全部常用傅里叶变换对，实时体验“时域压缩 ↔ 频域展宽”、对偶性（门函数 ↔ Sa 函数互换）与时移/频移！',
        presets: [
          { label: '矩形门脉冲 ↔ Sa(ωτ/2)', values: { pair: 'rect', scale: 1.0, tShift: 0 } },
          { label: '对偶变换对：Sa(t) 脉冲 ↔ 频域理想矩形窗!', values: { pair: 'sinc', scale: 1.0, tShift: 0 } },
          { label: '单边指数 e^(-at)u(t) ↔ 1/(a+jω)', values: { pair: 'exp1', scale: 1.0, tShift: 0 } },
          { label: '双边指数 e^(-a|t|) ↔ 2a/(a²+ω²)', values: { pair: 'exp2', scale: 1.0, tShift: 0 } },
          { label: '高斯钟形脉冲 ↔ 高斯频谱 (测不准下界!)', values: { pair: 'gauss', scale: 1.0, tShift: 0 } }
        ],
        controls: [
          {
            key: 'pair', label: '基本傅里叶变换对列表 [大纲4.(6)]', type: 'select', default: 'rect',
            options: [
              { value: 'rect', label: '① 矩形脉冲 rect(t/τ) ↔ τ·Sa(ωτ/2)' },
              { value: 'sinc', label: '② 对偶性质：(W/π)Sa(Wt) ↔ rect(ω/2W) [对偶互换!]' },
              { value: 'tri', label: '③ 三角脉冲 tri(t/τ) ↔ τ·Sa²(ωτ/2)' },
              { value: 'exp1', label: '④ 单边指数 e^(-at)u(t) ↔ 1/(a + jω)' },
              { value: 'exp2', label: '⑤ 双边指数 e^(-a|t|) ↔ 2a/(a² + ω²)' },
              { value: 'gauss', label: '⑥ 高斯脉冲 e^(-t²/2σ²) ↔ √(2π)σ·e^(-σ²ω²/2)' }
            ]
          },
          { key: 'scale', label: '尺度展缩因子 a (x(at) ↔ (1/|a|)X(jω/a))', type: 'range', min: 0.4, max: 2.5, step: 0.1, default: 1.0 },
          { key: 'tShift', label: '时移参数 t₀ (扭转三维复频谱相位)', type: 'range', min: -1.8, max: 1.8, step: 0.1, default: 0.0, unit: 's' }
        ],
        theory: {
          formula: '尺度：x(at) ↔ (1/|a|)X(jω/a)；  对偶性：若 g(t) ↔ G(jω)，则 G(t) ↔ 2π·g(-ω)；  时频带宽积 Δt · Δω ≥ 1/2',
          objectives: [
            '【掌握】连续时间傅里叶变换核心性质（线性、时移、频移、尺度变换、对偶性、时频微分、帕塞瓦尔定理）与常用变换对列表；',
            '【了解】信号频谱宽度与脉冲持续时间成反比的物理意义（海森堡-加博尔时频测不准原理，高斯脉冲取得等号极小值 0.5！）。'
          ],
          guide3d: '三维视图后方展示三维复频谱轨迹 (ω, Re{X}, Im{X})，前方展示时域信号 x(at - t₀)：来回拖动尺度滑块 a，亲眼观察“时域变瘦变窄时，频域立刻变宽变矮”；拖动 t₀ 则观察复频谱像麻花一样螺旋扭转！'
        },
        matlab(p) {
          return `% Ch4.3 CTFT 尺度展缩与对偶性质数值验证
a = ${M.fmt(p.scale, 2)}; t0 = ${M.fmt(p.tShift, 2)};
t = -6:0.01:6; w = -15:0.05:15;
% 以高斯脉冲为例验证海森堡测不准乘积恒为 0.5
x = exp(-((a*(t - t0)).^2)/2);
X = (sqrt(2*pi)/a) * exp(-(w./a).^2 / 2) .* exp(-1j * w * t0);
subplot(2,1,1); plot(t, x, 'b', 'LineWidth', 2); grid on; title('时域信号 x(a(t-t_0))');
subplot(2,1,2); plot(w, abs(X), 'g', w, real(X), '--m', 'LineWidth', 1.8); grid on; title('频谱模 |X(j\omega)| 与实部');`;
        },
        quiz: {
          question: '已知矩形脉冲 rect(t/2)（|t|<1 为 1）的傅里叶变换为 2sin(ω)/ω。利用【对偶性】可直接写出时域信号 x(t) = sin(t)/t 的傅里叶变换 X(jω) 为：',
          options: ['π · rect(ω/2)（即 |ω| < 1 时为 π，|ω| > 1 时为 0）', '2π · rect(ω)', 'rect(ω/2)', '(1/2π) rect(ω/2)'],
          answer: 0,
          explanation: '已知 g(t)=rect(t/2) ↔ G(jω)=2sin(ω)/ω，由对偶性 G(t) ↔ 2π·g(-ω) 得 2sin(t)/t ↔ 2π·rect(-ω/2) = 2π·rect(ω/2)，两边同除以 2 即得 sin(t)/t ↔ π·rect(ω/2)！'
        },
        compute(p) {
          const ts = M.linspace(-5, 5, 300);
          const ws = M.linspace(-14, 14, 300);

          const baseX = (u) => {
            if (p.pair === 'rect') return M.rect(u, 1.6);
            if (p.pair === 'sinc') return (2.5 / Math.PI) * M.sa(2.5 * u);
            if (p.pair === 'tri') return M.tri(u, 1.4);
            if (p.pair === 'exp1') return u >= 0 ? Math.exp(-1.1 * u) : 0;
            if (p.pair === 'exp2') return Math.exp(-1.1 * Math.abs(u));
            return Math.exp(-0.5 * u * u);
          };

          const baseFT = (v) => {
            if (p.pair === 'rect') return { re: 1.6 * M.sa(0.8 * v), im: 0 };
            if (p.pair === 'sinc') return { re: M.rect(v, 5.0), im: 0 };
            if (p.pair === 'tri') { const s = M.sa(0.7 * v); return { re: 1.4 * s * s, im: 0 }; }
            if (p.pair === 'exp1') return M.cDiv({ re: 1, im: 0 }, { re: 1.1, im: v });
            if (p.pair === 'exp2') return { re: 2.2 / (1.21 + v * v), im: 0 };
            return { re: Math.sqrt(M.TWO_PI) * Math.exp(-0.5 * v * v), im: 0 };
          };

          const cTime = [], pTime = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const val = baseX(p.scale * (t - p.tShift));
            cTime.push([t, -1.2, val]);
            pTime.push([t, val]);
          }

          const cSpec3 = [], pSpecMag = [], pSpecPh = [];
          for (let k = 0; k < ws.length; k++) {
            const w = ws[k];
            const b = baseFT(w / p.scale);
            const scaled = { re: b.re / p.scale, im: b.im / p.scale };
            const rot = M.cMul(scaled, M.cExp(0, -w * p.tShift));
            // Map w from [-14,14] into [-5,5] X box, Re into Z, Im into Y offset around +0.7
            cSpec3.push([(w / 14) * 5, 0.7 + rot.im * 0.35, rot.re * 0.55]);
            pSpecMag.push([w, M.cAbs(rot)]);
            pSpecPh.push([w, M.cAbs(rot) > 0.02 ? M.cArg(rot) : 0]);
          }

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '时间 t (s)  /  缩放频率 ω' },
                y: { min: -1.8, max: 1.8, label: '时域层 / 复频谱虚部 Im{X}' },
                z: { min: -0.9, max: 2.2, label: '时域幅值 / 复频谱实部 Re{X}' }
              },
              ribbons: [{ points: cTime, baseZ: 0, color: 'rgba(56,189,248,0.22)' }],
              curves: [
                { points: cTime, color: '#38bdf8', width: 2.9, glow: true, shadowXZ: true, label: '时域波形 x(t)' },
                { points: cSpec3, color: '#34d399', width: 2.9, glow: true, label: '三维复频谱 X(jω)' }
              ],
              legend: [
                { color: '#38bdf8', label: `时域 x(${M.fmt(p.scale, 1)}(t - ${M.fmt(p.tShift, 1)}))` },
                { color: '#34d399', label: '三维复频谱轨迹 (ω, Im{X}, Re{X})' }
              ]
            },
            plots2d: [
              { title: '时域波形 x(t)', xMin: -5, xMax: 5, yMin: -0.4, yMax: 1.3, xLabel: 't(s)', series: [{ points: pTime, color: '#38bdf8', fill: 'rgba(56,189,248,0.16)', width: 2.2 }] },
              {
                title: '幅度谱 |X(jω)| [绿] 与相位谱 ∠X(jω) [黄虚线]',
                xMin: -14, xMax: 14, yMin: -3.2, yMax: 3.6, xLabel: 'ω',
                series: [
                  { points: pSpecMag, color: '#34d399', fill: 'rgba(52,211,153,0.16)', width: 2.3 },
                  { points: pSpecPh, color: '#fbbf24', dashed: true, width: 1.4 }
                ]
              }
            ],
            metrics: [
              { label: '时域有效展宽比例', value: `${M.fmt(1 / p.scale, 2)} ×`, status: 'ok' },
              { label: '频域有效带宽比例', value: `${M.fmt(p.scale, 2)} × (互成反比!)` },
              { label: '时宽×带宽乘积', value: p.pair === 'gauss' ? 'Δt·Δω = 0.500 (理论极小下界!)' : '恒定不变 (尺度守恒)' },
              { label: '零频面积 X(j0)=∫xdt', value: M.fmt(pSpecMag[Math.floor(ws.length / 2)][1], 3) }
            ]
          };
        }
      },

      /* ==================== 4.4 ==================== */
      {
        id: '4.4',
        code: 'Ch4-(4)',
        level: '掌握',
        title: '4.4 卷积性质：时域复杂卷积积分 ↔ 频域代数逐点相乘',
        summary: '三维双域对照桥梁：时域繁琐的滑动卷积 y(t)=x(t)*h(t)，在频域化繁为简为直观乘积 Y(jω)=X(jω)·H(jω)！',
        presets: [
          { label: '混频含噪信号经理想低通去噪', values: { wc: 3.2, wNoise: 7.5 } },
          { label: '截止过低导致有用信号一并衰减 (ωc=1.0)', values: { wc: 1.0, wNoise: 7.5 } },
          { label: '截止过高未能滤除干扰 (ωc=9.5)', values: { wc: 9.5, wNoise: 6.5 } }
        ],
        controls: [
          { key: 'wc', label: '低通系统截止频率 ω_c', type: 'range', min: 0.8, max: 10.0, step: 0.2, default: 3.2, unit: 'rad/s' },
          { key: 'wNoise', label: '高频干扰载波频率 ω_noise', type: 'range', min: 4.5, max: 11.0, step: 0.5, default: 7.5, unit: 'rad/s' }
        ],
        theory: {
          formula: 'y(t) = x(t) * h(t)   ◄──CTFT──►   Y(jω) = X(jω) · H(jω)   （幅度相乘 |Y|=|X||H|，相位相加 ∠Y=∠X+∠H）',
          objectives: [
            '【掌握】傅里叶变换卷积性质的推导、物理意义及其在滤波与系统响应求解中的核心作用；',
            '【理解】为什么工程上总是将微分/积分卷积转换到频域变成代数乘积来设计与分析滤波器。'
          ],
          guide3d: '三维空间展示频域选频乘法全链条：后排蓝色为含高频干扰双峰的输入频谱 |X(jω)|，中间琥珀色门窗为系统频率响应 |H(jω)|，前排绿色为逐点相乘结果 |Y(jω)|=|X|·|H|——将 ω_c 调在有用信号与干扰峰之间，干扰瞬间清零！'
        },
        matlab(p) {
          return `% Ch4.4 卷积性质验证：时域 conv(x,h) 等价于频域 X(jw).*H(jw)
dt = 0.02; t = -6:dt:6; wc = ${M.fmt(p.wc, 2)}; wn = ${M.fmt(p.wNoise, 2)};
x_clean = exp(-0.8*t.^2);
x = x_clean + 0.45*cos(wn*t).*exp(-0.15*t.^2);
h = (wc/pi) * sinc(wc * t / pi);          % 理想低通冲激响应
y = conv(x, h, 'same') * dt;              % 时域卷积等价于频域乘以矩形门
plot(t, x, 'Color', [0.3 0.7 1]); hold on; plot(t, y, 'g', 'LineWidth', 2.2);
plot(t, x_clean, '--r', 'LineWidth', 1.4); grid on; legend('含噪输入 x(t)', '卷积滤波 y(t)', '纯净原信号');`;
        },
        quiz: {
          question: '已知两个理想低通滤波器的截止频率分别为 ω₁ = 3 rad/s 和 ω₂ = 5 rad/s，将它们级联（时域冲激响应 h₁(t) * h₂(t)），等效总系统的截止频率为：',
          options: ['min(ω₁, ω₂) = 3 rad/s', 'ω₁ + ω₂ = 8 rad/s', 'ω₁ · ω₂ = 15 rad/s', '4 rad/s'],
          answer: 0,
          explanation: '时域级联卷积 h_eq = h₁ * h₂ 对应频域相乘 H_eq(jω) = H₁(jω)·H₂(jω)；两个宽度分别为 3 和 5 的频域矩形门函数相乘，取交集后宽度由较窄者决定，即为 3 rad/s！'
        },
        compute(p) {
          const ts = M.linspace(-5, 5, 240);
          const dt = ts[1] - ts[0];
          const xClean = ts.map((t) => Math.exp(-0.9 * t * t));
          const xArr = ts.map((t, i) => xClean[i] + 0.45 * Math.cos(p.wNoise * t) * Math.exp(-0.15 * t * t));
          const hArr = ts.map((t) => (p.wc / Math.PI) * M.sa(p.wc * t));

          // Convolve in time
          const yArr = new Float64Array(ts.length);
          const half = Math.floor(ts.length / 2);
          for (let i = 0; i < ts.length; i++) {
            let s = 0;
            for (let k = 0; k < ts.length; k++) {
              const hi = i - k + half;
              if (hi >= 0 && hi < ts.length) s += xArr[k] * hArr[hi];
            }
            yArr[i] = s * dt;
          }

          const ws = M.linspace(-12, 12, 220);
          const Xft = M.computeCTFT(ts, xArr, ws);
          const cX = [], cH = [], cY = [];
          const pX = [], pH = [], pY = [];
          for (let k = 0; k < ws.length; k++) {
            const w = ws[k];
            const hw = Math.abs(w) <= p.wc ? 1.0 : 0.0;
            const yw = Xft.mag[k] * hw;
            const xCoord = (w / 12) * 5;
            cX.push([xCoord, 1.2, Xft.mag[k]]);
            cH.push([xCoord, 0, hw * 1.6]);
            cY.push([xCoord, -1.2, yw]);
            pX.push([w, Xft.mag[k]]);
            pH.push([w, hw * 1.6]);
            pY.push([w, yw]);
          }

          let snrErr = 0;
          for (let i = 0; i < ts.length; i++) snrErr += Math.pow(yArr[i] - xClean[i], 2) * dt;

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '归一化角频率 ω (-12 ~ +12 rad/s)', format: (v) => M.fmt((v / 5) * 12, 1) },
                y: { min: -1.8, max: 1.8, label: '频域相乘三阶段', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '|X(jω)|' : v < -0.5 ? '|Y|=|X||H|' : '|H(jω)|') },
                z: { min: 0, max: 2.2, label: '频谱模值' }
              },
              ribbons: [
                { points: cH, baseZ: 0, color: 'rgba(251,191,36,0.18)' },
                { points: cY, baseZ: 0, color: 'rgba(52,211,153,0.28)' }
              ],
              curves: [
                { points: cX, color: '#38bdf8', width: 2.3, label: '含噪输入谱 |X(jω)|' },
                { points: cH, color: '#fbbf24', width: 2.6, label: '滤波器传输窗 |H(jω)|' },
                { points: cY, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '乘积输出谱 |Y(jω)|' }
              ],
              legend: [
                { color: '#38bdf8', label: '输入频谱 |X(jω)|' },
                { color: '#fbbf24', label: `滤波器窗 |H(jω)| (ωc=${M.fmt(p.wc, 1)})` },
                { color: '#34d399', label: '输出谱 |Y|=|X|·|H|' }
              ]
            },
            plots2d: [
              {
                title: '时域卷积效果：含噪输入 x(t) [蓝] → 卷积输出 y(t)=x*h [绿] vs 原纯净波 [红虚]',
                xMin: -5, xMax: 5, yMin: -0.7, yMax: 1.6, xLabel: 't(s)',
                series: [
                  { points: ts.map((t, i) => [t, xArr[i]]), color: '#38bdf8', width: 1.3 },
                  { points: ts.map((t, i) => [t, xClean[i]]), color: '#f43f5e', dashed: true, width: 1.6 },
                  { points: ts.map((t, i) => [t, yArr[i]]), color: '#34d399', width: 2.4 }
                ]
              },
              {
                title: '频域相乘机理：|X(jω)| [蓝] × 门窗 [黄] = |Y(jω)| [绿]',
                xMin: -12, xMax: 12, yMin: 0, yMax: 2.2, xLabel: 'ω',
                series: [
                  { points: pX, color: '#38bdf8', width: 1.6 },
                  { points: pH, color: '#fbbf24', dashed: true, width: 1.8 },
                  { points: pY, color: '#34d399', fill: 'rgba(52,211,153,0.2)', width: 2.3 }
                ]
              }
            ],
            metrics: [
              { label: '基带信号主带宽', value: '≈ 2.5 rad/s', status: 'ok' },
              { label: '高频干扰中心频率', value: `±${M.fmt(p.wNoise, 1)} rad/s` },
              { label: '选频隔离状态', value: p.wc > 2.4 && p.wc < p.wNoise - 1.0 ? '完美滤除干扰保留基带 ✓' : p.wc <= 2.4 ? '过度截断损失基带能量!' : '截止过高残留高频干扰!', status: p.wc > 2.4 && p.wc < p.wNoise - 1.0 ? 'ok' : 'warn' },
              { label: '恢复均方误差 ∫|y-x₀|²dt', value: M.fmt(snrErr, 4) }
            ]
          };
        }
      },

      /* ==================== 4.5 ==================== */
      {
        id: '4.5',
        code: 'Ch4-(5)',
        level: '掌握',
        title: '4.5 相乘（调制）性质：AM 幅度调制频谱搬移与同步相干解调',
        summary: '完整通信链路 3D 仿真：基带信号 m(t) 乘以载波 cos(ω_c t) 将频谱搬移至 ±ω_c，接收端同步混频加低通还原信号！',
        presets: [
          { label: '标准 DSB-SC 同步调幅与零相偏完美解调', values: { wc: 7.0, wm: 2.0, dPhi: 0 } },
          { label: '正交相位失步 Δφ = 90° (正交零点完全哑音!)', values: { wc: 7.0, wm: 2.0, dPhi: 90 } },
          { label: '载波过低 ωc < ωm 导致上下边带混叠失真!', values: { wc: 1.4, wm: 2.4, dPhi: 0 } }
        ],
        controls: [
          { key: 'wc', label: '高频载波角频率 ω_c', type: 'range', min: 1.2, max: 9.5, step: 0.2, default: 7.0, unit: 'rad/s' },
          { key: 'wm', label: '基带消息带宽 ω_m', type: 'range', min: 1.0, max: 3.5, step: 0.2, default: 2.0, unit: 'rad/s' },
          { key: 'dPhi', label: '接收端本地载波相位误差 Δφ', type: 'range', min: 0, max: 90, step: 5, default: 0, unit: '°' }
        ],
        theory: {
          formula: 'm(t)cos(ω_c t) ↔ ½[M(j(ω-ω_c)) + M(j(ω+ω_c))]； 同步混频后低通输出：m_rec(t) = cos(Δφ) · m(t)！',
          objectives: [
            '【掌握】相乘性质 x(t)p(t) ↔ (1/2π) X(jω)*P(jω) 与正弦幅度调制、频分复用（FDM）及同步解调原理（同时覆盖第 6 章掌握目标 4）；',
            '【理解】同步解调必须满足：① ω_c > ω_m（防止边带混叠）；② 本地载波严格同频同相（Δφ=90° 时 cos90°=0 输出完全消失！）。'
          ],
          guide3d: '三维频谱搬移全景：后排蓝色为基带频谱 M(jω)（聚集于零频），中排琥珀色为已调信号频谱 S(jω)（分裂搬移至 ±ω_c），前排紫色为接收端再次乘以 cos(ω_c t+Δφ) 后的三簇频谱（搬回零频 + 搬至 ±2ω_c 被低通滤除）！'
        },
        matlab(p) {
          return `% Ch4.5 相乘(调制)性质：正弦幅度调制与同步相干解调全链路
dt = 0.005; t = -4:dt:4;
wc = ${M.fmt(p.wc, 2)}; wm = ${M.fmt(p.wm, 2)}; dPhi = ${M.fmt((p.dPhi * Math.PI) / 180, 3)};
m = sinc(wm * t / pi);                   % 带宽为 wm 的基带消息信号
s = m .* cos(wc * t);                    % 已调信号 (频谱搬移至 +-wc)
v = 2 * s .* cos(wc * t + dPhi);         % 同步解调乘法器
h_lp = ((wc) / pi) * sinc(wc * t / pi);  % 接收端低通滤波器
m_rec = conv(v, h_lp, 'same') * dt;
plot(t, m, '--b', t, s, 'Color', [1 0.75 0.2], t, m_rec, 'g', 'LineWidth', 1.8);
legend('原基带 m(t)', '已调波 s(t)', sprintf('解调恢复 m_{rec}(t) (cos\\Delta\\phi=%.2f)', cos(dPhi))); grid on;`;
        },
        quiz: {
          question: '在双边带抑制载波调幅（DSB-SC）同步解调接收机中，若本地振荡器与发射载波同频但存在 Δφ = π/2（90°）的相位差，经低通滤波器后的输出信号为：',
          options: ['恒等于 0（正交相消效应！）', '原基带信号 m(t) 延迟 π/2', '0.5 m(t)', '-m(t)'],
          answer: 0,
          explanation: 'm(t)cos(ω_c t)·cos(ω_c t + π/2) = -m(t)cos(ω_c t)sin(ω_c t) = -½ m(t)sin(2ω_c t)，其能量全部位于 ±2ω_c 高频处，零频基带分量为 cos(π/2)=0，经低通滤波后输出恒为 0！'
        },
        compute(p) {
          const radPhi = (p.dPhi * Math.PI) / 180;
          const cosPhi = Math.cos(radPhi);

          // Analytical triangular spectrum M(jw) of sinc^2 pulse for ultra-clean spectral visualization
          const Mspec = (w) => M.tri(w, p.wm);
          const ws = M.linspace(-16, 16, 320);
          const cBase = [], cMod = [], cDemod = [];
          const pModSpec = [];

          for (let k = 0; k < ws.length; k++) {
            const w = ws[k];
            const xMap = (w / 16) * 5;
            const m0 = Mspec(w);
            const sMag = 0.5 * (Mspec(w - p.wc) + Mspec(w + p.wc));
            const vMag = Math.abs(cosPhi) * Mspec(w) + 0.5 * (Mspec(w - 2 * p.wc) + Mspec(w + 2 * p.wc));
            cBase.push([xMap, 1.3, m0]);
            cMod.push([xMap, 0, sMag]);
            cDemod.push([xMap, -1.3, vMag]);
            pModSpec.push([w, sMag]);
          }

          // Time domain signals
          const ts = M.linspace(-4, 4, 320);
          const pBaseT = [], pModT = [], pRecT = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const half = M.sa(0.5 * p.wm * t);
            const mt = half * half;
            const st = mt * Math.cos(p.wc * t);
            const rec = p.wc > p.wm ? mt * cosPhi : mt * cosPhi + 0.35 * Math.cos(2 * p.wc * t) * mt;
            pBaseT.push([t, mt]);
            pModT.push([t, st]);
            pRecT.push([t, rec]);
          }

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '角频率 ω (-16 ~ +16 rad/s)', format: (v) => M.fmt((v / 5) * 16, 0) },
                y: { min: -1.9, max: 1.9, label: '调制解调频谱级联', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? '①基带M(jω)' : v < -0.6 ? '③混频V(jω)' : '②已调S(jω)') },
                z: { min: 0, max: 1.25, label: '归一化幅度谱' }
              },
              ribbons: [
                { points: cBase, baseZ: 0, color: 'rgba(56,189,248,0.2)' },
                { points: cMod, baseZ: 0, color: 'rgba(251,191,36,0.24)' },
                { points: cDemod, baseZ: 0, color: 'rgba(52,211,153,0.25)' }
              ],
              curves: [
                { points: cBase, color: '#38bdf8', width: 2.5, label: '① 原基带频谱 M(jω)' },
                { points: cMod, color: '#fbbf24', width: 2.8, glow: true, label: '② 已调边带 S(jω)' },
                { points: cDemod, color: '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '③ 解调混频谱 V(jω)' }
              ],
              legend: [
                { color: '#38bdf8', label: '① 基带谱 M(jω)' },
                { color: '#fbbf24', label: `② 已调谱搬移至 ±${M.fmt(p.wc, 1)}` },
                { color: '#34d399', label: '③ 同步混频谱 (基带 + ±2ωc)' }
              ]
            },
            plots2d: [
              {
                title: '时域波形：基带包络 m(t) [蓝虚] · 已调波 s(t) [黄] · 解调输出 [绿]',
                xMin: -4, xMax: 4, yMin: -1.1, yMax: 1.2, xLabel: 't(s)',
                series: [
                  { points: pModT, color: 'rgba(251,191,36,0.65)', width: 1.3 },
                  { points: pBaseT, color: '#38bdf8', dashed: true, width: 1.8 },
                  { points: pRecT, color: '#34d399', width: 2.4 }
                ]
              },
              {
                title: '已调信号双边带频谱 |S(jω)| (占宽 2ω_m)',
                xMin: -16, xMax: 16, yMin: 0, yMax: 0.75, xLabel: 'ω',
                series: [{ points: pModSpec, color: '#fbbf24', fill: 'rgba(251,191,36,0.2)', width: 2.2 }]
              }
            ],
            metrics: [
              { label: '无混叠调制条件 ωc>ωm', value: p.wc > p.wm ? `满足 (${M.fmt(p.wc, 1)} > ${M.fmt(p.wm, 1)}) ✓` : `违背 (${M.fmt(p.wc, 1)} ≤ ${M.fmt(p.wm, 1)}) 边带重叠!`, status: p.wc > p.wm ? 'ok' : 'err' },
              { label: '已调信号传输带宽', value: `2ω_m = ${M.fmt(2 * p.wm, 1)} rad/s` },
              { label: '同步相干增益 cos(Δφ)', value: M.fmt(cosPhi, 3), status: cosPhi < 0.2 ? 'err' : 'ok' },
              { label: '倍频分量中心 ±2ωc', value: `±${M.fmt(2 * p.wc, 1)} rad/s (由LPF滤除)` }
            ]
          };
        }
      },

      /* ==================== 4.6 ==================== */
      {
        id: '4.6',
        code: 'Ch4-(7)',
        level: '掌握',
        title: '4.6 线性常系数微分方程表征的系统：频域求解与三维频率响应螺旋',
        summary: '无需时域硬解微分方程：直接写出 H(jω)=B(jω)/A(jω)，在三维空间观察复频响轨迹并由反变换求冲激响应 h(t)！',
        presets: [
          { label: '一阶微分方程 dy/dt + 2y = 2x(t)', values: { order: 1, wn: 2.0, zeta: 0.5 } },
          { label: '二阶谐振微分方程 (ζ=0.25 显著谐振峰!)', values: { order: 2, wn: 3.0, zeta: 0.25 } },
          { label: '二阶过阻尼微分方程 (ζ=1.2 平缓无峰)', values: { order: 2, wn: 3.0, zeta: 1.2 } }
        ],
        controls: [
          {
            key: 'order', label: '微分方程阶次', type: 'select', default: 2,
            options: [
              { value: 1, label: '一阶系统：dy/dt + a₀y(t) = a₀x(t)' },
              { value: 2, label: '二阶系统：d²y/dt² + 2ζω_n dy/dt + ω_n²y = ω_n²x(t)' }
            ]
          },
          { key: 'wn', label: '特征参数 a₀ / 固有频率 ω_n', type: 'range', min: 1.0, max: 5.0, step: 0.2, default: 3.0, unit: 'rad/s' },
          { key: 'zeta', label: '二阶阻尼比 ζ', type: 'range', min: 0.15, max: 1.5, step: 0.05, default: 0.3 }
        ],
        theory: {
          formula: '∑_{k=0}^N a_k d^k y/dt^k = ∑_{k=0}^M b_k d^k x/dt^k   ──CTFT──►   H(jω) = Y(jω)/X(jω) = [∑ b_k(jω)^k] / [∑ a_k(jω)^k]',
          objectives: [
            '【掌握】由线性常系数微分方程直接利用微分性质 (jω)^k 写出系统频率响应 H(jω)；',
            '【掌握】利用部分分式展开法求傅里叶反变换，得到系统冲激响应 h(t) 与特定输入下的零状态响应 y(t)。'
          ],
          guide3d: '三维空间绘制频率响应复轨迹 (ω, Re{H(jω)}, Im{H(jω)})：点击【频域侧视】即可看到经典自动控制原理中的“奈奎斯特极坐标图（Nyquist Plot）”，一阶系统为半圆，二阶系统跨越两象限！'
        },
        matlab(p) {
          return `% Ch4.6 线性常系数微分方程系统频率响应 H(jw) 与反变换 h(t)
w = -10:0.05:10; wn = ${M.fmt(p.wn, 2)}; zeta = ${M.fmt(p.zeta, 2)};
${Number(p.order) === 1 ? 'b = [wn]; a = [1, wn];' : 'b = [wn^2]; a = [1, 2*zeta*wn, wn^2];'}
H = freqs(b, a, w);
subplot(2,1,1); plot(w, abs(H), 'g', 'LineWidth', 2); grid on; title('幅频特性 |H(j\omega)|');
subplot(2,1,2); impulse(tf(b, a), 6); grid on; title('傅里叶反变换所得单位冲激响应 h(t)');`;
        },
        quiz: {
          question: '因果稳定 LTI 系统由微分方程 d²y/dt² + 5 dy/dt + 6 y(t) = x(t) 描述，其频率响应 H(jω) 及单位冲激响应 h(t) 分别为：',
          options: [
            'H(jω) = 1 / [(jω+2)(jω+3)]，h(t) = (e^{-2t} - e^{-3t})u(t)',
            'H(jω) = 1 / [(jω-2)(jω-3)]，h(t) = (e^{2t} - e^{3t})u(t)',
            'H(jω) = (jω)² + 5jω + 6，h(t) = δ\'\'(t)',
            'H(jω) = 1 / (5jω + 6)，h(t) = e^{-6t/5}u(t)'
          ],
          answer: 0,
          explanation: '对微分方程两边取傅里叶变换得 [(jω)² + 5(jω) + 6]Y(jω) = X(jω)，故 H(jω) = 1/[(jω+2)(jω+3)] = 1/(jω+2) - 1/(jω+3)，逐项反变换即得 (e^{-2t} - e^{-3t})u(t)！'
        },
        compute(p) {
          const ord = Number(p.order);
          const ws = M.linspace(-10, 10, 320);
          const h3d = [], pMag = [], pPh = [];
          let peakMag = 0;

          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const H = ord === 1
              ? M.cDiv({ re: p.wn, im: 0 }, { re: p.wn, im: w })
              : M.cDiv({ re: p.wn * p.wn, im: 0 }, { re: p.wn * p.wn - w * w, im: 2 * p.zeta * p.wn * w });
            const mag = M.cAbs(H);
            if (mag > peakMag) peakMag = mag;
            h3d.push([w * 0.5, H.re, H.im]);
            pMag.push([w, mag]);
            pPh.push([w, M.cArg(H)]);
          }

          const ts = M.linspace(0, 6, 220);
          const htPts = ts.map((t) => [t, ord === 1 ? p.wn * Math.exp(-p.wn * t) : M.secondOrderImpulseCT(t, p.wn, p.zeta)]);

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '角频率 ω (-10 ~ +10 rad/s)', format: (v) => M.fmt(v * 2, 0) },
                y: { min: -2.2, max: 2.2, label: '实部 Re{H(jω)}' },
                z: { min: -2.5, max: 2.5, label: '虚部 Im{H(jω)}' }
              },
              curves: [
                {
                  points: h3d,
                  color: '#38bdf8',
                  width: 3.1,
                  glow: true,
                  shadowXZ: true,
                  shadowXY: true,
                  shadowYZ: true,
                  pickable: true,
                  label: 'H(jω)'
                }
              ],
              legend: [
                { color: '#38bdf8', label: '3D 复频率响应 H(jω) (侧视即为奈奎斯特图!)' }
              ]
            },
            plots2d: [
              { title: '幅频响应 |H(jω)| [绿] 与相频响应 ∠H(jω) [黄虚]', xMin: -10, xMax: 10, yMin: -3.2, yMax: Math.max(2.2, peakMag * 1.15), xLabel: 'ω', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.16)', width: 2.3 }, { points: pPh, color: '#fbbf24', dashed: true, width: 1.5 }] },
              { title: '傅里叶反变换：时域单位冲激响应 h(t) = F⁻¹{H(jω)}', xMin: 0, xMax: 6, yMin: -1.8, yMax: Math.max(2.2, p.wn * 1.1), xLabel: 't(s)', series: [{ points: htPts, color: '#38bdf8', fill: 'rgba(56,189,248,0.16)', width: 2.2 }] }
            ],
            metrics: [
              { label: '微分方程阶次', value: `${ord} 阶因果稳定系统`, status: 'ok' },
              { label: '直流增益 H(j0)', value: '1.000 (0 dB)' },
              { label: '谐振峰值 max|H(jω)|', value: M.fmt(peakMag, 3), status: peakMag > 1.5 ? 'warn' : 'ok' },
              { label: '反变换初值 h(0⁺)', value: ord === 1 ? M.fmt(p.wn, 2) : '0.000' }
            ]
          };
        }
      }
    ]
  });
})();
