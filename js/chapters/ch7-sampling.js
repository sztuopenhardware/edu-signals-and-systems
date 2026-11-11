/**
 * 第 7 章：采样 (Chapter 7) — 5 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 7 章全部 6 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch7',
    number: '第 7 章',
    title: '第 7 章：采样',
    shortTitle: 'Ch7 采样与信号重建',
    weeks: '第 13–14 周 · 4 学时',
    syllabusItems: '冲激串与零阶保持采样、奈奎斯特采样定理、Sinc/ZOH/线性内插重建、欠采样混叠、连续信号的离散处理、抽取与内插',
    cases: [
      /* ==================== 7.1 ==================== */
      {
        id: '7.1',
        code: 'Ch7-(1)(2)',
        level: '掌握',
        title: '7.1 冲激串采样、零阶保持采样与奈奎斯特采样定理',
        summary: '三维双域实时联动：调节采样角频率 ω_s 跨越奈奎斯特阈值 2ω_M，观察频谱周期延拓副本 (1/T)∑X(j(ω-kω_s)) 的分离与重叠！',
        presets: [
          { label: '过采样 ωs = 10 > 2ωM = 6 (频谱清晰分离!)', values: { ws: 10.0, wM: 3.0, holdMode: 'impulse' } },
          { label: '奈奎斯特临界采样 ωs = 2ωM = 6.0 (刚好相切!)', values: { ws: 6.0, wM: 3.0, holdMode: 'impulse' } },
          { label: '欠采样 ωs = 4.2 < 2ωM = 6.0 (频谱混叠重叠!)', values: { ws: 4.2, wM: 3.0, holdMode: 'impulse' } },
          { label: '零阶保持采样 ZOH (附加 Sa(ωT/2) 孔径衰减包络)', values: { ws: 9.0, wM: 2.8, holdMode: 'zoh' } }
        ],
        controls: [
          {
            key: 'holdMode', label: '采样物理机制', type: 'select', default: 'impulse',
            options: [
              { value: 'impulse', label: '理想冲激串采样 x_p(t) = x(t)·∑δ(t-nT)' },
              { value: 'zoh', label: '零阶保持采样 x_0(t) [工程 A/D 采样保持器，乘 H_0(jω)]' }
            ]
          },
          { key: 'ws', label: '采样角频率 ω_s = 2π/T', type: 'range', min: 3.2, max: 12.0, step: 0.2, default: 9.0, unit: 'rad/s' },
          { key: 'wM', label: '原带限信号最高截止频率 ω_M', type: 'range', min: 1.5, max: 4.5, step: 0.2, default: 3.0, unit: 'rad/s' }
        ],
        theory: {
          formula: 'X_p(jω) = (1/T) ∑_{k=-∞}^{+∞} X(j(ω - kω_s))；   奈奎斯特无失真采样条件：ω_s > 2ω_M （f_s > 2f_M）！',
          objectives: [
            '【掌握】时域理想冲激串采样导致频域以采样角频率 ω_s = 2π/T 为间隔周期延拓的核心公式；',
            '【掌握】奈奎斯特-香农采样定理的意义与两个前提条件（① 信号严格带限于 ω_M；② 采样率 ω_s > 2ω_M），以及零阶保持采样的阶梯波形与孔径效应。'
          ],
          guide3d: '三维视图前排展示时域连续波 x(t) 与采样样本/零阶保持阶梯波；后排分色展示 k=0 基带频谱（绿）与 k=±1, ±2 周期延拓镜像频谱（琥珀色）——把 ω_s 拖到小于 2ω_M 时立即看到两座频谱山峰侵入彼此！'
        },
        matlab(p) {
          return `% Ch7.1 理想冲激串采样与零阶保持采样时频特性对比
wM = ${M.fmt(p.wM, 2)}; ws = ${M.fmt(p.ws, 2)}; T = 2*pi/ws;
t = -4:0.005:4; nT = -4:T:4;
x = (sin(0.5*wM*t)./(0.5*wM*t + eps)).^2;      % 严格带限于 wM 的 sinc^2 脉冲
xn = (sin(0.5*wM*nT)./(0.5*wM*nT + eps)).^2;
subplot(2,1,1); plot(t, x, '--b'); hold on;
${p.holdMode === 'zoh' ? "stairs(nT, xn, 'r', 'LineWidth', 1.8);" : "stem(nT, xn, 'r', 'filled');"}
grid on; title(sprintf('\\omega_s = %.1f, 奈奎斯特率 2\\omega_M = %.1f', ws, 2*wM));
w = -18:0.05:18; X_rep = zeros(size(w));
for k = -3:3, X_rep = X_rep + max(0, 1 - abs(w - k*ws)/wM); end
subplot(2,1,2); plot(w, X_rep, 'g', 'LineWidth', 2); grid on; title('周期延拓频谱 (归一化)');`;
        },
        quiz: {
          question: '已知连续信号 x₁(t) 最高频率为 3 kHz，x₂(t) 最高频率为 5 kHz，现对乘积信号 y(t) = x₁(t) · x₂(t) 进行理想冲激串采样，为避免频谱混叠，最低奈奎斯特采样频率 f_s 应大于：',
          options: ['16 kHz（乘积对应频域卷积，y(t) 最高频率为 3+5 = 8 kHz，故 2f_M = 16 kHz！）', '10 kHz', '6 kHz', '30 kHz'],
          answer: 0,
          explanation: '经典必考题！时域相乘对应频域卷积，两个带限谱卷积后最高截止频率相加：f_y = f₁ + f₂ = 3 + 5 = 8 kHz，再由采样定理 f_s > 2f_y = 16 kHz！'
        },
        compute(p) {
          const T = M.TWO_PI / p.ws;
          const xFun = (t) => {
            const s = M.sa(0.5 * p.wM * t);
            return s * s;
          };

          const ts = M.linspace(-4, 4, 300);
          const cOrig = ts.map((t) => [t, -1.2, xFun(t)]);
          const sampleStems = [];
          const zohCurve = [];
          const p2dTimeOrig = ts.map((t) => [t, xFun(t)]);
          const p2dSamples = [];

          const nMax = Math.floor(4 / T);
          for (let n = -nMax; n <= nMax; n++) {
            const tn = n * T;
            const vn = xFun(tn);
            sampleStems.push([tn, -1.2, vn]);
            p2dSamples.push([tn, vn]);
            if (p.holdMode === 'zoh') {
              const tNext = Math.min(4, (n + 1) * T);
              zohCurve.push([tn, -1.2, vn], [tNext, -1.2, vn]);
            }
          }

          // Spectral replicas across w in [-18, 18]
          const ws = M.linspace(-18, 18, 340);
          const cBaseSpec = [], cRepSpec = [], cSumSpec = [];
          const pSumSpec = [], pZohEnv = [];

          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const xMap = (w / 18) * 4;
            const zohFactor = p.holdMode === 'zoh' ? Math.abs(M.sa((w * T) * 0.5)) : 1.0;
            const base = M.tri(w, p.wM) * zohFactor;
            let reps = 0;
            for (let k = -3; k <= 3; k++) {
              if (k !== 0) reps += M.tri(w - k * p.ws, p.wM) * zohFactor;
            }
            const tot = base + reps;
            cBaseSpec.push([xMap, 0.35, base]);
            cRepSpec.push([xMap, 0.95, reps]);
            cSumSpec.push([xMap, 1.45, tot]);
            pSumSpec.push([w, tot]);
            pZohEnv.push([w, zohFactor]);
          }

          const isAliased = p.ws < 2 * p.wM - 0.01;
          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '时间 t (s)  /  缩放角频率 ω (-18~+18)' },
                y: { min: -1.7, max: 1.8, label: '时域采样 → 基带谱 → 镜像延拓谱', ticks: [-1.2, 0.35, 1.45], format: (v) => (v < -0.4 ? '时域采样' : v < 0.8 ? 'k=0基带' : '合成谱X_p') },
                z: { min: 0, max: 1.65, label: '归一化幅值 / 频谱' }
              },
              ribbons: [
                { points: cBaseSpec, baseZ: 0, color: 'rgba(52,211,153,0.22)' },
                { points: cSumSpec, baseZ: 0, color: isAliased ? 'rgba(244,63,94,0.26)' : 'rgba(251,191,36,0.18)' }
              ],
              curves: [
                { points: cOrig, color: 'rgba(56,189,248,0.65)', width: 1.8, dashed: true, label: '连续包络 x(t)' },
                ...(zohCurve.length ? [{ points: zohCurve, color: '#f43f5e', width: 2.5, label: '零阶保持阶梯 x₀(t)' }] : []),
                { points: cBaseSpec, color: '#34d399', width: 2.6, label: '基带谱 (k=0)' },
                { points: cRepSpec, color: '#fbbf24', width: 2.0, dashed: true, label: '延拓镜像谱 (k≠0)' },
                { points: cSumSpec, color: isAliased ? '#f43f5e' : '#38bdf8', width: 3.0, glow: true, label: '采样总谱 X_p(jω)' }
              ],
              stems: p.holdMode === 'impulse'
                ? [{ points: sampleStems, baseZ: 0, color: '#f43f5e', width: 2.3, impulse: true, label: '冲激采样串 x_p(t)' }]
                : [],
              legend: [
                { color: '#f43f5e', label: p.holdMode === 'zoh' ? '零阶保持波形 x₀(t)' : '冲激采样样本 x(nT)' },
                { color: '#34d399', label: 'k=0 原基带谱' },
                { color: '#fbbf24', label: 'k=±1,±2 周期镜像谱' }
              ]
            },
            plots2d: [
              {
                title: '时域采样对比：原连续波 [蓝虚] vs 离散采样点 [红]',
                xMin: -4, xMax: 4, yMin: -0.1, yMax: 1.2, xLabel: 't(s)',
                series: [
                  { points: p2dTimeOrig, color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: p.holdMode === 'zoh' ? zohCurve.map((q) => [q[0], q[2]]) : p2dSamples, type: p.holdMode === 'zoh' ? 'line' : 'stems', color: '#f43f5e', width: 2.0 }
                ]
              },
              {
                title: `周期延拓总频谱 X_p(jω) ${p.holdMode === 'zoh' ? '(蓝虚为 ZOH Sa孔径包络)' : ''}`,
                xMin: -18, xMax: 18, yMin: 0, yMax: 1.65, xLabel: 'ω',
                series: [
                  { points: pSumSpec, color: isAliased ? '#f43f5e' : '#34d399', fill: isAliased ? 'rgba(244,63,94,0.2)' : 'rgba(52,211,153,0.18)', width: 2.2 },
                  ...(p.holdMode === 'zoh' ? [{ points: pZohEnv, color: '#38bdf8', dashed: true, width: 1.5 }] : [])
                ],
                vLines: [{ x: -p.ws * 0.5, color: '#fbbf24' }, { x: p.ws * 0.5, color: '#fbbf24' }]
              }
            ],
            metrics: [
              { label: '奈奎斯特频率 2ω_M', value: `${M.fmt(2 * p.wM, 2)} rad/s`, status: 'ok' },
              { label: '过采样比 ω_s / (2ω_M)', value: `${M.fmt(p.ws / (2 * p.wM), 2)} ×`, status: isAliased ? 'err' : 'ok' },
              { label: '频谱状态判别', value: isAliased ? '发生混叠失真! (ω_s < 2ω_M)' : Math.abs(p.ws - 2 * p.wM) < 0.05 ? '临界采样 (刚好相切)' : '无混叠 (存在保护带✓)', status: isAliased ? 'err' : 'ok' },
              { label: '采样间隔 T = 2π/ω_s', value: `${M.fmt(T, 3)} s` }
            ]
          };
        }
      },

      /* ==================== 7.2 ==================== */
      {
        id: '7.2',
        code: 'Ch7-(3)',
        level: '掌握',
        title: '7.2 利用内插由样本重建信号：三维 Sinc 基函数分解 vs ZOH / 线性内插',
        summary: '在三维空间看清惠特克-香农内插公式本质：每个样本 x(nT) 激发一朵移位 Sa 波，叠加在整点互不干扰、在样本间完美填平！',
        camera: { azimuth: -0.84, elevation: 0.45, zoom: 1.0 },
        presets: [
          { label: '理想低通 Sinc 内插 (过采样完美重构!)', values: { interp: 'sinc', T: 0.7 } },
          { label: '零阶保持内插 ZOH (阶梯状高频谐波失真)', values: { interp: 'zoh', T: 0.7 } },
          { label: '一阶保持线性内插 FOH (折线连接样本点)', values: { interp: 'foh', T: 0.7 } },
          { label: '采样过稀 T=1.4s (欠采样内插无法还原原波形!)', values: { interp: 'sinc', T: 1.4 } }
        ],
        controls: [
          {
            key: 'interp', label: '内插重建滤波器核 h_r(t)', type: 'select', default: 'sinc',
            options: [
              { value: 'sinc', label: '理想带限内插：h_r(t) = sinc(t/T)  [理想低通滤波器]' },
              { value: 'zoh', label: '零阶保持内插 (ZOH)：h_r(t) = rect((t-T/2)/T)  [阶梯保持]' },
              { value: 'foh', label: '一阶线性内插 (FOH)：h_r(t) = tri(t/T)  [折线连接]' }
            ]
          },
          { key: 'T', label: '采样周期 T', type: 'range', min: 0.45, max: 1.5, step: 0.05, default: 0.7, unit: 's' }
        ],
        theory: {
          formula: 'x_r(t) = ∑_{n=-∞}^{+∞} x(nT) · h_r(t - nT)；  理想内插 h_r(t) = sin(πt/T) / (πt/T) = sinc(t/T)',
          objectives: [
            '【掌握】由离散样本重建连续信号的时域内插卷积公式与频域低通滤波解释；',
            '【理解】理想 sinc 内插、零阶保持（ZOH）与一阶保持（线性内插 FOH）在实现复杂度与重建精度上的对比。'
          ],
          guide3d: '三维空间沿深度轴 Y 分离展示每一个采样点 x(nT) 所单独激发的内插基波 x(nT)·h_r(t-nT)：观察每朵 sinc 波在其他采样时刻 mT 处恰好穿过零点，而在最前排叠加成光滑绿线 x_r(t)！'
        },
        matlab(p) {
          return `% Ch7.2 香农 Sinc 内插、零阶保持与一阶线性内插重建对比
t = -3.5:0.01:3.5; T = ${M.fmt(p.T, 2)}; nT = -4*T : T : 4*T;
x_fun = @(u) cos(2.2*u) .* exp(-0.18*u.^2);
x_true = x_fun(t); xn = x_fun(nT);
x_sinc = zeros(size(t));
for k = 1:length(nT)
  x_sinc = x_sinc + xn(k) * sinc((t - nT(k)) / T);
end
plot(t, x_true, '--b', t, x_sinc, 'g', 'LineWidth', 2); hold on;
stem(nT, xn, 'r', 'filled'); grid on; legend('原连续信号', 'Sinc内插重构', '采样样本');`;
        },
        quiz: {
          question: '一阶保持（线性内插：将相邻采样点用直线段相连）所对应的重建滤波器单位冲激响应 h_r(t) 及其频率响应 H_r(jω) 形状分别为：',
          options: [
            'h_r(t) 为底宽 2T 的对称三角形脉冲，H_r(jω) = T · Sa²(ωT/2)',
            'h_r(t) 为宽度 T 的矩形脉冲，H_r(jω) = T · Sa(ωT/2)',
            'h_r(t) 为 sinc(t/T)，H_r(jω) 为理想矩形窗',
            'h_r(t) 为单边指数衰减函数'
          ],
          answer: 0,
          explanation: '线性折线内插等价于样本冲激串卷积底宽为 2T、峰值为 1 的三角形核 tri(t/T)，而三角形脉冲是两个矩形脉冲的卷积，故频率响应为 T·Sa²(ωT/2)（比 ZOH 的一次方衰减高频镜像更快）！'
        },
        compute(p) {
          const xTrue = (t) => Math.cos(2.3 * t) * Math.exp(-0.2 * t * t) + 0.35 * Math.sin(1.1 * t);
          const kernel = (u) => {
            if (p.interp === 'sinc') return M.sinc(u / p.T);
            if (p.interp === 'zoh') return u >= 0 && u < p.T ? 1.0 : 0.0;
            return M.tri(u, p.T); // FOH
          };

          const ts = M.linspace(-3.5, 3.5, 300);
          const nMax = Math.ceil(4.2 / p.T);
          const xrArr = new Float64Array(ts.length);
          const basisCurves = [];
          const sampleStems = [];

          for (let n = -nMax; n <= nMax; n++) {
            const tn = n * p.T;
            const xn = xTrue(tn);
            if (Math.abs(tn) <= 3.5) sampleStems.push([tn, -1.4, xn]);
            const slicePts = [];
            for (let i = 0; i < ts.length; i++) {
              const kv = xn * kernel(ts[i] - tn);
              xrArr[i] += kv;
              if (Math.abs(n) <= 3) slicePts.push([ts[i], 0.35 + (n + 3) * 0.24, kv]);
            }
            if (slicePts.length) {
              basisCurves.push({ points: slicePts, color: M.colormap((n + 3) / 6, 0.7), width: 1.5, label: `n=${n}基函数` });
            }
          }

          const cTrue = ts.map((t) => [t, -1.4, xTrue(t)]);
          const cRec = ts.map((t, i) => [t, -1.4, xrArr[i]]);

          let rmsErr = 0;
          const pErr = [];
          for (let i = 0; i < ts.length; i++) {
            const e = xTrue(ts[i]) - xrArr[i];
            rmsErr += e * e;
            pErr.push([ts[i], e]);
          }
          rmsErr = Math.sqrt(rmsErr / ts.length);

          return {
            scene: {
              axes: {
                x: { min: -3.5, max: 3.5, label: '时间 t (s)' },
                y: { min: -1.8, max: 2.0, label: '前排合成波 ← 后排各样本移位内插核' },
                z: { min: -1.5, max: 1.6, label: '信号幅值' }
              },
              ribbons: [{ points: cRec, baseZ: 0, color: 'rgba(52,211,153,0.2)' }],
              curves: [
                ...basisCurves,
                { points: cTrue, color: '#38bdf8', width: 2.0, dashed: true, label: '真实原信号 x(t)' },
                { points: cRec, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '内插重建信号 x_r(t)' }
              ],
              stems: [{ points: sampleStems, baseZ: 0, color: '#f43f5e', width: 2.2, radius: 4.0, label: '样本点 x(nT)' }],
              legend: [
                { color: '#f43f5e', label: '离散样本 x(nT)' },
                { color: '#fbbf24', label: '后排：单个移位内插基波 x(nT)h_r(t-nT)' },
                { color: '#34d399', label: '前排：叠加重构波形 x_r(t)' }
              ]
            },
            plots2d: [
              {
                title: '原连续波形 x(t) [蓝虚] vs 内插重建波形 x_r(t) [绿]',
                xMin: -3.5, xMax: 3.5, yMin: -1.5, yMax: 1.6, xLabel: 't(s)',
                series: [
                  { points: ts.map((t) => [t, xTrue(t)]), color: '#38bdf8', dashed: true, width: 1.8 },
                  { points: ts.map((t, i) => [t, xrArr[i]]), color: '#34d399', width: 2.3 },
                  { points: sampleStems.map((s) => [s[0], s[2]]), type: 'stems', color: '#f43f5e', radius: 2.8 }
                ]
              },
              { title: `重建误差曲线 e(t) = x(t) - x_r(t) (RMS = ${M.fmt(rmsErr, 4)})`, xMin: -3.5, xMax: 3.5, yMin: -0.8, yMax: 0.8, xLabel: 't(s)', series: [{ points: pErr, color: '#fbbf24', fill: 'rgba(251,191,36,0.2)', width: 1.8 }] }
            ],
            metrics: [
              { label: '内插核类型', value: p.interp === 'sinc' ? '理想带限 Sinc 核' : p.interp === 'zoh' ? '零阶阶梯保持 ZOH' : '一阶线性内插 FOH', status: 'ok' },
              { label: '采样角频率 ω_s', value: `${M.fmt(M.TWO_PI / p.T, 2)} rad/s` },
              { label: '重构均方根误差 RMS', value: M.fmt(rmsErr, 4), status: rmsErr < 0.08 ? 'ok' : 'warn' },
              { label: '因果可实现性', value: p.interp === 'sinc' ? '非因果理想极限' : '工程易实现内插' }
            ]
          };
        }
      },

      /* ==================== 7.3 ==================== */
      {
        id: '7.3',
        code: 'Ch7-(4)',
        level: '理解',
        title: '7.3 欠采样的效果：频谱混叠 (Aliasing) 与三维螺旋假频伪装',
        summary: '直观揭秘“车轮倒转”与混叠本质：当 f₀ > f_s/2 时，高频复螺旋与低频假频螺旋在三维空间穿过完全相同的采样珠子！',
        camera: { azimuth: -0.85, elevation: 0.42, zoom: 1.0 },
        presets: [
          { label: '典型欠采样混叠：f₀=0.85Hz, fs=1.0Hz → 倒转假频 -0.15Hz!', values: { f0: 0.85, fs: 1.0 } },
          { label: '倍频静止频闪：f₀ = fs = 1.0Hz → 重建变为直流常数!', values: { f0: 1.0, fs: 1.0 } },
          { label: '满足采样定理：f₀=0.35Hz < fs/2=0.6Hz (无混叠真实还原!)', values: { f0: 0.35, fs: 1.2 } }
        ],
        controls: [
          { key: 'f0', label: '原连续复正弦信号频率 f₀', type: 'range', min: 0.2, max: 1.6, step: 0.05, default: 0.85, unit: 'Hz' },
          { key: 'fs', label: '采样频率 f_s (= 1/T)', type: 'range', min: 0.6, max: 2.4, step: 0.05, default: 1.0, unit: 'Hz' }
        ],
        theory: {
          formula: '欠采样 (f₀ > f_s/2) 时重建出的表观混叠频率：f_alias = f₀ - round(f₀ / f_s) · f_s ∈ [-f_s/2, +f_s/2]！',
          objectives: [
            '【理解】欠采样产生频谱混叠（Aliasing）的频域原因（延拓冲激落入主低通带 [-f_s/2, f_s/2] 内）与时域表现（高频伪装成低频甚至相位倒转！）；',
            '【掌握】工程 A/D 转换前必须加装模拟抗混叠前置低通滤波器（Anti-aliasing Filter）的原因。'
          ],
          guide3d: '三维视觉震撼：蓝色密集螺旋是真实的输入高频波 e^{j2πf₀t}，红色发光圆珠是采样点 n/f_s，绿色稀疏螺旋是理想低通重建出的混叠假频波 e^{j2πf_alias·t}——观察两条频率迥异的三维螺旋竟严丝合缝穿过每一颗相同的采样圆珠！'
        },
        matlab(p) {
          return `% Ch7.3 欠采样混叠现象 (Aliasing) 与高频伪装成低频演示
f0 = ${M.fmt(p.f0, 2)}; fs = ${M.fmt(p.fs, 2)}; T = 1/fs;
t = -3:0.005:3; nT = -3:T:3;
f_alias = f0 - round(f0/fs)*fs;
x_true = cos(2*pi*f0*t);
x_samples = cos(2*pi*f0*nT);
x_recon = cos(2*pi*f_alias*t); % 经 [-fs/2, fs/2] 理想低通滤波重建结果
plot(t, x_true, ':b', t, x_recon, 'g', 'LineWidth', 2); hold on;
stem(nT, x_samples, 'r', 'filled'); grid on;
title(sprintf('原频率 f_0=%.2fHz, 采样率 f_s=%.2fHz -> 重建表观频率 |f_{alias}|=%.2fHz', f0, fs, abs(f_alias)));`;
        },
        quiz: {
          question: '对频率为 f₀ = 90 Hz 的余弦信号 cos(2π·90t) 以采样率 f_s = 100 Hz 进行采样，然后通过截止频率为 f_c = 50 Hz 的理想低通滤波器重建，所得连续信号的频率为：',
          options: ['10 Hz（发生混叠：|90 - 100| = 10 Hz 落入 50 Hz 通带内！）', '90 Hz', '50 Hz', '0 Hz（无输出）'],
          answer: 0,
          explanation: '90 Hz 信号频谱冲激位于 ±90 Hz；采样延拓 k=±1 产生 ±90 ∓ 100，其中 90 - 100 = -10 Hz 与 -90 + 100 = +10 Hz 落入 [-50, 50] Hz 低通窗内，重建出 10 Hz 余弦假频信号！'
        },
        compute(p) {
          const T = 1 / p.fs;
          const kNear = Math.round(p.f0 / p.fs);
          const fAlias = p.f0 - kNear * p.fs; // signed frequency in [-fs/2, fs/2]
          const isAliased = Math.abs(p.f0) > p.fs * 0.5 + 1e-4;

          const ts = M.linspace(-3, 3, 360);
          const trueHelix = [], aliasHelix = [];
          const pTrue = [], pAlias = [];

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const a1 = M.TWO_PI * p.f0 * t;
            const a2 = M.TWO_PI * fAlias * t;
            trueHelix.push([t, Math.cos(a1), Math.sin(a1)]);
            aliasHelix.push([t, Math.cos(a2), Math.sin(a2)]);
            pTrue.push([t, Math.cos(a1)]);
            pAlias.push([t, Math.cos(a2)]);
          }

          const sampleBeads = [], pSamples = [];
          const nMax = Math.floor(3 / T);
          for (let n = -nMax; n <= nMax; n++) {
            const tn = n * T;
            const ang = M.TWO_PI * p.f0 * tn;
            sampleBeads.push({ pos: [tn, Math.cos(ang), Math.sin(ang)], shape: 'dot', color: '#f43f5e', size: 6.2, label: n === 0 ? '共同采样点' : '' });
            pSamples.push([tn, Math.cos(ang)]);
          }

          // Frequency impulse plot [-2.5, 2.5] Hz
          const specStems = [];
          for (let k = -2; k <= 2; k++) {
            const fp = p.f0 + k * p.fs;
            const fn = -p.f0 + k * p.fs;
            if (Math.abs(fp) <= 2.6) specStems.push([fp, 1.0]);
            if (Math.abs(fn) <= 2.6) specStems.push([fn, 1.0]);
          }

          return {
            scene: {
              axes: {
                x: { min: -3, max: 3, label: '时间 t (s)' },
                y: { min: -1.3, max: 1.3, label: '实部 cos' },
                z: { min: -1.3, max: 1.3, label: '虚部 sin' }
              },
              curves: [
                { points: trueHelix, color: 'rgba(56,189,248,0.62)', width: 1.8, dashed: isAliased, label: `真实高频螺旋 f₀=${M.fmt(p.f0, 2)}Hz` },
                { points: aliasHelix, color: isAliased ? '#fbbf24' : '#34d399', width: 3.3, glow: true, shadowXZ: true, label: `重建螺旋 f_alias=${M.fmt(fAlias, 2)}Hz` }
              ],
              markers: sampleBeads,
              legend: [
                { color: '#38bdf8', label: `原真实信号 (${M.fmt(p.f0, 2)} Hz)` },
                { color: '#f43f5e', label: `采样时刻点 (fs=${M.fmt(p.fs, 2)} Hz)` },
                { color: isAliased ? '#fbbf24' : '#34d399', label: `低通重建波 (${M.fmt(fAlias, 2)} Hz)` }
              ]
            },
            plots2d: [
              {
                title: '实部时域对照：原高频余弦 [蓝虚] · 采样点 [红] · 重建低频假频波 [黄/绿]',
                xMin: -3, xMax: 3, yMin: -1.25, yMax: 1.25, xLabel: 't(s)',
                series: [
                  { points: pTrue, color: '#38bdf8', dashed: true, width: 1.5 },
                  { points: pAlias, color: isAliased ? '#fbbf24' : '#34d399', width: 2.3 },
                  { points: pSamples, type: 'stems', color: '#f43f5e', radius: 3.2 }
                ]
              },
              {
                title: `采样频谱冲激串与重建低通通带 [-fs/2, +fs/2] (绿色阴影区)`,
                xMin: -2.5, xMax: 2.5, yMin: 0, yMax: 1.3, xLabel: 'f(Hz)',
                vBands: [{ from: -p.fs * 0.5, to: p.fs * 0.5, color: 'rgba(52,211,153,0.18)' }],
                series: [{ points: specStems, type: 'stems', color: '#f43f5e' }],
                vLines: [{ x: -p.fs * 0.5, color: '#34d399' }, { x: p.fs * 0.5, color: '#34d399' }]
              }
            ],
            metrics: [
              { label: '奈奎斯特折叠频率 fs/2', value: `${M.fmt(p.fs * 0.5, 2)} Hz`, status: 'ok' },
              { label: '重建表观频率 f_alias', value: `${M.fmt(fAlias, 2)} Hz ${fAlias < -0.01 ? '(相位倒转!)' : ''}`, status: isAliased ? 'err' : 'ok' },
              { label: '混叠状态', value: isAliased ? '严重混叠伪装! (f₀ > fs/2)' : '无混叠真实还原 ✓', status: isAliased ? 'err' : 'ok' },
              { label: '车轮频闪转向', value: !isAliased ? '正向真实转速' : Math.abs(fAlias) < 0.01 ? '静止不动!' : fAlias < 0 ? '视觉倒转!' : '正向变慢!' }
            ]
          };
        }
      },

      /* ==================== 7.4 ==================== */
      {
        id: '7.4',
        code: 'Ch7-(5)',
        level: '掌握',
        title: '7.4 连续时间信号的离散时间处理：C/D → H_d(e^{jΩ}) → D/C 全链路',
        summary: '现代数字信号处理基石：固定同一数字滤波器截止角 Ω_c 不变，仅调节采样率 ω_s 即可动态缩放等效模拟截止频率 ω_c = Ω_c / T！',
        presets: [
          { label: '标准采样率 T=0.25s (等效模拟截止 ωc = Ωc/T = 5.0 rad/s)', values: { OcPi: 0.4, T: 0.25 } },
          { label: '放慢采样 T=0.50s (同一数字滤波器等效截止降为 2.5 rad/s!)', values: { OcPi: 0.4, T: 0.50 } },
          { label: '加快采样 T=0.15s (等效模拟截止升至 8.4 rad/s!)', values: { OcPi: 0.4, T: 0.15 } }
        ],
        controls: [
          { key: 'OcPi', label: '数字滤波器截止角频率 Ω_c (×π rad)', type: 'range', min: 0.15, max: 0.85, step: 0.05, default: 0.4 },
          { key: 'T', label: 'C/D 与 D/C 采样周期 T', type: 'range', min: 0.15, max: 0.65, step: 0.05, default: 0.25, unit: 's' }
        ],
        theory: {
          formula: '频率映射 Ω = ω·T；  当无混叠 (|ω| < π/T) 时，整个系统等效为连续 LTI 系统：H_eff(jω) = H_d(e^{jωT})！',
          objectives: [
            '【掌握】连续信号经 C/D 转换、离散 LTI 系统 H_d(e^{jΩ}) 处理再经理想 D/C 重建等效为模拟 LTI 滤波器的充要条件与公式 H_eff(jω)=H_d(e^{jωT})（|ω|<π/T）；',
            '【理解】数字信号处理器的巨大灵活性——无需更换硬件电容电感，仅改变采样时钟频率 f_s = 1/T 就能自由调节等效模拟滤波器截止频率！'
          ],
          guide3d: '三维空间沿深度轴 Y 展示三级混合信号流：后排为连续双音输入 x_c(t)，中排为固定数字滤波器下的离散处理序列 y_d[n]，前排为 D/C 重建连续输出 y_c(t)！拖动采样周期 T 观察高频分量何时被同一数字滤波器切掉！'
        },
        matlab(p) {
          return `% Ch7.4 连续时间信号的离散时间处理 H_eff(jw) = H_d(e^{jwT})
T = ${M.fmt(p.T, 2)}; Oc = ${M.fmt(p.OcPi, 2)} * pi;
wc_eff = Oc / T;                         % 等效模拟低通截止角频率!
t = -3:0.005:3; n = round(-3/T):round(3/T);
xc_fun = @(u) cos(1.8*u) + 0.7*cos(4.2*u); % 1.8 rad/s 基频 + 4.2 rad/s 高频分量
xd = xc_fun(n * T);
hd = (Oc/pi) * sinc((Oc/pi) * (-24:24));   % 固定数字低通滤波器
yd = conv(xd, hd, 'same');
yc = zeros(size(t));
for k = 1:length(n), yc = yc + yd(k)*sinc((t - n(k)*T)/T); end
plot(t, xc_fun(t), ':b', t, yc, 'g', 'LineWidth', 2); grid on;
title(sprintf('数字截止 \\Omega_c=%.2f\\pi, T=%.2fs -> 等效模拟截止 \\omega_c = %.2f rad/s', Oc/pi, T, wc_eff));`;
        },
        quiz: {
          question: '在无混叠 C/D → 数字低通滤波器（截止数字频率 Ω_c = 0.5π）→ D/C 系统中，若采样频率取 f_s = 10 kHz（T = 0.1 ms），则等效模拟低通滤波器的截止频率 f_c 为：',
          options: ['2.5 kHz（由 2πf_c · T = Ω_c = 0.5π 解得 f_c = 0.25 f_s = 2.5 kHz！）', '5.0 kHz', '10 kHz', '0.5 kHz'],
          answer: 0,
          explanation: '由频率映射关系 Ω = ωT = 2πf / f_s，令 Ω_c = 0.5π 得 f_c = (Ω_c / 2π) f_s = 0.25 × 10 kHz = 2.5 kHz。若将采样时钟翻倍至 20 kHz，等效模拟截止自动变为 5 kHz！'
        },
        compute(p) {
          const Oc = p.OcPi * Math.PI;
          const wcEff = Oc / p.T;
          const wNyq = Math.PI / p.T;
          const w1 = 1.8, w2 = 4.2;

          const ts = M.linspace(-3, 3, 280);
          const xcArr = ts.map((t) => 0.75 * Math.cos(w1 * t) + 0.55 * Math.cos(w2 * t));
          const ycArr = ts.map((t) => {
            const g1 = w1 <= wcEff ? 1 : 0;
            const g2 = w2 <= wNyq ? (w2 <= wcEff ? 1 : 0) : 0;
            return 0.75 * g1 * Math.cos(w1 * t) + 0.55 * g2 * Math.cos(w2 * t);
          });

          const nMax = Math.floor(3 / p.T);
          const ydStems = [];
          for (let n = -nMax; n <= nMax; n++) {
            const tn = n * p.T;
            const g1 = w1 <= wcEff ? 1 : 0;
            const g2 = w2 <= wcEff ? 1 : 0;
            ydStems.push([tn, 0, 0.75 * g1 * Math.cos(w1 * tn) + 0.55 * g2 * Math.cos(w2 * tn)]);
          }

          const ws = M.linspace(-15, 15, 240);
          const pHeff = ws.map((w) => [w, Math.abs(w) <= wNyq && Math.abs(w) <= wcEff ? 1.0 : 0.0]);

          return {
            scene: {
              axes: {
                x: { min: -3, max: 3, label: '时间 t / nT (s)' },
                y: { min: -1.8, max: 1.8, label: '连续输入 → 数字处理 → 连续输出', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? '①x_c(t)' : v < -0.6 ? '③y_c(t)' : '②y_d[n]') },
                z: { min: -1.5, max: 1.5, label: '信号幅值' }
              },
              ribbons: [{ points: ts.map((t, i) => [t, -1.3, ycArr[i]]), baseZ: 0, color: 'rgba(52,211,153,0.22)' }],
              curves: [
                { points: ts.map((t, i) => [t, 1.3, xcArr[i]]), color: '#38bdf8', width: 2.2, label: '连续双音输入 x_c(t)' },
                { points: ts.map((t, i) => [t, -1.3, ycArr[i]]), color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: 'D/C 重建输出 y_c(t)' }
              ],
              stems: [{ points: ydStems, baseZ: 0, color: '#fbbf24', width: 2.0, radius: 3.4, label: '数字滤波序列 y_d[n]' }],
              legend: [
                { color: '#38bdf8', label: '① 模拟输入 (1.8 + 4.2 rad/s)' },
                { color: '#fbbf24', label: `② 数字滤波 y_d[n] (Ωc=${M.fmt(p.OcPi, 2)}π)` },
                { color: '#34d399', label: `③ 模拟输出 (等效ωc=${M.fmt(wcEff, 1)})` }
              ]
            },
            plots2d: [
              {
                title: '时域全链路对比：模拟输入 x_c(t) [蓝虚] vs 混合系统输出 y_c(t) [绿]',
                xMin: -3, xMax: 3, yMin: -1.5, yMax: 1.5, xLabel: 't(s)',
                series: [
                  { points: ts.map((t, i) => [t, xcArr[i]]), color: '#38bdf8', dashed: true, width: 1.6 },
                  { points: ts.map((t, i) => [t, ycArr[i]]), color: '#34d399', width: 2.3 }
                ]
              },
              {
                title: `等效模拟传输特性 |H_eff(jω)| (等效截止 ±${M.fmt(wcEff, 1)} rad/s，红线为两输入频率)`,
                xMin: -15, xMax: 15, yMin: 0, yMax: 1.3, xLabel: 'ω(rad/s)',
                series: [{ points: pHeff, color: '#fbbf24', fill: 'rgba(251,191,36,0.22)', width: 2.2 }],
                vLines: [{ x: w1, color: '#38bdf8' }, { x: w2, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '数字截止频率 Ω_c', value: `${M.fmt(p.OcPi, 2)}π rad (固定)`, status: 'ok' },
              { label: '等效模拟截止 ω_c=Ω_c/T', value: `${M.fmt(wcEff, 2)} rad/s (随T动态缩放!)` },
              { label: '奈奎斯特上限 π/T', value: `${M.fmt(wNyq, 2)} rad/s`, status: wNyq > w2 ? 'ok' : 'err' },
              { label: '4.2 rad/s 分量状态', value: wNyq <= w2 ? '采样混叠警告!' : wcEff >= w2 ? '处于通带放行' : '已被数字低通滤除 ✓', status: wNyq <= w2 ? 'err' : 'ok' }
            ]
          };
        }
      },

      /* ==================== 7.5 ==================== */
      {
        id: '7.5',
        code: 'Ch7-(6)',
        level: '掌握',
        title: '7.5 离散时间信号采样：抽取 (Decimation) 与内插 (Interpolation)',
        summary: '多速率数字信号处理核心：M 倍下采样抽取 x[Mn] 导致频谱展宽 M 倍，L 倍上采样补零内插导致频谱压缩 L 倍并消除镜像！',
        presets: [
          { label: 'M=2 抽取下采样 (原带宽 0.4π < π/2，频谱展宽2倍无混叠!)', values: { op: 'decim', factor: 2, bwPi: 0.4 } },
          { label: 'M=3 抽取过猛产生离散混叠! (3×0.45π > π)', values: { op: 'decim', factor: 3, bwPi: 0.45 } },
          { label: 'L=3 上采样补零 + 低通镜像滤除 = 3倍平滑内插!', values: { op: 'interp', factor: 3, bwPi: 0.45 } }
        ],
        controls: [
          {
            key: 'op', label: '离散多速率运算', type: 'select', default: 'decim',
            options: [
              { value: 'decim', label: '抽取（减抽样 Downsampling）：x_d[n] = x[Mn] → 频谱展宽 M 倍' },
              { value: 'interp', label: '内插（升抽样 Upsampling + LPF）：补 L-1 个零 → 频谱压缩 L 倍 + 滤镜像' }
            ]
          },
          { key: 'factor', label: '抽取因子 M / 内插因子 L', type: 'range', min: 2, max: 4, step: 1, default: 2 },
          { key: 'bwPi', label: '原序列数字带宽 ω_M (×π rad)', type: 'range', min: 0.2, max: 0.75, step: 0.05, default: 0.4 }
        ],
        theory: {
          formula: '抽取：X_d(e^{jω}) = (1/M) ∑_{k=0}^{M-1} X(e^{j(ω-2πk)/M})；  补零扩展：X_e(e^{jω}) = X(e^{jLω})',
          objectives: [
            '【掌握】离散时间信号采样、M 倍抽取 x[Mn] 的频域展宽规律及无混叠条件 ω_M < π/M；',
            '【了解】L 倍补零扩展产生频谱压缩镜像 X(e^{jLω})，经截止频率 π/L、增益 L 的数字低通滤波器完成时域平滑内插。'
          ],
          guide3d: '三维视图同时陈列时域序列针状图与 [-π, π] 频域变化：在抽取模式下看到时域每隔 M 点取一点，频域三角谱横向撑宽 M 倍；在内插模式下看到补零后出现镜像伪峰，再经 π/L 低通恢复平滑密序列！'
        },
        matlab(p) {
          return `% Ch7.5 离散时间信号的 M 倍抽取 (Decimation) 与 L 倍内插 (Interpolation)
n = -24:24; bw = ${M.fmt(p.bwPi, 2)}; M_fac = ${Math.round(p.factor)};
x = bw * sinc(bw * n);                     % 带宽为 bw*pi 的离散序列
${p.op === 'decim' ? `xd = x(1:M_fac:end); nd = n(1:M_fac:end)/M_fac;
stem(nd, xd, 'g', 'filled'); title(sprintf('M=%d 倍抽取序列 x[Mn]', M_fac));` :
`xe = zeros(1, length(x)*M_fac); xe(1:M_fac:end) = x; % 补 M-1 个零
h_lp = M_fac * (1/M_fac) * sinc((-24:24)/M_fac);
xi = conv(xe, h_lp, 'same');
stem(xi(40:90), 'g', 'filled'); title(sprintf('L=%d 倍内插平滑序列', M_fac));`} grid on;`;
        },
        quiz: {
          question: '某离散序列 x[n] 的 DTFT 频谱最高截止频率为 ω_M = 0.3π。若直接对其做 M 倍抽取 y[n] = x[Mn] 而不加前置抗混叠滤波器，不发生频谱混叠的最大整数抽取因子 M 为：',
          options: ['M = 3（要求 M · ω_M ≤ π，3 × 0.3π = 0.9π ≤ π；若 M=4 则 1.2π > π 混叠！）', 'M = 2', 'M = 4', 'M = 5'],
          answer: 0,
          explanation: 'M 倍抽取使频谱展宽 M 倍至 M·ω_M，为避免主值区间 [-π, π] 内相邻 2π 周期延拓副本侵入，需满足 M·ω_M ≤ π，即 M ≤ π/(0.3π) = 3.33，故最大整数 M = 3！'
        },
        compute(p) {
          const K = Math.round(p.factor);
          const wM = p.bwPi * Math.PI;
          const nOrig = [], xOrig = [];
          for (let n = -16; n <= 16; n++) {
            nOrig.push(n);
            const s = M.sinc(p.bwPi * n * 0.5);
            xOrig.push(s * s);
          }

          const ws = M.linspace(-Math.PI, Math.PI, 260);
          const origSpec = ws.map((w) => M.tri(w, wM));

          let sOutTime = [], cNewSpec = [], pOutTime = [], pNewSpec = [];
          let statusOk = true;

          if (p.op === 'decim') {
            statusOk = K * wM <= Math.PI + 0.01;
            for (let m = -8; m <= 8; m++) {
              const idx = m * K;
              const s = M.sinc(p.bwPi * idx * 0.5);
              const val = s * s;
              sOutTime.push([(m / 8) * 4.2, -1.2, val]);
              pOutTime.push([m, val]);
            }
            for (let i = 0; i < ws.length; i++) {
              const w = ws[i];
              let sum = 0;
              for (let r = -1; r <= 1; r++) {
                sum += M.tri((w - r * M.TWO_PI) / K, wM); // stretched by K!
              }
              // Wait: X_d(e^{jw}) = (1/K) sum_{k=0}^{K-1} X(e^{j(w-2*pi*k)/K}) -> each replica has width K*wM!
              let repSum = 0;
              for (let k = -K; k <= K; k++) {
                repSum += (1 / K) * M.tri((w - k * M.TWO_PI) / 1, K * wM);
              }
              cNewSpec.push([(w / Math.PI) * 4.2, -0.1, repSum * K]);
              pNewSpec.push([w / Math.PI, repSum]);
            }
          } else {
            // Upsampling by K: zero-inserted spectrum compressed by K, then LPF
            for (let m = -16; m <= 16; m++) {
              const s = M.sinc((p.bwPi * (m / K)) * 0.5);
              const val = s * s;
              sOutTime.push([(m / 16) * 4.2, -1.2, val]);
              pOutTime.push([m, val]);
            }
            for (let i = 0; i < ws.length; i++) {
              const w = ws[i];
              // Compressed spectrum with images before LPF: X(e^{jKw})
              let img = 0;
              for (let r = -K; r <= K; r++) {
                img += M.tri(K * w - r * M.TWO_PI, wM);
              }
              cNewSpec.push([(w / Math.PI) * 4.2, -0.1, img]);
              pNewSpec.push([w / Math.PI, img]);
            }
          }

          const cOrigSpec = ws.map((w, i) => [(w / Math.PI) * 4.2, 1.2, origSpec[i]]);

          return {
            scene: {
              axes: {
                x: { min: -4.2, max: 4.2, label: '离散序号 n  /  数字角频率 ω (-π ~ +π)' },
                y: { min: -1.7, max: 1.7, label: '原频谱 → 抽取/扩展频谱 → 输出序列', ticks: [-1.2, -0.1, 1.2], format: (v) => (v > 0.6 ? '原谱X' : v < -0.6 ? '输出序列' : '变换谱') },
                z: { min: 0, max: 1.6, label: '归一化幅值' }
              },
              ribbons: [
                { points: cOrigSpec, baseZ: 0, color: 'rgba(56,189,248,0.18)' },
                { points: cNewSpec, baseZ: 0, color: statusOk ? 'rgba(251,191,36,0.24)' : 'rgba(244,63,94,0.26)' }
              ],
              curves: [
                { points: cOrigSpec, color: '#38bdf8', width: 2.3, label: '原序列频谱 |X(e^{jω})|' },
                { points: cNewSpec, color: statusOk ? '#fbbf24' : '#f43f5e', width: 3.0, glow: true, label: p.op === 'decim' ? '抽取展宽频谱' : '补零压缩含镜像谱' }
              ],
              stems: [{ points: sOutTime, baseZ: 0, color: '#34d399', width: 2.0, radius: 3.3, label: '处理后离散序列' }],
              legend: [
                { color: '#38bdf8', label: `原频谱 (带宽 ${M.fmt(p.bwPi, 2)}π)` },
                { color: statusOk ? '#fbbf24' : '#f43f5e', label: p.op === 'decim' ? `M=${K} 展宽谱` : `L=${K} 补零镜像谱` },
                { color: '#34d399', label: p.op === 'decim' ? '抽取序列 x[Mn]' : '内插平滑序列 x_i[n]' }
              ]
            },
            plots2d: [
              { title: p.op === 'decim' ? `M=${K} 倍抽取序列 x_d[n] = x[${K}n]` : `L=${K} 倍内插平滑序列 x_i[n]`, xMin: p.op === 'decim' ? -8 : -16, xMax: p.op === 'decim' ? 8 : 16, yMin: 0, yMax: 1.2, xLabel: 'n', series: [{ points: pOutTime, type: 'stems', color: '#34d399' }] },
              {
                title: p.op === 'decim' ? `抽取后频谱 X_d(e^{jω}) (宽度变为 M·ω_M = ${M.fmt(K * p.bwPi, 2)}π)` : `补零扩展频谱 X_e(e^{jω})=X(e^{j${K}ω}) (绿框 ±π/${K} 为去镜像低通窗)`,
                xMin: -1, xMax: 1, yMin: 0, yMax: 1.2, xLabel: '×π',
                vBands: p.op === 'interp' ? [{ from: -1 / K, to: 1 / K, color: 'rgba(52,211,153,0.18)' }] : [],
                series: [{ points: pNewSpec, color: statusOk ? '#fbbf24' : '#f43f5e', fill: 'rgba(251,191,36,0.16)', width: 2.2 }]
              }
            ],
            metrics: [
              { label: '运算模式', value: p.op === 'decim' ? `${K} 倍下采样抽取` : `${K} 倍上采样内插`, status: 'ok' },
              { label: '变换后主瓣半宽', value: p.op === 'decim' ? `${M.fmt(K * p.bwPi, 2)}π rad` : `${M.fmt(p.bwPi / K, 2)}π rad` },
              { label: '混叠/镜像判据', value: p.op === 'decim' ? (statusOk ? 'M·ω_M ≤ π 无混叠 ✓' : 'M·ω_M > π 发生抽取混叠!') : `需截止 π/${K} 低通滤除 ${K - 1} 个镜像`, status: statusOk ? 'ok' : 'err' },
              { label: '采样数据率变化', value: p.op === 'decim' ? `降低为 1/${K}` : `提升为 ${K} 倍` }
            ]
          };
        }
      }
    ]
  });
})();
