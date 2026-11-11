/**
 * 第六章 ~ 第八章（数理统计篇）3D 交互式教学仿真案例实现（共 8 个实验案例）
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
  // 6-1: 总体抽样、常用统计量与经验分布函数 F_n(x) 3D 观测舱
  // =========================================================================
  Reg['6-1'] = {
    camera: { radius: 14.2, theta: 0.52, phi: 1.10, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'n', label: '单批随机抽样容量 n', min: 6, max: 100, step: 2, value: 18 },
      { type: 'slider', key: 'mu', label: '晶圆总体真均值 μ (V)', min: -1.0, max: 1.5, step: 0.1, value: 0.2 },
      { type: 'slider', key: 'sigma', label: '晶圆总体真标准差 σ (V)', min: 0.5, max: 1.5, step: 0.1, value: 0.9 },
      { type: 'button', label: '重新随机抽取一批样本', action: 'draw', variant: 'primary' },
      { type: 'button', label: '连续抽样 +80 批累积 X̄ 分布', action: 'batch', variant: 'secondary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      let currentSample = [];
      let meanHistory = [];

      function drawOnce() {
        currentSample = [];
        for (let i = 0; i < state.n; i++) {
          currentSample.push(M.randNormal(state.mu, state.sigma));
        }
        const st = M.sampleStats(currentSample);
        meanHistory.push(st.mean);
        if (meanHistory.length > 400) meanHistory.shift();
      }

      function resetAll() {
        meanHistory = [];
        for (let i = 0; i < 40; i++) drawOnce();
      }
      resetAll();

      function render() {
        clearSub(grp, engine);
        const { mu, sigma } = state;
        const st = M.sampleStats(currentSample);
        const hScale = 3.2;

        grp.add(engine.createAxes3D({
          xRange: [-4.0, 4.2], yRange: [-3.0, 3.0], zRange: [0, 3.8],
          xLabel: '观测值 x', yLabel: '前:样本点 / 后:经验分布 F_n(x)', zLabel: '概率 / 密度'
        }));

        // Front row y = -2.0: Individual Sample Spheres X_1..X_n + Mean X_bar flagpole
        currentSample.forEach((val) => {
          const sp = new THREE.Mesh(
            new THREE.SphereGeometry(0.10, 10, 10),
            new THREE.MeshPhongMaterial({ color: 0x38bdf8 })
          );
          sp.position.copy(engine.m2w(Math.max(-3.8, Math.min(3.8, val)), -2.0, 0.12));
          grp.add(sp);
        });
        grp.add(engine.createRibbonCurve({
          points: [[st.mean, -2.0, 0], [st.mean, -2.0, 1.8]], color: 0xfbbf24, fillOpacity: 0
        }));
        grp.add(engine.createLabel(`本批均值 X̄=${st.mean.toFixed(3)}, S²=${st.varUnbiased.toFixed(3)}`, [st.mean, -2.0, 2.1], { accent: '#fbbf24' }));

        // Middle row y = 0: Accumulated Histogram of Sample Mean X_bar across batches
        const bins = 18, xMin = -2.5, xMax = 2.9, bw = (xMax - xMin) / bins;
        const counts = new Array(bins).fill(0);
        meanHistory.forEach((m) => {
          const bi = Math.floor((m - xMin) / bw);
          if (bi >= 0 && bi < bins) counts[bi]++;
        });
        for (let i = 0; i < bins; i++) {
          const dens = counts[i] / (Math.max(1, meanHistory.length) * bw);
          if (counts[i] > 0) {
            grp.add(engine.createBar3D({
              x: xMin + (i + 0.5) * bw, y: 0,
              height: Math.min(3.5, dens * 1.4), width: bw * 0.82, depth: 0.45,
              color: 0xa78bfa, opacity: 0.72
            }));
          }
        }

        // Back plane y = 2.0: Empirical CDF F_n(x) step function vs True CDF F(x)
        const trueCdfPts = [], empCdfPts = [];
        const sorted = st.sorted;
        for (let x = -3.8; x <= 3.8; x += 0.06) {
          trueCdfPts.push([x, 2.0, M.normalCDF(x, mu, sigma) * hScale]);
          // Empirical proportion <= x
          let k = 0;
          while (k < sorted.length && sorted[k] <= x) k++;
          empCdfPts.push([x, 1.96, (k / sorted.length) * hScale]);
        }
        grp.add(engine.createRibbonCurve({ points: trueCdfPts, color: 0x34d399, fillOpacity: 0.16 }));
        grp.add(engine.createRibbonCurve({ points: empCdfPts, color: 0xf43f5e, fillOpacity: 0.28 }));
        grp.add(engine.createLabel('后墙: 红阶梯经验分布 F_n(x) 逼近 绿真分布 F(x)', [0, 2.0, 3.65], { accent: '#34d399' }));

        // Max Kolmogorov-Smirnov sup |F_n(x) - F(x)|
        let ksMax = 0;
        sorted.forEach((v, idx) => {
          const fv = M.normalCDF(v, mu, sigma);
          ksMax = Math.max(ksMax, Math.abs((idx + 1) / sorted.length - fv), Math.abs(idx / sorted.length - fv));
        });

        ctx.setMetrics([
          { label: '样本均值统计量 X̄', value: st.mean.toFixed(4), sub: `真值 μ = ${mu.toFixed(2)}`, highlight: true },
          { label: '样本方差 S² (除n−1)', value: st.varUnbiased.toFixed(4), sub: `真值 σ² = ${(sigma * sigma).toFixed(2)}` },
          { label: '极差 X_(n) − X_(1)', value: `${(st.max - st.min).toFixed(3)}`, sub: `[${st.min.toFixed(2)}, ${st.max.toFixed(2)}]` },
          { label: '格里汶科最大偏差 D_n', value: ksMax.toFixed(4), sub: 'sup|F_n(x)−F(x)| 随n→∞趋于0' }
        ]);

        ctx.setFormulas([
          {
            title: '常用样本统计量定义（不含任何未知参数!）',
            tex: `\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i = ${st.mean.toFixed(3)}, \\qquad S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2 = ${st.varUnbiased.toFixed(3)}`,
            note: '统计量是纯粹由样本计算出的随机变量，不含未知总体参数，是连接观测数据与统计推断的桥梁。'
          },
          {
            title: '经验分布函数与格里汶科-坎泰利定理',
            tex: `F_n(x) = \\frac{\\text{样本中 } \\le x \\text{ 的个数}}{n}, \\qquad P\\!\\left(\\sup_x |F_n(x)-F(x)| \\xrightarrow{n\\to\\infty} 0\\right) = 1`,
            note: '增大滑块 n 至 80 以上，后墙红色经验阶梯曲线几乎完美贴合绿色真实总体分布函数！'
          }
        ]);
      }

      render();
      return {
        onControlChange() { resetAll(); render(); },
        onAction(act) {
          if (act === 'draw') { drawOnce(); render(); }
          else if (act === 'batch') { for (let i = 0; i < 80; i++) drawOnce(); render(); }
        },
        reset() { resetAll(); render(); }
      };
    }
  };

  // =========================================================================
  // 6-2: 三大抽样分布（χ² 分布、t 分布、F 分布）与分位数 3D 曲面族
  // =========================================================================
  Reg['6-2'] = {
    camera: { radius: 14.5, theta: 0.62, phi: 1.06, target: [0, 1.6, 0] },
    controls: [
      {
        type: 'select', key: 'dist', label: '三大抽样分布切换', value: 'chi2',
        options: [
          { label: 'χ²(n) 卡方分布：标准正态平方和 ∑Zᵢ²', value: 'chi2' },
          { label: 't(n) 学生氏分布：Z / √(χ²(n)/n) 重尾对称', value: 't' },
          { label: 'F(n₁, n₂) 分布：(χ²₁/n₁) / (χ²₂/n₂) 方差比', value: 'f' }
        ]
      },
      { type: 'slider', key: 'df1', label: '第一自由度 n (或 n₁)', min: 2, max: 25, step: 1, value: 6 },
      { type: 'slider', key: 'df2', label: '第二自由度 n₂ (F分布专用)', min: 4, max: 30, step: 1, value: 12 },
      { type: 'slider', key: 'alpha', label: '上 α 分位数显著性水平 α', min: 0.01, max: 0.20, step: 0.01, value: 0.05 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { df1, df2, alpha } = state;

        if (state.dist === 'chi2') {
          const xMax = 32;
          const xScale = 8.0 / xMax; // map [0, 32] -> [-4, 4]
          const zScale = 12.0;

          grp.add(engine.createAxes3D({
            xRange: [-4.2, 4.4], yRange: [-3.2, 3.2], zRange: [0, 3.8],
            xLabel: 'χ² 值 (0→32)', yLabel: '自由度 df (2→22)', zLabel: 'f(x)'
          }));

          grp.add(engine.createParametricSurface({
            fn: (mx, my) => {
              const x = (mx + 4.0) / xScale;
              const df = 2 + ((my + 3.0) / 6.0) * 20;
              return Math.min(0.28, M.chi2PDF(x, df));
            },
            xMin: -3.95, xMax: 4.0, nx: 58,
            yMin: -3.0, yMax: 3.0, ny: 36,
            zScale, scheme: 'cyber', opacity: 0.76
          }));

          // Highlight selected df1 slice + upper-alpha tail!
          const qVal = M.chi2Inv(1 - alpha, df1);
          const mySel = -3.0 + ((df1 - 2) / 20) * 6.0;
          const tailPts = [], fullPts = [];
          for (let x = 0.15; x <= xMax; x += 0.25) {
            const mx = -4.0 + x * xScale;
            const mz = Math.min(3.5, M.chi2PDF(x, df1) * zScale);
            fullPts.push([mx, mySel, mz]);
            if (x >= qVal) tailPts.push([mx, mySel - 0.02, mz]);
          }
          grp.add(engine.createRibbonCurve({ points: fullPts, color: 0xfbbf24, fillOpacity: 0.3 }));
          if (tailPts.length > 1) {
            grp.add(engine.createRibbonCurve({ points: tailPts, color: 0xf43f5e, fillOpacity: 0.72 }));
          }
          const qMx = Math.min(4.0, -4.0 + qVal * xScale);
          grp.add(engine.createSlicePlane({ axis: 'x', value: qMx, uRange: [mySel - 0.9, mySel + 0.9], vRange: [0, 3.0], color: 0xf43f5e, opacity: 0.28 }));
          grp.add(engine.createLabel(`χ²_${alpha.toFixed(2)}(${df1}) = ${qVal.toFixed(3)}`, [qMx, mySel, 3.2], { accent: '#f43f5e' }));

          ctx.setMetrics([
            { label: `上 α 分位数 χ²_${alpha}(${df1})`, value: qVal.toFixed(4), sub: `右侧红尾面积 = ${(alpha * 100).toFixed(0)}%`, highlight: true },
            { label: '期望 E(χ²) = n', value: String(df1), sub: '卡方分布均值等于自由度' },
            { label: '方差 D(χ²) = 2n', value: String(2 * df1), sub: '卡方方差等于 2 倍自由度' },
            { label: '可加性定理', value: 'χ²(n₁)+χ²(n₂)=χ²(n₁+n₂)', sub: '需相互独立' }
          ]);

          ctx.setFormulas([
            {
              title: 'χ²(n) 分布构造定义与性质',
              tex: `\\chi^2 = \\sum_{i=1}^{n} Z_i^2 \\sim \\chi^2(n)\\;(Z_i \\stackrel{\\text{i.i.d.}}{\\sim} N(0,1)), \\quad E(\\chi^2)=n,\\; D(\\chi^2)=2n, \\quad \\chi^2_{${alpha.toFixed(2)}}(${df1}) = ${qVal.toFixed(3)}`,
              note: '沿深度方向观察：自由度较小时卡方高度右偏，随自由度增大山脊向右移动并渐近对称正态！'
            }
          ]);
        } else if (state.dist === 't') {
          const zScale = 7.5;
          grp.add(engine.createAxes3D({
            xRange: [-4.2, 4.2], yRange: [-3.2, 3.2], zRange: [0, 3.8],
            xLabel: 't 值', yLabel: '自由度 n (1→25)', zLabel: 'f(t)'
          }));

          grp.add(engine.createParametricSurface({
            fn: (mx, my) => {
              const df = 1 + ((my + 3.0) / 6.0) * 24;
              return M.tPDF(mx, df);
            },
            xMin: -3.8, xMax: 3.8, nx: 56,
            yMin: -3.0, yMax: 3.0, ny: 34,
            zScale, scheme: 'plasma', opacity: 0.72
          }));

          // Front Golden Reference N(0,1) vs Selected t(df1)
          const normPts = [], tPts = [], tailPts = [];
          const qVal = M.tInv(1 - alpha, df1);
          for (let x = -3.8; x <= 3.8; x += 0.07) {
            normPts.push([x, -3.1, M.normalPDF(x, 0, 1) * zScale]);
            tPts.push([x, -2.5, M.tPDF(x, df1) * zScale]);
            if (x >= qVal) tailPts.push([x, -2.48, M.tPDF(x, df1) * zScale]);
          }
          grp.add(engine.createRibbonCurve({ points: normPts, color: 0xfbbf24, fillOpacity: 0.16 }));
          grp.add(engine.createRibbonCurve({ points: tPts, color: 0x38bdf8, fillOpacity: 0.35 }));
          if (tailPts.length > 1) grp.add(engine.createRibbonCurve({ points: tailPts, color: 0xf43f5e, fillOpacity: 0.7 }));

          const qClamped = Math.min(3.8, qVal);
          grp.add(engine.createLabel(`t_${alpha.toFixed(2)}(${df1}) = ${qVal.toFixed(4)}`, [qClamped, -2.5, 2.8], { accent: '#f43f5e' }));
          grp.add(engine.createLabel('最前金线: 标准正态 N(0,1) 渐近极限', [-1.8, -3.1, 3.2], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: `单侧上分位数 t_${alpha}(${df1})`, value: qVal.toFixed(4), sub: `正态对应 z_${alpha}=${M.normalInv(1 - alpha).toFixed(4)}`, highlight: true },
            { label: `双侧临界值 t_${(alpha / 2).toFixed(3)}(${df1})`, value: M.tInv(1 - alpha / 2, df1).toFixed(4), sub: '区间估计与双侧 t 检验查表值' },
            { label: '数学期望 E(T)', value: '0 (当 n > 1)', sub: '关于 t=0 严格偶对称: t_{1−α} = −t_α' },
            { label: '方差 D(T) = n/(n−2)', value: df1 > 2 ? (df1 / (df1 - 2)).toFixed(3) : '∞ (重尾!)', sub: '大于 1，尾部比正态更厚' }
          ]);

          ctx.setFormulas([
            {
              title: 't(n) 分布构造定义与对称性质',
              tex: `T = \\frac{Z}{\\sqrt{Y/n}} \\sim t(n)\\;(Z\\sim N(0,1),\\; Y\\sim\\chi^2(n)\\text{ 独立}), \\quad t_{1-\\alpha}(n) = -t_{\\alpha}(n)`,
              note: '因分母用随机变量 S 估计未知 σ 带来额外波动，小样本 t 分布峰值低于正态而双尾更厚；当 n≥30 时几乎与 N(0,1) 重合。'
            }
          ]);
        } else {
          // F(df1, df2)
          const xMax = 6.0;
          const xScale = 8.0 / xMax;
          const zScale = 3.8;
          grp.add(engine.createAxes3D({
            xRange: [-4.2, 4.4], yRange: [-3.2, 3.2], zRange: [0, 3.8],
            xLabel: 'F 值 (0→6)', yLabel: '自由度演化', zLabel: 'f(x)'
          }));

          grp.add(engine.createParametricSurface({
            fn: (mx, my) => {
              const x = Math.max(0.04, (mx + 4.0) / xScale);
              const d1 = 2 + ((my + 3.0) / 6.0) * 18;
              return Math.min(0.95, M.fPDF(x, d1, df2));
            },
            xMin: -3.9, xMax: 4.0, nx: 56,
            yMin: -3.0, yMax: 3.0, ny: 34,
            zScale, scheme: 'emerald', opacity: 0.76
          }));

          const qVal = M.fInv(1 - alpha, df1, df2);
          const qLower = M.fInv(alpha, df2, df1); // Reciprocal property: F_{1-alpha}(n1,n2) = 1 / F_alpha(n1,n2)... wait: F_{1-a}(n1,n2) = 1 / F_a(n2,n1)!
          const fPts = [], tailPts = [];
          for (let x = 0.05; x <= xMax; x += 0.06) {
            const mx = -4.0 + x * xScale;
            const mz = Math.min(3.6, M.fPDF(x, df1, df2) * zScale);
            fPts.push([mx, -2.8, mz]);
            if (x >= qVal) tailPts.push([mx, -2.78, mz]);
          }
          grp.add(engine.createRibbonCurve({ points: fPts, color: 0xfbbf24, fillOpacity: 0.3 }));
          if (tailPts.length > 1) grp.add(engine.createRibbonCurve({ points: tailPts, color: 0xf43f5e, fillOpacity: 0.72 }));
          const qMx = Math.min(4.0, -4.0 + qVal * xScale);
          grp.add(engine.createLabel(`F_${alpha.toFixed(2)}(${df1},${df2}) = ${qVal.toFixed(3)}`, [qMx, -2.8, 2.9], { accent: '#f43f5e' }));

          ctx.setMetrics([
            { label: `上分位数 F_${alpha}(${df1},${df2})`, value: qVal.toFixed(4), sub: '附表直接查表值', highlight: true },
            { label: `下侧倒数 F_${(1 - alpha).toFixed(2)}(${df1},${df2})`, value: (1 / M.fInv(1 - alpha, df2, df1)).toFixed(4), sub: '1 / F_α(n₂, n₁) 必考性质!' },
            { label: '数学期望 n₂/(n₂−2)', value: (df2 / (df2 - 2)).toFixed(3), sub: '仅与分母自由度 n₂ 有关!' },
            { label: 't 与 F 平方关系', value: 'T²(n) ~ F(1, n)', sub: '第一自由度为 1 的特例' }
          ]);

          ctx.setFormulas([
            {
              title: 'F(n₁, n₂) 分布构造定义与倒数查表定理',
              tex: `F = \\frac{U/n_1}{V/n_2} \\sim F(n_1, n_2), \\qquad F_{1-\\alpha}(n_1, n_2) = \\frac{1}{F_{\\alpha}(n_2, n_1)}`,
              note: '工程统计表通常只印小 α（如 0.05, 0.025），求左侧临界值 F_{0.95}(n₁,n₂) 必须交换自由度次序取倒数！'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 6-3: 正态总体的抽样分布定理：(X̄, S²) 独立性 3D 散点云验证
  // =========================================================================
  Reg['6-3'] = {
    camera: { radius: 14.0, theta: 0.65, phi: 1.06, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'pop', label: '抽样母体分布（对比 Fisher 定理!）', value: 'normal',
        options: [
          { label: '正态总体 N(0, 1)：验证 X̄ 与 S² 相互独立 (r ≈ 0!)', value: 'normal' },
          { label: '对比反例：指数总体 Exp(1) → X̄ 与 S² 强烈正相关!', value: 'exp' }
        ]
      },
      { type: 'slider', key: 'n', label: '每批样本容量 n', min: 4, max: 20, step: 1, value: 8 },
      { type: 'button', label: '重新仿真 900 批独立抽样云', action: 'rerun', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const n = state.n;
        const B = 900;
        const xBars = [], s2s = [], cloudCoords = [];

        for (let b = 0; b < B; b++) {
          const arr = [];
          for (let i = 0; i < n; i++) {
            arr.push(state.pop === 'normal' ? M.randNormal(0, 1) : (M.randExp(1) - 1));
          }
          const st = M.sampleStats(arr);
          xBars.push(st.mean);
          s2s.push(st.varUnbiased);
          // Map mean in [-1.5, 1.5] -> mx in [-3, 3]; s2 in [0, 3.2] -> my in [-3, 3]
          const mx = Math.max(-3.3, Math.min(3.3, st.mean * 2.4));
          const my = Math.max(-3.0, Math.min(3.3, -2.6 + st.varUnbiased * 1.8));
          const wp = engine.m2w(mx, my, 0.15 + Math.min(2.6, st.varUnbiased * 0.45));
          cloudCoords.push(wp.x, wp.y, wp.z);
        }

        grp.add(engine.createAxes3D({
          xRange: [-3.6, 3.6], yRange: [-3.2, 3.6], zRange: [0, 3.6],
          xLabel: '样本均值 X̄', yLabel: '样本方差 S²', zLabel: '抽样密度'
        }));

        const ptGeo = new THREE.BufferGeometry();
        ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(cloudCoords, 3));
        grp.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
          color: state.pop === 'normal' ? 0x38bdf8 : 0xf43f5e,
          size: 0.10, transparent: true, opacity: 0.82
        })));

        // Back wall y = 3.4: Theoretical X_bar ~ N(0, 1/n)
        const meanPts = [];
        for (let u = -3.3; u <= 3.3; u += 0.07) {
          const realM = u / 2.4;
          meanPts.push([u, 3.4, M.normalPDF(realM, 0, 1 / Math.sqrt(n)) * 1.6]);
        }
        grp.add(engine.createRibbonCurve({ points: meanPts, color: 0x34d399, fillOpacity: 0.35 }));

        // Left wall x = -3.5: Theoretical S^2 ~ sigma^2/(n-1) * chi2(n-1)
        const varPts = [];
        for (let v = -2.55; v <= 3.2; v += 0.08) {
          const s2Val = (v + 2.6) / 1.8;
          const chi2Density = s2Val > 0 ? (n - 1) * M.chi2PDF((n - 1) * s2Val, n - 1) : 0;
          varPts.push([-3.5, v, Math.min(3.3, chi2Density * 2.8)]);
        }
        grp.add(engine.createRibbonCurve({ points: varPts, color: 0xfbbf24, fillOpacity: 0.35 }));

        // Compute sample correlation r(X_bar, S^2)
        const stM = M.sampleStats(xBars);
        const stV = M.sampleStats(s2s);
        let cov = 0;
        for (let i = 0; i < B; i++) cov += (xBars[i] - stM.mean) * (s2s[i] - stV.mean);
        const rCorr = (cov / B) / Math.max(1e-9, stM.std * stV.std);

        grp.add(engine.createLabel(
          state.pop === 'normal'
            ? `正态总体: r(X̄, S²) = ${rCorr.toFixed(3)} ≈ 0 (相互独立!)`
            : `指数总体: r(X̄, S²) = ${rCorr.toFixed(3)} (强烈倾斜耦合，绝不独立!)`,
          [0, 0, 3.2],
          { accent: state.pop === 'normal' ? '#34d399' : '#f43f5e' }
        ));

        ctx.setMetrics([
          { label: '实测相关系数 r(X̄, S²)', value: rCorr.toFixed(4), sub: state.pop === 'normal' ? '理论严格为 0 且相互独立!' : '偏态总体均值与方差强耦合!', highlight: true },
          { label: 'X̄ 分布标准差 σ/√n', value: (1 / Math.sqrt(n)).toFixed(4), sub: `实测: ${stM.std.toFixed(4)}` },
          { label: '(n−1)S²/σ² 分布', value: state.pop === 'normal' ? `χ²(${n - 1})` : '不再服从卡方分布', sub: `S²均值: ${stV.mean.toFixed(3)} (真值1)` },
          { label: '枢轴量 (X̄−μ)/(S/√n)', value: state.pop === 'normal' ? `t(${n - 1})` : '仅大样本近似', sub: '依赖 X̄ 与 S² 独立导出!' }
        ]);

        ctx.setFormulas([
          {
            title: '正态总体抽样分布三大黄金定理（Fisher 引理）',
            tex: `\\text{(1) } \\bar{X}\\sim N\\!\\left(\\mu,\\frac{\\sigma^2}{n}\\right); \\quad \\text{(2) } \\frac{(n-1)S^2}{\\sigma^2}\\sim \\chi^2(n-1); \\quad \\text{(3) } \\bar{X} \\text{ 与 } S^2 \\text{ 相互独立!}`,
            note: '正是因为性质(3) X̄ 与 S² 独立，才可以直接将标准正态 Z=(X̄−μ)/(σ/√n) 除以独立的 √(χ²/(n−1)) 得到精确的 t(n−1) 分布！'
          }
        ]);
      }

      render();
      return { onControlChange: render, onAction: render, reset: render };
    }
  };

  // =========================================================================
  // 7-1: 矩估计法与极大似然估计 3D 对数似然山峰寻优
  // =========================================================================
  Reg['7-1'] = {
    camera: { radius: 14.0, theta: 0.64, phi: 1.05, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'model', label: '待估总体参数模型', value: 'norm2d',
        options: [
          { label: '双参数正态总体 N(μ, σ²)：三维对数似然山峰寻顶', value: 'norm2d' },
          { label: '经典难点：均匀总体 U(0, θ) 悬崖似然 (MLE=X_(n) vs 矩估计=2X̄)', value: 'unif_cliff' }
        ]
      },
      { type: 'slider', key: 'n', label: '实测电子样本容量 n', min: 5, max: 40, step: 1, value: 12 },
      { type: 'button', label: '重新采集一组实测样本并寻优', action: 'resample', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      let data = [];
      function drawSample() {
        data = [];
        for (let i = 0; i < state.n; i++) {
          if (state.model === 'norm2d') data.push(M.randNormal(0.6, 1.1)); // true mu=0.6, sigma^2=1.21
          else data.push(Math.random() * 2.4); // true theta = 2.4
        }
      }
      drawSample();

      function render() {
        clearSub(grp, engine);
        const st = M.sampleStats(data);

        if (state.model === 'norm2d') {
          const muHat = st.mean;
          const sig2MLE = Math.max(0.25, st.varMLE);
          const sig2Unbiased = st.varUnbiased;

          grp.add(engine.createAxes3D({
            xRange: [-3.5, 3.5], yRange: [-3.2, 3.2], zRange: [0, 3.8],
            xLabel: '候选参数 μ', yLabel: '候选参数 σ² (0.3→2.7)', zLabel: '对数似然 ln L(μ,σ²)'
          }));

          // Compute max logL at (muHat, sig2MLE) to shift surface cleanly into [0, 3.2]
          function logL(mu, s2) {
            let sq = 0;
            for (let i = 0; i < data.length; i++) sq += (data[i] - mu) * (data[i] - mu);
            return -0.5 * data.length * Math.log(2 * Math.PI * s2) - sq / (2 * s2);
          }
          const maxLL = logL(muHat, sig2MLE);

          grp.add(engine.createParametricSurface({
            fn: (mx, my) => {
              const candMu = mx * 0.6 + 0.6; // [-1.2, 2.4]
              const candS2 = 0.35 + ((my + 3.0) / 6.0) * 2.4;
              const diff = logL(candMu, candS2) - maxLL; // <= 0
              return Math.max(0, 3.2 + diff * (3.2 / Math.max(6, state.n * 0.85)));
            },
            xMin: -3.0, xMax: 3.0, nx: 52,
            yMin: -3.0, yMax: 3.0, ny: 52,
            zScale: 1.0, scheme: 'plasma', opacity: 0.85
          }));

          // Golden Beacon at MLE Peak
          const peakMx = (muHat - 0.6) / 0.6;
          const peakMy = -3.0 + ((sig2MLE - 0.35) / 2.4) * 6.0;
          const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.17, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          beacon.position.copy(engine.m2w(peakMx, peakMy, 3.28));
          grp.add(beacon);
          grp.add(engine.createLabel(`MLE 峰顶: μ̂=${muHat.toFixed(2)}, σ̂²=${sig2MLE.toFixed(2)}`, [peakMx, peakMy, 3.72], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '矩估计 / MLE 均值 μ̂', value: muHat.toFixed(4), sub: '真值 μ₀ = 0.6000 (两者相同)', highlight: true },
            { label: '矩估计 / MLE 方差 σ̂²', value: sig2MLE.toFixed(4), sub: '1/n ∑(Xᵢ−X̄)² (有偏)' },
            { label: '修正无偏方差 S²', value: sig2Unbiased.toFixed(4), sub: `真值 σ₀² = 1.2100` },
            { label: '峰值对数似然 ln L_max', value: maxLL.toFixed(2), sub: '驻点 ∂lnL/∂μ=0, ∂lnL/∂σ²=0' }
          ]);

          ctx.setFormulas([
            {
              title: '正态总体对数似然函数与驻点方程组',
              tex: `\\ln L(\\mu,\\sigma^2) = -\\frac{n}{2}\\ln(2\\pi\\sigma^2) - \\frac{1}{2\\sigma^2}\\sum_{i=1}^n(x_i-\\mu)^2 \\implies \\hat{\\mu}_{\\text{MLE}}=\\bar{X},\\; \\hat{\\sigma}^2_{\\text{MLE}}=\\frac{1}{n}\\sum(X_i-\\bar{X})^2`,
              note: '对数变换 ln L(θ) 是严格单调增变换，将复杂的连乘积转化为求和，且不改变似然山峰最高点的位置！'
            }
          ]);
        } else {
          // Uniform U(0, theta) 3D Likelihood Cliff!
          const xMaxSample = st.max;
          const thetaMoM = 2 * st.mean;
          const thetaMLE = xMaxSample;

          grp.add(engine.createAxes3D({
            xRange: [-0.5, 4.5], yRange: [-2.2, 2.2], zRange: [0, 3.8],
            xLabel: '候选上界参数 θ', yLabel: '立体似然陡崖', zLabel: '似然函数 L(θ)'
          }));

          // Sample points on floor
          data.forEach((v) => {
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            s.position.copy(engine.m2w(v, -1.6, 0.1));
            grp.add(s);
          });

          // 3D Cliff Surface L(theta) = 0 if theta < X_(n), else (X_(n)/theta)^n normalized to peak 3.2!
          grp.add(engine.createParametricSurface({
            fn: (mx) => {
              if (mx < xMaxSample) return 0;
              return 3.2 * Math.pow(xMaxSample / mx, Math.min(8, state.n * 0.6));
            },
            xMin: 0.1, xMax: 4.2, nx: 90,
            yMin: -1.0, yMax: 1.0, ny: 12,
            zScale: 1.0, scheme: 'warmRed', opacity: 0.88
          }));

          // Vertical poles for MLE = X_(n) and MoM = 2*X_bar
          grp.add(engine.createRibbonCurve({ points: [[thetaMLE, 0, 0], [thetaMLE, 0, 3.5]], color: 0xfbbf24, fillOpacity: 0 }));
          grp.add(engine.createLabel(`悬崖顶端 MLE: θ̂ = X_(n) = ${thetaMLE.toFixed(3)}`, [thetaMLE, 0, 3.8], { accent: '#fbbf24' }));

          grp.add(engine.createRibbonCurve({ points: [[thetaMoM, -1.3, 0], [thetaMoM, -1.3, 2.5]], color: 0x34d399, fillOpacity: 0 }));
          grp.add(engine.createLabel(`矩估计 MoM: θ̂ = 2X̄ = ${thetaMoM.toFixed(3)}`, [thetaMoM, -1.3, 2.8], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '真实参数上界 θ₀', value: '2.4000', sub: 'X ~ U(0, 2.4)' },
            { label: '极大似然估计 θ̂_MLE', value: thetaMLE.toFixed(4), sub: 'max(X₁,…,X_n) 悬崖左端点!', highlight: true },
            { label: '矩估计量 θ̂_MoM = 2X̄', value: thetaMoM.toFixed(4), sub: '由 E(X)=θ/2 解出 (可能小于X_(n)!)' },
            { label: '为何不能令 dL/dθ = 0?', value: 'L\'(θ) = −n/θ^{n+1} < 0', sub: '在 θ ≥ X_(n) 上严格单调递减!' }
          ]);

          ctx.setFormulas([
            {
              title: '均匀分布 U(0, θ) 矩估计 vs 极大似然估计（教材必考经典!）',
              tex: `L(\\theta) = \\begin{cases} \\theta^{-n}, & \\theta \\ge \\max_{1\\le i\\le n} x_i \\\\ 0, & \\theta < \\max_{1\\le i\\le n} x_i \\end{cases} \\implies \\hat{\\theta}_{\\text{MLE}} = X_{(n)}, \\quad \\hat{\\theta}_{\\text{MoM}} = 2\\bar{X}`,
              note: '一旦候选 θ 小于最大的那个观测样本 X_(n)，该样本就不可能发生（似然瞬间跌落悬崖归零）；而在 θ ≥ X_(n) 右侧 θ^{-n} 单调下降，故最高峰必在边界 X_(n) 取得！'
            }
          ]);
        }
      }

      render();
      return {
        onControlChange() { drawSample(); render(); },
        onAction() { drawSample(); render(); },
        reset() { drawSample(); render(); }
      };
    }
  };

  // =========================================================================
  // 7-2: 点估计量的评选标准：无偏性(n−1)、有效性与相合性 3D 靶场
  // =========================================================================
  Reg['7-2'] = {
    camera: { radius: 13.8, theta: 0.56, phi: 1.08, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'criterion', label: '评选标准实验模块', value: 'unbiased',
        options: [
          { label: '无偏性验证：为什么样本方差必须除以 n−1 而非 n？', value: 'unbiased' },
          { label: '有效性对比：算术均值 X̄ vs 样本中位数 (谁方差更小?)', value: 'efficient' },
          { label: '相合性(一致性)：随样本量 n 增大估计分布收缩为尖针', value: 'consistent' }
        ]
      },
      { type: 'slider', key: 'n', label: '小样本容量 n（n越小 n−1 修正越关键!）', min: 3, max: 16, step: 1, value: 4 },
      { type: 'button', label: '运行 2500 批次蒙特卡洛评估', action: 'run', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const n = state.n;
        const B = 2500;

        if (state.criterion === 'unbiased') {
          // True sigma^2 = 2.0
          const trueVar = 2.0;
          let sumS2 = 0, sumMLE = 0;
          const bins = 22, vMax = 5.5, bw = vMax / bins;
          const hS2 = new Array(bins).fill(0);
          const hMLE = new Array(bins).fill(0);

          for (let b = 0; b < B; b++) {
            const arr = [];
            for (let i = 0; i < n; i++) arr.push(M.randNormal(0, Math.sqrt(trueVar)));
            const st = M.sampleStats(arr);
            sumS2 += st.varUnbiased;
            sumMLE += st.varMLE;
            const i1 = Math.floor(st.varUnbiased / bw);
            const i2 = Math.floor(st.varMLE / bw);
            if (i1 >= 0 && i1 < bins) hS2[i1]++;
            if (i2 >= 0 && i2 < bins) hMLE[i2]++;
          }
          const avgS2 = sumS2 / B;
          const avgMLE = sumMLE / B;

          grp.add(engine.createAxes3D({
            xRange: [-3.5, 4.2], yRange: [-2.4, 2.4], zRange: [0, 3.8],
            xLabel: '方差估计值', yLabel: '前:除n−1(无偏) / 后:除n(有偏)', zLabel: '频率密度'
          }));

          // True sigma^2 = 2.0 plane (mapped x = -3.0 + val * 1.2)
          const mapX = (v) => -3.0 + v * 1.2;
          grp.add(engine.createSlicePlane({ axis: 'x', value: mapX(trueVar), uRange: [-2.2, 2.2], vRange: [0, 3.5], color: 0xfbbf24, opacity: 0.25 }));
          grp.add(engine.createLabel(`真实总体方差 σ² = ${trueVar.toFixed(2)}`, [mapX(trueVar), 0, 3.7], { accent: '#fbbf24' }));

          const pts1 = [], pts2 = [];
          for (let i = 0; i < bins; i++) {
            const vx = mapX((i + 0.5) * bw);
            pts1.push([vx, -1.2, (hS2[i] / (B * bw)) * 5.2]);
            pts2.push([vx, 1.2, (hMLE[i] / (B * bw)) * 5.2]);
          }
          grp.add(engine.createRibbonCurve({ points: pts1, color: 0x34d399, fillOpacity: 0.45 }));
          grp.add(engine.createRibbonCurve({ points: pts2, color: 0xf43f5e, fillOpacity: 0.42 }));

          // Mean comparison pillars on right
          grp.add(engine.createBar3D({ x: 3.2, y: -1.2, height: avgS2 * 1.3, width: 0.55, depth: 0.55, color: 0x34d399 }));
          grp.add(engine.createBar3D({ x: 3.2, y: 1.2, height: avgMLE * 1.3, width: 0.55, depth: 0.55, color: 0xf43f5e }));
          grp.add(engine.createLabel(`E(S²)=${avgS2.toFixed(2)}`, [3.2, -1.2, avgS2 * 1.3 + 0.35], { scale: 0.48, accent: '#34d399' }));
          grp.add(engine.createLabel(`E(σ̂²)=${avgMLE.toFixed(2)}`, [3.2, 1.2, avgMLE * 1.3 + 0.35], { scale: 0.48, accent: '#f43f5e' }));

          ctx.setMetrics([
            { label: '修正样本方差均值 E(S²)', value: avgS2.toFixed(4), sub: `真值 σ² = 2.0000 (无偏!)`, highlight: true },
            { label: '未修正 MLE 均值 E(σ̂²)', value: avgMLE.toFixed(4), sub: `理论 (n−1)/n·σ² = ${((n - 1) / n * trueVar).toFixed(4)}` },
            { label: '除以 n 导致的系统低估率', value: `-${(100 / n).toFixed(1)}%`, sub: `n=${n} 时丢失 1 个自由度!` },
            { label: '渐近无偏性', value: 'n→∞ 时 (n−1)/n→1', sub: '大样本下偏差才可忽略' }
          ]);

          ctx.setFormulas([
            {
              title: '贝塞尔修正：为什么除以 n−1 才是无偏估计？',
              tex: `E\\!\\left[\\frac{1}{n}\\sum_{i=1}^n (X_i-\\bar{X})^2\\right] = \\frac{n-1}{n}\\sigma^2 < \\sigma^2 \\implies E(S^2) = E\\!\\left[\\frac{1}{n-1}\\sum_{i=1}^n (X_i-\\bar{X})^2\\right] = \\sigma^2`,
              note: '因为样本总是围绕自己的样本均值 X̄ 比围绕真均值 μ 更近（∑(Xᵢ−X̄)² = ∑(Xᵢ−μ)² − n(X̄−μ)²），必须除以自由度 n−1 补偿损耗！'
            }
          ]);
        } else if (state.criterion === 'efficient') {
          // Compare unbiased Estimator 1: Sample Mean X_bar vs Estimator 2: Sample Median on N(0, 1)
          const means = [], meds = [];
          for (let b = 0; b < B; b++) {
            const arr = [];
            for (let i = 0; i < n; i++) arr.push(M.randNormal(0, 1));
            const st = M.sampleStats(arr);
            means.push(st.mean);
            meds.push(st.median);
          }
          const st1 = M.sampleStats(means);
          const st2 = M.sampleStats(meds);

          grp.add(engine.createAxes3D({
            xRange: [-3.5, 3.5], yRange: [-2.4, 2.4], zRange: [0, 3.8],
            xLabel: '估计误差 θ̂ − θ', yLabel: '前:样本均值 X̄ / 后:样本中位数', zLabel: '分布集中度'
          }));

          const p1 = [], p2 = [];
          for (let x = -2.8; x <= 2.8; x += 0.06) {
            p1.push([x * 1.2, -1.2, M.normalPDF(x, st1.mean, st1.std) * 2.5]);
            p2.push([x * 1.2, 1.2, M.normalPDF(x, st2.mean, st2.std) * 2.5]);
          }
          grp.add(engine.createRibbonCurve({ points: p1, color: 0x34d399, fillOpacity: 0.48 }));
          grp.add(engine.createRibbonCurve({ points: p2, color: 0xf43f5e, fillOpacity: 0.38 }));
          grp.add(engine.createLabel(`前绿: 样本均值 X̄ (更瘦更高 = 更有效!)`, [0, -1.2, 3.4], { accent: '#34d399' }));
          grp.add(engine.createLabel(`后红: 样本中位数 m₀.₅ (同为无偏但方差更大)`, [0, 1.2, 2.5], { accent: '#f43f5e' }));

          ctx.setMetrics([
            { label: '两估计量均值 (无偏验证)', value: `${st1.mean.toFixed(3)} / ${st2.mean.toFixed(3)}`, sub: '真值 μ = 0 (两者皆无偏)' },
            { label: '样本均值方差 D(X̄)', value: st1.varUnbiased.toFixed(4), sub: `理论 σ²/n = ${(1 / n).toFixed(4)}`, highlight: true },
            { label: '样本中位数方差 D(θ̂₂)', value: st2.varUnbiased.toFixed(4), sub: `渐近 πσ²/(2n) ≈ 1.57·D(X̄)` },
            { label: '有效性判定结论', value: 'X̄ 比中位数更有效!', sub: '达到克拉美-罗下界 CRLB' }
          ]);

          ctx.setFormulas([
            {
              title: '估计量有效性（Efficiency）判据',
              tex: `E(\\hat{\\theta}_1)=E(\\hat{\\theta}_2)=\\theta \\;\\text{且}\\; D(\\hat{\\theta}_1) < D(\\hat{\\theta}_2) \\implies \\hat{\\theta}_1 \\text{ 比 } \\hat{\\theta}_2 \\text{ 更有效}`,
              note: '正态总体下，算术均值 X̄ 充分利用了全部样本数值信息，其方差 σ²/n 严格小于样本中位数方差 πσ²/(2n)。'
            }
          ]);
        } else {
          // Consistency waterfall along n = [3, 8, 20, 60]
          const ns = [3, 8, 20, 60];
          grp.add(engine.createAxes3D({
            xRange: [-3.5, 3.5], yRange: [-3.0, 3.0], zRange: [0, 3.8],
            xLabel: '估计值 θ̂_n (真值=0)', yLabel: '样本容量 n (后3 → 前60)', zLabel: '概率密度'
          }));
          ns.forEach((nv, idx) => {
            const my = 2.4 - idx * 1.6;
            const stdN = 1 / Math.sqrt(nv);
            const pts = [];
            for (let x = -3.0; x <= 3.0; x += 0.05) {
              pts.push([x, my, Math.min(3.6, M.normalPDF(x, 0, stdN) * 1.15)]);
            }
            grp.add(engine.createRibbonCurve({ points: pts, color: idx === 3 ? 0xfbbf24 : 0x38bdf8, fillOpacity: 0.38 }));
            grp.add(engine.createLabel(`n = ${nv}`, [-2.8, my, 0.5], { scale: 0.5 }));
          });

          ctx.setMetrics([
            { label: 'n=3 标准误差', value: (1 / Math.sqrt(3)).toFixed(4), sub: '分布宽矮分散' },
            { label: 'n=60 标准误差', value: (1 / Math.sqrt(60)).toFixed(4), sub: '高度集中于真值 θ=0', highlight: true },
            { label: '相合性定义', value: 'θ̂_n →P θ (n→∞)', sub: '依概率收敛于待估真参数' },
            { label: '充分条件', value: '渐近无偏 且 D(θ̂_n)→0', sub: '由切比雪夫不等式即证' }
          ]);

          ctx.setFormulas([
            {
              title: '估计量的相合性（一致性 Consistency）',
              tex: `\\forall \\varepsilon > 0,\\; \\lim_{n\\to\\infty} P(|\\hat{\\theta}_n - \\theta| < \\varepsilon) = 1 \\iff \\hat{\\theta}_n \\xrightarrow{P} \\theta`,
              note: '随着采样数据量 n 无限增大，估计量的概率质量完全坍缩聚焦到真实参数平面上。'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, onAction: render, reset: render };
    }
  };

  // =========================================================================
  // 7-3: 正态总体参数的区间估计：60 批抽样 3D 置信区间森林
  // =========================================================================
  Reg['7-3'] = {
    camera: { radius: 14.5, theta: 0.42, phi: 1.06, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'sigmaKnown', label: '方差已知性模式', value: 'unknown',
        options: [
          { label: 'σ² 未知：采用 t_{α/2}(n−1) 构造 t 置信区间（工程常态）', value: 'unknown' },
          { label: 'σ² 已知：采用 z_{α/2} 构造 U(Z) 置信区间（等长横杆）', value: 'known' }
        ]
      },
      { type: 'slider', key: 'conf', label: '置信水平 1 − α', min: 0.80, max: 0.99, step: 0.01, value: 0.95 },
      { type: 'slider', key: 'n', label: '每批次芯片抽测数 n', min: 5, max: 35, step: 1, value: 10 },
      { type: 'button', label: '重新模拟 60 批独立测试产线', action: 'resim', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      const TRUE_MU = 0.0; // Centered representing 5.00V deviation 0
      const TRUE_SIGMA = 1.1;
      const BATCHES = 60;
      let rawBatches = [];

      function genBatches() {
        rawBatches = [];
        for (let b = 0; b < BATCHES; b++) {
          const arr = [];
          for (let i = 0; i < 35; i++) arr.push(M.randNormal(TRUE_MU, TRUE_SIGMA));
          rawBatches.push(arr);
        }
      }
      genBatches();

      function render() {
        clearSub(grp, engine);
        const n = state.n;
        const alpha = 1 - state.conf;
        const crit = state.sigmaKnown === 'known'
          ? M.normalInv(1 - alpha / 2)
          : M.tInv(1 - alpha / 2, n - 1);

        // Golden True Parameter Plane X = 0 (representing 5.00V)
        grp.add(engine.createSlicePlane({
          axis: 'x', value: 0, uRange: [-3.4, 3.4], vRange: [0.1, 3.9],
          color: 0xfbbf24, opacity: 0.22
        }));
        grp.add(engine.createLabel('真实总体均值平面 μ = μ₀ (固定不动!)', [0, 0, 4.15], { accent: '#fbbf24' }));

        let captured = 0;
        let avgLen = 0;

        // Arrange 60 intervals in a 3D 10 (depth Y) x 6 (height Z) spatial forest!
        for (let b = 0; b < BATCHES; b++) {
          const sub = rawBatches[b].slice(0, n);
          const st = M.sampleStats(sub);
          const halfW = state.sigmaKnown === 'known'
            ? crit * (TRUE_SIGMA / Math.sqrt(n))
            : crit * (st.std / Math.sqrt(n));
          const lo = st.mean - halfW;
          const hi = st.mean + halfW;
          avgLen += (hi - lo);
          const hit = (lo <= TRUE_MU && TRUE_MU <= hi);
          if (hit) captured++;

          const row = b % 10;
          const tier = Math.floor(b / 10);
          const my = -3.0 + (row / 9) * 6.0;
          const mz = 0.45 + tier * 0.62;

          // Horizontal Confidence Bar along X from lo to hi
          const barW = Math.max(0.08, (hi - lo) * 1.45);
          const cx = st.mean * 1.45;
          grp.add(engine.createBar3D({
            x: cx, y: my, zBase: mz - 0.045, height: 0.09,
            width: barW, depth: 0.10,
            color: hit ? 0x34d399 : 0xf43f5e,
            opacity: hit ? 0.80 : 0.98,
            edgeColor: null
          }));
          // Sample mean center bead
          const bead = new THREE.Mesh(
            new THREE.SphereGeometry(0.065, 8, 8),
            new THREE.MeshBasicMaterial({ color: hit ? 0xe2e8f0 : 0xfbbf24 })
          );
          bead.position.copy(engine.m2w(cx, my, mz));
          grp.add(bead);
        }
        avgLen /= BATCHES;

        ctx.setMetrics([
          { label: '设定置信水平 1 − α', value: (state.conf * 100).toFixed(0) + '%', sub: `显著性 α = ${alpha.toFixed(2)}` },
          { label: '60 批实际捕获真值数', value: `${captured} / ${BATCHES} (${(captured / BATCHES * 100).toFixed(1)}%)`, sub: `红色脱靶数: ${BATCHES - captured} 批`, highlight: true },
          { label: '平均置信区间全长 2Δ', value: avgLen.toFixed(4) + ' V', sub: state.sigmaKnown === 'known' ? 'σ已知: 每批长度恒定' : 'σ未知: 随样本 S 随机波动!' },
          { label: '双侧临界分位数', value: crit.toFixed(4), sub: state.sigmaKnown === 'known' ? `z_${(alpha / 2).toFixed(3)}` : `t_${(alpha / 2).toFixed(3)}(${n - 1})` }
        ]);

        ctx.setFormulas([
          {
            title: state.sigmaKnown === 'known' ? '正态均值 Z 置信区间（σ² 已知）' : '正态均值 t 置信区间（σ² 未知）',
            tex: state.sigmaKnown === 'known'
              ? `\\left[\\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}},\\; \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}\\right], \\quad z_{${(alpha / 2).toFixed(3)}} = ${crit.toFixed(3)}`
              : `\\left[\\bar{X} - t_{\\alpha/2}(n-1)\\frac{S}{\\sqrt{n}},\\; \\bar{X} + t_{\\alpha/2}(n-1)\\frac{S}{\\sqrt{n}}\\right], \\quad t_{${(alpha / 2).toFixed(3)}}(${n - 1}) = ${crit.toFixed(3)}`,
            note: '金面 μ₀ 固定不动，随机跳动的是 60 根抽样横杆！青绿杆成功刺穿金面，亮红杆未碰到金面（发生概率约为 α）。'
          }
        ]);
      }

      render();
      return {
        onControlChange: render,
        onAction() { genBatches(); render(); },
        reset() { genBatches(); render(); }
      };
    }
  };

  // =========================================================================
  // 8-1: 假设检验原理与两类错误（α 弃真 vs β 取伪）3D 风险权衡仪
  // =========================================================================
  Reg['8-1'] = {
    camera: { radius: 14.2, theta: 0.48, phi: 1.10, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'alpha', label: '第一类错误显著性水平 α（虚警/弃真率）', min: 0.01, max: 0.20, step: 0.01, value: 0.05 },
      { type: 'slider', key: 'delta', label: '备择故障偏移量 Δμ = μ₁ − μ₀', min: 0.4, max: 2.2, step: 0.1, value: 1.0 },
      { type: 'slider', key: 'n', label: '样本检测容量 n（唯一能双降 α,β 的武器!）', min: 4, max: 36, step: 2, value: 9 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const { alpha, delta, n } = state;
        const sigma = 1.5;
        const se = sigma / Math.sqrt(n); // standard error of X_bar
        const mu0 = -0.8;
        const mu1 = mu0 + delta;
        const zAlpha = M.normalInv(1 - alpha);
        const critC = mu0 + zAlpha * se; // Right-sided test critical value c
        const beta = M.normalCDF(critC, mu1, se); // P(X_bar < c | H1 true) = Type II error!
        const power = 1 - beta;
        const hScale = 2.8;

        grp.add(engine.createAxes3D({
          xRange: [-3.8, 4.2], yRange: [-2.8, 2.8], zRange: [0, 3.8],
          xLabel: '样本均值 X̄', yLabel: '前:H₀与H₁交叠 / 后:检验功效曲线', zLabel: '密度 / 功效'
        }));

        // Critical Decision Plane X = critC
        grp.add(engine.createSlicePlane({
          axis: 'x', value: critC, uRange: [-2.2, 0.8], vRange: [0, 3.5],
          color: 0xfbbf24, opacity: 0.28
        }));
        grp.add(engine.createLabel(`临界判决门限 c = ${critC.toFixed(3)}`, [critC, -2.0, 3.65], { accent: '#fbbf24' }));

        // H0 bell (front y = -1.4) + Red Type I Error alpha tail (x >= critC)
        // H1 bell (mid y = -0.2) + Purple Type II Error beta tail (x < critC)
        const h0Pts = [], alphaPts = [], h1Pts = [], betaPts = [];
        for (let x = -3.6; x <= 4.0; x += 0.04) {
          const f0 = Math.min(3.5, M.normalPDF(x, mu0, se) * hScale);
          const f1 = Math.min(3.5, M.normalPDF(x, mu1, se) * hScale);
          h0Pts.push([x, -1.4, f0]);
          if (x >= critC) alphaPts.push([x, -1.36, f0]);
          h1Pts.push([x, -0.2, f1]);
          if (x <= critC) betaPts.push([x, -0.16, f1]);
        }
        grp.add(engine.createRibbonCurve({ points: h0Pts, color: 0x38bdf8, fillOpacity: 0.22 }));
        if (alphaPts.length > 1) grp.add(engine.createRibbonCurve({ points: alphaPts, color: 0xf43f5e, fillOpacity: 0.78 }));
        grp.add(engine.createRibbonCurve({ points: h1Pts, color: 0x34d399, fillOpacity: 0.22 }));
        if (betaPts.length > 1) grp.add(engine.createRibbonCurve({ points: betaPts, color: 0xa855f7, fillOpacity: 0.68 }));

        grp.add(engine.createLabel(`原假设 H₀ (红尾: 弃真错误 α=${(alpha * 100).toFixed(0)}%)`, [mu0 - 0.6, -1.4, 2.5], { accent: '#f43f5e' }));
        grp.add(engine.createLabel(`备择 H₁ (紫尾: 取伪漏检 β=${(beta * 100).toFixed(1)}%)`, [mu1 + 0.7, -0.2, 2.1], { accent: '#a855f7' }));

        // Back wall y = 2.2: Power Curve 1 - beta(d) as function of shift d
        const powPts = [];
        for (let x = mu0; x <= 3.6; x += 0.07) {
          const pwr = 1 - M.normalCDF(critC, x, se);
          powPts.push([x, 2.2, pwr * 3.0]);
        }
        grp.add(engine.createRibbonCurve({ points: powPts, color: 0xfbbf24, fillOpacity: 0.25 }));
        grp.add(engine.createLabel(`后墙: 检验功效曲线 1−β = ${(power * 100).toFixed(1)}%`, [1.8, 2.2, 3.3], { accent: '#fbbf24' }));

        ctx.setMetrics([
          { label: '第 I 类错误 α (弃真/虚警)', value: (alpha * 100).toFixed(1) + '%', sub: 'P(拒 H₀ | H₀ 真) 红尾体积' },
          { label: '第 II 类错误 β (取伪/漏检)', value: (beta * 100).toFixed(2) + '%', sub: 'P(受 H₀ | H₁ 真) 紫尾体积', highlight: true },
          { label: '检验功效 Power = 1 − β', value: (power * 100).toFixed(2) + '%', sub: '成功检出异常批次的概率' },
          { label: '抽样标准误 σ / √n', value: se.toFixed(4), sub: `增大 n 使两峰收窄分离!` }
        ]);

        ctx.setFormulas([
          {
            title: '两类错误定义与风险制约关系',
            tex: `\\alpha = P(\\text{拒绝 } H_0 \\mid H_0 \\text{ 为真}) = ${alpha.toFixed(2)}, \\qquad \\beta = P(\\text{接受 } H_0 \\mid H_1 \\text{ 为真}) = \\Phi\\!\\left(z_{1-\\alpha} - \\frac{\\Delta\\mu}{\\sigma/\\sqrt{n}}\\right) = ${beta.toFixed(4)}`,
            note: '固定样本量 n 时，压低 α（门限右移）必然导致紫色漏检体积 β 增大；唯有增大样本容量 n 才能同时减小 α 与 β！'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 8-2: 单正态总体均值与方差假设检验 3D 工程质检工作台
  // =========================================================================
  Reg['8-2'] = {
    camera: { radius: 13.8, theta: 0.42, phi: 1.12, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'testType', label: '正态总体假设检验类型', value: 't_mean',
        options: [
          { label: '均值 t 检验（σ² 未知）：T = (X̄−μ₀)/(S/√n) ~ t(n−1)', value: 't_mean' },
          { label: '均值 U 检验（σ²=0.01 已知）：U = (X̄−μ₀)/(σ₀/√n) ~ N(0,1)', value: 'u_mean' },
          { label: '方差 χ² 检验（μ 未知）：χ² = (n−1)S²/σ₀² ~ χ²(n−1)', value: 'chi2_var' }
        ]
      },
      {
        type: 'select', key: 'tail', label: '备择假设方向（双侧 / 单侧）', value: 'two',
        options: [
          { label: '双侧检验：H₁: θ ≠ θ₀（偏高偏低均拒收）', value: 'two' },
          { label: '右侧检验：H₁: θ > θ₀（检验噪声/电压超上限）', value: 'right' },
          { label: '左侧检验：H₁: θ < θ₀（检验击穿电压低于下限）', value: 'left' }
        ]
      },
      { type: 'slider', key: 'xBar', label: '实测样本均值 X̄ (标称 μ₀=5.00V)', min: 4.88, max: 5.12, step: 0.01, value: 5.06 },
      { type: 'slider', key: 'sVal', label: '实测样本标准差 S (标称 σ₀=0.10V)', min: 0.05, max: 0.18, step: 0.01, value: 0.12 },
      { type: 'slider', key: 'n', label: '抽检芯片容量 n', min: 6, max: 30, step: 1, value: 10 },
      { type: 'slider', key: 'alpha', label: '显著性水平 α', min: 0.01, max: 0.10, step: 0.01, value: 0.05 },
      { type: 'button', label: '随机模拟新一批送检芯片', action: 'simChip', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      const MU0 = 5.00;
      const SIG0 = 0.10;

      function render() {
        clearSub(grp, engine);
        const { testType, tail, xBar, sVal, n, alpha } = state;
        const df = n - 1;

        let statVal = 0, critLo = -Infinity, critHi = Infinity, pVal = 1, reject = false;
        let statName = 'T', distName = `t(${df})`;

        if (testType === 't_mean' || testType === 'u_mean') {
          const isU = testType === 'u_mean';
          statName = isU ? 'U' : 'T';
          distName = isU ? 'N(0, 1)' : `t(${df})`;
          const denom = (isU ? SIG0 : sVal) / Math.sqrt(n);
          statVal = (xBar - MU0) / denom;

          const invFn = (p) => isU ? M.normalInv(p) : M.tInv(p, df);
          const cdfFn = (x) => isU ? M.normalCDF(x) : M.tCDF(x, df);
          const pdfFn = (x) => isU ? M.normalPDF(x) : M.tPDF(x, df);

          if (tail === 'two') {
            critHi = invFn(1 - alpha / 2);
            critLo = -critHi;
            reject = Math.abs(statVal) >= critHi;
            pVal = 2 * (1 - cdfFn(Math.abs(statVal)));
          } else if (tail === 'right') {
            critHi = invFn(1 - alpha);
            reject = statVal >= critHi;
            pVal = 1 - cdfFn(statVal);
          } else {
            critLo = invFn(alpha);
            reject = statVal <= critLo;
            pVal = cdfFn(statVal);
          }

          grp.add(engine.createAxes3D({
            xRange: [-4.2, 4.2], yRange: [-2.0, 2.0], zRange: [0, 3.8],
            xLabel: `检验统计量 ${statName}`, yLabel: '', zLabel: `${distName} 密度`, showY: false
          }));

          const fullPts = [], leftRej = [], rightRej = [];
          for (let x = -4.0; x <= 4.0; x += 0.05) {
            const z = pdfFn(x) * 7.2;
            fullPts.push([x, 0, z]);
            if (x <= critLo) leftRej.push([x, -0.04, z]);
            if (x >= critHi) rightRej.push([x, -0.04, z]);
          }
          grp.add(engine.createRibbonCurve({ points: fullPts, color: 0x38bdf8, fillOpacity: 0.25 }));
          if (leftRej.length > 1) grp.add(engine.createRibbonCurve({ points: leftRej, color: 0xf43f5e, fillOpacity: 0.78 }));
          if (rightRej.length > 1) grp.add(engine.createRibbonCurve({ points: rightRej, color: 0xf43f5e, fillOpacity: 0.78 }));

          if (Number.isFinite(critLo)) grp.add(engine.createSlicePlane({ axis: 'x', value: Math.max(-4, critLo), uRange: [-1, 1], vRange: [0, 2.8], color: 0xf43f5e, opacity: 0.26 }));
          if (Number.isFinite(critHi)) grp.add(engine.createSlicePlane({ axis: 'x', value: Math.min(4, critHi), uRange: [-1, 1], vRange: [0, 2.8], color: 0xf43f5e, opacity: 0.26 }));

          const clampedS = Math.max(-3.9, Math.min(3.9, statVal));
          grp.add(engine.createBar3D({
            x: clampedS, y: 0, height: 3.3, width: 0.16, depth: 0.16,
            color: reject ? 0xf43f5e : 0x34d399
          }));
          grp.add(engine.createLabel(
            `${statName}_obs = ${statVal.toFixed(3)} → ${reject ? '落入拒绝域: 拒收告警!' : '落入接受域: 质检合格!'}`,
            [clampedS, 0, 3.68],
            { accent: reject ? '#f43f5e' : '#34d399' }
          ));
        } else {
          // Chi-Square Variance Test: chi2 = (n-1)*S^2 / SIG0^2 ~ chi2(n-1)
          statName = 'χ²';
          distName = `χ²(${df})`;
          statVal = (df * sVal * sVal) / (SIG0 * SIG0);

          if (tail === 'two') {
            critLo = M.chi2Inv(alpha / 2, df);
            critHi = M.chi2Inv(1 - alpha / 2, df);
            reject = (statVal <= critLo || statVal >= critHi);
            const c = M.chi2CDF(statVal, df);
            pVal = 2 * Math.min(c, 1 - c);
          } else if (tail === 'right') {
            critHi = M.chi2Inv(1 - alpha, df);
            reject = statVal >= critHi;
            pVal = 1 - M.chi2CDF(statVal, df);
          } else {
            critLo = M.chi2Inv(alpha, df);
            reject = statVal <= critLo;
            pVal = M.chi2CDF(statVal, df);
          }

          const xMax = Math.max(df * 2.6, 28);
          const mapX = (v) => -3.8 + (v / xMax) * 7.8;

          grp.add(engine.createAxes3D({
            xRange: [-4.0, 4.2], yRange: [-2, 2], zRange: [0, 3.8],
            xLabel: `χ² 统计量 (0→${xMax.toFixed(0)})`, yLabel: '', zLabel: `${distName} 密度`, showY: false
          }));

          const fullPts = [], leftRej = [], rightRej = [];
          for (let v = 0.2; v <= xMax; v += xMax / 140) {
            const mx = mapX(v);
            const mz = Math.min(3.5, M.chi2PDF(v, df) * 16.0);
            fullPts.push([mx, 0, mz]);
            if (v <= critLo) leftRej.push([mx, -0.04, mz]);
            if (v >= critHi) rightRej.push([mx, -0.04, mz]);
          }
          grp.add(engine.createRibbonCurve({ points: fullPts, color: 0x38bdf8, fillOpacity: 0.25 }));
          if (leftRej.length > 1) grp.add(engine.createRibbonCurve({ points: leftRej, color: 0xf43f5e, fillOpacity: 0.78 }));
          if (rightRej.length > 1) grp.add(engine.createRibbonCurve({ points: rightRej, color: 0xf43f5e, fillOpacity: 0.78 }));

          const clampedMx = Math.max(-3.8, Math.min(3.9, mapX(statVal)));
          grp.add(engine.createBar3D({
            x: clampedMx, y: 0, height: 3.3, width: 0.16, depth: 0.16,
            color: reject ? 0xf43f5e : 0x34d399
          }));
          grp.add(engine.createLabel(
            `χ²_obs = ${statVal.toFixed(2)} → ${reject ? '噪声方差超标拒收!' : '方差质检合格!'}`,
            [clampedMx, 0, 3.68],
            { accent: reject ? '#f43f5e' : '#34d399' }
          ));
        }

        const critStr = tail === 'two'
          ? `(${critLo.toFixed(3)}, ${critHi.toFixed(3)}) 外`
          : (tail === 'right' ? `≥ ${critHi.toFixed(3)}` : `≤ ${critLo.toFixed(3)}`);

        ctx.setMetrics([
          { label: `检验统计量 ${statName}_obs`, value: statVal.toFixed(4), sub: `零假设下服从 ${distName}` },
          { label: `拒绝域 W (α=${alpha.toFixed(2)})`, value: critStr, sub: '红色高亮尾部区域' },
          { label: '精确检验 p 值', value: pVal.toFixed(4), sub: pVal <= alpha ? 'p ≤ α ⇒ 拒绝 H₀' : 'p > α ⇒ 不拒绝 H₀' },
          { label: '最终工程质检结论', value: reject ? '拒绝 H₀ (批次异常!)' : '接受 H₀ (合格放行)', sub: '基于小概率反证法原理', highlight: true }
        ]);

        const paramSym = testType === 'chi2_var' ? '\\sigma^2' : '\\mu';
        const val0Str = testType === 'chi2_var' ? '0.0100' : '5.00';
        const h1Rel = tail === 'two' ? '\\neq' : (tail === 'right' ? '>' : '<');
        const statFormula = testType === 't_mean'
          ? `T = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} = \\frac{${xBar.toFixed(2)}-5.00}{${sVal.toFixed(2)}/\\sqrt{${n}}} = ${statVal.toFixed(3)}`
          : (testType === 'u_mean'
            ? `U = \\frac{\\bar{X}-\\mu_0}{\\sigma_0/\\sqrt{n}} = \\frac{${xBar.toFixed(2)}-5.00}{0.10/\\sqrt{${n}}} = ${statVal.toFixed(3)}`
            : `\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2} = \\frac{${df}\\times ${sVal.toFixed(2)}^2}{0.10^2} = ${statVal.toFixed(3)}`);

        ctx.setFormulas([
          {
            title: '步骤①~③：建立假设与枢轴检验统计量',
            tex: `H_0: ${paramSym} = ${val0Str} \\;\\leftrightarrow\\; H_1: ${paramSym} ${h1Rel} ${val0Str}, \\qquad ${statFormula}`,
            note: '均值检验在 σ² 已知时选 U~N(0,1)，σ² 未知时选 T~t(n−1)；单正态方差检验选 χ²~χ²(n−1)。'
          },
          {
            title: '步骤④~⑤：拒绝域临界值对比与统计推断结论',
            tex: `p\\text{-value} = ${pVal.toFixed(4)} ${reject ? '\\le' : '>'} \\alpha = ${alpha.toFixed(2)} \\implies \\text{${reject ? '拒绝原假设 ' : '相容，不拒绝 '}} H_0`,
            note: reject
              ? '小概率事件在一次抽测中竟然发生了，有充分统计证据判定本批电子元器件参数偏离标称标准！'
              : '样本波动处于正常随机抽样误差范围内，无充分证据推翻标称指标，准予出厂放行。'
          }
        ]);
      }

      render();
      return {
        onControlChange: render,
        onAction(act, c) {
          if (act === 'simChip') {
            // Randomly simulate either a good batch or slightly shifted batch
            const shifted = Math.random() < 0.45;
            const arr = [];
            for (let i = 0; i < state.n; i++) {
              arr.push(M.randNormal(shifted ? 5.05 : 5.00, shifted ? 0.13 : 0.10));
            }
            const st = M.sampleStats(arr);
            state.xBar = Math.round(Math.max(4.88, Math.min(5.12, st.mean)) * 100) / 100;
            state.sVal = Math.round(Math.max(0.05, Math.min(0.18, st.std)) * 100) / 100;
            c.syncControls();
            render();
          }
        },
        reset: render
      };
    }
  };
})();
