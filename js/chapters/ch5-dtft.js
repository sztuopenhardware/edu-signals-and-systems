/**
 * 第 5 章：离散时间傅里叶变换 (Chapter 5) — 5 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 5 章全部 8 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch5',
    number: '第 5 章',
    title: '第 5 章：离散时间傅里叶变换',
    shortTitle: 'Ch5 离散时间傅里叶变换',
    weeks: '第 9–10 周 · 4 学时',
    syllabusItems: 'DTFT定义与2π周期圆柱谱、周期序列DTFT、DTFT性质与对偶性、卷积与周期卷积性质、差分方程离散系统',
    cases: [
      /* ==================== 5.1 ==================== */
      {
        id: '5.1',
        code: 'Ch5-(1)(6)',
        level: '掌握',
        title: '5.1 离散时间傅里叶变换 (DTFT)：2π 周期性与三维单位圆柱频谱',
        summary: '揭示为什么 DTFT 总是以 2π 为周期：因为频率变量出现在 e^{-jωn} 上！可在三维圆柱环绕视图与线性展开视图间自由渐变！',
        camera: { azimuth: -0.78, elevation: 0.48, zoom: 1.0 },
        presets: [
          { label: '单边指数 aⁿu[n] (a=+0.65 低通圆皇冠!)', values: { seq: 'exp', param: 0.65, wrap: 1.0 } },
          { label: '交替指数 (-0.65)ⁿu[n] (ω=±π 处高频峰!)', values: { seq: 'exp', param: -0.65, wrap: 1.0 } },
          { label: '对称矩形窗 (2N₁+1=7 点 Dirichlet 核)', values: { seq: 'rect', param: 3, wrap: 0.0 } },
          { label: '圆柱环绕 → 线性 2π 周期展开半途渐变!', values: { seq: 'exp', param: 0.65, wrap: 0.5 } }
        ],
        controls: [
          {
            key: 'seq', label: '常用 DTFT 变换对序列 [大纲5.(6)]', type: 'select', default: 'exp',
            options: [
              { value: 'exp', label: '单边指数序列 aⁿu[n] ↔ 1 / (1 - ae^{-jω})  (|a|<1)' },
              { value: 'rect', label: '对称矩形窗 (|n|≤N₁) ↔ sin((N₁+½)ω)/sin(ω/2)' },
              { value: 'biExp', label: '双边指数 a^{|n|} ↔ (1 - a²) / (1 - 2acosω + a²)' }
            ]
          },
          { key: 'param', label: '序列参数 a (指数) 或半宽 N₁ (矩形)', type: 'range', min: -0.82, max: 0.85, step: 0.05, default: 0.65 },
          { key: 'wrap', label: '频谱空间形态：0=平面周期展开 ↔ 1=单位圆环绕', type: 'range', min: 0, max: 1, step: 0.05, default: 1.0 }
        ],
        theory: {
          formula: 'X(e^{jω}) = ∑_{n=-∞}^{+∞} x[n] e^{-jωn},   x[n] = (1/2π) ∫_{2π} X(e^{jω}) e^{jωn} dω,   X(e^{j(ω+2π)}) ≡ X(e^{jω})',
          objectives: [
            '【掌握】离散时间傅里叶变换（DTFT）与逆变换的定义、收敛条件及基本变换对；',
            '【理解】离散时间信号频谱的两大核心特征：① 连续函数；② 严格以 2π 为周期（ω=0, ±2π 对应直流低频，ω=±π 对应最高振荡频率！）。'
          ],
          guide3d: '拖动【频谱空间形态】滑块体验震撼几何过渡：当滑块=1 时，|X(e^{jω})| 立在三维单位圆 e^{jω} 上形成一顶皇冠（转一圈 2π 自然回到起点！）；将滑块拉向 0 时，皇冠像卷轴一样展开成 [-3π, 3π] 上连续重复三个周期的波形！'
        },
        matlab(p) {
          return `% Ch5.1 离散时间傅里叶变换 (DTFT) 2*pi 周期频谱与单位圆三维展示
w = -3*pi : 0.02 : 3*pi; a = ${M.fmt(p.param, 2)};
${p.seq === 'exp' ? 'X = 1 ./ (1 - a * exp(-1j * w));' :
  p.seq === 'rect' ? 'N1 = max(1, round(abs(a)*5)); X = sin((N1+0.5)*w) ./ sin(w/2); X(abs(sin(w/2))<1e-6) = 2*N1+1;' :
  'a0 = min(0.85, max(0.2, abs(a))); X = (1 - a0^2) ./ (1 - 2*a0*cos(w) + a0^2);'}
subplot(2,1,1); plot(w/pi, abs(X), 'g', 'LineWidth', 2); grid on;
xlabel('\omega / \pi'); title('DTFT 幅度谱 |X(e^{j\omega})| (以 2\pi 为周期)');
subplot(2,1,2); plot(w/pi, angle(X), 'y', 'LineWidth', 1.6); grid on; xlabel('\omega / \pi'); title('相位谱 \angle X(e^{j\omega})');`;
        },
        quiz: {
          question: '在离散时间傅里叶变换 X(e^{jω}) 中，下列哪个数字角频率 ω 代表离散序列的【最高振荡频率】？',
          options: ['ω = π（及 ±3π, ±5π，对应序列 (-1)^n 每拍正负交替！）', 'ω = 2π（因为 e^{j2πn} = 1，实为最低直流零频！）', 'ω → ∞', 'ω = π/2'],
          answer: 0,
          explanation: '这是离散频谱最关键的概念！当 ω = 2π 时 e^{j2πn} ≡ 1 又回到了直流零频；真正的最高数字频率在半周期处 ω = ±π，对应 e^{jπn} = (-1)^n！'
        },
        compute(p) {
          const N1 = Math.max(1, Math.min(5, Math.round(Math.abs(p.param) * 5) || 2));
          const aVal = Math.abs(p.param) < 0.08 ? 0.25 : p.param;
          const aBi = Math.min(0.8, Math.max(0.2, Math.abs(p.param)));

          const evalMagPh = (w) => {
            if (p.seq === 'exp') {
              const z = M.cDiv({ re: 1, im: 0 }, { re: 1 - aVal * Math.cos(w), im: aVal * Math.sin(w) });
              return { mag: M.cAbs(z), ph: M.cArg(z) };
            }
            if (p.seq === 'rect') {
              const v = M.dirichlet(w, 2 * N1 + 1);
              return { mag: Math.abs(v) * 0.45, ph: v >= 0 ? 0 : Math.PI };
            }
            const m = (1 - aBi * aBi) / (1 - 2 * aBi * Math.cos(w) + aBi * aBi);
            return { mag: m * 0.65, ph: 0 };
          };

          // Morph between cylinder (wrap=1, w in [-pi, pi] on circle radius 1.5) and unrolled [-3pi, 3pi]
          const alpha = p.wrap;
          const ws = M.linspace(-3 * Math.PI, 3 * Math.PI, 360);
          const crownPts = [];
          const pMag = [], pPh = [];

          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const { mag, ph } = evalMagPh(w);
            pMag.push([w / Math.PI, mag]);
            pPh.push([w / Math.PI, ph]);

            // For 3D morph: if alpha > 0.7, focus main [-pi, pi] ring cleanly or overlap smoothly
            if (alpha > 0.85 && Math.abs(w) > Math.PI + 0.05) continue;
            const xLin = (w / (3 * Math.PI)) * 3.2;
            const yLin = 0;
            const xCyl = 1.6 * Math.cos(w);
            const yCyl = 1.6 * Math.sin(w);
            const x3 = (1 - alpha) * xLin + alpha * xCyl;
            const y3 = (1 - alpha) * yLin + alpha * yCyl;
            crownPts.push([x3, y3, Math.min(4.8, mag)]);
          }

          // Time stems for 2D or side
          const nStems2d = [];
          for (let n = -8; n <= 8; n++) {
            let xn = 0;
            if (p.seq === 'exp') xn = n >= 0 ? Math.pow(aVal, n) : 0;
            else if (p.seq === 'rect') xn = Math.abs(n) <= N1 ? 1 : 0;
            else xn = Math.pow(aBi, Math.abs(n));
            nStems2d.push([n, xn]);
          }

          return {
            scene: {
              axes: {
                x: { min: -3.4, max: 3.4, label: alpha > 0.5 ? 'Re{e^{jω}} = cos ω' : '展开频率 ω (-3π ~ +3π)' },
                y: { min: -2.2, max: 2.2, label: alpha > 0.5 ? 'Im{e^{jω}} = sin ω' : '频谱平面' },
                z: { min: 0, max: 4.8, label: '幅度谱 |X(e^{jω})|' }
              },
              planes: alpha > 0.3
                ? [{ type: 'circle', cx: 0, cy: 0, z: 0, radius: 1.6 * alpha, color: 'rgba(251,191,36,0.7)', width: 2, dashed: true }]
                : [],
              ribbons: [{ points: crownPts, baseZ: 0, color: 'rgba(52,211,153,0.25)' }],
              curves: [{ points: crownPts, color: '#34d399', width: 3.2, glow: true, pickable: true, label: '|X(e^{jω})|' }],
              markers: alpha > 0.5
                ? [
                    { pos: [1.6 * alpha, 0, evalMagPh(0).mag], shape: 'dot', color: '#38bdf8', size: 6.5, label: 'ω=0 (直流低频)' },
                    { pos: [-1.6 * alpha, 0, evalMagPh(Math.PI).mag], shape: 'diamond', color: '#f43f5e', size: 7, label: 'ω=±π (最高频!)' }
                  ]
                : [],
              legend: [
                { color: '#34d399', label: 'DTFT 幅度皇冠 |X(e^{jω})|' },
                { color: '#38bdf8', label: 'ω=0 (直流点 z=+1)' },
                { color: '#f43f5e', label: 'ω=±π (高频点 z=-1)' }
              ]
            },
            plots2d: [
              { title: '时域离散序列 x[n]', xMin: -8, xMax: 8, yMin: -1.1, yMax: 1.2, xLabel: 'n', series: [{ points: nStems2d, type: 'stems', color: '#38bdf8' }] },
              { title: '展开三个周期的 DTFT 幅度谱 |X(e^{jω})| (横轴单位: π rad)', xMin: -3, xMax: 3, yMin: 0, yMax: 4.8, xLabel: '×π', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.2 }], vLines: [{ x: -1, color: '#f43f5e' }, { x: 1, color: '#f43f5e' }] }
            ],
            metrics: [
              { label: 'DTFT 基本周期', value: '2π rad (严格周期函数)', status: 'ok' },
              { label: '低频增益 |X(e^{j0})|', value: M.fmt(evalMagPh(0).mag, 3) },
              { label: '高频增益 |X(e^{jπ})|', value: M.fmt(evalMagPh(Math.PI).mag, 3) },
              { label: '频谱选频属性', value: evalMagPh(0).mag >= evalMagPh(Math.PI).mag ? '低通型频谱 (ω=0 占优)' : '高通型频谱 (ω=±π 占优!)', status: 'ok' }
            ]
          };
        }
      },

      /* ==================== 5.2 ==================== */
      {
        id: '5.2',
        code: 'Ch5-(2)',
        level: '掌握',
        title: '5.2 周期序列的离散时间傅里叶变换：2π 周期冲激串谱',
        summary: '离散周期序列 x[n] 的 DTFT 由间隔 2π/N 的周期冲激串组成：X(e^{jω}) = ∑_{k=-∞}^{∞} 2π·a_k·δ(ω - 2πk/N)！',
        presets: [
          { label: '离散余弦序列 cos(2π·2n/12)', values: { type: 'cos', N: 12, m: 2 } },
          { label: '周期单位脉冲串 ∑δ[n - rN] (N=6)', values: { type: 'comb', N: 6, m: 1 } },
          { label: '离散交替序列 (-1)ⁿ = cos(πn) (N=2)', values: { type: 'cos', N: 4, m: 2 } }
        ],
        controls: [
          {
            key: 'type', label: '离散周期信号类型', type: 'select', default: 'cos',
            options: [
              { value: 'cos', label: '离散余弦 cos(2πm·n / N)' },
              { value: 'comb', label: '离散周期脉冲串 ∑_{r=-∞}^∞ δ[n - rN]' }
            ]
          },
          { key: 'N', label: '基本周期 N', type: 'range', min: 4, max: 14, step: 2, default: 10 },
          { key: 'm', label: '谐波次数 m (余弦模式)', type: 'range', min: 1, max: 5, step: 1, default: 2 }
        ],
        theory: {
          formula: 'x[n] = ∑_{k=<N>} a_k e^{jk(2π/N)n}   ◄──DTFT──►   X(e^{jω}) = ∑_{k=-∞}^{+∞} 2π a_k δ(ω - 2πk/N)',
          objectives: [
            '【掌握】周期序列的 DTFT 表达式，特别是单位脉冲串 ∑δ[n-rN] ↔ (2π/N)∑δ(ω - 2πk/N)；',
            '【理解】周期序列的频谱兼具“离散性”（因时域周期）与“2π 周期性”（因时域离散）双重特征！'
          ],
          guide3d: '三维空间前排蓝针为离散周期序列 x[n]，后排红箭头为 [-2π, 2π] 区间上的频域冲激串 X(e^{jω})——注意每 2π 区间内恰有 N 个等距冲激位置！'
        },
        matlab(p) {
          return `% Ch5.2 周期序列的 DTFT 冲激谱图 (-2*pi ~ 2*pi)
N = ${Math.round(p.N)}; m = ${Math.round(p.m)}; n = -16:16;
${p.type === 'cos' ? 'x = cos(2*pi*m*n/N);' : 'x = double(mod(n, N) == 0);'}
% 一个周期 0..N-1 的 DTFS 系数 a_k
ak = fft(x(n>=0 & n<N)) / N;
k = -2*N : 2*N; wk = 2*pi*k/N;
weights = 2*pi * real(ak(mod(k, N)+1));
subplot(2,1,1); stem(n, x, 'filled'); grid on; title('时域离散周期序列 x[n]');
subplot(2,1,2); stem(wk/pi, weights, '^r', 'filled'); grid on; xlabel('\omega / \pi'); title('频域冲激强度 2\pi a_k');`;
        },
        quiz: {
          question: '周期为 N = 8 的离散单位脉冲串 p[n] = ∑_{r=-∞}^{+∞} δ[n - 8r]，在主区间 -π < ω ≤ π 内共有多少根频域冲激谱线？每根冲激的强度（面积）是多少？',
          options: ['共 8 根，每根强度均为 2π/8 = π/4', '共 1 根，强度为 2π', '共 4 根，强度为 π/2', '无穷多根'],
          answer: 0,
          explanation: 'DTFS 系数全为 a_k = 1/N = 1/8，频域冲激间隔为 2π/8 = π/4，故任意长度为 2π 的频率周期内恰有 8 根冲激，每根面积为 2π·a_k = π/4。'
        },
        compute(p) {
          const N = Math.round(p.N);
          const m = Math.min(Math.floor(N / 2), Math.round(p.m));

          const sTime = [], pTime = [];
          for (let n = -14; n <= 14; n++) {
            const v = p.type === 'cos' ? Math.cos((M.TWO_PI * m * n) / N) : ((n % N) + N) % N === 0 ? 1 : 0;
            sTime.push([(n / 14) * 5, -1.1, v]);
            pTime.push([n, v]);
          }

          const sSpec = [], pSpec = [];
          for (let k = -2 * N; k <= 2 * N; k++) {
            const wk = (M.TWO_PI * k) / N;
            if (Math.abs(wk) > 2 * Math.PI + 0.01) continue;
            let ak = 0;
            if (p.type === 'comb') ak = 1 / N;
            else {
              const km = ((k % N) + N) % N;
              if (m === N / 2 && km === m) ak = 1.0;
              else if (km === m || km === (N - m) % N) ak = 0.5;
            }
            if (ak > 1e-4) {
              const weight = M.TWO_PI * ak;
              sSpec.push([(wk / (2 * Math.PI)) * 5, 1.0, weight]);
              pSpec.push([wk / Math.PI, weight]);
            }
          }

          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '时域 n (-14~14)  /  频域 ω (-2π~+2π)' },
                y: { min: -1.7, max: 1.7, label: '时域序列 / 频域冲激串', ticks: [-1.1, 1.0], format: (v) => (v < 0 ? 'x[n]' : 'X(e^{jω})') },
                z: { min: -1.2, max: 3.6, label: '幅值 / 冲激强度 2πa_k' }
              },
              stems: [
                { points: sTime, baseZ: 0, color: '#38bdf8', width: 2.0, radius: 3.6, label: '周期序列 x[n]' },
                { points: sSpec, baseZ: 0, color: '#f43f5e', width: 2.6, impulse: true, label: '冲激强度 2πa_k' }
              ],
              legend: [
                { color: '#38bdf8', label: `离散周期序列 x[n] (N=${N})` },
                { color: '#f43f5e', label: 'DTFT 2π周期冲激串' }
              ]
            },
            plots2d: [
              { title: `时域周期序列 x[n] (周期 N = ${N})`, xMin: -14, xMax: 14, yMin: -1.2, yMax: 1.3, xLabel: 'n', series: [{ points: pTime, type: 'stems', color: '#38bdf8' }] },
              { title: '频域 DTFT 冲激强度谱 2πa_k (横轴: ×π rad)', xMin: -2, xMax: 2, yMin: 0, yMax: 3.6, xLabel: '×π', series: [{ points: pSpec, type: 'stems', color: '#f43f5e' }], vLines: [{ x: -1, color: '#fbbf24' }, { x: 1, color: '#fbbf24' }] }
            ],
            metrics: [
              { label: '时域周期 N', value: `${N} 点`, status: 'ok' },
              { label: '频域冲激间隔 Δω', value: `2π/${N} = ${M.fmt(2 / N, 3)}π rad` },
              { label: '每 2π 区间非零谱线', value: `${p.type === 'comb' ? N : m === N / 2 ? 1 : 2} 根` },
              { label: '主冲激面积 2πa_k', value: p.type === 'comb' ? M.fmt(M.TWO_PI / N, 3) : m === N / 2 ? '2π ≈ 6.28' : 'π ≈ 3.14' }
            ]
          };
        }
      },

      /* ==================== 5.3 ==================== */
      {
        id: '5.3',
        code: 'Ch5-(3)(7)',
        level: '理解',
        title: '5.3 DTFT 核心性质（频移高低通互换、时间扩展）与四大傅里叶对偶性',
        summary: '演示离散独特性质：乘以 (-1)ⁿ 将低通滤波器一秒变高通！内插补零 x_(k)[n] 将频谱压缩 k 倍！并总结四大变换对偶律！',
        presets: [
          { label: '频移性质：(-1)ⁿ·h_LP[n] 低通变高通!', values: { mode: 'modPi', kExp: 2, wShift: 3.1416 } },
          { label: '任意频移 e^{jω₀n}h[n] → 带通滤波器', values: { mode: 'modPi', kExp: 2, wShift: 1.57 } },
          { label: '时间扩展补零 x_(3)[n] ↔ X(e^{j3ω}) 频谱压缩3倍!', values: { mode: 'expand', kExp: 3, wShift: 0 } }
        ],
        controls: [
          {
            key: 'mode', label: '性质与对偶演示项', type: 'select', default: 'modPi',
            options: [
              { value: 'modPi', label: '离散频移性质：e^{jω₀n}x[n] ↔ X(e^{j(ω-ω₀)}) [低通→带通/高通!]' },
              { value: 'expand', label: '时间扩展性质：补零序列 x_(k)[n] ↔ X(e^{jkω}) [镜像压缩!]' }
            ]
          },
          { key: 'wShift', label: '频移角频率 ω₀ (ω₀=π 即乘以 (-1)ⁿ!)', type: 'range', min: 0, max: 3.1416, step: 0.157, default: 3.1416, unit: 'rad' },
          { key: 'kExp', label: '时间扩展内插倍数 k (每两点间补 k-1 个零)', type: 'range', min: 1, max: 4, step: 1, default: 2 }
        ],
        theory: {
          formula: '(-1)ⁿ x[n] = e^{jπn} x[n] ↔ X(e^{j(ω-π)}) [低通变高通]；  四大傅里叶铁律：一个域【离散】 ⇔ 另一个域【周期】！',
          objectives: [
            '【理解】DTFT 频移性质、时间扩展 x_{(k)}[n]、差分与累加性质；',
            '【理解】对偶性大一统（大纲 5.(7)）：① CTFS（时域连续周期 ↔ 频域离散非周期）与 DTFT（时域离散非周期 ↔ 频域连续周期）互为数学对偶！② DTFS 自对偶；③ CTFT 自对偶！'
          ],
          guide3d: '三维空间对比变换前后的序列与 [-π, π] 频谱：在频移模式下将 ω₀ 拉到 π（3.14），原本位于 ω=0 的低通主瓣平滑滑移到 ω=±π 处变成高通滤波器，而时域序列只是奇数项反号 (-1)ⁿx[n]！'
        },
        matlab(p) {
          return `% Ch5.3 DTFT 频移高低通互换 (-1)^n * h[n] 与时间扩展 x_(k)[n]
n = -12:12;
h_lp = 0.35 * sinc(0.35 * n);             % 原低通滤波器单位取样响应
${p.mode === 'modPi' ? `w0 = ${M.fmt(p.wShift, 3)};
h_mod = real(exp(1j*w0*n)) .* h_lp;       % 调制搬移 (w0=pi 时即为 (-1).^n .* h_lp)` :
`k = ${Math.round(p.kExp)};
n_ext = -12*k : 12*k; h_mod = zeros(size(n_ext)); h_mod(1:k:end) = h_lp; n = n_ext;`}
w = -pi:0.01:pi;
H0 = arrayfun(@(ww) sum(0.35*sinc(0.35*(-12:12)).*exp(-1j*ww*(-12:12))), w);
H1 = arrayfun(@(ww) sum(h_mod .* exp(-1j*ww*n)), w);
plot(w/pi, abs(H0), '--b', w/pi, abs(H1), 'g', 'LineWidth', 2); grid on;
legend('原低通 |H_0(e^{j\omega})|', '性质变换后 |H_1(e^{j\omega})|'); xlabel('\omega / \pi');`;
        },
        quiz: {
          question: '根据《信号与系统》四大傅里叶表示的【对偶性】规律，与“离散时间傅里叶变换（DTFT：时域离散非周期 ↔ 频域连续周期）”具有严格数学对偶形式的是：',
          options: [
            '连续时间傅里叶级数（CTFS：时域连续周期 ↔ 频域离散非周期）！',
            '连续时间傅里叶变换（CTFT）',
            '离散时间傅里叶级数（DTFS）',
            '单边拉普拉斯变换'
          ],
          answer: 0,
          explanation: 'CTFS 用连续积分求离散系数 a_k、用无穷级数合成周期连续函数；DTFT 用无穷级数求连续周期频谱 X(e^{jω})、用有限区间积分求离散序列 x[n]——两者的正逆公式在数学结构上完全互换对偶！'
        },
        compute(p) {
          const nBase = [];
          const xBase = [];
          for (let n = -10; n <= 10; n++) {
            nBase.push(n);
            xBase.push(0.4 * M.sinc(0.4 * n));
          }

          let nNew = [], xNew = [];
          if (p.mode === 'modPi') {
            for (let i = 0; i < nBase.length; i++) {
              nNew.push(nBase[i]);
              // Use cos(w0*n) for real bandpass, or (-1)^n exact at pi
              const factor = Math.abs(p.wShift - Math.PI) < 0.08 ? Math.pow(-1, Math.abs(nBase[i])) : Math.cos(p.wShift * nBase[i]);
              xNew.push(xBase[i] * factor);
            }
          } else {
            const k = Math.round(p.kExp);
            for (let i = 0; i < nBase.length; i++) {
              if (Math.abs(nBase[i] * k) <= 14) {
                nNew.push(nBase[i] * k);
                xNew.push(xBase[i]);
              }
            }
            // Fill zeros in between for display
            const map = new Map(nNew.map((nv, idx) => [nv, xNew[idx]]));
            nNew = []; xNew = [];
            for (let m = -14; m <= 14; m++) {
              nNew.push(m);
              xNew.push(map.get(m) ?? 0);
            }
          }

          const ws = M.linspace(-Math.PI, Math.PI, 240);
          const ft0 = M.computeDTFT(nBase, xBase, ws);
          const ft1 = M.computeDTFT(nNew, xNew, ws);

          const cSpec0 = ws.map((w, i) => [(w / Math.PI) * 4.5, 0.4, ft0.mag[i]]);
          const cSpec1 = ws.map((w, i) => [(w / Math.PI) * 4.5, -1.2, ft1.mag[i]]);
          const sTime1 = nNew.map((nv, i) => [(nv / 14) * 4.5, 1.3, xNew[i] * 2.2]);

          return {
            scene: {
              axes: {
                x: { min: -4.5, max: 4.5, label: '时域 n  /  主值区间频率 ω (-π ~ +π)' },
                y: { min: -1.8, max: 1.8, label: '序列与频谱变换对比', ticks: [-1.2, 0.4, 1.3], format: (v) => (v > 0.9 ? '变换序列' : v < -0.4 ? '新频谱' : '原低通谱') },
                z: { min: -0.9, max: 1.35, label: '幅值 / 频谱模' }
              },
              ribbons: [
                { points: cSpec0, baseZ: 0, color: 'rgba(56,189,248,0.16)' },
                { points: cSpec1, baseZ: 0, color: 'rgba(52,211,153,0.28)' }
              ],
              curves: [
                { points: cSpec0, color: '#38bdf8', width: 2.2, dashed: true, label: '原低通频谱 |X₀(e^{jω})|' },
                { points: cSpec1, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '变换后频谱 |X₁(e^{jω})|' }
              ],
              stems: [{ points: sTime1, baseZ: 0, color: '#fbbf24', width: 2.0, radius: 3.4, label: '变换后时域序列' }],
              legend: [
                { color: '#fbbf24', label: '变换后时域序列' },
                { color: '#38bdf8', label: '原低通谱 |X₀(e^{jω})|' },
                { color: '#34d399', label: '新频谱 |X₁(e^{jω})|' }
              ]
            },
            plots2d: [
              { title: '变换后时域离散序列', xMin: -14, xMax: 14, yMin: -0.45, yMax: 0.5, xLabel: 'n', series: [{ points: nNew.map((nv, i) => [nv, xNew[i]]), type: 'stems', color: '#fbbf24' }] },
              {
                title: '[-π, π] 频谱对比：原低通 [蓝虚] vs 变换后 [绿]',
                xMin: -1, xMax: 1, yMin: 0, yMax: 1.3, xLabel: '×π',
                series: [
                  { points: ws.map((w, i) => [w / Math.PI, ft0.mag[i]]), color: '#38bdf8', dashed: true, width: 1.8 },
                  { points: ws.map((w, i) => [w / Math.PI, ft1.mag[i]]), color: '#34d399', fill: 'rgba(52,211,153,0.2)', width: 2.3 }
                ]
              }
            ],
            metrics: [
              { label: '当前性质效应', value: p.mode === 'modPi' ? (Math.abs(p.wShift - Math.PI) < 0.1 ? '(-1)ⁿ 调制：低通变高通!' : '余弦调制：低通变带通') : `补 ${Math.round(p.kExp) - 1} 个零：频谱压缩 ${Math.round(p.kExp)} 倍!`, status: 'ok' },
              { label: '[-π,π] 内通带个数', value: p.mode === 'expand' ? `${Math.round(p.kExp)} 个镜像通带` : Math.abs(p.wShift) < 0.1 || Math.abs(p.wShift - Math.PI) < 0.1 ? '1 个通带' : '2 个对称边带' },
              { label: '直流分量 X₁(e^{j0})', value: M.fmt(ft1.mag[Math.floor(ws.length / 2)], 3) },
              { label: '高频分量 X₁(e^{jπ})', value: M.fmt(ft1.mag[ws.length - 1], 3) }
            ]
          };
        }
      },

      /* ==================== 5.4 ==================== */
      {
        id: '5.4',
        code: 'Ch5-(4)(5)',
        level: '理解',
        title: '5.4 DTFT 卷积与相乘（周期卷积）性质：加窗截断与频谱泄漏',
        summary: '时域相乘 x[n]·w[n] 对应频域周期卷积 (1/2π)X⊛W：直观对比矩形窗与汉宁/汉明窗的主瓣展宽与旁瓣频谱泄漏！',
        presets: [
          { label: '矩形窗截断 (L=15，主瓣窄但旁瓣泄漏高达 -13dB!)', values: { win: 'rect', L: 15, w0: 0.9 } },
          { label: '汉宁窗 Hann (L=15，旁瓣泄漏大幅压低!)', values: { win: 'hann', L: 15, w0: 0.9 } },
          { label: '增加窗长 L=35 (主瓣显著变尖，频率分辨率提升!)', values: { win: 'hann', L: 35, w0: 0.9 } }
        ],
        controls: [
          {
            key: 'win', label: '截断窗函数 w[n]', type: 'select', default: 'rect',
            options: [
              { value: 'rect', label: '矩形窗 Rectangular (主瓣最窄 4π/L，第一旁瓣 -13dB)' },
              { value: 'hann', label: '汉宁窗 Hann (主瓣 8π/L，旁瓣迅速衰减 -31dB)' },
              { value: 'hamming', label: '汉明窗 Hamming (旁瓣抑制高达 -42dB)' }
            ]
          },
          { key: 'L', label: '有限序列观测窗长 L', type: 'range', min: 7, max: 41, step: 2, default: 15 },
          { key: 'w0', label: '被测余弦数字频率 ω₀', type: 'range', min: 0.4, max: 2.5, step: 0.1, default: 0.9, unit: 'rad' }
        ],
        theory: {
          formula: '卷积：x[n]*h[n] ↔ X(e^{jω})H(e^{jω})；  相乘：x[n]·w[n] ↔ (1/2π) ∫_{2π} X(e^{jθ}) W(e^{j(ω-θ)}) dθ  [周期卷积！]',
          objectives: [
            '【掌握】DTFT 卷积性质与相乘（频域周期卷积）性质；',
            '【理解】有限长观测 x[n]·w[n] 导致理想冲激谱展宽为窗谱主瓣与旁瓣（频谱泄漏）的机理及窗函数折中规律。'
          ],
          guide3d: '三维空间同时展示：后排蓝色为窗函数序列 w[n]，中排琥珀色为加窗后的余弦序列 x[n]w[n]，前排绿色发光曲线为周期卷积后的连续幅度谱 |Y(e^{jω})|——切换矩形窗与汉宁窗立即看清旁瓣抑制！'
        },
        matlab(p) {
          return `% Ch5.4 DTFT 相乘(周期卷积)性质：加窗截断与频谱泄漏分析
L = ${Math.round(p.L)}; n = -(L-1)/2 : (L-1)/2; w0 = ${M.fmt(p.w0, 2)};
${p.win === 'rect' ? 'win = ones(size(n));' : p.win === 'hann' ? 'win = 0.5*(1 + cos(2*pi*n/(L-1)));' : 'win = 0.54 + 0.46*cos(2*pi*n/(L-1));'}
y = cos(w0 * n) .* win;
w = -pi:0.005:pi;
Y = arrayfun(@(ww) sum(y .* exp(-1j*ww*n)), w);
plot(w/pi, 20*log10(abs(Y)/max(abs(Y)) + 1e-4), 'g', 'LineWidth', 1.8); grid on;
ylim([-60 5]); xlabel('\omega / \pi'); ylabel('归一化幅度 (dB)'); title('加窗序列 DTFT 对数幅度谱');`;
        },
        quiz: {
          question: '两个离散时间序列在时域相乘 y[n] = x₁[n] · x₂[n]，其离散时间傅里叶变换 Y(e^{jω}) 等于：',
          options: [
            'X₁(e^{jω}) 与 X₂(e^{jω}) 在一个 2π 周期内的【周期卷积】再乘以 1/(2π)',
            'X₁(e^{jω}) 与 X₂(e^{jω}) 在 (-∞, +∞) 上的无穷积分卷积（无穷积分会因周期性发散！）',
            'X₁(e^{jω}) · X₂(e^{jω}) 直接相乘',
            'X₁(e^{jω}) + X₂(e^{jω})'
          ],
          answer: 0,
          explanation: '因为 X₁(e^{jω}) 和 X₂(e^{jω}) 都是周期为 2π 的周期函数，若在 (-∞,+∞) 上积分将发散；正确公式是在任意一个长度 2π 的周期区间上做周期卷积 (1/2π)∫_{2π} X₁(e^{jθ})X₂(e^{j(ω-θ)})dθ！'
        },
        compute(p) {
          const L = Math.round(p.L);
          const half = (L - 1) / 2;
          const nArr = [], wArr = [], yArr = [];
          for (let i = 0; i < L; i++) {
            const n = i - half;
            const wv = p.win === 'rect' ? 1.0 : p.win === 'hann' ? 0.5 * (1 + Math.cos((M.TWO_PI * n) / (L - 1))) : 0.54 + 0.46 * Math.cos((M.TWO_PI * n) / (L - 1));
            nArr.push(n);
            wArr.push(wv);
            yArr.push(wv * Math.cos(p.w0 * n));
          }

          const ws = M.linspace(-Math.PI, Math.PI, 320);
          const Yft = M.computeDTFT(nArr, yArr, ws);
          const maxMag = Math.max(1e-6, ...Yft.mag);

          const cSpec3 = ws.map((w, i) => [(w / Math.PI) * 4.5, -1.2, (Yft.mag[i] / maxMag) * 1.4]);
          const sWin3 = nArr.map((n, i) => [(n / 20) * 4.5, 1.3, wArr[i]]);
          const sSig3 = nArr.map((n, i) => [(n / 20) * 4.5, 0.1, yArr[i]]);

          const pDb = ws.map((w, i) => [w / Math.PI, Math.max(-60, 20 * Math.log10(Yft.mag[i] / maxMag + 1e-4))]);

          return {
            scene: {
              axes: {
                x: { min: -4.5, max: 4.5, label: '离散时刻 n  /  数字频率 ω (-π ~ +π)' },
                y: { min: -1.8, max: 1.8, label: '窗函数 → 加窗序列 → 周期卷积谱', ticks: [-1.2, 0.1, 1.3], format: (v) => (v > 0.7 ? '窗w[n]' : v < -0.5 ? '|Y(e^{jω})|' : 'x·w[n]') },
                z: { min: -1.1, max: 1.55, label: '归一化幅值' }
              },
              ribbons: [{ points: cSpec3, baseZ: 0, color: 'rgba(52,211,153,0.26)' }],
              curves: [{ points: cSpec3, color: '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '归一化 |Y(e^{jω})|' }],
              stems: [
                { points: sWin3, baseZ: 0, color: '#38bdf8', width: 1.7, radius: 3.0, label: '窗函数 w[n]' },
                { points: sSig3, baseZ: 0, color: '#fbbf24', width: 1.9, radius: 3.3, label: '加窗序列 x[n]w[n]' }
              ],
              legend: [
                { color: '#38bdf8', label: `窗函数 w[n] (L=${L})` },
                { color: '#fbbf24', label: '加窗余弦 x[n]w[n]' },
                { color: '#34d399', label: '周期卷积谱 |Y(e^{jω})|' }
              ]
            },
            plots2d: [
              { title: '时域加窗序列 y[n] = cos(ω₀n)·w[n]', xMin: -20, xMax: 20, yMin: -1.1, yMax: 1.2, xLabel: 'n', series: [{ points: nArr.map((n, i) => [n, yArr[i]]), type: 'stems', color: '#fbbf24' }] },
              { title: '对数幅度谱 20lg|Y(e^{jω})| (dB) —— 直观对比主瓣宽度与旁瓣泄漏!', xMin: -1, xMax: 1, yMin: -60, yMax: 4, xLabel: '×π', series: [{ points: pDb, color: '#34d399', fill: 'rgba(52,211,153,0.16)', width: 2.0 }] }
            ],
            metrics: [
              { label: '理论主瓣过零全宽', value: p.win === 'rect' ? `4π/L = ${M.fmt(4 / L, 3)}π` : `8π/L = ${M.fmt(8 / L, 3)}π`, status: 'ok' },
              { label: '第一旁瓣峰值电平', value: p.win === 'rect' ? '≈ -13.3 dB (泄漏较大)' : p.win === 'hann' ? '≈ -31.5 dB (优良)' : '≈ -42.7 dB (极低泄漏)', status: p.win === 'rect' ? 'warn' : 'ok' },
              { label: '信号真实频率 ±ω₀', value: `±${M.fmt(p.w0 / Math.PI, 2)}π rad` },
              { label: '频率分辨率趋势', value: L >= 25 ? '长窗高分辨率' : '短窗主瓣较宽' }
            ]
          };
        }
      },

      /* ==================== 5.5 ==================== */
      {
        id: '5.5',
        code: 'Ch5-(8)',
        level: '掌握',
        title: '5.5 线性常系数差分方程表征的离散系统：频域求解与谐振分析',
        summary: '由差分方程 ∑a_k y[n-k] = ∑b_k x[n-k] 直接写出 H(e^{jω})，三维观察复频响曲线及单位取样响应 h[n]！',
        presets: [
          { label: '二阶数字窄带谐振器 (r=0.85, θ₀=0.4π)', values: { r: 0.85, thetaPi: 0.4, sysType: 'iir2' } },
          { label: '一阶递归低通 y[n]-0.75y[n-1]=0.25x[n]', values: { r: 0.75, thetaPi: 0.0, sysType: 'iir1' } },
          { label: '一阶递归高通 y[n]+0.75y[n-1]=0.25x[n]', values: { r: 0.75, thetaPi: 1.0, sysType: 'iir1' } }
        ],
        controls: [
          {
            key: 'sysType', label: '差分方程阶次类型', type: 'select', default: 'iir2',
            options: [
              { value: 'iir2', label: '二阶共轭极点差分方程：y[n] - 2rcosθ₀·y[n-1] + r²y[n-2] = x[n]' },
              { value: 'iir1', label: '一阶差分方程：y[n] - p·y[n-1] = (1-|p|)x[n]' }
            ]
          },
          { key: 'r', label: '极点模长 r (<1 因果稳定，越接近1峰越尖锐!)', type: 'range', min: 0.25, max: 0.92, step: 0.05, default: 0.82 },
          { key: 'thetaPi', label: '谐振数字角频率 θ₀ (×π rad)', type: 'range', min: 0.0, max: 1.0, step: 0.05, default: 0.4 }
        ],
        theory: {
          formula: '∑_{k=0}^N a_k y[n-k] = ∑_{k=0}^M b_k x[n-k]   ──DTFT──►   H(e^{jω}) = [∑ b_k e^{-jkω}] / [∑ a_k e^{-jkω}]',
          objectives: [
            '【掌握】利用时移性质 y[n-k] ↔ e^{-jkω}Y(e^{jω}) 直接将差分方程代数化求解频率响应 H(e^{jω})；',
            '【掌握】利用部分分式展开法对 e^{-jω} 的有理分式求 DTFT 反变换，得到离散系统单位取样响应 h[n]。'
          ],
          guide3d: '三维空间将 [-π, π] 频率响应画为三维复螺旋 (ω, Re{H}, Im{H})，同时在底部二维示波器实时同步更新幅频响应 |H(e^{jω})| 与时域单位取样响应 h[n] 衰减振荡序列！'
        },
        matlab(p) {
          const th = p.thetaPi * Math.PI;
          return `% Ch5.5 线性常系数差分方程频率响应 H(e^{jw}) 与单位取样响应 h[n]
r = ${M.fmt(p.r, 2)}; theta0 = ${M.fmt(th, 3)};
${p.sysType === 'iir2' ? 'b = [1]; a = [1, -2*r*cos(theta0), r^2];' : `p_pole = ${p.thetaPi > 0.5 ? -p.r : p.r}; b = [1 - abs(p_pole)]; a = [1, -p_pole];`}
w = -pi:0.01:pi;
H = freqz(b, a, w);
subplot(2,1,1); plot(w/pi, abs(H), 'g', 'LineWidth', 2); grid on; xlabel('\omega/\pi'); title('|H(e^{j\omega})|');
subplot(2,1,2); n = 0:30; stem(n, filter(b, a, [1 zeros(1,30)]), 'filled'); grid on; title('单位取样响应 h[n]');`;
        },
        quiz: {
          question: '已知因果稳定离散 LTI 系统满足差分方程 y[n] - 0.5 y[n-1] = x[n]，则其频率响应 H(e^{jω}) 与单位取样响应 h[n] 为：',
          options: [
            'H(e^{jω}) = 1 / (1 - 0.5e^{-jω})，h[n] = (0.5)ⁿ u[n]',
            'H(e^{jω}) = 1 / (1 + 0.5e^{-jω})，h[n] = (-0.5)ⁿ u[n]',
            'H(e^{jω}) = 1 - 0.5e^{-jω}，h[n] = δ[n] - 0.5δ[n-1]',
            'H(e^{jω}) = 1 / (jω - 0.5)'
          ],
          answer: 0,
          explanation: '对差分方程两边取 DTFT 得 Y(e^{jω})(1 - 0.5e^{-jω}) = X(e^{jω})，故 H(e^{jω}) = 1/(1 - 0.5e^{-jω})，对照基本变换对即得 h[n] = (0.5)ⁿ u[n]。'
        },
        compute(p) {
          const th0 = p.thetaPi * Math.PI;
          const ws = M.linspace(-Math.PI, Math.PI, 300);
          const h3d = [], pMag = [], pPh = [];
          let maxMag = 0;

          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            let H;
            if (p.sysType === 'iir2') {
              const e1 = M.cExp(0, -w), e2 = M.cExp(0, -2 * w);
              const den = {
                re: 1 - 2 * p.r * Math.cos(th0) * e1.re + p.r * p.r * e2.re,
                im: -2 * p.r * Math.cos(th0) * e1.im + p.r * p.r * e2.im
              };
              H = M.cDiv({ re: 1 - p.r, im: 0 }, den); // normalized gain for clean display
            } else {
              const pole = p.thetaPi >= 0.5 ? -p.r : p.r;
              H = M.cDiv({ re: 1 - Math.abs(pole), im: 0 }, { re: 1 - pole * Math.cos(w), im: pole * Math.sin(w) });
            }
            const mag = M.cAbs(H);
            if (mag > maxMag) maxMag = mag;
            h3d.push([(w / Math.PI) * 4.5, H.re, H.im]);
            pMag.push([w / Math.PI, mag]);
            pPh.push([w / Math.PI, M.cArg(H)]);
          }

          // Compute impulse response h[n] directly from difference equation
          const hnPts = [];
          let ym1 = 0, ym2 = 0;
          const a1 = p.sysType === 'iir2' ? -2 * p.r * Math.cos(th0) : -(p.thetaPi >= 0.5 ? -p.r : p.r);
          const a2 = p.sysType === 'iir2' ? p.r * p.r : 0;
          const b0 = 1 - p.r;
          for (let n = 0; n <= 26; n++) {
            const xn = n === 0 ? 1 : 0;
            const yn = b0 * xn - a1 * ym1 - a2 * ym2;
            hnPts.push([n, yn]);
            ym2 = ym1;
            ym1 = yn;
          }

          return {
            scene: {
              axes: {
                x: { min: -4.5, max: 4.5, label: '数字角频率 ω (-π ~ +π)', format: (v) => `${M.fmt(v / 4.5, 1)}π` },
                y: { min: -2.5, max: 2.5, label: '实部 Re{H(e^{jω})}' },
                z: { min: -2.5, max: 2.5, label: '虚部 Im{H(e^{jω})}' }
              },
              curves: [
                { points: h3d, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, shadowXY: true, shadowYZ: true, pickable: true, label: 'H(e^{jω})' }
              ],
              legend: [{ color: '#34d399', label: '3D 离散频率响应螺旋 H(e^{jω})' }]
            },
            plots2d: [
              { title: '离散幅频特性 |H(e^{jω})| [绿] 与相位谱 [黄虚]', xMin: -1, xMax: 1, yMin: -3.2, yMax: Math.max(2.0, maxMag * 1.15), xLabel: '×π', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.2 }, { points: pPh, color: '#fbbf24', dashed: true, width: 1.4 }] },
              { title: '差分方程单位取样响应 h[n]', xMin: 0, xMax: 26, yMin: -1.1, yMax: 1.1, xLabel: 'n', series: [{ points: hnPts, type: 'stems', color: '#38bdf8' }] }
            ],
            metrics: [
              { label: '差分方程反馈阶数', value: p.sysType === 'iir2' ? '二阶 IIR 系统' : '一阶 IIR 系统', status: 'ok' },
              { label: '因果稳定条件 r<1', value: `r = ${M.fmt(p.r, 2)} < 1 (稳定✓)`, status: 'ok' },
              { label: '谐振中心频率', value: p.sysType === 'iir2' ? `±${M.fmt(p.thetaPi, 2)}π rad` : p.thetaPi >= 0.5 ? '±π (高通)' : '0 (低通)' },
              { label: '幅频峰值 max|H|', value: M.fmt(maxMag, 3) }
            ]
          };
        }
      }
    ]
  });
})();
