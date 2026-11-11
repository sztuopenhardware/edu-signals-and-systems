/**
 * 第 6 章：信号与系统的时域和频域特性 (Chapter 6) — 5 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 6 章全部 7 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch6',
    number: '第 6 章',
    title: '第 6 章：信号与系统的时域和频域特性',
    shortTitle: 'Ch6 时域和频域特性',
    weeks: '第 11–12 周 · 4 学时',
    syllabusItems: '模与相位表示、无失真传输与群时延、理想滤波器时域振铃与上升时间、非理想滤波器、一二阶连续与离散系统',
    cases: [
      /* ==================== 6.1 ==================== */
      {
        id: '6.1',
        code: 'Ch6-(1)(2)',
        level: '理解',
        title: '6.1 模与相位表示：无失真传输条件与全通非线性相位群时延失真',
        summary: '震撼对比实验：幅频完全恒为 1（|H(jω)|≡1 全通！）的系统，仅因非线性相位（群时延 τ_g(ω) 不等）即令窄脉冲严重解体色散！',
        presets: [
          { label: '无失真线性相位传输 ∠H = -ω·t_d (波形完好平移!)', values: { phType: 'linear', td: 1.5, disp: 0.8 } },
          { label: '全通非线性相位色散 (|H|≡1 但波形严重畸变!)', values: { phType: 'allpass', td: 1.5, disp: 1.1 } },
          { label: '幅度失真对比 (相位为0但高频衰减)', values: { phType: 'magDist', td: 0.0, disp: 0.8 } }
        ],
        controls: [
          {
            key: 'phType', label: '系统传输特性对比', type: 'select', default: 'allpass',
            options: [
              { value: 'linear', label: '① 理想无失真传输：|H(jω)|=1, ∠H(jω) = -ω·t_d [常数群时延]' },
              { value: 'allpass', label: '② 二阶全通色散系统：|H(jω)|≡1, ∠H 非线性 [可变群时延失真!]' },
              { value: 'magDist', label: '③ 纯幅度失真对照：∠H=0 (零相位), |H| 低通衰减' }
            ]
          },
          { key: 'td', label: '线性群延时 t_d', type: 'range', min: 0.0, max: 2.5, step: 0.1, default: 1.4, unit: 's' },
          { key: 'disp', label: '非线性相位色散强度', type: 'range', min: 0.3, max: 2.0, step: 0.1, default: 1.1 }
        ],
        theory: {
          formula: '无失真传输条件：H(jω) = K · e^{-jωt_d}  ⇔  |H(jω)| = K (常数) 且 群时延 τ_g(ω) = -d∠H(jω)/dω = t_d (常数)！',
          objectives: [
            '【理解】傅里叶变换及 LTI 系统频率响应的模-相位表示与群时延 τ_g(ω) = -dφ(ω)/dω 的物理意义；',
            '【了解】信号无失真传输的两大充要条件，理解为什么图像、脉冲数字通信对“线性相位”比单纯平坦幅频更敏感！'
          ],
          guide3d: '三维空间将复合脉冲拆成 3 个频率分量（ω₁, ω₂, ω₃）追踪其传输：在线性相位下三个分量延迟完全相同的秒数 t_d，抵达终点对齐叠加还原原脉冲；在非线性相位下高低频跑得快慢不一，叠加后脉冲崩解拖尾！'
        },
        matlab(p) {
          return `% Ch6.1 无失真传输线性相位 vs 全通系统非线性相位色散失真对比
t = -4:0.01:6; w = [1.2, 2.6, 4.2]; amps = [0.55, 0.45, 0.35];
x = amps(1)*cos(w(1)*t) + amps(2)*cos(w(2)*t) + amps(3)*cos(w(3)*t);
% 构造模恒为 1 的全通相移器 H_ap(jw) = (a - jw)/(a + jw), |H_ap| == 1!
a = ${M.fmt(2.2 / p.disp, 2)};
phi_ap = -4 * atan(w / a); % 级联两节一阶全通相移
y_lin = amps(1)*cos(w(1)*(t-${M.fmt(p.td, 2)})) + amps(2)*cos(w(2)*(t-${M.fmt(p.td, 2)})) + amps(3)*cos(w(3)*(t-${M.fmt(p.td, 2)}));
y_ap  = amps(1)*cos(w(1)*t + phi_ap(1)) + amps(2)*cos(w(2)*t + phi_ap(2)) + amps(3)*cos(w(3)*t + phi_ap(3));
plot(t, x, '--b', t, y_lin, 'g', t, y_ap, 'r', 'LineWidth', 1.8);
legend('输入复合波 x(t)', '线性相位无失真 y_{lin}(t)', '全通非线性相位失真 y_{ap}(t)'); grid on;`;
        },
        quiz: {
          question: '某 LTI 系统的频率响应为 H(jω) = (1 - jω) / (1 + jω)。关于信号通过该系统后的现象，下列说法正确的是：',
          options: [
            '|H(jω)| ≡ 1 对所有频率恒成立（无幅度失真），但因相位 -2arctan(ω) 非线性，宽带脉冲会产生相位（群时延）色散失真！',
            '信号实现理想无失真传输，输出等于输入',
            '高频分量幅度被严重衰减',
            '系统不稳定'
          ],
          answer: 0,
          explanation: '|1 - jω| / |1 + jω| = √(1+ω²)/√(1+ω²) ≡ 1，故为全通滤波器，各频率幅度毫发无损；但群时延 τ_g(ω) = 2/(1+ω²) 随频率变化，不同频率分量延迟不同导致波形畸变！'
        },
        compute(p) {
          const ts = M.linspace(-3.5, 5.5, 320);
          const freqs = [1.0, 2.2, 3.6, 5.0];
          const weights = [0.42, 0.36, 0.28, 0.20];
          const aPole = 2.4 / p.disp;

          const evalSys = (w) => {
            if (p.phType === 'linear') return { mag: 1.0, ph: -w * p.td, gd: p.td };
            if (p.phType === 'allpass') {
              // 3 cascaded allpass sections for vivid dispersion, |H| === 1!
              return { mag: 1.0, ph: -6 * Math.atan(w / aPole), gd: (6 * aPole) / (aPole * aPole + w * w) };
            }
            return { mag: 1 / Math.hypot(1, w / 2.2), ph: 0, gd: 0 };
          };

          const xIn = new Float64Array(ts.length);
          const yOut = new Float64Array(ts.length);
          const compCurves = [];

          for (let k = 0; k < freqs.length; k++) {
            const w = freqs[k];
            const { mag, ph } = evalSys(w);
            const cPts = [];
            for (let i = 0; i < ts.length; i++) {
              const t = ts[i];
              const env = Math.exp(-0.22 * t * t);
              xIn[i] += weights[k] * Math.cos(w * t) * env;
              // Approximate narrowband group delay shift + phase shift
              const { gd } = evalSys(w);
              const tShift = p.phType === 'linear' ? p.td : p.phType === 'allpass' ? gd * 0.65 : 0;
              const envOut = Math.exp(-0.22 * Math.pow(t - tShift, 2));
              const comp = weights[k] * mag * Math.cos(w * t + ph) * envOut;
              yOut[i] += comp;
              cPts.push([t, 0.4 + k * 0.35, comp]);
            }
            compCurves.push({ points: cPts, color: M.colormap(k / freqs.length, 0.72), width: 1.5, label: `分量 ω_${k + 1}` });
          }

          const cIn = ts.map((t, i) => [t, -0.35, xIn[i]]);
          const cOut = ts.map((t, i) => [t, -1.4, yOut[i]]);

          const ws = M.linspace(0, 7, 140);
          const pPh = ws.map((w) => [w, evalSys(w).ph]);
          const pGd = ws.map((w) => [w, evalSys(w).gd]);

          return {
            scene: {
              axes: {
                x: { min: -3.5, max: 5.5, label: '时间 t (s)' },
                y: { min: -1.8, max: 1.9, label: '输入 / 输出 / 各频带分量轨道' },
                z: { min: -1.1, max: 1.4, label: '脉冲幅值' }
              },
              ribbons: [{ points: cOut, baseZ: 0, color: p.phType === 'linear' ? 'rgba(52,211,153,0.24)' : 'rgba(244,63,94,0.24)' }],
              curves: [
                ...compCurves,
                { points: cIn, color: '#38bdf8', width: 2.4, dashed: true, label: '输入复合脉冲 x(t)' },
                { points: cOut, color: p.phType === 'linear' ? '#34d399' : '#f43f5e', width: 3.2, glow: true, shadowXZ: true, label: '系统输出 y(t)' }
              ],
              legend: [
                { color: '#38bdf8', label: '输入脉冲 x(t)' },
                { color: p.phType === 'linear' ? '#34d399' : '#f43f5e', label: p.phType === 'linear' ? '无失真延时输出 y(t)' : '色散/失真输出 y(t)' },
                { color: '#fbbf24', label: '后排：各频带子波群延迟轨迹' }
              ]
            },
            plots2d: [
              {
                title: '时域波形保真度：输入脉冲 [蓝虚] vs 系统输出 [绿/红]',
                xMin: -3.5, xMax: 5.5, yMin: -1.0, yMax: 1.35, xLabel: 't(s)',
                series: [
                  { points: ts.map((t, i) => [t, xIn[i]]), color: '#38bdf8', dashed: true, width: 1.8 },
                  { points: ts.map((t, i) => [t, yOut[i]]), color: p.phType === 'linear' ? '#34d399' : '#f43f5e', width: 2.3 }
                ]
              },
              {
                title: '相频曲线 ∠H(jω) [黄] 与群时延 τ_g(ω) = -d∠H/dω [青]',
                xMin: 0, xMax: 7, yMin: -8.5, yMax: 5.5, xLabel: 'ω',
                series: [
                  { points: pPh, color: '#fbbf24', width: 1.9 },
                  { points: pGd, color: '#38bdf8', fill: 'rgba(56,189,248,0.16)', width: 2.2 }
                ]
              }
            ],
            metrics: [
              { label: '幅频特性 |H(jω)|', value: p.phType === 'magDist' ? '随频率下降 (幅度失真)' : '≡ 1.000 (全频段无幅度衰减!)', status: 'ok' },
              { label: '群时延 τ_g(ω) 特性', value: p.phType === 'linear' ? `恒等于 ${M.fmt(p.td, 2)} s (无相位失真✓)` : p.phType === 'allpass' ? '低频慢、高频快 (严重色散!)' : '零时延', status: p.phType === 'allpass' ? 'warn' : 'ok' },
              { label: '输出峰值保真比', value: `${M.fmt((Math.max(...yOut) / Math.max(...xIn)) * 100, 1)} %` },
              { label: '传输判定', value: p.phType === 'linear' ? '满足无失真传输条件 ✓' : '波形产生传输畸变 ✗', status: p.phType === 'linear' ? 'ok' : 'err' }
            ]
          };
        }
      },

      /* ==================== 6.2 ==================== */
      {
        id: '6.2',
        code: 'Ch6-(3)',
        level: '掌握',
        title: '6.2 理想频率选择性滤波器的时域特性：非因果性、阶跃振铃与上升时间',
        summary: '揭示理想砖墙滤波器的代价：时域冲激响应 h(t) 在 t<0 非零（物理不可实现！），阶跃响应存在 ~9% 振铃，且上升时间 t_r 与带宽 ω_c 成反比！',
        presets: [
          { label: '理想低通 ωc = 3.0 rad/s', values: { fType: 'lp', wc: 3.0, td: 0.0 } },
          { label: '展宽带宽 ωc = 6.5 rad/s (上升时间 t_r 缩短一半!)', values: { fType: 'lp', wc: 6.5, td: 0.0 } },
          { label: '缩窄带宽 ωc = 1.4 rad/s (响应迟缓上升时间变长!)', values: { fType: 'lp', wc: 1.4, td: 0.0 } },
          { label: '理想高通滤波器 H_HP(jω) = 1 - H_LP(jω)', values: { fType: 'hp', wc: 3.0, td: 0.0 } }
        ],
        controls: [
          {
            key: 'fType', label: '理想频率选择性滤波器类型', type: 'select', default: 'lp',
            options: [
              { value: 'lp', label: '理想低通滤波器 (LPF): h(t) = (ω_c/π)Sa(ω_c t)' },
              { value: 'hp', label: '理想高通滤波器 (HPF): h(t) = δ(t) - (ω_c/π)Sa(ω_c t)' }
            ]
          },
          { key: 'wc', label: '截止角频率（通带带宽）ω_c', type: 'range', min: 1.0, max: 8.0, step: 0.2, default: 3.0, unit: 'rad/s' },
          { key: 'td', label: '附加线性相移延时 t_d', type: 'range', min: 0.0, max: 2.5, step: 0.25, default: 0.0, unit: 's' }
        ],
        theory: {
          formula: '理想低通：h(t) = (ω_c/π)Sa(ω_c(t-t_d)),   阶跃响应 s(t) = ½ + (1/π)Si(ω_c(t-t_d)),   上升时间 t_r ≈ π / ω_c！',
          objectives: [
            '【掌握】理想低通滤波器的定义、传输特性、冲激响应 h(t) 与阶跃响应 s(t) 表达式；',
            '【掌握】上升时间 t_r ∝ 1/ω_c 的反比物理意义，以及为什么陡峭的理想频域截断必然导致非因果性与时域振铃（Ringing）。'
          ],
          guide3d: '三维空间同时陈列三大核心曲线：后排黄色矩形门为理想频域 |H(jω)|，中排蓝色 Sa 波为冲激响应 h(t)（注意它在 t<0 早已开始振荡，故非因果！），前排绿色正弦积分曲线为阶跃响应 s(t)！'
        },
        matlab(p) {
          return `% Ch6.2 理想低通滤波器的冲激响应 h(t)、阶跃响应 s(t) 与上升时间 t_r
wc = ${M.fmt(p.wc, 2)}; td = ${M.fmt(p.td, 2)};
t = -5:0.01:6;
h = (wc / pi) * sinc(wc * (t - td) / pi);
s = cumtrapz(t, h); % 正弦积分阶跃响应 s(t) = 0.5 + Si(wc*(t-td))/pi
subplot(2,1,1); plot(t, h, 'b', 'LineWidth', 1.8); grid on; title('非因果冲激响应 h(t)');
subplot(2,1,2); plot(t, s, 'g', 'LineWidth', 2); grid on;
title(sprintf('阶跃响应 s(t)：峰值过冲 %.3f, 理论主瓣上升时间 t_r = \\pi/\\omega_c = %.3fs', max(s), pi/wc));`;
        },
        quiz: {
          question: '将理想低通滤波器的截止频率 ω_c 增大为原来的 2 倍，其时域冲激响应峰值、阶跃响应上升时间 t_r 以及阶跃最大过冲百分比分别如何变化？',
          options: [
            '冲激响应峰值变为 2 倍，阶跃上升时间 t_r 缩短为 1/2，但阶跃过冲百分比仍保持 ~9% 不变！',
            '上升时间变为 2 倍，过冲消失',
            '冲激响应峰值不变，过冲变为 18%',
            '系统变为因果系统'
          ],
          answer: 0,
          explanation: 'h(0)=ω_c/π 随 ω_c 加倍；主瓣零点间距即上升时间 t_r = π/ω_c 减半（频带越宽响应越快！）；而 s(t)=0.5+Si(ω_c t)/π 的极值由 Si(π)≈1.8519 决定，恒为 0.5+1.8519/π ≈ 1.0895（约 9% 过冲）！'
        },
        compute(p) {
          const ts = M.linspace(-4.5, 5.5, 340);
          const ws = M.linspace(-10, 10, 220);

          const cSpec = ws.map((w) => {
            const mag = p.fType === 'lp' ? (Math.abs(w) <= p.wc ? 1 : 0) : (Math.abs(w) >= p.wc ? 1 : 0);
            return [(w / 10) * 5, 1.35, mag * 1.3];
          });

          const cH = [], cS = [];
          const pH = [], pS = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const u = t - p.td;
            const hLP = (p.wc / Math.PI) * M.sa(p.wc * u);
            const sLP = 0.5 + M.siIntegral(p.wc * u) / Math.PI;
            const hv = p.fType === 'lp' ? hLP : -hLP;
            const sv = p.fType === 'lp' ? sLP : (u >= 0 ? 1 : 0) - sLP;
            cH.push([t, 0, hv * 0.8]);
            cS.push([t, -1.35, sv]);
            pH.push([t, hv]);
            pS.push([t, sv]);
          }

          const tr = Math.PI / p.wc;
          return {
            scene: {
              axes: {
                x: { min: -4.5, max: 5.5, label: '时间 t (s)  /  归一化频率 ω' },
                y: { min: -1.9, max: 1.9, label: '频响 |H| → 冲激 h(t) → 阶跃 s(t)', ticks: [-1.35, 0, 1.35], format: (v) => (v > 0.6 ? '|H(jω)|' : v < -0.6 ? 's(t)' : 'h(t)') },
                z: { min: -0.8, max: 2.2, label: '响应幅值' }
              },
              ribbons: [
                { points: cSpec, baseZ: 0, color: 'rgba(251,191,36,0.2)' },
                { points: cS, baseZ: 0, color: 'rgba(52,211,153,0.22)' }
              ],
              curves: [
                { points: cSpec, color: '#fbbf24', width: 2.6, label: '理想砖墙幅频 |H(jω)|' },
                { points: cH, color: '#38bdf8', width: 2.5, label: '非因果冲激响应 h(t)' },
                { points: cS, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '阶跃响应 s(t) (含振铃)' }
              ],
              stems: p.fType === 'hp' ? [{ points: [[p.td, 0, 1.8]], baseZ: 0, color: '#f43f5e', width: 2.8, impulse: true, label: '高通直射冲激 δ(t-t_d)' }] : [],
              legend: [
                { color: '#fbbf24', label: `理想幅频窗 (ωc=${M.fmt(p.wc, 1)})` },
                { color: '#38bdf8', label: '非因果冲激响应 h(t)' },
                { color: '#34d399', label: '阶跃响应 s(t) (~9%振铃)' }
              ]
            },
            plots2d: [
              { title: '时域单位冲激响应 h(t) (注意 t < t_d 处非零 → 物理不可因果实现!)', xMin: -4.5, xMax: 5.5, yMin: -0.9, yMax: 2.8, xLabel: 't(s)', series: [{ points: pH, color: '#38bdf8', fill: 'rgba(56,189,248,0.16)', width: 2.0 }], vLines: [{ x: p.td, color: '#f43f5e' }] },
              { title: `时域阶跃响应 s(t) (上升时间 t_r ≈ π/ω_c = ${M.fmt(tr, 2)}s，峰值 ≈ 1.09)`, xMin: -4.5, xMax: 5.5, yMin: -0.4, yMax: 1.3, xLabel: 't(s)', series: [{ points: pS, color: '#34d399', width: 2.3 }] }
            ],
            metrics: [
              { label: '物理因果可实现性', value: '非因果 (h(t) 在 t<0 非零!)', status: 'warn' },
              { label: '阶跃上升时间 π/ωc', value: `${M.fmt(tr, 3)} s (与带宽成反比)` },
              { label: '阶跃最大振铃峰值', value: p.fType === 'lp' ? '1.0895 (恒定 8.95% 过冲)' : '高通瞬态跳变' },
              { label: '冲激主瓣宽度 2π/ωc', value: `${M.fmt(M.TWO_PI / p.wc, 3)} s` }
            ]
          };
        }
      },

      /* ==================== 6.3 ==================== */
      {
        id: '6.3',
        code: 'Ch6-(4)',
        level: '理解',
        title: '6.3 非理想滤波器的时域与频域权衡：巴特沃斯 vs 切比雪夫三维阶数曲面',
        summary: '因果可实现的工程折中：放宽通带波纹、过渡带与阻带指标，对比 Butterworth（最大平坦）与 Chebyshev（等波纹陡峭过渡带）！',
        camera: { azimuth: -0.9, elevation: 0.48, zoom: 1.0 },
        presets: [
          { label: '4 阶巴特沃斯 Butterworth (通带最大平坦)', values: { family: 'butter', N: 4, eps: 0.4, wc: 3.0 } },
          { label: '4 阶切比雪夫 Chebyshev (过渡带更陡但时域过冲更大!)', values: { family: 'cheby', N: 4, eps: 0.5, wc: 3.0 } },
          { label: '高阶 N=7 逼近理想砖墙（群延时与振铃显著增加）', values: { family: 'butter', N: 7, eps: 0.4, wc: 3.0 } }
        ],
        controls: [
          {
            key: 'family', label: '非理想工程滤波器族', type: 'select', default: 'butter',
            options: [
              { value: 'butter', label: '巴特沃斯 Butterworth (通带最大平坦，单调滚降)' },
              { value: 'cheby', label: '切比雪夫 I 型 Chebyshev (通带等波纹，过渡带极陡!)' }
            ]
          },
          { key: 'N', label: '滤波器阶数 N', type: 'range', min: 1, max: 8, step: 1, default: 4 },
          { key: 'wc', label: '通带截止频率 ω_c', type: 'range', min: 1.5, max: 5.0, step: 0.5, default: 3.0, unit: 'rad/s' },
          { key: 'eps', label: '切比雪夫通带波纹系数 ε', type: 'range', min: 0.2, max: 0.8, step: 0.1, default: 0.45 }
        ],
        theory: {
          formula: '|H_Butter(jω)|² = 1 / [1 + (ω/ω_c)^{2N}]；   |H_Cheby(jω)|² = 1 / [1 + ε² T_N²(ω/ω_c)]',
          objectives: [
            '【理解】非理想滤波器的核心频域指标（通带容限 δ₁、阻带容限 δ₂、通带截止 ω_p、阻带起始 ω_s、过渡带宽度）；',
            '【理解】时域与频域的工程权衡：过渡带越陡峭（阶数 N 越高或波纹越大），因果阶跃响应的时延和振荡过冲就越显著！'
          ],
          guide3d: '三维曲面展示阶数 N = 1 → 8 的幅频特性演化族：随着阶数 N 增加，过渡带越来越陡峭逼近理想砖墙，同时同步观察下方因果阶跃响应 s(t) 的延迟与过冲增大！'
        },
        matlab(p) {
          return `% Ch6.3 非理想滤波器时频特性讨论：Butterworth vs Chebyshev
N = ${Math.round(p.N)}; wc = ${M.fmt(p.wc, 2)}; w = 0:0.02:10;
% 计算左半 s 平面因果极点构造 H(s)
k = 1:N; theta = pi*(2*k + N - 1)/(2*N);
poles = wc * exp(1j * theta);
b = prod(-poles); a = real(poly(poles));
H = freqs(b, a, w);
subplot(2,1,1); plot(w, abs(H), 'g', 'LineWidth', 2); grid on; title('因果非理想滤波器幅频响应 |H(j\omega)|');
subplot(2,1,2); step(tf(real(b), a), 6); grid on; title('因果阶跃响应 s(t) (t < 0 严格为 0!)');`;
        },
        quiz: {
          question: '在相同阶数 N 与相同通带截止频率 ω_c 下，对比巴特沃斯（Butterworth）与切比雪夫 I 型（Chebyshev）低通滤波器：',
          options: [
            '切比雪夫滤波器过渡带更窄更陡峭，但代价是通带存在等波纹起伏且时域阶跃响应振荡过冲更大',
            '巴特沃斯过渡带更陡峭且时域过冲更大',
            '两者都是非因果不可实现系统',
            '阶数 N 越高，时域阶跃响应延迟越小、过冲越小'
          ],
          answer: 0,
          explanation: '这是工程滤波器设计的核心折中！切比雪夫通过在通带允许等波纹起伏换取了同阶最陡峭的过渡带滚降，但极点更靠近虚轴，导致群时延起伏和时域阶跃振铃过冲明显大于巴特沃斯滤波器。'
        },
        compute(p) {
          const Nsel = Math.round(p.N);
          const chebPoly = (n, x) => {
            if (Math.abs(x) <= 1) return Math.cos(n * Math.acos(x));
            return Math.cosh(n * Math.acosh(Math.abs(x))) * (x < 0 && n % 2 === 1 ? -1 : 1);
          };

          const evalMag = (ord, w) => {
            const u = w / p.wc;
            if (p.family === 'butter') return 1 / Math.sqrt(1 + Math.pow(u, 2 * ord));
            const tn = chebPoly(ord, u);
            return 1 / Math.sqrt(1 + p.eps * p.eps * tn * tn);
          };

          // 3D Surface across order N=1..8 and w=0..8
          const ws = M.linspace(0, 8, 44);
          const ords = [1, 2, 3, 4, 5, 6, 7, 8];
          const zm = ws.map((w) => Float64Array.from(ords, (ord) => evalMag(ord, w)));

          const activeCurve = ws.map((w) => [w, Nsel, evalMag(Nsel, w)]);

          // Compute causal step response via numerical inverse FT / pole ODE simulation
          const poles = p.family === 'butter' ? M.butterworthPoles(Nsel, p.wc) : M.chebyshevPoles(Nsel, p.wc, p.eps);
          let gain = 1;
          for (const pl of poles) gain *= Math.hypot(pl.re, pl.im);
          if (p.family === 'cheby' && Nsel % 2 === 0) gain /= Math.sqrt(1 + p.eps * p.eps);

          // Simulate cascade of 1st/2nd order sections in time for exact causal step response!
          const ts = M.linspace(0, 6.5, 260);
          const dt = ts[1] - ts[0];
          // State-space / modal integration from poles: dx_k/dt = p_k * x_k + u(t)
          // Using polynomial companion ODE of H(s)
          let poly = [{ re: 1, im: 0 }];
          for (const pl of poles) {
            const next = new Array(poly.length + 1).fill(null).map(() => ({ re: 0, im: 0 }));
            for (let i = 0; i < poly.length; i++) {
              next[i] = M.cAdd(next[i], poly[i]);
              next[i + 1] = M.cSub(next[i + 1], M.cMul(poly[i], pl));
            }
            poly = next;
          }
          const aCoeffs = poly.map((c) => c.re); // s^N + a[1]s^{N-1} + ... + a[N]
          const state = new Float64Array(Nsel); // companion state [y, y', ..., y^{(N-1)}]
          const stepPts = [];
          let peakStep = 0;
          for (let ti = 0; ti < ts.length; ti++) {
            const yVal = state[0] * gain;
            if (yVal > peakStep) peakStep = yVal;
            stepPts.push([ts[ti], yVal]);
            // RK2 midpoint step
            const deriv = (st) => {
              const ds = new Float64Array(Nsel);
              for (let k = 0; k < Nsel - 1; k++) ds[k] = st[k + 1];
              let acc = 1.0; // unit step input u(t)=1
              for (let k = 0; k < Nsel; k++) acc -= aCoeffs[Nsel - k] * st[k];
              ds[Nsel - 1] = acc;
              return ds;
            };
            const k1 = deriv(state);
            const mid = Float64Array.from(state, (v, idx) => v + 0.5 * dt * k1[idx]);
            const k2 = deriv(mid);
            for (let k = 0; k < Nsel; k++) state[k] += dt * k2[k];
          }

          const wsFine = M.linspace(0, 8, 200);
          const pMagDb = wsFine.map((w) => [w, Math.max(-55, 20 * Math.log10(evalMag(Nsel, w) + 1e-4))]);

          return {
            scene: {
              axes: {
                x: { min: 0, max: 8, label: '角频率 ω (rad/s)' },
                y: { min: 1, max: 8, label: '滤波器阶数 N (1 → 8)' },
                z: { min: 0, max: 1.15, label: '幅频模值 |H_N(jω)|' }
              },
              surfaces: [{ xGrid: ws, yGrid: ords, zMatrix: zm, zMin: 0, zMax: 1.05, opacity: 0.72, wireframe: true }],
              curves: [{ points: activeCurve, color: '#fbbf24', width: 3.6, glow: true, label: `当前 N=${Nsel} 阶幅频曲线` }],
              legend: [
                { color: '#38bdf8', label: `3D 阶数演化曲面 (${p.family === 'butter' ? 'Butterworth' : 'Chebyshev'})` },
                { color: '#fbbf24', label: `高亮当前阶数 N = ${Nsel}` }
              ]
            },
            plots2d: [
              { title: `N=${Nsel} 阶对数幅频波特图 20lg|H(jω)| (dB)`, xMin: 0, xMax: 8, yMin: -50, yMax: 5, xLabel: 'ω', series: [{ points: pMagDb, color: '#fbbf24', fill: 'rgba(251,191,36,0.14)', width: 2.1 }], vLines: [{ x: p.wc, color: '#f43f5e' }] },
              { title: `因果可实现阶跃响应 s(t) (t < 0 恒为 0，峰值 = ${M.fmt(peakStep, 3)})`, xMin: 0, xMax: 6.5, yMin: -0.1, yMax: 1.35, xLabel: 't(s)', series: [{ points: stepPts, color: '#34d399', width: 2.2 }] }
            ],
            metrics: [
              { label: '阻带渐近滚降斜率', value: `-${20 * Nsel} dB / 十倍频程`, status: 'ok' },
              { label: '截止处增益 |H(jωc)|', value: p.family === 'butter' ? '0.707 (-3.01 dB)' : M.fmt(1 / Math.sqrt(1 + p.eps * p.eps), 3) },
              { label: '因果阶跃最大峰值', value: M.fmt(peakStep, 3), status: peakStep > 1.15 ? 'warn' : 'ok' },
              { label: '物理可实现性', value: '严格因果稳定 (左半平面极点✓)', status: 'ok' }
            ]
          };
        }
      },

      /* ==================== 6.4 ==================== */
      {
        id: '6.4',
        code: 'Ch6-(5)',
        level: '掌握',
        title: '6.4 一阶与二阶连续时间系统：阻尼比 ζ 三维响应曲面与波特图',
        summary: '在三维 (t 或 lgω, 阻尼比 ζ, 响应) 曲面上纵览欠阻尼振荡谐振、临界阻尼最快无超调与过阻尼单调缓变全貌！',
        camera: { azimuth: -0.88, elevation: 0.48, zoom: 1.0 },
        presets: [
          { label: '欠阻尼三维阶跃响应曲面 (ζ = 0.25 强超调)', values: { viewType: 'step3d', zeta: 0.25, wn: 2.5 } },
          { label: '最佳工程阻尼比 ζ = 0.707 (超调仅4.3%，无谐振峰!)', values: { viewType: 'step3d', zeta: 0.7, wn: 2.5 } },
          { label: '临界阻尼 ζ = 1.00 (最快单调无超调边界!)', values: { viewType: 'step3d', zeta: 1.0, wn: 2.5 } },
          { label: '三维幅频谐振峰曲面 |H(jω; ζ)| (ζ<0.707 出现谐振峰!)', values: { viewType: 'bode3d', zeta: 0.22, wn: 2.5 } }
        ],
        controls: [
          {
            key: 'viewType', label: '三维曲面观察模式', type: 'select', default: 'step3d',
            options: [
              { value: 'step3d', label: '时域三维曲面：阶跃响应 s(t; ζ) 随阻尼比演化' },
              { value: 'bode3d', label: '频域三维曲面：幅频谐振 |H(jω; ζ)| 随阻尼比演化' }
            ]
          },
          { key: 'zeta', label: '二阶系统阻尼比 ζ', type: 'range', min: 0.12, max: 1.6, step: 0.04, default: 0.28 },
          { key: 'wn', label: '无阻尼自然频率 ω_n', type: 'range', min: 1.2, max: 4.5, step: 0.1, default: 2.5, unit: 'rad/s' }
        ],
        theory: {
          formula: 'H(jω) = ω_n² / [(jω)² + 2ζω_n(jω) + ω_n²]；  仅当 0 < ζ < √2/2 ≈ 0.707 时幅频出现谐振峰 M_r = 1/(2ζ√(1-ζ²))！',
          objectives: [
            '【掌握】一阶系统时间常数 τ 与二阶系统自然频率 ω_n、阻尼比 ζ 对时域（超调量 σ%、调节时间）与频域（谐振峰 M_r、对数波特渐近线）的定量控制规律；',
            '【理解】为什么 0 < ζ < 1 时时域均欠阻尼振荡，但只有 ζ < 0.707 时频域才会隆起谐振峰！'
          ],
          guide3d: '三维曲面将整本教材的阻尼比参数曲线浓缩在一张立体地形图上：高亮琥珀色切线即为当前滑块 ζ 对应的响应切片，把 ζ 从 0.15 拖向 1.4 实时穿越欠阻尼山峰、0.707 平坦边界与临界阻尼分水岭！'
        },
        matlab(p) {
          return `% Ch6.4 二阶连续时间系统时域阶跃响应与频域 Bode 图综合分析
wn = ${M.fmt(p.wn, 2)}; zeta = ${M.fmt(p.zeta, 2)};
sys2 = tf([wn^2], [1, 2*zeta*wn, wn^2]);
sys1 = tf([1], [1/wn, 1]); % 对照：时间常数 tau = 1/wn 的一阶系统
subplot(2,1,1); step(sys2, 'g', sys1, '--b', 7); grid on; legend('二阶系统', '一阶系统对照');
subplot(2,1,2); bode(sys2); grid on;`;
        },
        quiz: {
          question: '对于标准二阶连续系统 H(jω) = ω_n² / [(jω)² + 2ζω_n(jω) + ω_n²]，若阻尼比取 ζ = 0.8，关于其时域阶跃响应与频域幅频特性，下列说法正确的是：',
          options: [
            '时域阶跃响应仍有轻微欠阻尼超调（因 0<ζ<1），但频域幅频曲线 |H(jω)| 单调下降【无谐振峰】（因 ζ > 0.707）！',
            '时域无超调，频域有谐振峰',
            '时域和频域都有强烈谐振超调',
            '系统为过阻尼系统'
          ],
          answer: 0,
          explanation: '高频考点！时域出现振荡超调的判据是 0 < ζ < 1；而频域 |H(jω)| 出现高于直流增益谐振峰的判据是 d|H|/dω=0 有正实解 ω_r = ω_n√(1-2ζ²)，要求 ζ < 1/√2 ≈ 0.707！'
        },
        compute(p) {
          const zetas = M.linspace(0.12, 1.6, 32);
          let xs, zm, activeSlice;

          if (p.viewType === 'step3d') {
            xs = M.linspace(0, 6.5, 48);
            zm = xs.map((t) => Float64Array.from(zetas, (z) => M.secondOrderStepCT(t, p.wn, z)));
            activeSlice = xs.map((t) => [t, p.zeta, M.secondOrderStepCT(t, p.wn, p.zeta)]);
          } else {
            xs = M.linspace(0, 6.5, 48);
            zm = xs.map((w) =>
              Float64Array.from(zetas, (z) => {
                const H = M.cDiv({ re: p.wn * p.wn, im: 0 }, { re: p.wn * p.wn - w * w, im: 2 * z * p.wn * w });
                return Math.min(4.2, M.cAbs(H));
              })
            );
            activeSlice = xs.map((w) => {
              const H = M.cDiv({ re: p.wn * p.wn, im: 0 }, { re: p.wn * p.wn - w * w, im: 2 * p.zeta * p.wn * w });
              return [w, p.zeta, Math.min(4.2, M.cAbs(H))];
            });
          }

          const ts2 = M.linspace(0, 6.5, 220);
          const pStep2 = ts2.map((t) => [t, M.secondOrderStepCT(t, p.wn, p.zeta)]);
          const pStep1 = ts2.map((t) => [t, 1 - Math.exp(-p.wn * t)]); // 1st-order comparison

          const logU = M.linspace(-1, 1, 180); // log10(w/wn) in [-1, 1] -> 0.1wn .. 10wn
          const pBodeMag = logU.map((lu) => {
            const u = Math.pow(10, lu);
            const mag = 1 / Math.hypot(1 - u * u, 2 * p.zeta * u);
            return [lu, 20 * Math.log10(mag)];
          });
          const pBodeAsym = [[-1, 0], [0, 0], [1, -40]];

          const overshoot = p.zeta < 1 ? Math.exp((-Math.PI * p.zeta) / Math.sqrt(1 - p.zeta * p.zeta)) * 100 : 0;
          const mr = p.zeta < Math.SQRT1_2 ? 1 / (2 * p.zeta * Math.sqrt(1 - p.zeta * p.zeta)) : 1.0;

          return {
            scene: {
              axes: {
                x: { min: 0, max: 6.5, label: p.viewType === 'step3d' ? '时间 t (s)' : '角频率 ω (rad/s)' },
                y: { min: 0.12, max: 1.6, label: '阻尼比 ζ (欠阻尼 → 过阻尼)' },
                z: { min: 0, max: p.viewType === 'step3d' ? 1.85 : 4.3, label: p.viewType === 'step3d' ? '阶跃响应 s(t)' : '幅频模 |H(jω)|' }
              },
              surfaces: [{ xGrid: xs, yGrid: zetas, zMatrix: zm, zMin: 0, zMax: p.viewType === 'step3d' ? 1.7 : 3.5, opacity: 0.72, wireframe: true }],
              curves: [{ points: activeSlice, color: '#fbbf24', width: 3.6, glow: true, label: `当前 ζ=${M.fmt(p.zeta, 2)} 切片` }],
              legend: [
                { color: '#38bdf8', label: p.viewType === 'step3d' ? '3D 阶跃响应曲面 s(t; ζ)' : '3D 幅频谐振曲面 |H(jω; ζ)|' },
                { color: '#fbbf24', label: `当前阻尼切片 ζ = ${M.fmt(p.zeta, 2)}` }
              ]
            },
            plots2d: [
              {
                title: '时域阶跃响应：二阶系统 [绿] vs 一阶系统 (τ=1/ω_n) [蓝虚]',
                xMin: 0, xMax: 6.5, yMin: 0, yMax: 1.8, xLabel: 't(s)',
                series: [
                  { points: pStep1, color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: pStep2, color: '#34d399', width: 2.3 }
                ]
              },
              {
                title: '对数波特图 Bode：精确曲线 [黄] vs 折线渐近线 (-40dB/dec) [灰虚]',
                xMin: -1, xMax: 1, yMin: -42, yMax: 18, xLabel: 'lg(ω/ωn)',
                series: [
                  { points: pBodeAsym, color: '#94a3b8', dashed: true, width: 1.6 },
                  { points: pBodeMag, color: '#fbbf24', width: 2.2 }
                ]
              }
            ],
            metrics: [
              { label: '阻尼分类状态', value: p.zeta < 0.98 ? '欠阻尼 (0 < ζ < 1)' : p.zeta <= 1.03 ? '临界阻尼 (ζ ≈ 1)' : '过阻尼 (ζ > 1)', status: 'ok' },
              { label: '阶跃超调量 σ%', value: `${M.fmt(overshoot, 1)} %`, status: overshoot > 25 ? 'warn' : 'ok' },
              { label: '频域谐振峰值 M_r', value: p.zeta < Math.SQRT1_2 ? `${M.fmt(mr, 2)} (${M.fmt(20 * Math.log10(mr), 1)} dB)` : '无谐振峰 (ζ ≥ 0.707)' },
              { label: '高频波特滚降斜率', value: '-40 dB/十倍频 (-12 dB/倍频)' }
            ]
          };
        }
      },

      /* ==================== 6.5 ==================== */
      {
        id: '6.5',
        code: 'Ch6-(6)(7)',
        level: '掌握',
        title: '6.5 一阶与二阶离散时间系统：极点坐标 (r, θ₀) 与时频综合分析',
        summary: '三维联动展示离散极点 z = r·e^{±jθ₀}、单位圆 2π 周期幅频响应 |H(e^{jω})| 与时域单位取样/阶跃响应！',
        presets: [
          { label: '二阶欠阻尼离散系统 (r=0.82, θ₀=0.35π)', values: { mode: 'ord2', r: 0.82, thetaPi: 0.35 } },
          { label: '一阶单调衰减离散系统 a=+0.72 (低通平滑)', values: { mode: 'ord1', r: 0.72, thetaPi: 0.0 } },
          { label: '一阶正负交替离散系统 a=-0.72 (高通振荡!)', values: { mode: 'ord1', r: 0.72, thetaPi: 1.0 } }
        ],
        controls: [
          {
            key: 'mode', label: '离散系统阶数', type: 'select', default: 'ord2',
            options: [
              { value: 'ord2', label: '二阶共轭复极点系统：p₁,₂ = r·e^{±jθ₀}' },
              { value: 'ord1', label: '一阶实极点系统：p = ±r (θ₀=0 为正实轴，θ₀=π 为负实轴!)' }
            ]
          },
          { key: 'r', label: '极点半径 r (控制衰减快慢与谐振锐度)', type: 'range', min: 0.25, max: 0.94, step: 0.03, default: 0.82 },
          { key: 'thetaPi', label: '极点幅角 θ₀ (×π rad，控制振荡与谐振频率)', type: 'range', min: 0.0, max: 1.0, step: 0.05, default: 0.35 }
        ],
        theory: {
          formula: '二阶离散冲激响应：h[n] = [rⁿ sin((n+1)θ₀) / sinθ₀] u[n]；  一阶阶跃响应：s[n] = [(1 - a^{n+1})/(1 - a)] u[n]',
          objectives: [
            '【掌握】一阶与二阶离散时间系统的时域振荡衰减包络 rⁿ、振荡角频率 θ₀ 与频域谐振特性的定量关系；',
            '【理解】对比连续系统：一阶连续系统绝不振荡，而一阶离散系统当极点 a < 0（θ₀=π）时会出现 (-|a|)ⁿ 正负交替高频振荡！'
          ],
          guide3d: '三维空间将离散系统三大要素集于一图：底面展示单位圆 |z|=1 与红色极点 ×，单位圆上方环绕着绿色的幅频响应皇冠 |H(e^{jω})|，右侧时间轨道伸展出离散冲激响应针状图 h[n]！'
        },
        matlab(p) {
          const th = p.thetaPi * Math.PI;
          return `% Ch6.5 一阶与二阶离散时间系统时域与频域综合分析
r = ${M.fmt(p.r, 2)}; theta0 = ${M.fmt(th, 3)};
${p.mode === 'ord2' ? 'a = [1, -2*r*cos(theta0), r^2]; b = [1 - 2*r*cos(theta0) + r^2];' : `pole = ${p.thetaPi >= 0.5 ? -p.r : p.r}; a = [1, -pole]; b = [1 - pole];`}
subplot(2,2,1); zplane(b, a); title('z平面零极点图');
subplot(2,2,2); [H, w] = freqz(b, a, 256, 'whole'); plot((w-pi)/pi, fftshift(abs(H)), 'g', 'LineWidth', 2); grid on; title('|H(e^{j\omega})|');
subplot(2,1,2); n = 0:28; stem(n, filter(b, a, ones(size(n))), 'filled'); grid on; title('离散单位阶跃响应 s[n]');`;
        },
        quiz: {
          question: '与一阶连续系统永远单调无超调不同，一阶因果稳定离散系统 H(z) = (1 - a) / (1 - a·z⁻¹) 在什么条件下其单位阶跃响应 s[n] 会出现上下交替超调振荡？',
          options: ['-1 < a < 0（极点位于单位圆内负实轴，对应数字频率 θ₀ = π！）', '0 < a < 1', 'a > 1', '一阶离散系统永远不会超调振荡'],
          answer: 0,
          explanation: 's[n] = (1 - a^{n+1})/(1 - a)·u[n]（此处分子归一化为 1-a 时稳态值为 1）：当 -1 < a < 0 时，a^{n+1} 正负交替，n=0 时 s[0]=1-a > 1 立刻产生超调并围绕 1 衰减交替收敛！'
        },
        compute(p) {
          const th0 = p.thetaPi * Math.PI;
          const poles = p.mode === 'ord2'
            ? [{ re: p.r * Math.cos(th0), im: p.r * Math.sin(th0) }, { re: p.r * Math.cos(th0), im: -p.r * Math.sin(th0) }]
            : [{ re: p.thetaPi >= 0.5 ? -p.r : p.r, im: 0 }];

          // Normalize gain so H(z=1)=1 unless near highpass
          let gain = 1;
          for (const pl of poles) gain *= Math.hypot(1 - pl.re, -pl.im);
          gain = Math.max(0.18, Math.min(1.5, gain));

          const ws = M.linspace(-Math.PI, Math.PI, 200);
          const crown = [];
          const pMag = [];
          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const z = M.cExp(0, w);
            const H = M.evalZeroPole(z, [], poles, gain);
            const mag = Math.min(3.8, M.cAbs(H));
            crown.push([Math.cos(w), Math.sin(w), mag]);
            pMag.push([w / Math.PI, mag]);
          }

          // Compute h[n] and step s[n]
          const pH = [], pS = [];
          let ym1 = 0, ym2 = 0, accS = 0;
          const a1 = p.mode === 'ord2' ? -2 * p.r * Math.cos(th0) : -poles[0].re;
          const a2 = p.mode === 'ord2' ? p.r * p.r : 0;
          for (let n = 0; n <= 26; n++) {
            const xn = n === 0 ? 1 : 0;
            const yn = gain * xn - a1 * ym1 - a2 * ym2;
            accS += yn;
            pH.push([n, yn]);
            pS.push([n, accS]);
            ym2 = ym1;
            ym1 = yn;
          }

          return {
            scene: {
              axes: {
                x: { min: -1.5, max: 1.5, label: '复平面实轴 Re{z}' },
                y: { min: -1.5, max: 1.5, label: '复平面虚轴 Im{z}' },
                z: { min: 0, max: 3.9, label: '单位圆幅频高度 |H(e^{jω})|' }
              },
              planes: [{ type: 'circle', cx: 0, cy: 0, z: 0, radius: 1.0, color: '#fbbf24', width: 2.2 }],
              ribbons: [{ points: crown, baseZ: 0, color: 'rgba(52,211,153,0.25)' }],
              curves: [{ points: crown, color: '#34d399', width: 3.2, glow: true, label: '|H(e^{jω})|' }],
              markers: poles.map((pl, idx) => ({ pos: [pl.re, pl.im, 0.04], shape: 'pole', color: '#f43f5e', size: 7.5, label: idx === 0 ? `p=${M.fmt(p.r, 2)}∠${M.fmt(p.thetaPi, 2)}π` : '' })),
              legend: [
                { color: '#fbbf24', label: '单位圆 |z|=1' },
                { color: '#f43f5e', label: '系统极点 p', type: 'pole' },
                { color: '#34d399', label: '单位圆幅频皇冠 |H(e^{jω})|' }
              ]
            },
            plots2d: [
              {
                title: '时域响应：单位取样响应 h[n] [蓝针] 与阶跃响应 s[n] [绿线]',
                xMin: 0, xMax: 26, yMin: -1.3, yMax: 1.8, xLabel: 'n',
                series: [
                  { points: pH, type: 'stems', color: '#38bdf8', radius: 2.8 },
                  { points: pS, color: '#34d399', width: 2.1 }
                ]
              },
              { title: '展开幅频特性 |H(e^{jω})| (-π ~ +π)', xMin: -1, xMax: 1, yMin: 0, yMax: 3.9, xLabel: '×π', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.2 }] }
            ],
            metrics: [
              { label: '极点模长 r', value: `${M.fmt(p.r, 2)} (<1 因果稳定✓)`, status: 'ok' },
              { label: '包络衰减时间常数', value: `${M.fmt(-1 / Math.log(p.r), 2)} 采样拍` },
              { label: '振荡数字频率', value: p.mode === 'ord2' ? `${M.fmt(p.thetaPi, 2)}π rad/sample` : p.thetaPi >= 0.5 ? 'π (正负交替!)' : '0 (单调无振荡)' },
              { label: '阶跃稳态终值 s[∞]', value: M.fmt(pS[pS.length - 1][1], 3) }
            ]
          };
        }
      }
    ]
  });
})();
