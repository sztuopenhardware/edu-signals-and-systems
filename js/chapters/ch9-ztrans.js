/**
 * 第 9 章：Z 变换 (Chapter 9) — 6 个 3D 交互仿真案例
 * 严格对标深圳技术大学《信号与系统》(SG00078) 大纲第 9 章全部 9 项教学内容
 */
(function () {
  'use strict';
  const M = window.SigSys.Math;

  window.SigSys.registerChapter({
    id: 'ch9',
    number: '第 9 章',
    title: '第 9 章：Z 变换',
    shortTitle: 'Ch9 Z变换与z平面',
    weeks: '第 17–18 周 · 4 学时',
    syllabusItems: 'Z变换与3D z平面曲面、环形收敛域ROC、部分分式与幂级数反变换、单位圆零极点几何求DTFT、s-z平面映射、离散LTI稳定性、单边Z变换',
    cases: [
      /* ==================== 9.1 ==================== */
      {
        id: '9.1',
        code: 'Ch9-(1)(2)',
        level: '掌握',
        title: '9.1 Z 变换 3D z-平面幅值曲面 |X(z)|、单位圆截面与环形收敛域 (ROC)',
        summary: '三维几何巅峰：z 平面上方立起 |X(z)| 极零点山峰，底面呈现圆外/圆内/圆环收敛域 ROC，而沿单位圆 |z|=1 切出的金色皇冠正是 DTFT |X(e^{jω})|！',
        camera: { azimuth: -0.82, elevation: 0.54, zoom: 1.0 },
        presets: [
          { label: '因果右边稳定序列 (极点 r=0.68，ROC: |z|>0.68 含单位圆!)', values: { seqKind: 'right', r1: 0.68, r2: 1.35, thPi: 0.35 } },
          { label: '发散因果序列 (极点 r=1.18，ROC: |z|>1.18 不含单位圆，DTFT发散!)', values: { seqKind: 'right', r1: 1.18, r2: 1.4, thPi: 0.35 } },
          { label: '双边序列环形收敛域 (0.55 < |z| < 1.35，含单位圆稳定!)', values: { seqKind: 'annulus', r1: 0.55, r2: 1.35, thPi: 0.0 } },
          { label: '反因果左边序列 (ROC: |z| < r₁ 圆盘内部)', values: { seqKind: 'left', r1: 1.25, r2: 1.4, thPi: 0.3 } }
        ],
        controls: [
          {
            key: 'seqKind', label: '离散序列类型与 ROC 几何形态', type: 'select', default: 'right',
            options: [
              { value: 'right', label: '右边因果序列：ROC 为最外极点圆外部 |z| > r_max' },
              { value: 'left', label: '左边反因果序列：ROC 为最内极点圆内部 |z| < r_min' },
              { value: 'annulus', label: '双边序列：ROC 为两同心圆之间的圆环 r₁ < |z| < r₂' }
            ]
          },
          { key: 'r1', label: '主极点模长 r₁', type: 'range', min: 0.35, max: 1.35, step: 0.05, default: 0.68 },
          { key: 'thPi', label: '共轭极点幅角 θ₀ (×π，=0 为单实极点)', type: 'range', min: 0.0, max: 0.9, step: 0.05, default: 0.35 },
          { key: 'r2', label: '外极点模长 r₂ (双边圆环模式)', type: 'range', min: 1.05, max: 1.6, step: 0.05, default: 1.35 }
        ],
        theory: {
          formula: 'X(z) = ∑_{n=-∞}^{+∞} x[n] z^{-n} = DTFT{ x[n]r^{-n} } (z = re^{jω})；  当且仅当 ROC 包含单位圆 |z|=1 时 DTFT 存在！',
          objectives: [
            '【掌握】双边 Z 变换的定义、以原点为中心的环形收敛域（ROC）性质及常用序列的 Z 变换；',
            '【理解】Z 变换与离散时间傅里叶变换（DTFT）的几何关系：X(e^{jω}) = X(z)|_{z=e^{jω}}，即三维 |X(z)| 曲面与单位圆柱 |z|=1 的交线！'
          ],
          guide3d: '观察底面复 z 平面：① 绿色半透明环域即为收敛域 ROC；② 白色虚线圆为单位圆 |z|=1；③ 当 ROC 覆盖单位圆时，三维曲面上沿 |z|=1 浮现明亮金色皇冠曲线（即 DTFT！）；点击【复平面俯视】立即切换为教材标准零极点圆环 ROC 图！'
        },
        matlab(p) {
          return `% Ch9.1 Z 变换三维幅值曲面 |X(z)| 与单位圆 |z|=1 截面 DTFT
[reZ, imZ] = meshgrid(-1.7:0.06:1.7, -1.7:0.06:1.7);
z = reZ + 1j * imZ;
r1 = ${M.fmt(p.r1, 2)}; th = ${M.fmt(p.thPi * Math.PI, 3)};
p1 = r1 * exp(1j*th); p2 = r1 * exp(-1j*th);
X = z.^2 ./ ((z - p1) .* (z - p2));
surf(reZ, imZ, min(4.2, abs(X)), 'EdgeAlpha', 0.2); hold on;
w = linspace(-pi, pi, 200); zu = exp(1j*w);
plot3(real(zu), imag(zu), min(4.2, abs(zu.^2 ./ ((zu-p1).*(zu-p2)))), 'y', 'LineWidth', 3);
xlabel('Re\{z\}'); ylabel('Im\{z\}'); zlabel('|X(z)|'); view(-38, 34); grid on;`;
        },
        quiz: {
          question: '已知某离散序列的双边 Z 变换 X(z) 有两个极点 z₁ = 0.5 和 z₂ = 2。若该序列是绝对可和序列（即存在 DTFT），则 X(z) 的收敛域必定是：',
          options: ['0.5 < |z| < 2（唯一包含单位圆 |z| = 1 的同心圆环！）', '|z| > 2', '|z| < 0.5', '0 < |z| < ∞'],
          answer: 0,
          explanation: '序列绝对可和 ⇔ DTFT 存在 ⇔ Z 变换收敛域 ROC 必须包含单位圆 |z| = 1！在 0.5 与 2 划分的三个环形区域中，只有 0.5 < |z| < 2 包含 |z| = 1，对应一个双边稳定序列。'
        },
        compute(p) {
          let poles = [], zeros = [];
          let rIn = 0, rOut = 2.2;
          const th = p.thPi * Math.PI;

          if (p.seqKind === 'annulus') {
            const inner = Math.min(p.r1, p.r2 - 0.2);
            const outer = Math.max(p.r2, inner + 0.2);
            poles = [{ re: inner, im: 0 }, { re: outer, im: 0 }];
            zeros = [{ re: 0, im: 0 }, { re: 0, im: 0 }];
            rIn = inner;
            rOut = outer;
          } else {
            if (p.thPi > 0.02) {
              poles = [{ re: p.r1 * Math.cos(th), im: p.r1 * Math.sin(th) }, { re: p.r1 * Math.cos(th), im: -p.r1 * Math.sin(th) }];
              zeros = [{ re: 0, im: 0 }, { re: 0, im: 0 }];
            } else {
              poles = [{ re: p.r1, im: 0 }];
              zeros = [{ re: 0, im: 0 }];
            }
            if (p.seqKind === 'right') {
              rIn = p.r1;
              rOut = 2.2;
            } else {
              rIn = 0.0;
              rOut = p.r1;
            }
          }

          const gain = 0.85;
          const gxs = M.linspace(-1.7, 1.7, 36);
          const gys = M.linspace(-1.7, 1.7, 36);
          const ceiling = 4.0;
          const zm = gxs.map((rx) =>
            Float64Array.from(gys, (iy) => Math.min(ceiling, M.cAbs(M.evalZeroPole({ re: rx, im: iy }, zeros, poles, gain))))
          );

          const hasDTFT = rIn < 1.0 && rOut > 1.0;
          const ws = M.linspace(-Math.PI, Math.PI, 200);
          const unitCrown = ws.map((w) => {
            const z = M.cExp(0, w);
            const mag = Math.min(ceiling, M.cAbs(M.evalZeroPole(z, zeros, poles, gain)));
            return [z.re, z.im, mag + 0.05];
          });

          // Time sequence x[n] for 2D plot
          const pSeq = [];
          for (let n = -12; n <= 14; n++) {
            let v = 0;
            if (p.seqKind === 'annulus') {
              v = n >= 0 ? Math.pow(poles[0].re, n) : -Math.pow(poles[1].re, n);
            } else if (p.seqKind === 'right') {
              v = n >= 0 ? Math.pow(p.r1, n) * (p.thPi > 0.02 ? Math.cos(th * n) : 1) : 0;
            } else {
              v = n < 0 ? -Math.pow(p.r1, n) * (p.thPi > 0.02 ? Math.cos(th * n) : 1) : 0;
            }
            pSeq.push([n, Math.max(-3.5, Math.min(3.5, v))]);
          }

          return {
            scene: {
              axes: {
                x: { min: -1.7, max: 1.7, label: '实轴 Re{z}' },
                y: { min: -1.7, max: 1.7, label: '虚轴 Im{z}' },
                z: { min: 0, max: 4.2, label: '模曲面 |X(z)|' }
              },
              planes: [
                { type: 'annulus', rMin: rIn, rMax: Math.min(2.1, rOut), z: 0.01, color: hasDTFT ? 'rgba(52,211,153,0.24)' : 'rgba(251,191,36,0.20)' },
                { type: 'circle', cx: 0, cy: 0, z: 0.03, radius: 1.0, color: '#ffffff', width: 2.0, dashed: true }
              ],
              surfaces: [{ xGrid: gxs, yGrid: gys, zMatrix: zm, zMin: 0, zMax: 3.6, opacity: 0.67, wireframe: true }],
              curves: [
                {
                  points: unitCrown,
                  color: hasDTFT ? '#fbbf24' : '#f43f5e',
                  width: 3.8,
                  dashed: !hasDTFT,
                  glow: hasDTFT,
                  label: hasDTFT ? '单位圆截面 = DTFT |X(e^{jω})|' : '单位圆不在 ROC 内!'
                }
              ],
              markers: [
                ...poles.map((pl, idx) => ({ pos: [pl.re, pl.im, 0.06], shape: 'pole', color: '#f43f5e', size: 8, label: idx === 0 ? `极点 |p|=${M.fmt(Math.hypot(pl.re, pl.im), 2)}` : '' })),
                { pos: [0, 0, 0.06], shape: 'zero', color: '#38bdf8', size: 7, label: '零点 z=0' }
              ],
              legend: [
                { color: '#f43f5e', label: '极点 ×', type: 'pole' },
                { color: '#34d399', label: '环形阴影：收敛域 ROC' },
                { color: hasDTFT ? '#fbbf24' : '#f43f5e', label: hasDTFT ? '|z|=1 皇冠 = DTFT' : 'DTFT 不收敛!' }
              ]
            },
            plots2d: [
              { title: '对应时域离散序列 x[n]', xMin: -12, xMax: 14, yMin: -3.2, yMax: 3.2, xLabel: 'n', series: [{ points: pSeq, type: 'stems', color: '#38bdf8' }] },
              {
                title: hasDTFT ? '沿单位圆 |z|=1 展开所得 DTFT |X(e^{jω})|' : '沿 |z|=1 的代数模值 (警告：因 ROC 不含单位圆，DTFT发散!)',
                xMin: -1, xMax: 1, yMin: 0, yMax: 4.2, xLabel: '×π',
                series: [{ points: ws.map((w, i) => [w / Math.PI, unitCrown[i][2]]), color: hasDTFT ? '#fbbf24' : '#f43f5e', dashed: !hasDTFT, fill: 'rgba(251,191,36,0.16)', width: 2.3 }]
              }
            ],
            metrics: [
              { label: '环形收敛域 ROC', value: p.seqKind === 'annulus' ? `${M.fmt(rIn, 2)} < |z| < ${M.fmt(rOut, 2)}` : p.seqKind === 'right' ? `|z| > ${M.fmt(rIn, 2)}` : `|z| < ${M.fmt(rOut, 2)}`, status: 'ok' },
              { label: 'DTFT 是否收敛存在', value: hasDTFT ? '收敛 ✓ (ROC 含单位圆 |z|=1)' : '发散 ✗ (ROC 不含单位圆)', status: hasDTFT ? 'ok' : 'err' },
              { label: '序列因果/双边性', value: p.seqKind === 'right' ? '因果右边序列' : p.seqKind === 'left' ? '反因果左边序列' : '双边序列' },
              { label: '极点与原点零点', value: `${poles.length} 极点 · 原点零点` }
            ]
          };
        }
      },

      /* ==================== 9.2 ==================== */
      {
        id: '9.2',
        code: 'Ch9-(3)(6)',
        level: '掌握',
        title: '9.2 Z 反变换（部分分式法与幂级数展开）：同一 X(z) 的三种圆环 ROC 序列',
        summary: '将 X(z)/z 部分分式展开求留数，对比同一代数式 X(z) 在外圆域、中间环域与内圆盘三种 ROC 下的完全不同序列 x[n]！',
        presets: [
          { label: 'ROC ② 中间环：0.6 < |z| < 1.4 (唯一含单位圆稳定双边序列!)', values: { rocSel: 2, p1: 0.6, p2: 1.4 } },
          { label: 'ROC ① 外圆域：|z| > 1.4 (因果右边序列，可用 z⁻¹ 长除法!)', values: { rocSel: 1, p1: 0.6, p2: 1.4 } },
          { label: 'ROC ③ 内圆盘：|z| < 0.6 (反因果左边序列，按 z 正幂展开!)', values: { rocSel: 3, p1: 0.6, p2: 1.4 } }
        ],
        controls: [
          {
            key: 'rocSel', label: '选择环形收敛域 ROC', type: 'select', default: 2,
            options: [
              { value: 1, label: 'ROC ①：|z| > p₂  [因果右边序列：两项均展开为 z⁻¹ 幂级数]' },
              { value: 2, label: 'ROC ②：p₁ < |z| < p₂  [双边序列：p₁取右边u[n]，p₂取左边-u[-n-1]]' },
              { value: 3, label: 'ROC ③：|z| < p₁  [反因果左边序列：两项均取 -u[-n-1]]' }
            ]
          },
          { key: 'p1', label: '内圆实极点 p₁ (< 1)', type: 'range', min: 0.3, max: 0.85, step: 0.05, default: 0.6 },
          { key: 'p2', label: '外圆实极点 p₂ (> 1)', type: 'range', min: 1.15, max: 1.65, step: 0.05, default: 1.4 }
        ],
        theory: {
          formula: '1 / (1 - a·z⁻¹) ──►  +aⁿ u[n] [当 |z|>|a|]   或   -aⁿ u[-n-1] [当 |z|<|a|]！  （技巧：先对 X(z)/z 展开再乘回 z！）',
          objectives: [
            '【掌握】用部分分式展开法（对 z⁻¹ 或对 X(z)/z 展开）结合各极点收敛域查常用 Z 变换对求 Z 反变换；',
            '【了解】幂级数长除法（右边序列按 z⁻¹ 降幂相除得 n≥0 项；左边序列按 z 升幂相除得 n≤0 项）与留数围道积分法。'
          ],
          guide3d: '三维空间并排陈列同一个 X(z) = z(2z - 1)/[(z-p₁)(z-p₂)] 在三种 ROC 下的离散针状序列：绿色粗针为当前选中 ROC 对应的真实序列 x[n]，其余两排为另外两种 ROC 的对照序列！'
        },
        matlab(p) {
          return `% Ch9.2 部分分式法 residuez() 与幂级数长除法 deconv/impz 求 Z 反变换
p1 = ${M.fmt(p.p1, 2)}; p2 = ${M.fmt(p.p2, 2)};
% X(z) = (2 - z^-1) / ((1 - p1*z^-1)*(1 - p2*z^-1))
b = [2, -1]; a = conv([1, -p1], [1, -p2]);
[r, poles, k] = residuez(b, a)     % 按 z^-1 部分分式展开求留数 A1, A2!
% 对因果右边 ROC |z| > p2，可直接用幂级数展开/滤波求前 12 项:
x_causal = impz(b, a, 12);
stem(0:11, x_causal, 'filled'); grid on; title('部分分式与幂级数展开验证');`;
        },
        quiz: {
          question: '已知 X(z) = 1 / (1 - 2z⁻¹)，且收敛域为 |z| < 2，则其 Z 反变换序列 x[n] 为：',
          options: [
            '-2ⁿ u[-n - 1]（注意：n < 0 时 2ⁿ 随 n→-∞ 指数衰减，绝对可和！）',
            '2ⁿ u[n]',
            '-2ⁿ u[n]',
            '(0.5)ⁿ u[n]'
          ],
          answer: 0,
          explanation: '高频易错题！极点在 z = 2，因为 ROC 为 |z| < 2（圆内部），对应左边序列 x[n] = -aⁿ u[-n-1] = -2ⁿ u[-n-1]；同时由于 |z|=1 在 |z|<2 内，该反因果序列是绝对可和稳定的！'
        },
        compute(p) {
          const p1 = p.p1, p2 = p.p2;
          // X(z)/z = (2z - 1)/((z - p1)(z - p2)) => X(z) = A1*z/(z-p1) + A2*z/(z-p2)
          const A1 = (2 * p1 - 1) / (p1 - p2);
          const A2 = (2 * p2 - 1) / (p2 - p1);

          const sel = Number(p.rocSel);
          const clamp = (v) => Math.max(-3.6, Math.min(3.6, v));
          const s1 = [], s2 = [], s3 = [], pAct = [];

          for (let n = -8; n <= 8; n++) {
            const v1 = clamp(n >= 0 ? A1 * Math.pow(p1, n) + A2 * Math.pow(p2, n) : 0);
            const v2 = clamp((n >= 0 ? A1 * Math.pow(p1, n) : 0) + (n < 0 ? -A2 * Math.pow(p2, n) : 0));
            const v3 = clamp(n < 0 ? -A1 * Math.pow(p1, n) - A2 * Math.pow(p2, n) : 0);
            s1.push([n, 1.3, v1]);
            s2.push([n, 0, v2]);
            s3.push([n, -1.3, v3]);
            pAct.push([n, sel === 1 ? v1 : sel === 2 ? v2 : v3]);
          }

          return {
            scene: {
              axes: {
                x: { min: -8, max: 8, label: '离散序号 n' },
                y: { min: -1.9, max: 1.9, label: '三种环形 ROC 对应的序列', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? 'ROC①圆外' : v < -0.6 ? 'ROC③圆内' : 'ROC②圆环') },
                z: { min: -3.6, max: 3.6, label: '序列值 x[n] (截幅显示)' }
              },
              stems: [
                { points: s1, baseZ: 0, color: sel === 1 ? '#34d399' : 'rgba(56,189,248,0.42)', width: sel === 1 ? 2.6 : 1.5, radius: sel === 1 ? 4.4 : 2.8, label: 'ROC① 因果序列' },
                { points: s2, baseZ: 0, color: sel === 2 ? '#34d399' : 'rgba(251,191,36,0.42)', width: sel === 2 ? 2.6 : 1.5, radius: sel === 2 ? 4.4 : 2.8, label: 'ROC② 双边稳定序列' },
                { points: s3, baseZ: 0, color: sel === 3 ? '#34d399' : 'rgba(244,63,94,0.42)', width: sel === 3 ? 2.6 : 1.5, radius: sel === 3 ? 4.4 : 2.8, label: 'ROC③ 反因果序列' }
              ],
              legend: [
                { color: '#34d399', label: '当前选中 ROC 反变换序列 x[n]' },
                { color: '#38bdf8', label: '其余两种 ROC 对照序列' }
              ]
            },
            plots2d: [
              { title: `当前选中 ROC 下的精确序列 x[n] (A₁=${M.fmt(A1, 2)}, A₂=${M.fmt(A2, 2)})`, xMin: -8, xMax: 8, yMin: -3.6, yMax: 3.6, xLabel: 'n', series: [{ points: pAct, type: 'stems', color: '#34d399' }] },
              {
                title: '极点模半径与单位圆 |z|=1 位置对照',
                xMin: 0, xMax: 2.0, yMin: -1, yMax: 1, xLabel: '|z|',
                vBands: [{ from: sel === 1 ? p2 : sel === 2 ? p1 : 0, to: sel === 1 ? 2.0 : sel === 2 ? p2 : p1, color: 'rgba(52,211,153,0.22)' }],
                series: [{ points: [[p1, 0], [p2, 0]], type: 'stems', color: '#f43f5e', radius: 4.5 }],
                vLines: [{ x: 1.0, color: '#fbbf24' }]
              }
            ],
            metrics: [
              { label: '部分分式系数 A₁, A₂', value: `A₁=${M.fmt(A1, 2)}, A₂=${M.fmt(A2, 2)}`, status: 'ok' },
              { label: '因果性 (x[n<0]=0)', value: sel === 1 ? '因果序列 ✓' : '非因果序列', status: sel === 1 ? 'ok' : 'warn' },
              { label: '稳定性 (含 |z|=1)', value: sel === 2 ? '绝对可和稳定 ✓ (p₁<1<p₂)' : '发散序列 ✗ (不含单位圆)', status: sel === 2 ? 'ok' : 'err' },
              { label: '幂级数验证 x[0]', value: sel === 1 ? M.fmt(A1 + A2, 2) : sel === 2 ? M.fmt(A1, 2) : '0.00' }
            ]
          };
        }
      },

      /* ==================== 9.3 ==================== */
      {
        id: '9.3',
        code: 'Ch9-(4)',
        level: '掌握',
        title: '9.3 由 z-平面零极点图沿单位圆对 DTFT 进行 3D 几何向量求值',
        summary: '让测试点 e^{jω₀} 沿单位圆旋转一周：实时观察零极点向量长度比如何雕刻出数字陷波器、谐振器与高低通幅频皇冠！',
        camera: { azimuth: -0.76, elevation: 0.48, zoom: 1.0 },
        presets: [
          { label: '二阶数字陷波器 Notch (单位圆零点 e^{±j0.4π} 彻底消除特定频率!)', values: { fKind: 'notch', wPi: 0.4, rPole: 0.85, thPi: 0.4 } },
          { label: '二阶数字带通谐振器 (零点 ±1，极点靠近单位圆!)', values: { fKind: 'resonator', wPi: 0.4, rPole: 0.86, thPi: 0.4 } },
          { label: '一阶数字全通滤波器 (极点 r 与倒数零点 1/r 对称 → |H|≡1!)', values: { fKind: 'allpass', wPi: 0.3, rPole: 0.65, thPi: 0.0 } }
        ],
        controls: [
          {
            key: 'fKind', label: '数字零极点滤波器类型', type: 'select', default: 'notch',
            options: [
              { value: 'notch', label: '数字窄带陷波器：单位圆零点 e^{±jθ₀} + 紧邻极点 r·e^{±jθ₀}' },
              { value: 'resonator', label: '数字带通谐振器：零点 z=±1 + 极点 r·e^{±jθ₀}' },
              { value: 'allpass', label: '数字全通滤波器：极点 r，零点 1/r (共轭倒数对!)' }
            ]
          },
          { key: 'wPi', label: '单位圆测试角频率 ω₀ (×π rad)', type: 'range', min: -1.0, max: 1.0, step: 0.04, default: 0.4 },
          { key: 'rPole', label: '极点半径 r (<1 越靠近1陷波/谐振越尖锐!)', type: 'range', min: 0.45, max: 0.94, step: 0.03, default: 0.85 },
          { key: 'thPi', label: '零/极点特征角 θ₀ (×π rad)', type: 'range', min: 0.1, max: 0.9, step: 0.05, default: 0.4 }
        ],
        theory: {
          formula: '|H(e^{jω₀})| = |K| · (∏ |e^{jω₀} - z_i|) / (∏ |e^{jω₀} - p_i|)；   注意原点 z=0 处的零极点到单位圆距离恒为 1，不影响幅频！',
          objectives: [
            '【掌握】由 z 平面零极点分布沿单位圆 z = e^{jω} 几何确定离散系统幅频与相频特性的完整方法；',
            '【理解】为什么 z=0 处的零点或极点只附加线性相位而完全不改变幅度谱 |H(e^{jω})|（因为 |e^{jω} - 0| ≡ 1）！'
          ],
          guide3d: '拖动【测试角频率 ω₀】滑块让金色特征点绕单位圆运动：当它经过单位圆上的零点 ○ 时，青色向量缩为 0，皇冠瞬间触底归零（陷波！）；当它掠过红色极点 × 附近时，红色向量变短，皇冠耸起谐振尖峰！'
        },
        matlab(p) {
          return `% Ch9.3 由 z 平面零极点沿单位圆几何求值 DTFT
r = ${M.fmt(p.rPole, 2)}; th0 = ${M.fmt(p.thPi * Math.PI, 3)}; w0 = ${M.fmt(p.wPi * Math.PI, 3)};
${p.fKind === 'notch' ? 'z_zeros = [exp(1j*th0); exp(-1j*th0)]; z_poles = [r*exp(1j*th0); r*exp(-1j*th0)]; K = 1;' :
  p.fKind === 'resonator' ? 'z_zeros = [1; -1]; z_poles = [r*exp(1j*th0); r*exp(-1j*th0)]; K = (1-r);' :
  'z_zeros = [1/r]; z_poles = [r]; K = r;'}
b = K * real(poly(z_zeros)); a = real(poly(z_poles));
subplot(1,2,1); zplane(b, a); title('z平面零极点图');
subplot(1,2,2); [H, w] = freqz(b, a, 512, 'whole'); plot((w-pi)/pi, fftshift(abs(H)), 'g', 'LineWidth', 2); grid on;`;
        },
        quiz: {
          question: '在 z 平面原点 z = 0 处增加一个极点（即系统函数乘以 z⁻¹），对离散系统的频率响应 H(e^{jω}) 有什么影响？',
          options: [
            '幅频特性 |H(e^{jω})| 完全不变（因为原点到单位圆任意点距离 |e^{jω} - 0| ≡ 1），仅相位谱增加线性相移 -ω（时域延迟 1 拍）！',
            '在低频 ω = 0 处产生无穷大谐振峰',
            '系统变为不稳定系统',
            '高频分量衰减一半'
          ],
          answer: 0,
          explanation: '这是 z 平面与 s 平面的重大区别！s=0 在虚轴上会产生直流极点，而 z=0 位于单位圆圆心，到单位圆 e^{jω} 各点向量长度恒为 1，故 z⁻¹ 是纯单位延时器，幅度恒为 1！'
        },
        compute(p) {
          const th0 = p.thPi * Math.PI;
          const w0 = p.wPi * Math.PI;
          let zeros = [], poles = [], gain = 1;

          if (p.fKind === 'notch') {
            zeros = [{ re: Math.cos(th0), im: Math.sin(th0) }, { re: Math.cos(th0), im: -Math.sin(th0) }];
            poles = [{ re: p.rPole * Math.cos(th0), im: p.rPole * Math.sin(th0) }, { re: p.rPole * Math.cos(th0), im: -p.rPole * Math.sin(th0) }];
            gain = 1.0;
          } else if (p.fKind === 'resonator') {
            zeros = [{ re: 1, im: 0 }, { re: -1, im: 0 }];
            poles = [{ re: p.rPole * Math.cos(th0), im: p.rPole * Math.sin(th0) }, { re: p.rPole * Math.cos(th0), im: -p.rPole * Math.sin(th0) }];
            gain = (1 - p.rPole) * 1.3;
          } else {
            zeros = [{ re: 1 / p.rPole, im: 0 }];
            poles = [{ re: p.rPole, im: 0 }];
            gain = p.rPole;
          }

          const ws = M.linspace(-Math.PI, Math.PI, 240);
          const crown = [], pMag = [], pPh = [];
          for (let i = 0; i < ws.length; i++) {
            const w = ws[i];
            const z = M.cExp(0, w);
            const H = M.evalZeroPole(z, zeros, poles, gain);
            const mag = Math.min(3.5, M.cAbs(H));
            crown.push([z.re, z.im, mag]);
            pMag.push([w / Math.PI, mag]);
            pPh.push([w / Math.PI, M.cArg(H)]);
          }

          const zTest = M.cExp(0, w0);
          const Htest = M.evalZeroPole(zTest, zeros, poles, gain);
          const magTest = Math.min(3.5, M.cAbs(Htest));

          const vectors = [
            ...zeros.map((zr) => ({ from: [zr.re, zr.im, 0.02], to: [zTest.re, zTest.im, 0.02], color: '#38bdf8', width: 2.2 })),
            ...poles.map((pl) => ({ from: [pl.re, pl.im, 0.02], to: [zTest.re, zTest.im, 0.02], color: '#f43f5e', width: 2.4 })),
            { from: [zTest.re, zTest.im, 0], to: [zTest.re, zTest.im, magTest], color: '#fbbf24', width: 3.1, label: `|H|=${M.fmt(magTest, 2)}` }
          ];

          return {
            scene: {
              axes: {
                x: { min: -1.65, max: 1.65, label: '实轴 Re{z}' },
                y: { min: -1.65, max: 1.65, label: '虚轴 Im{z}' },
                z: { min: 0, max: 3.6, label: '单位圆幅频 |H(e^{jω})|' }
              },
              planes: [{ type: 'circle', cx: 0, cy: 0, z: 0.01, radius: 1.0, color: '#94a3b8', width: 1.8, dashed: true }],
              ribbons: [{ points: crown, baseZ: 0, color: 'rgba(52,211,153,0.24)' }],
              curves: [{ points: crown, color: '#34d399', width: 3.2, glow: true, label: '|H(e^{jω})|' }],
              vectors,
              markers: [
                ...poles.map((pl) => ({ pos: [pl.re, pl.im, 0.03], shape: 'pole', color: '#f43f5e', size: 8 })),
                ...zeros.map((zr) => ({ pos: [zr.re, zr.im, 0.03], shape: 'zero', color: '#38bdf8', size: 7.5 })),
                { pos: [zTest.re, zTest.im, 0.03], shape: 'dot', color: '#fbbf24', size: 6.5, label: `e^{j${M.fmt(p.wPi, 2)}π}` }
              ],
              legend: [
                { color: '#38bdf8', label: '零点向量 (e^{jω}-z_i)', type: 'zero' },
                { color: '#f43f5e', label: '极点向量 (e^{jω}-p_i)', type: 'pole' },
                { color: '#34d399', label: 'DTFT 皇冠 |H(e^{jω})|' }
              ]
            },
            plots2d: [
              { title: '展开幅频特性 |H(e^{jω})| (-π ~ +π)', xMin: -1, xMax: 1, yMin: 0, yMax: 3.5, xLabel: '×π', series: [{ points: pMag, color: '#34d399', fill: 'rgba(52,211,153,0.18)', width: 2.2 }], vLines: [{ x: p.wPi, color: '#fbbf24' }] },
              { title: '展开相频特性 ∠H(e^{jω}) (rad)', xMin: -1, xMax: 1, yMin: -3.3, yMax: 3.3, xLabel: '×π', series: [{ points: pPh, color: '#38bdf8', width: 2.0 }], vLines: [{ x: p.wPi, color: '#fbbf24' }] }
            ],
            metrics: [
              { label: `当前 |H(e^{j${M.fmt(p.wPi, 2)}π})|`, value: M.fmt(magTest, 3), status: 'ok' },
              { label: '陷波/谐振中心角', value: p.fKind === 'allpass' ? '全频段恒幅 1.000!' : `±${M.fmt(p.thPi, 2)}π rad` },
              { label: '极点模长 r', value: `${M.fmt(p.rPole, 2)} (因果稳定✓)` },
              { label: '3dB 带宽趋势', value: p.rPole > 0.88 ? '极窄带高 Q 值' : '中等带宽' }
            ]
          };
        }
      },

      /* ==================== 9.4 ==================== */
      {
        id: '9.4',
        code: 'Ch9-(5)',
        level: '理解',
        title: '9.4 Z 变换性质与拉氏变换的关系：s 平面到 z 平面的三维映射 z = e^{sT}',
        summary: '拖动渐变滑块亲眼见证连续 s 平面网格如何卷曲映射为离散 z 平面：左半平面卷入单位圆内部，虚轴卷成单位圆，右半平面落到单位圆外！',
        camera: { azimuth: -0.95, elevation: 0.62, zoom: 1.0 },
        presets: [
          { label: '完全映射至 z 平面 (morph = 1.0，看清左半平面卷入单位圆内!)', values: { morph: 1.0, sp: -0.6, wpPi: 0.45 } },
          { label: '原始连续 s 平面正交网格 (morph = 0.0)', values: { morph: 0.0, sp: -0.6, wpPi: 0.45 } },
          { label: '半途三维空间卷曲变形过程 (morph = 0.55!)', values: { morph: 0.55, sp: -0.6, wpPi: 0.45 } },
          { label: '右半平面失稳极点 σ=+0.35 → 映射到单位圆外 |z|>1!', values: { morph: 1.0, sp: 0.35, wpPi: 0.4 } }
        ],
        controls: [
          { key: 'morph', label: '空间保角映射进度：0 (s平面) ──► 1 (z=e^{sT} 平面)', type: 'range', min: 0, max: 1, step: 0.05, default: 1.0 },
          { key: 'sp', label: '测试极点实部 σ·T', type: 'range', min: -1.4, max: 0.45, step: 0.05, default: -0.6 },
          { key: 'wpPi', label: '测试极点虚部 ω·T (×π rad)', type: 'range', min: -0.95, max: 0.95, step: 0.05, default: 0.45 }
        ],
        theory: {
          formula: 'z = e^{sT} = e^{(σ+jω)T} = e^{σT} · e^{jωT}   ⇒   |z| = e^{σT},   ∠z = ωT！',
          objectives: [
            '【理解】Z 变换与拉普拉斯变换的映射关系（大纲理解目标 2）：① 虚轴 σ=0 映射为单位圆 |z|=1；② 左半稳定平面 σ<0 映射为单位圆内部 0<|z|<1；③ 右半平面 σ>0 映射为单位圆外部 |z|>1；④ s 平面每宽 2π/T 的水平条带多对一重叠映射到整个 z 平面（混叠的复变本质！）；',
            '【理解】Z 变换的移位、尺度 z/z₀、反褶 X(z⁻¹)、z域微分 -z dX/dz 与初值定理 x[0]=lim_{z→∞}X(z)。'
          ],
          guide3d: '来回拖动【空间保角映射进度】滑块：观察 s 平面上平行于虚轴的“等衰减竖直线 σ=常数”如何弯曲闭合成同心圆 |z|=e^{σT}，而“等频率水平线 ω=常数”如何辐射成从原点出发的射线 ∠z=ωT！'
        },
        matlab(p) {
          return `% Ch9.4 s 平面到 z 平面的映射关系 z = exp(s*T) 可视化
T = 1; sp = ${M.fmt(p.sp, 2)}; wp = ${M.fmt(p.wpPi * Math.PI, 3)};
s_pole = sp + 1j * wp;
z_pole = exp(s_pole * T);
subplot(1,2,1); plot([0 0], [-pi pi], 'y', 'LineWidth', 2); hold on;
plot(real(s_pole), imag(s_pole), 'rx', 'MarkerSize', 12, 'LineWidth', 2.5);
xlim([-1.6 0.8]); ylim([-pi pi]); grid on; title('连续 s 平面主带 (-\pi/T ~ +\pi/T)');
subplot(1,2,2); th = linspace(-pi, pi, 200); plot(cos(th), sin(th), 'y', 'LineWidth', 2); hold on;
plot(real(z_pole), imag(z_pole), 'rx', 'MarkerSize', 12, 'LineWidth', 2.5);
axis equal; xlim([-1.7 1.7]); ylim([-1.7 1.7]); grid on; title('映射后离散 z = e^{sT} 平面');`;
        },
        quiz: {
          question: '在冲激不变法映射 z = e^{sT} 下，连续 s 平面上的一条垂直线 σ = σ₀ < 0（左半平面等阻尼线）映射为 z 平面上的什么几何图形？',
          options: [
            '以原点为圆心、半径 r = e^{σ₀T} < 1（位于单位圆内部）的一个圆！',
            '单位圆外部的一个圆',
            '从原点出发的一条射线',
            '平行于虚轴的一条直线'
          ],
          answer: 0,
          explanation: 'z = e^{(σ₀ + jω)T} = e^{σ₀T} · e^{jωT}：由于 σ₀ < 0，模长 |z| = e^{σ₀T} < 1 为固定常数，而相角 ωT 随 ω 从 -π/T 到 π/T 旋转一整圈，因此映射为单位圆内的同心圆！'
        },
        compute(p) {
          const m = p.morph;
          const lerp3 = (sPt, zPt, lift = 0) => [
            (1 - m) * sPt[0] + m * zPt[0],
            (1 - m) * (sPt[1] / 2.2) + m * zPt[1],
            Math.sin(m * Math.PI) * lift
          ];

          const curves = [];
          const ws = M.linspace(-Math.PI, Math.PI, 120);

          // Constant-sigma vertical lines in LHP -> concentric circles inside unit circle
          const sigList = [-1.2, -0.7, -0.3, 0.0, 0.3];
          for (const sg of sigList) {
            const rad = Math.exp(sg);
            const pts = ws.map((w) => lerp3([sg, w], [rad * Math.cos(w), rad * Math.sin(w)], sg === 0 ? 0.35 : 0.15));
            const isImagAxis = Math.abs(sg) < 1e-4;
            curves.push({
              points: pts,
              color: isImagAxis ? '#fbbf24' : sg < 0 ? 'rgba(52,211,153,0.68)' : 'rgba(244,63,94,0.62)',
              width: isImagAxis ? 3.2 : 1.7,
              glow: isImagAxis,
              label: isImagAxis ? 'jω轴 → 单位圆 |z|=1' : `σ=${sg}`
            });
          }

          // Constant-omega horizontal lines -> radial rays
          const sigSpan = M.linspace(-1.5, 0.4, 50);
          for (const wFrac of [-0.75, -0.4, 0, 0.4, 0.75]) {
            const w = wFrac * Math.PI;
            const pts = sigSpan.map((sg) => {
              const rad = Math.exp(sg);
              return lerp3([sg, w], [rad * Math.cos(w), rad * Math.sin(w)], 0.08);
            });
            curves.push({ points: pts, color: 'rgba(56,189,248,0.45)', width: 1.3, dashed: true });
          }

          const wp = p.wpPi * Math.PI;
          const rPole = Math.exp(p.sp);
          const zPole = { re: rPole * Math.cos(wp), im: rPole * Math.sin(wp) };
          const pole3 = lerp3([p.sp, wp], [zPole.re, zPole.im], 0.25);

          return {
            scene: {
              axes: {
                x: { min: -1.7, max: 1.7, label: m < 0.5 ? 's平面实轴 σT' : 'z平面实轴 Re{z}' },
                y: { min: -1.7, max: 1.7, label: m < 0.5 ? 's平面虚轴 jωT (缩放)' : 'z平面虚轴 Im{z}' },
                z: { min: -0.2, max: 1.0, label: '保角映射空间高度' }
              },
              curves,
              markers: [
                { pos: pole3, shape: 'pole', color: '#f43f5e', size: 9, label: m < 0.5 ? `s=${M.fmt(p.sp, 2)}+j${M.fmt(p.wpPi, 2)}π` : `z=${M.fmt(rPole, 2)}∠${M.fmt(p.wpPi, 2)}π` }
              ],
              legend: [
                { color: '#fbbf24', label: '虚轴 σ=0 ↔ 单位圆 |z|=1' },
                { color: '#34d399', label: '左半平面 σ<0 ↔ 圆内 |z|<1' },
                { color: '#f43f5e', label: '测试极点映射位置', type: 'pole' }
              ]
            },
            plots2d: [
              {
                title: '源平面：连续 s 平面极点位置 (绿区为左半稳定平面 σ<0)',
                xMin: -1.6, xMax: 0.6, yMin: -3.2, yMax: 3.2, xLabel: 'σT',
                vBands: [{ from: -1.6, to: 0, color: 'rgba(52,211,153,0.16)' }],
                series: [{ points: [[p.sp, wp]], type: 'stems', color: '#f43f5e', radius: 5 }],
                vLines: [{ x: 0, color: '#fbbf24' }]
              },
              {
                title: `目标平面：z = e^{sT} 极点模长 |z| = e^{σT} = ${M.fmt(rPole, 3)}`,
                xMin: -1.6, xMax: 1.6, yMin: -1.6, yMax: 1.6, xLabel: 'Re{z}',
                series: [
                  { points: ws.map((w) => [Math.cos(w), Math.sin(w)]), color: '#fbbf24', dashed: true, width: 1.8 },
                  { points: [[zPole.re, zPole.im]], type: 'stems', color: '#f43f5e', radius: 5 }
                ]
              }
            ],
            metrics: [
              { label: '映射后极点模 |z|=e^{σT}', value: M.fmt(rPole, 3), status: rPole < 1 ? 'ok' : 'err' },
              { label: '映射后极点角 ∠z=ωT', value: `${M.fmt(p.wpPi, 2)}π rad (${M.fmt(p.wpPi * 180, 0)}°)` },
              { label: '稳定性保持性', value: p.sp < 0 ? 'LHP(σ<0) → 圆内(|z|<1) 稳定✓' : 'RHP(σ≥0) → 圆上/外 失稳✗', status: p.sp < 0 ? 'ok' : 'err' },
              { label: '多值周期带宽度', value: 'Δω = 2π/T (混叠周期)' }
            ]
          };
        }
      },

      /* ==================== 9.5 ==================== */
      {
        id: '9.5',
        code: 'Ch9-(7)',
        level: '掌握',
        title: '9.5 用 Z 变换表征离散 LTI 系统：极点分布图谱与单位取样响应 h[n]',
        summary: '完整覆盖离散系统稳定性判别：对比单位圆内、圆上、圆外，以及正实轴 vs 负实轴极点的单位取样响应 h[n]！',
        presets: [
          { label: '圆内共轭极点 (r=0.82, θ=0.25π)：衰减正弦因果稳定!', values: { r: 0.82, thPi: 0.25 } },
          { label: '圆内负实轴极点 (r=0.80, θ=π)：正负交替衰减稳定!', values: { r: 0.80, thPi: 1.0 } },
          { label: '单位圆上极点 (r=1.00, θ=0.25π)：等幅振荡临界稳定!', values: { r: 1.00, thPi: 0.25 } },
          { label: '单位圆外极点 (r=1.10, θ=0.25π)：指数增幅振荡失稳!', values: { r: 1.10, thPi: 0.25 } }
        ],
        controls: [
          { key: 'r', label: '极点模长 r (<1 因果稳定, =1 临界, >1 失稳发散!)', type: 'range', min: 0.3, max: 1.15, step: 0.02, default: 0.82 },
          { key: 'thPi', label: '极点角度 θ (×π rad，0=正实轴，1=负实轴)', type: 'range', min: 0.0, max: 1.0, step: 0.05, default: 0.25 }
        ],
        theory: {
          formula: '离散因果 LTI 系统 BIBO 稳定  ⇔  H(z) 的全部极点严格位于单位圆内部 |p_i| < 1 （ROC |z|>r_max 包含单位圆）！',
          objectives: [
            '【掌握】离散因果系统的代数有理 H(z) 因果性判据（分子关于 z 的最高次数 ≤ 分母次数，即 ROC 包含 z=∞）与稳定性判据（|p_i| < 1）；',
            '【理解】系统函数零极点分布与单位取样响应 h[n] 波形特征（衰减率 rⁿ、振荡频率 θ、奇偶交替符号）的一一对应。'
          ],
          guide3d: '三维空间将左侧单位圆零极点位置与右侧三维离散序列 h[n] 同台联动：拖动滑块 r 从 0.8 越过 1.0，亲眼观察红色极点跨出单位圆的瞬间，时域离散针状图由收敛变为爆炸增长！'
        },
        matlab(p) {
          return `% Ch9.5 离散 LTI 系统极点分布与单位取样响应 h[n] 稳定性判别
r = ${M.fmt(p.r, 2)}; th = ${M.fmt(p.thPi * Math.PI, 3)};
${p.thPi > 0.02 && p.thPi < 0.98 ? 'poles = [r*exp(1j*th); r*exp(-1j*th)];' : `poles = [${p.thPi >= 0.98 ? -p.r : p.r}];`}
a = real(poly(poles)); b = [1, zeros(1, length(poles))];
subplot(1,2,1); zplane(b, a); title('z平面极点与单位圆');
subplot(1,2,2); n = 0:24; stem(n, filter(b, a, [1 zeros(1,24)]), 'filled'); grid on; title('因果单位取样响应 h[n]');`;
        },
        quiz: {
          question: '有理系统函数 H(z) = z³ / (z² - 0.5z + 0.06) 所描述的离散 LTI 系统（取右边收敛域 |z| > 0.3）是否同时具有因果性与稳定性？',
          options: [
            '稳定（极点 0.2, 0.3 均在单位圆内），但【非因果】！（因为分子 z³ 次数高于分母 z²，z → ∞ 时 H(z) → ∞ 不收敛，h[-1] ≠ 0！）',
            '既因果又稳定',
            '因果但不稳定',
            '既非因果又不稳定'
          ],
          answer: 0,
          explanation: '经典陷阱题！离散有理系统因果的充要条件是 ROC 包含无穷远点 z = ∞，等价于有理分式分子多项式次数 ≤ 分母多项式次数！本题 H(z) ≈ z + 0.5 + ... 含 z^{+1} 正幂项，在 n = -1 处有超前脉冲！'
        },
        compute(p) {
          const th = p.thPi * Math.PI;
          const isConj = p.thPi > 0.02 && p.thPi < 0.98;
          const poles = isConj
            ? [{ re: p.r * Math.cos(th), im: p.r * Math.sin(th) }, { re: p.r * Math.cos(th), im: -p.r * Math.sin(th) }]
            : [{ re: p.thPi >= 0.98 ? -p.r : p.r, im: 0 }];

          const isStable = p.r < 0.999;
          const sTime3 = [], pTime2 = [];
          for (let n = 0; n <= 22; n++) {
            const env = Math.pow(p.r, n);
            const hn = isConj ? env * Math.cos(th * n) : Math.pow(poles[0].re, n);
            const cl = Math.max(-3.6, Math.min(3.6, hn));
            sTime3.push([-2.2 + (n / 22) * 4.4, -0.8, cl]);
            pTime2.push([n, cl]);
          }

          const ws = M.linspace(-Math.PI, Math.PI, 120);
          const uCircle3 = ws.map((w) => [Math.cos(w) * 1.1, 1.0 + Math.sin(w) * 0.55, 0]);

          return {
            scene: {
              axes: {
                x: { min: -2.4, max: 2.4, label: '离散时刻 n (0 ~ 22)  /  z平面实部' },
                y: { min: -1.6, max: 1.8, label: '前排响应 h[n]  /  后排 z平面单位圆' },
                z: { min: -3.6, max: 3.6, label: '单位取样响应 h[n]' }
              },
              curves: [{ points: uCircle3, color: '#fbbf24', width: 2.2, dashed: true, label: '单位圆参考环' }],
              stems: [
                {
                  points: sTime3,
                  baseZ: 0,
                  color: isStable ? '#34d399' : '#f43f5e',
                  width: 2.3,
                  radius: 4.0,
                  label: 'h[n]'
                }
              ],
              markers: poles.map((pl, idx) => ({
                pos: [pl.re * 1.1, 1.0 + pl.im * 0.55, 0.05],
                shape: 'pole',
                color: '#f43f5e',
                size: 8.5,
                label: idx === 0 ? `|p|=${M.fmt(p.r, 2)}` : ''
              })),
              legend: [
                { color: '#fbbf24', label: '后排：单位圆 |z|=1' },
                { color: '#f43f5e', label: '极点位置 p', type: 'pole' },
                { color: isStable ? '#34d399' : '#f43f5e', label: '前排：因果响应 h[n]' }
              ]
            },
            plots2d: [
              { title: `因果单位取样响应 h[n] ${isStable ? '(收敛稳定 ✓)' : p.r === 1 ? '(等幅持续振荡)' : '(发散失稳 ✗)'}`, xMin: 0, xMax: 22, yMin: -3.6, yMax: 3.6, xLabel: 'n', series: [{ points: pTime2, type: 'stems', color: isStable ? '#34d399' : '#f43f5e' }] },
              {
                title: 'z 平面极点与单位圆 |z|=1 对照',
                xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5, xLabel: 'Re{z}',
                series: [
                  { points: ws.map((w) => [Math.cos(w), Math.sin(w)]), color: '#fbbf24', dashed: true, width: 1.8 },
                  { points: poles.map((pl) => [pl.re, pl.im]), type: 'stems', color: '#f43f5e', radius: 5 }
                ]
              }
            ],
            metrics: [
              { label: '因果 BIBO 稳定性', value: isStable ? '稳定 ✓ (|p| < 1)' : Math.abs(p.r - 1) < 0.005 ? '临界稳定 (BIBO 不稳定!)' : '不稳定 ✗ (|p| > 1)', status: isStable ? 'ok' : 'err' },
              { label: '极点坐标 p', value: isConj ? `${M.fmt(p.r, 2)}·e^(±j${M.fmt(p.thPi, 2)}π)` : M.fmt(poles[0].re, 2) },
              { label: '序列振荡模式', value: p.thPi < 0.02 ? '正实指数单调模式' : p.thPi > 0.98 ? '负实极点奇偶交替模式!' : `周期 ${M.fmt(2 / p.thPi, 1)} 拍阻尼振荡` },
              { label: '因果 ROC 范围', value: `|z| > ${M.fmt(p.r, 2)} (含 z=∞ ✓)` }
            ]
          };
        }
      },

      /* ==================== 9.6 ==================== */
      {
        id: '9.6',
        code: 'Ch9-(8)(9)',
        level: '掌握',
        title: '9.6 离散系统方框图（直接 I/II 型）与单边 Z 变换求解含初态差分方程',
        summary: '应用单边 Z 变换延时性质 z⁻¹Y⁺(z) + y[-1]，一键分解含非零历史状态 y[-1], y[-2] 的差分方程全响应！',
        presets: [
          { label: '含历史初态 y[-1]=1.5, y[-2]=-0.8 + 阶跃输入', values: { ym1: 1.5, ym2: -0.8, xAmp: 1.0, r: 0.75, thPi: 0.3 } },
          { label: '纯零输入自由衰减序列 (输入幅值=0)', values: { ym1: 1.8, ym2: 0.5, xAmp: 0.0, r: 0.80, thPi: 0.25 } },
          { label: '纯零状态因果阶跃响应 (y[-1]=y[-2]=0)', values: { ym1: 0.0, ym2: 0.0, xAmp: 1.2, r: 0.78, thPi: 0.35 } }
        ],
        controls: [
          { key: 'ym1', label: '初始状态 y[-1]', type: 'range', min: -2.0, max: 2.0, step: 0.2, default: 1.5 },
          { key: 'ym2', label: '初始状态 y[-2]', type: 'range', min: -2.0, max: 2.0, step: 0.2, default: -0.8 },
          { key: 'xAmp', label: '阶跃输入幅值 A·u[n]', type: 'range', min: 0.0, max: 2.0, step: 0.2, default: 1.0 },
          { key: 'r', label: '极点模长 r', type: 'range', min: 0.35, max: 0.90, step: 0.05, default: 0.75 },
          { key: 'thPi', label: '极点角 θ (×π)', type: 'range', min: 0.1, max: 0.8, step: 0.05, default: 0.3 }
        ],
        theory: {
          formula: 'Z⁺{y[n-1]} = z⁻¹Y⁺(z) + y[-1],   Z⁺{y[n-2]} = z⁻²Y⁺(z) + z⁻¹y[-1] + y[-2]   ⇒   y[n] = y_{zi}[n] + y_{zs}[n]',
          objectives: [
            '【掌握】单边 Z 变换右移（延时）性质（天然嵌入初始松弛前的历史状态 y[-1], y[-2]！）及求解非零初始条件差分方程的标准步骤；',
            '【掌握】离散系统函数 H(z) 的直接 I 型、直接 II 型（典范型，最少延时单元 z⁻¹！）、级联型与并联型方框图实现。'
          ],
          guide3d: '三维空间沿深度轴 Y 分设三排离散针状图：后排蓝针为初始历史寄存器状态激发的零输入响应 y_{zi}[n]，中排黄针为外部阶跃激发的零状态响应 y_{zs}[n]，前排绿针为全响应 y[n] = y_{zi}[n] + y_{zs}[n]！'
        },
        matlab(p) {
          return `% Ch9.6 单边 Z 变换求解含非零初始状态 y[-1], y[-2] 的二阶差分方程
r = ${M.fmt(p.r, 2)}; th = ${M.fmt(p.thPi * Math.PI, 3)};
a1 = -2*r*cos(th); a2 = r^2; b0 = 1 + a1 + a2; % 直流增益归一化为 1
ym1 = ${M.fmt(p.ym1, 2)}; ym2 = ${M.fmt(p.ym2, 2)}; A = ${M.fmt(p.xAmp, 2)};
N = 22; y_zi = zeros(1,N); y_zs = zeros(1,N);
% 利用 filtic 将初始状态 y[-1], y[-2] 转换为直接 II 型等效初态向量!
zi_state = filtic([b0], [1, a1, a2], [ym1, ym2]);
y_zi = filter([b0], [1, a1, a2], zeros(1,N), zi_state);
y_zs = filter([b0], [1, a1, a2], A*ones(1,N));
n = 0:N-1; stem(n, y_zi + y_zs, 'g', 'filled'); hold on; stem(n, y_zi, 'b'); grid on;
legend('全响应 y[n]', '零输入分量 y_{zi}[n]');`;
        },
        quiz: {
          question: '用【直接 II 型（典范型）】方框图实现一个 3 阶分子、4 阶分母的有理离散系统 H(z) = (∑_{k=0}^3 b_k z^{-k}) / (1 + ∑_{k=1}^4 a_k z^{-k})，最少需要多少个单位延时器 z⁻¹？',
          options: ['4 个（直接 II 型合并前后延时链，所需延时器个数等于 max(M, N) = 4；而直接 I 型需 3+4=7 个！）', '7 个', '3 个', '12 个'],
          answer: 0,
          explanation: '利用 LTI 系统级联交换律，先过全极点反馈子系统 1/A(z)、再过全零点前馈子系统 B(z)，两条延时链共用同一组状态寄存器，所需延时单元最少，仅为阶数 max(M, N) = 4 个！'
        },
        compute(p) {
          const th = p.thPi * Math.PI;
          const a1 = -2 * p.r * Math.cos(th);
          const a2 = p.r * p.r;
          const b0 = 1 + a1 + a2; // DC gain = 1

          const N = 21;
          const sZI = [], sZS = [], sTot = [];
          const pZI = [], pZS = [], pTot = [];

          // Exact recursion for y_zi (x=0, with y[-1], y[-2]) and y_zs (x=A, zero IC)
          let zi_1 = p.ym1, zi_2 = p.ym2;
          let zs_1 = 0, zs_2 = 0;

          for (let n = 0; n < N; n++) {
            const vZI = -a1 * zi_1 - a2 * zi_2;
            const vZS = b0 * p.xAmp - a1 * zs_1 - a2 * zs_2;
            const vTot = vZI + vZS;
            zi_2 = zi_1; zi_1 = vZI;
            zs_2 = zs_1; zs_1 = vZS;

            sZI.push([n, 1.3, vZI]);
            sZS.push([n, 0, vZS]);
            sTot.push([n, -1.3, vTot]);
            pZI.push([n, vZI]);
            pZS.push([n, vZS]);
            pTot.push([n, vTot]);
          }

          return {
            scene: {
              axes: {
                x: { min: 0, max: 20, label: '离散时刻 n ≥ 0' },
                y: { min: -1.9, max: 1.9, label: '单边 Z 变换分解序列', ticks: [-1.3, 0, 1.3], format: (v) => (v > 0.6 ? 'y_zi[n]' : v < -0.6 ? '全解y[n]' : 'y_zs[n]') },
                z: { min: -2.5, max: 2.8, label: '序列值' }
              },
              stems: [
                { points: sZI, baseZ: 0, color: '#38bdf8', width: 1.9, radius: 3.4, label: '零输入序列 y_zi[n]' },
                { points: sZS, baseZ: 0, color: '#fbbf24', width: 1.9, radius: 3.4, label: '零状态序列 y_zs[n]' },
                { points: sTot, baseZ: 0, color: '#34d399', width: 2.5, radius: 4.3, label: '全响应 y[n]' }
              ],
              legend: [
                { color: '#38bdf8', label: `历史初态支路 y_zi[n]` },
                { color: '#fbbf24', label: '零状态支路 y_zs[n]' },
                { color: '#34d399', label: '全响应 y[n] = y_zi + y_zs' }
              ]
            },
            plots2d: [
              { title: '零输入序列 y_zi[n] [蓝] 与零状态序列 y_zs[n] [黄]', xMin: 0, xMax: 20, yMin: -2.4, yMax: 2.6, xLabel: 'n', series: [{ points: pZI, type: 'stems', color: '#38bdf8', radius: 2.8 }, { points: pZS, color: '#fbbf24', width: 1.9 }] },
              { title: '单边 Z 变换合成全响应序列 y[n]', xMin: 0, xMax: 20, yMin: -2.4, yMax: 2.8, xLabel: 'n', series: [{ points: pTot, type: 'stems', color: '#34d399' }] }
            ],
            metrics: [
              { label: '差分方程系数 a₁, a₂', value: `a₁=${M.fmt(a1, 2)}, a₂=${M.fmt(a2, 2)}`, status: 'ok' },
              { label: '直接 II 型最少延时器', value: '2 个 z⁻¹ 单元 (典范型)' },
              { label: '首拍核验 y[0]', value: M.fmt(pTot[0][1], 3) },
              { label: '稳态收敛值 y[∞]', value: M.fmt(p.xAmp, 2) }
            ]
          };
        }
      }
    ]
  });
})();
