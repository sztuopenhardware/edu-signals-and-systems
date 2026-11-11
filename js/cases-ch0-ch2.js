/**
 * 第0章 ~ 第二章 3D 交互式教学仿真案例实现（共 10 个实验案例）
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
  // 0-1: 高尔顿钉板与导体电子热噪声 3D 实验
  // =========================================================================
  Reg['0-1'] = {
    camera: { radius: 14.5, theta: 0.45, phi: 1.15, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'mode', label: '实验场景模式', value: 'galton',
        options: [
          { label: '模式A：3D 高尔顿钉板 (Galton Board)', value: 'galton' },
          { label: '模式B：导体晶格电子热噪声 3D 波形', value: 'thermal' }
        ]
      },
      { type: 'slider', key: 'layers', label: '钉板层数 L / 散射级数', min: 6, max: 14, step: 2, value: 10 },
      { type: 'slider', key: 'prob', label: '右偏碰撞概率 p', min: 0.2, max: 0.8, step: 0.05, value: 0.5 },
      { type: 'button', label: '批量释放 +150 粒子', action: 'burst', variant: 'primary' },
      { type: 'button', label: '清空统计槽', action: 'clear', variant: 'secondary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const root = new THREE.Group();
      const dynamicBars = new THREE.Group();
      const ballsGroup = new THREE.Group();
      engine.caseGroup.add(root);
      engine.caseGroup.add(dynamicBars);
      engine.caseGroup.add(ballsGroup);

      let counts = [];
      let totalBalls = 0;
      let activeBalls = [];
      let thermalHistory = new Array(120).fill(0);
      let electrons = [];

      function spawnBall() {
        const L = state.layers;
        const p = state.prob;
        const path = [0];
        let pos = 0;
        for (let i = 0; i < L; i++) {
          pos += Math.random() < p ? 0.5 : -0.5;
          path.push(pos);
        }
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 10, 10),
          new THREE.MeshPhongMaterial({ color: 0xfbbf24, emissive: 0x78350f })
        );
        ballsGroup.add(mesh);
        activeBalls.push({ mesh, path, progress: 0, speed: 3.6 + Math.random() * 1.4 });
      }

      function addInstantBatch(num) {
        const L = state.layers;
        const p = state.prob;
        for (let n = 0; n < num; n++) {
          let k = 0;
          for (let i = 0; i < L; i++) if (Math.random() < p) k++;
          counts[k] = (counts[k] || 0) + 1;
          totalBalls++;
        }
        // Also animate 24 visible balls
        for (let i = 0; i < 24; i++) spawnBall();
        rebuildHistogram();
      }

      function rebuildHistogram() {
        clearSub(dynamicBars, engine);
        if (state.mode !== 'galton') return;
        const L = state.layers;
        const p = state.prob;
        const maxProb = M.binomialPMF(Math.round(L * p), L, p);
        const hScale = 3.2 / Math.max(0.12, maxProb);

        const curvePts = [];
        for (let k = 0; k <= L; k++) {
          const x = (k - L / 2) * 0.68;
          const empP = totalBalls > 0 ? counts[k] / totalBalls : 0;
          const theoP = M.binomialPMF(k, L, p);
          dynamicBars.add(engine.createBar3D({
            x, y: 0, zBase: 0,
            height: Math.max(0.02, empP * hScale),
            width: 0.48, depth: 0.55,
            color: 0x38bdf8, opacity: 0.84
          }));
          curvePts.push([x, 0.38, theoP * hScale]);
        }
        dynamicBars.add(engine.createRibbonCurve({
          points: curvePts, color: 0xfbbf24, fillOpacity: 0.18, baseZ: 0
        }));

        const empMean = totalBalls > 0
          ? counts.reduce((acc, c, k) => acc + k * c, 0) / totalBalls
          : L * p;
        ctx.setMetrics([
          { label: '累计落槽样本数 N', value: String(totalBalls), sub: '粒子随机散射总数' },
          { label: '理论均值 E(X)=Lp', value: (L * p).toFixed(2), sub: `实测均值: ${empMean.toFixed(2)}`, highlight: true },
          { label: '理论标准差 √(Lpq)', value: Math.sqrt(L * p * (1 - p)).toFixed(3), sub: '决定钟形宽度' },
          { label: '峰值槽概率', value: (maxProb * 100).toFixed(1) + '%', sub: `槽位 k=${Math.round(L * p)}` }
        ]);
      }

      function rebuildScene(resetCounts = true) {
        clearSub(root, engine);
        clearSub(dynamicBars, engine);
        clearSub(ballsGroup, engine);
        activeBalls = [];
        electrons = [];

        const L = state.layers;
        const p = state.prob;

        if (state.mode === 'galton') {
          if (resetCounts) {
            counts = new Array(L + 1).fill(0);
            totalBalls = 0;
          }
          // Pegs pyramid above z = 3.4..6.2
          const topZ = 5.4;
          const rowGap = 2.4 / L;
          const pegGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.45, 10);
          const pegMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 80 });
          for (let r = 0; r < L; r++) {
            for (let j = 0; j <= r; j++) {
              const x = (j - r / 2) * 0.68;
              const z = topZ - r * rowGap;
              const peg = new THREE.Mesh(pegGeo, pegMat);
              peg.rotation.x = Math.PI / 2;
              peg.position.copy(engine.m2w(x, 0, z));
              root.add(peg);
            }
          }
          // Frame rails
          root.add(engine.createLabel('粒子发射漏斗', [0, 0, topZ + 0.55], { accent: '#fbbf24' }));
          root.add(engine.createAxes3D({
            xRange: [-5.2, 5.2], yRange: [-2, 2], zRange: [0, 3.6],
            xLabel: '槽位位移 k', yLabel: '通道', zLabel: '频率密度', showY: false
          }));
          if (totalBalls === 0) addInstantBatch(180);
          else rebuildHistogram();

          ctx.setFormulas([
            {
              title: '高尔顿钉板二项随机游走模型',
              tex: `P(X = k) = C_{${L}}^{k} (${p.toFixed(2)})^k (${(1 - p).toFixed(2)})^{${L}-k}, \\quad k=0,1,\\dots,${L}`,
              note: '小球每经过一层钉子独立地以概率 p 向右偏转、1−p 向左偏转，底部堆积直方图直观逼近二项/正态钟形曲线。'
            },
            {
              title: '群体统计确定性规律',
              tex: `E(X) = L p = ${(L * p).toFixed(2)}, \\quad D(X) = L p(1-p) = ${(L * p * (1 - p)).toFixed(3)}`,
              note: '单颗小球轨迹完全偶然，但大量独立粒子叠加呈现出高度稳定的统计规律。'
            }
          ]);
        } else {
          // Mode B: 3D Conductor Crystal Lattice + Thermal Electrons + 3D Oscilloscope Wave
          const boxGeo = new THREE.BoxGeometry(5.2, 1.8, 1.8);
          const edges = new THREE.EdgesGeometry(boxGeo);
          const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 }));
          wire.position.copy(engine.m2w(-2.2, 0, 1.4));
          root.add(wire);
          root.add(engine.createLabel('半导体电阻晶格 (自由电子热运动)', [-2.2, 0, 2.75], { accent: '#38bdf8' }));
          root.add(engine.createLabel('端口热噪声电压 V_n(t) ~ N(0, 4kTRB)', [3.2, 0, 3.2], { accent: '#34d399' }));

          // Lattice ions
          const ionGeo = new THREE.SphereGeometry(0.11, 10, 10);
          const ionMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.45 });
          for (let ix = -4.2; ix <= -0.2; ix += 1.0) {
            for (let iy = -0.55; iy <= 0.55; iy += 0.55) {
              for (let iz = 0.85; iz <= 1.95; iz += 0.55) {
                const ion = new THREE.Mesh(ionGeo, ionMat);
                ion.position.copy(engine.m2w(ix, iy, iz));
                root.add(ion);
              }
            }
          }
          // Moving electrons
          const eGeo = new THREE.SphereGeometry(0.075, 8, 8);
          const eMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
          for (let i = 0; i < 45; i++) {
            const em = new THREE.Mesh(eGeo, eMat);
            const ex = -4.4 + Math.random() * 4.4;
            const ey = (Math.random() - 0.5) * 1.4;
            const ez = 0.65 + Math.random() * 1.5;
            em.position.copy(engine.m2w(ex, ey, ez));
            ballsGroup.add(em);
            electrons.push({
              mesh: em, x: ex, y: ey, z: ez,
              vx: M.randNormal(0, 2.5), vy: M.randNormal(0, 2.5), vz: M.randNormal(0, 2.5)
            });
          }

          ctx.setFormulas([
            {
              title: '约翰逊-奈奎斯特导体热噪声公式',
              tex: `\\overline{v_n^2} = 4 k_B T R \\Delta f, \\quad V_n(t) \\sim N(0, \\sigma_n^2)`,
              note: 'k_B 为玻尔兹曼常数，T 为绝对温度，R 为电阻阻值，Δf 为等效噪声带宽。大量自由电子速度随机叠加产生零均值高斯热噪声。'
            }
          ]);
        }
      }

      let spawnTimer = 0;
      engine.setOnTick((dt) => {
        if (state.mode === 'galton') {
          spawnTimer += dt;
          if (spawnTimer > 0.22 && activeBalls.length < 32) {
            spawnTimer = 0;
            spawnBall();
          }
          const L = state.layers;
          const topZ = 5.4;
          const rowGap = 2.4 / L;
          let landed = false;
          for (let i = activeBalls.length - 1; i >= 0; i--) {
            const b = activeBalls[i];
            b.progress += dt * b.speed;
            const stepIdx = Math.floor(b.progress);
            if (stepIdx >= L) {
              const bin = Math.round(b.path[L] + L / 2);
              counts[bin] = (counts[bin] || 0) + 1;
              totalBalls++;
              ballsGroup.remove(b.mesh);
              engine.disposeObjectTree(b.mesh);
              activeBalls.splice(i, 1);
              landed = true;
            } else {
              const frac = b.progress - stepIdx;
              const x0 = b.path[stepIdx] * 0.68;
              const x1 = b.path[stepIdx + 1] * 0.68;
              const mx = x0 + (x1 - x0) * frac;
              const mz = topZ - b.progress * rowGap + Math.sin(frac * Math.PI) * 0.12;
              b.mesh.position.copy(engine.m2w(mx, 0, mz));
            }
          }
          if (landed) rebuildHistogram();
        } else {
          // Thermal electron motion & live 3D oscilloscope ribbon
          let sumVx = 0;
          electrons.forEach((e) => {
            if (Math.random() < 0.15) {
              e.vx = M.randNormal(0, 2.6);
              e.vy = M.randNormal(0, 2.2);
              e.vz = M.randNormal(0, 2.2);
            }
            e.x += e.vx * dt;
            e.y += e.vy * dt;
            e.z += e.vz * dt;
            if (e.x < -4.6) e.x = 0.2;
            if (e.x > 0.2) e.x = -4.6;
            if (Math.abs(e.y) > 0.75) e.vy *= -1;
            if (e.z < 0.6 || e.z > 2.2) e.vz *= -1;
            e.mesh.position.copy(engine.m2w(e.x, e.y, e.z));
            sumVx += e.vx;
          });
          const vInst = (sumVx / Math.sqrt(electrons.length)) * 0.35;
          thermalHistory.push(vInst);
          if (thermalHistory.length > 110) thermalHistory.shift();

          clearSub(dynamicBars, engine);
          const wavePts = thermalHistory.map((v, idx) => [0.8 + idx * 0.045, 0, 1.4 + v]);
          dynamicBars.add(engine.createRibbonCurve({
            points: wavePts, color: 0x34d399, fillOpacity: 0.22, baseZ: 1.4
          }));
          const st = M.sampleStats(thermalHistory);
          ctx.setMetrics([
            { label: '电子数目 N_e', value: String(electrons.length), sub: '晶格内自由载流子' },
            { label: '瞬时热噪声电压', value: (vInst * 10).toFixed(2) + ' μV', sub: '零均值随机起伏', highlight: true },
            { label: '时间均值 E[V(t)]', value: (st.mean * 10).toFixed(2) + ' μV', sub: '趋近于 0 (无直流)' },
            { label: '噪声有效值 V_rms', value: (st.std * 10).toFixed(2) + ' μV', sub: '对应标准差 σ' }
          ]);
        }
      });

      rebuildScene(true);

      return {
        onControlChange(key) {
          rebuildScene(key === 'layers' || key === 'prob' || key === 'mode');
        },
        onAction(action) {
          if (action === 'burst') {
            if (state.mode === 'galton') addInstantBatch(150);
          } else if (action === 'clear') {
            counts = new Array(state.layers + 1).fill(0);
            totalBalls = 0;
            rebuildHistogram();
          }
        },
        reset() {
          rebuildScene(true);
        }
      };
    }
  };

  // =========================================================================
  // 1-1: 随机事件关系与集合运算 3D 维恩空间
  // =========================================================================
  Reg['1-1'] = {
    camera: { radius: 11.5, theta: 0.65, phi: 1.05, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'op', label: '事件运算表达式', value: 'union',
        options: [
          { label: '并事件 A ∪ B（至少一者告警）', value: 'union' },
          { label: '交事件 A ∩ B（双通道同时告警）', value: 'inter' },
          { label: '差事件 A − B（A发生且B不发生）', value: 'diff' },
          { label: '对立事件 Ā（A不发生）', value: 'compA' },
          { label: '对称差 (A−B) ∪ (B−A)（异或告警）', value: 'xor' },
          { label: '三事件交 A ∩ B ∩ C', value: 'abc' },
          { label: '德摩根律 Ā ∩ B̄ = (A ∪ B)的对立', value: 'demorgan' }
        ]
      },
      { type: 'slider', key: 'dist', label: '事件球 A-B 中心间距 d', min: 0.0, max: 2.8, step: 0.1, value: 1.2 },
      { type: 'slider', key: 'rB', label: '事件球 B 半径 r_B', min: 0.6, max: 1.5, step: 0.05, value: 1.15 },
      { type: 'button', label: '重新撒入 2000 个样本点', action: 'resample', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      const BOX = 4.4; // Cube [-2.2, 2.2] x [-2.2, 2.2] x [0, 4.4]
      let samples = [];
      function genSamples() {
        samples = [];
        for (let i = 0; i < 2000; i++) {
          samples.push([
            (Math.random() - 0.5) * BOX,
            (Math.random() - 0.5) * BOX,
            Math.random() * BOX
          ]);
        }
      }
      genSamples();

      function evalOp(op, inA, inB, inC) {
        switch (op) {
          case 'union': return inA || inB;
          case 'inter': return inA && inB;
          case 'diff': return inA && !inB;
          case 'compA': return !inA;
          case 'xor': return (inA && !inB) || (!inA && inB);
          case 'abc': return inA && inB && inC;
          case 'demorgan': return !inA && !inB;
          default: return inA;
        }
      }

      function render() {
        clearSub(grp, engine);

        // Sample Space Cube Omega
        const cubeGeo = new THREE.BoxGeometry(BOX, BOX, BOX);
        const cubeEdges = new THREE.EdgesGeometry(cubeGeo);
        const cubeWire = new THREE.LineSegments(
          cubeEdges,
          new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.55 })
        );
        cubeWire.position.copy(engine.m2w(0, 0, BOX / 2));
        grp.add(cubeWire);
        grp.add(engine.createLabel('样本空间 Ω', [-1.8, -1.8, BOX + 0.3], { accent: '#94a3b8' }));

        const rA = 1.25;
        const rB = state.rB;
        const rC = 1.05;
        const cA = [-state.dist * 0.5, 0, 2.2];
        const cB = [state.dist * 0.5, 0, 2.2];
        const cC = [0, 0.72, 1.45];

        // Spheres A, B, C
        const addEventSphere = (center, radius, col, name, labelOffset) => {
          const s = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 28, 20),
            new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.16, depthWrite: false })
          );
          s.position.copy(engine.m2w(center[0], center[1], center[2]));
          grp.add(s);
          grp.add(engine.createLabel(name, [center[0] + labelOffset[0], center[1], center[2] + radius + 0.25], { accent: col }));
        };

        addEventSphere(cA, rA, '#38bdf8', '事件 A', [-0.25, 0]);
        addEventSphere(cB, rB, '#fbbf24', '事件 B', [0.25, 0]);
        if (state.op === 'abc') {
          addEventSphere(cC, rC, '#f472b6', '事件 C', [0, 0]);
        }

        // Evaluate Monte Carlo points
        const hitPos = [];
        const missPos = [];
        let nA = 0, nB = 0, nAB = 0, nHit = 0;

        for (let i = 0; i < samples.length; i++) {
          const p = samples[i];
          const inA = Math.hypot(p[0] - cA[0], p[1] - cA[1], p[2] - cA[2]) <= rA;
          const inB = Math.hypot(p[0] - cB[0], p[1] - cB[1], p[2] - cB[2]) <= rB;
          const inC = Math.hypot(p[0] - cC[0], p[1] - cC[1], p[2] - cC[2]) <= rC;
          if (inA) nA++;
          if (inB) nB++;
          if (inA && inB) nAB++;
          const ok = evalOp(state.op, inA, inB, inC);
          const wp = engine.m2w(p[0], p[1], p[2]);
          if (ok) {
            nHit++;
            hitPos.push(wp.x, wp.y, wp.z);
          } else {
            missPos.push(wp.x, wp.y, wp.z);
          }
        }

        if (hitPos.length > 0) {
          const gHit = new THREE.BufferGeometry();
          gHit.setAttribute('position', new THREE.Float32BufferAttribute(hitPos, 3));
          grp.add(new THREE.Points(gHit, new THREE.PointsMaterial({ color: 0x34d399, size: 0.11 })));
        }
        if (missPos.length > 0) {
          const gMiss = new THREE.BufferGeometry();
          gMiss.setAttribute('position', new THREE.Float32BufferAttribute(missPos, 3));
          grp.add(new THREE.Points(gMiss, new THREE.PointsMaterial({ color: 0x475569, size: 0.045, transparent: true, opacity: 0.35 })));
        }

        const N = samples.length;
        let relationText = '一般相交';
        if (state.dist >= rA + rB) relationText = '互不相容 (AB = ∅)';
        else if (state.dist + rB <= rA) relationText = '包含关系 (B ⊂ A)';

        ctx.setMetrics([
          { label: '目标事件命中概率', value: (nHit / N).toFixed(3), sub: `${nHit} / ${N} 样本点`, highlight: true },
          { label: '事件 A / B 概率', value: `${(nA / N).toFixed(3)} / ${(nB / N).toFixed(3)}`, sub: '空间体积占比' },
          { label: '交集概率 P(AB)', value: (nAB / N).toFixed(3), sub: '重叠区域体积比' },
          { label: '当前 A 与 B 关系', value: relationText, sub: `球心距 d=${state.dist.toFixed(1)}` }
        ]);

        ctx.setFormulas([
          {
            title: '事件运算与加法容斥定律',
            tex: `P(A \\cup B) = P(A) + P(B) - P(AB) = ${(nA / N).toFixed(3)} + ${(nB / N).toFixed(3)} - ${(nAB / N).toFixed(3)} = ${((nA + nB - nAB) / N).toFixed(3)}`,
            note: '绿点为满足当前选中事件表达式的样本点 ω ∈ Ω。'
          },
          {
            title: '德摩根对偶律 (De Morgan\'s Laws)',
            tex: `\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}, \\qquad \\overline{A \\cap B} = \\bar{A} \\cup \\bar{B}`,
            note: '多传感器系统“全部正常（Ā∩B̄）”等价于“发生任一告警（A∪B）”的对立事件。'
          }
        ]);
      }

      render();
      return {
        onControlChange: render,
        onAction(act) {
          if (act === 'resample') { genSamples(); render(); }
        },
        reset() { genSamples(); render(); }
      };
    }
  };

  // =========================================================================
  // 1-2: 概率公理化定义与频率稳定性 3D 仿真
  // =========================================================================
  Reg['1-2'] = {
    camera: { radius: 13.8, theta: 0.58, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'pA', label: '事件 A 真实概率 P(A)', min: 0.1, max: 0.85, step: 0.05, value: 0.40 },
      { type: 'slider', key: 'pB', label: '事件 B 真实概率 P(B)', min: 0.1, max: 0.85, step: 0.05, value: 0.35 },
      { type: 'slider', key: 'overlap', label: '交集比例系数 η (控制AB重叠)', min: 0.0, max: 0.9, step: 0.1, value: 0.4 },
      { type: 'slider', key: 'paths', label: '平行独立测试组数 M', min: 4, max: 14, step: 2, value: 8 },
      { type: 'button', label: '重新生成独立频率轨迹', action: 'rerun', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      let seedCount = 0;
      function render() {
        clearSub(grp, engine);
        const pA = state.pA;
        const pB = state.pB;
        const pAB = Math.min(pA, pB) * state.overlap;
        const pUnion = Math.min(1, pA + pB - pAB);
        const N = 220;
        const Mpaths = state.paths;
        const hScale = 3.4;

        grp.add(engine.createAxes3D({
          xRange: [-4.5, 4.5], yRange: [-3.5, 3.5], zRange: [0, 3.8],
          xLabel: '试验次数 n (1→220)', yLabel: '平行试验组 m', zLabel: '频率 f_n(A)'
        }));

        // Target probability plane z = pA * hScale
        grp.add(engine.createSlicePlane({
          axis: 'z', value: pA * hScale,
          uRange: [-4.2, 2.2], vRange: [-2.8, 2.8],
          color: 0xfbbf24, opacity: 0.16
        }));
        grp.add(engine.createLabel(`理论概率平面 P(A) = ${pA.toFixed(2)}`, [-1.2, 2.6, pA * hScale + 0.28], { accent: '#fbbf24' }));

        // Frequency paths
        let finalAvg = 0;
        const palette = [0x38bdf8, 0x34d399, 0xa78bfa, 0xf472b6, 0x60a5fa, 0x2dd4bf];
        for (let m = 0; m < Mpaths; m++) {
          const my = -2.4 + (m / Math.max(1, Mpaths - 1)) * 4.8;
          let hits = 0;
          const pts = [];
          for (let n = 1; n <= N; n++) {
            if (Math.random() < pA) hits++;
            if (n === 1 || n % 3 === 0 || n === N) {
              const mx = -4.2 + (n / N) * 6.2;
              pts.push([mx, my, (hits / n) * hScale]);
            }
          }
          finalAvg += hits / N;
          grp.add(engine.createRibbonCurve({
            points: pts,
            color: palette[m % palette.length],
            fillOpacity: 0.05,
            baseZ: pA * hScale
          }));
        }
        finalAvg /= Mpaths;

        // Right-side 3D Axiomatic Additivity Pillars
        const barsSpec = [
          { label: 'P(A)', val: pA, x: 3.1, y: -1.6, col: 0x38bdf8 },
          { label: 'P(B)', val: pB, x: 3.1, y: -0.5, col: 0xa78bfa },
          { label: 'P(AB)', val: pAB, x: 3.1, y: 0.6, col: 0xf43f5e },
          { label: 'P(A∪B)', val: pUnion, x: 3.1, y: 1.8, col: 0x34d399 }
        ];
        barsSpec.forEach((b) => {
          grp.add(engine.createBar3D({
            x: b.x, y: b.y, height: b.val * hScale, width: 0.55, depth: 0.55, color: b.col
          }));
          grp.add(engine.createLabel(`${b.label}=${b.val.toFixed(2)}`, [b.x, b.y, b.val * hScale + 0.3], { scale: 0.5 }));
        });

        ctx.setMetrics([
          { label: '真实概率 P(A)', value: pA.toFixed(3), sub: '柯尔莫哥洛夫规范测度' },
          { label: '各组终端平均频率', value: finalAvg.toFixed(3), sub: `偏差: ${Math.abs(finalAvg - pA).toFixed(4)}`, highlight: true },
          { label: '交集概率 P(AB)', value: pAB.toFixed(3), sub: state.overlap === 0 ? '互斥事件: 有限可加' : '非互斥: 需减重复项' },
          { label: '并集概率 P(A∪B)', value: pUnion.toFixed(3), sub: '满足 0 ≤ P ≤ 1' }
        ]);

        ctx.setFormulas([
          {
            title: '概率公理化三公理 (Kolmogorov)',
            tex: `\\text{(1) } P(A)\\ge 0; \\quad \\text{(2) } P(\\Omega)=1; \\quad \\text{(3) 互不相容可列可加性}`,
            note: '频率稳定性是概率经验背景，公理化定义赋予概率严密的数学基础。'
          },
          {
            title: '广义加法公式实时演算',
            tex: `P(A\\cup B) = P(A)+P(B)-P(AB) = ${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pAB.toFixed(3)} = ${pUnion.toFixed(3)}`,
            note: '右侧 4 根三维概率柱直观展示容斥消重关系。'
          }
        ]);
      }

      render();
      return {
        onControlChange: render,
        onAction() { seedCount++; render(); },
        reset: render
      };
    }
  };

  // =========================================================================
  // 1-3: 等可能概型：三维几何概型与蒲丰投针、古典抽样
  // =========================================================================
  Reg['1-3'] = {
    camera: { radius: 12.2, theta: 0.68, phi: 1.08, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'mode', label: '等可能概型实验选择', value: 'geom3d',
        options: [
          { label: '三维几何概型：三路通信脉冲冲突体积', value: 'geom3d' },
          { label: '几何概型经典：3D 蒲丰投针估算圆周率 π', value: 'buffon' },
          { label: '古典概型：晶圆芯片不放回次品抽检', value: 'classical' }
        ]
      },
      { type: 'slider', key: 'tau', label: '时间窗口比 τ/T (或针长比 L/d)', min: 0.1, max: 0.85, step: 0.05, value: 0.35 },
      { type: 'slider', key: 'defectM', label: '古典模式：整批次品数 M (共N=20颗)', min: 2, max: 12, step: 1, value: 6 },
      { type: 'button', label: '追加随机试验 +300 次', action: 'more', variant: 'primary' }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      let needles = [];
      let pts3d = [];

      function resetData() {
        needles = [];
        pts3d = [];
        addData(500);
      }

      function addData(cnt) {
        if (state.mode === 'geom3d') {
          for (let i = 0; i < cnt; i++) {
            pts3d.push([Math.random(), Math.random(), Math.random()]);
          }
        } else if (state.mode === 'buffon') {
          for (let i = 0; i < Math.min(cnt, 250); i++) {
            needles.push({
              cx: (Math.random() - 0.5) * 6.4,
              cy: (Math.random() - 0.5) * 6.4,
              ang: Math.random() * Math.PI
            });
          }
        }
      }

      function render() {
        clearSub(grp, engine);
        const tau = state.tau;

        if (state.mode === 'geom3d') {
          if (pts3d.length === 0) addData(600);
          const S = 3.8;
          const cubeWire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(S, S, S)),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
          );
          cubeWire.position.copy(engine.m2w(0, 0, S / 2));
          grp.add(cubeWire);
          grp.add(engine.createLabel('样本立方体 [0,T]³ (三通道到达时刻 X,Y,Z)', [0, 0, S + 0.35], { accent: '#38bdf8' }));

          // Diagonal spine
          grp.add(engine.createRibbonCurve({
            points: [[-S / 2, -S / 2, 0], [S / 2, S / 2, S]],
            color: 0xfbbf24, fillOpacity: 0
          }));

          const hitArr = [], missArr = [];
          let hits = 0;
          pts3d.forEach((p) => {
            // Event: |X - Y| <= tau AND |Y - Z| <= tau (cascade conflict) or max-min <= tau
            const maxV = Math.max(p[0], p[1], p[2]);
            const minV = Math.min(p[0], p[1], p[2]);
            const ok = (maxV - minV) <= tau;
            const wp = engine.m2w((p[0] - 0.5) * S, (p[1] - 0.5) * S, p[2] * S);
            if (ok) { hits++; hitArr.push(wp.x, wp.y, wp.z); }
            else { missArr.push(wp.x, wp.y, wp.z); }
          });

          if (hitArr.length) {
            const g1 = new THREE.BufferGeometry();
            g1.setAttribute('position', new THREE.Float32BufferAttribute(hitArr, 3));
            grp.add(new THREE.Points(g1, new THREE.PointsMaterial({ color: 0x34d399, size: 0.12 })));
          }
          if (missArr.length) {
            const g2 = new THREE.BufferGeometry();
            g2.setAttribute('position', new THREE.Float32BufferAttribute(missArr, 3));
            grp.add(new THREE.Points(g2, new THREE.PointsMaterial({ color: 0x475569, size: 0.05, transparent: true, opacity: 0.35 })));
          }

          // Exact 3D volume of { max(X,Y,Z) - min(X,Y,Z) <= tau } in [0,1]^3 is: 1 - (1-tau)^3 * ... wait:
          // Exact formula for range R = X_(3) - X_(1) <= tau of n=3 Uniform(0,1):
          // F_R(tau) = 3*tau^2 - 2*tau^3 ! Let's check: at tau=0 -> 0; tau=0.5 -> 3(0.25)-2(0.125)=0.5; tau=1 -> 3-2=1! Exact!
          const theoP = 3 * tau * tau - 2 * tau * tau * tau;
          const empP = hits / pts3d.length;

          ctx.setMetrics([
            { label: '理论三维体积比 P(A)', value: theoP.toFixed(4), sub: 'V(A)/V(Ω) = 3u²−2u³', highlight: true },
            { label: '蒙特卡洛命中频率', value: empP.toFixed(4), sub: `${hits} / ${pts3d.length} 点` },
            { label: '二维退化值 (两路会面)', value: (1 - (1 - tau) * (1 - tau)).toFixed(4), sub: '1 − (1−τ/T)²' },
            { label: '绝对误差', value: Math.abs(empP - theoP).toFixed(4), sub: '随样本增加趋于0' }
          ]);

          ctx.setFormulas([
            {
              title: '三维几何概型体积测度公式',
              tex: `P(A) = \\frac{V_{\\text{冲突多面体}}}{V(\\Omega)} = \\frac{\\iiint_{\\max(x,y,z)-\\min(x,y,z)\\le \\tau} dx\\,dy\\,dz}{T^3} = 3\\left(\\frac{\\tau}{T}\\right)^2 - 2\\left(\\frac{\\tau}{T}\\right)^3 = ${theoP.toFixed(4)}`,
              note: '三路突发脉冲两两时间差均不超过 τ 的区域是沿主对角线 X=Y=Z 分布的六棱柱状立体管道。'
            }
          ]);
        } else if (state.mode === 'buffon') {
          if (needles.length === 0) addData(200);
          const d = 1.2;
          const L = tau * d;
          // Draw parallel busbars on silicon wafer plane z=0
          for (let yLine = -3.6; yLine <= 3.61; yLine += d) {
            grp.add(engine.createRibbonCurve({
              points: [[-3.8, yLine, 0.02], [3.8, yLine, 0.02]],
              color: 0x38bdf8, fillOpacity: 0
            }));
          }
          grp.add(engine.createLabel(`平行晶圆金属母线 (间距 d=${d.toFixed(1)}, 针长 L=${L.toFixed(2)})`, [0, 3.8, 0.4], { accent: '#38bdf8' }));

          let crossCnt = 0;
          needles.forEach((nd) => {
            const dy = 0.5 * L * Math.sin(nd.ang);
            const dx = 0.5 * L * Math.cos(nd.ang);
            const y1 = nd.cy - dy, y2 = nd.cy + dy;
            const crossed = Math.floor(y1 / d) !== Math.floor(y2 / d);
            if (crossed) crossCnt++;
            grp.add(engine.createRibbonCurve({
              points: [[nd.cx - dx, y1, 0.08], [nd.cx + dx, y2, 0.08]],
              color: crossed ? 0xfbbf24 : 0x64748b,
              fillOpacity: 0
            }));
          });

          const empP = crossCnt / needles.length;
          const theoP = (2 * L) / (Math.PI * d);
          const piEst = crossCnt > 0 ? (2 * L * needles.length) / (d * crossCnt) : 0;

          ctx.setMetrics([
            { label: '投掷探针总数 N', value: String(needles.length), sub: `相交根数: ${crossCnt}` },
            { label: '圆周率 π 仿真估计值', value: piEst > 0 ? piEst.toFixed(4) : '--', sub: `真值 π = 3.1416`, highlight: true },
            { label: '理论相交概率 2L/(πd)', value: theoP.toFixed(4), sub: `实测频率: ${empP.toFixed(4)}` },
            { label: '针长间距比 L/d', value: tau.toFixed(2), sub: '满足 L ≤ d' }
          ]);

          ctx.setFormulas([
            {
              title: '蒲丰投针 (Buffon\'s Needle) 几何概型积分',
              tex: `P(\\text{相交}) = \\int_0^{\\pi} \\int_0^{\\frac{L}{2}\\sin\\theta} \\frac{2}{\\pi d}\\,dy\\,d\\theta = \\frac{2L}{\\pi d} = ${theoP.toFixed(4)} \\implies \\hat{\\pi} = \\frac{2LN}{d \\cdot n_{\\text{hit}}}`,
              note: '金色探针表示与平行母线发生相交导通，灰色探针未接触母线。'
            }
          ]);
        } else {
          // Classical Hypergeometric Wafer Sampling
          const N = 20;
          const Mdef = state.defectM;
          const nDraw = 6;
          grp.add(engine.createAxes3D({
            xRange: [-3.5, 4.5], yRange: [-2, 2], zRange: [0, 3.8],
            xLabel: '抽得次品数 k', yLabel: '', zLabel: '古典概率 P(X=k)', showY: false
          }));

          // 3D Wafer grid of 20 chips on left
          for (let i = 0; i < N; i++) {
            const row = Math.floor(i / 5), col = i % 5;
            const isDef = i < Mdef;
            const chip = new THREE.Mesh(
              new THREE.BoxGeometry(0.36, 0.12, 0.36),
              new THREE.MeshPhongMaterial({ color: isDef ? 0xf43f5e : 0x34d399 })
            );
            chip.position.copy(engine.m2w(-3.2 + col * 0.48, -1.8 + row * 0.52, 0.1));
            grp.add(chip);
          }
          grp.add(engine.createLabel(`晶圆批次 N=20 (红:次品M=${Mdef})`, [-2.2, -2.4, 0.5], { accent: '#f43f5e' }));

          let maxP = 0, modeK = 0;
          for (let k = 0; k <= nDraw; k++) {
            const pk = M.hypergeometricPMF(k, N, Mdef, nDraw);
            if (pk > maxP) { maxP = pk; modeK = k; }
            const bx = -0.3 + k * 0.72;
            grp.add(engine.createBar3D({
              x: bx, y: 0.6, height: pk * 7.5, width: 0.48, depth: 0.55,
              color: k === 0 ? 0x34d399 : 0x38bdf8
            }));
            grp.add(engine.createLabel(`k=${k}`, [bx, 0.6, -0.25], { scale: 0.44 }));
          }

          const pZero = M.hypergeometricPMF(0, N, Mdef, nDraw);
          ctx.setMetrics([
            { label: '样本空间基本事件总数', value: String(M.choose(N, nDraw)), sub: `C(20, 6) 等可能取法` },
            { label: '全合格概率 P(X=0)', value: pZero.toFixed(4), sub: '抽6颗0次品接收率', highlight: true },
            { label: '最可能检出次品数', value: `k = ${modeK}`, sub: `概率: ${maxP.toFixed(4)}` },
            { label: '检出至少1颗次品率', value: (1 - pZero).toFixed(4), sub: '1 − P(X=0)' }
          ]);

          ctx.setFormulas([
            {
              title: '古典概型不放回超几何抽检公式',
              tex: `P(X = k) = \\frac{C_{${Mdef}}^{k} C_{${N - Mdef}}^{${nDraw}-k}}{C_{${N}}^{${nDraw}}}, \\qquad P(X=0) = \\frac{C_{${N - Mdef}}^{${nDraw}}}{C_{${N}}^{${nDraw}}} = ${pZero.toFixed(4)}`,
              note: '有限等可能基本事件总数与有利基本事件数之比即为古典概率。'
            }
          ]);
        }
      }

      resetData();
      render();
      return {
        onControlChange(key) {
          if (key === 'mode') resetData();
          render();
        },
        onAction(act) {
          if (act === 'more') { addData(300); render(); }
        },
        reset() { resetData(); render(); }
      };
    }
  };

  // =========================================================================
  // 1-4: 条件概率空间坍缩与电子串并联独立性
  // =========================================================================
  Reg['1-4'] = {
    camera: { radius: 12.8, theta: 0.52, phi: 1.08, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'mode', label: '实验模式选择', value: 'circuit',
        options: [
          { label: '模式A：电子串并联冗余电路独立性可靠度', value: 'circuit' },
          { label: '模式B：条件概率 P(B|A) 样本空间坍缩演示', value: 'collapse' },
          { label: '模式C：伯恩斯坦正四面体 (两两独立≠相互独立)', value: 'tetra' }
        ]
      },
      { type: 'slider', key: 'p1', label: '上支路元件可靠度 p₁=p₂ (或 P(A))', min: 0.2, max: 0.95, step: 0.05, value: 0.80 },
      { type: 'slider', key: 'p2', label: '下支路元件可靠度 p₃=p₄ (或聚焦度)', min: 0.0, max: 0.95, step: 0.05, value: 0.75 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      const particlesGrp = new THREE.Group();
      engine.caseGroup.add(grp);
      engine.caseGroup.add(particlesGrp);

      let pulses = [];

      function render() {
        clearSub(grp, engine);
        clearSub(particlesGrp, engine);
        pulses = [];

        if (state.mode === 'circuit') {
          const pTop = state.p1;
          const pBot = Math.max(0.1, state.p2);
          const rBranch1 = pTop * pTop;
          const rBranch2 = pBot * pBot;
          const rSys = 1 - (1 - rBranch1) * (1 - rBranch2);

          // Draw 3D parallel-series circuit tubes: Input(-4,0,1.5) -> Upper(y=+1.4) R1,R2 & Lower(y=-1.4) R3,R4 -> Output(+4,0,1.5)
          const wireLines = [
            [[-4.2, 0, 1.5], [-2.8, 0, 1.5]],
            [[-2.8, -1.5, 1.5], [-2.8, 1.5, 1.5]],
            [[-2.8, 1.5, 1.5], [2.8, 1.5, 1.5]],
            [[-2.8, -1.5, 1.5], [2.8, -1.5, 1.5]],
            [[2.8, -1.5, 1.5], [2.8, 1.5, 1.5]],
            [[2.8, 0, 1.5], [4.2, 0, 1.5]]
          ];
          wireLines.forEach((seg) => {
            grp.add(engine.createRibbonCurve({ points: seg, color: 0x64748b, fillOpacity: 0 }));
          });

          const blocks = [
            { name: `开关 K₁ (${pTop.toFixed(2)})`, x: -1.2, y: 1.5, col: 0x38bdf8 },
            { name: `开关 K₂ (${pTop.toFixed(2)})`, x: 1.2, y: 1.5, col: 0x38bdf8 },
            { name: `开关 K₃ (${pBot.toFixed(2)})`, x: -1.2, y: -1.5, col: 0xa78bfa },
            { name: `开关 K₄ (${pBot.toFixed(2)})`, x: 1.2, y: -1.5, col: 0xa78bfa }
          ];
          blocks.forEach((b) => {
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(0.95, 0.55, 0.65),
              new THREE.MeshPhongMaterial({ color: b.col, transparent: true, opacity: 0.85 })
            );
            box.position.copy(engine.m2w(b.x, b.y, 1.5));
            grp.add(box);
            grp.add(engine.createLabel(b.name, [b.x, b.y, 2.15], { scale: 0.52, accent: b.col }));
          });
          grp.add(engine.createLabel('信号源 IN', [-4.2, 0, 2.1], { accent: '#fbbf24' }));
          grp.add(engine.createLabel(`输出端 OUT (R=${(rSys * 100).toFixed(1)}%)`, [4.0, 0, 2.1], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '上串联支路导通率', value: rBranch1.toFixed(4), sub: `P(K₁K₂) = p₁·p₂` },
            { label: '下串联支路导通率', value: rBranch2.toFixed(4), sub: `P(K₃K₄) = p₃·p₄` },
            { label: '全系统总可靠度 R_sys', value: (rSys * 100).toFixed(2) + '%', sub: '双支路并联冗余增益', highlight: true },
            { label: '全系统断路失效率', value: ((1 - rSys) * 100).toFixed(2) + '%', sub: '(1−p₁p₂)(1−p₃p₄)' }
          ]);

          ctx.setFormulas([
            {
              title: '相互独立事件串并联系统可靠度',
              tex: `R_{\\text{sys}} = P(K_1 K_2 \\cup K_3 K_4) = 1 - [1 - P(K_1)P(K_2)][1 - P(K_3)P(K_4)] = ${rSys.toFixed(4)}`,
              note: '各电子元器件独立工作时，串联取交集乘积，并联利用对立事件“全部断开”求补。'
            }
          ]);
        } else if (state.mode === 'collapse') {
          // Conditional Probability Space Collapse
          const pA = state.p1;
          const focus = state.p2 / 0.95; // 0..1 collapse progress
          const pB = 0.5;
          const pAB = Math.min(pA, pB) * 0.62;
          const pBgivenA = pAB / pA;

          const omegaAlpha = Math.max(0.04, 0.38 * (1 - focus));
          // Full Omega slab
          grp.add(engine.createBar3D({
            x: 0, y: 0, height: 0.25, width: 6.0, depth: 4.0,
            color: 0x334155, opacity: omegaAlpha
          }));
          // Event A slab
          const wA = 6.0 * pA;
          grp.add(engine.createBar3D({
            x: -3.0 + wA / 2, y: 0, zBase: 0.26, height: 0.7, width: wA, depth: 4.0,
            color: 0x38bdf8, opacity: 0.68
          }));
          // Intersection AB slab sitting on A
          const dAB = 4.0 * pBgivenA;
          grp.add(engine.createBar3D({
            x: -3.0 + wA / 2, y: -2.0 + dAB / 2, zBase: 0.98, height: 1.15, width: wA, depth: dAB,
            color: 0xfbbf24, opacity: 0.92
          }));

          grp.add(engine.createLabel(`全样本空间 Ω (透明度随条件坍缩减弱)`, [1.5, 1.5, 0.6], { accent: '#94a3b8' }));
          grp.add(engine.createLabel(`缩减样本空间 A: P(A)=${pA.toFixed(2)}`, [-3.0 + wA / 2, 1.3, 1.35], { accent: '#38bdf8' }));
          grp.add(engine.createLabel(`交事件 AB: 占 A 的比例 P(B|A)=${pBgivenA.toFixed(3)}`, [-3.0 + wA / 2, -2.0 + dAB / 2, 2.5], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '先验事件概率 P(A)', value: pA.toFixed(3), sub: '条件基准测度' },
            { label: '联合概率 P(AB)', value: pAB.toFixed(3), sub: '乘法公式 P(A)P(B|A)' },
            { label: '条件概率 P(B | A)', value: pBgivenA.toFixed(4), sub: 'AB 占子空间 A 的体积比', highlight: true },
            { label: '空间坍缩程度', value: Math.round(focus * 100) + '%', sub: '拖动第2滑块观察聚焦' }
          ]);

          ctx.setFormulas([
            {
              title: '条件概率公式与乘法公式',
              tex: `P(B \\mid A) = \\frac{P(AB)}{P(A)} = \\frac{${pAB.toFixed(3)}}{${pA.toFixed(3)}} = ${pBgivenA.toFixed(4)}, \\quad P(AB) = P(A)P(B\\mid A)`,
              note: '已知事件 A 发生，相当于把 Ā 全部剔除，将 A 重新归一化为新的“全空间”。'
            }
          ]);
        } else {
          // Bernstein Regular Tetrahedron Counterexample
          const R = 2.3;
          const verts = [
            engine.m2w(0, 0, 3.3),
            engine.m2w(-R, -R * 0.65, 0.5),
            engine.m2w(R, -R * 0.65, 0.5),
            engine.m2w(0, R * 1.1, 0.5)
          ];
          const faces = [
            { idx: [0, 1, 2], col: 0xef4444, name: '面1: 纯红 (属于 A)' },
            { idx: [0, 2, 3], col: 0x22c55e, name: '面2: 纯绿 (属于 B)' },
            { idx: [0, 3, 1], col: 0x3b82f6, name: '面3: 纯蓝 (属于 C)' },
            { idx: [1, 3, 2], col: 0xfbbf24, name: '底面4: 红+绿+蓝三色 (属于 A∩B∩C!)' }
          ];
          faces.forEach((f) => {
            const g = new THREE.BufferGeometry();
            const v0 = verts[f.idx[0]], v1 = verts[f.idx[1]], v2 = verts[f.idx[2]];
            g.setAttribute('position', new THREE.Float32BufferAttribute([
              v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z
            ], 3));
            g.computeVertexNormals();
            grp.add(new THREE.Mesh(g, new THREE.MeshPhongMaterial({
              color: f.col, transparent: true, opacity: 0.78, side: THREE.DoubleSide
            })));
            const cx = (v0.x + v1.x + v2.x) / 3;
            const cy = (v0.y + v1.y + v2.y) / 3;
            const cz = (v0.z + v1.z + v2.z) / 3;
            grp.add(engine.createLabel(f.name, new THREE.Vector3(cx * 1.25, cy * 1.05 + 0.15, cz * 1.25), { scale: 0.52 }));
          });

          ctx.setMetrics([
            { label: '单色事件概率 P(A)=P(B)=P(C)', value: '2/4 = 0.500', sub: '各含 1个纯色面 + 三色底面' },
            { label: '两两交集 P(AB)=P(BC)=P(AC)', value: '1/4 = 0.250', sub: '等于 P(A)P(B)=0.25 (两两独立!)' },
            { label: '三者交集 P(ABC)', value: '1/4 = 0.250', sub: '均命中底面4', highlight: true },
            { label: '乘积 P(A)P(B)P(C)', value: '1/8 = 0.125', sub: '0.25 ≠ 0.125 ⇒ 不相互独立!' }
          ]);

          ctx.setFormulas([
            {
              title: '伯恩斯坦正四面体反例：两两独立 ⇏ 相互独立',
              tex: `P(AB)=P(A)P(B)=\\frac{1}{4}, \\;\\text{但}\\; P(ABC) = \\frac{1}{4} \\neq P(A)P(B)P(C) = \\frac{1}{8}`,
              note: '三个事件相互独立必须同时满足两两独立（3个等式）及三者乘积等式（共4个条件缺一不可）。'
            }
          ]);
        }
      }

      let timer = 0;
      engine.setOnTick((dt) => {
        if (state.mode !== 'circuit') return;
        timer += dt;
        if (timer > 0.28) {
          timer = 0;
          const pTop = state.p1, pBot = Math.max(0.1, state.p2);
          const okTop = Math.random() < pTop && Math.random() < pTop;
          const okBot = Math.random() < pBot && Math.random() < pBot;
          const branch = okTop ? 1.5 : (okBot ? -1.5 : (Math.random() < 0.5 ? 1.5 : -1.5));
          const pass = okTop || okBot;
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 10, 10),
            new THREE.MeshBasicMaterial({ color: pass ? 0x34d399 : 0xf43f5e })
          );
          particlesGrp.add(m);
          pulses.push({ mesh: m, x: -4.2, branch, pass });
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          const pl = pulses[i];
          pl.x += dt * 4.5;
          if ((!pl.pass && pl.x > 0.2) || pl.x > 4.2) {
            particlesGrp.remove(pl.mesh);
            engine.disposeObjectTree(pl.mesh);
            pulses.splice(i, 1);
          } else {
            const y = (pl.x > -2.8 && pl.x < 2.8) ? pl.branch : 0;
            pl.mesh.position.copy(engine.m2w(pl.x, y, 1.5));
          }
        }
      });

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 1-5: 全概率空间划分与贝叶斯信号检测/故障诊断
  // =========================================================================
  Reg['1-5'] = {
    camera: { radius: 13.5, theta: 0.55, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', key: 'pb1', label: '先验占比 P(B₁)（主力产线1）', min: 0.1, max: 0.75, step: 0.05, value: 0.50 },
      { type: 'slider', key: 'pb2', label: '先验占比 P(B₂)（产线2，余下为B₃）', min: 0.1, max: 0.60, step: 0.05, value: 0.30 },
      { type: 'slider', key: 'pa1', label: '产线1次品率 P(A|B₁)', min: 0.01, max: 0.25, step: 0.01, value: 0.03 },
      { type: 'slider', key: 'pa2', label: '产线2次品率 P(A|B₂)', min: 0.01, max: 0.35, step: 0.01, value: 0.08 },
      { type: 'slider', key: 'pa3', label: '产线3次品率 P(A|B₃)（高风险线）', min: 0.02, max: 0.60, step: 0.02, value: 0.24 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const pb1 = state.pb1;
        const pb2 = Math.min(0.95 - pb1, state.pb2);
        const pb3 = Math.max(0.05, 1 - pb1 - pb2);
        const priors = [pb1, pb2, pb3];
        const conds = [state.pa1, state.pa2, state.pa3];
        const joints = priors.map((p, i) => p * conds[i]);
        const pTotalA = joints[0] + joints[1] + joints[2];
        const posts = joints.map((j) => j / Math.max(1e-9, pTotalA));

        // Left Stage: Partitioned Sample Space Slab (Width = 5.4) + Red Joint Volume
        const totalW = 5.2;
        let curX = -4.6;
        const partColors = [0x38bdf8, 0xa78bfa, 0x34d399];
        priors.forEach((pr, idx) => {
          const w = totalW * pr;
          const cx = curX + w / 2;
          // Base prior partition slab
          grp.add(engine.createBar3D({
            x: cx, y: 0, zBase: 0, height: 0.35, width: w - 0.06, depth: 3.2,
            color: partColors[idx], opacity: 0.55
          }));
          // Conditional defect portion along depth
          const defDepth = 3.2 * conds[idx];
          grp.add(engine.createBar3D({
            x: cx, y: -1.6 + defDepth / 2, zBase: 0.36, height: 1.4, width: w - 0.08, depth: Math.max(0.08, defDepth),
            color: 0xf43f5e, opacity: 0.9
          }));
          grp.add(engine.createLabel(`B${idx + 1}(${(pr * 100).toFixed(0)}%)`, [cx, 1.9, 0.4], { scale: 0.48 }));
          curX += w;
        });
        grp.add(engine.createLabel('全概率划分 Ω = B₁∪B₂∪B₃ (红块=次品A)', [-2.0, -2.2, 2.2], { accent: '#f43f5e' }));

        // Right Stage: Prior vs Posterior Towers (Bayes Inversion!)
        for (let i = 0; i < 3; i++) {
          const xBase = 2.0 + i * 1.25;
          // Prior tower (back)
          grp.add(engine.createBar3D({
            x: xBase, y: 0.65, height: priors[i] * 4.2, width: 0.45, depth: 0.45,
            color: partColors[i], opacity: 0.65
          }));
          // Posterior tower (front, gold!)
          grp.add(engine.createBar3D({
            x: xBase, y: -0.65, height: posts[i] * 4.2, width: 0.48, depth: 0.48,
            color: 0xfbbf24, opacity: 0.94
          }));
          grp.add(engine.createLabel(`B${i + 1}: ${(posts[i] * 100).toFixed(1)}%`, [xBase, -0.65, posts[i] * 4.2 + 0.35], {
            scale: 0.48, accent: '#fbbf24'
          }));
        }
        grp.add(engine.createLabel('后排: 先验 P(Bᵢ)  |  前排金塔: 贝叶斯后验 P(Bᵢ|A)', [3.2, 0, 4.3], { accent: '#fbbf24' }));

        const maxIdx = posts.indexOf(Math.max(...posts));
        ctx.setMetrics([
          { label: '全概率总次品率 P(A)', value: (pTotalA * 100).toFixed(2) + '%', sub: '∑ P(Bᵢ)P(A|Bᵢ) 由因导果' },
          { label: '后验 P(B₁ | A)', value: (posts[0] * 100).toFixed(1) + '%', sub: `先验: ${(priors[0] * 100).toFixed(0)}%` },
          { label: '后验 P(B₃ | A)', value: (posts[2] * 100).toFixed(1) + '%', sub: `先验仅 ${(priors[2] * 100).toFixed(0)}% → 逆袭!`, highlight: true },
          { label: '故障溯源最大嫌疑', value: `产线 B${maxIdx + 1}`, sub: 'MAP 最大后验准则判决' }
        ]);

        ctx.setFormulas([
          {
            title: '全概率公式（由因导果）',
            tex: `P(A) = \\sum_{i=1}^{3} P(B_i)P(A\\mid B_i) = ${(joints[0]).toFixed(4)} + ${(joints[1]).toFixed(4)} + ${(joints[2]).toFixed(4)} = ${pTotalA.toFixed(4)}`,
            note: '左台三个红色立柱底面积之和即为整厂混批后的总次品率 P(A)。'
          },
          {
            title: '贝叶斯公式（由果溯因：检出次品 A 后责任归属）',
            tex: `P(B_3 \\mid A) = \\frac{P(B_3)P(A\\mid B_3)}{P(A)} = \\frac{${priors[2].toFixed(2)}\\times ${conds[2].toFixed(2)}}{${pTotalA.toFixed(4)}} = ${(posts[2] * 100).toFixed(2)}\\%`,
            note: '尽管产线 B₃ 产量占比可能最小，但因其失效率高，检出不良品时后验追责概率往往跃居第一！'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 2-1: 随机变量实数映射与分布函数 F(x) 3D 耦合台
  // =========================================================================
  Reg['2-1'] = {
    camera: { radius: 13.5, theta: 0.45, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      {
        type: 'select', key: 'rvType', label: '随机变量类型', value: 'cont',
        options: [
          { label: '连续型随机变量：概率密度 f(x) 与积分 F(x)', value: 'cont' },
          { label: '离散型随机变量：分布律 p_k 与右连续阶梯 F(x)', value: 'disc' }
        ]
      },
      { type: 'slider', key: 'x0', label: '当前阈值切面 x₀（计算 F(x₀)=P(X≤x₀)）', min: -3.0, max: 3.5, step: 0.1, value: 0.8 },
      { type: 'slider', key: 'a', label: '区间下界 a（验证 P(a<X≤x₀)=F(x₀)−F(a)）', min: -3.2, max: 2.0, step: 0.1, value: -1.0 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const x0 = state.x0;
        const a = Math.min(x0 - 0.1, state.a);
        const hScale = 3.2;

        grp.add(engine.createAxes3D({
          xRange: [-4, 4.2], yRange: [-2.2, 2.5], zRange: [0, 3.8],
          xLabel: '实数轴 x', yLabel: '前:密度 / 后:分布函数', zLabel: '高度'
        }));

        // Laser threshold slice at x = x0
        grp.add(engine.createSlicePlane({
          axis: 'x', value: x0, uRange: [-1.8, 2.2], vRange: [0, 3.5],
          color: 0xfbbf24, opacity: 0.2
        }));

        if (state.rvType === 'cont') {
          // Front plane y = -1.2: PDF f(x) of N(0, 1)
          const pdfPts = [], cdfPts = [], shadePts = [], intervalPts = [];
          for (let x = -3.8; x <= 3.801; x += 0.08) {
            const fx = M.normalPDF(x, 0, 1) * hScale * 2.2;
            const Fx = M.normalCDF(x, 0, 1) * hScale;
            pdfPts.push([x, -1.2, fx]);
            cdfPts.push([x, 1.6, Fx]);
            if (x <= x0) shadePts.push([x, -1.18, fx]);
            if (x >= a && x <= x0) intervalPts.push([x, -1.15, fx]);
          }
          grp.add(engine.createRibbonCurve({ points: pdfPts, color: 0x38bdf8, fillOpacity: 0.14 }));
          grp.add(engine.createRibbonCurve({ points: shadePts, color: 0x38bdf8, fillOpacity: 0.45 }));
          if (intervalPts.length > 1) {
            grp.add(engine.createRibbonCurve({ points: intervalPts, color: 0xfbbf24, fillOpacity: 0.65 }));
          }
          grp.add(engine.createRibbonCurve({ points: cdfPts, color: 0x34d399, fillOpacity: 0.22 }));

          const Fx0 = M.normalCDF(x0, 0, 1);
          const Fa = M.normalCDF(a, 0, 1);
          // Marker sphere on F(x0)
          const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 14, 14),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          marker.position.copy(engine.m2w(x0, 1.6, Fx0 * hScale));
          grp.add(marker);

          grp.add(engine.createLabel('前平面: 概率密度 f(x)', [-2.6, -1.2, 2.5], { accent: '#38bdf8' }));
          grp.add(engine.createLabel(`后平面: 分布函数 F(x₀)=${Fx0.toFixed(4)}`, [x0, 1.6, Fx0 * hScale + 0.45], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '分布函数值 F(x₀)', value: Fx0.toFixed(4), sub: `P(X ≤ ${x0.toFixed(1)})`, highlight: true },
            { label: '下界分布值 F(a)', value: Fa.toFixed(4), sub: `a = ${a.toFixed(1)}` },
            { label: '区间概率 P(a<X≤x₀)', value: (Fx0 - Fa).toFixed(4), sub: '等于金色高亮面积 F(x₀)−F(a)' },
            { label: '切点导数 F\'(x₀)=f(x₀)', value: M.normalPDF(x0, 0, 1).toFixed(4), sub: '密度是分布函数斜率' }
          ]);

          ctx.setFormulas([
            {
              title: '连续型分布函数与概率密度的微积分关系',
              tex: `F(x_0) = P(X \\le x_0) = \\int_{-\\infty}^{${x0.toFixed(1)}} f(t)\\,dt = ${Fx0.toFixed(4)}, \\quad f(x) = F'(x)`,
              note: '前排曲线切面左侧总面积精确等于后排绿色分布函数曲线在 x₀ 处的立柱高度。'
            },
            {
              title: '区间概率计算公式',
              tex: `P(${a.toFixed(1)} < X \\le ${x0.toFixed(1)}) = F(${x0.toFixed(1)}) - F(${a.toFixed(1)}) = ${Fx0.toFixed(4)} - ${Fa.toFixed(4)} = ${(Fx0 - Fa).toFixed(4)}`,
              note: '连续型随机变量单点概率 P(X=c)=0，故开闭区间端点不影响概率值。'
            }
          ]);
        } else {
          // Discrete RV: X takes values {-2, -1, 0, 1, 2, 3}
          const vals = [-2, -1, 0, 1, 2, 3];
          const probs = [0.10, 0.20, 0.30, 0.22, 0.12, 0.06];
          let cum = 0;
          let Fx0 = 0, Fa = 0;
          vals.forEach((v, idx) => {
            const p = probs[idx];
            if (v <= x0) Fx0 += p;
            if (v <= a) Fa += p;
            const active = v <= x0;
            grp.add(engine.createBar3D({
              x: v, y: -1.2, height: p * hScale * 2.5, width: 0.32, depth: 0.32,
              color: (v > a && v <= x0) ? 0xfbbf24 : (active ? 0x38bdf8 : 0x475569)
            }));
            // Step segment on back plane y = 1.6
            const nextV = idx < vals.length - 1 ? vals[idx + 1] : 3.8;
            if (idx === 0) {
              grp.add(engine.createRibbonCurve({
                points: [[-3.6, 1.6, 0], [v, 1.6, 0]], color: 0x34d399, fillOpacity: 0
              }));
            }
            cum += p;
            grp.add(engine.createRibbonCurve({
              points: [[v, 1.6, cum * hScale], [nextV, 1.6, cum * hScale]],
              color: 0x34d399, fillOpacity: 0.22
            }));
          });
          grp.add(engine.createLabel('离散阶梯分布函数 F(x) (右连续!)', [0.5, 1.6, 3.55], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '累积分布 F(x₀)', value: Fx0.toFixed(2), sub: `∑_{x_k ≤ ${x0.toFixed(1)}} p_k`, highlight: true },
            { label: '下界累积 F(a)', value: Fa.toFixed(2), sub: `a = ${a.toFixed(1)}` },
            { label: '左闭右开或左开右闭', value: (Fx0 - Fa).toFixed(2), sub: 'P(a < X ≤ x₀) = F(x₀)−F(a)' },
            { label: '跳跃点高度差', value: 'F(x_k)−F(x_k⁻)=p_k', sub: '离散型端点开闭须严格区分!' }
          ]);

          ctx.setFormulas([
            {
              title: '离散型分布律与阶梯分布函数',
              tex: `F(x_0) = P(X \\le x_0) = \\sum_{x_k \\le ${x0.toFixed(1)}} P(X = x_k) = ${Fx0.toFixed(2)}`,
              note: '每经过一个可能取值点 x_k，后排分布函数阶梯立即向上跃升 p_k 的高度，且满足右连续性。'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 2-2: 常用离散型随机变量与光电探测计数噪声 3D 曲面
  // =========================================================================
  Reg['2-2'] = {
    camera: { radius: 14.5, theta: 0.58, phi: 1.10, target: [0, 1.5, 0] },
    controls: [
      {
        type: 'select', key: 'dist', label: '离散分布模型', value: 'binom',
        options: [
          { label: '二项分布 X ~ B(n, p)（光电转换激发数）', value: 'binom' },
          { label: '泊松分布 X ~ P(λ)（单位时间到达光子数）', value: 'poisson' },
          { label: '几何分布 X ~ G(p)（首次捕获光子等待次数）', value: 'geom' }
        ]
      },
      { type: 'slider', key: 'n', label: '试验重数 n (二项模式)', min: 8, max: 60, step: 2, value: 20 },
      { type: 'slider', key: 'lambda', label: '平均光子率 λ = np (或泊松参数 λ)', min: 1.0, max: 10.0, step: 0.5, value: 4.0 },
      {
        type: 'select', key: 'poissonOverlay', label: '泊松定理近似线框对比', value: 'on',
        options: [
          { label: '开启：叠加泊松极限 P(λ=np) 金色柱框', value: 'on' },
          { label: '关闭：仅显示三维参数演化柱阵', value: 'off' }
        ]
      }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const hScale = 8.5;
        const maxK = 16;

        grp.add(engine.createAxes3D({
          xRange: [-4.5, 4.8], yRange: [-3.2, 3.2], zRange: [0, 3.8],
          xLabel: '光子计数 k (0..16)', yLabel: '参数演化簇', zLabel: 'P(X=k)'
        }));

        const n = state.n;
        const lam = state.lambda;
        const pBin = Math.min(0.95, lam / n);

        // Front main row (y = -1.8) + 4 background parameter slices along depth y
        const paramRows = [-1.8, -0.5, 0.8, 2.1];
        let maxDiff = 0;

        paramRows.forEach((py, rIdx) => {
          const isFront = rIdx === 0;
          const rowLam = isFront ? lam : lam * (0.55 + rIdx * 0.35);
          const rowP = Math.min(0.95, rowLam / n);

          for (let k = 0; k <= maxK; k++) {
            let pk = 0;
            if (state.dist === 'binom') pk = M.binomialPMF(k, n, rowP);
            else if (state.dist === 'poisson') pk = M.poissonPMF(k, rowLam);
            else pk = k >= 1 ? M.geometricPMF(k, Math.min(0.85, 1 / (1 + rowLam))) : 0;

            const mx = -4.0 + k * 0.52;
            grp.add(engine.createBar3D({
              x: mx, y: py, height: Math.max(0.015, pk * hScale),
              width: 0.36, depth: 0.42,
              color: isFront ? 0x38bdf8 : 0x1e40af,
              opacity: isFront ? 0.90 : 0.42
            }));

            // Poisson Theorem comparison on front row
            if (isFront && state.dist === 'binom' && state.poissonOverlay === 'on') {
              const pPois = M.poissonPMF(k, lam);
              maxDiff = Math.max(maxDiff, Math.abs(pk - pPois));
              const wireGeo = new THREE.BoxGeometry(0.42, Math.max(0.02, pPois * hScale), 0.48);
              const wire = new THREE.LineSegments(
                new THREE.EdgesGeometry(wireGeo),
                new THREE.LineBasicMaterial({ color: 0xfbbf24 })
              );
              wire.position.copy(engine.m2w(mx, py, pPois * hScale * 0.5));
              grp.add(wire);
            }
          }
        });

        let mean = lam, variance = lam, formulaTex = '';
        if (state.dist === 'binom') {
          mean = n * pBin;
          variance = n * pBin * (1 - pBin);
          formulaTex = `P(X=k)=C_{${n}}^{k}(${pBin.toFixed(3)})^k(${(1 - pBin).toFixed(3)})^{${n}-k} \\xrightarrow{n\\to\\infty,\\,np=\\lambda} \\frac{${lam.toFixed(1)}^k}{k!}e^{-${lam.toFixed(1)}}`;
        } else if (state.dist === 'poisson') {
          mean = lam;
          variance = lam;
          formulaTex = `P(X=k) = \\frac{\\lambda^k}{k!} e^{-\\lambda} = \\frac{${lam.toFixed(1)}^k}{k!} e^{-${lam.toFixed(1)}}, \\quad E(X)=D(X)=\\lambda=${lam.toFixed(1)}`;
        } else {
          const pg = Math.min(0.85, 1 / (1 + lam));
          mean = 1 / pg;
          variance = (1 - pg) / (pg * pg);
          formulaTex = `P(X=k) = (1-p)^{k-1} p, \\quad k=1,2,\\dots, \\quad E(X)=\\frac{1}{p}=${mean.toFixed(2)}`;
        }

        ctx.setMetrics([
          { label: '数学期望 E(X)', value: mean.toFixed(3), sub: '平均激发光电子数' },
          { label: '方差 D(X)', value: variance.toFixed(3), sub: state.dist === 'poisson' ? '散粒噪声: 方差等于均值!' : '波动离散度', highlight: true },
          { label: '二项单次激发率 p', value: pBin.toFixed(4), sub: `n = ${n}` },
          { label: '泊松近似最大误差', value: state.dist === 'binom' ? maxDiff.toFixed(4) : '精确模型', sub: '增大 n 误差迅速趋于 0' }
        ]);

        ctx.setFormulas([
          {
            title: '离散型分布律与泊松极限近似定理',
            tex: formulaTex,
            note: '前排亮蓝柱为当前参数分布律，后排深蓝柱簇展示参数增大时概率峰向右平推展宽的三维曲面趋势；金色线框为泊松极限 P(λ)。'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 2-3: 常用连续型随机变量：电路 3σ 噪声隧道与指数无记忆性
  // =========================================================================
  Reg['2-3'] = {
    camera: { radius: 13.8, theta: 0.56, phi: 1.12, target: [0, 1.6, 0] },
    controls: [
      {
        type: 'select', key: 'dist', label: '连续型分布模型', value: 'normal',
        options: [
          { label: '正态分布 N(μ, σ²) 与 3σ 电路噪声管道', value: 'normal' },
          { label: '指数分布 Exp(λ) 与“无记忆性”三维切片验证', value: 'exp' },
          { label: '均匀分布 U(a, b)（ADC 量化舍入误差）', value: 'uniform' }
        ]
      },
      { type: 'slider', key: 'p1', label: '均值 μ / 失效率 λ / 左端点 a', min: -1.5, max: 2.0, step: 0.1, value: 0.0 },
      { type: 'slider', key: 'p2', label: '标准差 σ / 已工作时间 s / 区间宽', min: 0.4, max: 2.0, step: 0.1, value: 0.9 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function render() {
        clearSub(grp, engine);
        const hScale = 4.2;

        if (state.dist === 'normal') {
          const mu = state.p1;
          const sigma = state.p2;
          grp.add(engine.createAxes3D({
            xRange: [-4.5, 4.5], yRange: [-3.5, 3.5], zRange: [0, 3.8],
            xLabel: '电压幅值 X (V)', yLabel: '时间轴 t', zLabel: '概率密度 f(x)'
          }));

          // Front Gaussian Bell Curve at y = -2.5
          const bellPts = [], s1Pts = [], s2Pts = [];
          for (let x = -4.4; x <= 4.4; x += 0.07) {
            const z = M.normalPDF(x, mu, sigma) * hScale;
            bellPts.push([x, -2.5, z]);
            if (Math.abs(x - mu) <= sigma) s1Pts.push([x, -2.48, z]);
            if (Math.abs(x - mu) <= 2 * sigma) s2Pts.push([x, -2.49, z]);
          }
          grp.add(engine.createRibbonCurve({ points: bellPts, color: 0x38bdf8, fillOpacity: 0.18 }));
          grp.add(engine.createRibbonCurve({ points: s2Pts, color: 0xa78bfa, fillOpacity: 0.25 }));
          grp.add(engine.createRibbonCurve({ points: s1Pts, color: 0x34d399, fillOpacity: 0.42 }));

          // 3D +-3sigma Translucent Confidence Cylinders along Time Y-axis (-2.2 -> +3.2)
          [
            { k: 1, col: 0x34d399, op: 0.14, txt: '±1σ (68.27%)' },
            { k: 2, col: 0x38bdf8, op: 0.09, txt: '±2σ (95.45%)' },
            { k: 3, col: 0xfbbf24, op: 0.07, txt: '±3σ (99.73%)' }
          ].forEach((b) => {
            const r = b.k * sigma;
            const cyl = new THREE.Mesh(
              new THREE.CylinderGeometry(r, r, 5.2, 24, 1, true),
              new THREE.MeshBasicMaterial({ color: b.col, transparent: true, opacity: b.op, side: THREE.DoubleSide, depthWrite: false })
            );
            cyl.position.copy(engine.m2w(mu, 0.5, 1.3));
            grp.add(cyl);
          });

          // Time-domain 3D Gaussian noise signal inside the tunnel
          const wavePts = [];
          let in3Sigma = 0;
          const totalPts = 130;
          for (let i = 0; i < totalPts; i++) {
            const my = -2.1 + (i / totalPts) * 5.2;
            const val = M.randNormal(mu, sigma);
            if (Math.abs(val - mu) <= 3 * sigma) in3Sigma++;
            wavePts.push([val, my, 1.3]);
          }
          grp.add(engine.createRibbonCurve({ points: wavePts, color: 0xfbbf24, fillOpacity: 0 }));
          grp.add(engine.createLabel(`3σ 噪声包络管道 (μ=${mu.toFixed(1)}, σ=${sigma.toFixed(1)})`, [mu, 1.2, 1.3 + 3 * sigma * 0.45 + 0.5], { accent: '#fbbf24' }));

          ctx.setMetrics([
            { label: '±1σ 区间覆盖率', value: '68.27%', sub: `[${(mu - sigma).toFixed(2)}, ${(mu + sigma).toFixed(2)}] V` },
            { label: '±2σ 区间覆盖率', value: '95.45%', sub: `[${(mu - 2 * sigma).toFixed(2)}, ${(mu + 2 * sigma).toFixed(2)}] V` },
            { label: '±3σ 工程准则覆盖率', value: '99.73%', sub: `本次落入率: ${(in3Sigma / totalPts * 100).toFixed(1)}%`, highlight: true },
            { label: '峰值密度 1/(√2π·σ)', value: M.normalPDF(mu, mu, sigma).toFixed(4), sub: 'σ 越小山峰越尖高' }
          ]);

          ctx.setFormulas([
            {
              title: '正态分布密度与标准化公式',
              tex: `f(x)=\\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}, \\quad P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) = 2\\Phi(3)-1 = 0.9973`,
              note: '电子工程中通常定义高斯白噪声峰峰值约为 6σ~6.6σ，超出 ±3σ 管道的概率仅 0.27%。'
            }
          ]);
        } else if (state.dist === 'exp') {
          const lam = Math.max(0.35, state.p1 + 1.6);
          const s = state.p2; // elapsed working time s
          grp.add(engine.createAxes3D({
            xRange: [-0.5, 6.2], yRange: [-2.2, 2.2], zRange: [0, 3.8],
            xLabel: '器件寿命 t (千小时)', yLabel: '对比平面', zLabel: 'f(t)'
          }));

          const origPts = [], tailPts = [], renormPts = [];
          for (let t = 0; t <= 6.0; t += 0.06) {
            origPts.push([t, -1.2, M.expPDF(t, lam) * 2.4]);
            if (t >= s) {
              tailPts.push([t, -1.18, M.expPDF(t, lam) * 2.4]);
              // Shift t-s back to origin and divide by P(X>s)=e^{-lam*s} -> IDENTICAL Exp(lam)!
              const condDensity = (M.expPDF(t, lam) / Math.exp(-lam * s)) * 2.4;
              renormPts.push([t - s, 1.2, condDensity]);
            }
          }
          grp.add(engine.createRibbonCurve({ points: origPts, color: 0x38bdf8, fillOpacity: 0.2 }));
          grp.add(engine.createRibbonCurve({ points: tailPts, color: 0xf43f5e, fillOpacity: 0.5 }));
          grp.add(engine.createRibbonCurve({ points: renormPts, color: 0xfbbf24, fillOpacity: 0.35 }));
          grp.add(engine.createSlicePlane({ axis: 'x', value: s, uRange: [-1.8, 1.8], vRange: [0, 3.4], color: 0xf43f5e, opacity: 0.22 }));

          grp.add(engine.createLabel(`前排: 原始寿命 Exp(λ=${lam.toFixed(1)}) 及 t>${s.toFixed(1)} 截尾`, [2.5, -1.2, 2.6], { accent: '#38bdf8' }));
          grp.add(engine.createLabel('后排金线: 条件剩余寿命平移重归一化 → 与全新器件完全相同!', [2.2, 1.2, 3.1], { accent: '#fbbf24' }));

          const pSurvive = Math.exp(-lam * s);
          ctx.setMetrics([
            { label: '失效率参数 λ', value: lam.toFixed(2), sub: `平均寿命 E(X)=1/λ=${(1 / lam).toFixed(2)}` },
            { label: '已正常工作至 s 概率', value: pSurvive.toFixed(4), sub: `P(X > ${s.toFixed(1)}) = e^{-λs}` },
            { label: '条件剩余期望寿命', value: (1 / lam).toFixed(2), sub: '无记忆性: 旧件不老化!', highlight: true },
            { label: '方差 D(X)=1/λ²', value: (1 / (lam * lam)).toFixed(3), sub: '标准差等于均值' }
          ]);

          ctx.setFormulas([
            {
              title: '指数分布无记忆性严格推导',
              tex: `P(X > s + t \\mid X > s) = \\frac{P(X > s+t)}{P(X > s)} = \\frac{e^{-\\lambda(s+t)}}{e^{-\\lambda s}} = e^{-\\lambda t} = P(X > t)`,
              note: '把 x > s 之后的红色残尾除以存活概率 e^{-λs} 并平移回原点（后排金色曲面），与全新器件的原始密度丝毫不差！'
            }
          ]);
        } else {
          // Uniform U(a, b)
          const a = state.p1 - 1.0;
          const width = Math.max(0.6, state.p2 * 2.2);
          const b = a + width;
          const height = 1 / width;
          grp.add(engine.createAxes3D({
            xRange: [-4, 4.5], yRange: [-2, 2], zRange: [0, 3.8],
            xLabel: 'ADC 量化误差 e (LSB)', yLabel: '', zLabel: 'f(e)', showY: false
          }));
          grp.add(engine.createBar3D({
            x: (a + b) / 2, y: 0, height: height * 2.6, width, depth: 1.4,
            color: 0x34d399, opacity: 0.78
          }));
          grp.add(engine.createLabel(`均匀分布块 U(${a.toFixed(2)}, ${b.toFixed(2)}), 高度=1/(b−a)=${height.toFixed(3)}`, [(a + b) / 2, 0, height * 2.6 + 0.45], { accent: '#34d399' }));

          ctx.setMetrics([
            { label: '密度高度 1/(b−a)', value: height.toFixed(4), sub: '区间越窄密度越高，总面积恒为1', highlight: true },
            { label: '数学期望 (a+b)/2', value: ((a + b) / 2).toFixed(3), sub: '对称中心' },
            { label: '量化误差方差 (b−a)²/12', value: (width * width / 12).toFixed(4), sub: '著名 ADC 量化噪声功率 Δ²/12!' },
            { label: '标准差 Δ/√12', value: (width / Math.sqrt(12)).toFixed(4), sub: '提升位数减半 Δ 可降噪 6dB' }
          ]);

          ctx.setFormulas([
            {
              title: '均匀分布与 ADC 量化信噪比基础公式',
              tex: `f(x) = \\frac{1}{b-a} = ${height.toFixed(3)}\\;(x\\in[${a.toFixed(2)},${b.toFixed(2)}]), \\quad D(X) = \\frac{(b-a)^2}{12} = ${(width * width / 12).toFixed(4)}`,
              note: '模数转换器量化误差服从均匀分布，其平均噪声功率 Δ²/12 是推导理想 ADC 信噪比 SNR = 6.02N + 1.76 dB 的核心依据！'
            }
          ]);
        }
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };

  // =========================================================================
  // 2-4: 随机变量函数的分布 Y=g(X) 三维正交映射台
  // =========================================================================
  Reg['2-4'] = {
    camera: { radius: 14.2, theta: 0.62, phi: 1.08, target: [0, 1.8, 0] },
    controls: [
      {
        type: 'select', key: 'func', label: '电路系统传输函数 Y = g(X)', value: 'square',
        options: [
          { label: '非线性平方律检波器：Y = X²（导出 χ²(1) 奇异峰）', value: 'square' },
          { label: '线性放大偏置电路：Y = aX + b（保持正态性）', value: 'linear' },
          { label: '理想全波整流桥：Y = |X|（折叠正态分布）', value: 'abs' },
          { label: '理想二极管半波整流：Y = max(0, X)（混合冲激）', value: 'relu' }
        ]
      },
      { type: 'slider', key: 'sigma', label: '输入高斯信号标准差 σ_X', min: 0.5, max: 1.6, step: 0.1, value: 1.0 },
      { type: 'slider', key: 'gain', label: '线性增益系数 a (线性模式)', min: 0.6, max: 2.2, step: 0.2, value: 1.4 }
    ],
    mount(ctx) {
      const { engine, state } = ctx;
      const grp = new THREE.Group();
      engine.caseGroup.add(grp);

      function gMap(x) {
        if (state.func === 'square') return 0.75 * x * x;
        if (state.func === 'linear') return state.gain * x + 0.6;
        if (state.func === 'abs') return 1.15 * Math.abs(x);
        return Math.max(0, 1.15 * x);
      }

      function render() {
        clearSub(grp, engine);
        const s = state.sigma;

        grp.add(engine.createAxes3D({
          xRange: [-3.8, 3.8], yRange: [-3.2, 3.6], zRange: [0, 4.2],
          xLabel: '输入电压 X', yLabel: '映射深度', zLabel: '输出信号 Y = g(X)'
        }));

        // 1. Input PDF f_X(x) along X-axis at front y = -2.4
        const inPts = [];
        for (let x = -3.6; x <= 3.6; x += 0.08) {
          inPts.push([x, -2.4, M.normalPDF(x, 0, s) * 3.5]);
        }
        grp.add(engine.createRibbonCurve({ points: inPts, color: 0x38bdf8, fillOpacity: 0.35 }));
        grp.add(engine.createLabel('输入密度 f_X(x) ~ N(0, σ²)', [0, -2.4, 2.2], { accent: '#38bdf8' }));

        // 2. Center 3D Transfer Mirror Curve z = g(x) at y = 0
        const gPts = [];
        for (let x = -3.2; x <= 3.2; x += 0.07) {
          const yVal = gMap(x);
          if (yVal >= -0.5 && yVal <= 4.0) gPts.push([x, 0, Math.max(0, yVal)]);
        }
        grp.add(engine.createRibbonCurve({ points: gPts, color: 0xfbbf24, fillOpacity: 0.14 }));
        grp.add(engine.createLabel('系统传输特性曲线 y = g(x)', [1.8, 0, 3.4], { accent: '#fbbf24' }));

        // 3. Output PDF f_Y(y) projected onto left wall x = -3.8 along vertical Z!
        const outPts = [];
        for (let y = 0.06; y <= 3.8; y += 0.06) {
          let fy = 0;
          if (state.func === 'square') {
            const rawY = y / 0.75;
            fy = (1 / Math.sqrt(rawY)) * M.normalPDF(Math.sqrt(rawY), 0, s) / 0.75;
          } else if (state.func === 'linear') {
            fy = M.normalPDF(y, 0.6, state.gain * s);
          } else if (state.func === 'abs') {
            fy = (2 / 1.15) * M.normalPDF(y / 1.15, 0, s);
          } else {
            fy = (1 / 1.15) * M.normalPDF(y / 1.15, 0, s);
          }
          const clampedFy = Math.min(3.2, fy * 2.4);
          // Plot along depth y = +1.8, vertical height = y, extending in +x direction as horizontal density profile
          outPts.push([-3.6 + clampedFy, 1.8, y]);
        }
        grp.add(engine.createRibbonCurve({ points: outPts, color: 0x34d399, fillOpacity: 0, closedCurtain: false }));
        // Horizontal bars for output histogram clarity
        for (let y = 0.2; y <= 3.6; y += 0.24) {
          let fy = 0;
          if (state.func === 'square') {
            const rawY = y / 0.75;
            fy = (1 / Math.sqrt(rawY)) * M.normalPDF(Math.sqrt(rawY), 0, s) / 0.75;
          } else if (state.func === 'linear') {
            fy = M.normalPDF(y, 0.6, state.gain * s);
          } else if (state.func === 'abs') {
            fy = (2 / 1.15) * M.normalPDF(y / 1.15, 0, s);
          } else {
            fy = (1 / 1.15) * M.normalPDF(y / 1.15, 0, s);
          }
          const len = Math.min(3.0, fy * 2.4);
          grp.add(engine.createRibbonCurve({
            points: [[-3.6, 1.8, y], [-3.6 + len, 1.8, y]],
            color: 0x34d399, fillOpacity: 0
          }));
        }
        if (state.func === 'relu') {
          // Point mass P(Y=0) = 0.5 impulse bar!
          grp.add(engine.createBar3D({
            x: -2.4, y: 1.8, height: 0.22, width: 2.4, depth: 0.3, color: 0xf43f5e
          }));
          grp.add(engine.createLabel('半波截止点质量 P(Y=0)=0.5!', [-1.6, 1.8, 0.55], { accent: '#f43f5e', scale: 0.5 }));
        }
        grp.add(engine.createLabel('后墙: 输出密度 f_Y(y)', [-2.2, 1.8, 4.0], { accent: '#34d399' }));

        // Sample reflection rays: (x, -2.4, 0) -> (x, 0, g(x)) -> (-3.6, 1.8, g(x))
        [-1.8, -1.1, -0.5, 0.5, 1.1, 1.8].forEach((rx) => {
          const gy = Math.max(0, Math.min(3.8, gMap(rx)));
          grp.add(engine.createRibbonCurve({
            points: [[rx, -2.4, 0.05], [rx, 0, gy], [-3.6, 1.8, gy]],
            color: 0x94a3b8, fillOpacity: 0
          }));
        });

        let tex = '', meanOut = '';
        if (state.func === 'square') {
          tex = `Y = X^2 \\implies f_Y(y) = \\frac{1}{2\\sqrt{y}}\\left[f_X(\\sqrt{y}) + f_X(-\\sqrt{y})\\right] = \\frac{1}{\\sqrt{2\\pi y}\\,\\sigma} e^{-\\frac{y}{2\\sigma^2}} \\;(y>0)`;
          meanOut = (s * s).toFixed(2);
        } else if (state.func === 'linear') {
          tex = `Y = aX + b \\implies f_Y(y) = \\frac{1}{|a|} f_X\\!\\left(\\frac{y-b}{a}\\right), \\quad Y \\sim N(b, a^2\\sigma^2)`;
          meanOut = '0.60';
        } else if (state.func === 'abs') {
          tex = `Y = |X| \\implies f_Y(y) = f_X(y) + f_X(-y) = \\frac{2}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{y^2}{2\\sigma^2}} \\;(y > 0)`;
          meanOut = (s * Math.sqrt(2 / Math.PI)).toFixed(3);
        } else {
          tex = `F_Y(y) = \\begin{cases} 0, & y < 0 \\\\ 0.5, & y = 0 \\\\ \\Phi(y/\\sigma), & y > 0 \\end{cases} \\quad (\\text{含 } y=0 \\text{ 处 } 0.5 \\text{ 离散跃变})`;
          meanOut = (s / Math.sqrt(2 * Math.PI)).toFixed(3);
        }

        ctx.setMetrics([
          { label: '输入信号均值 / 标准差', value: `0 / ${s.toFixed(2)}`, sub: 'X ~ N(0, σ²)' },
          { label: '输出数学期望 E(Y)', value: meanOut, sub: '非线性检波产生直流分量!', highlight: true },
          { label: '正态性是否保持', value: state.func === 'linear' ? '是 (仍为正态)' : '否 (发生畸变)', sub: '仅线性变换保持正态分布' },
          { label: '雅可比缩放因子', value: state.func === 'square' ? '1 / (2√y)' : (state.func === 'linear' ? `1 / ${state.gain}` : '折叠叠加'), sub: '解释 y→0⁺ 处的密度奇异峰' }
        ]);

        ctx.setFormulas([
          {
            title: '随机变量函数 Y = g(X) 概率密度变换公式',
            tex,
            note: '灰色折线追踪输入样本经中间金色传输曲面 y=g(x) 反射汇聚到后侧绿色输出轴的全过程。'
          }
        ]);
      }

      render();
      return { onControlChange: render, reset: render };
    }
  };
})();
