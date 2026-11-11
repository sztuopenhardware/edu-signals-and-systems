/**
 * 《信号与系统》交互式 3D 教学仿真实验平台 — 主控应用逻辑 (app.js)
 * 负责：章节下拉菜单与级联导航、3D/2D 双引擎联动渲染、实时参数调节、
 *       物理指标监测、MATLAB 代码动态生成、随堂自测与教学大纲总览矩阵。
 */
(function () {
  'use strict';

  const SigSys = window.SigSys;
  if (!SigSys || !Array.isArray(SigSys.chapters) || SigSys.chapters.length === 0) {
    console.error('[SigSys] 章节模块未加载成功，请检查脚本引入顺序。');
    return;
  }

  /* ==================== State ==================== */
  const orderedCases = [];
  const chapterById = {};
  for (const ch of SigSys.chapters) {
    chapterById[ch.id] = ch;
    for (const c of ch.cases) {
      orderedCases.push(c);
    }
  }

  let activeCase = orderedCases[0];
  let currentParams = {};
  let cachedResult = null;
  let lastMetricsSig = '';

  let isPlaying = true;
  let playSpeed = 1.0;
  let animTime = 0;
  let lastFrameTs = performance.now();
  let needsCompute = true;
  let activeCamPreset = '3d';
  let previewChapterId = SigSys.chapters[0].id;
  let currentTheme = 'dark';

  /* ==================== DOM References ==================== */
  const $ = (id) => document.getElementById(id);

  const cascadeWrap = $('cascadeWrap');
  const btnCascade = $('btnCascade');
  const cascadeChapters = $('cascadeChapters');
  const cascadeCases = $('cascadeCases');

  const chapterSelect = $('chapterSelect');
  const caseSelect = $('caseSelect');
  const btnPrevCase = $('btnPrevCase');
  const btnNextCase = $('btnNextCase');

  const btnOpenSyllabus = $('btnOpenSyllabus');
  const btnThemeToggle = $('btnThemeToggle');
  const btnFullscreen = $('btnFullscreen');

  const canvas3d = $('canvas3d');
  const canvas2dLeft = $('canvas2dLeft');
  const canvas2dRight = $('canvas2dRight');
  const scopeStrip = $('scopeStrip');
  const scopeBar = $('scopeBar');
  const scopeToggleLabel = $('scopeToggleLabel');

  const btnAutoRotate = $('btnAutoRotate');
  const btnProjToggle = $('btnProjToggle');
  const btnGridToggle = $('btnGridToggle');
  const btnPlayPause = $('btnPlayPause');
  const speedSelect = $('speedSelect');
  const btnResetAnim = $('btnResetAnim');

  const caseCodeBadge = $('caseCodeBadge');
  const caseLevelBadge = $('caseLevelBadge');
  const caseWeeksTag = $('caseWeeksTag');
  const caseTitle = $('caseTitle');
  const caseSummary = $('caseSummary');

  const presetsCard = $('presetsCard');
  const presetsList = $('presetsList');
  const btnResetParams = $('btnResetParams');
  const controlsStack = $('controlsStack');
  const metricsGrid = $('metricsGrid');

  const theoryFormula = $('theoryFormula');
  const theoryGuide = $('theoryGuide');
  const theoryObjectives = $('theoryObjectives');
  const btnCopyMatlab = $('btnCopyMatlab');
  const matlabCode = $('matlabCode');
  const quizQuestion = $('quizQuestion');
  const quizOptions = $('quizOptions');
  const quizFeedback = $('quizFeedback');

  const syllabusModal = $('syllabusModal');
  const btnCloseSyllabus = $('btnCloseSyllabus');
  const syllabusSearch = $('syllabusSearch');
  const syllabusModalBody = $('syllabusModalBody');
  const toastMsg = $('toastMsg');

  /* ==================== Engines ==================== */
  const engine3d = new SigSys.Engine3D(canvas3d);
  const plotLeft = new SigSys.Plot2D(canvas2dLeft);
  const plotRight = new SigSys.Plot2D(canvas2dRight);

  /* ==================== Helpers ==================== */
  function levelClass(level) {
    if (level === '掌握') return 'level-master';
    if (level === '理解') return 'level-understand';
    if (level === '必做实验') return 'level-lab';
    return 'level-know';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  let toastTimer = null;
  function showToast(text) {
    toastMsg.textContent = text;
    toastMsg.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastMsg.classList.remove('show'), 2200);
  }

  function formatControlValue(ctrl, val) {
    if (ctrl.type === 'select') return '';
    const step = ctrl.step || 0.1;
    let digits = 0;
    if (step < 1) {
      const decPart = String(step).split('.')[1] || '';
      digits = Math.min(3, decPart.length);
    }
    const numStr = Number(val).toFixed(digits);
    return ctrl.unit ? `${numStr} ${ctrl.unit}` : numStr;
  }

  /* ==================== Theme Management ==================== */
  function applyTheme(theme) {
    currentTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    engine3d.setTheme(currentTheme);
    plotLeft.setTheme(currentTheme);
    plotRight.setTheme(currentTheme);
    btnThemeToggle.textContent = currentTheme === 'light' ? '🌙 深色实验台' : '☀️ 教室投影浅色';
    try {
      localStorage.setItem('sigsys_theme', currentTheme);
    } catch (_) {
      /* ignore storage errors in restricted contexts */
    }
    renderPlots2D();
  }

  /* ==================== Navigation & Dropdowns ==================== */
  function populateChapterDropdown() {
    chapterSelect.innerHTML = '';
    for (const ch of SigSys.chapters) {
      const opt = document.createElement('option');
      opt.value = ch.id;
      opt.textContent = `${ch.title} (${ch.cases.length})`;
      chapterSelect.appendChild(opt);
    }
  }

  function populateCaseDropdown(chapterId, selectedCaseId) {
    const ch = chapterById[chapterId];
    if (!ch) return;
    caseSelect.innerHTML = '';
    for (const c of ch.cases) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.title} [${c.level}]`;
      if (c.id === selectedCaseId) opt.selected = true;
      caseSelect.appendChild(opt);
    }
  }

  function renderCascadeMenu() {
    cascadeChapters.innerHTML = '';
    for (const ch of SigSys.chapters) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cascade-ch-item' + (ch.id === previewChapterId ? ' active' : '');
      btn.innerHTML = `
        <span>${escapeHtml(ch.shortTitle || ch.title)}</span>
        <span class="cascade-ch-count">${ch.cases.length}</span>
      `;
      const activateCh = () => {
        previewChapterId = ch.id;
        renderCascadeMenu();
      };
      btn.addEventListener('mouseenter', activateCh);
      btn.addEventListener('click', activateCh);
      cascadeChapters.appendChild(btn);
    }

    const ch = chapterById[previewChapterId] || SigSys.chapters[0];
    cascadeCases.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'cascade-cases-header';
    header.innerHTML = `
      <strong>${escapeHtml(ch.title)}</strong>
      <span>${escapeHtml(ch.weeks || '')}</span>
    `;
    cascadeCases.appendChild(header);

    for (const c of ch.cases) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cascade-case-btn' + (c.id === activeCase.id ? ' current' : '');
      item.innerHTML = `
        <div style="min-width:0;flex:1;">
          <div class="cascade-case-title">${escapeHtml(c.title)}</div>
          <div class="cascade-case-desc">${escapeHtml(c.summary || '')}</div>
        </div>
        <span class="level-badge ${levelClass(c.level)}" style="flex-shrink:0;">${escapeHtml(c.level)}</span>
      `;
      item.addEventListener('click', () => {
        selectCase(c.id);
        cascadeWrap.classList.remove('open');
      });
      cascadeCases.appendChild(item);
    }
  }

  /* ==================== Case Loading ==================== */
  function selectCase(caseId, updateHash = true) {
    const target = SigSys.casesById[caseId];
    if (!target) return;

    activeCase = target;
    previewChapterId = target.chapterId;

    // Sync dropdowns & Prev/Next buttons
    chapterSelect.value = target.chapterId;
    populateCaseDropdown(target.chapterId, target.id);

    const idx = orderedCases.indexOf(target);
    btnPrevCase.disabled = idx <= 0;
    btnNextCase.disabled = idx >= orderedCases.length - 1;
    btnPrevCase.title = idx > 0 ? `上一案例：${orderedCases[idx - 1].title}` : '已是第一个案例';
    btnNextCase.title = idx < orderedCases.length - 1 ? `下一案例：${orderedCases[idx + 1].title}` : '已是最后一个案例';

    // Initialize default parameters
    currentParams = {};
    for (const ctrl of target.controls || []) {
      currentParams[ctrl.key] = ctrl.default;
    }

    // Reset 3D camera to case-recommended orientation
    const wasAutoRotate = engine3d.autoRotate;
    engine3d.setDefaultCamera(target.camera || {});
    engine3d.autoRotate = wasAutoRotate;
    setActiveCameraChip('3d');

    animTime = 0;
    lastMetricsSig = '';
    needsCompute = true;

    // Update Header Meta
    const ch = chapterById[target.chapterId];
    caseCodeBadge.textContent = target.code || target.id;
    caseLevelBadge.textContent = target.level || '掌握';
    caseLevelBadge.className = `level-badge ${levelClass(target.level)}`;
    caseWeeksTag.textContent = ch ? ch.weeks : '';
    caseTitle.textContent = target.title;
    caseSummary.textContent = target.summary || '';

    // Build Presets, Controls, Theory, MATLAB, Quiz
    buildPresetsUI(target);
    buildControlsUI(target);
    buildTheoryUI(target);
    updateMatlabUI();
    buildQuizUI(target);

    // Update URL Hash without scrolling
    if (updateHash) {
      const newHash = `#case=${encodeURIComponent(target.id)}`;
      if (window.location.hash !== newHash) {
        try {
          history.replaceState(null, '', newHash);
        } catch (_) {
          window.location.hash = newHash;
        }
      }
    }

    evaluateCurrentCase();
  }

  function buildPresetsUI(c) {
    presetsList.innerHTML = '';
    if (!c.presets || c.presets.length === 0) {
      presetsCard.style.display = 'none';
      return;
    }
    presetsCard.style.display = '';
    c.presets.forEach((preset, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-pill' + (idx === 0 && matchesPreset(preset.values) ? ' active' : '');
      btn.textContent = preset.label;
      btn.addEventListener('click', () => {
        Object.assign(currentParams, preset.values);
        syncControlsFromParams();
        refreshPresetActiveStates();
        needsCompute = true;
        updateMatlabUI();
        evaluateCurrentCase();
      });
      presetsList.appendChild(btn);
    });
    refreshPresetActiveStates();
  }

  function matchesPreset(values) {
    if (!values) return false;
    for (const k of Object.keys(values)) {
      if (k in currentParams) {
        if (typeof values[k] === 'number') {
          if (Math.abs(Number(currentParams[k]) - values[k]) > 1e-6) return false;
        } else if (String(currentParams[k]) !== String(values[k])) {
          return false;
        }
      }
    }
    return true;
  }

  function refreshPresetActiveStates() {
    if (!activeCase.presets) return;
    const pills = presetsList.querySelectorAll('.preset-pill');
    activeCase.presets.forEach((preset, i) => {
      if (pills[i]) {
        pills[i].classList.toggle('active', matchesPreset(preset.values));
      }
    });
  }

  function buildControlsUI(c) {
    controlsStack.innerHTML = '';
    for (const ctrl of c.controls || []) {
      const wrap = document.createElement('div');
      wrap.className = 'ctrl-item';

      const row = document.createElement('div');
      row.className = 'ctrl-label-row';

      const lbl = document.createElement('label');
      lbl.className = 'ctrl-label';
      lbl.textContent = ctrl.label;
      row.appendChild(lbl);

      if (ctrl.type === 'select') {
        wrap.appendChild(row);
        const sel = document.createElement('select');
        sel.className = 'ctrl-select';
        sel.dataset.key = ctrl.key;
        for (const optObj of ctrl.options || []) {
          const opt = document.createElement('option');
          opt.value = optObj.value;
          opt.textContent = optObj.label;
          if (String(optObj.value) === String(currentParams[ctrl.key])) {
            opt.selected = true;
          }
          sel.appendChild(opt);
        }
        sel.addEventListener('change', () => {
          // Preserve numeric option values if defined as numbers
          const matched = (ctrl.options || []).find((o) => String(o.value) === sel.value);
          currentParams[ctrl.key] = matched ? matched.value : sel.value;
          refreshPresetActiveStates();
          needsCompute = true;
          updateMatlabUI();
          evaluateCurrentCase();
        });
        wrap.appendChild(sel);
      } else {
        const valBadge = document.createElement('span');
        valBadge.className = 'ctrl-val';
        valBadge.id = `ctrl-val-${ctrl.key}`;
        valBadge.textContent = formatControlValue(ctrl, currentParams[ctrl.key]);
        row.appendChild(valBadge);
        wrap.appendChild(row);

        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'ctrl-range';
        input.dataset.key = ctrl.key;
        input.min = ctrl.min;
        input.max = ctrl.max;
        input.step = ctrl.step;
        input.value = currentParams[ctrl.key];

        input.addEventListener('input', () => {
          const num = parseFloat(input.value);
          currentParams[ctrl.key] = num;
          valBadge.textContent = formatControlValue(ctrl, num);
          refreshPresetActiveStates();
          needsCompute = true;
          updateMatlabUI();
          evaluateCurrentCase();
        });
        wrap.appendChild(input);
      }

      controlsStack.appendChild(wrap);
    }
  }

  function syncControlsFromParams() {
    for (const ctrl of activeCase.controls || []) {
      const val = currentParams[ctrl.key];
      const el = controlsStack.querySelector(`[data-key="${ctrl.key}"]`);
      if (el) el.value = String(val);
      const badge = $(`ctrl-val-${ctrl.key}`);
      if (badge) badge.textContent = formatControlValue(ctrl, val);
    }
  }

  function buildTheoryUI(c) {
    const th = c.theory || {};
    theoryFormula.textContent = th.formula || '';
    if (th.guide3d) {
      theoryGuide.style.display = '';
      theoryGuide.innerHTML = `<strong>🧭 三维交互观察指南：</strong>${escapeHtml(th.guide3d)}`;
    } else {
      theoryGuide.style.display = 'none';
    }

    theoryObjectives.innerHTML = '';
    for (const obj of th.objectives || []) {
      const li = document.createElement('li');
      if (obj.startsWith('【课程思政】')) {
        li.innerHTML = `<span class="ideology-tag">课程思政</span>${escapeHtml(obj.replace(/^【课程思政】/, ''))}`;
      } else {
        li.textContent = obj;
      }
      theoryObjectives.appendChild(li);
    }
  }

  function updateMatlabUI() {
    if (typeof activeCase.matlab === 'function') {
      try {
        matlabCode.textContent = activeCase.matlab(currentParams);
      } catch (err) {
        matlabCode.textContent = `% MATLAB 代码生成异常: ${err.message}`;
      }
    } else {
      matlabCode.textContent = '% 当前案例暂无 MATLAB 脚本';
    }
  }

  function buildQuizUI(c) {
    const q = c.quiz;
    quizOptions.innerHTML = '';
    quizFeedback.className = 'quiz-feedback';
    quizFeedback.innerHTML = '';

    if (!q) {
      quizQuestion.textContent = '本案例暂无随堂自测题。';
      return;
    }

    quizQuestion.textContent = q.question;
    const letters = ['A', 'B', 'C', 'D', 'E'];

    (q.options || []).forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${letters[idx] || idx + 1}. ${optText}`;
      btn.addEventListener('click', () => {
        const allBtns = quizOptions.querySelectorAll('.quiz-opt-btn');
        allBtns.forEach((b, j) => {
          b.disabled = true;
          if (j === q.answer) b.classList.add('correct');
        });
        const isRight = idx === q.answer;
        if (!isRight) btn.classList.add('wrong');

        quizFeedback.className = 'quiz-feedback show';
        quizFeedback.innerHTML = isRight
          ? `<strong style="color:var(--accent-emerald);">✔ 回答正确！</strong> ${escapeHtml(q.explanation || '')}`
          : `<strong style="color:var(--accent-rose);">✘ 再想想（正确答案：${letters[q.answer]}）</strong><br>${escapeHtml(q.explanation || '')}`;
      });
      quizOptions.appendChild(btn);
    });
  }

  /* ==================== Compute & Render ==================== */
  function evaluateCurrentCase() {
    if (!activeCase || typeof activeCase.compute !== 'function') return;
    try {
      cachedResult = activeCase.compute(currentParams, animTime);
      needsCompute = false;
      renderMetrics(cachedResult.metrics || []);
      renderPlots2D();
    } catch (err) {
      console.error(`[SigSys] 案例 ${activeCase.id} 计算错误:`, err);
    }
  }

  function renderMetrics(metrics) {
    const sig = JSON.stringify(metrics);
    if (sig === lastMetricsSig) return;
    lastMetricsSig = sig;

    metricsGrid.innerHTML = '';
    for (const m of metrics) {
      const box = document.createElement('div');
      const st = m.status ? ` status-${m.status}` : '';
      box.className = `metric-box${st}`;
      box.innerHTML = `
        <div class="metric-label" title="${escapeHtml(m.label)}">${escapeHtml(m.label)}</div>
        <div class="metric-value">${escapeHtml(m.value)}</div>
      `;
      metricsGrid.appendChild(box);
    }
  }

  function renderPlots2D() {
    if (!cachedResult || scopeStrip.classList.contains('collapsed')) return;
    const plots = cachedResult.plots2d || [];
    if (plots[0]) plotLeft.render(plots[0]);
    if (plots[1]) plotRight.render(plots[1]);
  }

  /* ==================== Animation Loop ==================== */
  function tick(now) {
    const dt = Math.min(0.06, Math.max(0, (now - lastFrameTs) / 1000));
    lastFrameTs = now;

    const isAnimatedCase = activeCase && activeCase.compute && activeCase.compute.length >= 2;
    if (isPlaying && isAnimatedCase) {
      animTime += dt * playSpeed;
      needsCompute = true;
    }

    if (needsCompute) {
      evaluateCurrentCase();
    }

    // Sync autoRotate toggle state if user manually orbited
    if (btnAutoRotate.classList.contains('active') !== engine3d.autoRotate) {
      btnAutoRotate.classList.toggle('active', engine3d.autoRotate);
    }

    if (cachedResult && cachedResult.scene) {
      engine3d.render(cachedResult.scene, now);
    }

    requestAnimationFrame(tick);
  }

  /* ==================== Syllabus Modal ==================== */
  function renderSyllabusModal(keyword = '') {
    const kw = keyword.trim().toLowerCase();
    syllabusModalBody.innerHTML = '';

    for (const ch of SigSys.chapters) {
      const matchedCases = ch.cases.filter((c) => {
        if (!kw) return true;
        const hay = `${ch.title} ${ch.syllabusItems} ${c.id} ${c.code} ${c.title} ${c.summary} ${c.level}`.toLowerCase();
        return hay.includes(kw);
      });

      if (matchedCases.length === 0) continue;

      const block = document.createElement('div');
      block.className = 'syllabus-ch-block';

      const head = document.createElement('div');
      head.className = 'syllabus-ch-head';
      head.innerHTML = `
        <h3>${escapeHtml(ch.title)}</h3>
        <span style="font-size:12px;color:var(--text-secondary);">${escapeHtml(ch.weeks || '')} · 覆盖要点：${escapeHtml(ch.syllabusItems || '')}</span>
      `;
      block.appendChild(head);

      const grid = document.createElement('div');
      grid.className = 'syllabus-cases-grid';

      for (const c of matchedCases) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'cascade-case-btn' + (c.id === activeCase.id ? ' current' : '');
        card.innerHTML = `
          <div style="min-width:0;flex:1;">
            <div class="cascade-case-title">${escapeHtml(c.title)}</div>
            <div class="cascade-case-desc">${escapeHtml(c.summary || '')}</div>
          </div>
          <span class="level-badge ${levelClass(c.level)}" style="flex-shrink:0;">${escapeHtml(c.level)}</span>
        `;
        card.addEventListener('click', () => {
          selectCase(c.id);
          syllabusModal.classList.remove('open');
        });
        grid.appendChild(card);
      }

      block.appendChild(grid);
      syllabusModalBody.appendChild(block);
    }

    if (!syllabusModalBody.children.length) {
      syllabusModalBody.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-secondary);">未找到匹配 “${escapeHtml(keyword)}” 的仿真实验案例。</div>`;
    }
  }

  /* ==================== Event Bindings ==================== */
  function setActiveCameraChip(preset) {
    activeCamPreset = preset;
    document.querySelectorAll('.cam-preset-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cam === preset);
    });
  }

  function bindUIEvents() {
    // Paired Chapter & Case <select>
    chapterSelect.addEventListener('change', () => {
      const ch = chapterById[chapterSelect.value];
      if (ch && ch.cases.length > 0) {
        selectCase(ch.cases[0].id);
      }
    });

    caseSelect.addEventListener('change', () => {
      selectCase(caseSelect.value);
    });

    // Prev / Next case buttons
    btnPrevCase.addEventListener('click', () => {
      const idx = orderedCases.indexOf(activeCase);
      if (idx > 0) selectCase(orderedCases[idx - 1].id);
    });

    btnNextCase.addEventListener('click', () => {
      const idx = orderedCases.indexOf(activeCase);
      if (idx >= 0 && idx < orderedCases.length - 1) selectCase(orderedCases[idx + 1].id);
    });

    // Cascading Chapter-Case Dropdown Menu
    btnCascade.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !cascadeWrap.classList.contains('open');
      if (willOpen) {
        previewChapterId = activeCase.chapterId;
        renderCascadeMenu();
      }
      cascadeWrap.classList.toggle('open', willOpen);
    });

    document.addEventListener('click', (e) => {
      if (!cascadeWrap.contains(e.target)) {
        cascadeWrap.classList.remove('open');
      }
    });

    // Camera Presets
    document.querySelectorAll('.cam-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.cam;
        if (preset === 'reset') {
          engine3d.setCameraPreset('3d');
          setActiveCameraChip('3d');
        } else {
          engine3d.setCameraPreset(preset);
          setActiveCameraChip(preset);
        }
      });
    });

    canvas3d.addEventListener('mousedown', () => {
      if (activeCamPreset !== '3d') setActiveCameraChip('');
    });

    btnAutoRotate.addEventListener('click', () => {
      engine3d.autoRotate = !engine3d.autoRotate;
      btnAutoRotate.classList.toggle('active', engine3d.autoRotate);
    });

    btnProjToggle.addEventListener('click', () => {
      engine3d.showProjections = !engine3d.showProjections;
      btnProjToggle.classList.toggle('active', engine3d.showProjections);
    });

    btnGridToggle.addEventListener('click', () => {
      engine3d.showGrid = !engine3d.showGrid;
      btnGridToggle.classList.toggle('active', engine3d.showGrid);
    });

    // Playback Controls
    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlayPause.textContent = isPlaying ? '⏸ 暂停动态' : '▶ 播放动态';
      btnPlayPause.classList.toggle('active', isPlaying);
    });

    speedSelect.addEventListener('change', () => {
      playSpeed = parseFloat(speedSelect.value) || 1.0;
    });

    btnResetAnim.addEventListener('click', () => {
      animTime = 0;
      needsCompute = true;
      evaluateCurrentCase();
    });

    // Collapse / Expand 2D Companion Oscilloscope Strip
    scopeBar.addEventListener('click', () => {
      const collapsed = scopeStrip.classList.toggle('collapsed');
      scopeToggleLabel.textContent = collapsed ? '展开二维示波器 ▲' : '收起面板 ▼';
      setTimeout(() => {
        engine3d.resize();
        renderPlots2D();
      }, 240);
    });

    // Reset Parameters
    btnResetParams.addEventListener('click', () => {
      for (const ctrl of activeCase.controls || []) {
        currentParams[ctrl.key] = ctrl.default;
      }
      syncControlsFromParams();
      refreshPresetActiveStates();
      needsCompute = true;
      updateMatlabUI();
      evaluateCurrentCase();
      showToast('已恢复当前实验默认参数');
    });

    // Pedagogy Tabs
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-pane').forEach((p) => p.classList.toggle('active', p.id === `tab-${targetTab}`));
      });
    });

    // Copy MATLAB Code
    btnCopyMatlab.addEventListener('click', () => {
      const code = matlabCode.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(
          () => showToast('✅ MATLAB 代码已复制到剪贴板！'),
          () => fallbackCopy(code)
        );
      } else {
        fallbackCopy(code);
      }
    });

    // Syllabus Modal
    btnOpenSyllabus.addEventListener('click', () => {
      syllabusSearch.value = '';
      renderSyllabusModal('');
      syllabusModal.classList.add('open');
      setTimeout(() => syllabusSearch.focus(), 60);
    });

    btnCloseSyllabus.addEventListener('click', () => {
      syllabusModal.classList.remove('open');
    });

    syllabusModal.addEventListener('click', (e) => {
      if (e.target === syllabusModal) syllabusModal.classList.remove('open');
    });

    syllabusSearch.addEventListener('input', () => {
      renderSyllabusModal(syllabusSearch.value);
    });

    // Theme & Fullscreen
    btnThemeToggle.addEventListener('click', () => {
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    // Keyboard shortcuts (Escape closes overlays, Alt+Arrow switches cases)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cascadeWrap.classList.remove('open');
        syllabusModal.classList.remove('open');
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        btnPrevCase.click();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        btnNextCase.click();
      }
    });

    // Hash change listener (back/forward or external hash link)
    window.addEventListener('hashchange', () => {
      const id = parseCaseFromHash();
      if (id && id !== activeCase.id) {
        selectCase(id, false);
      }
    });

    // Responsive Resize Observer
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        engine3d.resize();
        renderPlots2D();
      });
      if (canvas3d.parentElement) ro.observe(canvas3d.parentElement);
      ro.observe(scopeStrip);
    } else {
      window.addEventListener('resize', () => {
        engine3d.resize();
        renderPlots2D();
      });
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('✅ MATLAB 代码已复制到剪贴板！');
    } catch (_) {
      showToast('请手动选中代码复制');
    }
    document.body.removeChild(ta);
  }

  function parseCaseFromHash() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    if (!raw) return null;
    if (raw.startsWith('case=')) {
      const id = decodeURIComponent(raw.slice(5));
      if (SigSys.casesById[id]) return id;
    }
    if (SigSys.casesById[raw]) return raw;
    return null;
  }

  /* ==================== Bootstrap ==================== */
  populateChapterDropdown();
  bindUIEvents();

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('sigsys_theme') || 'dark';
  } catch (_) {
    savedTheme = 'dark';
  }
  applyTheme(savedTheme);

  const initialCaseId = parseCaseFromHash() || orderedCases[0].id;
  selectCase(initialCaseId, false);
  requestAnimationFrame(tick);
})();
