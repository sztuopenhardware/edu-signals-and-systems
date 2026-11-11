/**
 * 第 8 章：拉普拉斯变换 (Chapter 8) — 6 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 8 章全部 9 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch8',
    number: '第 8 章',
    title: '第 8 章：拉普拉斯变换',
    shortTitle: 'Ch8 拉普拉斯变换',
    weeks: '第 15–16 周 · 4 学时',
    syllabusItems: '拉氏变换与3D s平面曲面、收敛域ROC、部分分式反变换、零极点几何求FT、性质与初终值定理、LTI稳定性、方框图与单边拉氏变换',
    cases: [
      /* ==================== 8.1 ==================== */
      {
        id: '8.1',
        code: 'Ch8-(1)(2)',
        level: '掌握',
        title: '8.1 拉普拉斯变换 3D s-平面曲面 |X(σ+jω)|、虚轴截面与收敛域 (ROC)',
        summary: '镇馆级三维几何视图：极点耸立为高塔、零点触底为深谷、底面铺设收敛域 ROC 条带，而沿虚轴 σ=0 切出的金色发光脊线正是傅里叶变换 |X(jω)|！',
        camera: { azimuth: -0.82, elevation: 0.52, zoom: 1.0 },
        presets: [
          { label: '因果右边信号 (极点 -0.8±j2，ROC: σ > -0.8 含虚轴!)', values: { sigKind: 'right', p1: -0.8, p2: 1.2, wPole: 2.0, zZero: 0.0 } },
          { label: '发散因果信号 (极点 +0.5±j2，ROC: σ > +0.5 不含虚轴，FT不存在!)', values: { sigKind: 'right', p1: 0.5, p2: 1.2, wPole: 2.0, zZero: 0.0 } },
          { label: '双边信号带状收敛域 (-1.0 < σ < +0.8，含虚轴稳定!)', values: { sigKind: 'twoSided', p1: -1.0, p2: 0.8, wPole: 0.0, zZero: 0.0 } },
          { label: '反因果左边信号 (ROC: σ < p₁)', values: { sigKind: 'left', p1: -0.6, p2: 1.0, wPole: 1.5, zZero: 0.0 } }
        ],
        controls: [
          {
            key: 'sigKind', label: '时域信号类型与 ROC 形态', type: 'select', default: 'right',
            options: [
              { value: 'right', label: '右边信号 (因果)：ROC 为最右极点右侧半平面 σ > σ_max' },
              { value: 'left', label: '左边信号 (反因果)：ROC 为最左极点左侧半平面 σ < σ_min' },
              { value: 'twoSided', label: '双边信号：ROC 为两实极点间竖直条带 p₁ < σ < p₂' }
            ]
          },
          { key: 'p1', label: '主极点实部 σ₁', type: 'range', min: -2.0, max: 1.2, step: 0.1, default: -0.8 },
          { key: 'wPole', label: '共轭极点虚部 ω_d (=0 为单实极点)', type: 'range', min: 0.0, max: 3.0, step: 0.2, default: 2.0 },
          { key: 'zZero', label: '分子零点实部 σ_z (设为 9 则无有限零点)', type: 'range', min: -2.0, max: 2.0, step: 0.5, default: 0.0 }
        ],
        theory: {
          formula: 'X(s) = ∫_{-∞}^{+∞} x(t) e^{-st} dt = FT{ x(t)e^{-σt} } (s = σ + jω)；   当且仅当 ROC 包含 jω 轴 (σ=0) 时 CTFT 存在！',
          objectives: [
            '【掌握】双边拉普拉斯变换的定义、s 平面极零点图及收敛域（ROC）的五大性质（平行于 jω 轴的条带、不含任何极点、右边/左边/双边对应规律）；',
            '【理解】拉普拉斯变换是乘以实指数衰减因子 e^{-σt} 后的傅里叶变换，从而能够处理指数增长等不存在傅里叶变换的信号；',
            '【课程思政】拉普拉斯与海维赛德建立的算子微积分推动了近代电力、航天与自动控制革命；当代中国工程师正依托坚实数理根基在工业控制与芯片 EDA 领域实现自主突破。'
          ],
          guide3d: '三维探索秘诀：① 观察底面绿色半透明区即为收敛域 ROC（绝不跨越红色极点 ×！）；② 观察沿 σ=0 虚轴切开的金色发光曲线——当 ROC 覆盖虚轴时它实线闪耀（代表傅里叶变换 X(jω) 存在！），一旦把 σ₁ 拖过 0 使 ROC 脱离虚轴，CTFT 即发散失效！点击【复平面俯视】立即切换为标准教材零极点 ROC 图！'
        },
        matlab(p) {
          return `% Ch8.1 拉普拉斯变换三维幅值曲面 |X(sigma + j*omega)| 与虚轴 CTFT 截面
[sigma, omega] = meshgrid(-2.5:0.08:2.0, -4:0.12:4);
s = sigma + 1j * omega;
p1 = ${M.fmt(p.p1, 2)}; wd = ${M.fmt(p.wPole, 2)};
${p.sigKind === 'twoSided' ? `X = 1 ./ ((s - p1) .* (s - 0.8));` :
  p.wPole > 0.05 ? `X = (s - ${M.fmt(p.zZero, 1)}) ./ ((s - (p1 + 1j*wd)) .* (s - (p1 - 1j*wd)));` :
  `X = 1 ./ (s - p1);`}
Z = min(4.5, abs(X));
surf(sigma, omega, Z, 'EdgeAlpha', 0.25); hold on;
w_line = -4:0.05:4; s_jw = 1j * w_line;
${p.sigKind === 'twoSided' ? `X_jw = 1 ./ ((s_jw - p1) .* (s_jw - 0.8));` :
  p.wPole > 0.05 ? `X_jw = (s_jw - ${M.fmt(p.zZero, 1)}) ./ ((s_jw - (p1 + 1j*wd)) .* (s_jw - (p1 - 1j*wd)));` :
  `X_jw = 1 ./ (s_jw - p1);`}
plot3(zeros(size(w_line)), w_line, min(4.5, abs(X_jw)), 'y', 'LineWidth', 3); % jw 轴截面!
xlabel('\sigma'); ylabel('j\omega'); zlabel('|X(s)|'); view(-38, 30); grid on;`;
        },
        quiz: {
          question: '已知某双边拉普拉斯变换 X(s) 共有两个极点 s₁ = -2 和 s₂ = +1。若已知原信号 x(t) 存在连续时间傅里叶变换（即绝对可积），则 X(s) 的收敛域（ROC）必定是：',
          options: ['-2 < Re{s} < +1（唯一包含虚轴 Re{s} = 0 且不含极点的中间竖直条带！）', 'Re{s} > +1', 'Re{s} < -2', '全 s 平面'],
          answer: 0,
          explanation: '连续时间傅里叶变换存在等价于收敛域 ROC 包含虚轴 σ = Re{s} = 0，且 ROC 内不能包含任何极点，因此在 -2 与 +1 划分的三个区域中只能是双边信号对应的中间带 -2 < Re{s} < 1！'
        },
        compute(p) {
          let poles = [];
          let zeros = [];
          let rocMin = -2.5, rocMax = 2.5;
          let p2Fixed = 0.85;

          if (p.sigKind === 'twoSided') {
            const leftP = Math.min(p.p1, p2Fixed - 0.3);
            poles = [{ re: leftP, im: 0 }, { re: p2Fixed, im: 0 }];
            rocMin = leftP;
            rocMax = p2Fixed;
          } else {
            if (p.wPole > 0.05) {
              poles = [{ re: p.p1, im: p.wPole }, { re: p.p1, im: -p.wPole }];
            } else {
              poles = [{ re: p.p1, im: 0 }];
            }
            if (Math.abs(p.zZero) <= 2.0 && p.wPole > 0.05) {
              zeros = [{ re: p.zZero, im: 0 }];
            }
            if (p.sigKind === 'right') {
              rocMin = p.p1;
              rocMax = 2.5;
            } else {
              rocMin = -2.5;
              rocMax = p.p1;
            }
          }

          const gain = poles.length === 2 && zeros.length === 0 ? 2.2 : 1.6;
          const sigs = M.linspace(-2.5, 2.5, 38);
          const ws = M.linspace(-4.2, 4.2, 38);
          const ceiling = 4.2;

          const zm = sigs.map((sg) =>
            Float64Array.from(ws, (w) => {
              const val = M.cAbs(M.evalZeroPole({ re: sg, im: w }, zeros, poles, gain));
              return Math.min(ceiling, val);
            })
          );

          const hasFT = rocMin < 0 && rocMax > 0;
          const wsFine = M.linspace(-4.2, 4.2, 180);
          const jwRibbon = wsFine.map((w) => {
            const mag = Math.min(ceiling, M.cAbs(M.evalZeroPole({ re: 0, im: w }, zeros, poles, gain)));
            return [0, w, mag + 0.04];
          });

          // Time-domain signal for 2D plot
          const ts = M.linspace(-3.5, 4.5, 240);
          const pTime = ts.map((t) => {
            let v = 0;
            if (p.sigKind === 'twoSided') {
              v = t >= 0 ? Math.exp(poles[0].re * t) : -Math.exp(poles[1].re * t);
            } else if (p.sigKind === 'right') {
              v = t >= 0 ? Math.exp(p.p1 * t) * (p.wPole > 0.05 ? Math.cos(p.wPole * t) : 1) : 0;
            } else {
              v = t < 0 ? -Math.exp(p.p1 * t) * (p.wPole > 0.05 ? Math.cos(p.wPole * t) : 1) : 0;
            }
            return [t, Math.max(-4, Math.min(4, v))];
          });

          const markers = [
            ...poles.map((pl, idx) => ({ pos: [pl.re, pl.im, 0.08], shape: 'pole', color: '#f43f5e', size: 8, label: idx === 0 ? `极点 (${M.fmt(pl.re, 1)}${pl.im ? '±j' + M.fmt(Math.abs(pl.im), 1) : ''})` : '' })),
            ...zeros.map((zr) => ({ pos: [zr.re, zr.im, 0.08], shape: 'zero', color: '#38bdf8', size: 7.5, label: `零点 (${M.fmt(zr.re, 1)})` }))
          ];

          return {
            scene: {
              axes: {
                x: { min: -2.5, max: 2.5, label: '实轴 σ = Re{s}' },
                y: { min: -4.2, max: 4.2, label: '虚轴 jω = Im{s}' },
                z: { min: 0, max: 4.4, label: '模曲面 |X(σ + jω)|' }
              },
              planes: [
                {
                  axis: 'z', value: 0.02,
                  xMin: Math.max(-2.5, rocMin), xMax: Math.min(2.5, rocMax),
                  yMin: -4.2, yMax: 4.2,
                  color: hasFT ? 'rgba(52,211,153,0.24)' : 'rgba(251,191,36,0.20)',
                  borderColor: hasFT ? '#34d399' : '#fbbf24',
                  dashed: true
                }
              ],
              surfaces: [{ xGrid: sigs, yGrid: ws, zMatrix: zm, zMin: 0, zMax: 3.8, opacity: 0.68, wireframe: true }],
              curves: [
                {
                  points: jwRibbon,
                  color: hasFT ? '#fbbf24' : '#f43f5e',
                  width: 3.8,
                  dashed: !hasFT,
                  glow: hasFT,
                  label: hasFT ? '虚轴截面 = CTFT |X(jω)|' : '虚轴不在 ROC 内 (FT发散!)'
                }
              ],
              markers,
              legend: [
                { color: '#f43f5e', label: '极点 × (曲面峰值→∞)', type: 'pole' },
                { color: '#34d399', label: '底面阴影：收敛域 ROC' },
                { color: hasFT ? '#fbbf24' : '#f43f5e', label: hasFT ? 'jω轴截面 = 傅里叶变换 |X(jω)|' : 'jω轴在 ROC 外 (FT不存在!)' }
              ]
            },
            plots2d: [
              { title: '对应时域原信号 x(t) (由极点 + 收敛域 ROC 共同唯一决定!)', xMin: -3.5, xMax: 4.5, yMin: -3.2, yMax: 3.2, xLabel: 't(s)', series: [{ points: pTime, color: '#38bdf8', fill: 'rgba(56,189,248,0.16)', width: 2.1 }] },
              {
                title: hasFT ? '沿虚轴 σ=0 切出的连续傅里叶变换 |X(jω)|' : '沿 σ=0 的代数模值 (警告：因 ROC 不含虚轴，积分不收敛!)',
                xMin: -4.2, xMax: 4.2, yMin: 0, yMax: 4.4, xLabel: 'ω',
                series: [{ points: wsFine.map((w, i) => [w, jwRibbon[i][2]]), color: hasFT ? '#fbbf24' : '#f43f5e', dashed: !hasFT, fill: 'rgba(251,191,36,0.16)', width: 2.3 }]
              }
            ],
            metrics: [
              { label: '收敛域 (ROC) 表达式', value: p.sigKind === 'twoSided' ? `${M.fmt(rocMin, 1)} < Re{s} < ${M.fmt(rocMax, 1)}` : p.sigKind === 'right' ? `Re{s} > ${M.fmt(rocMin, 1)}` : `Re{s} < ${M.fmt(rocMax, 1)}`, status: 'ok' },
              { label: '傅里叶变换是否存在', value: hasFT ? '存在 ✓ (ROC 包含 jω 轴)' : '不存在 ✗ (ROC 不含 jω 轴)', status: hasFT ? 'ok' : 'err' },
              { label: '时域信号双边属性', value: p.sigKind === 'right' ? '右边因果型信号' : p.sigKind === 'left' ? '左边反因果信号' : '双边信号' },
              { label: '极点与零点个数', value: `${poles.length} 极点 · ${zeros.length} 有限零点` }
            ]
          };
        }
      },

      /* ==================== 8.2 ==================== */
      {
        id: '8.2',
        code: 'Ch8-(3)(6)',
        level: '掌握',
        title: '8.2 拉普拉斯逆变换（部分分式展开法）：同一 X(s) 的三种 ROC 时域对比',
        summary: '深刻理解为什么拉氏变换必须注明 ROC：代数式完全相同的 X(s) = (2s+1)/[(s+1)(s-0.6)] 对应 3 种截然不同的时域信号！',
        presets: [
          { label: '选择 ROC ①：σ > 0.6 (因果右边信号，含 e^(+0.6t) 发散!)', values: { rocChoice: 1, p1: -1.0, p2: 0.6 } },
          { label: '选择 ROC ②：-1.0 < σ < 0.6 (非因果双边信号，绝对可积稳定!)', values: { rocChoice: 2, p1: -1.0, p2: 0.6 } },
          { label: '选择 ROC ③：σ < -1.0 (反因果左边信号)', values: { rocChoice: 3, p1: -1.0, p2: 0.6 } },
          { label: '双左半平面极点 p₁=-1.8, p₂=-0.6 (因果且稳定!)', values: { rocChoice: 1, p1: -1.8, p2: -0.6 } }
        ],
        controls: [
          {
            key: 'rocChoice', label: '指定收敛域 (ROC) 区域', type: 'select', default: 2,
            options: [
              { value: 1, label: 'ROC ①：Re{s} > max(p₁, p₂)  [右边因果序列：两项均取 +u(t)]' },
              { value: 2, label: 'ROC ②：p₁ < Re{s} < p₂      [双边信号：p₁取右边u(t)，p₂取左边-u(-t)!]' },
              { value: 3, label: 'ROC ③：Re{s} < min(p₁, p₂)  [左边反因果信号：两项均取 -u(-t)]' }
            ]
          },
          { key: 'p1', label: '左侧实极点 p₁', type: 'range', min: -2.2, max: -0.3, step: 0.1, default: -1.0 },
          { key: 'p2', label: '右侧实极点 p₂ (> p₁)', type: 'range', min: -0.8, max: 1.0, step: 0.1, default: 0.6 }
        ],
        theory: {
          formula: 'X(s) = A₁/(s - p₁) + A₂/(s - p₂)；  1/(s - p) ──►  +e^{pt}u(t) [当 σ > p]  或  -e^{pt}u(-t) [当 σ < p]！',
          objectives: [
            '【掌握】利用部分分式展开法（留数法 A_k = (s-p_k)X(s)|_{s=p_k}）结合各分项 ROC 查常用拉普拉斯变换对求逆变换；',
            '【掌握】单极点基本对：e^{-at}u(t) ↔ 1/(s+a) (Re{s}>-a) 与 -e^{-at}u(-t) ↔ 1/(s+a) (Re{s}<-a) 符号与收敛域的严格配对！'
          ],
          guide3d: '三维空间同时陈列同一个代数式 X(s) 在三种不同 ROC 下的三条时域轨迹：高亮绿色为当前所选 ROC 对应的原函数 x(t)，另外两条虚线为其余两种 ROC 的时域信号——直观印证“不写 ROC 就无法唯一求逆变换”！'
        },
        matlab(p) {
          const p1 = Math.min(p.p1, p.p2 - 0.2);
          const p2 = Math.max(p.p2, p1 + 0.2);
          return `% Ch8.2 拉普拉斯变换部分分式展开 residue() 与三种 ROC 逆变换对比
b = [2, 1];                                  % 分子 2s + 1
a = poly([${M.fmt(p1, 2)}, ${M.fmt(p2, 2)}]); % 分母 (s - p1)(s - p2)
[r, poles, k] = residue(b, a)                % MATLAB 自动求解留数 A1, A2!
t = -3.5:0.01:3.5;
x_roc1 = (r(1)*exp(poles(1)*t) + r(2)*exp(poles(2)*t)) .* (t >= 0); % Re(s) > max(p)
% 双边中间条带 ROC: 左极点取右边 u(t)，右极点取左边 -u(-t)
plot(t, x_roc1, 'LineWidth', 1.8); grid on; title('部分分式留数分解逆变换');`;
        },
        quiz: {
          question: '已知 X(s) = 3 / [(s + 1)(s - 2)]，且收敛域为 -1 < Re{s} < 2，利用部分分式展开求得的逆变换 x(t) 为：',
          options: [
            '-e^{-t} u(t) - e^{2t} u(-t)',
            '(e^{2t} - e^{-t}) u(t)',
            '(-e^{2t} + e^{-t}) u(-t)',
            'e^{-t} u(t) + e^{2t} u(t)'
          ],
          answer: 0,
          explanation: '部分分式展开 X(s) = 1/(s-2) - 1/(s+1)。因 ROC 为 -1 < σ < 2：① 对极点 -1，σ > -1 故 -1/(s+1) 取右边信号 -e^{-t}u(t)；② 对极点 2，σ < 2 故 1/(s-2) 取左边信号 -e^{2t}u(-t)！'
        },
        compute(p) {
          const p1 = Math.min(p.p1, p.p2 - 0.25);
          const p2 = Math.max(p.p2, p1 + 0.25);
          // X(s) = (2s + 1) / ((s - p1)(s - p2))
          const A1 = (2 * p1 + 1) / (p1 - p2);
          const A2 = (2 * p2 + 1) / (p2 - p1);

          const ts = M.linspace(-3.2, 3.2, 280);
          const clamp = (v) => Math.max(-3.5, Math.min(3.5, v));

          const xRoc1 = ts.map((t) => clamp(t >= 0 ? A1 * Math.exp(p1 * t) + A2 * Math.exp(p2 * t) : 0));
          const xRoc2 = ts.map((t) => clamp((t >= 0 ? A1 * Math.exp(p1 * t) : 0) + (t < 0 ? -A2 * Math.exp(p2 * t) : 0)));
          const xRoc3 = ts.map((t) => clamp(t < 0 ? -A1 * Math.exp(p1 * t) - A2 * Math.exp(p2 * t) : 0));

          const choice = Number(p.rocChoice);
          const activeArr = choice === 1 ? xRoc1 : choice === 2 ? xRoc2 : xRoc3;
          const m1Arr = ts.map((t) => clamp(choice === 3 ? (t < 0 ? -A1 * Math.exp(p1 * t) : 0) : (t >= 0 ? A1 * Math.exp(p1 * t) : 0)));
          const m2Arr = ts.map((t) => clamp(choice === 1 ? (t >= 0 ? A2 * Math.exp(p2 * t) : 0) : (t < 0 ? -A2 * Math.exp(p2 * t) : 0)));

          const c1 = ts.map((t, i) => [t, 1.3, xRoc1[i]]);
          const c2 = ts.map((t, i) => [t, 0, xRoc2[i]]);
          const c3 = ts.map((t, i) => [t, -1.3, xRoc3[i]]);

          const rocBounds = choice === 1 ? [p2, 2.5] : choice === 2 ? [p1, p2] : [-2.5, p1];

          return {
            scene: {
              axes: {
                x: { min: -3.2, max: 3.2, label: '时间 t (s)' },
                y: { min: -1.9, max: 1.9, label: '三种不同 ROC 对应的原函数', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? 'ROC①右边' : v < -0.6 ? 'ROC③左边' : 'ROC②双边') },
                z: { min: -3.5, max: 3.5, label: '信号幅值 x(t)' }
              },
              ribbons: [
                { points: choice === 1 ? c1 : choice === 2 ? c2 : c3, baseZ: 0, color: 'rgba(52,211,153,0.24)' }
              ],
              curves: [
                { points: c1, color: choice === 1 ? '#34d399' : 'rgba(56,189,248,0.45)', width: choice === 1 ? 3.2 : 1.7, glow: choice === 1, label: 'ROC① 右边信号' },
                { points: c2, color: choice === 2 ? '#34d399' : 'rgba(251,191,36,0.45)', width: choice === 2 ? 3.2 : 1.7, glow: choice === 2, label: 'ROC② 双边信号' },
                { points: c3, color: choice === 3 ? '#34d399' : 'rgba(244,63,94,0.45)', width: choice === 3 ? 3.2 : 1.7, glow: choice === 3, label: 'ROC③ 左边信号' }
              ],
              legend: [
                { color: '#34d399', label: `当前选中 ROC 逆变换 x(t)` },
                { color: '#38bdf8', label: '其余两种 ROC 对照波形' }
              ]
            },
            plots2d: [
              {
                title: `部分分式模态分解：模态1 (A₁=${M.fmt(A1, 2)}) [蓝] + 模态2 (A₂=${M.fmt(A2, 2)}) [黄] = x(t) [绿]`,
                xMin: -3.2, xMax: 3.2, yMin: -3.5, yMax: 3.5, xLabel: 't(s)',
                series: [
                  { points: ts.map((t, i) => [t, m1Arr[i]]), color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, m2Arr[i]]), color: '#fbbf24', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, activeArr[i]]), color: '#34d399', width: 2.4 }
                ]
              },
              {
                title: 's 平面极点与当前选中收敛域 ROC 位置 (绿区)',
                xMin: -2.5, xMax: 2.5, yMin: -1, yMax: 1, xLabel: 'σ = Re{s}',
                vBands: [{ from: rocBounds[0], to: rocBounds[1], color: 'rgba(52,211,153,0.22)' }],
                series: [{ points: [[p1, 0], [p2, 0]], type: 'stems', color: '#f43f5e', radius: 4.5 }],
                vLines: [{ x: 0, color: '#fbbf24' }]
              }
            ],
            metrics: [
              { label: '部分分式留数 A₁, A₂', value: `A₁=${M.fmt(A1, 2)}, A₂=${M.fmt(A2, 2)}`, status: 'ok' },
              { label: '当前 ROC 因果性', value: choice === 1 ? '因果信号 (t<0 为 0) ✓' : '非因果信号 (t<0 非零)', status: choice === 1 ? 'ok' : 'warn' },
              { label: '当前 ROC 稳定性(含jω轴)', value: rocBounds[0] < 0 && rocBounds[1] > 0 ? 'BIBO 稳定 (含虚轴) ✓' : '不稳定 (不含虚轴)', status: rocBounds[0] < 0 && rocBounds[1] > 0 ? 'ok' : 'err' },
              { label: '代数表达式 X(s)', value: `(2s+1)/[(s-(${M.fmt(p1, 1)}))(s-(${M.fmt(p2, 1)}))]` }
            ]
          };
        }
      },

      /* ==================== 8.3 ==================== */
      {
        id: '8.3',
        code: 'Ch8-(4)',
        level: '掌握',
        title: '8.3 由 s-平面零极点图对傅里叶变换进行 3D 几何向量求值',
        summary: '拖动测试点 jω₀ 沿虚轴滑行：实时观察零点向量长度积 / 极点向量长度积如何决定 |H(jω₀)| 的峰谷与陷波！',
        camera: { azimuth: -0.78, elevation: 0.48, zoom: 1.0 },
        presets: [
          { label: '二阶带通谐振器 (jω₀ 靠近极点时向量最短 → 幅频尖峰!)', values: { cfg: 'bp', wTest: 2.0, sigmaP: -0.45, wP: 2.0 } },
          { label: '虚轴零点陷波器 Notch (jω₀ 到达零点时向量长=0 → 完全归零!)', values: { cfg: 'notch', wTest: 2.0, sigmaP: -0.6, wP: 2.0 } },
          { label: '一阶全通相移系统 (对称极零点向量等长 → |H|≡1!)', values: { cfg: 'allpass', wTest: 1.4, sigmaP: -1.0, wP: 0 } }
        ],
        controls: [
          {
            key: 'cfg', label: '经典零极点拓扑配置', type: 'select', default: 'bp',
            options: [
              { value: 'bp', label: '二阶带通系统：原点零点 z=0，共轭极点 σ_p ± jω_p' },
              { value: 'notch', label: '二阶陷波器：虚轴零点 ±jω_p，左半平面极点 σ_p ± jω_p' },
              { value: 'allpass', label: '一阶全通系统：右半零点 -σ_p，左半极点 +σ_p (对称等距!)' }
            ]
          },
          { key: 'wTest', label: '虚轴测试点角频率 ω₀', type: 'range', min: -3.8, max: 3.8, step: 0.1, default: 2.0, unit: 'rad/s' },
          { key: 'sigmaP', label: '极点实部 σ_p (<0 左半平面)', type: 'range', min: -1.6, max: -0.2, step: 0.05, default: -0.45 },
          { key: 'wP', label: '极/零点特征频率 ω_p', type: 'range', min: 0.8, max: 3.2, step: 0.2, default: 2.0, unit: 'rad/s' }
        ],
        theory: {
          formula: '|H(jω₀)| = |K| · (∏ |jω₀ - z_i|) / (∏ |jω₀ - p_i|),   ∠H(jω₀) = ∠K + ∑ ∠(jω₀ - z_i) - ∑ ∠(jω₀ - p_i)',
          objectives: [
            '【掌握】由系统函数零极点分布几何确定频率特性的方法（零点吸引谷底、极点撑起谐振峰）；',
            '【理解】极点距离虚轴越近（|σ_p| 越小），极点向量在 ω₀≈ω_p 处越短，谐振峰越高越窄（品质因数 Q 越高）！'
          ],
          guide3d: '三维几何直觉：底面 s 平面上，青色箭头连接各零点 ○ 到虚轴测试点 jω₀，红色箭头连接各极点 × 到 jω₀；虚轴上方竖立着沿虚轴求出的三维幅频曲线 |H(jω)|！点击【复平面俯视】即可专注观察教材经典的二维零极点向量三角形！'
        },
        matlab(p) {
          return `% Ch8.3 由 s 平面零极点向量几何求值频率响应 H(jw)
sp = ${M.fmt(p.sigmaP, 2)}; wp = ${M.fmt(p.wP, 2)}; w0 = ${M.fmt(p.wTest, 2)};
${p.cfg === 'bp' ? 'zeros_s = [0]; poles_s = [sp+1j*wp; sp-1j*wp]; K = 2*abs(sp);' :
  p.cfg === 'notch' ? 'zeros_s = [1j*wp; -1j*wp]; poles_s = [sp+1j*wp; sp-1j*wp]; K = 1;' :
  'zeros_s = [-sp]; poles_s = [sp]; K = -1;'}
v_zeros = 1j*w0 - zeros_s; u_poles = 1j*w0 - poles_s;
mag_w0 = abs(K) * prod(abs(v_zeros)) / prod(abs(u_poles));
ph_w0 = angle(K) + sum(angle(v_zeros)) - sum(angle(u_poles));
fprintf('在 w0=%.2f 处: |H(jw0)| = %.4f, 相位 = %.1f deg\\n', w0, mag_w0, ph_w0*180/pi);`;
        },
        quiz: {
          question: '要设计一个能够精准滤除 ω₀ = 100π rad/s（50 Hz 工频干扰）且不影响其他频段的连续时间陷波滤波器，应在 s 平面如何放置零极点？',
          options: [
            '在虚轴 s = ±j100π 处放置一对共轭零点，并在左半平面紧邻处 s = -α ± j100π（α>0 很小）放置一对共轭极点！',
            '在虚轴 s = ±j100π 处放置一对极点',
            '在原点 s = 0 放置零点',
            '在右半平面放置极点'
          ],
          answer: 0,
          explanation: '虚轴上的零点 ±j100π 使 ω = 100π 时零点向量长度为 0，从而 |H(j100π)| = 0 完全滤除干扰；而在紧邻左半平面放置极点 -α±j100π，使得偏离 100π 稍远处零点向量与极点向量长度比迅速恢复为 1！'
        },
        compute(p) {
          let zeros = [], poles = [], gain = 1;
          if (p.cfg === 'bp') {
            zeros = [{ re: 0, im: 0 }];
            poles = [{ re: p.sigmaP, im: p.wP }, { re: p.sigmaP, im: -p.wP }];
            gain = 2 * Math.abs(p.sigmaP) * Math.hypot(p.sigmaP, p.wP) / Math.max(0.5, p.wP);
          } else if (p.cfg === 'notch') {
            zeros = [{ re: 0, im: p.wP }, { re: 0, im: -p.wP }];
            poles = [{ re: p.sigmaP, im: p.wP }, { re: p.sigmaP, im: -p.wP }];
            gain = 1.0;
          } else {
            zeros = [{ re: -p.sigmaP, im: 0 }];
            poles = [{ re: p.sigmaP, im: 0 }];
            gain = 1.0;
          }

          const ws = M.linspace(-4, 4, 240);
          const jwCurve3 = [], pMag = [], pPh = [];
          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const H = M.evalZeroPole({ re: 0, im: w }, zeros, poles, gain);
            const mag = Math.min(3.5, M.cAbs(H));
            jwCurve3.push([0, w, mag]);
            pMag.push([w, mag]);
            pPh.push([w, M.cArg(H)]);
          }

          const testPt = { re: 0, im: p.wTest };
          const Htest = M.evalZeroPole(testPt, zeros, poles, gain);
          const magTest = Math.min(3.5, M.cAbs(Htest));
          const phTest = M.cArg(Htest);

          const vectors = [
            ...zeros.map((z, idx) => ({
              from: [z.re, z.im, 0.03],
              to: [0, p.wTest, 0.03],
              color: '#38bdf8',
              width: 2.3,
              label: idx === 0 ? `|v_z|=${M.fmt(Math.hypot(-z.re, p.wTest - z.im), 2)}` : ''
            })),
            ...poles.map((pl, idx) => ({
              from: [pl.re, pl.im, 0.03],
              to: [0, p.wTest, 0.03],
              color: '#f43f5e',
              width: 2.4,
              label: idx === 0 ? `|u_p|=${M.fmt(Math.hypot(-pl.re, p.wTest - pl.im), 2)}` : ''
            })),
            { from: [0, p.wTest, 0], to: [0, p.wTest, magTest], color: '#fbbf24', width: 3.0, label: `|H|=${M.fmt(magTest, 2)}` }
          ];

          const markers = [
            ...poles.map((pl) => ({ pos: [pl.re, pl.im, 0.03], shape: 'pole', color: '#f43f5e', size: 8 })),
            ...zeros.map((zr) => ({ pos: [zr.re, zr.im, 0.03], shape: 'zero', color: '#38bdf8', size: 7.5 })),
            { pos: [0, p.wTest, 0.03], shape: 'dot', color: '#fbbf24', size: 6.5, label: `j${M.fmt(p.wTest, 1)}` }
          ];

          return {
            scene: {
              axes: {
                x: { min: -2.2, max: 2.2, label: '实轴 σ' },
                y: { min: -4.0, max: 4.0, label: '虚轴 jω' },
                z: { min: 0, max: 3.6, label: '几何求值幅频 |H(jω)|' }
              },
              ribbons: [{ points: jwCurve3, baseZ: 0, color: 'rgba(52,211,153,0.22)' }],
              curves: [{ points: jwCurve3, color: '#34d399', width: 3.2, glow: true, label: '|H(jω)| 虚轴立面' }],
              vectors,
              markers,
              legend: [
                { color: '#38bdf8', label: '零点向量 (jω₀ - z_i)', type: 'zero' },
                { color: '#f43f5e', label: '极点向量 (jω₀ - p_i)', type: 'pole' },
                { color: '#34d399', label: '几何商 |H(jω)|' }
              ]
            },
            plots2d: [
              { title: '几何求值所得幅频曲线 |H(jω)|', xMin: -4, xMax: 4, yMin: 0, yMax: 3.5, xLabel: 'ω', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.2 }], vLines: [{ x: p.wTest, color: '#fbbf24' }] },
              { title: '几何相角差曲线 ∠H(jω) = ∑∠v_z - ∑∠u_p (rad)', xMin: -4, xMax: 4, yMin: -3.3, yMax: 3.3, xLabel: 'ω', series: [{ points: pPh, color: '#38bdf8', width: 2.0 }], vLines: [{ x: p.wTest, color: '#fbbf24' }] }
            ],
            metrics: [
              { label: `测试点 |H(j${M.fmt(p.wTest, 1)})|`, value: M.fmt(magTest, 3), status: 'ok' },
              { label: `测试点相角 ∠H`, value: `${M.fmt((phTest * 180) / Math.PI, 1)}°` },
              { label: '分子零点向量模积', value: M.fmt(zeros.reduce((acc, z) => acc * Math.hypot(-z.re, p.wTest - z.im), 1), 3) },
              { label: '分母极点向量模积', value: M.fmt(poles.reduce((acc, pl) => acc * Math.hypot(-pl.re, p.wTest - pl.im), 1), 3) }
            ]
          };
        }
      },

      /* ==================== 8.4 ==================== */
      {
        id: '8.4',
        code: 'Ch8-(5)',
        level: '理解',
        title: '8.4 拉普拉斯变换的性质：s 域平移、延时及初值/终值定理验证',
        summary: '定量检验初值定理 x(0⁺)=lim_{s→∞}sX(s) 与终值定理 x(∞)=lim_{s→0}sX(s)，并揭示终值定理失效陷阱！',
        presets: [
          { label: '稳定收敛信号：初值定理与终值定理双双精确成立!', values: { sigma: -0.6, wd: 2.2, delay: 0.0 } },
          { label: '右半平面发散极点 σ=+0.25：终值定理算得假值(失效警告!)', values: { sigma: 0.25, wd: 2.0, delay: 0.0 } },
          { label: '虚轴等幅振荡 σ=0：终值不存在(终值定理同样不适用!)', values: { sigma: 0.0, wd: 2.5, delay: 0.0 } },
          { label: '时域延时 e^(-st₀)X(s) 性质演示', values: { sigma: -0.6, wd: 2.0, delay: 1.2 } }
        ],
        controls: [
          { key: 'sigma', label: 's 域频移（阻尼率）σ (<0 收敛, ≥0 终值定理失效!)', type: 'range', min: -1.4, max: 0.35, step: 0.05, default: -0.6 },
          { key: 'wd', label: '振荡角频率 ω_d', type: 'range', min: 0.0, max: 3.5, step: 0.25, default: 2.2, unit: 'rad/s' },
          { key: 'delay', label: '时域延时 t₀ (乘 e^{-st₀})', type: 'range', min: 0.0, max: 2.0, step: 0.2, default: 0.0, unit: 's' }
        ],
        theory: {
          formula: '初值定理：x(0⁺) = lim_{s→∞} sX(s)；   终值定理：x(∞) = lim_{s→0} sX(s) 【前提：sX(s) 的全部极点严格位于左半开平面 Re{s}<0！】',
          objectives: [
            '【理解】拉氏变换的时移、s域平移 e^{s₀t}x(t) ↔ X(s-s₀)、微分积分性质及其对 ROC 的影响；',
            '【理解】初值定理（要求 x(t) 在 t=0 无冲激）与终值定理（要求 sX(s) 极点全在左半平面）的严格适用条件！'
          ],
          guide3d: '三维空间同时绘制：① 时域因果信号 x(t) = [1 + e^{σt}cos(ω_d t)]u(t-t₀)（验证 t→0⁺ 初值与 t→∞ 终值）；② 实正半轴上的函数 s·X(s)（观察 s→∞ 渐近值即初值，s→0 截距即终值）！试试把 σ 拖到 ≥0，观察代数公式 lim_{s→0}sX(s)=1 给出“伪终值”而真实波形发散！'
        },
        matlab(p) {
          return `% Ch8.4 拉普拉斯变换初值定理与终值定理适用条件验证
sigma = ${M.fmt(p.sigma, 2)}; wd = ${M.fmt(p.wd, 2)}; t0 = ${M.fmt(p.delay, 2)};
% 测试信号 x(t) = [1 + exp(sigma*t)*cos(wd*t)] * u(t - t0)
t = 0:0.01:10;
tau = t - t0;
x = (1 + exp(sigma*tau).*cos(wd*tau)) .* (tau >= 0);
s = 0.01:0.05:25;
sX = exp(-s*t0) .* (1 + s.*(s - sigma) ./ ((s - sigma).^2 + wd^2));
fprintf('初值 lim_{s->inf} sX(s) = %.3f, 真实 x(0+) = %.3f\\n', sX(end), x(1));
fprintf('代数 lim_{s->0} sX(s) = 1.000 (仅当 sigma < 0 时终值定理合法!)\\n');`;
        },
        quiz: {
          question: '已知因果信号的拉氏变换为 X(s) = ω₀ / (s² + ω₀²)（即 x(t) = sin(ω₀t)u(t)）。若盲目套用终值定理得 lim_{s→0} sX(s) = 0，该结果是否正确？为什么？',
          options: [
            '不正确！因为 sX(s) 在虚轴 s = ±jω₀ 上有一对共轭极点（不在左半开平面 Re{s}<0 内），x(t)=sin(ω₀t) 等幅振荡根本不存在极限终值！',
            '正确，sin(ω₀t) 在无穷远处趋于 0',
            '不正确，终值应为 1',
            '初值定理也不适用'
          ],
          answer: 0,
          explanation: '期末高频陷阱！终值定理的前提是 s·X(s) 的所有极点严格位于左半平面 Re{s} < 0（哪怕虚轴上有极点都不行，原点单极点已被乘 s 消去除外）。sin(ω₀t) 极点在虚轴 ±jω₀，t→∞ 永不收敛！'
        },
        compute(p) {
          const ts = M.linspace(0, 8, 300);
          const xArr = ts.map((t) => {
            const u = t - p.delay;
            if (u < 0) return 0;
            const v = 1 + Math.exp(p.sigma * u) * Math.cos(p.wd * u);
            return Math.max(-4, Math.min(4.5, v));
          });

          // Evaluate s*X(s) for real s in [0.02, 16] mapped onto [0, 8]
          const ss = M.linspace(0.02, 16, 220);
          const sXArr = ss.map((s) => {
            const term = (s * (s - p.sigma)) / (Math.pow(s - p.sigma, 2) + p.wd * p.wd);
            return Math.exp(-s * p.delay) * (1 + term);
          });

          const fvtValid = p.sigma < -0.001;
          const initTrue = p.delay > 0.01 ? 0.0 : 2.0;

          const cTime = ts.map((t, i) => [t, -1.1, xArr[i]]);
          const csX = ss.map((s, i) => [s * 0.5, 1.1, sXArr[i]]);

          return {
            scene: {
              axes: {
                x: { min: 0, max: 8, label: '时间 t (s)  /  缩放实变量 s/2' },
                y: { min: -1.7, max: 1.7, label: '时域轨迹 x(t) 与 s域函数 s·X(s)', ticks: [-1.1, 1.1], format: (v) => (v < 0 ? '时域x(t)' : 's域 sX(s)') },
                z: { min: -1.5, max: 4.2, label: '函数值' }
              },
              ribbons: [{ points: cTime, baseZ: 0, color: fvtValid ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.22)' }],
              curves: [
                { points: cTime, color: fvtValid ? '#34d399' : '#f43f5e', width: 3.0, glow: true, shadowXZ: true, label: '时域波形 x(t)' },
                { points: csX, color: '#fbbf24', width: 2.8, glow: true, label: '实轴曲线 s·X(s)' }
              ],
              markers: [
                { pos: [0, -1.1, initTrue], shape: 'dot', color: '#38bdf8', size: 6.5, label: `初值 x(0⁺)=${M.fmt(initTrue, 1)}` },
                { pos: [0.01, 1.1, sXArr[0]], shape: 'diamond', color: '#fbbf24', size: 7, label: `lim_{s→0}sX=1.0` }
              ],
              legend: [
                { color: fvtValid ? '#34d399' : '#f43f5e', label: '时域 x(t) (观察 t→0⁺ 与 t→∞)' },
                { color: '#fbbf24', label: 's·X(s) (s→∞得初值, s→0得终值)' }
              ]
            },
            plots2d: [
              { title: `时域波形 x(t) ${fvtValid ? '(收敛于终值 1.0 ✓)' : '(振荡/发散，真实终值不存在!)'}`, xMin: 0, xMax: 8, yMin: -1.5, yMax: 4.2, xLabel: 't(s)', series: [{ points: ts.map((t, i) => [t, xArr[i]]), color: fvtValid ? '#34d399' : '#f43f5e', width: 2.2 }] },
              { title: '实正半轴 s·X(s) 曲线 (s→0 趋向 1，s→∞ 趋向初值 x(0⁺))', xMin: 0, xMax: 16, yMin: 0, yMax: 2.4, xLabel: 's', series: [{ points: ss.map((s, i) => [s, sXArr[i]]), color: '#fbbf24', fill: 'rgba(251,191,36,0.16)', width: 2.2 }] }
            ],
            metrics: [
              { label: '初值定理 lim_{s→∞}sX(s)', value: `${M.fmt(initTrue, 2)} = x(0⁺) ✓`, status: 'ok' },
              { label: '终值定理适用性', value: fvtValid ? '合法 ✓ (sX极点全在LHP)' : '失效警告 ✗ (极点 σ ≥ 0!)', status: fvtValid ? 'ok' : 'err' },
              { label: '真实终值 x(∞)', value: fvtValid ? '1.000' : p.sigma === 0 ? '等幅振荡无极限!' : '∞ 指数发散!' },
              { label: 's域极点坐标', value: `${M.fmt(p.sigma, 2)} ± j${M.fmt(p.wd, 2)}` }
            ]
          };
        }
      },

      /* ==================== 8.5 ==================== */
      {
        id: '8.5',
        code: 'Ch8-(7)',
        level: '掌握',
        title: '8.5 用拉普拉斯变换表征 LTI 系统：s-平面极点位置与时域模态全景对照',
        summary: '自由移动极点跨越左半平面、虚轴与右半平面，实时联动观察 3D |H(s)| 曲面与因果冲激响应 h(t) 的稳定性突变！',
        camera: { azimuth: -0.84, elevation: 0.5, zoom: 1.0 },
        presets: [
          { label: '左半平面共轭极点 (-0.5±j2.8)：衰减正弦稳定!', values: { sigma: -0.5, wd: 2.8 } },
          { label: '左半平面负实轴极点 (-1.1, 0)：纯指数单调稳定!', values: { sigma: -1.1, wd: 0.0 } },
          { label: '虚轴共轭极点 (0 ± j2.8)：等幅振荡临界稳定!', values: { sigma: 0.0, wd: 2.8 } },
          { label: '右半平面极点 (+0.3 ± j2.8)：指数增幅振荡失稳!', values: { sigma: 0.3, wd: 2.8 } }
        ],
        controls: [
          { key: 'sigma', label: '系统极点实部 σ (<0 稳定, =0 临界, >0 失稳发散!)', type: 'range', min: -1.5, max: 0.45, step: 0.05, default: -0.5 },
          { key: 'wd', label: '系统极点虚部 ω_d (=0 单实极点, >0 共轭振荡极点)', type: 'range', min: 0.0, max: 3.6, step: 0.2, default: 2.8, unit: 'rad/s' }
        ],
        theory: {
          formula: '因果 LTI 系统 BIBO 稳定  ⇔  H(s) 的全部极点严格位于 s 左半开平面 Re{p_i} < 0 （从而 ROC Re{s}>σ_max 包含 jω 轴）！',
          objectives: [
            '【掌握】利用系统函数 H(s) 的极点分布与收敛域直接判定连续 LTI 系统的因果性与稳定性；',
            '【理解】s 平面极点位置与时域单位冲激响应 h(t) 模态的精确对应（实部 σ 控制指数包络衰减/发散，虚部 ω_d 控制振荡快慢）！'
          ],
          guide3d: '三维空间左侧展示 s 平面极点曲面 |H(s)| 及 ROC 边界，下方同步展示因果冲激响应 h(t)：亲手将实部滑块 σ 从负值拉过 0 进入右半平面，直观感受极点越过虚轴瞬间引发的振荡失控！'
        },
        matlab(p) {
          return `% Ch8.5 s 平面极点分布与因果 LTI 系统单位冲激响应 h(t) 关系
sigma = ${M.fmt(p.sigma, 2)}; wd = ${M.fmt(p.wd, 2)};
${p.wd > 0.05 ? 'poles = [sigma + 1j*wd; sigma - 1j*wd]; b = [wd];' : 'poles = [sigma]; b = [1];'}
sys = tf(b, real(poly(poles)));
subplot(1,2,1); pzmap(sys); grid on; title('s 平面极点分布');
subplot(1,2,2); t = 0:0.01:7; impulse(sys, t); grid on; title('因果单位冲激响应 h(t)');`;
        },
        quiz: {
          question: '已知某连续时间 LTI 系统的系统函数为 H(s) = 1 / (s - 1)（极点在右半平面 s = +1）。下列说法中正确的是：',
          options: [
            '若该系统是因果系统（ROC: Re{s}>1），则必定不稳定；但若允许系统非因果（取 ROC: Re{s}<1 含虚轴），则该系统是 BIBO 稳定的！',
            '无论什么条件下，只要有右半平面极点，系统就绝对不可能稳定',
            '该系统可以同时是因果且稳定的',
            '其因果冲激响应为 -e^t u(-t)'
          ],
          answer: 0,
          explanation: '经典概念辨析！“极点全在左半平面”是【因果】LTI 系统稳定的充要条件；若不要求因果性，右半平面极点 s=1 选择左边收敛域 Re{s}<1 即可包含虚轴 σ=0，对应反因果稳定响应 h(t) = -e^t u(-t)！'
        },
        compute(p) {
          const poles = p.wd > 0.05 ? [{ re: p.sigma, im: p.wd }, { re: p.sigma, im: -p.wd }] : [{ re: p.sigma, im: 0 }];
          const gain = p.wd > 0.05 ? p.wd : 1.2;

          const sigs = M.linspace(-2.2, 1.4, 34);
          const ws = M.linspace(-4.2, 4.2, 36);
          const zm = sigs.map((sg) =>
            Float64Array.from(ws, (w) => Math.min(4.0, M.cAbs(M.evalZeroPole({ re: sg, im: w }, [], poles, gain))))
          );

          const isStable = p.sigma < -0.001;
          const jwLine = M.linspace(-4.2, 4.2, 160).map((w) => [0, w, Math.min(4.0, M.cAbs(M.evalZeroPole({ re: 0, im: w }, [], poles, gain))) + 0.04]);

          const ts = M.linspace(0, 7, 280);
          const hPts = [], envPos = [], envNeg = [];
          for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const env = Math.exp(p.sigma * t);
            const hv = p.wd > 0.05 ? env * Math.sin(p.wd * t) : env;
            hPts.push([t, Math.max(-4.5, Math.min(4.5, hv))]);
            envPos.push([t, Math.min(4.5, env)]);
            envNeg.push([t, Math.max(-4.5, -env)]);
          }

          return {
            scene: {
              axes: {
                x: { min: -2.2, max: 1.4, label: '实轴 σ (左半稳定 ← 0 → 右半失稳)' },
                y: { min: -4.2, max: 4.2, label: '虚轴 jω' },
                z: { min: 0, max: 4.2, label: '|H(s)| 幅值曲面' }
              },
              planes: [
                { axis: 'z', value: 0.02, xMin: p.sigma, xMax: 1.4, yMin: -4.2, yMax: 4.2, color: isStable ? 'rgba(52,211,153,0.22)' : 'rgba(244,63,94,0.20)', borderColor: isStable ? '#34d399' : '#f43f5e', dashed: true }
              ],
              surfaces: [{ xGrid: sigs, yGrid: ws, zMatrix: zm, zMin: 0, zMax: 3.6, opacity: 0.68, wireframe: true }],
              curves: [{ points: jwLine, color: isStable ? '#fbbf24' : '#f43f5e', width: 3.5, dashed: !isStable, glow: isStable, label: '虚轴 jω 截面' }],
              markers: poles.map((pl, idx) => ({ pos: [pl.re, pl.im, 0.06], shape: 'pole', color: '#f43f5e', size: 8.5, label: idx === 0 ? `p=${M.fmt(pl.re, 2)}${pl.im ? '±j' + M.fmt(Math.abs(pl.im), 1) : ''}` : '' })),
              legend: [
                { color: '#f43f5e', label: '系统极点 p_i', type: 'pole' },
                { color: isStable ? '#34d399' : '#f43f5e', label: `因果 ROC: Re{s} > ${M.fmt(p.sigma, 2)}` },
                { color: '#fbbf24', label: '虚轴 jω 轨迹' }
              ]
            },
            plots2d: [
              {
                title: `因果单位冲激响应 h(t) ${isStable ? '[衰减收敛 ✓]' : p.sigma === 0 ? '[等幅持续振荡!]' : '[指数失控发散 ✗]'}`,
                xMin: 0, xMax: 7, yMin: -3.2, yMax: 3.2, xLabel: 't(s)',
                series: [
                  { points: envPos, color: '#fbbf24', dashed: true, width: 1.3 },
                  ...(p.wd > 0.05 ? [{ points: envNeg, color: '#fbbf24', dashed: true, width: 1.3 }] : []),
                  { points: hPts, color: isStable ? '#34d399' : '#f43f5e', width: 2.3 }
                ]
              },
              {
                title: 's 平面极点位置示意图 (绿区为左半稳定半平面 Re{s}<0)',
                xMin: -2.2, xMax: 1.4, yMin: -4.2, yMax: 4.2, xLabel: 'σ',
                vBands: [{ from: -2.2, to: 0, color: 'rgba(52,211,153,0.14)' }],
                series: [{ points: poles.map((pl) => [pl.re, pl.im]), type: 'stems', color: '#f43f5e', radius: 4.5 }],
                vLines: [{ x: 0, color: '#fbbf24' }]
              }
            ],
            metrics: [
              { label: '因果系统稳定性', value: isStable ? '渐近 & BIBO 稳定 ✓' : Math.abs(p.sigma) < 1e-4 ? '临界稳定 (BIBO 不稳定!)' : '不稳定 (指数发散 ✗)', status: isStable ? 'ok' : 'err' },
              { label: '极点所在区域', value: p.sigma < 0 ? '左半开平面 LHP (σ<0)' : p.sigma === 0 ? '虚轴 jω (σ=0)' : '右半平面 RHP (σ>0)' },
              { label: '时域模态形式', value: p.wd > 0.05 ? `e^(${M.fmt(p.sigma, 2)}t)·sin(${M.fmt(p.wd, 1)}t)u(t)` : `e^(${M.fmt(p.sigma, 2)}t)u(t)` },
              { label: '因果收敛域 ROC', value: `Re{s} > ${M.fmt(p.sigma, 2)}` }
            ]
          };
        }
      },

      /* ==================== 8.6 ==================== */
      {
        id: '8.6',
        code: 'Ch8-(8)(9)',
        level: '掌握',
        title: '8.6 系统函数方框图（直接/级联/并联）与单边拉普拉斯变换求解全响应',
        summary: '利用单边拉氏变换微分性质 sY_u(s) - y(0⁻) 代数化求解含非零初始状态的二阶微分方程全响应！',
        presets: [
          { label: '含正初态储能 + 阶跃激励 (y(0⁻)=1.4, y\'(0⁻)=0)', values: { y0: 1.4, dy0: 0.0, xAmp: 1.0, p1: -1.0, p2: -2.5 } },
          { label: '含反向初速度冲击 (y(0⁻)=0, y\'(0⁻)=-3.0)', values: { y0: 0.0, dy0: -3.0, xAmp: 1.0, p1: -0.8, p2: -2.0 } },
          { label: '纯零输入放电过程 (激励 A=0)', values: { y0: 1.6, dy0: 1.5, xAmp: 0.0, p1: -0.8, p2: -2.2 } }
        ],
        controls: [
          { key: 'y0', label: '初始状态 y(0⁻)', type: 'range', min: -1.8, max: 1.8, step: 0.2, default: 1.4 },
          { key: 'dy0', label: '初始一阶导数 y\'(0⁻)', type: 'range', min: -3.5, max: 3.5, step: 0.5, default: 0.0 },
          { key: 'xAmp', label: '阶跃激励幅值 A·u(t)', type: 'range', min: 0.0, max: 2.0, step: 0.2, default: 1.0 },
          { key: 'p1', label: '实极点 1 (p₁)', type: 'range', min: -2.0, max: -0.4, step: 0.2, default: -1.0 },
          { key: 'p2', label: '实极点 2 (p₂)', type: 'range', min: -3.5, max: -0.8, step: 0.2, default: -2.5 }
        ],
        theory: {
          formula: 'L_u{dy/dt} = sY_u(s) - y(0⁻),  L_u{d²y/dt²} = s²Y_u(s) - sy(0⁻) - y\'(0⁻)  ⇒  Y_u(s) = Y_{zi}(s) + H(s)X_u(s)',
          objectives: [
            '【掌握】单边拉普拉斯变换的微分性质（自动嵌入 t=0⁻ 初始条件！）及求解非零初始状态线性常系数微分方程全响应的标准流程；',
            '【掌握】系统函数 H(s) 的三种代数等价方框图形式：直接型（多项式系数）、级联型（因式分解乘积 H₁(s)H₂(s)）、并联型（部分分式和 H₁(s)+H₂(s)）！'
          ],
          guide3d: '三维空间将单边拉氏变换代数拆分出的两条独立物理支路立体呈现：后排蓝色为初值多项式激发的 Y_{zi}(s)→y_{zi}(t)，中排琥珀色为系统函数乘积 H(s)X_u(s)→y_{zs}(t)，前排绿色为叠加全响应 y(t)！'
        },
        matlab(p) {
          return `% Ch8.6 单边拉普拉斯变换求解含初始状态 y(0-), y'(0-) 的二阶微分方程
p1 = ${M.fmt(p.p1, 2)}; p2 = ${M.fmt(p.p2, 2)};
a1 = -(p1 + p2); a0 = p1 * p2;         % y'' + a1*y' + a0*y = a0 * A * u(t)
y0 = ${M.fmt(p.y0, 2)}; dy0 = ${M.fmt(p.dy0, 2)}; A = ${M.fmt(p.xAmp, 2)};
% Y_zi(s) = (s*y0 + dy0 + a1*y0) / (s^2 + a1*s + a0)
% Y_zs(s) = (a0 * A) / (s * (s^2 + a1*s + a0))
[r_zi, poles_zi] = residue([y0, dy0 + a1*y0], [1, a1, a0]);
[r_zs, poles_zs] = residue([a0*A], [1, a1, a0, 0]);
t = 0:0.01:7;
y_zi = real(r_zi(1)*exp(poles_zi(1)*t) + r_zi(2)*exp(poles_zi(2)*t));
y_zs = real(r_zs(1)*exp(poles_zs(1)*t) + r_zs(2)*exp(poles_zs(2)*t) + r_zs(3)*exp(poles_zs(3)*t));
plot(t, y_zi, '--b', t, y_zs, '-.y', t, y_zi + y_zs, 'g', 'LineWidth', 2); grid on;
legend('单边拉氏零输入 y_{zi}(t)', '单边拉氏零状态 y_{zs}(t)', '全响应 y(t)');`;
        },
        quiz: {
          question: '已知 y(0⁻) = 2，则一阶导数 dy(t)/dt 的【单边拉普拉斯变换】为：',
          options: ['s Y_u(s) - 2', 's Y_u(s) + 2', 's Y_u(s) - 2s', 's Y_u(s)'],
          answer: 0,
          explanation: '由单边拉氏变换积分分部法：∫_{0⁻}^∞ y\'(t)e^{-st}dt = [y(t)e^{-st}]_{0⁻}^∞ + s∫_{0⁻}^∞ y(t)e^{-st}dt = sY_u(s) - y(0⁻) = sY_u(s) - 2！'
        },
        compute(p) {
          const p1 = Math.abs(p.p1 - p.p2) < 0.15 ? p.p1 - 0.2 : p.p1;
          const p2 = p.p2;
          const a1 = -(p1 + p2);
          const a0 = p1 * p2;

          // Y_zi(s) = (y0*s + dy0 + a1*y0) / ((s-p1)(s-p2))
          const numZI = (s) => p.y0 * s + p.dy0 + a1 * p.y0;
          const c1ZI = numZI(p1) / (p1 - p2);
          const c2ZI = numZI(p2) / (p2 - p1);

          // Y_zs(s) = (a0 * xAmp) / (s * (s-p1)(s-p2))
          const k0ZS = p.xAmp;
          const k1ZS = (a0 * p.xAmp) / (p1 * (p1 - p2));
          const k2ZS = (a0 * p.xAmp) / (p2 * (p2 - p1));

          const ts = M.linspace(0, 7, 260);
          const yZI = ts.map((t) => c1ZI * Math.exp(p1 * t) + c2ZI * Math.exp(p2 * t));
          const yZS = ts.map((t) => k0ZS + k1ZS * Math.exp(p1 * t) + k2ZS * Math.exp(p2 * t));
          const yTot = ts.map((_, i) => yZI[i] + yZS[i]);

          // Parallel form impulse responses h(t) = h1(t) + h2(t)
          const rPar1 = a0 / (p1 - p2);
          const rPar2 = a0 / (p2 - p1);
          const hPar1 = ts.map((t) => [t, rPar1 * Math.exp(p1 * t)]);
          const hPar2 = ts.map((t) => [t, rPar2 * Math.exp(p2 * t)]);

          const cZI = ts.map((t, i) => [t, 1.2, yZI[i]]);
          const cZS = ts.map((t, i) => [t, 0, yZS[i]]);
          const cTot = ts.map((t, i) => [t, -1.2, yTot[i]]);

          return {
            scene: {
              axes: {
                x: { min: 0, max: 7, label: '时间 t ≥ 0⁻ (s)' },
                y: { min: -1.8, max: 1.8, label: '单边拉氏分解支路', ticks: [-1.2, 0, 1.2], format: (v) => (v > 0.5 ? 'Y_zi→y_zi' : v < -0.5 ? '全响应y(t)' : 'H·X_u→y_zs') },
                z: { min: -2.5, max: 2.8, label: '响应幅值' }
              },
              ribbons: [{ points: cTot, baseZ: 0, color: 'rgba(52,211,153,0.22)' }],
              curves: [
                { points: cZI, color: '#38bdf8', width: 2.4, label: '零输入 y_zi(t)' },
                { points: cZS, color: '#fbbf24', width: 2.4, label: '零状态 y_zs(t)' },
                { points: cTot, color: '#34d399', width: 3.2, glow: true, shadowXZ: true, label: '全响应 y(t)' }
              ],
              legend: [
                { color: '#38bdf8', label: '初值多项式支路 y_zi(t)' },
                { color: '#fbbf24', label: '零状态支路 y_zs(t)' },
                { color: '#34d399', label: '单边拉氏全解 y(t)' }
              ]
            },
            plots2d: [
              {
                title: '单边拉氏全响应：y_zi [蓝虚] + y_zs [黄虚] = y(t) [绿]',
                xMin: 0, xMax: 7, yMin: -2.4, yMax: 2.8, xLabel: 't(s)',
                series: [
                  { points: ts.map((t, i) => [t, yZI[i]]), color: '#38bdf8', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, yZS[i]]), color: '#fbbf24', dashed: true, width: 1.7 },
                  { points: ts.map((t, i) => [t, yTot[i]]), color: '#34d399', width: 2.3 }
                ]
              },
              {
                title: `并联型方框图拆解 H(s) = ${M.fmt(rPar1, 2)}/(s-(${M.fmt(p1, 1)})) + (${M.fmt(rPar2, 2)})/(s-(${M.fmt(p2, 1)}))`,
                xMin: 0, xMax: 7, yMin: -2.2, yMax: 2.2, xLabel: 't(s)',
                series: [
                  { points: hPar1, color: '#38bdf8', width: 1.9 },
                  { points: hPar2, color: '#f43f5e', width: 1.9 }
                ]
              }
            ],
            metrics: [
              { label: '微分方程特征多项式', value: `s² + ${M.fmt(a1, 2)}s + ${M.fmt(a0, 2)}`, status: 'ok' },
              { label: '级联型因式分解', value: `${M.fmt(a0, 2)} / [(s+(${M.fmt(-p1, 1)}))(s+(${M.fmt(-p2, 1)}))]` },
              { label: '初值核验 y(0⁺)', value: `${M.fmt(yTot[0], 2)} (= y(0⁻) ✓)` },
              { label: '稳态终值 y(∞)', value: M.fmt(p.xAmp, 2) }
            ]
          };
        }
      }
    ]
  });
})();
