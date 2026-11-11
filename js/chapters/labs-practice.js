/**
 * 课内实践：5 大必做实验项目 (In-class Practice Projects 1~5)
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 14~18 页全部 18 学时课内实验要求
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'labs',
    number: '课内实验',
    title: '课内实践：必做实验项目一～五 (18学时)',
    shortTitle: '课内实践 (实验一~五)',
    weeks: '第 6, 8, 10, 12, 14 周 · 18 学时',
    syllabusItems: '实验一:信号与系统表示 | 实验二:卷积和/阶跃/状态变量 | 实验三:CTFT与频响 | 实验四:DTFS与DTFT应用 | 实验五:拉氏变换与滤波器设计',
    cases: [
      /* ==================== 实验项目一 ==================== */
      {
        id: 'L.1',
        code: '实验项目一 (2学时·必做)',
        level: '必做实验',
        title: '实验一：信号与系统的表示方法综合实验台 (CT & DT + MATLAB)',
        summary: '对标大纲实验项目一：综合生成连续/离散复合调幅扫频与奇异信号，验证算子变换并一键导出标准 MATLAB 实验代码！',
        presets: [
          { label: '包络调幅阻尼余弦 + 离散抽样序列', values: { wave: 'amExp', f0: 2.4, decay: 0.45, Ts: 0.25 } },
          { label: '线性调频 Chirp 扫频信号表示', values: { wave: 'chirp', f0: 1.5, decay: 0.6, Ts: 0.20 } },
          { label: '阶跃门控分段复合信号 u(t+2)-u(t-2)', values: { wave: 'gated', f0: 3.0, decay: 0.3, Ts: 0.25 } }
        ],
        controls: [
          {
            key: 'wave', label: '实验复合信号模型', type: 'select', default: 'amExp',
            options: [
              { value: 'amExp', label: '因果阻尼包络正弦 e^(-αt)cos(ω₀t)u(t)' },
              { value: 'chirp', label: '线性调频扫频信号 cos(ω₀t + βt²)' },
              { value: 'gated', label: '奇异阶跃门控波 [u(t+2)-u(t-2)]·cos(ω₀t)' }
            ]
          },
          { key: 'f0', label: '基准角频率 ω₀', type: 'range', min: 1.0, max: 5.0, step: 0.2, default: 2.4, unit: 'rad/s' },
          { key: 'decay', label: '包络参数 α / 调频斜率 β', type: 'range', min: 0.15, max: 1.2, step: 0.05, default: 0.45 },
          { key: 'Ts', label: '离散采样步长 T', type: 'range', min: 0.15, max: 0.5, step: 0.05, default: 0.25, unit: 's' }
        ],
        theory: {
          formula: '实验一目标：掌握使用 MATLAB 向量化语法 (plot / stem / heaviside / filter) 表示连续与离散信号与系统',
          objectives: [
            '【实验内容(1)】连续时间信号（阶跃、指数、调制、扫频）与连续系统的数值仿真表示；',
            '【实验内容(2)】离散时间序列生成、基本时域运算及实验报告波形对比分析。'
          ],
          guide3d: '三维实验台同步渲染：连续激励信号 x(t)、离散表示序列 x[n] 以及经一阶平滑系统后的响应 y(t) 三维轨道；切换到右侧【MATLAB 同步代码】标签页即可直接复制完整实验一源码到 MATLAB R2024b 运行！'
        },
        matlab(p) {
          return `%% 深圳技术大学《信号与系统》实验项目一：信号与系统的表示方法 (2学时·验证性)
clear; clc; close all;
t = -3:0.005:5;
T = ${M.fmt(p.Ts, 2)}; n_t = -3:T:5;
w0 = ${M.fmt(p.f0, 2)}; alpha = ${M.fmt(p.decay, 2)};

% 1. 连续时间信号与离散时间信号表示
${p.wave === 'amExp' ? 'x_ct = exp(-alpha*t) .* cos(w0*t) .* (t >= 0);\nx_dt = exp(-alpha*n_t) .* cos(w0*n_t) .* (n_t >= 0);' :
  p.wave === 'chirp' ? 'x_ct = cos(w0*t + alpha*t.^2);\nx_dt = cos(w0*n_t + alpha*n_t.^2);' :
  'x_ct = ((t >= -2) - (t >= 2)) .* cos(w0*t);\nx_dt = ((n_t >= -2) - (n_t >= 2)) .* cos(w0*n_t);'}

% 2. 通过一阶连续与离散系统响应对比
sys_ct = tf([1], [0.6, 1]);
y_ct = lsim(sys_ct, x_ct, t);
y_dt = filter([T/(0.6+T)], [1, -0.6/(0.6+T)], x_dt);

figure('Color','w');
subplot(2,1,1); plot(t, x_ct, 'b', 'LineWidth', 1.6); hold on; stem(n_t, x_dt, 'r', 'filled');
grid on; legend('连续信号 x(t)', '离散序列 x[n]'); title('实验一(1)(2)：连续与离散信号的表示');
subplot(2,1,2); plot(t, y_ct, 'g', 'LineWidth', 1.8); hold on; stem(n_t, y_dt, 'm');
grid on; legend('连续系统响应 y(t)', '离散差分近似响应 y[n]'); title('系统输入输出仿真验证');`;
        },
        quiz: {
          question: '在 MATLAB 中绘制离散时间序列 x[n] 的针状图（火柴杆图）与连续时间信号近似光滑曲线，应分别使用哪两个核心绘图函数？',
          options: ['离散序列用 stem(n, x)，连续信号用 plot(t, x)', '离散序列用 plot(n, x)，连续信号用 bar(t, x)', '两者都只用 stairs()', '离散序列用 surf()'],
          answer: 0,
          explanation: '在 MATLAB 信号与系统实验中，plot(t, x) 用高密度采样折线描绘连续信号 x(t)，而 stem(n, x) 专门绘制仅在整数序号有定义的离散序列针状图！'
        },
        compute(p) {
          const xFun = (t) => {
            if (p.wave === 'amExp') return t >= 0 ? Math.exp(-p.decay * t) * Math.cos(p.f0 * t) : 0;
            if (p.wave === 'chirp') return Math.cos(p.f0 * t + p.decay * t * t);
            return (t >= -2 && t <= 2 ? 1 : 0) * Math.cos(p.f0 * t);
          };

          const ts = M.linspace(-3, 5, 320);
          const dt = ts[1] - ts[0];
          const cIn = [], cSys = [];
          const pIn = [], pSys = [];
          let y = 0;
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const xv = xFun(t);
            y += ((xv - y) / 0.55) * dt;
            cIn.push([t, 1.2, xv]);
            cSys.push([t, -1.2, y]);
            pIn.push([t, xv]);
            pSys.push([t, y]);
          }

          const sDT = [], pDT = [];
          for (let t = -3; t <= 5.001; t += p.Ts) {
            const tr = Math.round(t * 1000) / 1000;
            const v = xFun(tr);
            sDT.push([tr, 0, v]);
            pDT.push([tr, v]);
          }

          return {
            scene: {
              axes: {
                x: { min: -3, max: 5, label: '时间 t / nT (s)' },
                y: { min: -1.8, max: 1.8, label: '实验通道', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? '连续x(t)' : v < -0.5 ? '系统输出y(t)' : '离散x[n]') },
                z: { min: -1.3, max: 1.3, label: '幅值' }
              },
              ribbons: [{ points: cSys, baseZ: 0, color: 'rgba(52,211,153,0.2)' }],
              curves: [
                { points: cIn, color: '#38bdf8', width: 2.3, label: '连续信号 x(t)' },
                { points: cSys, color: '#34d399', width: 3.0, glow: true, shadowXZ: true, label: '系统响应 y(t)' }
              ],
              stems: [{ points: sDT, baseZ: 0, color: '#fbbf24', width: 1.9, radius: 3.3, label: '离散序列 x[n]' }],
              legend: [
                { color: '#38bdf8', label: '连续表示 x(t)' },
                { color: '#fbbf24', label: '离散表示 x[n]' },
                { color: '#34d399', label: '系统输出 y(t)' }
              ]
            },
            plots2d: [
              { title: '连续信号 plot(t,x) [蓝] 与离散序列 stem(n,x) [黄]', xMin: -3, xMax: 5, yMin: -1.25, yMax: 1.25, xLabel: 't', series: [{ points: pIn, color: '#38bdf8', width: 1.9 }, { points: pDT, type: 'stems', color: '#fbbf24', radius: 2.6 }] },
              { title: '连续系统响应 lsim 输出 y(t)', xMin: -3, xMax: 5, yMin: -1.25, yMax: 1.25, xLabel: 't', series: [{ points: pSys, color: '#34d399', fill: 'rgba(52,211,153,0.16)', width: 2.2 }] }
            ],
            metrics: [
              { label: '实验项目性质', value: '必做 · 验证性 · 2学时', status: 'ok' },
              { label: '离散样本点数', value: `${sDT.length} 点 (步长 ${M.fmt(p.Ts, 2)}s)` },
              { label: '核心 MATLAB 函数', value: 'plot, stem, lsim, filter' },
              { label: '最大输出幅值', value: M.fmt(Math.max(...pSys.map((q) => Math.abs(q[1]))), 3) }
            ]
          };
        }
      },

      /* ==================== 实验项目二 ==================== */
      {
        id: 'L.2',
        code: '实验项目二 (4学时·必做)',
        level: '必做实验',
        title: '实验二：线性时不变系统的特性 —— 卷积和、阶跃响应与三维状态变量相轨迹',
        summary: '对标大纲实验项目二全部三项内容：(1) 卷积和；(2) 阶跃响应 s[n]；(3) 差分方程模拟与二维状态变量 (q₁[n], q₂[n]) 随时间 n 的三维螺旋相空间轨迹！',
        camera: { azimuth: -0.82, elevation: 0.46, zoom: 1.0 },
        presets: [
          { label: '二阶欠阻尼离散状态空间螺旋收敛轨迹 (r=0.86, θ=0.35π)', values: { r: 0.86, thPi: 0.35, q10: 1.2, q20: -0.6, uStepAmp: 1.0 } },
          { label: '纯初始状态相平面自由涡旋收敛 (阶跃激励=0)', values: { r: 0.90, thPi: 0.28, q10: 1.5, q20: 0.8, uStepAmp: 0.0 } },
          { label: '临界过阻尼快速收敛至稳态平衡点', values: { r: 0.55, thPi: 0.15, q10: -1.0, q20: 0.5, uStepAmp: 1.0 } }
        ],
        controls: [
          { key: 'r', label: '系统极点模长 r (特征值模长)', type: 'range', min: 0.4, max: 0.96, step: 0.02, default: 0.86 },
          { key: 'thPi', label: '系统振荡频率角 θ₀ (×π rad)', type: 'range', min: 0.1, max: 0.8, step: 0.05, default: 0.35 },
          { key: 'q10', label: '初始状态变量 q₁[0]', type: 'range', min: -1.8, max: 1.8, step: 0.2, default: 1.2 },
          { key: 'uStepAmp', label: '阶跃激励幅值 u[n]', type: 'range', min: 0.0, max: 1.5, step: 0.25, default: 1.0 }
        ],
        theory: {
          formula: '状态空间方程：q[n+1] = A · q[n] + B · x[n],   y[n] = C · q[n] + D · x[n]；  阶跃响应 s[n] = u[n] * h[n] = ∑_{k=0}^n h[k]',
          objectives: [
            '【实验内容(1)(2)】利用 conv() 与 filter() 理解并掌握离散卷积和与单位阶跃响应 s[n] 的关系（h[n] = s[n] - s[n-1]）；',
            '【实验内容(3)】掌握差分方程的直接 II 型状态变量（State-Space）描述及其内部能量相轨迹物理意义！'
          ],
          guide3d: '三维相空间轨迹 (时刻 n, 状态变量 q₁[n], 状态变量 q₂[n])：系统内部两个延时器存储的状态向量随时间 n 螺旋盘旋最终收敛至稳态平衡不动点！点击【频域侧视】即可直接观察自动控制中的二维状态相平面图 (q₁, q₂)！'
        },
        matlab(p) {
          return `%% 深圳技术大学《信号与系统》实验项目二：LTI 系统特性与状态变量描述 (4学时·验证性)
clear; clc; close all;
r = ${M.fmt(p.r, 2)}; th = ${M.fmt(p.thPi * Math.PI, 3)};
a1 = -2*r*cos(th); a2 = r^2; b0 = 1 + a1 + a2;

% (1) 单位取样响应 h[n] 与卷积和 conv 验证
N = 35; n = 0:N-1;
h = impz([b0], [1, a1, a2], N)';
x_step = ${M.fmt(p.uStepAmp, 2)} * ones(1, N);
y_conv = conv(x_step, h); y_conv = y_conv(1:N); % 卷积和求阶跃响应

% (2) & (3) 状态变量方程 q[n+1] = A*q[n] + B*x[n] 递推模拟
A_mat = [0, 1; -a2, -a1]; B_mat = [0; 1]; C_mat = [0, b0];
q = zeros(2, N); q(:,1) = [${M.fmt(p.q10, 2)}; -0.6];
y_ss = zeros(1, N);
for k = 1:N-1
  y_ss(k) = C_mat * q(:,k);
  q(:,k+1) = A_mat * q(:,k) + B_mat * x_step(k);
end
y_ss(N) = C_mat * q(:,N);

figure('Color','w');
subplot(1,2,1); stem(n, y_conv, 'g', 'filled'); hold on; plot(n, y_ss, '--r', 'LineWidth', 1.6);
grid on; legend('卷积和零状态阶跃响应', '含初态状态空间输出'); title('实验二(1)(2)：卷积和与阶跃响应');
subplot(1,2,2); plot3(0:N-1, q(1,:), q(2,:), '-ob', 'LineWidth', 1.6); grid on;
xlabel('n'); ylabel('q_1[n]'); zlabel('q_2[n]'); title('实验二(3)：三维状态变量演化轨迹');`;
        },
        quiz: {
          question: '对于离散 LTI 系统，已知其单位阶跃响应为 s[n]，则由 s[n] 直接求取单位取样响应 h[n] 的公式为：',
          options: ['h[n] = s[n] - s[n - 1]（一阶后向差分！）', 'h[n] = ∑_{k=-∞}^n s[k]', 'h[n] = s[n + 1] + s[n]', 'h[n] = n · s[n]'],
          answer: 0,
          explanation: '因为 δ[n] = u[n] - u[n-1]，由线性时不变性直接得 h[n] = T{u[n] - u[n-1]} = s[n] - s[n-1]！反之 s[n] = ∑_{k=-∞}^n h[k]。'
        },
        compute(p) {
          const th = p.thPi * Math.PI;
          const a1 = -2 * p.r * Math.cos(th);
          const a2 = p.r * p.r;
          const b0 = 1 + a1 + a2;

          const N = 34;
          const stateTraj = [];
          const pStep = [], pH = [], pOut = [];

          let q1 = p.q10, q2 = -0.5;
          let zs1 = 0, zs2 = 0;
          let hPrev = 0;

          for (let n = 0; n < N; n++) {
            stateTraj.push([n, q1, q2]);
            const yOut = b0 * q2;
            pOut.push([n, yOut]);

            // Next state: q1[n+1] = q2[n], q2[n+1] = -a2*q1[n] - a1*q2[n] + u[n]
            const nq1 = q2;
            const nq2 = -a2 * q1 - a1 * q2 + p.uStepAmp;
            q1 = nq1;
            q2 = nq2;

            // Zero-state unit step s[n] and h[n] = s[n] - s[n-1]
            const sVal = b0 * 1.0 - a1 * zs1 - a2 * zs2;
            pStep.push([n, sVal]);
            pH.push([n, sVal - hPrev]);
            hPrev = sVal;
            zs2 = zs1;
            zs1 = sVal;
          }

          return {
            scene: {
              axes: {
                x: { min: 0, max: N - 1, label: '离散时刻步数 n' },
                y: { min: -2.2, max: 2.5, label: '状态变量 q₁[n]' },
                z: { min: -2.2, max: 2.5, label: '状态变量 q₂[n]' }
              },
              curves: [
                { points: stateTraj, color: '#38bdf8', width: 2.8, glow: true, shadowXZ: true, shadowYZ: true, pickable: true, label: '状态向量轨迹 q[n]' }
              ],
              markers: [
                { pos: stateTraj[0], shape: 'diamond', color: '#f43f5e', size: 7.5, label: '初态 q[0]' },
                { pos: stateTraj[N - 1], shape: 'dot', color: '#34d399', size: 7, label: '稳态平衡点 q[∞]' }
              ],
              legend: [
                { color: '#38bdf8', label: '3D 状态空间相轨迹 (n, q₁[n], q₂[n])' },
                { color: '#f43f5e', label: '初始状态点 q[0]' },
                { color: '#34d399', label: '渐近平衡点 q[∞]' }
              ]
            },
            plots2d: [
              { title: '零状态阶跃响应 s[n]=u[n]*h[n] [绿] 与单位取样响应 h[n]=s[n]-s[n-1] [蓝针]', xMin: 0, xMax: N - 1, yMin: -0.9, yMax: 1.8, xLabel: 'n', series: [{ points: pH, type: 'stems', color: '#38bdf8', radius: 2.6 }, { points: pStep, color: '#34d399', width: 2.2 }] },
              { title: '状态变量方程全响应输出 y[n] = C·q[n]', xMin: 0, xMax: N - 1, yMin: -1.8, yMax: 2.2, xLabel: 'n', series: [{ points: pOut, type: 'stems', color: '#fbbf24' }] }
            ],
            metrics: [
              { label: '实验项目性质', value: '必做 · 验证性 · 4学时', status: 'ok' },
              { label: '状态矩阵特征值 |λ|', value: `r = ${M.fmt(p.r, 2)} (< 1 渐近稳定✓)` },
              { label: '平衡状态 q_eq', value: M.fmt(p.uStepAmp / (1 + a1 + a2), 2) },
              { label: '阶跃稳态增益 s[∞]', value: '1.000' }
            ]
          };
        }
      },

      /* ==================== 实验项目三 ==================== */
      {
        id: 'L.3',
        code: '实验项目三 (4学时·必做)',
        level: '必做实验',
        title: '实验三：连续时间的傅里叶变换 —— 由冲激响应数值积分与微分方程解析求频响对比',
        summary: '对标大纲实验项目三：对比【由截断冲激响应 h(t) 数值积分求 H_num(jω)】与【由微分方程系数 freqs(b,a,w) 求解析 H(jω)】的吻合度与截断效应！',
        presets: [
          { label: '长截断窗口 T_win=8s (数值FT与解析freqs高度重合!)', values: { Twin: 8.0, wn: 2.8, zeta: 0.3 } },
          { label: '短截断窗口 T_win=2.0s (观察冲激响应未衰减完导致的频谱振荡误差!)', values: { Twin: 2.0, wn: 2.8, zeta: 0.25 } },
          { label: '高阻尼快速衰减系统 (短窗 T_win=3s 已高度精确)', values: { Twin: 3.0, wn: 3.0, zeta: 0.85 } }
        ],
        controls: [
          { key: 'Twin', label: '冲激响应数值积分截断时长 T_win', type: 'range', min: 1.2, max: 9.0, step: 0.4, default: 6.0, unit: 's' },
          { key: 'wn', label: '微分方程自然频率 ω_n', type: 'range', min: 1.5, max: 4.5, step: 0.3, default: 2.8, unit: 'rad/s' },
          { key: 'zeta', label: '微分方程阻尼比 ζ', type: 'range', min: 0.18, max: 1.1, step: 0.05, default: 0.3 }
        ],
        theory: {
          formula: '方法一：H(jω) = ∫_0^∞ h(t)e^{-jωt} dt [数值积分]；   方法二：H(jω) = [∑ b_k(jω)^k] / [∑ a_k(jω)^k] [freqs 解析法]',
          objectives: [
            '【实验内容(1)】掌握由冲激响应 h(t) 通过数值积分计算 LTI 系统频率响应的工作原理及截断时长 T_win 误差分析；',
            '【实验内容(2)】掌握利用 MATLAB `freqs(b, a, w)` 直接由微分方程系数向量求解连续系统频率响应的标准方法。'
          ],
          guide3d: '三维复空间同步叠加两条复频响螺旋：绿色实线为微分方程解析精确解 H_exact(jω)，琥珀色虚线为对 [0, T_win] 内冲激响应数值积分所得 H_num(jω)——缩短 T_win 立即看清时域截断引发的吉布斯频谱波纹！'
        },
        matlab(p) {
          return `%% 深圳技术大学《信号与系统》实验项目三：连续时间的傅里叶变换求系统频率响应 (4学时)
clear; clc; close all;
wn = ${M.fmt(p.wn, 2)}; zeta = ${M.fmt(p.zeta, 2)}; Twin = ${M.fmt(p.Twin, 2)};
b = [wn^2]; a = [1, 2*zeta*wn, wn^2];

% 方法 (1)：由冲激响应 h(t) 数值积分计算频率响应
dt = 0.01; t = 0:dt:Twin;
h = impulse(tf(b, a), t)';
w = -8:0.05:8;
H_num = (h * exp(-1j * t' * w)) * dt;     % 矩阵乘法实现高速 CTFT 数值积分!

% 方法 (2)：直接由微分方程系数调用 freqs 解析求解
H_exact = freqs(b, a, w);

figure('Color','w');
subplot(2,1,1); plot(w, abs(H_exact), 'g', 'LineWidth', 2); hold on;
plot(w, abs(H_num), '--r', 'LineWidth', 1.6); grid on;
legend('微分方程解析解 freqs(b,a,w)', sprintf('冲激响应积分 (T_{win}=%.1fs)', Twin));
title('实验三：两种方法求解连续系统幅频响应对比');
subplot(2,1,2); plot(t, h, 'b', 'LineWidth', 1.8); grid on; title('被截断的冲激响应 h(t)');`;
        },
        quiz: {
          question: '在 MATLAB 中已知连续时间系统微分方程 d²y/dt² + 3 dy/dt + 2 y(t) = 5 x(t)，直接计算角频率向量 w 处连续频率响应 H(jω) 的内置函数及系数参数为：',
          options: ['freqs([5], [1, 3, 2], w)', 'freqz([5], [1, 3, 2], w)', 'fft([5], [1, 3, 2])', 'conv([5], [1, 3, 2])'],
          answer: 0,
          explanation: '务必区分 freqs 与 freqz！连续系统（s 域虚轴 jω）使用 freqs(b, a, w)（末字母 s 代表 Laplace s 平面）；离散系统（单位圆 e^{jω}）使用 freqz(b, a, w)（末字母 z 代表 z 平面）！'
        },
        compute(p) {
          const ts = M.linspace(0, p.Twin, 220);
          const hArr = ts.map((t) => M.secondOrderImpulseCT(t, p.wn, p.zeta));
          const ws = M.linspace(-8, 8, 220);
          const Hnum = M.computeCTFT(ts, hArr, ws);

          const cExact3 = [], cNum3 = [];
          const pExactMag = [], pNumMag = [];
          let maxDiff = 0;

          for (let k = 0; k < ws.length; k++) {
            const w = ws[k];
            const He = M.cDiv({ re: p.wn * p.wn, im: 0 }, { re: p.wn * p.wn - w * w, im: 2 * p.zeta * p.wn * w });
            const magE = M.cAbs(He);
            const magN = Hnum.mag[k];
            maxDiff = Math.max(maxDiff, Math.abs(magE - magN));
            cExact3.push([(w / 8) * 4.5, He.re, He.im]);
            cNum3.push([(w / 8) * 4.5, Hnum.re[k], Hnum.im[k]]);
            pExactMag.push([w, magE]);
            pNumMag.push([w, magN]);
          }

          const tsFull = M.linspace(0, 9, 220);
          const pHFull = tsFull.map((t) => [t, M.secondOrderImpulseCT(t, p.wn, p.zeta)]);

          return {
            scene: {
              axes: {
                x: { min: -4.5, max: 4.5, label: '角频率 ω (-8 ~ +8 rad/s)' },
                y: { min: -2.2, max: 2.2, label: '实部 Re{H(jω)}' },
                z: { min: -2.5, max: 2.5, label: '虚部 Im{H(jω)}' }
              },
              curves: [
                { points: cExact3, color: '#34d399', width: 3.1, glow: true, shadowXZ: true, label: '微分方程解析 H(jω)' },
                { points: cNum3, color: '#fbbf24', width: 2.2, dashed: true, label: '冲激响应数值积分 H_num(jω)' }
              ],
              legend: [
                { color: '#34d399', label: '方法(2) 微分方程解析解 freqs' },
                { color: '#fbbf24', label: `方法(1) h(t) 数值积分 (T=${M.fmt(p.Twin, 1)}s)` }
              ]
            },
            plots2d: [
              {
                title: '幅频响应对比：微分方程解析解 [绿] vs 冲激响应积分 [黄虚]',
                xMin: -8, xMax: 8, yMin: 0, yMax: 2.8, xLabel: 'ω',
                series: [
                  { points: pExactMag, color: '#34d399', width: 2.3 },
                  { points: pNumMag, color: '#fbbf24', dashed: true, width: 1.9 }
                ]
              },
              {
                title: `时域冲激响应 h(t) 及积分截断线 T_win = ${M.fmt(p.Twin, 1)}s [红线右侧被舍弃]`,
                xMin: 0, xMax: 9, yMin: -1.8, yMax: 2.5, xLabel: 't(s)',
                vBands: [{ from: 0, to: p.Twin, color: 'rgba(56,189,248,0.14)' }],
                series: [{ points: pHFull, color: '#38bdf8', width: 2.0 }],
                vLines: [{ x: p.Twin, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '实验项目性质', value: '必做 · 验证性 · 4学时', status: 'ok' },
              { label: '两种方法最大幅频偏差', value: M.fmt(maxDiff, 4), status: maxDiff < 0.05 ? 'ok' : 'warn' },
              { label: '5τ 衰减参考时长', value: `${M.fmt(5 / (p.zeta * p.wn), 2)} s` },
              { label: '截断充足性判别', value: p.Twin >= 4.5 / (p.zeta * p.wn) ? '窗口充足，误差极小 ✓' : '截断过早，存在频谱波纹!', status: p.Twin >= 4.5 / (p.zeta * p.wn) ? 'ok' : 'warn' }
            ]
          };
        }
      },

      /* ==================== 实验项目四 ==================== */
      {
        id: 'L.4',
        code: '实验项目四 (4学时·必做)',
        level: '必做实验',
        title: '实验四：离散时间的傅里叶变换 —— DTFS/DFT 频谱采样与连续 DTFT 包络应用',
        summary: '对标大纲实验项目四：揭示有限长序列补零至 M 点计算 DFT/DTFS 恰是对连续 DTFT 频谱包络在 2πk/M 处的等距频域采样，应用于双频信号分辨！',
        presets: [
          { label: 'L=16 观测长，M=16 点谱采样 (双相近频率可初步看到)', values: { L: 16, Mpad: 16, dwPi: 0.18 } },
          { label: '补零加密至 M=64 点 DFT (清晰描绘连续 DTFT 包络!)', values: { L: 16, Mpad: 64, dwPi: 0.18 } },
          { label: '两频率靠得太近 Δω=0.06π + 短窗 L=12 (单峰无法分辨!)', values: { L: 12, Mpad: 64, dwPi: 0.06 } },
          { label: '增加真实数据窗长 L=32 (成功分离双频谱峰!)', values: { L: 32, Mpad: 64, dwPi: 0.08 } }
        ],
        controls: [
          { key: 'L', label: '真实信号观测点数 L (决定物理频率分辨率!)', type: 'range', min: 8, max: 36, step: 4, default: 16 },
          { key: 'Mpad', label: '补零后 DTFS/DFT 计算点数 M (决定频域采样密度)', type: 'range', min: 16, max: 64, step: 16, default: 32 },
          { key: 'dwPi', label: '双音信号频率间隔 Δω (×π rad)', type: 'range', min: 0.04, max: 0.35, step: 0.02, default: 0.18 }
        ],
        theory: {
          formula: 'X_DFT[k] = N·a_k = X(e^{jω})|_{ω = 2πk/M}；  补零提高【栅栏采样密度】，增加真实长度 L 才提高【物理主瓣分辨率】！',
          objectives: [
            '【实验内容(1)】理解离散时间傅里叶级数（DTFS）与离散时间傅里叶变换（DTFT）的采样对应关系；',
            '【实验内容(2)】掌握利用 `fft(x, M)` 进行双频信号频谱分析的应用，辨析“补零加密显示”与“增加观测长度提升物理分辨率”的本质区别！'
          ],
          guide3d: '三维空间将连续 DTFT 幅度谱绘制为绿色连续光带，将 M 点 DTFS/FFT 离散谱线绘制为黄色采样针：调大 M 只会让黄针在绿带上排得更密，但只有调大真实观测长度 L 才能让两座融合的山峰真正劈开！'
        },
        matlab(p) {
          return `%% 深圳技术大学《信号与系统》实验项目四：DTFS 与 DTFT 计算及双频分辨应用 (4学时)
clear; clc; close all;
L = ${Math.round(p.L)}; M = max(L, ${Math.round(p.Mpad)});
n = 0:L-1;
w1 = 0.30*pi; w2 = (0.30 + ${M.fmt(p.dwPi, 2)})*pi;
x = cos(w1 * n) + cos(w2 * n);            % L 点有限长双频离散信号

% 1. 高密度连续 DTFT 包络
w = linspace(0, pi, 512);
X_dtft = arrayfun(@(ww) sum(x .* exp(-1j*ww*n)), w);

% 2. M 点周期延拓 DTFS / FFT 频谱采样点
X_dft = fft(x, M);
wk = (0:M/2) * (2*pi / M);

figure('Color','w');
plot(w/pi, abs(X_dtft), 'g', 'LineWidth', 2); hold on;
stem(wk/pi, abs(X_dft(1:M/2+1)), 'r', 'filled'); grid on;
xlabel('\omega / \pi'); ylabel('|X(e^{j\omega})|');
legend('连续 DTFT 包络', sprintf('%d 点 FFT/DTFS 频域采样', M));
title(sprintf('实验四：观测点数 L=%d, 双频间隔 \\Delta\\omega=%.2f\\pi', L, ${M.fmt(p.dwPi, 2)}));`;
        },
        quiz: {
          question: '在对一段长度固定为 L = 16 点的双频余弦序列做频谱分析时，如果在序列末尾补 48 个零凑成 M = 64 点再做 FFT/DTFS，会产生什么效果？',
          options: [
            '在原连续 DTFT 曲线上加密采样点（减小栅栏效应，更看清包络形状），但主瓣宽度仍为 4π/16 不变，不能提高物理频率分辨率！',
            '主瓣宽度缩窄为原来的 1/4，物理分辨率提高 4 倍',
            '完全消除旁瓣泄漏',
            '频谱幅度增大 4 倍'
          ],
          answer: 0,
          explanation: '补零并未补充任何新的真实时域信号信息，因此序列的连续 DTFT X(e^{jω}) 完全未变！M 点 FFT 只是在同一个 X(e^{jω}) 上以更密的间距 2π/64 取样而已。'
        },
        compute(p) {
          const L = Math.round(p.L);
          const Mpad = Math.max(L, Math.round(p.Mpad));
          const w1 = 0.28 * Math.PI;
          const w2 = (0.28 + p.dwPi) * Math.PI;

          const nArr = [], xArr = [];
          for (let n = 0; n < L; n++) {
            nArr.push(n);
            xArr.push(Math.cos(w1 * n) + Math.cos(w2 * n));
          }

          const ws = M.linspace(0, Math.PI, 260);
          const dtft = M.computeDTFT(nArr, xArr, ws);

          const wkArr = [];
          for (let k = 0; k <= Math.floor(Mpad / 2); k++) wkArr.push((M.TWO_PI * k) / Mpad);
          const dft = M.computeDTFT(nArr, xArr, wkArr);

          const scaleZ = 1 / (L * 0.55);
          const cEnv3 = ws.map((w, i) => [(w / Math.PI) * 8 - 4, 0.8, dtft.mag[i] * scaleZ]);
          const sDft3 = wkArr.map((w, i) => [(w / Math.PI) * 8 - 4, 0.8, dft.mag[i] * scaleZ]);
          const sTime3 = nArr.map((n, i) => [(n / Math.max(1, Mpad - 1)) * 8 - 4, -1.1, xArr[i] * 0.65]);

          const resolved = p.dwPi * Math.PI >= (2 * Math.PI) / L;

          return {
            scene: {
              axes: {
                x: { min: -4, max: 4, label: '序列序号 n (0~M)  /  数字频率 ω (0 ~ π)' },
                y: { min: -1.7, max: 1.6, label: '补零序列层 / DTFT与DTFS采样层', ticks: [-1.1, 0.8], format: (v) => (v < 0 ? '时域x[n]' : 'DTFT+采样') },
                z: { min: -1.3, max: 2.2, label: '归一化幅值' }
              },
              ribbons: [{ points: cEnv3, baseZ: 0, color: 'rgba(52,211,153,0.18)' }],
              curves: [{ points: cEnv3, color: '#34d399', width: 2.8, glow: true, label: '连续 DTFT 包络 |X(e^{jω})|' }],
              stems: [
                { points: sTime3, baseZ: 0, color: '#38bdf8', width: 1.8, radius: 3.1, label: '有限长序列 x[n]' },
                { points: sDft3, baseZ: 0, color: '#fbbf24', width: 2.1, radius: 3.6, label: `${Mpad}点 DFT/DTFS 谱样值` }
              ],
              legend: [
                { color: '#38bdf8', label: `真实序列 L=${L} 点 (补零至 ${Mpad})` },
                { color: '#34d399', label: '连续 DTFT 包络' },
                { color: '#fbbf24', label: `${Mpad} 点 DTFS/FFT 频域采样` }
              ]
            },
            plots2d: [
              { title: `时域数据窗 (前 ${L} 点有信号，${L}~${Mpad - 1} 补零)`, xMin: 0, xMax: Mpad - 1, yMin: -2.1, yMax: 2.1, xLabel: 'n', series: [{ points: nArr.map((n, i) => [n, xArr[i]]), type: 'stems', color: '#38bdf8' }], vLines: [{ x: L - 0.5, color: '#f43f5e' }] },
              {
                title: `[0, π] 双频谱分析：连续 DTFT [绿线] vs ${Mpad} 点 FFT 采样 [黄针]`,
                xMin: 0, xMax: 1, yMin: 0, yMax: L * 1.05, xLabel: '×π',
                series: [
                  { points: ws.map((w, i) => [w / Math.PI, dtft.mag[i]]), color: '#34d399', width: 2.2 },
                  { points: wkArr.map((w, i) => [w / Math.PI, dft.mag[i]]), type: 'stems', color: '#fbbf24', radius: 2.8 }
                ],
                vLines: [{ x: 0.28, color: '#f43f5e' }, { x: 0.28 + p.dwPi, color: '#f43f5e' }]
              }
            ],
            metrics: [
              { label: '实验项目性质', value: '必做 · 验证性 · 4学时', status: 'ok' },
              { label: '瑞利分辨率极限 2π/L', value: `${M.fmt(2 / L, 3)}π rad` },
              { label: '当前双频间隔 Δω', value: `${M.fmt(p.dwPi, 2)}π (${resolved ? '可分辨双峰 ✓' : '主瓣融合难分辨!'})`, status: resolved ? 'ok' : 'warn' },
              { label: 'FFT 栅栏采样间隔', value: `2π/${Mpad} = ${M.fmt(2 / Mpad, 3)}π` }
            ]
          };
        }
      },

      /* ==================== 实验项目五 ==================== */
      {
        id: 'L.5',
        code: '实验项目五 (4学时·设计性)',
        level: '必做实验',
        title: '实验五：连续时间系统的拉普拉斯变换与模拟滤波器三维设计工作台',
        summary: '对标大纲唯一【设计性必做实验】：自主设定滤波器类型（低通/高通）、逼近准则、阶数 N 与截止频率 ω_c，三维观察 s 平面极零点曲面并输出完整 MATLAB 设计报告代码！',
        camera: { azimuth: -0.82, elevation: 0.52, zoom: 1.0 },
        presets: [
          { label: '设计方案 A：3阶 Butterworth 模拟低通滤波器 (ωc=2.5)', values: { band: 'lp', proto: 'butter', N: 3, wc: 2.5 } },
          { label: '设计方案 B：4阶 Chebyshev 陡峭模拟低通 (ωc=2.5)', values: { band: 'lp', proto: 'cheby', N: 4, wc: 2.5 } },
          { label: '设计方案 C：3阶 Butterworth 模拟高通滤波器 (s→ωc²/s 含原点3重零点!)', values: { band: 'hp', proto: 'butter', N: 3, wc: 2.2 } }
        ],
        controls: [
          {
            key: 'band', label: '目标模拟滤波器频带类型', type: 'select', default: 'lp',
            options: [
              { value: 'lp', label: '连续时间低通滤波器 (Analog Lowpass)' },
              { value: 'hp', label: '连续时间高通滤波器 (Analog Highpass：s → ω_c²/s 变换!)' }
            ]
          },
          {
            key: 'proto', label: '原型滤波器逼近准则', type: 'select', default: 'butter',
            options: [
              { value: 'butter', label: 'Butterworth 巴特沃斯 (极点均匀分布在半径 ω_c 左半圆上!)' },
              { value: 'cheby', label: 'Chebyshev I 型 切比雪夫 (极点分布在左半椭圆上!)' }
            ]
          },
          { key: 'N', label: '设计阶数 N', type: 'range', min: 2, max: 6, step: 1, default: 3 },
          { key: 'wc', label: '设计截止角频率 ω_c', type: 'range', min: 1.2, max: 3.5, step: 0.1, default: 2.5, unit: 'rad/s' }
        ],
        theory: {
          formula: 'Butterworth 极点圆：s_k = ω_c e^{jπ(2k+N-1)/(2N)} (k=1..N)；   低通→高通频带变换：s ──► ω_c² / s！',
          objectives: [
            '【实验内容(1)】学会使用 MATLAB `roots` / `tf2zp` / `pzmap` 求解并绘制连续时间系统的零点与极点；',
            '【实验内容(2)】掌握利用 `residue(b, a)` 对系统函数进行拉普拉斯部分分式展开；',
            '【实验内容(3)】独立完成连续时间模拟滤波器的指标计算、s 平面零极点综合与滤波仿真验证（设计性实验核心！）。'
          ],
          guide3d: '三维设计沙盘：底面 s 平面展示设计出的左半圆/左半椭圆极点阵列 ×（高通模式下原点处自动生成 N 重零点 ○！），曲面上沿虚轴 jω 闪耀的金色脊线即为所设计滤波器的真实幅频响应 |H(jω)|！'
        },
        matlab(p) {
          const N = Math.round(p.N);
          return `%% 深圳技术大学《信号与系统》实验项目五：连续时间系统的拉普拉斯变换与滤波器设计 (4学时·设计性)
clear; clc; close all;
N = ${N}; wc = ${M.fmt(p.wc, 2)};

% 1. 构造左半 s 平面模拟原型极点与系统函数 H(s) = B(s)/A(s)
${p.proto === 'butter'
  ? 'k = 1:N; p_lp = wc * exp(1j * pi * (2*k + N - 1) / (2*N));'
  : 'eps_r = 0.45; beta = asinh(1/eps_r)/N; k = 1:N; phi = pi*(2*k-1)/(2*N);\np_lp = -wc*sinh(beta)*sin(phi) + 1j*wc*cosh(beta)*cos(phi);'}
${p.band === 'lp'
  ? 'poles = p_lp(:); zeros_s = []; gain = real(prod(-poles));'
  : 'poles = (wc^2) ./ p_lp(:); zeros_s = zeros(N, 1); gain = 1; % 低通->高通 s -> wc^2/s'}
b = gain * real(poly(zeros_s));
a = real(poly(poles));

% 2. 求解零极点分布与部分分式展开 (residue)
disp('系统极点 poles ='); disp(roots(a));
[r_res, p_res, k_direct] = residue(b, a)

% 3. 绘制零极点图、Bode 幅相曲线及混频信号滤波效果验证
figure('Color','w');
subplot(2,2,1); pzmap(tf(b, a)); grid on; title('设计滤波器 s 平面零极点图');
subplot(2,2,2); w = 0:0.02:8; H = freqs(b, a, w);
plot(w, 20*log10(abs(H)+1e-5), 'g', 'LineWidth', 2); ylim([-50 5]); grid on;
xlabel('\omega (rad/s)'); ylabel('增益 (dB)'); title('设计幅频响应 20lg|H(j\omega)|');

t = 0:0.01:8;
x_in = cos(1.0*t) + 0.8*cos(5.2*t);       % 1.0 rad/s 低频 + 5.2 rad/s 高频混合测试信号
y_out = lsim(tf(b, a), x_in, t);
subplot(2,1,2); plot(t, x_in, ':b', t, y_out, 'r', 'LineWidth', 1.8); grid on;
legend('双频混合输入 x(t)', '设计滤波器输出 y(t)'); title('连续时间滤波器时域选频验证');`;
        },
        quiz: {
          question: '在连续时间巴特沃斯（Butterworth）低通滤波器设计中，N 阶系统函数 H(s) 的 N 个极点在复 s 平面上呈什么几何分布？',
          options: [
            '等角度间隔分布在左半 s 平面半径为截止频率 ω_c 的半圆周上（无有限零点）！',
            '分布在左半平面的椭圆周上',
            '全部重合在负实轴 s = -ω_c 一点上',
            '分布在虚轴 jω 上'
          ],
          answer: 0,
          explanation: '由 |H(jω)|² = 1/[1+(ω/ω_c)^{2N}] 延拓得 H(s)H(-s) = 1/[1+(-s²/ω_c²)^N]，共有 2N 个极点等距分布在半径 ω_c 的整圆上；为保证系统因果稳定，选取位于左半平面的全部 N 个极点即构成 H(s)！'
        },
        compute(p) {
          const N = Math.round(p.N);
          const lpPoles = p.proto === 'butter' ? M.butterworthPoles(N, p.wc) : M.chebyshevPoles(N, p.wc, 0.45);
          let poles = [], zeros = [], gain = 1;

          if (p.band === 'lp') {
            poles = lpPoles;
            zeros = [];
            for (const pl of poles) gain *= Math.hypot(pl.re, pl.im);
            if (p.proto === 'cheby' && N % 2 === 0) gain /= Math.sqrt(1 + 0.45 * 0.45);
          } else {
            // Highpass transformation s -> wc^2 / s
            poles = lpPoles.map((pl) => M.cDiv({ re: p.wc * p.wc, im: 0 }, pl));
            zeros = new Array(N).fill(null).map(() => ({ re: 0, im: 0 }));
            gain = p.proto === 'cheby' && N % 2 === 0 ? 1 / Math.sqrt(1 + 0.45 * 0.45) : 1.0;
          }

          const sigs = M.linspace(-3.8, 0.8, 34);
          const ws = M.linspace(-5.5, 5.5, 38);
          const ceiling = 3.8;
          const zm = sigs.map((sg) =>
            Float64Array.from(ws, (w) => Math.min(ceiling, M.cAbs(M.evalZeroPole({ re: sg, im: w }, zeros, poles, gain))))
          );

          const wsFine = M.linspace(-5.5, 5.5, 220);
          const jwCurve = wsFine.map((w) => [0, w, Math.min(ceiling, M.cAbs(M.evalZeroPole({ re: 0, im: w }, zeros, poles, gain))) + 0.05]);

          // Dual-tone filtering test: wL = 1.0 rad/s + wH = 5.0 rad/s
          const wL = 1.0, wH = 5.0;
          const HL = M.evalZeroPole({ re: 0, im: wL }, zeros, poles, gain);
          const HH = M.evalZeroPole({ re: 0, im: wH }, zeros, poles, gain);
          const ts = M.linspace(0, 8, 260);
          const pIn = ts.map((t) => [t, Math.cos(wL * t) + 0.75 * Math.cos(wH * t)]);
          const pOut = ts.map((t) => [t, M.cAbs(HL) * Math.cos(wL * t + M.cArg(HL)) + 0.75 * M.cAbs(HH) * Math.cos(wH * t + M.cArg(HH))]);

          const wPos = M.linspace(0, 6, 180);
          const pDb = wPos.map((w) => [w, Math.max(-50, 20 * Math.log10(M.cAbs(M.evalZeroPole({ re: 0, im: w }, zeros, poles, gain)) + 1e-4))]);

          return {
            scene: {
              axes: {
                x: { min: -3.8, max: 0.8, label: 's平面实轴 σ' },
                y: { min: -5.5, max: 5.5, label: 's平面虚轴 jω' },
                z: { min: 0, max: 4.0, label: '|H(s)| 设计曲面' }
              },
              surfaces: [{ xGrid: sigs, yGrid: ws, zMatrix: zm, zMin: 0, zMax: 3.4, opacity: 0.66, wireframe: true }],
              curves: [{ points: jwCurve, color: '#fbbf24', width: 3.8, glow: true, label: '设计滤波器 |H(jω)|' }],
              markers: [
                ...poles.map((pl, idx) => ({ pos: [pl.re, pl.im, 0.06], shape: 'pole', color: '#f43f5e', size: 8, label: idx === 0 ? `p₁` : '' })),
                ...(zeros.length ? [{ pos: [0, 0, 0.08], shape: 'zero', color: '#38bdf8', size: 8.5, label: `${N}重原点零点` }] : [])
              ],
              legend: [
                { color: '#f43f5e', label: `左半平面设计极点 (${N}个)`, type: 'pole' },
                ...(zeros.length ? [{ color: '#38bdf8', label: `原点 ${N} 重零点`, type: 'zero' }] : []),
                { color: '#fbbf24', label: '虚轴幅频响应 |H(jω)|' }
              ]
            },
            plots2d: [
              { title: `设计幅频波特图 20lg|H(jω)| (截止 ω_c = ${M.fmt(p.wc, 1)} rad/s)`, xMin: 0, xMax: 6, yMin: -48, yMax: 5, xLabel: 'ω', series: [{ points: pDb, color: '#fbbf24', fill: 'rgba(251,191,36,0.16)', width: 2.2 }], vLines: [{ x: p.wc, color: '#f43f5e' }] },
              {
                title: '双频混合信号 (1.0 + 5.0 rad/s) 实测选频效果：输入 [蓝虚] → 输出 [绿]',
                xMin: 0, xMax: 8, yMin: -1.9, yMax: 1.9, xLabel: 't(s)',
                series: [
                  { points: pIn, color: '#38bdf8', dashed: true, width: 1.5 },
                  { points: pOut, color: '#34d399', width: 2.3 }
                ]
              }
            ],
            metrics: [
              { label: '实验项目性质', value: '必做 · 设计性 · 4学时', status: 'ok' },
              { label: '低频 1.0 rad/s 增益', value: `${M.fmt(M.cAbs(HL), 3)} (${M.fmt(20 * Math.log10(M.cAbs(HL) + 1e-4), 1)} dB)` },
              { label: '高频 5.0 rad/s 增益', value: `${M.fmt(M.cAbs(HH), 3)} (${M.fmt(20 * Math.log10(M.cAbs(HH) + 1e-4), 1)} dB)` },
              { label: '极点最右实部 max(σ)', value: `${M.fmt(Math.max(...poles.map((pl) => pl.re)), 3)} < 0 (因果稳定✓)`, status: 'ok' }
            ]
          };
        }
      }
    ]
  });
})();
