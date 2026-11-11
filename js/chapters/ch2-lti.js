/**
 * 第 2 章：线性时不变系统 (Chapter 2) — 5 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 2 章全部 5 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch2',
    number: '第 2 章',
    title: '第 2 章：线性时不变系统',
    shortTitle: 'Ch2 线性时不变系统',
    weeks: '第 3–4 周 · 4 学时',
    syllabusItems: '离散卷积和、连续卷积积分、LTI性质、微分与差分方程全响应分解、奇异函数',
    cases: [
      /* ==================== 2.1 ==================== */
      {
        id: '2.1',
        code: 'Ch2-(1)',
        level: '掌握',
        title: '2.1 离散时间 LTI 系统：卷积和 3D 四步法动态解剖',
        summary: '在三维空间同时呈现 x[k]、翻折移位 h[n₀-k]、乘积序列 x[k]h[n₀-k] 及累积卷积结果 y[n]！',
        presets: [
          { label: '矩形序列 * 指数衰减序列', values: { xType: 'rect4', hType: 'exp', n0: 3, alpha: 0.7 } },
          { label: '两等宽矩形脉冲卷积→三角序列', values: { xType: 'rect4', hType: 'rect4', n0: 3, alpha: 0.7 } },
          { label: '斜坡脉冲 * 双冲激回声系统', values: { xType: 'ramp', hType: 'echo', n0: 4, alpha: 0.65 } }
        ],
        controls: [
          {
            key: 'xType', label: '输入序列 x[n]', type: 'select', default: 'rect4',
            options: [
              { value: 'rect4', label: '4点矩形序列 R₄[n] (n=0..3)' },
              { value: 'ramp', label: '递增斜坡序列 (n+1)·R₄[n]/3' },
              { value: 'bipulse', label: '正负双极脉冲 [1, 1, -1]' }
            ]
          },
          {
            key: 'hType', label: '单位取样响应 h[n]', type: 'select', default: 'exp',
            options: [
              { value: 'exp', label: '单边指数序列 αⁿ·u[n] (截断展示)' },
              { value: 'rect4', label: '4点矩形窗 R₄[n]' },
              { value: 'echo', label: '多径回声系统 δ[n] + α·δ[n-3]' }
            ]
          },
          { key: 'n0', label: '当前观察滑动位移 n₀', type: 'range', min: -2, max: 9, step: 1, default: 3 },
          { key: 'alpha', label: '系统衰减/回声系数 α', type: 'range', min: 0.3, max: 0.9, step: 0.05, default: 0.7 }
        ],
        theory: {
          formula: 'y[n₀] = x[n] * h[n] |_{n=n₀} = ∑_{k=-∞}^{+∞} x[k] · h[n₀ - k]   （翻折 → 移位 n₀ → 相乘 → 求和）',
          objectives: [
            '【掌握】离散系统单位取样响应 h[n] 的物理意义及卷积和的四步图解/解析求解方法；',
            '【理解】任意输入序列分解为加权移位单位脉冲 ∑x[k]δ[n-k] 后，由线性与时不变性导出卷积和的过程。'
          ],
          guide3d: '沿深度轴 Y 分设四道轨道：① x[k] 固定不动；② h[n₀-k] 随滑块 n₀ 向右滑移；③ 黄色针状图为重叠乘积 v[k]=x[k]h[n₀-k]；④ 最前排绿针为对黄色针求和得到的最终卷积输出 y[n]，红点高亮当前时刻 y[n₀]！'
        },
        matlab(p) {
          return `% Ch2.1 离散时间 LTI 系统卷积和 y[n] = conv(x, h)
n_x = 0:3;
x = ${p.xType === 'rect4' ? 'ones(1,4)' : p.xType === 'ramp' ? '(1:4)/3' : '[1, 1, -1, 0]'};
n_h = 0:6; alpha = ${M.fmt(p.alpha, 2)};
h = ${p.hType === 'exp' ? 'alpha .^ n_h' : p.hType === 'rect4' ? '[1 1 1 1 0 0 0]' : '[1, 0, 0, alpha, 0, 0, 0]'};
y = conv(x, h);
n_y = (n_x(1)+n_h(1)) : (n_x(end)+n_h(end));
subplot(3,1,1); stem(n_x, x, 'filled'); title('输入序列 x[n]'); grid on; xlim([-3 10]);
subplot(3,1,2); stem(n_h, h, 'filled'); title('单位取样响应 h[n]'); grid on; xlim([-3 10]);
subplot(3,1,3); stem(n_y, y, 'g', 'filled'); title('卷积和输出 y[n] = x[n] * h[n]'); grid on; xlim([-3 10]);`;
        },
        quiz: {
          question: '设有限长序列 x[n] 长度为 N₁ = 4（非零范围 0≤n≤3），h[n] 长度为 N₂ = 5（非零范围 0≤n≤4），则卷积和 y[n] = x[n]*h[n] 的非零点数长度为：',
          options: ['N₁ + N₂ - 1 = 8 点', 'N₁ + N₂ = 9 点', 'max(N₁, N₂) = 5 点', 'N₁ × N₂ = 20 点'],
          answer: 0,
          explanation: '有限长序列卷积起始点为 0+0=0，终止点为 3+4=7，共计 7 - 0 + 1 = 8 = N₁ + N₂ - 1 个非零样本点。'
        },
        compute(p) {
          const evalX = (k) => {
            if (p.xType === 'rect4') return k >= 0 && k <= 3 ? 1.0 : 0;
            if (p.xType === 'ramp') return k >= 0 && k <= 3 ? (k + 1) / 3 : 0;
            return k === 0 || k === 1 ? 1.0 : k === 2 ? -1.0 : 0;
          };
          const evalH = (m) => {
            if (p.hType === 'exp') return m >= 0 && m <= 7 ? Math.pow(p.alpha, m) : 0;
            if (p.hType === 'rect4') return m >= 0 && m <= 3 ? 1.0 : 0;
            return m === 0 ? 1.0 : m === 3 ? p.alpha : 0;
          };

          const n0 = Math.round(p.n0);
          const sX = [], sHFlip = [], sProd = [], sY = [];
          const p2dProd = [], p2dY = [];
          let sumAtN0 = 0;

          for (let k = -4; k <= 10; k++) {
            const xv = evalX(k);
            const hv = evalH(n0 - k);
            const pv = xv * hv;
            sumAtN0 += pv;
            sX.push([k, 1.5, xv]);
            sHFlip.push([k, 0.5, hv]);
            sProd.push([k, -0.5, pv]);
            p2dProd.push([k, pv]);
          }

          for (let n = -4; n <= 10; n++) {
            let yn = 0;
            for (let k = -4; k <= 10; k++) yn += evalX(k) * evalH(n - k);
            sY.push([n, -1.5, yn]);
            p2dY.push([n, yn]);
          }

          return {
            scene: {
              axes: {
                x: { min: -4, max: 10, label: '哑变量 k / 时刻 n' },
                y: { min: -2.0, max: 2.0, label: '卷积四步轨道', ticks: [-1.5, -0.5, 0.5, 1.5], format: (v) => (v > 1 ? 'x[k]' : v > 0 ? 'h[n₀-k]' : v > -1 ? '乘积' : 'y[n]') },
                z: { min: -1.2, max: 3.6, label: '序列幅值' }
              },
              stems: [
                { points: sX, baseZ: 0, color: '#38bdf8', width: 1.9, radius: 3.6, label: 'x[k]' },
                { points: sHFlip, baseZ: 0, color: '#a78bfa', width: 1.9, radius: 3.6, label: `h[${n0}-k]` },
                { points: sProd, baseZ: 0, color: '#fbbf24', width: 2.3, radius: 4.2, label: '乘积 x[k]h[n₀-k]' },
                {
                  points: sY, baseZ: 0, width: 2.3, radius: 4.2, label: '卷积输出 y[n]',
                  pointColor: (_, pt) => (Math.round(pt[0]) === n0 ? '#f43f5e' : '#34d399')
                }
              ],
              markers: [
                { pos: [n0, -1.5, sumAtN0], shape: 'diamond', color: '#f43f5e', size: 7.5, label: `y[${n0}]=${M.fmt(sumAtN0, 2)}` }
              ],
              legend: [
                { color: '#38bdf8', label: '① x[k]' },
                { color: '#a78bfa', label: `② 翻折移位 h[${n0}-k]` },
                { color: '#fbbf24', label: '③ 重叠乘积 x[k]h[n₀-k]' },
                { color: '#34d399', label: '④ 卷积和 y[n] (红点为当前n₀)' }
              ]
            },
            plots2d: [
              { title: `当前位移 n₀ = ${n0} 时的乘积序列 v[k] = x[k]h[${n0}-k]`, xMin: -4, xMax: 10, yMin: -1.2, yMax: 2.0, xLabel: 'k', series: [{ points: p2dProd, type: 'stems', color: '#fbbf24' }] },
              { title: '完整卷积和序列 y[n] = ∑ x[k]h[n-k]', xMin: -4, xMax: 10, yMin: -1.2, yMax: 3.6, xLabel: 'n', series: [{ points: p2dY, type: 'stems', color: '#34d399' }], vLines: [{ x: n0, color: '#f43f5e' }] }
            ],
            metrics: [
              { label: '当前观察时刻 n₀', value: `n₀ = ${n0}`, status: 'ok' },
              { label: `当前卷积值 y[${n0}]`, value: M.fmt(sumAtN0, 3) },
              { label: '峰值输出 max(y[n])', value: M.fmt(Math.max(...sY.map((s) => s[2])), 3) },
              { label: '因果性验证', value: 'x,h因果 ⇒ y[n<0]=0 ✓' }
            ]
          };
        }
      },

      /* ==================== 2.2 ==================== */
      {
        id: '2.2',
        code: 'Ch2-(2)',
        level: '掌握',
        title: '2.2 连续时间 LTI 系统：卷积积分 3D 被积曲面与滑动面积',
        summary: '构建三维 (τ, t, x(τ)h(t-τ)) 被积乘积曲面！沿切面 t=t₀ 对阴影重叠面积积分即得侧壁卷积输出 y(t₀)！',
        camera: { azimuth: -0.88, elevation: 0.52, zoom: 1.0 },
        presets: [
          { label: '门脉冲过 RC 系统（充放电经典波形）', values: { pair: 'rectExp', t0: 1.6, width: 2.0, alpha: 1.0 } },
          { label: '双等宽矩形门卷积 → 三角脉冲', values: { pair: 'rectRect', t0: 1.2, width: 1.8, alpha: 1.0 } },
          { label: '双单边指数卷积 → t·e^(-αt)u(t)', values: { pair: 'expExp', t0: 1.8, width: 2.0, alpha: 1.1 } }
        ],
        controls: [
          {
            key: 'pair', label: '经典卷积积分组合', type: 'select', default: 'rectExp',
            options: [
              { value: 'rectExp', label: '矩形脉冲 u(t)-u(t-T)  *  RC指数 e^(-αt)u(t)' },
              { value: 'rectRect', label: '矩形门脉冲  *  矩形门脉冲  →  三角波' },
              { value: 'expExp', label: '单边指数 e^(-αt)u(t)  *  e^(-αt)u(t)  →  t·e^(-αt)u(t)' }
            ]
          },
          { key: 't0', label: '当前积分观察切面时刻 t₀', type: 'range', min: -0.8, max: 4.8, step: 0.1, default: 1.6, unit: 's' },
          { key: 'width', label: '输入脉冲宽度 T', type: 'range', min: 0.8, max: 3.0, step: 0.2, default: 2.0, unit: 's' },
          { key: 'alpha', label: '系统衰减系数 α', type: 'range', min: 0.5, max: 2.0, step: 0.1, default: 1.0 }
        ],
        theory: {
          formula: 'y(t) = x(t) * h(t) = ∫_{-∞}^{+∞} x(τ) · h(t - τ) dτ   （三维曲面 g(τ,t)=x(τ)h(t-τ) 沿 τ 方向的横截面面积！）',
          objectives: [
            '【掌握】连续时间卷积积分的分段区间划分与解析求解方法（无重叠区、部分进入区、完全包含区、部分滑出区）；',
            '【理解】单位冲激响应 h(t) 完全表征连续 LTI 系统输入-输出关系的物理本质。'
          ],
          guide3d: '这是理解卷积积分最直观的三维几何视角：底面 X 轴为积分哑变量 τ，Y 轴为观察时刻 t，高度 Z 为乘积 x(τ)h(t-τ)。拖动 t₀ 滑块移动琥珀色发光切面，切面下的阴影面积就是右侧绿色卷积曲线在 t₀ 处的高度 y(t₀)！'
        },
        matlab(p) {
          return `% Ch2.2 连续时间卷积积分数值与解析验证
dt = 0.01; tau = -1.5:dt:5.5;
T = ${M.fmt(p.width, 2)}; alpha = ${M.fmt(p.alpha, 2)};
${p.pair === 'rectExp' ? 'x = double(tau >= 0 & tau <= T);\nh = exp(-alpha * tau) .* (tau >= 0);' :
  p.pair === 'rectRect' ? 'x = double(tau >= 0 & tau <= T);\nh = double(tau >= 0 & tau <= T);' :
  'x = exp(-alpha * tau) .* (tau >= 0);\nh = exp(-alpha * tau) .* (tau >= 0);'}
y = conv(x, h) * dt;
t_y = (2*tau(1)) : dt : (2*tau(end));
plot(tau, x, '--b', tau, h, ':m', t_y, y, 'g', 'LineWidth', 2);
xlim([-1 5.5]); grid on; legend('x(t)', 'h(t)', '卷积积分 y(t) = x(t)*h(t)');`;
        },
        quiz: {
          question: '两个宽度均为 T 的因果矩形脉冲 x(t) = u(t) - u(t-T) 与 h(t) = u(t) - u(t-T) 进行卷积积分，所得结果 y(t) 的波形及峰值分别为：',
          options: ['底宽为 2T 的对称三角形脉冲，在 t = T 处取得峰值 T', '底宽为 T 的矩形脉冲，峰值 1', '底宽为 2T 的梯形脉冲，峰值 2T', '指数充放电波形，峰值 1 - e^(-T)'],
          answer: 0,
          explanation: '当 0≤t≤T 时重叠长度为 t；当 T≤t≤2T 时重叠长度为 2T-t；在 t=T 完全重合时刻积分面积达到最大 T，全波形为 [0, 2T] 上的对称三角波。'
        },
        compute(p) {
          const evalX = (tau) => {
            if (p.pair === 'expExp') return tau >= 0 ? Math.exp(-p.alpha * tau) : 0;
            return tau >= 0 && tau <= p.width ? 1.0 : 0;
          };
          const evalH = (u) => {
            if (p.pair === 'rectRect') return u >= 0 && u <= p.width ? 1.0 : 0;
            return u >= 0 ? Math.exp(-p.alpha * u) : 0;
          };

          // Build 3D surface g(tau, t) = x(tau) * h(t - tau)
          const taus = M.linspace(-1, 4.5, 36);
          const ts = M.linspace(-1, 5.0, 36);
          const zm = [];
          for (let i = 0; i < taus.length; i++) {
            const col = new Float64Array(ts.length);
            for (let j = 0; j < ts.length; j++) {
              col[j] = evalX(taus[i]) * evalH(ts[j] - taus[i]);
            }
            zm.push(col);
          }

          // Fine slice at t = t0 and full output y(t)
          const fineTau = M.linspace(-1, 4.5, 220);
          const dTau = fineTau[1] - fineTau[0];
          const sliceCurve = [];
          const p2dX = [], p2dHFlip = [], p2dProd = [];
          let yt0 = 0;
          for (let i = 0; i < fineTau.length; i++) {
            const tau = fineTau[i];
            const xv = evalX(tau);
            const hv = evalH(p.t0 - tau);
            const prod = xv * hv;
            yt0 += prod * dTau;
            sliceCurve.push([tau, p.t0, prod]);
            p2dX.push([tau, xv]);
            p2dHFlip.push([tau, hv]);
            p2dProd.push([tau, prod]);
          }

          const fineT = M.linspace(-1, 5.0, 180);
          const yWallCurve = [];
          const p2dY = [];
          for (let j = 0; j < fineT.length; j++) {
            const tj = fineT[j];
            let s = 0;
            for (let i = 0; i < fineTau.length; i++) {
              s += evalX(fineTau[i]) * evalH(tj - fineTau[i]) * dTau;
            }
            yWallCurve.push([4.5, tj, s]);
            p2dY.push([tj, s]);
          }

          const phaseState =
            p.t0 < 0 ? '无重叠区 (t₀ < 0)' :
            p.pair !== 'expExp' && p.t0 <= p.width ? '部分滑入重叠区 (0 ≤ t₀ ≤ T)' :
            p.pair === 'rectRect' && p.t0 > 2 * p.width ? '完全滑出分离区' : '滑出衰减/完全重叠后区';

          return {
            scene: {
              axes: {
                x: { min: -1, max: 4.5, label: '积分变量 τ (s)' },
                y: { min: -1, max: 5.0, label: '滑动观察时刻 t (s)' },
                z: { min: 0, max: Math.max(1.4, p.width * 1.05), label: '被积乘积 / 卷积积分 y(t)' }
              },
              surfaces: [
                { xGrid: taus, yGrid: ts, zMatrix: zm, zMin: 0, zMax: 1.05, opacity: 0.62, wireframe: true }
              ],
              planes: [
                { axis: 'y', value: p.t0, xMin: -1, xMax: 4.5, zMin: 0, zMax: Math.max(1.4, p.width), color: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.55)', dashed: true }
              ],
              ribbons: [
                { points: sliceCurve, baseZ: 0, color: 'rgba(251,191,36,0.42)' },
                { points: yWallCurve, baseZ: 0, color: 'rgba(52,211,153,0.22)' }
              ],
              curves: [
                { points: sliceCurve, color: '#fbbf24', width: 3.0, glow: true, label: `t₀=${M.fmt(p.t0, 1)} 截面乘积` },
                { points: yWallCurve, color: '#34d399', width: 3.2, glow: true, label: '积分结果 y(t)', pickable: true }
              ],
              markers: [
                { pos: [4.5, p.t0, yt0], shape: 'dot', color: '#f43f5e', size: 7, label: `y(${M.fmt(p.t0, 1)})=${M.fmt(yt0, 2)}` }
              ],
              legend: [
                { color: '#38bdf8', label: '3D 被积曲面 x(τ)h(t-τ)' },
                { color: '#fbbf24', label: `t₀=${M.fmt(p.t0, 1)}s 重叠积分截面` },
                { color: '#34d399', label: '侧壁卷积结果曲线 y(t)' }
              ]
            },
            plots2d: [
              {
                title: `截面 τ 域重叠：x(τ) [蓝] · h(${M.fmt(p.t0, 1)}-τ) [紫] → 乘积面积 [黄]`,
                xMin: -1, xMax: 4.5, yMin: -0.1, yMax: 1.3, xLabel: 'τ',
                series: [
                  { points: p2dX, color: '#38bdf8', width: 1.8 },
                  { points: p2dHFlip, color: '#a78bfa', dashed: true, width: 1.8 },
                  { points: p2dProd, color: '#fbbf24', fill: 'rgba(251,191,36,0.3)', width: 2.2 }
                ]
              },
              {
                title: '卷积积分全曲线 y(t) = ∫ x(τ)h(t-τ) dτ',
                xMin: -1, xMax: 5.0, yMin: -0.1, yMax: Math.max(1.4, p.width * 1.1), xLabel: 't',
                series: [{ points: p2dY, color: '#34d399', fill: 'rgba(52,211,153,0.16)', width: 2.4 }],
                vLines: [{ x: p.t0, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '卷积区间阶段', value: phaseState, status: 'ok' },
              { label: `当前积分面积 y(${M.fmt(p.t0, 1)})`, value: M.fmt(yt0, 3) },
              { label: '全响应峰值 max y(t)', value: M.fmt(Math.max(...p2dY.map((q) => q[1])), 3) },
              { label: '面积乘积性质 ∫y dt', value: `(=∫x·∫h) ${M.fmt(p2dY.reduce((s, q) => s + q[1], 0) * (fineT[1] - fineT[0]), 2)}` }
            ]
          };
        }
      },

      /* ==================== 2.3 ==================== */
      {
        id: '2.3',
        code: 'Ch2-(3)',
        level: '理解',
        title: '2.3 LTI 系统的性质：级联、并联、交换律与因果 BIBO 稳定性',
        summary: '验证冲激响应交换律、级联等效 h₁*h₂、并联等效 h₁+h₂，以及 ∫|h(τ)|dτ < ∞ 的 BIBO 稳定边界！',
        presets: [
          { label: '级联结合律 (x*h₁)*h₂ ≡ x*(h₁*h₂)', values: { prop: 'cascade', a1: 1.2, a2: 0.7 } },
          { label: '并联分配律 x*h₁ + x*h₂ ≡ x*(h₁+h₂)', values: { prop: 'parallel', a1: 1.4, a2: 0.6 } },
          { label: 'BIBO 稳定系统 h(t)=e^(-0.8t)u(t)', values: { prop: 'stability', a1: 0.8, a2: 1.0 } },
          { label: 'BIBO 不稳定发散系统 h(t)=e^(+0.35t)u(t)', values: { prop: 'stability', a1: -0.35, a2: 1.0 } }
        ],
        controls: [
          {
            key: 'prop', label: 'LTI 性质验证项', type: 'select', default: 'cascade',
            options: [
              { value: 'cascade', label: '结合律（级联互换）：(x*h₁)*h₂ ≡ (x*h₂)*h₁ ≡ x*(h₁*h₂)' },
              { value: 'parallel', label: '分配律（并联等效）：x*h₁ + x*h₂ ≡ x*(h₁ + h₂)' },
              { value: 'commute', label: '交换律：x(t)*h(t) ≡ h(t)*x(t)' },
              { value: 'stability', label: '因果性与 BIBO 稳定性判据：∫|h(τ)|dτ < ∞' }
            ]
          },
          { key: 'a1', label: '子系统 1 衰减率 α₁ (<0 则极点发散!)', type: 'range', min: -0.45, max: 2.0, step: 0.05, default: 1.2 },
          { key: 'a2', label: '子系统 2 衰减率 α₂', type: 'range', min: 0.3, max: 2.0, step: 0.1, default: 0.7 }
        ],
        theory: {
          formula: '交换律 x*h = h*x； 级联 h_eq = h₁*h₂； 并联 h_eq = h₁+h₂； 因果 h(t)=0(t<0)； 稳定 ∫_{-∞}^∞ |h(τ)|dτ < ∞',
          objectives: [
            '【理解】卷积代数三定律（交换律、结合律、分配律）在系统方框图化简与子系统级联次序互换中的工程意义；',
            '【掌握】通过冲激响应 h(t) 直接判别 LTI 系统的因果性与有界输入有界输出（BIBO）稳定性。'
          ],
          guide3d: '三维视图并列对比不同结构实现路径的时域轨迹：在级联/并联/交换模式下两条路径完全重合；切换到“BIBO 稳定性判据”并将 α₁ 拖至负值，可直观看到 ∫|h(τ)|dτ 发散导致有界阶跃输入引发指数失控！'
        },
        matlab(p) {
          return `% Ch2.3 LTI 系统级联/并联等效冲激响应与稳定性验证
dt = 0.01; t = 0:dt:8;
a1 = ${M.fmt(p.a1, 2)}; a2 = ${M.fmt(p.a2, 2)};
h1 = exp(-a1 * t); h2 = exp(-a2 * t);
x = double(t <= 2.0); % 有界门脉冲激励
y_pathA = conv(conv(x, h1)*dt, h2)*dt;
h_cascade = conv(h1, h2)*dt;
y_pathB = conv(x, h_cascade)*dt;
fprintf('级联路径最大数值误差: %.2e, ||h1||_1 积分 = %.3f\\n', max(abs(y_pathA - y_pathB)), trapz(t, abs(h1)));`;
        },
        quiz: {
          question: '某连续时间 LTI 系统的单位冲激响应为 h(t) = e^{2t} u(-t - 1)，则该系统的因果性与 BIBO 稳定性为：',
          options: ['非因果，但 BIBO 稳定', '因果，且 BIBO 稳定', '非因果，且不稳定', '因果，但不稳定'],
          answer: 0,
          explanation: '① 因 t < -1 时 h(t) ≠ 0（在 t < 0 区间非零），故系统非因果；② 绝对可积检验：∫_{-∞}^{-1} e^{2t} dt = (1/2)e^{-2} < ∞ 收敛，故系统是 BIBO 稳定的！'
        },
        compute(p) {
          const ts = M.linspace(0, 7, 180);
          const dt = ts[1] - ts[0];
          const xArr = ts.map((t) => (t <= 2.0 ? 1.0 : 0));
          const h1 = ts.map((t) => Math.exp(-p.a1 * t));
          const h2 = ts.map((t) => Math.exp(-p.a2 * t));

          const convTrunc = (a, b) => {
            const out = new Float64Array(ts.length);
            for (let n = 0; n < ts.length; n++) {
              let s = 0;
              for (let k = 0; k <= n; k++) s += a[k] * b[n - k];
              out[n] = s * dt;
            }
            return out;
          };

          let tr1, tr2, tr3, labels;
          let absInt = 0;
          for (let i = 0; i < ts.length; i++) absInt += Math.abs(h1[i]) * dt;

          if (p.prop === 'cascade') {
            tr1 = convTrunc(convTrunc(xArr, h1), h2);
            tr2 = convTrunc(convTrunc(xArr, h2), h1);
            tr3 = convTrunc(xArr, convTrunc(h1, h2));
            labels = ['先过h₁再过h₂', '互换先h₂再h₁', '等效 h_eq=h₁*h₂'];
          } else if (p.prop === 'parallel') {
            const y1 = convTrunc(xArr, h1), y2 = convTrunc(xArr, h2);
            tr1 = y1;
            tr2 = y2;
            tr3 = ts.map((_, i) => y1[i] + y2[i]);
            labels = ['支路 y₁=x*h₁', '支路 y₂=x*h₂', '并联总输出 y₁+y₂'];
          } else if (p.prop === 'commute') {
            tr1 = convTrunc(xArr, h1);
            tr2 = convTrunc(h1, xArr);
            tr3 = ts.map((_, i) => tr1[i] - tr2[i]);
            labels = ['x(t) * h₁(t)', 'h₁(t) * x(t)', '交换误差 ≡ 0'];
          } else {
            const stepIn = ts.map(() => 1.0);
            tr1 = h1.map((v) => Math.min(4.5, v));
            tr2 = convTrunc(stepIn, h1).map((v) => Math.min(4.5, v));
            let cSum = 0;
            tr3 = h1.map((v) => {
              cSum += Math.abs(v) * dt;
              return Math.min(4.5, cSum);
            });
            labels = ['冲激响应 h(t)', '有界阶跃响应 s(t)', '绝对积分 ∫|h|dτ'];
          }

          const mk3 = (arr, yVal) => ts.map((t, i) => [t, yVal, arr[i]]);
          const c1 = mk3(tr1, 1.2), c2 = mk3(tr2, 0), c3 = mk3(tr3, -1.2);
          const zTop = Math.max(1.8, ...tr1, ...tr2, ...tr3) * 1.08;

          return {
            scene: {
              axes: {
                x: { min: 0, max: 7, label: '时间 t (s)' },
                y: { min: -1.8, max: 1.8, label: '信号对比轨道', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '轨1' : v < -0.5 ? '轨3' : '轨2') },
                z: { min: -0.2, max: Math.min(4.8, zTop), label: '响应幅值' }
              },
              ribbons: [{ points: c3, baseZ: 0, color: p.prop === 'stability' && p.a1 <= 0 ? 'rgba(244,63,94,0.25)' : 'rgba(52,211,153,0.2)' }],
              curves: [
                { points: c1, color: '#38bdf8', width: 2.5, label: labels[0] },
                { points: c2, color: '#fbbf24', width: 2.5, label: labels[1] },
                { points: c3, color: p.prop === 'stability' && p.a1 <= 0 ? '#f43f5e' : '#34d399', width: 3.0, glow: true, shadowXZ: true, label: labels[2] }
              ],
              legend: [
                { color: '#38bdf8', label: labels[0] },
                { color: '#fbbf24', label: labels[1] },
                { color: p.prop === 'stability' && p.a1 <= 0 ? '#f43f5e' : '#34d399', label: labels[2] }
              ]
            },
            plots2d: [
              {
                title: `${labels[0]} 与 ${labels[1]} 二维对照`,
                xMin: 0, xMax: 7, yMin: -0.2, yMax: Math.min(4.8, zTop), xLabel: 't',
                series: [
                  { points: ts.map((t, i) => [t, tr1[i]]), color: '#38bdf8', width: 2.1 },
                  { points: ts.map((t, i) => [t, tr2[i]]), color: '#fbbf24', dashed: true, width: 2.1 }
                ]
              },
              {
                title: labels[2],
                xMin: 0, xMax: 7, yMin: -0.2, yMax: Math.min(4.8, zTop), xLabel: 't',
                series: [{ points: ts.map((t, i) => [t, tr3[i]]), color: p.prop === 'stability' && p.a1 <= 0 ? '#f43f5e' : '#34d399', fill: 'rgba(52,211,153,0.14)', width: 2.2 }]
              }
            ],
            metrics: [
              { label: 'BIBO 稳定性判别', value: p.a1 > 0.001 ? '稳定 (∫|h|dt = 1/α₁ < ∞)' : p.a1 === 0 ? '临界不稳定 (积分线性增长)' : '不稳定发散 (∫|h|dt = ∞)', status: p.a1 > 0.001 ? 'ok' : 'err' },
              { label: '理论 L1 范数 1/α₁', value: p.a1 > 0 ? M.fmt(1 / p.a1, 3) : '∞' },
              { label: '[0,7s] 数值绝对积分', value: M.fmt(absInt, 3) },
              { label: '因果性 h(t<0)=0', value: '严格因果系统 ✓', status: 'ok' }
            ]
          };
        }
      },

      /* ==================== 2.4 ==================== */
      {
        id: '2.4',
        code: 'Ch2-(4)',
        level: '掌握',
        title: '2.4 微分方程因果 LTI 系统：全响应的三种正交分解',
        summary: '对同一微分方程全响应 y(t)，在三维空间同步对比【零输入 ZIR + 零状态 ZSR】与【自由响应 + 强迫响应】！',
        presets: [
          { label: '二阶欠阻尼阶跃激励 (含初态 y(0⁻)=1.2)', values: { wn: 2.6, zeta: 0.3, y0: 1.2, dy0: 0, inType: 'step' } },
          { label: '纯零输入自由振荡放电 (x(t)=0)', values: { wn: 3.0, zeta: 0.2, y0: 1.5, dy0: 1.0, inType: 'zero' } },
          { label: '正弦激励：暂态衰减 → 正弦稳态响应', values: { wn: 2.8, zeta: 0.35, y0: -0.8, dy0: 0, inType: 'cos' } }
        ],
        controls: [
          {
            key: 'inType', label: '外部激励信号 x(t) (t≥0)', type: 'select', default: 'step',
            options: [
              { value: 'step', label: '单位阶跃激励 u(t)' },
              { value: 'cos', label: '余弦激励 cos(1.6t)u(t) [观察暂态+稳态!]' },
              { value: 'zero', label: '零输入 x(t) = 0 [纯零输入响应]' }
            ]
          },
          { key: 'wn', label: '固有角频率 ω_n', type: 'range', min: 1.2, max: 4.5, step: 0.2, default: 2.6, unit: 'rad/s' },
          { key: 'zeta', label: '阻尼比 ζ (决定特征根实部 -ζω_n)', type: 'range', min: 0.1, max: 1.3, step: 0.05, default: 0.3 },
          { key: 'y0', label: '初始状态 y(0⁻)', type: 'range', min: -1.5, max: 1.8, step: 0.1, default: 1.2 },
          { key: 'dy0', label: '初始导数 dy/dt(0⁻)', type: 'range', min: -2.0, max: 2.0, step: 0.2, default: 0 }
        ],
        theory: {
          formula: 'y_total(t) = y_zi(t)[零输入] + y_zs(t)[零状态]  =  y_nat(t)[自由/固有模态] + y_for(t)[强迫/稳态]',
          objectives: [
            '【掌握】线性常系数微分方程的时域求解方法；',
            '【理解】特征多项式、特征根（固有频率 λ = -ζω_n ± jω_d）的意义，以及全响应三大分解视角（零输入+零状态、自由+强迫、暂态+稳态）的内在联系。'
          ],
          guide3d: '大纲核心难点一图打通！三维空间并列展示：零输入响应 y_zi（储能单独激发）、零状态响应 y_zs（外力单独激发，注意它也包含固有衰减模态！）、强迫稳态响应 y_for，以及最前方的全响应 y_total = y_zi + y_zs！'
        },
        matlab(p) {
          return `% Ch2.4 二阶微分方程 y'' + 2*zeta*wn*y' + wn^2*y = wn^2*x(t) 全响应分解
wn = ${M.fmt(p.wn, 2)}; zeta = ${M.fmt(p.zeta, 2)};
y0 = ${M.fmt(p.y0, 2)}; dy0 = ${M.fmt(p.dy0, 2)};
% 使用状态空间或 RK4 分解零输入响应 y_zi 与零状态响应 y_zs
A = [0, 1; -wn^2, -2*zeta*wn]; B = [0; wn^2]; C = [1, 0];
t = 0:0.01:8;
u = ${p.inType === 'step' ? 'ones(size(t))' : p.inType === 'cos' ? 'cos(1.6*t)' : 'zeros(size(t))'};
sys = ss(A, B, C, 0);
y_zi = initial(sys, [y0; dy0], t);
y_zs = lsim(sys, u, t, [0; 0]);
plot(t, y_zi, '--b', t, y_zs, '-.m', t, y_zi + y_zs, 'g', 'LineWidth', 2);
legend('零输入响应 y_{zi}(t)', '零状态响应 y_{zs}(t)', '全响应 y(t)'); grid on;`;
        },
        quiz: {
          question: '关于因果稳定 LTI 系统的“零状态响应 y_zs(t)”与“强迫响应 y_for(t)”，下列说法正确的是：',
          options: [
            '零状态响应通常既包含强迫响应分量，也包含用于匹配零初态的自由响应（固有模态）分量！',
            '零状态响应完全等于强迫响应，零输入响应完全等于自由响应',
            '自由响应的频率由输入激励信号决定',
            '零输入响应与输入激励的幅值成正比'
          ],
          answer: 0,
          explanation: '这是期末考试经典辨析题！零状态响应 y_zs 要求 y_zs(0⁻)=0，而强迫特解 y_for 在 t=0 处一般不为 0，故系统必然激发一部分自由模态与之抵消初值，因此 y_zs = y_zs_nat + y_for！'
        },
        compute(p) {
          const ts = M.linspace(0, 8, 320);
          const dt = ts[1] - ts[0];
          const wn = p.wn, z = p.zeta;
          const wIn = 1.6;
          const xFun = (t) => (p.inType === 'step' ? 1 : p.inType === 'cos' ? Math.cos(wIn * t) : 0);

          // RK4 solver for y'' + 2*z*wn*y' + wn^2*y = wn^2*u(t)
          const solveRK4 = (initY, initDY, useInput) => {
            const out = new Float64Array(ts.length);
            let y1 = initY, y2 = initDY;
            for (let i = 0; i < ts.length; i++) {
              out[i] = y1;
              const t = ts[i];
              const f = (tt, a, b) => {
                const u = useInput ? xFun(tt) : 0;
                return [b, wn * wn * (u - a) - 2 * z * wn * b];
              };
              const k1 = f(t, y1, y2);
              const k2 = f(t + 0.5 * dt, y1 + 0.5 * dt * k1[0], y2 + 0.5 * dt * k1[1]);
              const k3 = f(t + 0.5 * dt, y1 + 0.5 * dt * k2[0], y2 + 0.5 * dt * k2[1]);
              const k4 = f(t + dt, y1 + dt * k3[0], y2 + dt * k3[1]);
              y1 += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
              y2 += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
            }
            return out;
          };

          const yZI = solveRK4(p.y0, p.dy0, false);
          const yZS = solveRK4(0, 0, true);

          // Exact steady-state / forced response y_for(t)
          const yFor = new Float64Array(ts.length);
          const yNat = new Float64Array(ts.length);
          const yTot = new Float64Array(ts.length);
          const Hjw = p.inType === 'cos'
            ? M.cDiv({ re: wn * wn, im: 0 }, { re: wn * wn - wIn * wIn, im: 2 * z * wn * wIn })
            : { re: p.inType === 'step' ? 1 : 0, im: 0 };
          const magF = M.cAbs(Hjw), phF = M.cArg(Hjw);

          for (let i = 0; i < ts.length; i++) {
            yTot[i] = yZI[i] + yZS[i];
            yFor[i] = p.inType === 'step' ? 1.0 : p.inType === 'cos' ? magF * Math.cos(wIn * ts[i] + phF) : 0;
            yNat[i] = yTot[i] - yFor[i];
          }

          const mk = (arr, yPos) => ts.map((t, i) => [t, yPos, arr[i]]);
          const cZI = mk(yZI, 1.5), cZS = mk(yZS, 0.5), cFor = mk(yFor, -0.5), cTot = mk(yTot, -1.5);

          const eigStr = z < 1
            ? `${M.fmt(-z * wn, 2)} ± j${M.fmt(wn * Math.sqrt(1 - z * z), 2)}`
            : `${M.fmt(-wn * (z - Math.sqrt(z * z - 1)), 2)}, ${M.fmt(-wn * (z + Math.sqrt(z * z - 1)), 2)}`;

          return {
            scene: {
              axes: {
                x: { min: 0, max: 8, label: '时间 t (s)' },
                y: { min: -2.0, max: 2.0, label: '响应分解分量', ticks: [-1.5, -0.5, 0.5, 1.5], format: (v) => (v > 1 ? 'y_zi' : v > 0 ? 'y_zs' : v > -1 ? 'y_强迫' : 'y_全响应') },
                z: { min: -2.2, max: 2.5, label: '响应幅值' }
              },
              ribbons: [{ points: cTot, baseZ: 0, color: 'rgba(52,211,153,0.22)' }],
              curves: [
                { points: cZI, color: '#38bdf8', width: 2.3, label: '零输入响应 y_zi(t)' },
                { points: cZS, color: '#a78bfa', width: 2.3, label: '零状态响应 y_zs(t)' },
                { points: cFor, color: '#fbbf24', width: 2.1, dashed: true, label: '强迫稳态响应 y_for(t)' },
                { points: cTot, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '全响应 y(t)' }
              ],
              legend: [
                { color: '#38bdf8', label: '零输入 y_zi' },
                { color: '#a78bfa', label: '零状态 y_zs' },
                { color: '#fbbf24', label: '强迫(稳态) y_for' },
                { color: '#34d399', label: '全响应 y = y_zi + y_zs' }
              ]
            },
            plots2d: [
              {
                title: '分解方式一：零输入 y_zi [蓝] + 零状态 y_zs [紫] = 全响应 [绿]',
                xMin: 0, xMax: 8, yMin: -2.2, yMax: 2.5, xLabel: 't',
                series: [
                  { points: ts.map((t, i) => [t, yZI[i]]), color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, yZS[i]]), color: '#a78bfa', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, yTot[i]]), color: '#34d399', width: 2.2 }
                ]
              },
              {
                title: '分解方式二：自由(暂态)响应 y_nat [红] + 强迫(稳态)响应 y_for [黄]',
                xMin: 0, xMax: 8, yMin: -2.2, yMax: 2.5, xLabel: 't',
                series: [
                  { points: ts.map((t, i) => [t, yNat[i]]), color: '#f43f5e', width: 1.9 },
                  { points: ts.map((t, i) => [t, yFor[i]]), color: '#fbbf24', width: 2.0 }
                ]
              }
            ],
            metrics: [
              { label: '特征根（固有频率）', value: eigStr, status: 'ok' },
              { label: '阻尼模态形态', value: z < 1 ? '欠阻尼衰减振荡' : Math.abs(z - 1) < 0.03 ? '临界阻尼' : '过阻尼单调衰减' },
              { label: '零输入初值 y_zi(0)', value: M.fmt(p.y0, 2) },
              { label: '稳态强迫幅值', value: p.inType === 'zero' ? '0' : M.fmt(magF, 3) }
            ]
          };
        }
      },

      /* ==================== 2.5 ==================== */
      {
        id: '2.5',
        code: 'Ch2-(5)',
        level: '理解',
        title: '2.5 奇异函数族系：单位斜坡 r(t)、阶跃 u(t)、冲激 δ(t) 与冲激偶 u₁(t)',
        summary: '在三维导数阶次空间展示 u_{-2}(t) → u_{-1}(t) → u_0(t) → u_1(t) 奇异函数链，验证 x(t)*u₁(t) = dx/dt！',
        presets: [
          { label: '平滑逼近脉宽 Δ = 0.35', values: { delta: 0.35, sig: 'gauss' } },
          { label: '更尖锐逼近 Δ = 0.20 (观察冲激偶正负尖峰!)', values: { delta: 0.20, sig: 'gauss' } },
          { label: '梯形波与冲激偶卷积求导', values: { delta: 0.28, sig: 'trap' } }
        ],
        controls: [
          {
            key: 'sig', label: '被卷积测试信号 x(t)', type: 'select', default: 'gauss',
            options: [
              { value: 'gauss', label: '高斯钟形脉冲 e^(-t²)' },
              { value: 'trap', label: '平滑梯形脉冲（分段斜率求导）' }
            ]
          },
          { key: 'delta', label: '奇异函数正则化逼近宽度 Δ', type: 'range', min: 0.18, max: 0.8, step: 0.02, default: 0.32 }
        ],
        theory: {
          formula: 'u_k(t) = d^k δ(t) / dt^k；  x(t) * u₀(t) = x(t)，  x(t) * u₁(t) = dx(t)/dt，  x(t) * u_{-1}(t) = ∫_{-∞}^t x(τ)dτ',
          objectives: [
            '【理解】奇异函数族系 u_k(t)（斜坡 r(t)=u_{-2}、阶跃 u(t)=u_{-1}、冲激 δ(t)=u_0、单位冲激偶 u_1(t)=δ\'(t)）的递推定义；',
            '【掌握】任意信号与冲激偶 u₁(t) 卷积等价于对该信号求一阶导数，与阶跃 u_{-1}(t) 卷积等价于运行积分。'
          ],
          guide3d: '三维深度轴依次排列四阶奇异函数逼近波形：后排为单位斜坡 r(t)，次排为单位阶跃 u(t)，再次为单位冲激 δ_Δ(t)，最前排红黄正负对称双尖峰即为“单位冲激偶 u₁(t)”！下方示波器同步验证 x(t)*u₁(t) = dx/dt。'
        },
        matlab(p) {
          return `% Ch2.5 奇异函数族与冲激偶 u1(t) = d/dt delta(t) 卷积求导验证
dt = 0.005; t = -3:dt:3; s = ${M.fmt(p.delta, 2)} / 2;
delta_s = exp(-(t/s).^2) / (sqrt(pi)*s);        % 光滑高斯核逼近 u0(t) = delta(t)
doublet_s = gradient(delta_s, dt);              % 单位冲激偶 u1(t) = d(delta)/dt
x = exp(-t.^2);
y_conv = conv(x, doublet_s, 'same') * dt;       % 卷积 x(t) * u1(t)
dx_exact = -2 * t .* exp(-t.^2);                % 解析导数 dx/dt
plot(t, x, 'b', t, y_conv, 'r', t, dx_exact, '--g', 'LineWidth', 1.8);
legend('x(t)', 'x(t) * u_1(t)', '解析导数 dx/dt'); grid on;`;
        },
        quiz: {
          question: '将信号 x(t) 先后级联通过单位冲激响应为 h₁(t) = u₁(t)（单位冲激偶）和 h₂(t) = u(t)（单位阶跃）的两个 LTI 系统（假设 x(-∞)=0），最终输出为：',
          options: ['x(t) 本身（因为 u₁(t) * u(t) = δ(t) 互逆抵消！）', 'd²x(t)/dt²', '∫ x(τ) dτ', '0'],
          answer: 0,
          explanation: '由奇异函数卷积规律 u_m(t) * u_n(t) = u_{m+n}(t)，故 u₁(t) * u_{-1}(t) = u_0(t) = δ(t)，微分器与积分器级联互为逆系统，总输出恢复为 x(t)！'
        },
        compute(p) {
          const ts = M.linspace(-3, 3, 280);
          const s = p.delta * 0.55;
          const cRamp = [], cStep = [], cDelta = [], cDoublet = [];
          const pX = [], pDX = [], pDoublet = [];

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const g = Math.exp(-(t * t) / (s * s)) / (Math.sqrt(Math.PI) * s);
            const dg = (-2 * t / (s * s)) * g;
            // Smooth step & ramp
            const uVal = 0.5 * (1 + Math.tanh(t / s));
            const rVal = t > 0 ? t * uVal : 0;

            cRamp.push([t, 1.5, Math.min(2.8, rVal)]);
            cStep.push([t, 0.5, uVal]);
            cDelta.push([t, -0.5, Math.min(3.2, g * 0.75)]);
            cDoublet.push([t, -1.5, Math.max(-3.2, Math.min(3.2, dg * 0.18))]);
            pDoublet.push([t, Math.max(-8, Math.min(8, dg * 0.35))]);

            const xv = p.sig === 'gauss' ? Math.exp(-t * t) : 0.5 * (Math.tanh((t + 1.1) * 4) - Math.tanh((t - 1.1) * 4));
            const dxv = p.sig === 'gauss' ? -2 * t * xv : 2 * (1 / Math.pow(Math.cosh((t + 1.1) * 4), 2) - 1 / Math.pow(Math.cosh((t - 1.1) * 4), 2));
            pX.push([t, xv]);
            pDX.push([t, dxv]);
          }

          return {
            scene: {
              axes: {
                x: { min: -3, max: 3, label: '时间 t (s)' },
                y: { min: -2.0, max: 2.0, label: '奇异函数阶次 k', ticks: [-1.5, -0.5, 0.5, 1.5], format: (v) => (v > 1 ? 'r(t)=u₋₂' : v > 0 ? 'u(t)=u₋₁' : v > -1 ? 'δ(t)=u₀' : 'u₁(t)冲激偶') },
                z: { min: -3.0, max: 3.2, label: '归一化幅值' }
              },
              ribbons: [
                { points: cDelta, baseZ: 0, color: 'rgba(251,191,36,0.22)' },
                { points: cDoublet, baseZ: 0, color: 'rgba(244,63,94,0.26)' }
              ],
              curves: [
                { points: cRamp, color: '#38bdf8', width: 2.3, label: '斜坡 r(t) = u_{-2}(t)' },
                { points: cStep, color: '#34d399', width: 2.5, label: '阶跃 u(t) = u_{-1}(t)' },
                { points: cDelta, color: '#fbbf24', width: 2.7, glow: true, label: '冲激 δ_Δ(t) = u_0(t)' },
                { points: cDoublet, color: '#f43f5e', width: 3.0, glow: true, shadowXZ: true, label: '冲激偶 u₁(t) = dδ/dt' }
              ],
              legend: [
                { color: '#38bdf8', label: '斜坡 u₋₂(t)' },
                { color: '#34d399', label: '阶跃 u₋₁(t)' },
                { color: '#fbbf24', label: '冲激 u₀(t)' },
                { color: '#f43f5e', label: '冲激偶 u₁(t) (正负双极)' }
              ]
            },
            plots2d: [
              { title: '单位冲激偶逼近波形 u₁,Δ(t) (面积恒为 0，一阶矩为 -1)', xMin: -3, xMax: 3, yMin: -6, yMax: 6, xLabel: 't', series: [{ points: pDoublet, color: '#f43f5e', fill: 'rgba(244,63,94,0.2)', width: 2.1 }] },
              {
                title: '卷积求导恒等式：x(t) [蓝]  →  x(t) * u₁(t) = dx/dt [绿]',
                xMin: -3, xMax: 3, yMin: -2.2, yMax: 2.2, xLabel: 't',
                series: [
                  { points: pX, color: '#38bdf8', width: 2.0 },
                  { points: pDX, color: '#34d399', width: 2.2 }
                ]
              }
            ],
            metrics: [
              { label: '奇异卷积定律', value: 'u_m(t) * u_n(t) = u_{m+n}(t)', status: 'ok' },
              { label: '冲激偶总面积 ∫u₁dt', value: '0.000 (正负抵消)' },
              { label: '冲激偶筛选公式', value: '∫ x(t)u₁(t-t₀)dt = -x\'(t₀)' },
              { label: '逼近参数 Δ', value: `${M.fmt(p.delta, 2)} s` }
            ]
          };
        }
      }
    ]
  });
})();
