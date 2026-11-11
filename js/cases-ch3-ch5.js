/**
 * 第三章 ~ 第五章 3D 交互式教学仿真案例实现（共 11 个实验案例）
 */
window.ProbLab = window.ProbLab || {};
window.ProbLab.CaseRegistry = window.ProbLab.CaseRegistry || {};

(function () {
  'use strict';

  const M = window.ProbLab.MathStats;
  const Reg = window.ProbLab.CaseRegistry;

  function clearSub(grp, engine) {
    while (grp.children.length > 0) {
      const ch = grp.children[0];
      grp.remove(ch);
      engine.disposeObjectTree(ch);
    }
  }

  // =========================================================================
  // 3-1: 二维随机变量联合分布律与联合分布函数 F(x,y)
  // =========================================================================
  Reg['3-1'] = {
    camera: { radius: 13.8, theta: 0.65, phi: 1.05, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'mode', label: '二维分布展示模式', value: 'cont_pdf',
        options: [
          { label: '连续型：联合密度 f(x,y) 西南象限积分体积', value: 'cont_pdf' },
          { label: '连续型：联合分布函数曲面 z = F(x,y) 单调爬升', value: 'cont_cdf' },
          { label: '离散型：二维联合分布律矩阵摩天楼 p_ij', value: 'disc' }
        ]
      },
      { type: 'slider', key: 'x0', label: '截断上限 x₀', min: -2.2, max: 2.4, step: 0.2, value: 0.6 },
      { type: 'slider', key: 'y0', label: '截断上限 y₀', min: -2.2, max: 2.4, step: 0.2, value: 0.8 },
      { type: 'slider', key: 'rho', label: '耦合相关度 ρ', min: -0.7, max: 0.7, step: 0.1, value: 0.3 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function approxJointCDF(x0, y0, rho) {
        // Numerical 2D midpoint integration on [-3.5, x0] x [-3.5, y0]
        if (x0 <= -3.5 || y0 <= -3.5) return 0;
        const nx = 32, ny = 32;
        const dx = (x0 - (-3.5)) / nx;
        const dy = (y0 - (-3.5)) / ny;
        let sum = 0;
        for (let i = 0; i < nx; i++) {
          const x = -3.5 + (i + 0.5) * dx;
          for (let j = 0; j < ny; j++) {
            const y = -3.5 + (j + 0.5) * dy;
            sum += M.bivariateNormalPDF(x, y, 0, 0, 1, 1, rho);
          }
        }
        return Math.min(1, Math.max(0, sum * dx * dy));
      }

      function render() {
        clearSub(grp, engine);
        const { x0, y0, rho } = state;

        grp.add(engine.createAxes3D({
          xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], zRange: [0, 3.8],
          xLabel: 'X (阈值电压)', yLabel: 'Y (漏电流)', zLabel: state.mode === 'cont_cdf' ? 'F(x,y)' : 'f(x,y) / p_ij'
        }));

        if (state.mode === 'cont_pdf') {
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, 1, 1, rho),
            xMin: -3.2, xMax: 3.2, nx: 56,
            yMin: -3.2, yMax: 3.2, ny: 56,
            zScale: 16.0,
            scheme: 'cyber',
            highlightFn: (x, y) => (x <= x0 && y <= y0),
            dimOpacityFactor: 0.22
          }));
          grp.add(engine.createSlicePlane({ axis: 'x', value: x0, uRange: [-3.2, y0], vRange: [0, 2.8], color: 0xfbbf24, opacity: 0.22 }));
          grp.add(engine.createSlicePlane({ axis: 'y', value: y0, uRange: [-3.2, x0], vRange: [0, 2.8], color: 0x34d399, opacity: 0.22 }));

          const Fxy = approxJointCDF(x0, y0, rho);
          grp.add(engine.createLabel(`西南象限体积 F(${x0.toFixed(1)}, ${y0.toFixed(1)}) = ${Fxy.toFixed(4)}`, [x0, y0, 3.1], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '联合分布值 F(x₀, y₀)', value: Fxy.toFixed(4), sub: `P(X≤${x0.toFixed(1)}, Y≤${y0.toFixed(1)})`, highlight: true },
            { label: '切点密度 f(x₀, y₀)', value: M.bivariateNormalPDF(x0, y0, 0, 0, 1, 1, rho).toFixed(4), sub: '∂²F / ∂x∂y' },
            { label: '边缘值 F_X(x₀)=F(x₀,+∞)', value: M.normalCDF(x0).toFixed(4), sub: '令 y→+∞ 所得边缘' },
            { label: '全空间总体积 F(+∞,+∞)', value: '1.0000', sub: '规范性公理' }
          ]);
        } else if (state.mode === 'cont_cdf') {
          // Joint CDF monotone surface z = F(x,y)
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.normalCDF(x) * M.normalCDF(y) + 0.15 * rho * Math.exp(-0.5 * (x * x + y * y)),
            xMin: -3.0, xMax: 3.0, nx: 42,
            yMin: -3.0, yMax: 3.0, ny: 42,
            zScale: 3.2,
            scheme: 'emerald'
          }));
          const Fval = approxJointCDF(x0, y0, rho);
          const pt = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 14, 14),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          pt.position.copy(engine.m2w(x0, y0, Fval * 3.2));
          grp.add(pt);
          grp.add(engine.createLabel(`F(${x0.toFixed(1)}, ${y0.toFixed(1)}) ≈ ${Fval.toFixed(3)}`, [x0, y0, Fval * 3.2 + 0.45], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '当前曲面高度 F(x₀, y₀)', value: Fval.toFixed(4), sub: '关于 x, y 单调非降', highlight: true },
            { label: '左下极限 F(-∞, y)', value: '0.0000', sub: '西南谷底高度为 0' },
            { label: '右上极限 F(+∞, +∞)', value: '1.0000', sub: '东北高原高度为 1' },
            { label: '2D矩形差分非负性', value: 'Δ²F ≥ 0', sub: 'F(x₂,y₂)−F(x₂,y₁)−F(x₁,y₂)+F(x₁,y₁)≥0' }
          ]);
        } else {
          // 2D Discrete Joint PMF Matrix 4x4
          const xs = [-1.8, -0.6, 0.6, 1.8];
          const ys = [-1.8, -0.6, 0.6, 1.8];
          const raw = [];
          let sumRaw = 0;
          for (let i = 0; i < 4; i++) {
            raw[i] = [];
            for (let j = 0; j < 4; j++) {
              const v = Math.exp(-0.4 * (xs[i] * xs[i] - 2 * rho * xs[i] * ys[j] + ys[j] * ys[j]));
              raw[i][j] = v;
              sumRaw += v;
            }
          }
          let cumF = 0;
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              const pij = raw[i][j] / sumRaw;
              const hit = xs[i] <= x0 && ys[j] <= y0;
              if (hit) cumF += pij;
              grp.add(engine.createBar3D({
                x: xs[i], y: ys[j], height: pij * 16.0, width: 0.62, depth: 0.62,
                color: hit ? 0xfbbf24 : 0x38bdf8, opacity: hit ? 0.94 : 0.48
              }));
              grp.add(engine.createLabel(pij.toFixed(2), [xs[i], ys[j], pij * 16.0 + 0.28], { scale: 0.42 }));
            }
          }
          ctx.setMetrics([
            { label: '离散累积和 F(x₀, y₀)', value: cumF.toFixed(4), sub: '金色高亮摩天楼概率之和', highlight: true },
            { label: '全矩阵总和 ∑∑ p_ij', value: '1.0000', sub: '4×4 联合分布律表' },
            { label: '非负性 p_ij ≥ 0', value: '全部满足', sub: '共 16 个联合状态点' },
            { label: '耦合趋势', value: rho >= 0 ? '正相关对角占优' : '负相关反对角占优', sub: `ρ = ${rho.toFixed(1)}` }
          ]);
        }

        ctx.setFormulas([
          {
            title: '二维联合分布函数与密度/分布律关系',
            tex: `F(x_0, y_0) = P(X \\le x_0,\\; Y \\le y_0) = \\int_{-\\infty}^{x_0}\\!\\!\\int_{-\\infty}^{y_0} f(u,v)\\,du\\,dv, \\quad \\frac{\\partial^2 F}{\\partial x\\partial y} = f(x,y)`,
            note: '高亮区域对应满足 X ≤ x₀ 且 Y ≤ y₀ 的西南象限概率体积。'
          },
          {
            title: '矩形区域容斥计算公式（教材必考）',
            tex: `P(x_1 < X \\le x_2,\\; y_1 < Y \\le y_2) = F(x_2,y_2) - F(x_2,y_1) - F(x_1,y_2) + F(x_1,y_1)`,
            note: '减去两侧半无限条带后左下角被重复减了两次，因此必须加回一次 F(x₁, y₁)。'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 3-2: 二维均匀分布与二维正态分布 3D 耦合曲面
  // =========================================================================
  Reg['3-2'] = {
    camera: { radius: 13.6, theta: 0.62, phi: 1.02, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'model', label: '常用二维分布模型', value: 'biv_norm',
        options: [
          { label: '二维正态分布 N(0, 0; σ₁², σ₂²; ρ)（I/Q星座云）', value: 'biv_norm' },
          { label: '圆形晶圆域二维均匀分布 D: x²+y² ≤ R²', value: 'unif_disk' },
          { label: '矩形域二维均匀分布 D: [−a,a] × [−b,b]', value: 'unif_rect' }
        ]
      },
      { type: 'slider', key: 'rho', label: '相关系数 ρ (正态模式)', min: -0.90, max: 0.90, step: 0.05, value: 0.65 },
      { type: 'slider', key: 's1', label: 'X轴标准差 σ₁ / 半径 R / 半宽 a', min: 0.6, max: 2.2, step: 0.1, value: 1.2 },
      { type: 'slider', key: 's2', label: 'Y轴标准差 σ₂ / 半高 b', min: 0.6, max: 2.2, step: 0.1, value: 1.0 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { rho, s1, s2 } = state;

        grp.add(engine.createAxes3D({
          xRange: [-3.8, 3.8], yRange: [-3.8, 3.8], zRange: [0, 3.8],
          xLabel: 'I路同相分量 X', yLabel: 'Q路正交分量 Y', zLabel: '联合密度 f(x,y)'
        }));

        if (state.model === 'biv_norm') {
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, s1, s2, rho),
            xMin: -3.4, xMax: 3.4, nx: 64,
            yMin: -3.4, yMax: 3.4, ny: 64,
            zScale: 14.0,
            scheme: 'plasma',
            opacity: 0.86
          }));

          // Draw 1-sigma and 2-sigma iso-density contour ellipses on floor z=0.03
          [1.0, 2.0].forEach((cRadius, idx) => {
            const ellPts = [];
            const rComp = Math.sqrt(Math.max(0.01, 1 - rho * rho));
            for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.08) {
              const u = cRadius * Math.cos(t);
              const v = cRadius * Math.sin(t);
              const ex = s1 * u;
              const ey = s2 * (rho * u + rComp * v);
              ellPts.push([ex, ey, 0.04]);
            }
            grp.add(engine.createRibbonCurve({
              points: ellPts,
              color: idx === 0 ? 0xfbbf24 : 0x38bdf8,
              fillOpacity: 0, closedCurtain: false
            }));
          });
          grp.add(engine.createLabel(`等概率密度椭圆簇 (ρ = ${rho.toFixed(2)})`, [0, -3.1, 0.45], { accent: '#fbbf24' }));

          const peak = M.bivariateNormalPDF(0, 0, 0, 0, s1, s2, rho);
          ctx.setMetrics([
            { label: '原点峰值密度 f(0,0)', value: peak.toFixed(4), sub: '1 / (2πσ₁σ₂√(1−ρ²))', highlight: true },
            { label: '相关系数 ρ', value: rho.toFixed(2), sub: rho === 0 ? 'X与Y相互独立!' : '椭圆主轴旋转挤压' },
            { label: '协方差 Cov(X,Y)', value: (rho * s1 * s2).toFixed(3), sub: 'ρ · σ₁ · σ₂' },
            { label: '等高线几何形态', value: Math.abs(rho) < 0.02 && Math.abs(s1 - s2) < 0.02 ? '同心正圆' : '倾斜椭圆', sub: '俯视图(XY)观察最直观' }
          ]);

          ctx.setFormulas([
            {
              title: '二维正态分布联合密度函数',
              tex: `f(x,y) = \\frac{1}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^2}} \\exp\\!\\left\\{-\\frac{1}{2(1-\\rho^2)}\\left[\\frac{x^2}{\\sigma_1^2}-\\frac{2\\rho xy}{\\sigma_1\\sigma_2}+\\frac{y^2}{\\sigma_2^2}\\right]\\right\\}`,
              note: '可点击底部相机栏【俯视图 XY】直接观察底面金色与青色等密度椭圆主轴随 ρ 的旋转！'
            }
          ]);
        } else if (state.model === 'unif_disk') {
          const R = Math.max(0.8, s1 * 1.35);
          const area = Math.PI * R * R;
          const density = 1 / area;
          const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(R, R, density * 18, 48),
            new THREE.MeshPhongMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.82 })
          );
          cyl.position.copy(engine.m2w(0, 0, density * 9));
          grp.add(cyl);
          grp.add(engine.createLabel(`晶圆均匀圆柱: 面积 πR²=${area.toFixed(2)}, 密度=1/S=${density.toFixed(3)}`, [0, 0, density * 18 + 0.45], { accent: '#38bdf8' }));

          ctx.setMetrics([
            { label: '区域面积 S(D) = πR²', value: area.toFixed(3), sub: `晶圆半径 R = ${R.toFixed(2)}` },
            { label: '恒定联合密度 f(x,y)', value: density.toFixed(4), sub: '区域内处处相等，域外为 0', highlight: true },
            { label: '总体积 S(D)·f(x,y)', value: '1.0000', sub: '圆柱体积恒等于 1' },
            { label: 'X 与 Y 是否独立?', value: '不独立!', sub: '圆域非矩形，取值范围互相约束' }
          ]);

          ctx.setFormulas([
            {
              title: '二维均匀分布几何定义',
              tex: `f(x,y) = \\begin{cases} \\dfrac{1}{S(D)} = \\dfrac{1}{\\pi R^2} = ${density.toFixed(4)}, & x^2+y^2 \\le R^2 \\\\ 0, & \\text{其他} \\end{cases}`,
              note: '在区域 D 内任一子区域 G 的概率只与 G 的面积成正比，而与 G 在 D 中的位置和形状无关。'
            }
          ]);
        } else {
          const a = s1 * 1.2, b = s2 * 1.2;
          const area = 4 * a * b;
          const density = 1 / area;
          grp.add(engine.createBar3D({
            x: 0, y: 0, height: density * 18, width: 2 * a, depth: 2 * b,
            color: 0x34d399, opacity: 0.82
          }));
          grp.add(engine.createLabel(`矩形均匀平顶台: S=${area.toFixed(2)}, f=${density.toFixed(3)}`, [0, 0, density * 18 + 0.45], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '矩形域面积 4ab', value: area.toFixed(3), sub: `[−${a.toFixed(1)}, ${a.toFixed(1)}] × [−${b.toFixed(1)}, ${b.toFixed(1)}]` },
            { label: '联合密度 1/(4ab)', value: density.toFixed(4), sub: '= 1/(2a) · 1/(2b)', highlight: true },
            { label: '边缘分布类型', value: 'X~U(-a,a), Y~U(-b,b)', sub: '两边缘均为一维均匀分布' },
            { label: 'X 与 Y 是否独立?', value: '相互独立!', sub: 'f(x,y) = f_X(x)·f_Y(y) 恒成立' }
          ]);

          ctx.setFormulas([
            {
              title: '矩形域二维均匀分布的独立分解',
              tex: `f(x,y) = \\frac{1}{4ab} = \\frac{1}{2a}\\cdot\\frac{1}{2b} = f_X(x)f_Y(y), \\quad (x,y)\\in[-a,a]\\times[-b,b]`,
              note: '平行于坐标轴的矩形区域上的二维均匀分布，两分量必相互独立。'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 3-3: 边缘分布 3D 投影积分墙与相互独立性判别
  // =========================================================================
  Reg['3-3'] = {
    camera: { radius: 14.6, theta: 0.68, phi: 1.06, target: [0, 1.6, 0] },
    controls: [
      {
        type: 'select', key: 'model', label: '联合分布测试模型', value: 'norm',
        options: [
          { label: '二维正态分布（验证：边缘永为正态，与 ρ 无关!）', value: 'norm' },
          { label: '圆盘均匀分布 x²+y²≤R²（验证：边缘为半椭圆且不独立!）', value: 'disk' }
        ]
      },
      { type: 'slider', key: 'rho', label: '相关系数 ρ (正态模式)', min: -0.85, max: 0.85, step: 0.05, value: 0.70 },
      { type: 'slider', key: 'x0', label: '线积分扫描切面 x = x₀', min: -2.2, max: 2.2, step: 0.1, value: 0.6 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { rho, x0 } = state;
        const wallY = 3.6;  // Back wall for f_X(x)
        const wallX = -3.6; // Left wall for f_Y(y)

        grp.add(engine.createAxes3D({
          xRange: [-3.6, 3.6], yRange: [-3.6, 3.6], zRange: [0, 3.8],
          xLabel: 'X', yLabel: 'Y', zLabel: '密度'
        }));

        if (state.model === 'norm') {
          const zSurf = 13.5;
          const zMarg = 5.5;
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, 1, 1, rho),
            xMin: -3.2, xMax: 3.2, nx: 54,
            yMin: -3.2, yMax: 3.2, ny: 54,
            zScale: zSurf,
            scheme: 'cyber', opacity: 0.72
          }));

          // Slice ribbon along x = x0 integrating over y
          const slicePts = [];
          for (let y = -3.2; y <= 3.2; y += 0.08) {
            slicePts.push([x0, y, M.bivariateNormalPDF(x0, y, 0, 0, 1, 1, rho) * zSurf]);
          }
          grp.add(engine.createRibbonCurve({ points: slicePts, color: 0xfbbf24, fillOpacity: 0.55 }));

          // Back wall f_X(x) & Left wall f_Y(y)
          const fxPts = [], fyPts = [];
          for (let u = -3.2; u <= 3.2; u += 0.08) {
            fxPts.push([u, wallY, M.normalPDF(u, 0, 1) * zMarg]);
            fyPts.push([wallX, u, M.normalPDF(u, 0, 1) * zMarg]);
          }
          grp.add(engine.createRibbonCurve({ points: fxPts, color: 0x38bdf8, fillOpacity: 0.35 }));
          grp.add(engine.createRibbonCurve({ points: fyPts, color: 0x34d399, fillOpacity: 0.35 }));

          // Connect slice x0 to back wall marker f_X(x0)
          const fx0 = M.normalPDF(x0, 0, 1);
          const mk = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
          mk.position.copy(engine.m2w(x0, wallY, fx0 * zMarg));
          grp.add(mk);
          grp.add(engine.createLabel(`后墙边缘 f_X(x) ~ N(0,1) [与ρ无关!]`, [0, wallY, 2.7], { accent: '#38bdf8' }));
          grp.add(engine.createLabel(`左墙边缘 f_Y(y) ~ N(0,1)`, [wallX, 0, 2.7], { accent: '#34d399' }));

          const fJoint = M.bivariateNormalPDF(x0, x0, 0, 0, 1, 1, rho);
          const fProd = fx0 * fx0;
          ctx.setMetrics([
            { label: '切面线积分值 f_X(x₀)', value: fx0.toFixed(4), sub: '∫ f(x₀,y) dy = 后墙金球高度', highlight: true },
            { label: '测试点联合密度 f(x₀,x₀)', value: fJoint.toFixed(4), sub: `ρ = ${rho.toFixed(2)}` },
            { label: '边缘乘积 f_X(x₀)·f_Y(x₀)', value: fProd.toFixed(4), sub: Math.abs(rho) < 0.01 ? '相等 ⇒ 相互独立!' : '不相等 ⇒ 不独立!' },
            { label: '核心辩证结论', value: '边缘不变!', sub: '改变 ρ 时两面墙曲线纹丝不动!' }
          ]);

          ctx.setFormulas([
            {
              title: '边缘概率密度投影积分公式',
              tex: `f_X(x_0) = \\int_{-\\infty}^{+\\infty} f(x_0, y)\\,dy = ${fx0.toFixed(4)}, \\qquad f_Y(y) = \\int_{-\\infty}^{+\\infty} f(x, y)\\,dx`,
              note: '试着大幅拖动相关系数 ρ：中间三维山峰剧烈扭转，但后墙 f_X(x) 与左墙 f_Y(y) 完全不变——生动证明边缘分布无法唯一决定联合分布！'
            }
          ]);
        } else {
          // Uniform on Disk x^2 + y^2 <= R^2 (R = 2.4)
          const R = 2.4;
          const dens = 1 / (Math.PI * R * R);
          const zSurf = 15.0;
          const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(R, R, dens * zSurf, 48),
            new THREE.MeshPhongMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
          );
          cyl.position.copy(engine.m2w(0, 0, dens * zSurf * 0.5));
          grp.add(cyl);

          const xClamped = Math.max(-R + 0.05, Math.min(R - 0.05, x0));
          const chordHalf = Math.sqrt(Math.max(0, R * R - xClamped * xClamped));
          grp.add(engine.createRibbonCurve({
            points: [[xClamped, -chordHalf, dens * zSurf], [xClamped, chordHalf, dens * zSurf]],
            color: 0xfbbf24, fillOpacity: 0.7
          }));

          // Semicircle Wigner marginal f_X(x) = 2*sqrt(R^2-x^2)/(pi*R^2)
          const fxPts = [], fyPts = [];
          for (let u = -R; u <= R; u += 0.06) {
            const mVal = (2 * Math.sqrt(Math.max(0, R * R - u * u))) / (Math.PI * R * R);
            fxPts.push([u, wallY, mVal * 6.5]);
            fyPts.push([wallX, u, mVal * 6.5]);
          }
          grp.add(engine.createRibbonCurve({ points: fxPts, color: 0xfbbf24, fillOpacity: 0.4 }));
          grp.add(engine.createRibbonCurve({ points: fyPts, color: 0x34d399, fillOpacity: 0.4 }));
          grp.add(engine.createLabel('圆盘均匀分布的边缘密度竟是半椭圆(非均匀)!', [0, wallY, 2.5], { accent: '#fbbf24' }));

          const fxVal = Math.abs(x0) < R ? (2 * Math.sqrt(R * R - x0 * x0)) / (Math.PI * R * R) : 0;
          ctx.setMetrics([
            { label: '圆内恒定联合密度', value: dens.toFixed(4), sub: `1 / (πR²), R=${R}` },
            { label: '切面弦长 2√(R²−x₀²)', value: (2 * chordHalf).toFixed(3), sub: '决定积分截面面积' },
            { label: '边缘密度 f_X(x₀)', value: fxVal.toFixed(4), sub: '中心厚、边缘薄(半椭圆)', highlight: true },
            { label: '角点检验 (2.0, 2.0)', value: 'f=0 ≠ f_X·f_Y>0', sub: '铁证 X 与 Y 不独立!' }
          ]);

          ctx.setFormulas([
            {
              title: '圆域均匀分布边缘积分与非独立性证明',
              tex: `f_X(x) = \\int_{-\\sqrt{R^2-x^2}}^{\\sqrt{R^2-x^2}} \\frac{1}{\\pi R^2}\\,dy = \\frac{2\\sqrt{R^2-x^2}}{\\pi R^2} \\;(|x|\\le R), \\quad f(x,y) \\neq f_X(x)f_Y(y)`,
              note: '金色截面矩形底长等于圆弦长 2√(R²−x₀²)，故越靠近圆心积分面积越大，边缘不再是均匀分布！'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 3-4: 条件分布 3D 激光切片器：多通道观测信息更新
  // =========================================================================
  Reg['3-4'] = {
    camera: { radius: 13.8, theta: 0.72, phi: 1.06, target: [0, 1.5, 0] },
    controls: [
      { type: 'slider', key: 'x0', label: '已知传感器读数 X = x₀ 激光切面', min: -2.2, max: 2.2, step: 0.1, value: 1.2 },
      { type: 'slider', key: 'rho', label: '通道耦合相关系数 ρ', min: -0.85, max: 0.85, step: 0.05, value: 0.75 },
      { type: 'slider', key: 's2', label: '待估信号 Y 原始标准差 σ₂', min: 0.7, max: 1.6, step: 0.1, value: 1.1 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { x0, rho, s2 } = state;
        const s1 = 1.0;
        const zScale = 5.2;

        grp.add(engine.createAxes3D({
          xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], zRange: [0, 4.2],
          xLabel: '观测通道 X', yLabel: '待估通道 Y', zLabel: '密度'
        }));

        // Translucent joint surface
        grp.add(engine.createParametricSurface({
          fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, s1, s2, rho),
          xMin: -3.2, xMax: 3.2, nx: 52,
          yMin: -3.2, yMax: 3.2, ny: 52,
          zScale: zScale * 2.2,
          scheme: 'cyber', opacity: 0.42, wireframeOverlay: false
        }));

        // Laser cutting plane X = x0
        grp.add(engine.createSlicePlane({
          axis: 'x', value: x0, uRange: [-3.4, 3.4], vRange: [0, 3.9],
          color: 0x38bdf8, opacity: 0.15
        }));

        // Raw cross-section f(x0, y) vs Renormalized Conditional PDF f_{Y|X}(y|x0)
        const condMean = rho * (s2 / s1) * x0;
        const condStd = Math.sqrt(Math.max(0.02, 1 - rho * rho)) * s2;
        const rawPts = [], condPts = [];
        for (let y = -3.3; y <= 3.3; y += 0.06) {
          rawPts.push([x0, y, M.bivariateNormalPDF(x0, y, 0, 0, s1, s2, rho) * zScale * 2.2]);
          condPts.push([x0 + 0.03, y, M.normalPDF(y, condMean, condStd) * zScale]);
        }
        grp.add(engine.createRibbonCurve({ points: rawPts, color: 0x38bdf8, fillOpacity: 0.35 }));
        grp.add(engine.createRibbonCurve({ points: condPts, color: 0xfbbf24, fillOpacity: 0.45 }));

        // Floor Regression Line E[Y | X = x] = rho*(s2/s1)*x
        grp.add(engine.createRibbonCurve({
          points: [[-3.0, -3.0 * rho * (s2 / s1), 0.04], [3.0, 3.0 * rho * (s2 / s1), 0.04]],
          color: 0xf43f5e, fillOpacity: 0
        }));

        grp.add(engine.createLabel('蓝线: 原始截痕 f(x₀,y)', [x0, -2.2, 1.3], { accent: '#38bdf8', scale: 0.52 }));
        grp.add(engine.createLabel(`金线: 重归一化条件密度 f_{Y|X}(y|x₀)`, [x0, condMean, M.normalPDF(condMean, condMean, condStd) * zScale + 0.4], { accent: '#fbbf24' }));

        const fx0 = M.normalPDF(x0, 0, s1);
        ctx.setMetrics([
          { label: '条件数学期望 E(Y|X=x₀)', value: condMean.toFixed(3), sub: `沿红回归线偏移 ρ(σ₂/σ₁)x₀`, highlight: true },
          { label: '条件标准差 σ_{Y|X}', value: condStd.toFixed(3), sub: `原始 σ₂=${s2.toFixed(2)} → 不确定性缩减!` },
          { label: '方差缩减比例 1−ρ²', value: ((1 - rho * rho) * 100).toFixed(1) + '%', sub: `信息增益消除 ${(rho * rho * 100).toFixed(1)}% 方差` },
          { label: '归一化除数 f_X(x₀)', value: fx0.toFixed(4), sub: '确保金色曲线下面积恒为 1' }
        ]);

        ctx.setFormulas([
          {
            title: '连续型条件概率密度定义与二维正态条件定理',
            tex: `f_{Y\\mid X}(y\\mid x_0) = \\frac{f(x_0, y)}{f_X(x_0)} \\sim N\\!\\left(\\rho\\frac{\\sigma_2}{\\sigma_1}x_0,\\; (1-\\rho^2)\\sigma_2^2\\right) = N(${condMean.toFixed(2)},\\; ${(condStd * condStd).toFixed(3)})`,
            note: '当 x₀ 处于尾部时原始蓝色截痕很矮，除以同样很小的 f_X(x₀) 后放大为标准面积为 1 的金色正态曲线！'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 3-5: 二维随机变量函数的分布：三维卷积、极值与瑞利包络
  // =========================================================================
  Reg['3-5'] = {
    camera: { radius: 14.2, theta: 0.62, phi: 1.08, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'fnType', label: '二维随机变量函数类型', value: 'conv_unif',
        options: [
          { label: '和的卷积 Z = X+Y：两独立均匀分布卷出三角分布', value: 'conv_unif' },
          { label: '和的卷积 Z = X+Y：两独立正态分布可加性再生', value: 'conv_norm' },
          { label: '串并联系统寿命极值：M=max(X,Y) vs N=min(X,Y)', value: 'minmax' },
          { label: '无线多径信道包络：R = √(X²+Y²) 瑞利衰落分布', value: 'rayleigh' }
        ]
      },
      { type: 'slider', key: 'z0', label: '斜切面扫描位置 z₀ (或尺度参数 σ/λ)', min: 0.2, max: 2.8, step: 0.1, value: 1.2 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const p = state.z0;

        if (state.fnType === 'conv_unif') {
          // X, Y ~ U(0, 1.5) -> Z = X+Y in [0, 3.0] triangular!
          const a = 1.6;
          const z0 = Math.min(2 * a, p * 1.1);
          grp.add(engine.createAxes3D({
            xRange: [-0.5, 3.8], yRange: [-2.6, 2.8], zRange: [0, 3.6],
            xLabel: 'x / 和值 z', yLabel: 'y', zLabel: '密度'
          }));

          // Joint Uniform square [0, a] x [0, a]
          grp.add(engine.createBar3D({
            x: a / 2, y: a / 2, height: 1.2, width: a, depth: a,
            color: 0x38bdf8, opacity: 0.42
          }));

          // Diagonal line x + y = z0 clipped to [0, a]^2
          const xStart = Math.max(0, z0 - a);
          const xEnd = Math.min(a, z0);
          if (xEnd >= xStart) {
            grp.add(engine.createRibbonCurve({
              points: [[xStart, z0 - xStart, 1.24], [xEnd, z0 - xEnd, 1.24]],
              color: 0xfbbf24, fillOpacity: 0.78
            }));
          }

          // Resulting Triangular Convolution PDF f_Z(z) plotted on front row y = -1.8
          const convPts = [];
          for (let z = 0; z <= 2 * a + 0.2; z += 0.06) {
            let fz = 0;
            if (z >= 0 && z <= a) fz = z / (a * a);
            else if (z > a && z <= 2 * a) fz = (2 * a - z) / (a * a);
            convPts.push([z, -1.8, fz * 3.8]);
          }
          grp.add(engine.createRibbonCurve({ points: convPts, color: 0x34d399, fillOpacity: 0.4 }));
          const curFz = z0 <= a ? z0 / (a * a) : Math.max(0, (2 * a - z0) / (a * a));
          const mk = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
          mk.position.copy(engine.m2w(z0, -1.8, curFz * 3.8));
          grp.add(mk);
          grp.add(engine.createLabel('前排绿线: 卷积和密度 f_Z(z) (三角形分布!)', [a, -1.8, 2.8], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '当前扫描和 z₀ = x+y', value: z0.toFixed(2), sub: `斜截线长度决定 f_Z(z₀)` },
            { label: '卷积密度 f_Z(z₀)', value: curFz.toFixed(4), sub: '在 z=a 处对角线最长达到峰值!', highlight: true },
            { label: '和的期望 E(X+Y)', value: a.toFixed(2), sub: 'a/2 + a/2 = a' },
            { label: '和的方差 D(X+Y)', value: (2 * a * a / 12).toFixed(4), sub: '独立时 D(X)+D(Y)' }
          ]);

          ctx.setFormulas([
            {
              title: '二维独立随机变量和的卷积公式',
              tex: `f_Z(z) = \\int_{-\\infty}^{+\\infty} f_X(x)f_Y(z-x)\\,dx = \\begin{cases} z/a^2, & 0\\le z\\le a \\\\ (2a-z)/a^2, & a < z \\le 2a \\end{cases}`,
              note: '拖动 z₀ 观察金色对角切片 x+y=z₀ 穿过蓝色正方形：截线由短变长再变短，精确描绘出前排三角形卷积密度！'
            }
          ]);
        } else if (state.fnType === 'conv_norm') {
          const z0 = p - 1.2;
          grp.add(engine.createAxes3D({
            xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], zRange: [0, 3.6],
            xLabel: 'X / Z', yLabel: 'Y', zLabel: '密度'
          }));
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, 0.9, 0.9, 0),
            xMin: -3, xMax: 3, nx: 48, yMin: -3, yMax: 3, ny: 48, zScale: 11, opacity: 0.55
          }));
          const diagPts = [];
          for (let x = -2.6; x <= 2.6; x += 0.08) {
            const y = z0 - x;
            if (Math.abs(y) <= 2.8) {
              diagPts.push([x, y, M.bivariateNormalPDF(x, y, 0, 0, 0.9, 0.9, 0) * 11]);
            }
          }
          grp.add(engine.createRibbonCurve({ points: diagPts, color: 0xfbbf24, fillOpacity: 0.65 }));

          const sSum = Math.sqrt(0.81 + 0.81);
          const sumPts = [];
          for (let z = -3.4; z <= 3.4; z += 0.08) {
            sumPts.push([z, -3.1, M.normalPDF(z, 0, sSum) * 6.5]);
          }
          grp.add(engine.createRibbonCurve({ points: sumPts, color: 0x34d399, fillOpacity: 0.38 }));
          grp.add(engine.createLabel(`独立正态可加性: X+Y ~ N(0, σ₁²+σ₂²=${(sSum * sSum).toFixed(2)})`, [0, -3.1, 2.5], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '单分量分布', value: 'N(0, 0.81)', sub: 'σ₁ = σ₂ = 0.90' },
            { label: '和分布 X + Y', value: `N(0, ${(sSum * sSum).toFixed(2)})`, sub: `标准差 √2·σ = ${sSum.toFixed(3)}`, highlight: true },
            { label: '切面位置 z₀', value: z0.toFixed(2), sub: `f_Z(z₀) = ${M.normalPDF(z0, 0, sSum).toFixed(4)}` },
            { label: '再生性定理', value: '严格保持正态', sub: '有限个独立正态线性组合仍正态' }
          ]);

          ctx.setFormulas([
            {
              title: '正态分布的再生性（可加性）',
              tex: `X \\sim N(\\mu_1,\\sigma_1^2),\\; Y \\sim N(\\mu_2,\\sigma_2^2)\\;\\text{独立} \\implies X+Y \\sim N(\\mu_1+\\mu_2,\\; \\sigma_1^2+\\sigma_2^2)`,
              note: '注意方差相加而非标准差相加：总噪声有效值为 √(σ₁² + σ₂²)。'
            }
          ]);
        } else if (state.fnType === 'minmax') {
          const lam = Math.max(0.5, p * 0.7);
          grp.add(engine.createAxes3D({
            xRange: [-0.4, 5.5], yRange: [-2.4, 2.4], zRange: [0, 3.8],
            xLabel: '系统寿命 t', yLabel: '系统结构对比', zLabel: '寿命密度 f(t)'
          }));
          const singlePts = [], minPts = [], maxPts = [];
          for (let t = 0; t <= 5.2; t += 0.06) {
            const f1 = M.expPDF(t, lam);
            const F1 = M.expCDF(t, lam);
            singlePts.push([t, 0, f1 * 2.4]);
            minPts.push([t, -1.6, (2 * lam * Math.exp(-2 * lam * t)) * 2.4]); // N = min(X,Y) ~ Exp(2*lam)
            maxPts.push([t, 1.6, (2 * F1 * f1) * 2.4]); // M = max(X,Y)
          }
          grp.add(engine.createRibbonCurve({ points: minPts, color: 0xf43f5e, fillOpacity: 0.4 }));
          grp.add(engine.createRibbonCurve({ points: singlePts, color: 0x38bdf8, fillOpacity: 0.3 }));
          grp.add(engine.createRibbonCurve({ points: maxPts, color: 0x34d399, fillOpacity: 0.45 }));

          grp.add(engine.createLabel('前红: 串联寿命 min(X,Y) [变短!]', [1.2, -1.6, 2.8], { accent: '#f43f5e' }));
          grp.add(engine.createLabel('中蓝: 单器件寿命 Exp(λ)', [1.8, 0, 2.2], { accent: '#38bdf8' }));
          grp.add(engine.createLabel('后绿: 并联备份寿命 max(X,Y) [延长50%!]', [2.4, 1.6, 2.4], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '单器件平均寿命 1/λ', value: (1 / lam).toFixed(2), sub: `λ = ${lam.toFixed(2)}` },
            { label: '串联系统均值 E[min]', value: (1 / (2 * lam)).toFixed(2), sub: '服从 Exp(2λ)，寿命减半' },
            { label: '并联冗余均值 E[max]', value: (1.5 / lam).toFixed(2), sub: '1.5 / λ，平均寿命提升50%!', highlight: true },
            { label: '极值分布函数口诀', value: 'max乘F，min乘(1−F)', sub: 'F_max=F₁F₂, 1−F_min=(1−F₁)(1−F₂)' }
          ]);

          ctx.setFormulas([
            {
              title: '最大值与最小值分布通用公式',
              tex: `F_{\\max}(z) = F_X(z)F_Y(z), \\qquad F_{\\min}(z) = 1 - [1-F_X(z)][1-F_Y(z)]`,
              note: '双模块并联冗余时，两个模块都失效系统才失效，显著推迟峰值失效时间。'
            }
          ]);
        } else {
          // Rayleigh Envelope R = sqrt(X^2 + Y^2)
          const sig = Math.max(0.5, p * 0.55);
          grp.add(engine.createAxes3D({
            xRange: [-3.2, 4.5], yRange: [-3.2, 3.2], zRange: [0, 3.8],
            xLabel: 'I路 / 包络幅值 r', yLabel: 'Q路', zLabel: '密度'
          }));
          grp.add(engine.createParametricSurface({
            fn: (x, y) => M.bivariateNormalPDF(x, y, 0, 0, sig, sig, 0),
            xMin: -2.6, xMax: 2.6, nx: 44, yMin: -2.6, yMax: 2.6, ny: 44, zScale: 9, opacity: 0.45
          }));
          const rayPts = [];
          for (let r = 0; r <= 4.2; r += 0.06) {
            const fr = (r / (sig * sig)) * Math.exp(-(r * r) / (2 * sig * sig));
            rayPts.push([r, -2.8, fr * 3.8]);
          }
          grp.add(engine.createRibbonCurve({ points: rayPts, color: 0xfbbf24, fillOpacity: 0.45 }));
          grp.add(engine.createLabel('前排金线: 瑞利包络分布 R = √(X²+Y²)', [1.8, -2.8, 2.9], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '正交高斯分量标准差 σ', value: sig.toFixed(2), sub: 'X, Y ~ N(0, σ²) 独立' },
            { label: '瑞利包络均值 E(R)', value: (sig * Math.sqrt(Math.PI / 2)).toFixed(3), sub: '√(π/2) · σ ≈ 1.253σ', highlight: true },
            { label: '瑞利包络方差 D(R)', value: ((2 - Math.PI / 2) * sig * sig).toFixed(3), sub: '(2 − π/2)σ²' },
            { label: '峰值模位置', value: `r = σ = ${sig.toFixed(2)}`, sub: 'r=0 处概率密度为 0!' }
          ]);

          ctx.setFormulas([
            {
              title: '正交高斯噪声合成瑞利衰落包络 (Rayleigh Distribution)',
              tex: `R = \\sqrt{X^2+Y^2} \\implies f_R(r) = \\frac{r}{\\sigma^2} e^{-\\frac{r^2}{2\\sigma^2}} \\;(r > 0)`,
              note: '极坐标变换 dxdy = r dr dθ 自带雅可比因子 r，使原点附近面积元趋于零，导出著名无线通信瑞利信道模型！'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 4-1: 数学期望物理质心天平与信号直流分量 3D 实验室
  // =========================================================================
  Reg['4-1'] = {
    camera: { radius: 13.0, theta: 0.38, phi: 1.15, target: [0, 1.4, 0] },
    controls: [
      {
        type: 'select', key: 'dist', label: '测试概率质量分布', value: 'skew_exp',
        options: [
          { label: '右偏指数型分布（质心明显偏离峰值!）', value: 'skew_exp' },
          { label: '非对称离散砝码组（4个概率质量块）', value: 'discrete' },
          { label: '双峰混合信号分布（质心位于两峰之间）', value: 'bimodal' }
        ]
      },
      { type: 'slider', key: 'fulcrum', label: '试探支点坐标 c（寻找水平平衡点!）', min: -2.5, max: 3.0, step: 0.05, value: 0.20 },
      { type: 'slider', key: 'gain', label: '线性变换增益 a (验证 E(aX+b)=aEX+b)', min: 0.6, max: 1.5, step: 0.1, value: 1.0 },
      { type: 'button', label: '一键自动对齐质心 c = E(X)', action: 'align', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function getTrueMean() {
        const a = state.gain;
        if (state.dist === 'skew_exp') return a * (-0.35); // shifted exp on [-2, 3.5]
        if (state.dist === 'discrete') {
          // xs: [-2.2, -0.8, 1.0, 2.6], ps: [0.15, 0.25, 0.20, 0.40] -> -0.33 - 0.2 + 0.2 + 1.04 = 0.71
          return a * 0.71;
        }
        return a * 0.52; // bimodal: 0.35*(-1.4) + 0.65*(1.554) = 0.52
      }

      function render() {
        clearSub(grp, engine);
        const a = state.gain;
        const trueMean = Math.round(getTrueMean() * 100) / 100;
        const c = state.fulcrum;
        const torque = trueMean - c; // positive if center of mass is to the right -> right side dips!
        const tiltAngle = Math.max(-0.26, Math.min(0.26, -torque * 0.18));
        const balanced = Math.abs(torque) < 0.04;

        // Fulcrum knife-edge pyramid at x = c
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.45, 0.95, 4),
          new THREE.MeshPhongMaterial({ color: balanced ? 0x34d399 : 0xfbbf24 })
        );
        cone.rotation.y = Math.PI / 4;
        cone.position.copy(engine.m2w(c, 0, 0.48));
        grp.add(cone);
        grp.add(engine.createLabel(`支点 c = ${c.toFixed(2)}`, [c, 0.9, 0.3], {
          accent: balanced ? '#34d399' : '#fbbf24'
        }));

        // Tilting Beam Pivot Group at (c, 0, 0.96)
        const pivot = new THREE.Group();
        pivot.position.copy(engine.m2w(c, 0, 0.96));
        pivot.rotation.z = tiltAngle;
        grp.add(pivot);

        // Beam bar inside local pivot coordinates (offset by -c)
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(8.6, 0.16, 1.1),
          new THREE.MeshPhongMaterial({ color: balanced ? 0x10b981 : 0x475569 })
        );
        beam.position.set(-c, 0.08, 0);
        pivot.add(beam);

        if (state.dist === 'discrete') {
          const xs = [-2.2 * a, -0.8 * a, 1.0 * a, 2.6 * a];
          const ps = [0.15, 0.25, 0.20, 0.40];
          xs.forEach((xi, idx) => {
            const h = ps[idx] * 5.2;
            const blk = new THREE.Mesh(
              new THREE.BoxGeometry(0.55, h, 0.65),
              new THREE.MeshPhongMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.88 })
            );
            blk.position.set(xi - c, 0.16 + h / 2, 0);
            pivot.add(blk);
          });
        } else {
          const pts = [];
          for (let u = -3.6; u <= 3.8; u += 0.08) {
            const x = u;
            let f = 0;
            const origX = x / a;
            if (state.dist === 'skew_exp') {
              f = origX >= -1.6 ? (1.25 * Math.exp(-1.25 * (origX + 1.6))) / a : 0;
            } else {
              f = (0.35 * M.normalPDF(origX, -1.4, 0.55) + 0.65 * M.normalPDF(origX, 1.554, 0.65)) / a;
            }
            pts.push([x - c, 0, 0.16 + Math.min(3.2, f * 3.0)]);
          }
          pivot.add(engine.createRibbonCurve({
            points: pts, color: 0x38bdf8, fillOpacity: 0.65, baseZ: 0.16
          }));
        }

        // True expectation marker arrow above
        grp.add(engine.createLabel(
          balanced ? `完美水平平衡! E(X) = ${trueMean.toFixed(2)}` : `净力矩 τ = ${(torque).toFixed(2)} (未平衡)`,
          [trueMean, 0, 3.9],
          { accent: balanced ? '#34d399' : '#f43f5e' }
        ));

        ctx.setMetrics([
          { label: '理论数学期望 E(X)', value: trueMean.toFixed(3), sub: '概率分布唯一物理质心', highlight: true },
          { label: '当前支点位置 c', value: c.toFixed(3), sub: balanced ? '已精确对准质心!' : '请点击自动对齐或微调滑块' },
          { label: '一阶力矩 ∫(x−c)f(x)dx', value: torque.toFixed(3), sub: '仅当 c = E(X) 时净力矩为 0' },
          { label: '电路工程物理意义', value: `${trueMean.toFixed(2)} V (DC)`, sub: '随机电压经低通滤波后的直流分量' }
        ]);

        ctx.setFormulas([
          {
            title: '数学期望的力学平衡方程与线性性质',
            tex: `\\int_{-\\infty}^{+\\infty} (x - c)f(x)\\,dx = 0 \\iff c = \\int_{-\\infty}^{+\\infty} x f(x)\\,dx = E(X) = ${trueMean.toFixed(2)}`,
            note: '注意右偏指数分布：峰值（众数）在最左端，但右侧长尾像长力臂上的砝码一样把数学期望拉向右侧！'
          },
          {
            title: '期望线性运算性质',
            tex: `E(aX + b) = a E(X) + b`,
            note: '信号经放大器增益 a 放大后，其直流均值严格按相同比例缩放。'
          }
        ]);
      }

      render();
      return {
        onControlChange: render,
        onAction(act, c) {
          if (act === 'align') {
            state.fulcrum = Math.round(getTrueMean() * 20) / 20;
            c.syncControls();
            render();
          }
        },
        reset: render
      };
    }
  };

  // =========================================================================
  // 4-2: 方差、转动惯量与电子噪声交流功率 3D 对比仪
  // =========================================================================
  Reg['4-2'] = {
    camera: { radius: 13.8, theta: 0.56, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'mu', label: '公共直流均值 μ = E(X) (V)', min: -1.5, max: 2.0, step: 0.1, value: 1.0 },
      { type: 'slider', key: 'sA', label: '通道 A 噪声标准差 σ_A (低噪放大器)', min: 0.3, max: 1.8, step: 0.1, value: 0.5 },
      { type: 'slider', key: 'sB', label: '通道 B 噪声标准差 σ_B (高噪信道)', min: 0.4, max: 2.0, step: 0.1, value: 1.3 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { mu, sA, sB } = state;

        grp.add(engine.createAxes3D({
          xRange: [-4.2, 4.5], yRange: [-3.2, 3.2], zRange: [0, 3.8],
          xLabel: '电压幅值 x (V)', yLabel: '通道对比与功率分解', zLabel: '密度 / 功率(W)'
        }));

        // Axis of rotation line at x = mu
        grp.add(engine.createSlicePlane({
          axis: 'x', value: mu, uRange: [-2.6, 0.8], vRange: [0, 3.4],
          color: 0xfbbf24, opacity: 0.16
        }));

        const ptsA = [], ptsB = [];
        for (let x = -4.0; x <= 4.2; x += 0.06) {
          ptsA.push([x, -1.8, M.normalPDF(x, mu, sA) * 3.6]);
          ptsB.push([x, -0.2, M.normalPDF(x, mu, sB) * 3.6]);
        }
        grp.add(engine.createRibbonCurve({ points: ptsA, color: 0x34d399, fillOpacity: 0.45 }));
        grp.add(engine.createRibbonCurve({ points: ptsB, color: 0xf43f5e, fillOpacity: 0.42 }));
        grp.add(engine.createLabel(`前绿: 低噪通道 A (D=${(sA * sA).toFixed(2)})`, [mu - 1.6, -1.8, 2.8], { accent: '#34d399' }));
        grp.add(engine.createLabel(`中红: 高噪通道 B (D=${(sB * sB).toFixed(2)})`, [mu + 1.4, -0.2, 1.9], { accent: '#f43f5e' }));

        // Back row y = 2.0: 3D Power Decomposition Pillars for Channel B: E(X^2) = mu^2 + sigma^2
        const dcP = mu * mu;
        const acP = sB * sB;
        const totP = dcP + acP;
        const pScale = 0.65;
        const powerBars = [
          { x: -1.6, val: dcP, col: 0x38bdf8, txt: `直流功率 μ²=${dcP.toFixed(2)}` },
          { x: 0.0, val: acP, col: 0xf43f5e, txt: `交流噪声 D(X)=${acP.toFixed(2)}` },
          { x: 1.6, val: totP, col: 0xfbbf24, txt: `总功率 E(X²)=${totP.toFixed(2)}` }
        ];
        powerBars.forEach((b) => {
          grp.add(engine.createBar3D({
            x: b.x, y: 2.1, height: Math.max(0.06, b.val * pScale), width: 0.72, depth: 0.72, color: b.col
          }));
          grp.add(engine.createLabel(b.txt, [b.x, 2.1, b.val * pScale + 0.35], { scale: 0.48 }));
        });

        const snrDb = dcP > 1e-6 ? (10 * Math.log10(dcP / acP)).toFixed(1) + ' dB' : '-∞ dB';
        ctx.setMetrics([
          { label: '通道 B 直流功率 [E(X)]²', value: dcP.toFixed(3) + ' W', sub: `μ = ${mu.toFixed(2)} V` },
          { label: '通道 B 交流噪声功率 D(X)', value: acP.toFixed(3) + ' W', sub: `标准差 RMS = ${sB.toFixed(2)} V`, highlight: true },
          { label: '二阶原点矩总功率 E(X²)', value: totP.toFixed(3) + ' W', sub: '严格满足 μ² + σ²' },
          { label: '通道 B 直流信噪比 SNR', value: snrDb, sub: '10·lg(μ² / σ²)' }
        ]);

        ctx.setFormulas([
          {
            title: '方差计算捷径公式与电路功率正交分解',
            tex: `D(X) = E[(X-E(X))^2] = E(X^2) - [E(X)]^2 \\iff \\underbrace{E(X^2)}_{\\text{总平均功率 } ${totP.toFixed(2)}} = \\underbrace{\\mu^2}_{\\text{直流功率 } ${dcP.toFixed(2)}} + \\underbrace{\\sigma^2}_{\\text{交流噪声功率 } ${acP.toFixed(2)}}`,
            note: '后排三根三维能量柱直观呈现教材最常用公式 D(X) = E(X²) − [E(X)]² 的物理本质！'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 4-3: 协方差、相关系数与“不相关但相依” 3D 辨析台
  // =========================================================================
  Reg['4-3'] = {
    camera: { radius: 13.5, theta: 0.62, phi: 1.05, target: [0, 1.3, 0] },
    controls: [
      {
        type: 'select', key: 'pattern', label: '双变量耦合模式（含必考反例!）', value: 'linear',
        options: [
          { label: '线性耦合双通道正态信号：(X, Y) 线性相关', value: 'linear' },
          { label: '经典反例1：抛物线 Y = X² (X~N(0,1)) → ρ=0 却完全相依!', value: 'parabola' },
          { label: '经典反例2：单位圆环 (cosΘ, sinΘ) → ρ=0 却不独立!', value: 'circle' }
        ]
      },
      { type: 'slider', key: 'rho', label: '预设线性相关系数 ρ (线性模式)', min: -0.95, max: 0.95, step: 0.05, value: 0.75 },
      { type: 'button', label: '重新抽取 140 组双通道观测点', action: 'resample', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      let pts = [];
      function generate() {
        pts = [];
        const N = 140;
        for (let i = 0; i < N; i++) {
          if (state.pattern === 'linear') {
            pts.push(M.randBivariateNormal(0, 0, 1.15, 1.15, state.rho));
          } else if (state.pattern === 'parabola') {
            const x = M.randNormal(0, 1.05);
            pts.push([x, 0.75 * (x * x - 1.1)]);
          } else {
            const th = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
            pts.push([2.0 * Math.cos(th), 2.0 * Math.sin(th)]);
          }
        }
      }
      generate();

      function render() {
        clearSub(grp, engine);
        grp.add(engine.createAxes3D({
          xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], zRange: [-2.2, 2.8],
          xLabel: 'X − E(X)', yLabel: 'Y − E(Y)', zLabel: '乘积矩 (x−x̄)(y−ȳ)'
        }));

        // Zero horizontal reference plane
        grp.add(engine.createSlicePlane({
          axis: 'z', value: 0, uRange: [-3.2, 3.2], vRange: [-3.2, 3.2],
          color: 0x64748b, opacity: 0.14
        }));

        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        const stX = M.sampleStats(xs);
        const stY = M.sampleStats(ys);
        let covSum = 0;

        pts.forEach((p) => {
          const dx = p[0] - stX.mean;
          const dy = p[1] - stY.mean;
          const prod = dx * dy;
          covSum += prod;
          const h = Math.max(-2.2, Math.min(2.4, prod * 0.55));
          grp.add(engine.createBar3D({
            x: dx, y: dy, zBase: 0, height: h,
            width: 0.09, depth: 0.09,
            color: prod >= 0 ? 0xfbbf24 : 0x38bdf8,
            opacity: 0.85, edgeColor: null
          }));
        });

        const covEmp = covSum / pts.length;
        const rEmp = covEmp / Math.max(1e-9, stX.std * stY.std);
        const theoRho = state.pattern === 'linear' ? state.rho : 0;

        grp.add(engine.createLabel(
          state.pattern === 'linear'
            ? `金柱(一三象限正积) vs 蓝柱(二四象限负积)`
            : `正负乘积柱左右严格对称抵消 ⇒ Cov(X,Y)=0，但轨迹强非线性相依!`,
          [0, 0, 2.9],
          { accent: state.pattern === 'linear' ? '#fbbf24' : '#f43f5e' }
        ));

        ctx.setMetrics([
          { label: '理论相关系数 ρ_XY', value: theoRho.toFixed(3), sub: state.pattern === 'linear' ? '刻画线性相关强弱' : '严格等于 0 (不相关!)', highlight: true },
          { label: '样本实测相关系数 r', value: rEmp.toFixed(3), sub: `实测协方差: ${covEmp.toFixed(3)}` },
          { label: 'X 与 Y 是否不相关?', value: Math.abs(theoRho) < 0.01 ? '是 (ρ = 0)' : '否 (ρ ≠ 0)', sub: 'Cov(X,Y) = 0 ⇔ 不相关' },
          { label: 'X 与 Y 是否相互独立?', value: (state.pattern === 'linear' && Math.abs(state.rho) < 0.01) ? '是 (二维正态特例)' : '否 (存在依赖!)', sub: '不相关 ⇏ 相互独立!' }
        ]);

        ctx.setFormulas([
          {
            title: '协方差与相关系数定义',
            tex: `\\text{Cov}(X,Y) = E[(X-EX)(Y-EY)], \\qquad \\rho_{XY} = \\frac{\\text{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}} \\in [-1, 1]`,
            note: '金柱位于第一、三象限（同号相乘为正），蓝柱位于第二、四象限（异号相乘为负）。'
          },
          {
            title: '经典辨析：为什么 Y = X² (X~N(0,1)) 不相关却不独立？',
            tex: `E(XY) = E(X^3) = 0 = E(X)E(Y) \\implies \\rho_{XY} = 0, \\quad \\text{但 } Y = X^2 \\text{ 完全由 } X \\text{ 决定!}`,
            note: '相关系数 ρ_XY 只能度量【线性】相关程度，对对称非线性函数关系“视而不见”！唯有二维正态分布满足“不相关 ⇔ 相互独立”。'
          }
        ]);
      }

      render();
      return {
        onControlChange() { generate(); render(); },
        onAction() { generate(); render(); },
        reset() { generate(); render(); }
      };
    }
  };

  // =========================================================================
  // 4-4: 其他数字特征：k阶矩、偏度、峰度与分位数 3D 雕塑台
  // =========================================================================
  Reg['4-4'] = {
    camera: { radius: 13.2, theta: 0.44, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'skew', label: '偏度控制参数 α（左偏 < 0 < 右偏）', min: -4.0, max: 4.0, step: 0.5, value: 2.5 },
      { type: 'slider', key: 'kurt', label: '重尾脉冲强度（0=正态, 大=尖峰重尾）', min: 0.0, max: 1.0, step: 0.1, value: 0.3 },
      { type: 'slider', key: 'alpha', label: '上 α 分位数右侧尾部面积 α', min: 0.02, max: 0.40, step: 0.02, value: 0.10 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const sk = state.skew;
        const kt = state.kurt;
        const tailAlpha = state.alpha;

        // Construct normalized numerical PDF on [-4, 4] combining Skew-Normal + heavy-tail Student-t(3)
        const xs = [];
        const rawF = [];
        const dx = 0.04;
        let area = 0;
        for (let x = -4.0; x <= 4.001; x += dx) {
          xs.push(x);
          const skewPart = 2 * M.normalPDF(x, 0, 1.1) * M.normalCDF(sk * x / 1.1);
          const heavyPart = M.tPDF(x, 2.6);
          const val = (1 - kt) * skewPart + kt * heavyPart;
          rawF.push(val);
          area += val * dx;
        }
        const f = rawF.map((v) => v / area);

        // Compute numerical mean, var, skewness, kurtosis, median, mode, upper-alpha quantile
        let mean = 0, modeX = 0, maxF = -1;
        let cum = 0, median = 0, medFound = false, qAlpha = 4.0, qFound = false;
        for (let i = 0; i < xs.length; i++) {
          mean += xs[i] * f[i] * dx;
          if (f[i] > maxF) { maxF = f[i]; modeX = xs[i]; }
          cum += f[i] * dx;
          if (!medFound && cum >= 0.5) { median = xs[i]; medFound = true; }
          if (!qFound && cum >= 1 - tailAlpha) { qAlpha = xs[i]; qFound = true; }
        }
        let m2 = 0, m3 = 0, m4 = 0;
        for (let i = 0; i < xs.length; i++) {
          const d = xs[i] - mean;
          m2 += d * d * f[i] * dx;
          m3 += d * d * d * f[i] * dx;
          m4 += d * d * d * d * f[i] * dx;
        }
        const std = Math.sqrt(m2);
        const skewness = m3 / Math.pow(std, 3);
        const kurtosis = m4 / (m2 * m2) - 3; // excess kurtosis

        grp.add(engine.createAxes3D({
          xRange: [-4.2, 4.2], yRange: [-2, 2], zRange: [0, 3.8],
          xLabel: 'x', yLabel: '立体厚度', zLabel: 'f(x)'
        }));

        // Sculpted 3D extruded density ribbon + tail highlight
        for (let yLayer = -0.8; yLayer <= 0.81; yLayer += 0.4) {
          const curvePts = [], tailPts = [];
          for (let i = 0; i < xs.length; i += 2) {
            const z = f[i] * 5.2;
            curvePts.push([xs[i], yLayer, z]);
            if (xs[i] >= qAlpha) tailPts.push([xs[i], yLayer, z]);
          }
          grp.add(engine.createRibbonCurve({ points: curvePts, color: 0x38bdf8, fillOpacity: 0.16 }));
          if (tailPts.length > 1) {
            grp.add(engine.createRibbonCurve({ points: tailPts, color: 0xf43f5e, fillOpacity: 0.48 }));
          }
        }

        // Quantile slice plane
        grp.add(engine.createSlicePlane({
          axis: 'x', value: qAlpha, uRange: [-1.2, 1.2], vRange: [0, 3.4],
          color: 0xf43f5e, opacity: 0.25
        }));

        // Flagpoles for Mode, Median, Mean
        const poles = [
          { x: modeX, col: 0xa78bfa, name: `众数=${modeX.toFixed(2)}`, h: 3.1 },
          { x: median, col: 0x34d399, name: `中位数=${median.toFixed(2)}`, h: 3.55 },
          { x: mean, col: 0xfbbf24, name: `均值=${mean.toFixed(2)}`, h: 4.0 }
        ];
        poles.forEach((pl) => {
          grp.add(engine.createRibbonCurve({
            points: [[pl.x, 0, 0], [pl.x, 0, pl.h]], color: pl.col, fillOpacity: 0
          }));
          grp.add(engine.createLabel(pl.name, [pl.x, 0, pl.h + 0.2], { scale: 0.48, accent: pl.col }));
        });

        ctx.setMetrics([
          { label: '三阶偏度系数 β_s', value: skewness.toFixed(3), sub: skewness > 0.05 ? '右偏: 众数 < 中位数 < 均值' : (skewness < -0.05 ? '左偏: 均值 < 中位数 < 众数' : '对称重合') },
          { label: '四阶超额峰度 β_k', value: kurtosis.toFixed(3), sub: '正态基准为 0，重尾脉冲 > 0' },
          { label: '中位数 m_0.5', value: median.toFixed(3), sub: '左右面积各占 50% (抗异常值)' },
          { label: `上 α=${tailAlpha.toFixed(2)} 分位数`, value: qAlpha.toFixed(3), sub: `P(X > x_α) = ${(tailAlpha * 100).toFixed(0)}%`, highlight: true }
        ]);

        ctx.setFormulas([
          {
            title: 'k 阶原点矩、中心矩与上 α 分位数定义',
            tex: `\\mu_k = E[(X-EX)^k], \\quad \\text{Skew}=\\frac{\\mu_3}{\\sigma^3}=${skewness.toFixed(2)}, \\quad P(X > x_{\\alpha}) = \\int_{x_{\\alpha}}^{+\\infty} f(x)\\,dx = ${tailAlpha.toFixed(2)}`,
            note: '红色三维尾部体积精确等于 α，对应切面位置 x_α 即为工程浪涌设计所需的上 α 分位数！'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 5-1: 切比雪夫不等式包络与大数定律多路径收敛 3D 隧道
  // =========================================================================
  Reg['5-1'] = {
    camera: { radius: 14.5, theta: 0.54, phi: 1.10, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'parent', label: '总体母分布（含无期望发散反例!）', value: 'exp',
        options: [
          { label: '指数分布 Exp(1)：μ=1, σ=1（服从辛钦大数定律）', value: 'exp' },
          { label: '均匀分布 U(0, 2)：μ=1, σ=1/√3（快速收敛）', value: 'unif' },
          { label: '反例：柯西分布 Cauchy(1, 0.4)（期望不存在 ⇒ 剧烈发散!）', value: 'cauchy' }
        ]
      },
      { type: 'slider', key: 'eps', label: '容差带宽 ε（检验 |X̄_n − μ| < ε）', min: 0.15, max: 0.65, step: 0.05, value: 0.30 },
      { type: 'button', label: '重新发射 20 条独立采样平均轨迹', action: 'rerun', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const eps = state.eps;
        const mu = 1.0;
        const zCenter = 1.8;
        const Nmax = 200;
        const Mpaths = 20;

        grp.add(engine.createAxes3D({
          xRange: [-4.5, 4.8], yRange: [-3.2, 3.2], zRange: [0, 3.8],
          xLabel: '样本容量 n (1→200)', yLabel: '独立轨迹束 m', zLabel: '样本均值 X̄_n'
        }));

        // Translucent epsilon tolerance slab [mu - eps, mu + eps]
        grp.add(engine.createBar3D({
          x: 0.15, y: 0, zBase: zCenter - eps * 1.6, height: eps * 3.2,
          width: 8.8, depth: 5.6, color: 0x34d399, opacity: 0.14, edgeColor: 0x34d399
        }));
        grp.add(engine.createLabel(`依概率收敛目标带 μ ± ε = [1 ± ${eps.toFixed(2)}]`, [0, 2.8, zCenter + eps * 1.6 + 0.35], { accent: '#34d399' }));

        let insideEnd = 0;
        const colors = [0x38bdf8, 0xfbbf24, 0xa78bfa, 0x34d399, 0xf472b6];
        for (let m = 0; m < Mpaths; m++) {
          const my = -2.5 + (m / (Mpaths - 1)) * 5.0;
          let sum = 0;
          const pts = [];
          let endMean = 1;
          for (let n = 1; n <= Nmax; n++) {
            let x = 1;
            if (state.parent === 'exp') x = M.randExp(1);
            else if (state.parent === 'unif') x = Math.random() * 2;
            else x = 1.0 + 0.35 * Math.tan(Math.PI * (Math.random() - 0.5)); // Cauchy!
            sum += x;
            const avg = sum / n;
            if (n === Nmax) endMean = avg;
            if (n === 1 || n % 3 === 0 || n === Nmax) {
              const mx = -4.2 + (n / Nmax) * 8.6;
              const mz = Math.max(0.05, Math.min(3.75, zCenter + (avg - mu) * 1.6));
              pts.push([mx, my, mz]);
            }
          }
          if (Math.abs(endMean - mu) < eps) insideEnd++;
          grp.add(engine.createRibbonCurve({
            points: pts,
            color: state.parent === 'cauchy' ? 0xf43f5e : colors[m % colors.length],
            fillOpacity: 0, closedCurtain: false
          }));
        }

        const sigma2 = state.parent === 'exp' ? 1.0 : (state.parent === 'unif' ? 1 / 3 : Infinity);
        const chebBound = Number.isFinite(sigma2)
          ? Math.max(0, 1 - sigma2 / (Nmax * eps * eps))
          : 0;

        ctx.setMetrics([
          { label: 'n=200 落入管道轨迹率', value: `${insideEnd}/${Mpaths} (${(insideEnd / Mpaths * 100).toFixed(0)}%)`, sub: '实测 P(|X̄_n−μ|<ε)', highlight: true },
          { label: '切比雪夫不等式下界', value: Number.isFinite(sigma2) ? (chebBound * 100).toFixed(1) + '%' : '不适用 (σ²=∞)', sub: '≥ 1 − σ²/(nε²)' },
          { label: '样本均值标准差 σ/√n', value: Number.isFinite(sigma2) ? Math.sqrt(sigma2 / Nmax).toFixed(4) : '∞ (发散!)', sub: '平均降噪 √200 ≈ 14.1 倍' },
          { label: '辛钦大数定律条件', value: state.parent === 'cauchy' ? '违背 (E|X|=∞)!' : '满足 (i.i.d. 且期望存在)', sub: '解释柯西轨迹突变跳出' }
        ]);

        ctx.setFormulas([
          {
            title: '切比雪夫不等式与辛钦大数定律',
            tex: `P(|\\bar{X}_n - \\mu| < \\varepsilon) \\ge 1 - \\frac{\\sigma^2}{n\\varepsilon^2} \\xrightarrow{n\\to\\infty} 1 \\iff \\bar{X}_n \\xrightarrow{P} \\mu`,
            note: '当切换为柯西分布时，偶发的极端大脉冲会瞬间拽偏算术均值，生动证明“数学期望存在”是大数定律不可或缺的基石！'
          }
        ]);
      }

      render();
      return { onControlChange: render, onAction: render, reset: render };
    }
  };

  // =========================================================================
  // 5-2: 中心极限定理 3D 瀑布演化：任意微扰叠加趋于正态
  // =========================================================================
  Reg['5-2'] = {
    camera: { radius: 14.8, theta: 0.55, phi: 1.08, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'src', label: '单源随机微扰母体分布 (n=1)', value: 'bimodal',
        options: [
          { label: '极端双峰U型时钟抖动（n=1 中心凹陷，叠加后竟变单峰钟形!）', value: 'bimodal' },
          { label: '强偏态指数分布 Exp(1)（单侧偏斜逐步对称化）', value: 'exp' },
          { label: '均匀方波分布 U(−1, 1)（平顶 → 三角 → 高斯钟形）', value: 'unif' },
          { label: '棣莫佛-拉普拉斯定理：二项分布 B(n, p=0.25) 正态化', value: 'binom' }
        ]
      },
      { type: 'slider', key: 'bLim', label: '近似计算区间上限 b（算 P(−b ≤ Z_n ≤ b)）', min: 0.5, max: 2.8, step: 0.1, value: 1.5 },
      { type: 'button', label: '重新运行蒙特卡洛 3D 瀑布采样', action: 'rerun', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function sampleOne() {
        if (state.src === 'bimodal') {
          // Symmetric bimodal: +/-1 with small noise -> mean=0, var = 1 + 0.09 = 1.09
          return (Math.random() < 0.5 ? -1 : 1) + M.randNormal(0, 0.3);
        }
        if (state.src === 'exp') {
          // Exp(1): mean=1, std=1 -> standardized (X-1)/1
          return M.randExp(1) - 1.0;
        }
        if (state.src === 'unif') {
          // U(-sqrt(3), sqrt(3)) -> mean=0, var=1
          return (Math.random() * 2 - 1) * Math.sqrt(3);
        }
        // Bernoulli(0.25) standardized: (B - 0.25) / sqrt(0.1875)
        return ((Math.random() < 0.25 ? 1 : 0) - 0.25) / Math.sqrt(0.1875);
      }

      function render() {
        clearSub(grp, engine);
        const unitVar = state.src === 'bimodal' ? 1.09 : 1.0;
        const unitStd = Math.sqrt(unitVar);
        const ns = [1, 2, 3, 6, 15, 30];
        const hScale = 5.5;
        const b = state.bLim;

        grp.add(engine.createAxes3D({
          xRange: [-3.8, 3.8], yRange: [-3.4, 3.6], zRange: [0, 3.6],
          xLabel: '标准化和 Z_n', yLabel: '叠加重数 n (后1 → 前30)', zLabel: '概率密度'
        }));

        // Front-most Golden Reference Curve: Exact Standard Normal N(0, 1) at y = -3.1
        const refPts = [], shadePts = [];
        for (let z = -3.6; z <= 3.6; z += 0.07) {
          const fz = M.normalPDF(z, 0, 1) * hScale;
          refPts.push([z, -3.1, fz]);
          if (Math.abs(z) <= b) shadePts.push([z, -3.08, fz]);
        }
        grp.add(engine.createRibbonCurve({ points: refPts, color: 0xfbbf24, fillOpacity: 0.22 }));
        grp.add(engine.createRibbonCurve({ points: shadePts, color: 0xfbbf24, fillOpacity: 0.55 }));
        grp.add(engine.createLabel('最前排金线: 极限标准正态 N(0,1)', [0, -3.1, 2.65], { accent: '#fbbf24' }));

        // 6 Waterfall Ridges from back (n=1 at y=+3.0) to front (n=30 at y=-2.0)
        const bins = 36;
        const zMin = -3.6, zMax = 3.6, bw = (zMax - zMin) / bins;
        let empInRange30 = 0;
        const trials = 3200;

        ns.forEach((nVal, idx) => {
          const my = 3.0 - idx * 1.0;
          const hist = new Array(bins).fill(0);
          let inB = 0;
          for (let t = 0; t < trials; t++) {
            let s = 0;
            for (let k = 0; k < nVal; k++) s += sampleOne();
            const zn = s / (Math.sqrt(nVal) * unitStd);
            if (Math.abs(zn) <= b) inB++;
            const bi = Math.floor((zn - zMin) / bw);
            if (bi >= 0 && bi < bins) hist[bi]++;
          }
          if (nVal === 30) empInRange30 = inB / trials;

          const ridgePts = [];
          for (let i = 0; i < bins; i++) {
            const zx = zMin + (i + 0.5) * bw;
            const dens = hist[i] / (trials * bw);
            ridgePts.push([zx, my, Math.min(3.5, dens * hScale)]);
          }
          const col = idx === 0 ? 0xf43f5e : (idx < 3 ? 0xa78bfa : 0x38bdf8);
          grp.add(engine.createRibbonCurve({ points: ridgePts, color: col, fillOpacity: 0.34 }));
          grp.add(engine.createLabel(`n=${nVal}`, [-3.5, my, 0.5], { scale: 0.48 }));
        });

        const cltProb = M.normalCDF(b) - M.normalCDF(-b);
        ctx.setMetrics([
          { label: 'CLT 正态近似概率', value: cltProb.toFixed(4), sub: `2Φ(${b.toFixed(1)}) − 1`, highlight: true },
          { label: 'n=30 实测精确概率', value: empInRange30.toFixed(4), sub: `P(|Z₃₀| ≤ ${b.toFixed(1)})` },
          { label: '中心极限定理绝对误差', value: Math.abs(empInRange30 - cltProb).toFixed(4), sub: '工程近似精度极高!' },
          { label: '棣莫佛-拉普拉斯公式', value: 'B(n,p) ≈ N(np, npq)', sub: '离散二项大样本正态近似' }
        ]);

        ctx.setFormulas([
          {
            title: '列维-林德伯格 (Lévy-Lindeberg) 中心极限定理',
            tex: `Z_n = \\frac{\\sum_{i=1}^n X_i - n\\mu}{\\sqrt{n}\\sigma} \\xrightarrow{d} N(0,1) \\implies P(-b \\le Z_n \\le b) \\approx 2\\Phi(${b.toFixed(1)})-1 = ${cltProb.toFixed(4)}`,
            note: '从后往前看：即便 n=1（红色后排）是中心凹陷的双峰分布或偏态分布，叠加到 n=15, 30（前排蓝线）已完美演化为正态钟形！'
          },
          {
            title: '棣莫佛-拉普拉斯 (De Moivre-Laplace) 二项正态近似',
            tex: `X_n \\sim B(n,p) \\implies \\lim_{n\\to\\infty} P\\!\\left(a < \\frac{X_n - np}{\\sqrt{np(1-p)}} \\le b\\right) = \\Phi(b) - \\Phi(a)`,
            note: '大样本光电误码计数无需硬算庞大组合数 C_n^k，直接查标准正态表 Φ(x) 即可！'
          }
        ]);
      }

      render();
      return { onControlChange: render, onAction: render, reset: render };
    }
  };
})();
