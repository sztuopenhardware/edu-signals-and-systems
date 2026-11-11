/**
 * 《概率论与数理统计》3D 交互式教学仿真平台 - 主控制器 (Application Controller)
 * 负责章节下拉菜单导航、级联选择器同步、动态参数面板、KaTeX 公式渲染与课程大纲弹窗
 */
window.ProbLab = window.ProbLab || {};

(function () {
  'use strict';

  function initApp() {
    const { Syllabus, SceneEngine, CaseRegistry } = window.ProbLab;
    const { COURSE_META, CHAPTERS, CASE_MAP, ORDERED_CASES } = Syllabus;

    const canvas = document.getElementById('webgl-canvas');
    if (!window.THREE) {
      document.getElementById('loading-fallback').style.display = 'flex';
      return;
    }
    const engine = SceneEngine.createEngine(canvas);

    // DOM References
    const chapterMenubar = document.getElementById('chapter-menubar');
    const dropdownPortal = document.getElementById('chapter-dropdown-portal');
    const chapterSelect = document.getElementById('chapter-select');
    const caseSelect = document.getElementById('case-select');
    const prevBtn = document.getElementById('prev-case-btn');
    const nextBtn = document.getElementById('next-case-btn');
    const controlsContainer = document.getElementById('case-controls');
    const metricsContainer = document.getElementById('case-metrics');

    // Right Panel DOM
    const heroBadges = document.getElementById('case-hero-badges');
    const heroTitle = document.getElementById('case-hero-title');
    const heroSub = document.getElementById('case-hero-sub');
    const formulasBox = document.getElementById('formulas-container');
    const syllabusPointsList = document.getElementById('syllabus-points-list');
    const engContextText = document.getElementById('eng-context-text');
    const guideStepsList = document.getElementById('guide-steps-list');

    let currentCaseId = null;
    let currentInstance = null;
    let openMenuChapterId = null;
    let controlSyncFns = [];

    // -----------------------------------------------------------------------
    // 1. Build Top Chapter-Based Dropdown Menu Bar & Cascading <select>s
    // -----------------------------------------------------------------------
    function levelClass(lv) {
      if (lv === '掌握') return 'master';
      if (lv === '理解') return 'comp';
      return 'know';
    }

    function buildNavigation() {
      chapterMenubar.innerHTML = '';
      chapterSelect.innerHTML = '';

      CHAPTERS.forEach((ch) => {
        // 1) Top Chapter Dropdown Trigger
        const item = document.createElement('div');
        item.className = 'ch-nav-item';
        item.dataset.chapterId = ch.id;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ch-nav-trigger';
        btn.innerHTML = `
          <span>${ch.shortTitle}</span>
          <span class="ch-count-badge">${ch.cases.length}</span>
          <span class="ch-caret">▾</span>
        `;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (openMenuChapterId === ch.id) {
            closeChapterDropdown();
          } else {
            openChapterDropdown(ch, item, btn);
          }
        });
        item.appendChild(btn);
        chapterMenubar.appendChild(item);

        // 2) Cascading <select id="chapter-select"> option
        const opt = document.createElement('option');
        opt.value = ch.id;
        opt.textContent = `${ch.shortTitle}（共 ${ch.cases.length} 个实验）`;
        chapterSelect.appendChild(opt);
      });
    }

    function openChapterDropdown(ch, itemEl, btnEl) {
      closeChapterDropdown();
      openMenuChapterId = ch.id;
      itemEl.classList.add('open');

      dropdownPortal.innerHTML = `
        <div class="dd-header">
          <div class="dd-header-title">${ch.title}</div>
          <div class="dd-header-sub">${ch.enTitle} · 点击任一教学内容进入 3D 交互仿真</div>
        </div>
      `;

      ch.cases.forEach((c) => {
        const optBtn = document.createElement('button');
        optBtn.type = 'button';
        optBtn.className = 'dd-case-option' + (c.id === currentCaseId ? ' current' : '');
        optBtn.innerHTML = `
          <div class="dd-case-top">
            <span class="dd-case-name">${c.code} ${c.title}</span>
            <span class="dd-badges">
              <span class="tag-level ${levelClass(c.level)}">${c.level}</span>
              <span class="tag-eng">${c.engTag}</span>
            </span>
          </div>
          <div class="dd-case-sub">第 ${c.week} 周 · ${c.subtitle}</div>
        `;
        optBtn.addEventListener('click', () => {
          closeChapterDropdown();
          loadCase(c.id);
        });
        dropdownPortal.appendChild(optBtn);
      });

      dropdownPortal.classList.add('visible');
      const rect = btnEl.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - 400);
      dropdownPortal.style.left = Math.min(rect.left, maxLeft) + 'px';
      dropdownPortal.style.top = (rect.bottom + 4) + 'px';
    }

    function closeChapterDropdown() {
      openMenuChapterId = null;
      dropdownPortal.classList.remove('visible');
      document.querySelectorAll('.ch-nav-item.open').forEach((el) => el.classList.remove('open'));
    }

    document.addEventListener('click', (e) => {
      if (!dropdownPortal.contains(e.target)) {
        closeChapterDropdown();
      }
    });

    // Populate Case <select> for a given chapter
    function populateCaseSelect(chapterId, selectedCaseId) {
      const ch = CHAPTERS.find((c) => c.id === chapterId) || CHAPTERS[0];
      caseSelect.innerHTML = '';
      ch.cases.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.code} ${c.title} [${c.level}]`;
        if (c.id === selectedCaseId) opt.selected = true;
        caseSelect.appendChild(opt);
      });
    }

    chapterSelect.addEventListener('change', () => {
      const ch = CHAPTERS.find((c) => c.id === chapterSelect.value);
      if (ch && ch.cases.length > 0) {
        loadCase(ch.cases[0].id);
      }
    });

    caseSelect.addEventListener('change', () => {
      if (caseSelect.value) loadCase(caseSelect.value);
    });

    prevBtn.addEventListener('click', () => {
      const idx = ORDERED_CASES.findIndex((c) => c.id === currentCaseId);
      if (idx > 0) loadCase(ORDERED_CASES[idx - 1].id);
    });

    nextBtn.addEventListener('click', () => {
      const idx = ORDERED_CASES.findIndex((c) => c.id === currentCaseId);
      if (idx >= 0 && idx < ORDERED_CASES.length - 1) loadCase(ORDERED_CASES[idx + 1].id);
    });

    // -----------------------------------------------------------------------
    // 2. Render Math via KaTeX (with readable fallback)
    // -----------------------------------------------------------------------
    function renderMathInto(el, texStr) {
      if (window.katex && typeof window.katex.render === 'function') {
        try {
          window.katex.render(texStr, el, { displayMode: true, throwOnError: false });
          return;
        } catch (err) {
          // fallback below
        }
      }
      el.textContent = texStr;
    }

    // -----------------------------------------------------------------------
    // 3. Case Lifecycle Mounting & UI Updates
    // -----------------------------------------------------------------------
    function setMetrics(items) {
      metricsContainer.innerHTML = '';
      (items || []).forEach((m) => {
        const card = document.createElement('div');
        card.className = 'metric-card' + (m.highlight ? ' highlight' : '');
        card.innerHTML = `
          <div class="metric-label">${m.label}</div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-sub">${m.sub || ''}</div>
        `;
        metricsContainer.appendChild(card);
      });
    }

    let lastFormulaBlocks = [];
    function setFormulas(blocks) {
      lastFormulaBlocks = blocks || [];
      formulasBox.innerHTML = '';
      lastFormulaBlocks.forEach((b) => {
        const card = document.createElement('div');
        card.className = 'formula-card';
        const titleEl = document.createElement('div');
        titleEl.className = 'formula-title';
        titleEl.textContent = b.title;
        const mathEl = document.createElement('div');
        mathEl.className = 'formula-math';
        renderMathInto(mathEl, b.tex);
        card.appendChild(titleEl);
        card.appendChild(mathEl);
        if (b.note) {
          const noteEl = document.createElement('div');
          noteEl.className = 'formula-note';
          noteEl.textContent = b.note;
          card.appendChild(noteEl);
        }
        formulasBox.appendChild(card);
      });
    }

    window.addEventListener('problab:katex-ready', () => {
      if (lastFormulaBlocks.length > 0) {
        setFormulas(lastFormulaBlocks);
      }
    });

    window.addEventListener('hashchange', () => {
      const m = (window.location.hash || '').match(/case=([0-9]+-[0-9]+)/);
      if (m && CASE_MAP[m[1]] && m[1] !== currentCaseId) {
        loadCase(m[1]);
      }
    });

    function loadCase(caseId) {
      const meta = CASE_MAP[caseId] || ORDERED_CASES[0];
      const spec = CaseRegistry[meta.id];
      if (!spec) return;

      currentCaseId = meta.id;
      try {
        window.history.replaceState(null, '', `#case=${meta.id}`);
      } catch (_) {}

      // Highlight active chapter in top dropdown bar & sync cascading selects
      document.querySelectorAll('.ch-nav-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.chapterId === meta.chapterId);
      });
      chapterSelect.value = meta.chapterId;
      populateCaseSelect(meta.chapterId, meta.id);

      const orderIdx = ORDERED_CASES.findIndex((c) => c.id === meta.id);
      prevBtn.disabled = orderIdx <= 0;
      nextBtn.disabled = orderIdx >= ORDERED_CASES.length - 1;

      // Update Right Panel Metadata, Syllabus Goals & Guide
      heroBadges.innerHTML = `
        <span class="pill-badge">${meta.chapterShortTitle} · ${meta.code}</span>
        <span class="tag-level ${levelClass(meta.level)}">大纲要求：${meta.level}</span>
        <span class="tag-eng">${meta.engTag}</span>
        <span class="pill-badge">第 ${meta.week} 周 · ${meta.co.join('/')}</span>
      `;
      heroTitle.textContent = meta.title;
      heroSub.textContent = meta.subtitle;

      syllabusPointsList.innerHTML = meta.syllabusPoints.map((pt) => `<li>${pt}</li>`).join('');
      engContextText.textContent = meta.engineeringContext;
      guideStepsList.innerHTML = meta.guideSteps.map((st, idx) => `<li><strong>探究 ${idx + 1}：</strong>${st}</li>`).join('');

      // Clear previous 3D scene & prepare state + controls
      engine.clearCase();
      if (spec.camera) {
        engine.setDefaultView(spec.camera, false);
      }

      const state = {};
      controlsContainer.innerHTML = '';
      controlSyncFns = [];

      const ctx = {
        engine,
        state,
        setMetrics,
        setFormulas,
        syncControls() {
          controlSyncFns.forEach((fn) => fn());
        }
      };

      (spec.controls || []).forEach((ctrl) => {
        if (ctrl.type === 'select') {
          state[ctrl.key] = ctrl.value;
          const wrap = document.createElement('div');
          wrap.className = 'field-group';
          const lbl = document.createElement('label');
          lbl.className = 'field-label';
          lbl.textContent = ctrl.label;
          const sel = document.createElement('select');
          sel.className = 'styled-select';
          ctrl.options.forEach((o) => {
            const op = document.createElement('option');
            op.value = o.value;
            op.textContent = o.label;
            if (o.value === ctrl.value) op.selected = true;
            sel.appendChild(op);
          });
          sel.addEventListener('change', () => {
            state[ctrl.key] = sel.value;
            if (currentInstance && currentInstance.onControlChange) {
              currentInstance.onControlChange(ctrl.key, state[ctrl.key], ctx);
            }
          });
          controlSyncFns.push(() => { sel.value = state[ctrl.key]; });
          wrap.appendChild(lbl);
          wrap.appendChild(sel);
          controlsContainer.appendChild(wrap);
        } else if (ctrl.type === 'slider') {
          state[ctrl.key] = ctrl.value;
          const wrap = document.createElement('div');
          wrap.className = 'slider-item';
          const top = document.createElement('div');
          top.className = 'slider-top';
          const nameSpan = document.createElement('span');
          nameSpan.textContent = ctrl.label;
          const badge = document.createElement('span');
          badge.className = 'slider-val-badge';
          const decimals = String(ctrl.step).includes('.') ? String(ctrl.step).split('.')[1].length : 0;
          badge.textContent = Number(ctrl.value).toFixed(decimals);
          top.appendChild(nameSpan);
          top.appendChild(badge);

          const inp = document.createElement('input');
          inp.type = 'range';
          inp.min = ctrl.min;
          inp.max = ctrl.max;
          inp.step = ctrl.step;
          inp.value = ctrl.value;
          inp.addEventListener('input', () => {
            const v = parseFloat(inp.value);
            state[ctrl.key] = v;
            badge.textContent = v.toFixed(decimals);
            if (currentInstance && currentInstance.onControlChange) {
              currentInstance.onControlChange(ctrl.key, v, ctx);
            }
          });
          controlSyncFns.push(() => {
            inp.value = state[ctrl.key];
            badge.textContent = Number(state[ctrl.key]).toFixed(decimals);
          });
          wrap.appendChild(top);
          wrap.appendChild(inp);
          controlsContainer.appendChild(wrap);
        } else if (ctrl.type === 'button') {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `ctrl-action-btn ${ctrl.variant || 'primary'}`;
          btn.textContent = ctrl.label;
          btn.addEventListener('click', () => {
            if (currentInstance && currentInstance.onAction) {
              currentInstance.onAction(ctrl.action, ctx);
            }
          });
          controlsContainer.appendChild(btn);
        }
      });

      currentInstance = spec.mount(ctx) || {};
    }

    // -----------------------------------------------------------------------
    // 4. Right Panel Tabs, Side Panel Collapsing, HUD Camera & Theme
    // -----------------------------------------------------------------------
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-pane').forEach((p) => p.classList.toggle('active', p.id === `tab-${target}`));
      });
    });

    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const leftRestore = document.getElementById('left-restore-btn');
    const rightRestore = document.getElementById('right-restore-btn');

    document.getElementById('collapse-left-btn').addEventListener('click', () => {
      leftPanel.classList.add('collapsed');
      leftRestore.classList.add('show');
    });
    leftRestore.addEventListener('click', () => {
      leftPanel.classList.remove('collapsed');
      leftRestore.classList.remove('show');
    });

    document.getElementById('collapse-right-btn').addEventListener('click', () => {
      rightPanel.classList.add('collapsed');
      rightRestore.classList.add('show');
    });
    rightRestore.addEventListener('click', () => {
      rightPanel.classList.remove('collapsed');
      rightRestore.classList.remove('show');
    });

    // Camera Presets & Animation Toggles
    document.querySelectorAll('[data-cam]').forEach((btn) => {
      btn.addEventListener('click', () => {
        engine.setCameraPreset(btn.dataset.cam);
      });
    });

    const autoRotBtn = document.getElementById('hud-autorotate');
    autoRotBtn.addEventListener('click', () => {
      engine.orbit.autoRotate = !engine.orbit.autoRotate;
      autoRotBtn.classList.toggle('active', engine.orbit.autoRotate);
    });

    const pauseBtn = document.getElementById('hud-pause');
    pauseBtn.addEventListener('click', () => {
      engine.orbit.paused = !engine.orbit.paused;
      pauseBtn.classList.toggle('active', engine.orbit.paused);
      pauseBtn.textContent = engine.orbit.paused ? '▶ 继续动画' : '⏸ 暂停动画';
    });

    document.getElementById('hud-reset').addEventListener('click', () => {
      engine.setCameraPreset('iso');
      if (currentInstance && currentInstance.reset) {
        currentInstance.reset();
      }
    });

    // Dark / Classroom Light Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    themeBtn.addEventListener('click', () => {
      const next = engine.getTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      engine.setTheme(next);
      themeBtn.textContent = next === 'dark' ? '☀ 教室浅色' : '🌙 实验深色';
      // Re-render current case so 3D sprite badges adapt to new theme contrast
      if (currentCaseId) loadCase(currentCaseId);
    });

    // -----------------------------------------------------------------------
    // 5. Syllabus Overview Modal (18 Weeks & OBE Objectives)
    // -----------------------------------------------------------------------
    const modal = document.getElementById('syllabus-modal');
    const obeBox = document.getElementById('modal-obe-grid');
    const scheduleTbody = document.getElementById('modal-schedule-tbody');

    function populateSyllabusModal() {
      obeBox.innerHTML = COURSE_META.objectives.map((o) => `
        <div class="obe-card">
          <h4>${o.id} · ${o.category}（指标权重 1.2:${o.weights['1.2']} / 2.1:${o.weights['2.1']} / 2.3:${o.weights['2.3']}）</h4>
          <p>${o.desc}</p>
        </div>
      `).join('');

      scheduleTbody.innerHTML = '';
      COURSE_META.schedule18Weeks.forEach((w) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>第 ${w.week} 周</strong> (${w.hours}h)</td>
          <td>${w.content}</td>
          <td>${w.note}</td>
          <td><button type="button" class="schedule-jump-btn" data-jump="${w.caseId}">进入 3D 实验 ▶</button></td>
        `;
        scheduleTbody.appendChild(tr);
      });

      scheduleTbody.querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => {
          modal.classList.remove('open');
          loadCase(btn.dataset.jump);
        });
      });
    }

    document.getElementById('open-syllabus-btn').addEventListener('click', () => {
      modal.classList.add('open');
    });
    document.getElementById('close-syllabus-btn').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Initialize everything
    buildNavigation();
    populateSyllabusModal();

    // Load initial case from URL hash (#case=3-2) or default to 1-1 / 0-1
    const hashMatch = (window.location.hash || '').match(/case=([0-9]+-[0-9]+)/);
    const initialId = (hashMatch && CASE_MAP[hashMatch[1]]) ? hashMatch[1] : '0-1';
    loadCase(initialId);
  }

  window.ProbLab.initApp = initApp;
})();
