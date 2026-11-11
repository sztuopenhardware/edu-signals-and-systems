/**
 * 第 3 章：周期信号的傅里叶级数表示 (Chapter 3) — 6 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 3 章全部 11 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  function ctfsHarmonics(waveType, kMax, duty = 0.5) {
    // Returns array for k = 1..kMax of { k, amp, phase } in real cosine/sine form: c0 + sum amp_k * cos(k*w0*t + phase_k)
    const list = [];
    let c0 = 0;
    if (waveType === 'square') {
      c0 = 0;
      for (let k = 1; k <= kMax; k++) {
        if (k % 2 === 1) list.push({ k, amp: 4 / (Math.PI * k), phase: -Math.PI / 2 }); // (4/pi*k) sin(k*w0*t)
        else list.push({ k, amp: 0, phase: 0 });
      }
    } else if (waveType === 'sawtooth') {
      c0 = 0;
      for (let k = 1; k <= kMax; k++) {
        const sign = k % 2 === 1 ? 1 : -1;
        list.push({ k, amp: 2 / (Math.PI * k), phase: sign > 0 ? -Math.PI / 2 : Math.PI / 2 });
      }
    } else if (waveType === 'triangle') {
      c0 = 0;
      for (let k = 1; k <= kMax; k++) {
        if (k % 2 === 1) {
          const sign = ((k - 1) / 2) % 2 === 0 ? 1 : -1;
          list.push({ k, amp: 8 / (Math.PI * Math.PI * k * k), phase: sign > 0 ? 0 : Math.PI });
        } else list.push({ k, amp: 0, phase: 0 });
      }
    } else {
      // Rectangular pulse train with duty cycle D in (0.1, 0.9)
      c0 = duty;
      for (let k = 1; k <= kMax; k++) {
        const ck = 2 * duty * M.sinc(k * duty);
        list.push({ k, amp: Math.abs(ck), phase: ck >= 0 ? 0 : Math.PI });
      }
    }
    return { c0, list };
  }

  window.SigSys.registerChapter({
    id: 'ch3',
    number: '第 3 章',
    title: '第 3 章：周期信号的傅里叶级数表示',
    shortTitle: 'Ch3 傅里叶级数表示',
    weeks: '第 5–6 周 · 4 学时',
    syllabusItems: '历史回顾、复指数特征函数响应、CTFS表示与收敛、CTFS性质、DTFS表示与性质、LTI滤波与微/差分滤波器',
    cases: [
      /* ==================== 3.1 ==================== */
      {
        id: '3.1',
        code: 'Ch3-(1)(3)',
        level: '掌握',
        title: '3.1 连续时间周期信号傅里叶级数 (CTFS) 3D 时频谐波合成',
        summary: '经典三维时频视角：各次谐波正弦分量沿频率轴排列，正视叠加为周期方波/三角波，侧视投影即为离散幅度谱！',
        camera: { azimuth: -0.82, elevation: 0.44, zoom: 1.0 },
        presets: [
          { label: '对称奇谐方波 (N=9 阶合成)', values: { wave: 'square', N: 9, w0: 1.6, duty: 0.5 } },
          { label: '三角波 (1/k² 快速收敛 N=7)', values: { wave: 'triangle', N: 7, w0: 1.6, duty: 0.5 } },
          { label: '锯齿波 (含奇偶次谐波 1/k)', values: { wave: 'sawtooth', N: 10, w0: 1.6, duty: 0.5 } },
          { label: '周期矩形脉冲串 (占空比 D=0.25 → Sa包络)', values: { wave: 'pulse', N: 12, w0: 1.5, duty: 0.25 } }
        ],
        controls: [
          {
            key: 'wave', label: '典型周期信号', type: 'select', default: 'square',
            options: [
              { value: 'square', label: '对称周期方波 (仅含奇次谐波, 1/k 衰减)' },
              { value: 'triangle', label: '对称周期三角波 (仅含奇次谐波, 1/k² 快速衰减)' },
              { value: 'sawtooth', label: '周期锯齿波 (含全部整数次谐波, 1/k 衰减)' },
              { value: 'pulse', label: '周期矩形脉冲串 (可调占空比 D)' }
            ]
          },
          { key: 'N', label: '合成最高谐波阶数 N', type: 'range', min: 1, max: 21, step: 1, default: 9 },
          { key: 'w0', label: '基波角频率 ω₀', type: 'range', min: 1.0, max: 2.6, step: 0.1, default: 1.6, unit: 'rad/s' },
          { key: 'duty', label: '矩形脉冲占空比 D (脉冲串模式)', type: 'range', min: 0.1, max: 0.8, step: 0.05, default: 0.25 }
        ],
        theory: {
          formula: 'x(t) = ∑_{k=-∞}^{+∞} a_k e^{jkω₀t} = a₀ + ∑_{k=1}^{∞} 2|a_k| cos(kω₀t + ∠a_k),   a_k = (1/T) ∫_T x(t)e^{-jkω₀t} dt',
          objectives: [
            '【掌握】典型连续时间周期信号（方波、三角波、锯齿波、周期矩形脉冲）的傅里叶级数系数求解与频谱图；',
            '【理解】成谐波关系的复指数信号线性组合与光滑度对谱线衰减速度（跳变点 1/k、折角连续 1/k²）的影响；',
            '【课程思政】1807 年傅里叶在研究热传导方程时提出任意周期函数可展开为三角级数，突破当时数学界质疑，奠定了现代通信、声学、医学 CT 成像与数字经济的理论基石。'
          ],
          guide3d: '三维教学精髓：点击顶部【时域正视】观察前平面合成波形 x_N(t)；点击【频域侧视】瞬间切换为离散谐波幅度谱 2|a_k|；回到【3D 立体】同时看清每一阶谐波正弦波如何叠加成宏观周期波形！'
        },
        matlab(p) {
          return `% Ch3.1 连续时间周期信号傅里叶级数 3D 时频谐波合成
t = -4:0.01:4; w0 = ${M.fmt(p.w0, 2)}; N = ${Math.round(p.N)};
figure; hold on; x_sum = zeros(size(t));
for k = 1:N
  ${p.wave === 'square' ? 'ck = mod(k,2)*4/(pi*k); xk = ck * sin(k*w0*t);' :
    p.wave === 'triangle' ? 'ck = mod(k,2)*8/(pi^2*k^2)*((-1)^((k-1)/2)); xk = ck * cos(k*w0*t);' :
    p.wave === 'sawtooth' ? 'ck = 2/(pi*k)*((-1)^(k+1)); xk = ck * sin(k*w0*t);' :
    `D = ${M.fmt(p.duty, 2)}; ck = 2*D*sinc(k*D); xk = ck * cos(k*w0*t);`}
  x_sum = x_sum + xk;
  plot3(t, k*ones(size(t)), xk, 'LineWidth', 1.2);
end
plot3(t, zeros(size(t)), x_sum, 'g', 'LineWidth', 2.5);
view(-38, 28); grid on; xlabel('t'); ylabel('谐波阶数 k'); zlabel('幅值');`;
        },
        quiz: {
          question: '对比对称周期方波与对称周期三角波的傅里叶级数系数 |a_k| 随谐波次数 k 的衰减速度，下列正确的是：',
          options: [
            '方波有跳变间断点，按 1/k 慢速衰减；三角波连续（导数跳变），按 1/k² 快速衰减',
            '两者均按 1/k 衰减',
            '方波按 1/k² 衰减，三角波按 1/k 衰减',
            '两者都包含偶次谐波分量'
          ],
          answer: 0,
          explanation: '信号越光滑，高频分量越少！方波本身有第一类间断点，|a_k| ∝ 1/k；三角波本身连续、一阶导数为方波，由微分性质 jkω₀a_k 知三角波谱系数按 1/k² 快速衰减，仅取前 5 阶即几乎与理想三角波重合！'
        },
        compute(p) {
          const N = Math.round(p.N);
          const { c0, list } = ctfsHarmonics(p.wave, N, p.duty);
          const ts = M.linspace(-4, 4, 300);
          const sumArr = new Float64Array(ts.length).fill(c0);

          const curves = [];
          const ribbons = [];
          const specStems = [];
          const p2dSpec = [[0, Math.abs(c0)]];

          // Show up to 10 visible harmonic slices in 3D to keep clean clarity while summing all N
          const maxSliceShow = Math.min(N, 12);
          for (let idx = 0; idx < list.length; idx++) {
            const { k, amp, phase } = list[idx];
            const slicePts = [];
            for (let i = 0; i < ts.length; i++) {
              const v = amp * Math.cos(k * p.w0 * ts[i] + phase);
              sumArr[i] += v;
              if (k <= maxSliceShow && amp > 1e-4) {
                slicePts.push([ts[i], k, v]);
              }
            }
            if (slicePts.length) {
              const col = M.colormap(1 - (k - 1) / Math.max(1, maxSliceShow), 0.9);
              curves.push({ points: slicePts, color: col, width: 1.7, label: `${k}次谐波` });
              ribbons.push({ points: slicePts, baseZ: 0, color: M.colormap(1 - (k - 1) / Math.max(1, maxSliceShow), 0.1) });
            }
            if (k <= maxSliceShow) {
              specStems.push([4.0, k, amp]);
            }
            p2dSpec.push([k, amp * 0.5]); // |a_k| = amp/2 for k>=1
          }

          const sumCurve = ts.map((t, i) => [t, 0, sumArr[i]]);
          curves.push({ points: sumCurve, color: '#34d399', width: 3.2, glow: true, label: `N=${N} 阶合成波 x_N(t)`, pickable: true });
          ribbons.push({ points: sumCurve, baseZ: 0, color: 'rgba(52,211,153,0.20)' });

          if (Math.abs(c0) > 1e-4) specStems.push([4.0, 0, c0]);

          const powerSum = c0 * c0 + list.reduce((acc, h) => acc + 0.5 * h.amp * h.amp, 0);

          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '时间 t (s)' },
                y: { min: 0, max: Math.max(6, maxSliceShow + 0.5), label: '谐波阶次 k (频率 kω₀)' },
                z: { min: -1.5, max: 1.6, label: '谐波与合成幅值' }
              },
              ribbons,
              curves,
              stems: [
                { points: specStems, baseZ: 0, color: '#fbbf24', width: 2.6, radius: 4.5, label: '单边谐波幅度 2|a_k|' }
              ],
              legend: [
                { color: '#34d399', label: `前平面 k=0：合成波形 x_${N}(t)` },
                { color: '#38bdf8', label: '各阶谐波分量 c_k·cos(kω₀t+φ_k)' },
                { color: '#fbbf24', label: '侧壁离散幅度谱 2|a_k|' }
              ]
            },
            plots2d: [
              { title: `时域前 ${N} 阶傅里叶级数部分和 x_N(t)`, xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.6, xLabel: 't', series: [{ points: ts.map((t, i) => [t, sumArr[i]]), color: '#34d399', width: 2.2 }] },
              { title: '双边复指数谱模值 |a_k| (k ≥ 0)', xMin: 0, xMax: N + 1, yMin: 0, yMax: 0.85, xLabel: 'k', series: [{ points: p2dSpec, type: 'stems', color: '#fbbf24' }] }
            ],
            metrics: [
              { label: '基波周期 T₀ = 2π/ω₀', value: `${M.fmt(M.TWO_PI / p.w0, 2)} s`, status: 'ok' },
              { label: '直流分量 a₀', value: M.fmt(c0, 3) },
              { label: '基波幅值 2|a₁|', value: M.fmt(list[0]?.amp || 0, 3) },
              { label: `前 ${N} 阶帕塞瓦尔功率`, value: `${M.fmt(powerSum, 3)} W` }
            ]
          };
        }
      },

      /* ==================== 3.2 ==================== */
      {
        id: '3.2',
        code: 'Ch3-(2)',
        level: '理解',
        title: '3.2 线性时不变系统对复指数信号的响应：特征函数性质',
        summary: '三维验证 e^{st} 是 LTI 系统的特征函数：通过系统后保持完全相同的三维螺旋频率，仅幅度乘 |H(jω₀)|、相位转 ∠H(jω₀)！',
        presets: [
          { label: '低频通过 (ω₀=1.2 < ωc=2.5，几乎无衰减)', values: { w0: 1.2, wc: 2.5 } },
          { label: '截止频率 -3dB 点 (ω₀ = ωc = 2.5，滞后45°)', values: { w0: 2.5, wc: 2.5 } },
          { label: '高频大幅衰减与相移 (ω₀=5.0 > ωc=1.8)', values: { w0: 5.0, wc: 1.8 } }
        ],
        controls: [
          { key: 'w0', label: '输入复指数角频率 ω₀', type: 'range', min: 0.5, max: 6.0, step: 0.1, default: 2.0, unit: 'rad/s' },
          { key: 'wc', label: '一阶 LTI 系统截止频率 ω_c', type: 'range', min: 0.8, max: 5.0, step: 0.1, default: 2.5, unit: 'rad/s' }
        ],
        theory: {
          formula: 'x(t) = e^{jω₀t}  ──[ LTI: h(t) ]──►  y(t) = H(jω₀) · e^{jω₀t} = |H(jω₀)| e^{j(ω₀t + ∠H(jω₀))}',
          objectives: [
            '【理解】复指数信号 e^{st} 作为 LTI 系统特征函数（Eigenfunction）与系统函数 H(s) 作为特征值（Eigenvalue）的核心地位；',
            '【理解】这正是傅里叶分析之所以成为 LTI 系统天然语言的原因——将复杂信号拆成特征函数之和，逐项乘特征值即可！'
          ],
          guide3d: '三维螺旋对比：蓝色外螺旋为输入 e^{jω₀t}（半径=1），绿色内螺旋为系统输出 H(jω₀)e^{jω₀t}（半径缩放为 |H(jω₀)|，相量夹角固定滞后 ∠H(jω₀)）。点击【频域侧视】可直接看清输入与输出复相量的幅角差！'
        },
        matlab(p) {
          return `% Ch3.2 LTI 系统对复指数信号的特征函数响应验证
w0 = ${M.fmt(p.w0, 2)}; wc = ${M.fmt(p.wc, 2)};
H_jw0 = wc / (wc + 1j * w0); % 一阶 RC 低通特征值
t = -3:0.02:3;
x = exp(1j * w0 * t);
y = H_jw0 * x;
plot3(t, real(x), imag(x), '--b', t, real(y), imag(y), 'g', 'LineWidth', 2); grid on;
title(sprintf('|H(j\\omega_0)| = %.3f, 相位 \\angle H = %.1f^\\circ', abs(H_jw0), angle(H_jw0)*180/pi));`;
        },
        quiz: {
          question: '若某 LTI 系统对输入 e^{j2t} 的响应为 3e^{-jπ/4}·e^{j2t}，且系统为实系数系统，则对实输入 cos(2t) 的稳态输出为：',
          options: ['3 cos(2t - π/4)', '3 cos(2t + π/4)', '1.5 cos(2t - π/4)', '3 e^{-2t} cos(2t)'],
          answer: 0,
          explanation: '实系统满足共轭对称性 H(-j2) = H*(j2) = 3e^{+jπ/4}，故 cos(2t) = (e^{j2t}+e^{-j2t})/2 通过系统后输出 Re{H(j2)e^{j2t}} = 3cos(2t - π/4)。'
        },
        compute(p, animTime) {
          const H = M.cDiv({ re: p.wc, im: 0 }, { re: p.wc, im: p.w0 });
          const mag = M.cAbs(H);
          const ph = M.cArg(H);

          const ts = M.linspace(-3.5, 3.5, 300);
          const inHelix = [], outHelix = [];
          const reIn = [], reOut = [];

          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const aIn = p.w0 * t;
            const aOut = p.w0 * t + ph;
            inHelix.push([t, Math.cos(aIn), Math.sin(aIn)]);
            outHelix.push([t, mag * Math.cos(aOut), mag * Math.sin(aOut)]);
            reIn.push([t, Math.cos(aIn)]);
            reOut.push([t, mag * Math.cos(aOut)]);
          }

          const tNow = -3.5 + ((animTime * 1.3) % 7.0);
          const inNow = [tNow, Math.cos(p.w0 * tNow), Math.sin(p.w0 * tNow)];
          const outNow = [tNow, mag * Math.cos(p.w0 * tNow + ph), mag * Math.sin(p.w0 * tNow + ph)];

          // Frequency curve |H(jw)|
          const ws = M.linspace(0, 7, 120);
          const hMagPts = ws.map((w) => [w, p.wc / Math.hypot(p.wc, w)]);

          return {
            scene: {
              axes: {
                x: { min: -3.5, max: 3.5, label: '时间 t (s)' },
                y: { min: -1.3, max: 1.3, label: '实部 Re (余弦分量)' },
                z: { min: -1.3, max: 1.3, label: '虚部 Im (正弦分量)' }
              },
              curves: [
                { points: inHelix, color: 'rgba(56,189,248,0.65)', width: 2.0, dashed: true, label: '输入特征函数 e^{jω₀t}' },
                { points: outHelix, color: '#34d399', width: 3.2, glow: true, shadowXZ: true, shadowYZ: true, label: '输出 H(jω₀)e^{jω₀t}' }
              ],
              vectors: [
                { from: [tNow, 0, 0], to: inNow, color: '#38bdf8', width: 2.3, label: '输入相量' },
                { from: [tNow, 0, 0], to: outNow, color: '#f43f5e', width: 2.8, label: '输出相量' }
              ],
              legend: [
                { color: '#38bdf8', label: '输入 e^{jω₀t} (模=1)' },
                { color: '#34d399', label: `输出 |H|=${M.fmt(mag, 2)}, ∠H=${M.fmt((ph * 180) / Math.PI, 1)}°` },
                { color: '#f43f5e', label: '同步旋转复相量对比' }
              ]
            },
            plots2d: [
              {
                title: '实部时域对照：cos(ω₀t) [蓝] → |H(jω₀)|cos(ω₀t+∠H) [绿]',
                xMin: -3.5, xMax: 3.5, yMin: -1.2, yMax: 1.2, xLabel: 't',
                series: [
                  { points: reIn, color: '#38bdf8', dashed: true, width: 1.8 },
                  { points: reOut, color: '#34d399', width: 2.3 }
                ]
              },
              {
                title: '特征值模曲线 |H(jω)| 与当前工作频率 ω₀',
                xMin: 0, xMax: 7, yMin: 0, yMax: 1.15, xLabel: 'ω',
                series: [{ points: hMagPts, color: '#fbbf24', fill: 'rgba(251,191,36,0.16)', width: 2.1 }],
                vLines: [{ x: p.w0, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '特征值模 |H(jω₀)|', value: `${M.fmt(mag, 3)} (${M.fmt(20 * Math.log10(mag), 1)} dB)`, status: 'ok' },
              { label: '特征值相移 ∠H(jω₀)', value: `${M.fmt((ph * 180) / Math.PI, 1)}° (${M.fmt(ph, 2)} rad)` },
              { label: '等效群延时 -∠H/ω₀', value: `${M.fmt(-ph / p.w0, 3)} s` },
              { label: '输出频率是否改变', value: '严格不变 (= ω₀) ✓', status: 'ok' }
            ]
          };
        }
      },

      /* ==================== 3.3 ==================== */
      {
        id: '3.3',
        code: 'Ch3-(4)',
        level: '理解',
        title: '3.3 傅里叶级数的收敛与吉布斯现象 (Gibbs Phenomenon)',
        summary: '三维截断阶数演化曲面 (t, N, x_N(t))：均方误差随 N→∞ 趋于 0，但跳变间断点处约 8.95% 的尖峰过冲永不消失！',
        camera: { azimuth: -0.92, elevation: 0.5, zoom: 1.0 },
        presets: [
          { label: '标准方波截断 N = 15 (清晰可见 ~9% 过冲耳!)', values: { N: 15, smooth: 0 } },
          { label: '高阶截断 N = 45 (尖峰变窄但高度仍约 1.18!)', values: { N: 45, smooth: 0 } },
          { label: '低阶截断 N = 3', values: { N: 3, smooth: 0 } },
          { label: 'Lanczos σ 窗平滑抑制吉布斯过冲对比', values: { N: 25, smooth: 1 } }
        ],
        controls: [
          { key: 'N', label: '傅里叶级数截断最高阶数 N', type: 'range', min: 1, max: 51, step: 2, default: 15 },
          {
            key: 'smooth', label: '截断窗方式对比', type: 'select', default: 0,
            options: [
              { value: 0, label: '直接矩形截断 (产生经典 ~8.95% 吉布斯过冲)' },
              { value: 1, label: 'Lanczos σ 因子平滑加窗 (消除过冲但展宽过渡带)' }
            ]
          }
        ],
        theory: {
          formula: 'lim_{N→∞} ∫_T |x(t) - x_N(t)|² dt = 0 (均方收敛)，但间断点峰值过冲恒趋于 (Si(π)/π - 0.5) × 跳变高度 ≈ 8.95%！',
          objectives: [
            '【理解】Dirichlet 收敛条件、均方误差收敛准则与一致收敛的区别；',
            '【理解】吉布斯现象（Gibbs Phenomenon）的成因：理想频域矩形截断等价于时域卷积 Dirichlet 核，其第一旁瓣积分面积恒定，故随 N 增大过冲峰仅向间断点挤压变窄而高度不减！'
          ],
          guide3d: '三维深度轴 Y 依次铺开 N = 1, 5, 9, 15, 25, 45 阶方波逼近曲线：可清晰看到跳变沿两侧的“兔耳”随 N 增大越来越贴近跳变边沿，但其最高点始终齐平在约 ±1.18（跳变量 2 的 8.95% 过冲）！'
        },
        matlab(p) {
          return `% Ch3.3 傅里叶级数收敛与吉布斯现象 (Gibbs Phenomenon) 实验
t = -pi:0.002:pi; N = ${Math.round(p.N)};
x_ideal = sign(sin(t));
x_N = zeros(size(t));
for k = 1:2:N
  sigma_k = ${Number(p.smooth) === 1 ? 'sinc(k/(N+1))' : '1.0'};
  x_N = x_N + sigma_k * (4/(pi*k)) * sin(k*t);
end
overshoot_pct = (max(x_N) - 1) / 2 * 100; % 相对于总跳变量 2 的百分比
plot(t, x_ideal, '--k', t, x_N, 'r', 'LineWidth', 1.8); grid on;
title(sprintf('N = %d 阶截断合成，峰值 = %.4f (相对跳变量过冲 %.2f%%)', N, max(x_N), overshoot_pct));`;
        },
        quiz: {
          question: '用有限项傅里叶级数 x_N(t) 逼近幅值为 ±1（跳变量 Δ = 2）的理想周期方波，当阶数 N → ∞ 时：',
          options: [
            '一个周期内的误差能量趋于 0，但跳变点附近最大峰值始终约为 1 + 2×8.95% ≈ 1.179',
            '误差能量趋于 0，且跳变点处过冲峰值逐渐减小到 1.000',
            '跳变点处发散到无穷大',
            '在跳变点 t = 0 处收敛值为 1'
          ],
          answer: 0,
          explanation: '有限能量周期信号满足均方收敛（误差能量趋于 0），在间断点处收敛于左右极限均值 0，但在间断点邻域存在约跳变全高 8.95% 的吉布斯过冲峰值，N 趋于无穷时宽度趋于 0 而高度不变。'
        },
        compute(p) {
          const Ncur = Math.round(p.N);
          const useSmooth = Number(p.smooth) === 1;
          const ts = M.linspace(-Math.PI, Math.PI, 420);

          const evalPartial = (Nval, sm) => {
            const arr = new Float64Array(ts.length);
            for (let k = 1; k <= Nval; k += 2) {
              const factor = sm ? M.sinc(k / (Nval + 2)) : 1.0;
              const c = factor * (4 / (Math.PI * k));
              for (let i = 0; i < ts.length; i++) arr[i] += c * Math.sin(k * ts[i]);
            }
            return arr;
          };

          const orders = [1, 5, 11, 21, 35, Ncur];
          const curves = [];
          for (let idx = 0; idx < orders.length; idx++) {
            const ord = orders[idx];
            const isFront = idx === orders.length - 1;
            const yPos = isFront ? -1.5 : 1.5 - idx * 0.55;
            const arr = evalPartial(ord, isFront ? useSmooth : false);
            curves.push({
              points: ts.map((t, i) => [t, yPos, arr[i]]),
              color: isFront ? '#f43f5e' : M.colormap(idx / orders.length, 0.72),
              width: isFront ? 3.1 : 1.7,
              glow: isFront,
              shadowXZ: isFront,
              label: `N=${ord}`
            });
          }

          const curArr = evalPartial(Ncur, useSmooth);
          let maxPeak = 0;
          let errEnergy = 0;
          const dt = ts[1] - ts[0];
          const errPts = [];
          for (let i = 0; i < ts.length; i++) {
            const ideal = ts[i] >= 0 ? 1 : -1;
            const e = ideal - curArr[i];
            errEnergy += e * e * dt;
            if (curArr[i] > maxPeak) maxPeak = curArr[i];
            errPts.push([ts[i], e]);
          }
          const overshootPct = Math.max(0, ((maxPeak - 1.0) / 2.0) * 100);

          return {
            scene: {
              axes: {
                x: { min: -3.14, max: 3.14, label: '相位角 ω₀t (rad)' },
                y: { min: -1.8, max: 1.8, label: '截断阶数演化 N = 1 → 51' },
                z: { min: -1.4, max: 1.4, label: '部分和幅值 x_N(t)' }
              },
              ribbons: [{ points: curves[curves.length - 1].points, baseZ: 0, color: 'rgba(244,63,94,0.18)' }],
              curves,
              legend: [
                { color: '#38bdf8', label: '后排：N=1, 5, 11, 21, 35 阶演化簇' },
                { color: '#f43f5e', label: `前排当前：N=${Ncur} 阶部分和` }
              ]
            },
            plots2d: [
              {
                title: `当前 N=${Ncur} 阶合成波形 vs 理想方波 (±1)`,
                xMin: -3.14, xMax: 3.14, yMin: -1.35, yMax: 1.35, xLabel: 'ω₀t',
                series: [
                  { points: [[-3.14, -1], [0, -1], [0, 1], [3.14, 1]], color: '#94a3b8', dashed: true, width: 1.5 },
                  { points: ts.map((t, i) => [t, curArr[i]]), color: '#f43f5e', width: 2.1 }
                ]
              },
              {
                title: '截断逼近误差 e_N(t) = x(t) - x_N(t) (能量随 N→∞ 趋于 0)',
                xMin: -3.14, xMax: 3.14, yMin: -1.2, yMax: 1.2, xLabel: 'ω₀t',
                series: [{ points: errPts, color: '#fbbf24', fill: 'rgba(251,191,36,0.18)', width: 1.7 }]
              }
            ],
            metrics: [
              { label: '合成最大峰值 max(x_N)', value: M.fmt(maxPeak, 4), status: overshootPct > 5 ? 'warn' : 'ok' },
              { label: '相对跳变量(2)过冲率', value: `${M.fmt(overshootPct, 2)} % (理论极限 8.95%)` },
              { label: '周期误差能量 ∫|e_N|²dt', value: M.fmt(errEnergy, 4) },
              { label: '间断点 t=0 处收敛值', value: '0.000 = [x(0⁺)+x(0⁻)]/2' }
            ]
          };
        }
      },

      /* ==================== 3.4 ==================== */
      {
        id: '3.4',
        code: 'Ch3-(5)',
        level: '理解',
        title: '3.4 连续时间傅里叶级数性质：三维复频谱扭转与帕塞瓦尔定理',
        summary: '在三维 (kω₀, Re{a_k}, Im{a_k}) 空间直观观察：时移 t₀ 不改变谱线模长 |a_k|，但将复频谱扭转成线性相位螺旋！',
        presets: [
          { label: '零时移偶对称脉冲 (纯实频谱)', values: { prop: 'shift', t0: 0.0, duty: 0.3 } },
          { label: '时移 t₀ = 0.6s (模不变，三维复谱旋转!)', values: { prop: 'shift', t0: 0.6, duty: 0.3 } },
          { label: '时域微分 dx/dt ↔ jkω₀·a_k (高频放大)', values: { prop: 'diff', t0: 0.0, duty: 0.35 } }
        ],
        controls: [
          {
            key: 'prop', label: 'CTFS 性质观察项', type: 'select', default: 'shift',
            options: [
              { value: 'shift', label: '时移性质：x(t - t₀) ↔ e^{-jkω₀t₀} a_k  [模长不变·线性相移]' },
              { value: 'diff', label: '时域微分性质：dx(t)/dt ↔ (jkω₀) a_k  [高频加权增强]' }
            ]
          },
          { key: 't0', label: '时移量 t₀', type: 'range', min: -1.8, max: 1.8, step: 0.1, default: 0.5, unit: 's' },
          { key: 'duty', label: '周期脉冲占空比 D', type: 'range', min: 0.15, max: 0.65, step: 0.05, default: 0.3 }
        ],
        theory: {
          formula: '时移：x(t-t₀) ↔ a_k e^{-jkω₀t₀} (|b_k|=|a_k|, ∠b_k=∠a_k - kω₀t₀)；  帕塞瓦尔：(1/T)∫_T |x(t)|²dt = ∑_{k=-∞}^{∞} |a_k|²',
          objectives: [
            '【理解】连续时间傅里叶级数核心性质（线性、时移、时间反转、尺度变换、微分、共轭对称性）；',
            '【掌握】时移只引入与频率 kω₀ 成正比的线性相移而不改变幅度谱，以及帕塞瓦尔功率守恒关系。'
          ],
          guide3d: '三维坐标 (谐波次数 k, 实部 Re{a_k}, 虚部 Im{a_k})：当 t₀=0 时偶对称矩形波的谱线全部落在实平面内；拖动 t₀ 滑块，所有谱针像螺旋桨一样随 k 成比例旋转 e^{-jkω₀t₀}，而每根针到轴心的模长 |a_k| 毫厘不变！'
        },
        matlab(p) {
          return `% Ch3.4 CTFS 时移线性相位螺旋与 Parseval 定理验证
T = 4; w0 = 2*pi/T; D = ${M.fmt(p.duty, 2)}; t0 = ${M.fmt(p.t0, 2)};
k = -12:12;
ak = D * sinc(k * D);                  % 偶对称矩形脉冲串系数 (纯实数)
bk = ak .* exp(-1j * k * w0 * t0);     % 时移 t0 后的复频谱系数
stem3(k, real(bk), imag(bk), 'filled', 'LineWidth', 1.8); grid on;
xlabel('谐波次数 k'); ylabel('Re\{b_k\}'); zlabel('Im\{b_k\}');
fprintf('时域平均功率 P = %.4f, 频域前25项功率和 sum(|b_k|^2) = %.4f\\n', D, sum(abs(bk).^2));`;
        },
        quiz: {
          question: '将某周期信号 x(t) 延迟半个周期得到 y(t) = x(t - T/2)，则其傅里叶级数系数 b_k 与原系数 a_k 的关系为：',
          options: ['b_k = (-1)^k · a_k，且幅度谱 |b_k| = |a_k| 完全不变', 'b_k = a_k / 2', '偶次谐波全部变为 0', '幅度谱压缩一半'],
          answer: 0,
          explanation: '由时移性质 b_k = e^{-jk(2π/T)(T/2)} a_k = e^{-jkπ} a_k = (-1)^k a_k，奇次谐波反号、偶次谐波不变，模值 |b_k| = |a_k| 保持不变。'
        },
        compute(p) {
          const T = 4.0;
          const w0 = M.TWO_PI / T;
          const stems3 = [];
          const envHelix = [];
          const mag2d = [], ph2d = [];
          let parsevalSum = 0;

          for (let k = -10; k <= 10; k++) {
            const ak = p.duty * M.sinc(k * p.duty);
            let bk;
            if (p.prop === 'shift') {
              const ang = -k * w0 * p.t0;
              bk = { re: ak * Math.cos(ang), im: ak * Math.sin(ang) };
            } else {
              // Differentiation: jk*w0*ak * 0.25 (scaled for display)
              bk = { re: 0, im: k * w0 * ak * 0.22 };
            }
            const mag = M.cAbs(bk);
            const ph = mag > 1e-4 ? M.cArg(bk) : 0;
            if (p.prop === 'shift') parsevalSum += ak * ak;
            stems3.push([k, bk.re, bk.im]);
            mag2d.push([k, mag]);
            ph2d.push([k, ph]);
          }

          if (p.prop === 'shift') {
            const ks = M.linspace(-10, 10, 260);
            for (let i = 0; i < ks.length; i++) {
              const kv = ks[i];
              const env = p.duty * M.sinc(kv * p.duty);
              const ang = -kv * w0 * p.t0;
              envHelix.push([kv, env * Math.cos(ang), env * Math.sin(ang)]);
            }
          }

          return {
            scene: {
              axes: {
                x: { min: -10, max: 10, label: '谐波次数 k' },
                y: { min: -0.75, max: 0.75, label: '实部 Re{b_k}' },
                z: { min: -0.75, max: 0.75, label: '虚部 Im{b_k}' }
              },
              curves: envHelix.length
                ? [{ points: envHelix, color: 'rgba(56,189,248,0.55)', width: 1.8, dashed: true, label: '复包络螺旋线' }]
                : [],
              stems: [
                {
                  points: stems3,
                  baseZ: 0,
                  width: 2.4,
                  radius: 4.3,
                  label: '复系数 b_k',
                  pointColor: (_, pt) => M.phaseColor(Math.atan2(pt[2], pt[1]), 0.95)
                }
              ],
              legend: [
                { color: '#38bdf8', label: '复频谱三维包络轨迹' },
                { color: '#34d399', label: '复谐波谱线 b_k (颜色代表相位)' }
              ]
            },
            plots2d: [
              { title: '幅度谱 |b_k| (时移下严格不变!)', xMin: -10, xMax: 10, yMin: 0, yMax: 0.75, xLabel: 'k', series: [{ points: mag2d, type: 'stems', color: '#38bdf8' }] },
              { title: '相位谱 ∠b_k (rad)', xMin: -10, xMax: 10, yMin: -3.3, yMax: 3.3, xLabel: 'k', series: [{ points: ph2d, type: 'stems', color: '#fbbf24' }] }
            ],
            metrics: [
              { label: '时域理论平均功率 P', value: `${M.fmt(p.duty, 4)} W`, status: 'ok' },
              { label: '频域 ∑|a_k|² (|k|≤10)', value: `${M.fmt(parsevalSum, 4)} W` },
              { label: '功率捕获占比', value: `${M.fmt((parsevalSum / p.duty) * 100, 1)} %` },
              { label: '相位斜率 d∠/dk', value: p.prop === 'shift' ? `${M.fmt(-w0 * p.t0, 2)} rad/阶` : '±π/2 正交跳变' }
            ]
          };
        }
      },

      /* ==================== 3.5 ==================== */
      {
        id: '3.5',
        code: 'Ch3-(6)(7)',
        level: '掌握',
        title: '3.5 离散时间傅里叶级数 (DTFS) 及其性质：有限 N 项精确重构',
        summary: '对比连续 CTFS 的核心差异：周期为 N 的离散序列仅有 N 个独立谐波，取满 N 项即实现零误差完美重构，绝无吉布斯现象！',
        presets: [
          { label: '周期 N=10 矩形序列 (取满 M=10 项零误差!)', values: { N: 10, N1: 2, M: 10 } },
          { label: '仅取部分项 M=3 (平滑近似)', values: { N: 10, N1: 2, M: 3 } },
          { label: '周期 N=16 窄脉冲 (观察周期性频谱 a_{k+N}=a_k)', values: { N: 16, N1: 1, M: 16 } }
        ],
        controls: [
          { key: 'N', label: '离散序列基本周期 N', type: 'range', min: 6, max: 18, step: 2, default: 10 },
          { key: 'N1', label: '半脉宽参数 N₁ (脉宽 = 2N₁+1)', type: 'range', min: 1, max: 4, step: 1, default: 2 },
          { key: 'M', label: '参与合成的谐波项数 M (≤ N)', type: 'range', min: 1, max: 18, step: 1, default: 10 }
        ],
        theory: {
          formula: 'x[n] = ∑_{k=<N>} a_k e^{jk(2π/N)n},   a_k = (1/N) ∑_{n=<N>} x[n] e^{-jk(2π/N)n},   且 a_{k+N} ≡ a_k！',
          objectives: [
            '【掌握】典型离散时间周期序列（离散周期方波、离散正弦、周期单位脉冲串）的 DTFS 求解；',
            '【理解】DTFS 的两大独特性质：① 频谱系数 a_k 本身也是以 N 为周期的周期序列；② 求和仅含有限个 N 项，不存在无穷级数收敛问题与吉布斯现象！'
          ],
          guide3d: '后排展示原周期序列 x[n]，中间黄色针状图展示两个周期上的 DTFS 谱系数 a_k（可见其每隔 N 周期重复！），前排绿针为取 M 项重构序列 x_M[n]——将滑块 M 拉到 ≥N 时重构误差瞬间归零！'
        },
        matlab(p) {
          return `% Ch3.5 离散时间周期信号傅里叶级数 (DTFS) 有限项零误差重构
N = ${Math.round(p.N)}; N1 = ${Math.round(p.N1)};
n0 = 0:N-1;
x_period = double(n0 <= N1 | n0 >= N - N1);   % 一个周期内的对称矩形序列
ak = fft(x_period) / N;                        % DTFS 系数 a_k = (1/N) DFT{x[n]}
k_ext = -N : 2*N-1;
ak_periodic = ak(mod(k_ext, N) + 1);           % 验证频谱以 N 为周期: a_{k+N} = a_k
stem(k_ext, real(ak_periodic), 'filled'); grid on;
title(sprintf('周期 N=%d 的 DTFS 系数 a_k (呈周期 N 延拓)', N));`;
        },
        quiz: {
          question: '为什么离散时间周期序列的傅里叶级数（DTFS）不存在收敛困难与吉布斯过冲现象？',
          options: [
            '因为 e^{jk(2π/N)n} 关于 k 具有周期 N，仅有 N 个彼此独立的谐波，DTFS 是有限 N 项代数和而非无穷级数！',
            '因为离散信号没有高频分量',
            '因为离散序列幅值都是整数',
            'DTFS 同样存在 8.95% 的吉布斯过冲'
          ],
          answer: 0,
          explanation: '由于 e^{j(k+N)(2π/N)n} = e^{jk(2π/N)n}·e^{j2πn} = e^{jk(2π/N)n}，离散谐波基函数最多只有 N 个不同序列，因此 DTFS 综合公式是有限 N 项精确等式！'
        },
        compute(p) {
          const N = Math.round(p.N);
          const N1 = Math.min(Math.floor((N - 1) / 2), Math.round(p.N1));
          const Mterms = Math.min(N, Math.round(p.M));

          const xPer = new Float64Array(N);
          for (let n = 0; n < N; n++) {
            xPer[n] = n <= N1 || n >= N - N1 ? 1.0 : 0.0;
          }
          const ak = M.computeDTFS(xPer);

          // Select symmetric Mterms around k=0 (mod N)
          const activeK = new Set();
          activeK.add(0);
          let count = 1;
          for (let m = 1; m <= N && count < Mterms; m++) {
            activeK.add(m % N);
            count++;
            if (count < Mterms) {
              activeK.add((N - (m % N)) % N);
              count++;
            }
          }

          const sOrig = [], sRecon = [], sSpec = [];
          const pRecon = [], pSpec = [];
          let maxErr = 0;

          for (let n = -N; n <= N; n++) {
            const idx = ((n % N) + N) % N;
            const orig = xPer[idx];
            let rec = 0;
            for (const k of activeK) {
              const ang = (M.TWO_PI * k * n) / N;
              rec += ak[k].re * Math.cos(ang) - ak[k].im * Math.sin(ang);
            }
            maxErr = Math.max(maxErr, Math.abs(orig - rec));
            sOrig.push([n, 1.3, orig]);
            sRecon.push([n, -1.3, rec]);
            pRecon.push([n, rec]);
          }

          for (let k = -N; k <= N; k++) {
            const idx = ((k % N) + N) % N;
            sSpec.push([k, 0, ak[idx].re]);
            pSpec.push([k, ak[idx].re]);
          }

          return {
            scene: {
              axes: {
                x: { min: -N, max: N, label: '离散时间 n / 谐波序号 k' },
                y: { min: -1.9, max: 1.9, label: '时频序列层', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? '原x[n]' : v < -0.6 ? '重构x_M[n]' : '周期谱a_k') },
                z: { min: -0.4, max: 1.35, label: '序列值 / 谱系数' }
              },
              stems: [
                { points: sOrig, baseZ: 0, color: '#38bdf8', width: 1.9, radius: 3.5, label: '原始周期序列 x[n]' },
                { points: sSpec, baseZ: 0, color: '#fbbf24', width: 2.0, radius: 3.6, label: '周期频谱 a_k = a_{k+N}' },
                { points: sRecon, baseZ: 0, color: maxErr < 1e-6 ? '#34d399' : '#f43f5e', width: 2.4, radius: 4.2, label: `M=${Mterms} 项重构序列` }
              ],
              legend: [
                { color: '#38bdf8', label: `原周期序列 x[n] (周期 N=${N})` },
                { color: '#fbbf24', label: `DTFS 周期谱 a_k (周期 N=${N})` },
                { color: maxErr < 1e-6 ? '#34d399' : '#f43f5e', label: `取 ${activeK.size}/${N} 项合成 x_M[n]` }
              ]
            },
            plots2d: [
              { title: `DTFS 离散频谱 a_k (注意每隔 N=${N} 严格周期重复!)`, xMin: -N, xMax: N, yMin: -0.35, yMax: 0.9, xLabel: 'k', series: [{ points: pSpec, type: 'stems', color: '#fbbf24' }] },
              { title: `M=${activeK.size} 项合成序列 x_M[n] (当 M=N 时误差为 0)`, xMin: -N, xMax: N, yMin: -0.3, yMax: 1.3, xLabel: 'n', series: [{ points: pRecon, type: 'stems', color: maxErr < 1e-6 ? '#34d399' : '#f43f5e' }] }
            ],
            metrics: [
              { label: '独立谐波总数', value: `${N} 项 (k = 0..${N - 1})`, status: 'ok' },
              { label: '当前纳入合成项数', value: `${activeK.size} / ${N} 项` },
              { label: '最大重构绝对误差', value: M.fmt(maxErr, 6), status: maxErr < 1e-5 ? 'ok' : 'warn' },
              { label: '直流系数 a₀', value: M.fmt((2 * N1 + 1) / N, 3) }
            ]
          };
        }
      },

      /* ==================== 3.6 ==================== */
      {
        id: '3.6',
        code: 'Ch3-(8)~(11)',
        level: '掌握',
        title: '3.6 傅里叶级数与 LTI 滤波：微分方程连续滤波器与差分方程离散滤波器',
        summary: '覆盖大纲 (8)~(11)：观察周期信号各次谐波 a_k 经频率响应 H(jkω₀) 选频加权成为 b_k = a_k·H(jkω₀) 的全过程！',
        presets: [
          { label: '连续 RC 低通微分方程滤除高次谐波提取基波', values: { fType: 'ctLP', param: 1.8, w0: 1.6 } },
          { label: '连续 RC 高通微分方程提取跳变尖峰边沿', values: { fType: 'ctHP', param: 4.0, w0: 1.6 } },
          { label: '离散一阶递归差分方程低通滤波器', values: { fType: 'dtIIR', param: 0.78, w0: 1.6 } },
          { label: '离散两点差分高通滤波器 y[n]=(x[n]-x[n-1])/2', values: { fType: 'dtFIR', param: 0.5, w0: 1.6 } }
        ],
        controls: [
          {
            key: 'fType', label: '大纲经典滤波器举例', type: 'select', default: 'ctLP',
            options: [
              { value: 'ctLP', label: '连续微分方程低通：RC·dy/dt + y = x  [大纲3.(10)]' },
              { value: 'ctHP', label: '连续微分方程高通：RC·dy/dt + y = RC·dx/dt  [大纲3.(10)]' },
              { value: 'dtIIR', label: '离散差分方程一阶递归低通：y[n] - αy[n-1] = (1-α)x[n]  [大纲3.(11)]' },
              { value: 'dtFIR', label: '离散差分方程两点差分高通：y[n] = 0.5(x[n] - x[n-1])  [大纲3.(11)]' }
            ]
          },
          { key: 'param', label: '截止频率 ω_c (连续) / 递归系数 α (离散)', type: 'range', min: 0.3, max: 6.0, step: 0.1, default: 1.8 },
          { key: 'w0', label: '输入方波基波频率 ω₀', type: 'range', min: 0.8, max: 3.0, step: 0.1, default: 1.6, unit: 'rad/s' }
        ],
        theory: {
          formula: 'x(t) = ∑ a_k e^{jkω₀t}  ──[ H ]──►  y(t) = ∑ [a_k · H(jkω₀)] e^{jkω₀t}   ⇒   b_k = a_k · H(jkω₀)',
          objectives: [
            '【掌握】周期信号通过 LTI 系统的频域谐波求解法 b_k = a_k H(jkω₀)；',
            '【掌握】用微分方程描述的连续时间 RC 低通/高通滤波器与用差分方程描述的离散递归(IIR)/非递归(FIR)滤波器的频率响应特性。'
          ],
          guide3d: '三维空间将时域与频域融为一体：后平面为输入方波及其谐波谱 |a_k|，中间琥珀色曲线为滤波器传输包络 |H|，前平面为经 H(jkω₀) 逐根削减/放行后的输出谐波谱 |b_k| 与滤波后时域波形 y！'
        },
        matlab(p) {
          return `% Ch3.6 周期信号经微/差分方程滤波器谐波响应 b_k = a_k * H(jk*w0)
w0 = ${M.fmt(p.w0, 2)}; wc = ${M.fmt(p.param, 2)};
t = -4:0.01:4; x = zeros(size(t)); y = zeros(size(t));
for k = 1:2:25
  ak_sin = 4 / (pi * k);
  w = k * w0;
  H = ${p.fType === 'ctLP' ? 'wc / (wc + 1j*w)' : '1j*w / (wc + 1j*w)'};
  x = x + ak_sin * sin(w * t);
  y = y + ak_sin * abs(H) * sin(w * t + angle(H));
end
plot(t, x, '--b', t, y, 'g', 'LineWidth', 2); grid on;
legend('输入周期方波 x(t)', '微分方程滤波器稳态输出 y(t)');`;
        },
        quiz: {
          question: '对于离散差分方程系统 y[n] = 0.5(x[n] + x[n-1])（两点滑动平均），其对最高数字频率 ω = π（即交替序列 (-1)^n）的频率响应 H(e^{jπ}) 为：',
          options: ['0（完全滤除最高频交替分量，表现为低通滤波器！）', '1', '2', '-j'],
          answer: 0,
          explanation: 'H(e^{jω}) = 0.5(1 + e^{-jω})，代入 ω = π 得 e^{-jπ} = -1，故 H(e^{jπ}) = 0.5(1 - 1) = 0；而在直流 ω = 0 处 H(e^{j0}) = 1，是典型的 FIR 低通平滑滤波器！'
        },
        compute(p) {
          const isDT = p.fType === 'dtIIR' || p.fType === 'dtFIR';
          const evalH = (w) => {
            if (p.fType === 'ctLP') return M.cDiv({ re: p.param, im: 0 }, { re: p.param, im: w });
            if (p.fType === 'ctHP') return M.cDiv({ re: 0, im: w }, { re: p.param, im: w });
            if (p.fType === 'dtIIR') {
              const alpha = Math.min(0.93, Math.max(0.15, p.param <= 1 ? p.param : p.param / 6.5));
              return M.cDiv({ re: 1 - alpha, im: 0 }, { re: 1 - alpha * Math.cos(w), im: alpha * Math.sin(w) });
            }
            // dtFIR highpass: 0.5*(1 - e^{-jw})
            return { re: 0.5 * (1 - Math.cos(w)), im: 0.5 * Math.sin(w) };
          };

          const ts = M.linspace(-4, 4, 300);
          const xArr = new Float64Array(ts.length);
          const yArr = new Float64Array(ts.length);
          const inSpec3 = [], outSpec3 = [];
          const p2dInSpec = [], p2dOutSpec = [];

          const wStep = isDT ? (M.TWO_PI / 16) : p.w0;
          const maxK = isDT ? 8 : 13;

          for (let k = 1; k <= maxK; k += 2) {
            const ampIn = 4 / (Math.PI * k);
            const wk = k * wStep;
            const Hk = evalH(wk);
            const magH = M.cAbs(Hk);
            const phH = M.cArg(Hk);
            const ampOut = ampIn * magH;

            for (let i = 0; i < ts.length; i++) {
              xArr[i] += ampIn * Math.sin(wk * ts[i]);
              yArr[i] += ampOut * Math.sin(wk * ts[i] + phH);
            }
            const xMap = -4 + (wk / (maxK * wStep + 0.5)) * 8;
            inSpec3.push([xMap, 0.35, ampIn]);
            outSpec3.push([xMap, -0.35, ampOut]);
            p2dInSpec.push([wk, ampIn]);
            p2dOutSpec.push([wk, ampOut]);
          }

          const wMax = maxK * wStep + 0.5;
          const ws = M.linspace(0, wMax, 140);
          const hCurve3 = ws.map((w) => [-4 + (w / wMax) * 8, 0, M.cAbs(evalH(w))]);
          const hCurve2d = ws.map((w) => [w, M.cAbs(evalH(w))]);

          const cIn = ts.map((t, i) => [t, 1.4, xArr[i] * 0.85]);
          const cOut = ts.map((t, i) => [t, -1.4, yArr[i] * 0.85]);

          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '时间 t  /  归一化频率轴 ω' },
                y: { min: -1.9, max: 1.9, label: '输入 → 滤波器 |H| → 输出', ticks: [-1.4, 0, 1.4], format: (v) => (v > 0.6 ? '输入x' : v < -0.6 ? '输出y' : '|H(ω)|') },
                z: { min: -1.4, max: 1.5, label: '波形幅值 / 谐波谱幅值' }
              },
              ribbons: [{ points: hCurve3, baseZ: 0, color: 'rgba(251,191,36,0.18)' }],
              curves: [
                { points: cIn, color: '#38bdf8', width: 2.1, label: '输入周期波 x' },
                { points: hCurve3, color: '#fbbf24', width: 2.8, glow: true, label: '滤波器幅频响应 |H|' },
                { points: cOut, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '滤波输出稳态波 y' }
              ],
              stems: [
                { points: inSpec3, baseZ: 0, color: '#38bdf8', width: 2.0, radius: 3.6, label: '输入谐波 2|a_k|' },
                { points: outSpec3, baseZ: 0, color: '#34d399', width: 2.4, radius: 4.2, label: '输出谐波 2|b_k|' }
              ],
              legend: [
                { color: '#38bdf8', label: '输入方波与原谐波 2|a_k|' },
                { color: '#fbbf24', label: '微/差分滤波器 |H|' },
                { color: '#34d399', label: '滤波输出与加权谐波 2|b_k|' }
              ]
            },
            plots2d: [
              {
                title: '时域滤波前后对照：输入方波 [蓝] → 滤波器输出 [绿]',
                xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5, xLabel: 't',
                series: [
                  { points: ts.map((t, i) => [t, xArr[i]]), color: '#38bdf8', dashed: true, width: 1.6 },
                  { points: ts.map((t, i) => [t, yArr[i]]), color: '#34d399', width: 2.3 }
                ]
              },
              {
                title: '频域选频机理：|H(ω)| [黄] · 输入谱 [蓝] → 输出谱 [绿]',
                xMin: 0, xMax: wMax, yMin: 0, yMax: 1.4, xLabel: 'ω',
                series: [
                  { points: hCurve2d, color: '#fbbf24', fill: 'rgba(251,191,36,0.15)', width: 2.1 },
                  { points: p2dInSpec, type: 'stems', color: '#38bdf8', radius: 2.6 },
                  { points: p2dOutSpec, type: 'stems', color: '#34d399', radius: 3.4 }
                ]
              }
            ],
            metrics: [
              { label: '滤波器数学模型', value: isDT ? '常系数差分方程 (DT)' : '常系数微分方程 (CT)', status: 'ok' },
              { label: '基波增益 |H(ω₀)|', value: M.fmt(M.cAbs(evalH(wStep)), 3) },
              { label: '三次谐波增益 |H(3ω₀)|', value: M.fmt(M.cAbs(evalH(3 * wStep)), 3) },
              { label: '五次谐波增益 |H(5ω₀)|', value: M.fmt(M.cAbs(evalH(5 * wStep)), 3) }
            ]
          };
        }
      }
    ]
  });
})();
