/**
 * 第 1 章：信号与系统绪论 (Chapter 1) — 6 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 1 章全部 6 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch1',
    number: '第 1 章',
    title: '第 1 章：信号与系统绪论',
    shortTitle: 'Ch1 信号与系统绪论',
    weeks: '第 1–2 周 · 4 学时',
    syllabusItems: '连续/离散信号、自变量变换、复指数与正弦、冲激与阶跃、连续/离散系统、基本系统性质',
    cases: [
      /* ==================== 1.1 ==================== */
      {
        id: '1.1',
        code: 'Ch1-(1)',
        level: '掌握',
        title: '1.1 连续时间与离散时间信号、能量与功率',
        summary: '在三维空间并行展示连续信号 x(t)、离散抽样序列 x[n] 以及瞬时功率 |x(t)|² 与累积能量轨迹。',
        presets: [
          { label: '单边指数(能量信号)', values: { sigType: 'exp', amp: 1.5, param: 0.75, Ts: 0.4 } },
          { label: '正弦周期波(功率信号)', values: { sigType: 'sin', amp: 1.3, param: 2.2, Ts: 0.35 } },
          { label: '矩形门脉冲(有限长能量)', values: { sigType: 'rect', amp: 1.4, param: 2.4, Ts: 0.4 } },
          { label: '双边衰减包络余弦', values: { sigType: 'dampedCos', amp: 1.6, param: 0.55, Ts: 0.35 } }
        ],
        controls: [
          {
            key: 'sigType', label: '典型信号类型', type: 'select', default: 'exp',
            options: [
              { value: 'exp', label: '单边衰减指数 A·e^(-αt)u(t) [能量信号]' },
              { value: 'sin', label: '周期余弦信号 A·cos(ω₀t) [功率信号]' },
              { value: 'rect', label: '矩形门函数 A·rect(t/τ) [有限长能量]' },
              { value: 'dampedCos', label: '双边衰减振荡 A·e^(-α|t|)cos(3t)' }
            ]
          },
          { key: 'amp', label: '幅值 A', type: 'range', min: 0.4, max: 2.0, step: 0.1, default: 1.5 },
          { key: 'param', label: '衰减率 α / 频率 ω₀ / 脉宽 τ', type: 'range', min: 0.3, max: 3.5, step: 0.05, default: 0.75 },
          { key: 'Ts', label: '离散序列采样间隔 T', type: 'range', min: 0.2, max: 0.8, step: 0.05, default: 0.4, unit: 's' }
        ],
        theory: {
          formula: 'E_∞ = ∫_{-∞}^{+∞} |x(t)|² dt = lim_{T→∞} E_T,   P_∞ = lim_{T→∞} (1 / 2T) ∫_{-T}^{+T} |x(t)|² dt',
          objectives: [
            '【掌握】连续时间信号 x(t) 与离散时间序列 x[n] 的函数表示与三维图形表示；',
            '【理解】信号的能量 E_∞ 与平均功率 P_∞ 计算，区分能量信号（0<E<∞, P=0）与功率信号（E=∞, 0<P<∞）。'
          ],
          guide3d: '三维视图沿深度轴 Y 分设三条实验通道：Y = -1.2 为连续波形 x(t)，Y = 0 为离散序列 x[n] 针状图，Y = +1.2 为瞬时功率 p(t) = |x(t)|² 填充带。点击上方“时域正视”可直接观察标准二维波形叠加。'
        },
        matlab(p) {
          return `% 深圳技术大学《信号与系统》Ch1.1 连续/离散信号与能量功率计算
t = -4:0.01:4;
n_t = -4:${M.fmt(p.Ts, 2)}:4;
A = ${M.fmt(p.amp, 2)}; alpha = ${M.fmt(p.param, 2)};
${p.sigType === 'exp' ? 'x = A * exp(-alpha * t) .* (t >= 0);\nxn = A * exp(-alpha * n_t) .* (n_t >= 0);' :
  p.sigType === 'sin' ? 'x = A * cos(alpha * t);\nxn = A * cos(alpha * n_t);' :
  p.sigType === 'rect' ? 'x = A * (abs(t) <= alpha/2);\nxn = A * (abs(n_t) <= alpha/2);' :
  'x = A * exp(-alpha * abs(t)) .* cos(3*t);\nxn = A * exp(-alpha * abs(n_t)) .* cos(3*n_t);'}
E_window = trapz(t, abs(x).^2);
P_window = E_window / (t(end) - t(1));
subplot(2,1,1); plot(t, x, 'LineWidth', 1.8); hold on; stem(n_t, xn, 'filled'); grid on;
title(sprintf('连续信号 x(t) 与离散序列 x[n] (窗口能量 E=%.3f, 平均功率 P=%.3f)', E_window, P_window));
subplot(2,1,2); area(t, abs(x).^2); grid on; title('瞬时功率 p(t) = |x(t)|^2');`;
        },
        quiz: {
          question: '对于单边衰减指数信号 x(t) = 2·e^(-t)u(t)，其无穷区间总能量 E_∞ 与平均功率 P_∞ 分别为：',
          options: ['E_∞ = 2, P_∞ = 0（能量信号）', 'E_∞ = ∞, P_∞ = 2（功率信号）', 'E_∞ = 4, P_∞ = 1', 'E_∞ = 1, P_∞ = 0.5'],
          answer: 0,
          explanation: 'E_∞ = ∫_0^∞ (2e^{-t})² dt = 4 ∫_0^∞ e^{-2t} dt = 4 × (1/2) = 2 < ∞；因为总能量有限，时间趋于无穷时平均功率 P_∞ = 0，属于典型的能量信号。'
        },
        compute(p, animTime) {
          const evalX = (t) => {
            if (p.sigType === 'exp') return t >= 0 ? p.amp * Math.exp(-p.param * t) : 0;
            if (p.sigType === 'sin') return p.amp * Math.cos(p.param * t);
            if (p.sigType === 'rect') return M.rect(t, p.param) * p.amp;
            return p.amp * Math.exp(-p.param * Math.abs(t)) * Math.cos(3 * t);
          };

          const ts = M.linspace(-4, 4, 240);
          const dt = ts[1] - ts[0];
          const ctCurve = [];
          const powCurve = [];
          const p2dX = [];
          const p2dCumE = [];
          let cumE = 0;

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const v = evalX(t);
            const pw = v * v;
            cumE += pw * dt;
            ctCurve.push([t, -1.2, v]);
            powCurve.push([t, 1.2, pw * 0.65]);
            p2dX.push([t, v]);
            p2dCumE.push([t, cumE]);
          }

          const stems = [];
          const p2dStems = [];
          for (let t = -4; t <= 4.0001; t += p.Ts) {
            const tr = Math.round(t * 1000) / 1000;
            const v = evalX(tr);
            stems.push([tr, 0, v]);
            p2dStems.push([tr, v]);
          }

          const scanT = -4 + ((animTime * 1.4) % 8);
          const scanV = evalX(scanT);

          let classification = '能量信号 (E_∞ < ∞, P_∞ = 0)';
          let theoE = cumE;
          let theoP = 0;
          if (p.sigType === 'exp') {
            theoE = (p.amp * p.amp) / (2 * p.param);
          } else if (p.sigType === 'rect') {
            theoE = p.amp * p.amp * p.param;
          } else if (p.sigType === 'sin') {
            classification = '功率信号 (E_∞ = ∞, P_∞ > 0)';
            theoE = Infinity;
            theoP = (p.amp * p.amp) * 0.5;
          }

          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '时间 t / nT (s)' },
                y: { min: -1.8, max: 1.8, label: '表示维度 (连续 / 离散 / 功率)', ticks: [-1.2, 0, 1.2], format: (v) => (v < -0.5 ? 'x(t)' : v > 0.5 ? '|x|²' : 'x[n]') },
                z: { min: -2.1, max: 2.4, label: '信号幅值 / 归一化功率' }
              },
              ribbons: [
                { points: ctCurve, baseZ: 0, color: 'rgba(56,189,248,0.16)' },
                { points: powCurve, baseZ: 0, color: 'rgba(251,191,36,0.22)' }
              ],
              curves: [
                { points: ctCurve, color: '#38bdf8', width: 2.8, glow: true, shadowXZ: true, pickable: true, label: 'x(t)' },
                { points: powCurve, color: '#fbbf24', width: 2.4, glow: true, pickable: true, label: '0.65|x(t)|²' }
              ],
              stems: [
                { points: stems, baseZ: 0, color: '#34d399', width: 2.0, radius: 4.0, label: 'x[n]' }
              ],
              markers: [
                { pos: [scanT, -1.2, scanV], shape: 'dot', color: '#f43f5e', size: 6, label: `x(${M.fmt(scanT, 1)})=${M.fmt(scanV, 2)}` }
              ],
              legend: [
                { color: '#38bdf8', label: '连续信号 x(t)' },
                { color: '#34d399', label: '离散序列 x[n]' },
                { color: '#fbbf24', label: '瞬时功率 |x(t)|²' }
              ]
            },
            plots2d: [
              {
                title: '连续波形 x(t) 与离散抽样 x[n] 对照',
                xMin: -4, xMax: 4, yMin: -2.1, yMax: 2.1, xLabel: 't(s)',
                series: [
                  { points: p2dX, color: '#38bdf8', width: 2 },
                  { points: p2dStems, type: 'stems', color: '#34d399', radius: 2.8 }
                ],
                vLines: [{ x: scanT, color: '#f43f5e' }]
              },
              {
                title: '累积能量轨迹 E(t) = ∫ |x(τ)|² dτ',
                xMin: -4, xMax: 4, yMin: 0, yMax: Math.max(2, cumE * 1.15), xLabel: 't(s)',
                series: [{ points: p2dCumE, color: '#fbbf24', fill: 'rgba(251,191,36,0.16)', width: 2.1 }]
              }
            ],
            metrics: [
              { label: '信号分类判别', value: classification, status: p.sigType === 'sin' ? 'warn' : 'ok' },
              { label: '理论总能量 E_∞', value: Number.isFinite(theoE) ? `${M.fmt(theoE, 3)} J` : '∞ (发散)' },
              { label: '理论平均功率 P_∞', value: `${M.fmt(theoP, 3)} W` },
              { label: '窗口 [-4,4] 积分能量', value: `${M.fmt(cumE, 3)} J` }
            ]
          };
        }
      },

      /* ==================== 1.2 ==================== */
      {
        id: '1.2',
        code: 'Ch1-(2)',
        level: '掌握',
        title: '1.2 自变量的变换：时移、反褶与尺度展缩流水线',
        summary: '在三维平行切片中逐步展示 x(t) → 时移 x(t-t₀) → 尺度与反褶 x(at-t₀)，彻底厘清复合变换顺序！',
        presets: [
          { label: '压缩并右移 x(2t - 2)', values: { shape: 'trap', a: 2.0, t0: 2.0, flip: 0 } },
          { label: '展宽并左移 x(0.5t + 1)', values: { shape: 'trap', a: 0.5, t0: -1.0, flip: 0 } },
          { label: '反褶加时移 x(-t + 1.5)', values: { shape: 'trap', a: 1.0, t0: 1.5, flip: 1 } },
          { label: '复合反褶压缩 x(-1.5t - 1)', values: { shape: 'pulseTri', a: 1.5, t0: -1.0, flip: 1 } }
        ],
        controls: [
          {
            key: 'shape', label: '原型信号 x(t)', type: 'select', default: 'trap',
            options: [
              { value: 'trap', label: '非对称直角梯形波 (最易观察反褶与缩放!)' },
              { value: 'pulseTri', label: '偏置三角斜坡脉冲' },
              { value: 'expPulse', label: '截断指数脉冲 e^(-0.8t)[u(t)-u(t-2.5)]' }
            ]
          },
          { key: 'a', label: '尺度因子 |a| (>1压缩, <1展宽)', type: 'range', min: 0.4, max: 2.5, step: 0.1, default: 2.0 },
          { key: 't0', label: '平移参数 t₀ (对应 x(±at - t₀))', type: 'range', min: -2.5, max: 2.5, step: 0.25, default: 1.5 },
          {
            key: 'flip', label: '时间反褶符号', type: 'select', default: 0,
            options: [
              { value: 0, label: '不反褶 (+a·t - t₀)' },
              { value: 1, label: '反褶 (-a·t - t₀)' }
            ]
          }
        ],
        theory: {
          formula: 'y(t) = x(a·t - t₀) = x( a · (t - t₀/a) )   ⇒   法一：先平移 t₀ 得 v(t)=x(t-t₀)，再对 t 缩放 a 倍！',
          objectives: [
            '【掌握】自变量三大基本变换：时移 x(t-t₀)、反褶 x(-t)、尺度变换 x(at) 的几何规律；',
            '【掌握】复合变换 x(at - t₀) 的正确分解顺序（“先平移 t₀、再缩放 a”或“先缩放 a、再平移 t₀/a”，注意只对自变量 t 本身做替换！）。'
          ],
          guide3d: '沿三维深度轴 Y 依次排列三个物理阶段：后方蓝色为原始信号 x(t)，中间琥珀色为第一步时移中间量 v(t) = x(t - t₀)，前方翠绿色为最终复合结果 y(t) = v(±at) = x(±at - t₀)。'
        },
        matlab(p) {
          const signedA = Number(p.flip) === 1 ? -p.a : p.a;
          return `% Ch1.2 自变量的复合变换 y(t) = x(a*t - t0) 验证
x_fun = @(tau) (tau >= -1 & tau < 0) .* (tau + 1) + (tau >= 0 & tau <= 2) .* 1.0;
t = -5:0.01:5;
a = ${M.fmt(signedA, 2)}; t0 = ${M.fmt(p.t0, 2)};
x_orig = x_fun(t);
v_shift = x_fun(t - t0);       % 第一步：时移 t0
y_final = x_fun(a * t - t0);   % 第二步：将自变量 t 替换为 a*t
plot(t, x_orig, '--b', t, v_shift, ':r', t, y_final, 'g', 'LineWidth', 2);
legend('原始 x(t)', '中间时移 x(t-t_0)', sprintf('最终 x(%.2ft - %.2f)', a, t0)); grid on;`;
        },
        quiz: {
          question: '已知信号 x(t) 的非零区间为 [-1, 2]，则复合变换信号 y(t) = x(2t - 3) 的非零区间为：',
          options: ['[1, 2.5]', '[-5, 1]', '[-3.5, -2]', '[2, 5]'],
          answer: 0,
          explanation: '令括号内整体满足 -1 ≤ 2t - 3 ≤ 2，解不等式得 2 ≤ 2t ≤ 5，即 1 ≤ t ≤ 2.5（先右移 3 到 [2, 5]，再将时间轴压缩 2 倍到 [1, 2.5]）。'
        },
        compute(p) {
          const signedA = Number(p.flip) === 1 ? -p.a : p.a;
          const xProto = (u) => {
            if (p.shape === 'trap') {
              if (u >= -1 && u < 0) return u + 1.2;
              if (u >= 0 && u <= 1.5) return 1.2 - 0.35 * u;
              return 0;
            }
            if (p.shape === 'pulseTri') {
              if (u >= -0.5 && u <= 2.0) return 1.4 * (1 - Math.abs(u - 0.3) / 1.7) * (u <= 2 ? 1 : 0);
              return 0;
            }
            return u >= 0 && u <= 2.5 ? 1.5 * Math.exp(-0.75 * u) : 0;
          };

          const ts = M.linspace(-5, 5, 320);
          const cOrig = [], cShift = [], cFinal = [];
          const pOrig = [], pShift = [], pFinal = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const v0 = xProto(t);
            const v1 = xProto(t - p.t0);
            const v2 = xProto(signedA * t - p.t0);
            cOrig.push([t, 1.4, v0]);
            cShift.push([t, 0, v1]);
            cFinal.push([t, -1.4, v2]);
            pOrig.push([t, v0]);
            pShift.push([t, v1]);
            pFinal.push([t, v2]);
          }

          const shiftAfterScale = p.t0 / signedA;
          return {
            scene: {
              axes: {
                x: { min: -5, max: 5, label: '时间轴 t (s)' },
                y: { min: -2, max: 2, label: '变换步骤阶段', ticks: [-1.4, 0, 1.4], format: (v) => (v > 0.7 ? '①x(t)' : v < -0.7 ? '③y(t)' : '②x(t-t₀)') },
                z: { min: -0.3, max: 1.8, label: '幅值' }
              },
              ribbons: [
                { points: cOrig, baseZ: 0, color: 'rgba(56,189,248,0.14)' },
                { points: cShift, baseZ: 0, color: 'rgba(251,191,36,0.15)' },
                { points: cFinal, baseZ: 0, color: 'rgba(52,211,153,0.24)' }
              ],
              curves: [
                { points: cOrig, color: '#38bdf8', width: 2.4, label: '原始 x(t)', pickable: true },
                { points: cShift, color: '#fbbf24', width: 2.4, label: '先移 x(t-t₀)', pickable: true },
                { points: cFinal, color: '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '最终 y(t)', pickable: true }
              ],
              legend: [
                { color: '#38bdf8', label: '① 原始信号 x(t)' },
                { color: '#fbbf24', label: '② 先平移 v(t)=x(t-t₀)' },
                { color: '#34d399', label: `③ 再缩放 y(t)=x(${M.fmt(signedA, 1)}t - (${M.fmt(p.t0, 1)}))` }
              ]
            },
            plots2d: [
              {
                title: '二维时域叠加对比：x(t) vs y(t) = x(at - t₀)',
                xMin: -5, xMax: 5, yMin: -0.2, yMax: 1.8, xLabel: 't',
                series: [
                  { points: pOrig, color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: pFinal, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.3 }
                ]
              },
              {
                title: '中间步骤 v(t) = x(t - t₀) 对照',
                xMin: -5, xMax: 5, yMin: -0.2, yMax: 1.8, xLabel: 't',
                series: [
                  { points: pShift, color: '#fbbf24', width: 2.0 },
                  { points: pFinal, color: '#34d399', width: 1.7, dashed: true }
                ]
              }
            ],
            metrics: [
              { label: '复合表达式', value: `x(${M.fmt(signedA, 2)}t ${p.t0 >= 0 ? '-' : '+'} ${M.fmt(Math.abs(p.t0), 2)})`, status: 'ok' },
              { label: '时间尺度效应', value: p.a > 1 ? `压缩 ${M.fmt(p.a, 2)} 倍` : p.a < 1 ? `展宽 ${M.fmt(1 / p.a, 2)} 倍` : '等宽不变' },
              { label: '等价先缩后移量 t₀/a', value: `${M.fmt(shiftAfterScale, 2)} s` },
              { label: '时间反褶状态', value: Number(p.flip) === 1 ? '已反褶 (镜像翻转)' : '正常正向' }
            ]
          };
        }
      },

      /* ==================== 1.3 ==================== */
      {
        id: '1.3',
        code: 'Ch1-(3)',
        level: '掌握',
        title: '1.3 复指数信号与正弦信号：欧拉公式 3D 螺旋线',
        summary: '三维空间 (t, Re, Im) 呈现 x(t)=e^((σ+jω₀)t) 复螺旋线，正视得余弦、俯视得正弦、侧视得旋转相量！',
        camera: { azimuth: -0.82, elevation: 0.42, zoom: 1.0 },
        presets: [
          { label: '等幅复指数圆螺旋 (σ = 0)', values: { mode: 'ct', sigma: 0.0, w0: 3.2, phi0: 0 } },
          { label: '收敛阻尼螺旋线 (σ = -0.28)', values: { mode: 'ct', sigma: -0.28, w0: 3.8, phi0: 0 } },
          { label: '发散增幅螺旋线 (σ = +0.22)', values: { mode: 'ct', sigma: 0.22, w0: 3.4, phi0: 0 } },
          { label: '离散复指数周期序列 (ω₀=2π·2/12)', values: { mode: 'dt', sigma: 0.0, w0: (Math.PI * 2 * 2) / 12, phi0: 0 } },
          { label: '离散非周期复指数序列 (ω₀=1.0 rad)', values: { mode: 'dt', sigma: 0.0, w0: 1.0, phi0: 0 } }
        ],
        controls: [
          {
            key: 'mode', label: '时间域类型', type: 'select', default: 'ct',
            options: [
              { value: 'ct', label: '连续时间复指数 e^((σ+jω₀)t)' },
              { value: 'dt', label: '离散时间复指数 e^((σ+jω₀)n) [检验离散周期性!]' }
            ]
          },
          { key: 'sigma', label: '实指数增长/衰减率 σ', type: 'range', min: -0.35, max: 0.28, step: 0.02, default: 0.0 },
          { key: 'w0', label: '角频率 ω₀', type: 'range', min: 0.4, max: 6.0, step: 0.05, default: 3.2, unit: 'rad' },
          { key: 'phi0', label: '初相位 θ₀', type: 'range', min: -3.14, max: 3.14, step: 0.15, default: 0, unit: 'rad' }
        ],
        theory: {
          formula: 'x(t) = e^{(σ + jω₀)t + jθ₀} = e^{σt} cos(ω₀t + θ₀) + j · e^{σt} sin(ω₀t + θ₀)',
          objectives: [
            '【掌握】指数信号与正弦信号的数学及空间几何关系（欧拉公式的三维投影本质）；',
            '【理解】离散复指数信号 e^{jω₀n} 的周期性条件：仅当 ω₀/(2π) = m/N 为有理数时才是周期序列！'
          ],
          guide3d: '强烈建议依次点击上方【时域正视】（直接看到虚部正弦波 Im）、【复平面俯视】（直接看到实部余弦波 Re）、【频域侧视】（直接看到复平面相量圆/对数螺线）——一条 3D 曲线统摄三大二维教材图！'
        },
        matlab(p) {
          return `% Ch1.3 复指数信号 3D 欧拉螺旋线与三面正交投影
sigma = ${M.fmt(p.sigma, 2)}; w0 = ${M.fmt(p.w0, 2)}; phi0 = ${M.fmt(p.phi0, 2)};
${p.mode === 'ct' ? `t = -4:0.02:4;
x = exp((sigma + 1j*w0)*t + 1j*phi0);
plot3(t, real(x), imag(x), 'c', 'LineWidth', 2.2); grid on;` :
`n = -12:12;
x = exp((sigma + 1j*w0)*n + 1j*phi0);
stem3(n, real(x), imag(x), 'filled'); grid on;`}
xlabel('时间 t / n'); ylabel('实部 Re{x}'); zlabel('虚部 Im{x}');
title('复指数信号三维欧拉螺旋线 x = e^{(\sigma + j\omega_0)t}');`;
        },
        quiz: {
          question: '关于离散时间复指数序列 x[n] = e^{jω₀n} 的周期性，下列说法正确的是：',
          options: [
            '对任意实数 ω₀ > 0 都是周期序列，周期为 2π/ω₀',
            '仅当 ω₀/(2π) = m/N 为有理数时才是周期序列，基波周期 N = N₀',
            '仅当 ω₀ 为有理数时才是周期序列',
            '离散复指数序列永远不是周期序列'
          ],
          answer: 1,
          explanation: '连续复指数 e^{jω₀t} 对任意 ω₀≠0 均周期；但离散序列要求 ω₀N = 2πm（m, N 为互质整数），即 ω₀/(2π) 必须是有理数！例如 ω₀ = 1 rad 时 1/(2π) 是无理数，故 e^{jn} 非周期。'
        },
        compute(p, animTime) {
          const ts = M.linspace(-4, 4, 340);
          const helix = [];
          const envPos = [], envNeg = [];
          const re2d = [], im2d = [];

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const r = Math.exp(p.sigma * t);
            const ang = p.w0 * t + p.phi0;
            const re = r * Math.cos(ang);
            const im = r * Math.sin(ang);
            helix.push([t, re, im]);
            envPos.push([t, r, 0]);
            envNeg.push([t, -r, 0]);
            re2d.push([t, re]);
            im2d.push([t, im]);
          }

          const stems = [];
          if (p.mode === 'dt') {
            for (let n = -12; n <= 12; n++) {
              const tMap = n * (4 / 12);
              const r = Math.exp(p.sigma * tMap);
              const ang = p.w0 * n + p.phi0;
              stems.push([tMap, r * Math.cos(ang), r * Math.sin(ang)]);
            }
          }

          const tCur = -4 + ((animTime * 1.35) % 8);
          const rCur = Math.exp(p.sigma * tCur);
          const angCur = (p.mode === 'dt' ? p.w0 * Math.round(tCur * 3) : p.w0 * tCur) + p.phi0;
          const reCur = rCur * Math.cos(angCur);
          const imCur = rCur * Math.sin(angCur);

          const ratio = p.w0 / M.TWO_PI;
          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: p.mode === 'ct' ? '时间 t (s)' : '离散序号 n (映射轴)' },
                y: { min: -2.4, max: 2.4, label: '实部 Re{x} = cos' },
                z: { min: -2.4, max: 2.4, label: '虚部 Im{x} = sin' }
              },
              curves: [
                {
                  points: p.mode === 'ct' ? helix : helix.filter((_, idx) => idx % 2 === 0),
                  color: p.mode === 'ct' ? '#38bdf8' : 'rgba(56,189,248,0.35)',
                  width: p.mode === 'ct' ? 3.0 : 1.3,
                  glow: p.mode === 'ct',
                  shadowXZ: true,
                  shadowXY: true,
                  shadowYZ: true,
                  pickable: true,
                  label: 'e^{(σ+jω₀)t}'
                },
                ...(Math.abs(p.sigma) > 0.01
                  ? [
                      { points: envPos, color: 'rgba(251,191,36,0.55)', width: 1.4, dashed: true },
                      { points: envNeg, color: 'rgba(251,191,36,0.55)', width: 1.4, dashed: true }
                    ]
                  : [])
              ],
              stems: p.mode === 'dt' ? [{ points: stems, baseZ: 0, color: '#34d399', width: 2.0, radius: 4.2, label: 'x[n]' }] : [],
              vectors: [
                { from: [tCur, 0, 0], to: [tCur, reCur, imCur], color: '#f43f5e', width: 2.8, label: '旋转相量' }
              ],
              markers: [{ pos: [tCur, reCur, imCur], shape: 'dot', color: '#fbbf24', size: 6 }],
              legend: [
                { color: '#38bdf8', label: '3D 复指数螺旋线 (含三面投影阴影)' },
                { color: '#f43f5e', label: '瞬时旋转复相量' },
                ...(p.mode === 'dt' ? [{ color: '#34d399', label: '离散复序列抽样点' }] : [])
              ]
            },
            plots2d: [
              {
                title: '实部投影 Re{x(t)} = e^(σt)cos(ω₀t+θ₀)',
                xMin: -4, xMax: 4, yMin: -2.3, yMax: 2.3, xLabel: 't',
                series: [{ points: re2d, color: '#38bdf8', width: 2.0 }],
                vLines: [{ x: tCur, color: '#f43f5e' }]
              },
              {
                title: '虚部投影 Im{x(t)} = e^(σt)sin(ω₀t+θ₀)',
                xMin: -4, xMax: 4, yMin: -2.3, yMax: 2.3, xLabel: 't',
                series: [{ points: im2d, color: '#34d399', width: 2.0 }],
                vLines: [{ x: tCur, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '包络形态 (σ)', value: Math.abs(p.sigma) < 0.01 ? '等幅振荡 (σ=0)' : p.sigma < 0 ? '指数收敛衰减 (σ<0)' : '指数增幅发散 (σ>0)', status: p.sigma > 0.01 ? 'warn' : 'ok' },
              { label: '连续基波周期 T₀', value: `${M.fmt(M.TWO_PI / p.w0, 3)} s` },
              { label: '频率比 ω₀ / 2π', value: `${M.fmt(ratio, 4)}` },
              { label: '瞬时幅值 |x|', value: M.fmt(rCur, 3) }
            ]
          };
        }
      },

      /* ==================== 1.4 ==================== */
      {
        id: '1.4',
        code: 'Ch1-(4)',
        level: '掌握',
        title: '1.4 单位冲激 δ(t) 与单位阶跃 u(t)：极限逼近与筛选性质',
        summary: '在三维 (t, 脉宽 Δ, 幅值) 空间直观演示矩形窄脉冲当 Δ→0 时面积恒为 1 演化为狄拉克冲激 δ(t) 及筛选取样性质。',
        presets: [
          { label: '窄脉冲极限逼近 Δ = 0.25', values: { delta: 0.25, t0: 0.8, mode: 'limit' } },
          { label: '宽脉冲起始态 Δ = 1.20', values: { delta: 1.2, t0: 0.8, mode: 'limit' } },
          { label: '冲激筛选性质 ∫x(t)δ(t-t₀)dt = x(t₀)', values: { delta: 0.25, t0: 1.0, mode: 'sift' } },
          { label: '离散差分与累加 δ[n]=u[n]-u[n-1]', values: { delta: 0.3, t0: 1.0, mode: 'discrete' } }
        ],
        controls: [
          {
            key: 'mode', label: '实验演示模式', type: 'select', default: 'limit',
            options: [
              { value: 'limit', label: '3D 窄脉冲族 Δ→0 演化为 δ(t) 与 u(t)' },
              { value: 'sift', label: '冲激函数筛选性质 x(t)·δ(t-t₀) = x(t₀)δ(t-t₀)' },
              { value: 'discrete', label: '离散单位脉冲 δ[n] 与单位阶跃序列 u[n]' }
            ]
          },
          { key: 'delta', label: '逼近脉冲宽度 Δ (面积恒=1)', type: 'range', min: 0.18, max: 1.5, step: 0.02, default: 0.32 },
          { key: 't0', label: '冲激发生/筛选时刻 t₀ (或 n₀)', type: 'range', min: -2.0, max: 2.0, step: 0.2, default: 0.8 }
        ],
        theory: {
          formula: 'δ(t) = lim_{Δ→0} δ_Δ(t),  ∫_{-∞}^{+∞} δ(t)dt = 1,  u(t) = ∫_{-∞}^{t} δ(τ)dτ,  ∫_{-∞}^{+∞} x(t)δ(t-t₀)dt = x(t₀)',
          objectives: [
            '【掌握】单位冲激函数 δ(t) 与单位阶跃函数 u(t) 的定义、导数/积分关系及乘积筛选性质；',
            '【掌握】离散单位脉冲序列 δ[n] = u[n] - u[n-1] 与一次累加关系 u[n] = ∑_{k=-∞}^n δ[k]。'
          ],
          guide3d: '在“窄脉冲族演化”模式下，三维深度轴 Y 代表脉宽参数 Δ：从后方宽矮脉冲（面积=1）向前方 Δ→0 推进时，脉冲高度 1/Δ 急剧拔高并最终化作前平面的狄拉克冲激箭头 δ(t)，而其积分斜坡 u_Δ(t) 同步蜕变为理想阶跃 u(t)！'
        },
        matlab(p) {
          return `% Ch1.4 单位冲激脉冲逼近族 δ_Δ(t) 与阶跃 u_Δ(t) 演示
t = -3:0.005:3;
Delta = ${M.fmt(p.delta, 2)}; t0 = ${M.fmt(p.t0, 2)};
delta_approx = (abs(t - t0) <= Delta/2) / Delta;  % 宽度 Delta, 高度 1/Delta, 面积恒为 1
u_approx = cumtrapz(t, delta_approx);
x_test = 1.2 + 0.7*cos(1.5*t);
sifted_val = trapz(t, x_test .* delta_approx);    % 验证筛选积分 -> x(t0)
subplot(2,1,1); plot(t, delta_approx, 'r', 'LineWidth', 2); grid on;
title(sprintf('窄脉冲 \\delta_\\Delta(t-t_0), 面积=%.3f, 筛选积分值=%.3f (理论 x(t_0)=%.3f)', trapz(t,delta_approx), sifted_val, 1.2+0.7*cos(1.5*t0)));
subplot(2,1,2); plot(t, u_approx, 'b', 'LineWidth', 2); grid on; title('积分阶跃逼近 u_\Delta(t-t_0)');`;
        },
        quiz: {
          question: '利用单位冲激函数的筛选性质计算积分 ∫_{-∞}^{+∞} (t² + 3) · δ(t - 2) dt 的结果为：',
          options: ['7', '3', '4·δ(t - 2)', '0'],
          answer: 0,
          explanation: '注意定积分结果为常数（而非冲激函数）！由筛选性质 ∫_{-∞}^{+∞} f(t)δ(t - t₀)dt = f(t₀)，代入 t₀ = 2 得 2² + 3 = 7。'
        },
        compute(p) {
          const ts = M.linspace(-3, 3, 300);
          const curves = [];
          const ribbons = [];
          const stems = [];

          if (p.mode === 'discrete') {
            const n0 = Math.round(p.t0 * 2);
            const dStems = [], uStems = [];
            const p2dD = [], p2dU = [];
            for (let n = -6; n <= 6; n++) {
              const dVal = n === n0 ? 1 : 0;
              const uVal = n >= n0 ? 1 : 0;
              dStems.push([n * 0.45, -0.8, dVal]);
              uStems.push([n * 0.45, 0.8, uVal]);
              p2dD.push([n, dVal]);
              p2dU.push([n, uVal]);
            }
            return {
              scene: {
                axes: {
                  x: { min: -3, max: 3, label: '离散序号 n (缩放显示)', format: (v) => `${Math.round(v / 0.45)}` },
                  y: { min: -1.5, max: 1.5, label: '序列类型', ticks: [-0.8, 0.8], format: (v) => (v < 0 ? 'δ[n-n₀]' : 'u[n-n₀]') },
                  z: { min: -0.2, max: 1.6, label: '序列值' }
                },
                stems: [
                  { points: dStems, baseZ: 0, color: '#f43f5e', width: 2.5, radius: 5, label: 'δ[n-n₀]' },
                  { points: uStems, baseZ: 0, color: '#38bdf8', width: 2.2, radius: 4.2, label: 'u[n-n₀]' }
                ],
                legend: [
                  { color: '#f43f5e', label: `离散单位脉冲 δ[n - (${n0})]` },
                  { color: '#38bdf8', label: `离散单位阶跃 u[n - (${n0})]` }
                ]
              },
              plots2d: [
                { title: `δ[n - (${n0})] = u[n-n₀] - u[n-n₀-1]`, xMin: -6, xMax: 6, yMin: -0.2, yMax: 1.4, xLabel: 'n', series: [{ points: p2dD, type: 'stems', color: '#f43f5e' }] },
                { title: `u[n - (${n0})] = ∑ δ[k - n₀]`, xMin: -6, xMax: 6, yMin: -0.2, yMax: 1.4, xLabel: 'n', series: [{ points: p2dU, type: 'stems', color: '#38bdf8' }] }
              ],
              metrics: [
                { label: '离散触发点 n₀', value: `n = ${n0}`, status: 'ok' },
                { label: '一次差分关系', value: 'δ[n] = u[n] - u[n-1]' },
                { label: '累加求和关系', value: 'u[n] = ∑_{k=-∞}^n δ[k]' },
                { label: '序列总和 ∑δ[n]', value: '1.000' }
              ]
            };
          }

          if (p.mode === 'sift') {
            const xTest = (t) => 1.15 + 0.65 * Math.cos(1.4 * t) + 0.25 * Math.sin(2.7 * t);
            const xCurve = [], prodCurve = [], p2dX = [], p2dProd = [];
            for (let i = 0; i < ts.length; i++) {
              const t = ts[i];
              const xv = xTest(t);
              const dApprox = Math.abs(t - p.t0) <= p.delta * 0.5 ? 1 / p.delta : 0;
              xCurve.push([t, 0.9, xv]);
              prodCurve.push([t, 0, Math.min(4.2, xv * dApprox * 0.45)]);
              p2dX.push([t, xv]);
              p2dProd.push([t, Math.min(5, xv * dApprox)]);
            }
            const xt0 = xTest(p.t0);
            return {
              scene: {
                axes: {
                  x: { min: -3, max: 3, label: '时间 t (s)' },
                  y: { min: -1.4, max: 1.4, label: '筛选阶段', ticks: [-0.9, 0, 0.9], format: (v) => (v > 0.4 ? 'x(t)' : v < -0.4 ? 'x(t₀)δ' : 'x·δ_Δ') },
                  z: { min: -0.3, max: 3.5, label: '幅值 / 冲激强度' }
                },
                curves: [
                  { points: xCurve, color: '#38bdf8', width: 2.6, label: '连续信号 x(t)', pickable: true },
                  { points: prodCurve, color: '#fbbf24', width: 2.2, label: '窄脉冲乘积' }
                ],
                ribbons: [{ points: prodCurve, baseZ: 0, color: 'rgba(251,191,36,0.25)' }],
                stems: [{ points: [[p.t0, -0.9, xt0]], baseZ: 0, color: '#f43f5e', width: 3.2, impulse: true, label: `筛选冲激强度 x(t₀)=${M.fmt(xt0, 2)}` }],
                markers: [{ pos: [p.t0, 0.9, xt0], shape: 'dot', color: '#34d399', size: 6.5, label: `x(t₀)=${M.fmt(xt0, 2)}` }],
                legend: [
                  { color: '#38bdf8', label: '被采样连续信号 x(t)' },
                  { color: '#fbbf24', label: '乘积脉冲 x(t)δ_Δ(t-t₀)' },
                  { color: '#f43f5e', label: '极限冲激 x(t₀)δ(t-t₀)' }
                ]
              },
              plots2d: [
                { title: '被筛选信号 x(t) 与取样点 t₀', xMin: -3, xMax: 3, yMin: 0, yMax: 2.4, xLabel: 't', series: [{ points: p2dX, color: '#38bdf8', width: 2.1 }], vLines: [{ x: p.t0, color: '#f43f5e' }] },
                { title: '窄脉冲乘积 x(t)·δ_Δ(t-t₀) (阴影面积 → x(t₀))', xMin: -3, xMax: 3, yMin: 0, yMax: 5.2, xLabel: 't', series: [{ points: p2dProd, color: '#fbbf24', fill: 'rgba(251,191,36,0.22)' }] }
              ],
              metrics: [
                { label: '筛选时刻 t₀', value: `${M.fmt(p.t0, 2)} s`, status: 'ok' },
                { label: '精确筛选结果 x(t₀)', value: M.fmt(xt0, 3) },
                { label: '窄脉冲面积 ∫δ_Δ dt', value: '1.000 (恒定)' },
                { label: '脉冲峰值 1/Δ', value: M.fmt(1 / p.delta, 2) }
              ]
            };
          }

          // Default 'limit' mode: show slices across Delta
          const deltas = [1.4, 0.9, 0.55, p.delta];
          const colors = ['rgba(56,189,248,0.45)', 'rgba(56,189,248,0.65)', 'rgba(52,211,153,0.8)', '#fbbf24'];
          for (let dIdx = 0; dIdx < deltas.length; dIdx++) {
            const d = deltas[dIdx];
            const yPos = dIdx === 3 ? -0.3 : 1.4 - dIdx * 0.55;
            const cPts = [];
            for (let i = 0; i < ts.length; i++) {
              const t = ts[i];
              const h = Math.abs(t - p.t0) <= d * 0.5 ? Math.min(4.2, 1 / d) : 0;
              cPts.push([t, yPos, h]);
            }
            curves.push({ points: cPts, color: colors[dIdx], width: dIdx === 3 ? 2.8 : 1.8, glow: dIdx === 3 });
            ribbons.push({ points: cPts, baseZ: 0, color: dIdx === 3 ? 'rgba(251,191,36,0.22)' : 'rgba(56,189,248,0.09)' });
          }

          // Ideal step & ramp integral on front slice
          const stepCurve = [], p2dDelta = [], p2dStep = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const uApprox = Math.max(0, Math.min(1, (t - (p.t0 - p.delta * 0.5)) / p.delta));
            const dApprox = Math.abs(t - p.t0) <= p.delta * 0.5 ? 1 / p.delta : 0;
            stepCurve.push([t, -1.25, uApprox]);
            p2dDelta.push([t, Math.min(5.5, dApprox)]);
            p2dStep.push([t, uApprox]);
          }
          curves.push({ points: stepCurve, color: '#34d399', width: 2.8, glow: true, label: '积分阶跃 u_Δ(t)' });
          stems.push({ points: [[p.t0, -1.25, 2.2]], baseZ: 0, color: '#f43f5e', width: 3.2, impulse: true, label: '理想冲激 (1)δ(t-t₀)' });

          return {
            scene: {
              axes: {
                x: { min: -3, max: 3, label: '时间 t (s)' },
                y: { min: -1.5, max: 1.6, label: '脉宽逼近参数 Δ → 0' },
                z: { min: -0.2, max: 4.3, label: '幅值 1/Δ 与阶跃 u(t)' }
              },
              ribbons,
              curves,
              stems,
              legend: [
                { color: '#fbbf24', label: `当前窄脉冲 δ_Δ (Δ=${M.fmt(p.delta, 2)}, 高=${M.fmt(1 / p.delta, 2)})` },
                { color: '#f43f5e', label: '极限冲激 δ(t-t₀) (强度=1)' },
                { color: '#34d399', label: '积分阶跃 u_Δ(t-t₀)' }
              ]
            },
            plots2d: [
              { title: `矩形逼近脉冲 δ_Δ(t-t₀) (面积恒 = 1)`, xMin: -3, xMax: 3, yMin: 0, yMax: 5.6, xLabel: 't', series: [{ points: p2dDelta, color: '#fbbf24', fill: 'rgba(251,191,36,0.2)' }] },
              { title: `运行积分 u_Δ(t-t₀) = ∫ δ_Δ(τ) dτ → u(t-t₀)`, xMin: -3, xMax: 3, yMin: -0.1, yMax: 1.3, xLabel: 't', series: [{ points: p2dStep, color: '#34d399', width: 2.2 }] }
            ],
            metrics: [
              { label: '当前脉冲宽度 Δ', value: `${M.fmt(p.delta, 2)} s`, status: 'ok' },
              { label: '脉冲高度 1/Δ', value: M.fmt(1 / p.delta, 2) },
              { label: '脉冲包围面积', value: '1.000 (严格守恒)' },
              { label: '阶跃上升过渡带', value: `[${M.fmt(p.t0 - p.delta / 2, 2)}, ${M.fmt(p.t0 + p.delta / 2, 2)}]` }
            ]
          };
        }
      },

      /* ==================== 1.5 ==================== */
      {
        id: '1.5',
        code: 'Ch1-(5)',
        level: '掌握',
        title: '1.5 连续时间与离散时间系统建模及方框图信号流',
        summary: '三维展示输入激励 x 经积分器/延时器反馈方框图内部节点状态 v 到系统输出 y 的动态演化。',
        presets: [
          { label: '一阶 RC 连续积分反馈系统', values: { sysModel: 'rc', param: 1.2, noise: 0.25 } },
          { label: '离散移动平均系统 (M=5 去噪)', values: { sysModel: 'ma', param: 5, noise: 0.35 } },
          { label: '离散累加器 y[n]=y[n-1]+x[n]', values: { sysModel: 'acc', param: 1.0, noise: 0.0 } },
          { label: '无记忆平方非线性系统 y=x²', values: { sysModel: 'sq', param: 1.0, noise: 0.1 } }
        ],
        controls: [
          {
            key: 'sysModel', label: '典型系统结构模型', type: 'select', default: 'rc',
            options: [
              { value: 'rc', label: '连续 RC 电路系统：RC·dy/dt + y(t) = x(t)' },
              { value: 'ma', label: '离散滑动平均系统：y[n] = (1/M)∑x[n-k]' },
              { value: 'acc', label: '离散累加器反馈系统：y[n] - y[n-1] = x[n]' },
              { value: 'sq', label: '无记忆平方检波系统：y(t) = x²(t)' }
            ]
          },
          { key: 'param', label: '系统参数 (时间常数 τ 或窗口 M)', type: 'range', min: 0.3, max: 6.0, step: 0.1, default: 1.2 },
          { key: 'noise', label: '高频毛刺干扰强度', type: 'range', min: 0, max: 0.6, step: 0.05, default: 0.25 }
        ],
        theory: {
          formula: '连续反馈方框图：dy/dt = (1/τ)[x(t) - y(t)]；  离散延迟反馈方框图：y[n] = a·y[n-1] + b·x[n]',
          objectives: [
            '【掌握】线性系统的模拟与基本运算单元（加法器、数乘器、积分器 ∫、单位延时器 z⁻¹）方框图表示；',
            '【理解】连续系统与离散系统对含噪输入信号的平滑、积分与非线性变换物理效应。'
          ],
          guide3d: '三维空间将系统方框图拆解为三条可视化信号流平面：后方为含高频干扰的输入激励 x，中间为方框图内部误差/差分中间节点 e = x - y（或延时支路），前方为系统响应输出 y。'
        },
        matlab(p) {
          return `% Ch1.5 连续与离散系统建模与方框图响应仿真
t = 0:0.02:8;
x = sin(1.2*t) .* (t <= 5) + ${M.fmt(p.noise, 2)} * sin(19*t);
${p.sysModel === 'rc' ? `tau = ${M.fmt(p.param, 2)};
y = zeros(size(t)); dt = t(2)-t(1);
for k = 2:length(t), y(k) = y(k-1) + (dt/tau)*(x(k-1) - y(k-1)); end` :
  p.sysModel === 'ma' ? `M = max(1, round(${M.fmt(p.param, 1)}));
y = filter(ones(1,M)/M, 1, x);` :
  p.sysModel === 'acc' ? `y = cumsum(x) * 0.08;` : `y = x.^2;`}
plot(t, x, 'Color', [0.3 0.7 1], 'LineWidth', 1.2); hold on;
plot(t, y, 'g', 'LineWidth', 2.2); grid on; legend('输入 x', '系统输出 y');`;
        },
        quiz: {
          question: '在离散时间系统方框图中，实现差分方程 y[n] - 0.8y[n-1] = x[n] 至少需要几个“单位延时器 D (z⁻¹)”？',
          options: ['1 个', '2 个', '0 个', '3 个'],
          answer: 0,
          explanation: '一阶差分方程 y[n] = 0.8y[n-1] + x[n] 只需将输出 y[n] 经过 1 个单位延时器得到 y[n-1]，乘以反馈系数 0.8 后与 x[n] 相加即可。'
        },
        compute(p) {
          const isDT = p.sysModel === 'ma' || p.sysModel === 'acc';
          if (isDT) {
            const N = 32;
            const inStems = [], midStems = [], outStems = [];
            const pIn = [], pOut = [];
            const xArr = [];
            for (let n = 0; n < N; n++) {
              const clean = n >= 2 && n <= 18 ? Math.sin(0.32 * (n - 2)) : 0;
              const nv = p.noise * Math.sin(2.4 * n);
              xArr.push(clean + nv);
            }
            const Mwin = Math.max(1, Math.round(p.param));
            let acc = 0;
            for (let n = 0; n < N; n++) {
              let yv = 0, mv = 0;
              if (p.sysModel === 'ma') {
                let s = 0;
                for (let k = 0; k < Mwin; k++) if (n - k >= 0) s += xArr[n - k];
                yv = s / Mwin;
                mv = n - 1 >= 0 ? xArr[n - 1] : 0;
              } else {
                acc += xArr[n] * 0.25;
                yv = acc;
                mv = n > 0 ? yv - xArr[n] * 0.25 : 0;
              }
              const tx = (n / (N - 1)) * 8;
              inStems.push([tx, 1.2, xArr[n]]);
              midStems.push([tx, 0, mv]);
              outStems.push([tx, -1.2, yv]);
              pIn.push([n, xArr[n]]);
              pOut.push([n, yv]);
            }
            return {
              scene: {
                axes: {
                  x: { min: 0, max: 8, label: '离散时刻 n (0 ~ 31)', format: (v) => `${Math.round((v / 8) * 31)}` },
                  y: { min: -1.8, max: 1.8, label: '方框图节点', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '输入x[n]' : v < -0.5 ? '输出y[n]' : '延时支路') },
                  z: { min: -1.8, max: 2.2, label: '序列幅值' }
                },
                stems: [
                  { points: inStems, baseZ: 0, color: '#38bdf8', width: 1.7, radius: 3.2, label: '输入 x[n]' },
                  { points: midStems, baseZ: 0, color: '#fbbf24', width: 1.6, radius: 3.0, label: '内部延时节点' },
                  { points: outStems, baseZ: 0, color: '#34d399', width: 2.2, radius: 4.0, label: '输出 y[n]' }
                ],
                legend: [
                  { color: '#38bdf8', label: '输入序列 x[n]' },
                  { color: '#fbbf24', label: '延时器状态 x[n-1]/y[n-1]' },
                  { color: '#34d399', label: '系统输出 y[n]' }
                ]
              },
              plots2d: [
                { title: '离散输入序列 x[n]', xMin: 0, xMax: 31, yMin: -1.8, yMax: 1.8, xLabel: 'n', series: [{ points: pIn, type: 'stems', color: '#38bdf8' }] },
                { title: '离散系统输出 y[n]', xMin: 0, xMax: 31, yMin: -1.8, yMax: 2.2, xLabel: 'n', series: [{ points: pOut, type: 'stems', color: '#34d399' }] }
              ],
              metrics: [
                { label: '离散系统架构', value: p.sysModel === 'ma' ? `${Mwin} 点 FIR 滑动平均` : '一阶 IIR 反馈累加器', status: 'ok' },
                { label: '所需延时单元数', value: p.sysModel === 'ma' ? `${Math.max(0, Mwin - 1)} 个` : '1 个 (反馈环)' },
                { label: '记忆特性', value: Mwin === 1 && p.sysModel === 'ma' ? '无记忆' : '有记忆系统' },
                { label: '高频毛刺抑制', value: p.sysModel === 'ma' && Mwin >= 3 ? '显著平滑抑制' : '累加积分效应' }
              ]
            };
          }

          // Continuous RC or Squarer
          const ts = M.linspace(0, 8, 280);
          const dt = ts[1] - ts[0];
          const tau = Math.max(0.2, p.param);
          const cIn = [], cMid = [], cOut = [];
          const pIn = [], pOut = [];
          let y = 0;
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const x = (t >= 0.5 && t <= 5.2 ? Math.sin(1.25 * (t - 0.5)) : 0) + p.noise * Math.sin(18 * t);
            let mid = 0;
            if (p.sysModel === 'rc') {
              const dydt = (x - y) / tau;
              mid = dydt * 0.6;
              y += dydt * dt;
            } else {
              y = x * x;
              mid = x;
            }
            cIn.push([t, 1.2, x]);
            cMid.push([t, 0, mid]);
            cOut.push([t, -1.2, y]);
            pIn.push([t, x]);
            pOut.push([t, y]);
          }

          return {
            scene: {
              axes: {
                x: { min: 0, max: 8, label: '时间 t (s)' },
                y: { min: -1.8, max: 1.8, label: '方框图信号流', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '激励x(t)' : v < -0.5 ? '响应y(t)' : '内部节点') },
                z: { min: -1.8, max: 2.2, label: '信号幅值' }
              },
              ribbons: [{ points: cOut, baseZ: 0, color: 'rgba(52,211,153,0.2)' }],
              curves: [
                { points: cIn, color: '#38bdf8', width: 2.0, label: '输入激励 x(t)' },
                { points: cMid, color: '#fbbf24', width: 2.0, label: '积分器前节点 dy/dt' },
                { points: cOut, color: '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '系统输出 y(t)' }
              ],
              legend: [
                { color: '#38bdf8', label: '输入激励 x(t)' },
                { color: '#fbbf24', label: p.sysModel === 'rc' ? '加法器误差节点 (x-y)/τ' : '瞬时通路节点' },
                { color: '#34d399', label: '系统输出 y(t)' }
              ]
            },
            plots2d: [
              { title: '输入激励信号 x(t) (含高频噪声)', xMin: 0, xMax: 8, yMin: -1.8, yMax: 1.8, xLabel: 't', series: [{ points: pIn, color: '#38bdf8', width: 1.7 }] },
              { title: '系统输出响应 y(t)', xMin: 0, xMax: 8, yMin: -1.8, yMax: 2.2, xLabel: 't', series: [{ points: pOut, color: '#34d399', width: 2.2, fill: 'rgba(52,211,153,0.14)' }] }
            ],
            metrics: [
              { label: '系统微分/代数模型', value: p.sysModel === 'rc' ? `${M.fmt(tau, 1)}·dy/dt + y = x` : 'y(t) = x²(t)', status: 'ok' },
              { label: '记忆性', value: p.sysModel === 'rc' ? '有记忆 (含储能积分器)' : '无记忆系统' },
              { label: '线性性质', value: p.sysModel === 'rc' ? '线性时不变 (LTI)' : '非线性系统', status: p.sysModel === 'rc' ? 'ok' : 'warn' },
              { label: '基本方框单元', value: p.sysModel === 'rc' ? '加法器 + 数乘 1/τ + 积分器 ∫' : '乘法器 ×' }
            ]
          };
        }
      },

      /* ==================== 1.6 ==================== */
      {
        id: '1.6',
        code: 'Ch1-(6)',
        level: '理解',
        title: '1.6 基本系统六大性质三维交互检验台',
        summary: '通过叠加对比实验直观判别：线性、时不变性、因果性、稳定性、记忆性与可逆性！',
        presets: [
          { label: '标准线性时不变 y(t) = 1.5x(t-0.5)', values: { sys: 'lti', testMode: 'lin', a: 1.2, b: -0.8, shift: 1.2 } },
          { label: '线性但时变系统 y(t) = t·x(t)', values: { sys: 'timeVar', testMode: 'ti', a: 1.2, b: 0.8, shift: 1.2 } },
          { label: '增量线性(非线性!) y(t) = x(t) + 0.8', values: { sys: 'affine', testMode: 'lin', a: 1.2, b: 1.0, shift: 1.0 } },
          { label: '非因果超前系统 y(t) = x(t + 1.2)', values: { sys: 'nonCausal', testMode: 'causal', a: 1.0, b: 0.5, shift: 1.0 } },
          { label: '时间压缩系统 y(t) = x(2t) [时变+非因果]', values: { sys: 'scaleT', testMode: 'ti', a: 1.0, b: 0.5, shift: 1.2 } }
        ],
        controls: [
          {
            key: 'sys', label: '待测系统算子 T{x(t)}', type: 'select', default: 'lti',
            options: [
              { value: 'lti', label: '① y(t) = 1.5·x(t - 0.5)  [线性·时不变·因果·稳定]' },
              { value: 'timeVar', label: '② y(t) = 0.6t · x(t)     [线性·时变!]' },
              { value: 'affine', label: '③ y(t) = x(t) + 0.8      [非线性(违反零输入零输出)!]' },
              { value: 'sq', label: '④ y(t) = x²(t)           [非线性·不可逆·无记忆]' },
              { value: 'nonCausal', label: '⑤ y(t) = x(t + 1.2)      [非因果超前预测系统!]' },
              { value: 'scaleT', label: '⑥ y(t) = x(2t)           [线性·时变·非因果!]' }
            ]
          },
          {
            key: 'testMode', label: '三维检验模式', type: 'select', default: 'lin',
            options: [
              { value: 'lin', label: '线性检验：T{ax₁+bx₂} ≟ aT{x₁}+bT{x₂}' },
              { value: 'ti', label: '时不变检验：T{x(t-t₀)} ≟ y(t-t₀)' },
              { value: 'causal', label: '因果性检验：激励在 t=0 开启前是否有响应？' }
            ]
          },
          { key: 'a', label: '加权系数 a', type: 'range', min: -1.5, max: 1.8, step: 0.1, default: 1.2 },
          { key: 'shift', label: '时移检验量 t₀', type: 'range', min: -2.0, max: 2.0, step: 0.2, default: 1.2, unit: 's' }
        ],
        theory: {
          formula: '线性：T{ax₁(t)+bx₂(t)} ≡ aT{x₁(t)}+bT{x₂(t)}；  时不变：若 y(t)=T{x(t)}，则 T{x(t-t₀)} ≡ y(t-t₀)',
          objectives: [
            '【理解】系统六大基本性质（记忆性、可逆性、因果性、BIBO稳定性、时不变性、线性）的严格判别法；',
            '【了解】因果性（输出不超前于输入）与 BIBO 稳定性的物理与工程含义，识破 y=x+c 与 y=x(2t) 等高频易错陷阱。'
          ],
          guide3d: '三维视图同时绘出“路径 A 实测输出”（青色）与“路径 B 理论期望输出”（琥珀色），以及最前方的“性质违背误差 Δ(t)”（红色）：若红线恒为 0 则通过检验，若红线隆起则直观暴露性质违背处！'
        },
        matlab(p) {
          return `% Ch1.6 系统线性与时不变性数值检验台
t = -4:0.01:4; t0 = ${M.fmt(p.shift, 2)}; a = ${M.fmt(p.a, 2)}; b = -0.8;
x1 = exp(-t.^2); x2 = sin(1.5*t) .* (abs(t)<=2.5);
% 以倍速系统 y(t) = x(2t) 为例检验时不变性：
T_op = @(sig_fun, tt) sig_fun(2*tt);
x_fun = @(tt) exp(-(tt+0.5).^2);
y_shift_input = T_op(@(tt) x_fun(tt - t0), t); % 先时移输入再过系统: x(2t - t0)
y_shift_output = x_fun(2*(t - t0));            % 先过系统再时移输出: x(2t - 2t0)
plot(t, y_shift_input, 'b', t, y_shift_output, '--r', t, y_shift_input - y_shift_output, 'k', 'LineWidth', 1.8);
legend('T{x(t-t_0)}', 'y(t-t_0)', '时不变性误差'); grid on;`;
        },
        quiz: {
          question: '系统 y(t) = x(2t)（如磁带 2 倍速快放）具有以下哪组系统性质？',
          options: ['线性、时变、非因果、稳定', '线性、时不变、因果、稳定', '非线性、时变、因果、稳定', '线性、时不变、非因果、不稳定'],
          answer: 0,
          explanation: '① 满足齐次与可加性，故线性；② 先时移再快放得 x(2t-t₀)，先快放再时移得 x(2(t-t₀))=x(2t-2t₀)，两者不等，故时变！③ 当 t=1 时 y(1)=x(2) 依赖未来时刻输入，故非因果！④ 有界输入必有界输出，故稳定。'
        },
        compute(p) {
          // Operator T takes a signal function fx(t) and evaluates output at time t
          const applyT = (fx, t) => {
            if (p.sys === 'lti') return 1.5 * fx(t - 0.5);
            if (p.sys === 'timeVar') return 0.6 * t * fx(t);
            if (p.sys === 'affine') return fx(t) + 0.8;
            if (p.sys === 'sq') return Math.pow(fx(t), 2);
            if (p.sys === 'nonCausal') return fx(t + 1.2);
            return fx(2 * t); // scaleT
          };

          const propsMeta = {
            lti: { lin: true, ti: true, causal: true, stable: true, mem: '有记忆', inv: '可逆' },
            timeVar: { lin: true, ti: false, causal: true, stable: false, mem: '无记忆', inv: 't=0不可逆' },
            affine: { lin: false, ti: true, causal: true, stable: true, mem: '无记忆', inv: '可逆' },
            sq: { lin: false, ti: true, causal: true, stable: true, mem: '无记忆', inv: '不可逆(正负同值)' },
            nonCausal: { lin: true, ti: true, causal: false, stable: true, mem: '有记忆', inv: '可逆' },
            scaleT: { lin: true, ti: false, causal: false, stable: true, mem: '有记忆', inv: '可逆' }
          }[p.sys];

          const ts = M.linspace(-4, 4, 280);
          const x1 = (t) => Math.exp(-Math.pow(t + 0.6, 2) * 1.2);
          const x2 = (t) => (Math.abs(t) <= 2.4 ? 0.8 * Math.sin(1.6 * t) : 0);
          const xCausal = (t) => (t >= 0 ? 1.2 * Math.exp(-0.5 * t) * Math.cos(2 * t) : 0);

          const cA = [], cB = [], cErr = [];
          const pA = [], pB = [], pErr = [];
          let maxErr = 0;

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            let vA = 0, vB = 0, err = 0;
            if (p.testMode === 'lin') {
              const b = -0.75;
              vA = applyT((u) => p.a * x1(u) + b * x2(u), t);
              vB = p.a * applyT(x1, t) + b * applyT(x2, t);
              err = vA - vB;
            } else if (p.testMode === 'ti') {
              vA = applyT((u) => x1(u - p.shift), t);
              vB = applyT(x1, t - p.shift);
              err = vA - vB;
            } else {
              // Causality test: input xCausal(t) is 0 for all t < 0
              vA = xCausal(t); // Input turned on at t=0
              vB = applyT(xCausal, t); // System response
              err = t < -0.02 ? vB : 0; // Any non-zero response before t=0 violates causality!
            }
            maxErr = Math.max(maxErr, Math.abs(err));
            cA.push([t, 1.2, vA]);
            cB.push([t, 0, vB]);
            cErr.push([t, -1.2, err]);
            pA.push([t, vA]);
            pB.push([t, vB]);
            pErr.push([t, err]);
          }

          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '时间 t (s)' },
                y: { min: -1.8, max: 1.8, label: '检验通道', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '通道A' : v < -0.5 ? '误差Δ' : '通道B') },
                z: { min: -2.4, max: 2.6, label: '信号幅值' }
              },
              ribbons: [{ points: cErr, baseZ: 0, color: maxErr > 0.02 ? 'rgba(244,63,94,0.28)' : 'rgba(52,211,153,0.18)' }],
              curves: [
                { points: cA, color: '#38bdf8', width: 2.5, label: p.testMode === 'causal' ? '因果激励 x(t) (t<0为0)' : '路径 A 输出' },
                { points: cB, color: '#fbbf24', width: 2.5, label: p.testMode === 'causal' ? '系统响应 y(t)' : '路径 B 期望输出' },
                { points: cErr, color: maxErr > 0.02 ? '#f43f5e' : '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '违背误差 Δ(t)' }
              ],
              legend: [
                { color: '#38bdf8', label: p.testMode === 'lin' ? 'T{ax₁+bx₂}' : p.testMode === 'ti' ? '先移输入 T{x(t-t₀)}' : 't=0 开启激励 x(t)' },
                { color: '#fbbf24', label: p.testMode === 'lin' ? 'aT{x₁}+bT{x₂}' : p.testMode === 'ti' ? '后移输出 y(t-t₀)' : '实际系统响应 y(t)' },
                { color: maxErr > 0.02 ? '#f43f5e' : '#34d399', label: maxErr > 0.02 ? '误差 Δ≠0 (违背性质!)' : '误差 Δ≡0 (满足性质✓)' }
              ]
            },
            plots2d: [
              {
                title: '双路径对照波形',
                xMin: -4, xMax: 4, yMin: -2.4, yMax: 2.6, xLabel: 't',
                series: [
                  { points: pA, color: '#38bdf8', width: 2.1 },
                  { points: pB, color: '#fbbf24', dashed: true, width: 2.1 }
                ]
              },
              {
                title: '判别误差曲线 Δ(t) (恒为0即成立)',
                xMin: -4, xMax: 4, yMin: -2.0, yMax: 2.0, xLabel: 't',
                series: [{ points: pErr, color: maxErr > 0.02 ? '#f43f5e' : '#34d399', fill: maxErr > 0.02 ? 'rgba(244,63,94,0.2)' : 'rgba(52,211,153,0.12)', width: 2.2 }]
              }
            ],
            metrics: [
              { label: '线性 & 时不变性', value: `${propsMeta.lin ? '线性✓' : '非线性✗'} · ${propsMeta.ti ? '时不变✓' : '时变✗'}`, status: propsMeta.lin && propsMeta.ti ? 'ok' : 'warn' },
              { label: '因果性 & 稳定性', value: `${propsMeta.causal ? '因果✓' : '非因果✗'} · ${propsMeta.stable ? 'BIBO稳定✓' : '不稳定✗'}`, status: propsMeta.causal && propsMeta.stable ? 'ok' : 'warn' },
              { label: '记忆性 & 可逆性', value: `${propsMeta.mem} · ${propsMeta.inv}` },
              { label: '当前检验最大偏差', value: M.fmt(maxErr, 3), status: maxErr > 0.02 ? 'err' : 'ok' }
            ]
          };
        }
      }
    ]
  });
})();
