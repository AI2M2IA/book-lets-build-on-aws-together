/* Let's Build on AWS Together — Study Companion
   Static PWA. No frameworks, no analytics, no external requests.
   All rendering via templates + textContent (no innerHTML with data). */
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // Constants & state
  // ---------------------------------------------------------------
  var LS_PRACTICE = 'llat.practice.v1';
  var LS_EXAM = 'llat.exam.v1';
  var LS_EXAM_HISTORY = 'llat.examHistory.v1';
  var LS_CARDS = 'llat.cards.v1';

  var EXAM_DURATION_MS = 130 * 60 * 1000; // 130 minutes
  var EXAM_PASS = 47;
  var EXAM_TOTAL = 65;
  var SESSION_CAP = 30;
  var DAY_MS = 24 * 60 * 60 * 1000;
  var BOX_INTERVALS = { 1: 0, 2: 2 * DAY_MS, 3: 5 * DAY_MS };

  var DOMAIN_LABELS = {
    0: 'Cross-domain',
    1: 'D1 · Secure',
    2: 'D2 · Resilient',
    3: 'D3 · High-Performing',
    4: 'D4 · Cost-Optimized'
  };

  var state = {
    questions: [],
    flashcards: [],
    examQuestions: [],
    mode: 'practice',
    practice: {
      order: [],        // shuffled indices into filtered list
      pos: 0,
      filtered: [],
      answeredThis: false,
      hintsShown: 0
    },
    exam: null,         // running exam state
    examTimerId: null,
    lastResult: null,
    cards: {
      queue: [],
      pos: 0,
      flipped: false,
      gotCount: 0,
      againCount: 0
    }
  };

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full or blocked — degrade silently */ }
  }

  function lsRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* noop */ }
  }

  // Fisher–Yates shuffle (in place, returns array)
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function clearEl(el) {
    el.replaceChildren();
  }

  function mmss(ms) {
    if (ms < 0) ms = 0;
    var totalSec = Math.floor(ms / 1000);
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return String(m) + ':' + (s < 10 ? '0' : '') + String(s);
  }

  function domainLabel(q) {
    if (q.domainLabel) return q.domainLabel;
    return DOMAIN_LABELS[q.domain] || ('Domain ' + q.domain);
  }

  function chapterName(raw) {
    var ch = String(raw).replace(/^0+(?=\d)/, '');
    return ch === '0' ? 'the Introduction' : 'Chapter ' + ch;
  }

  function chapterLine(q) {
    if (!q.sourceChapter) return '';
    return 'Covered in ' + chapterName(q.sourceChapter);
  }

  function sameAnswers(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    var sa = a.slice().sort();
    var sb = b.slice().sort();
    for (var i = 0; i < sa.length; i++) {
      if (sa[i] !== sb[i]) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------
  function loadData() {
    $('loading-view').hidden = false;
    $('error-view').hidden = true;

    return Promise.all([
      fetch('./api/questions.json').then(function (r) {
        if (!r.ok) throw new Error('questions.json HTTP ' + r.status);
        return r.json();
      }),
      fetch('./api/flashcards.json').then(function (r) {
        if (!r.ok) throw new Error('flashcards.json HTTP ' + r.status);
        return r.json();
      })
    ]).then(function (results) {
      var qData = results[0];
      var cData = results[1];
      if (!qData || !Array.isArray(qData.questions)) throw new Error('Bad questions schema');
      if (!cData || !Array.isArray(cData.flashcards)) throw new Error('Bad flashcards schema');

      state.questions = qData.questions;
      state.flashcards = cData.flashcards;
      state.examQuestions = state.questions
        .filter(function (q) { return q.source === 'exam'; })
        .sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });

      $('loading-view').hidden = true;
      initAfterData();
    }).catch(function (err) {
      $('loading-view').hidden = true;
      var view = $('error-view');
      view.hidden = false;
      $('error-detail').textContent =
        'The study data could not be loaded (' + err.message + '). ' +
        'If you are offline, reconnect and try again — once loaded once, the app works offline.';
    });
  }

  // ---------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------
  var TABS = ['practice', 'exam', 'cards'];

  function tabButton(mode) {
    return $('tab-' + (mode === 'cards' ? 'cards' : mode === 'exam' ? 'exam' : 'practice'));
  }

  function switchMode(mode) {
    state.mode = mode;
    TABS.forEach(function (m) {
      var btn = $('tab-' + m);
      var panel = $('panel-' + m);
      var selected = (m === mode);
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
    });
    if (mode === 'practice') refreshPracticeFilter(false);
    if (mode === 'exam') refreshExamHome();
    if (mode === 'cards') refreshCardsHome();
  }

  function setupTabs() {
    TABS.forEach(function (m) {
      $('tab-' + m).addEventListener('click', function () { switchMode(m); });
    });
    // Arrow-key navigation within the tablist
    document.querySelector('.tabs').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var idx = TABS.indexOf(state.mode);
      var next = e.key === 'ArrowRight'
        ? (idx + 1) % TABS.length
        : (idx + TABS.length - 1) % TABS.length;
      switchMode(TABS[next]);
      $('tab-' + TABS[next]).focus();
      e.preventDefault();
    });
  }

  // ---------------------------------------------------------------
  // Shared question rendering
  // ---------------------------------------------------------------
  // Renders a question card into container. opts:
  //  counterText, showHints (bool), instantFeedback (bool),
  //  preselected (array of keys), onAnswerChange(keys), onSubmit(keys), onNext()
  function renderQuestionCard(container, q, opts) {
    clearEl(container);
    var tpl = $('tpl-question');
    var node = tpl.content.cloneNode(true);
    var card = node.querySelector('.question-card');

    node.querySelector('.badge-domain').textContent = domainLabel(q);
    node.querySelector('.badge-type').textContent =
      q.type === 'select_two' ? 'Choose TWO' : 'Choose one';
    node.querySelector('.q-counter').textContent = opts.counterText || '';
    node.querySelector('.q-stem').textContent = q.stem;

    var fieldset = node.querySelector('.q-options');
    var inputType = q.type === 'select_two' ? 'checkbox' : 'radio';
    var optTpl = $('tpl-option');

    q.options.forEach(function (opt) {
      var optNode = optTpl.content.cloneNode(true);
      var input = optNode.querySelector('.option-input');
      input.type = inputType;
      input.value = opt.key;
      input.name = 'answer-' + q.id;
      if (opts.preselected && opts.preselected.indexOf(opt.key) !== -1) {
        input.checked = true;
      }
      optNode.querySelector('.option-key').textContent = opt.key + '.';
      optNode.querySelector('.option-text').textContent = opt.text;
      fieldset.appendChild(optNode);
    });

    function selectedKeys() {
      var keys = [];
      fieldset.querySelectorAll('.option-input').forEach(function (inp) {
        if (inp.checked) keys.push(inp.value);
      });
      return keys;
    }

    // Enforce max 2 for select_two
    fieldset.addEventListener('change', function (e) {
      if (q.type === 'select_two') {
        var keys = selectedKeys();
        if (keys.length > 2 && e.target && e.target.checked) {
          e.target.checked = false;
          keys = selectedKeys();
        }
      }
      if (opts.onAnswerChange) opts.onAnswerChange(selectedKeys());
      var submitBtn = card.querySelector('.q-submit');
      if (submitBtn && !submitBtn.hidden) {
        submitBtn.disabled = !validSelection(q, selectedKeys());
      }
    });

    // Hints
    var hintBtn = node.querySelector('.q-hint-btn');
    var hintList = node.querySelector('.q-hints');
    var hints = Array.isArray(q.hints) ? q.hints : [];
    if (opts.showHints && hints.length > 0) {
      hintBtn.hidden = false;
      hintBtn.textContent = '💡 Hint (1 of ' + hints.length + ')';
      var shown = 0;
      hintBtn.addEventListener('click', function () {
        if (shown >= hints.length) return;
        var li = document.createElement('li');
        li.textContent = hints[shown];
        hintList.appendChild(li);
        shown++;
        if (shown >= hints.length) {
          hintBtn.hidden = true;
        } else {
          hintBtn.textContent = '💡 Hint (' + (shown + 1) + ' of ' + hints.length + ')';
        }
      });
    }

    var submitBtn = node.querySelector('.q-submit');
    var nextBtn = node.querySelector('.q-next');

    if (opts.instantFeedback) {
      submitBtn.disabled = true;
      submitBtn.addEventListener('click', function () {
        var keys = selectedKeys();
        if (!validSelection(q, keys)) return;
        if (opts.onSubmit) opts.onSubmit(keys, card);
      });
      nextBtn.addEventListener('click', function () {
        if (opts.onNext) opts.onNext();
      });
    } else {
      // Exam mode: no submit button, selection is recorded on change
      submitBtn.hidden = true;
      nextBtn.hidden = true;
    }

    container.appendChild(node);
    return card;
  }

  function validSelection(q, keys) {
    if (q.type === 'select_two') return keys.length === 2;
    return keys.length === 1;
  }

  // Show feedback inside a rendered card (practice mode)
  function showFeedback(card, q, pickedKeys) {
    var correct = sameAnswers(pickedKeys, q.answers);

    // Lock + color options
    card.querySelectorAll('.option').forEach(function (label) {
      var input = label.querySelector('.option-input');
      input.disabled = true;
      label.classList.add('opt-locked');
      var key = input.value;
      if (q.answers.indexOf(key) !== -1) {
        label.classList.add('opt-correct');
      } else if (pickedKeys.indexOf(key) !== -1) {
        label.classList.add('opt-wrong-picked');
      }
    });

    var submitBtn = card.querySelector('.q-submit');
    submitBtn.hidden = true;
    var nextBtn = card.querySelector('.q-next');
    nextBtn.hidden = false;
    var hintBtn = card.querySelector('.q-hint-btn');
    if (hintBtn) hintBtn.hidden = true;

    var fb = card.querySelector('.q-feedback');
    var tpl = $('tpl-feedback');
    var node = tpl.content.cloneNode(true);

    var verdict = node.querySelector('.feedback-verdict');
    verdict.textContent = correct
      ? '✓ Correct!'
      : '✗ Not quite. Correct answer: ' + q.answers.join(' and ');
    verdict.classList.add(correct ? 'ok' : 'bad');

    node.querySelector('.feedback-explanation').textContent = q.explanation || '';

    fillWhyNots(node.querySelector('.feedback-whynots'), q, pickedKeys);

    node.querySelector('.feedback-chapter').textContent = chapterLine(q);

    clearEl(fb);
    fb.appendChild(node);
    nextBtn.focus();
    return correct;
  }

  // Fill a UL with why-nots for all wrong options; highlight ones the user picked.
  function fillWhyNots(ul, q, pickedKeys) {
    clearEl(ul);
    var whyNots = q.whyNots || {};
    q.options.forEach(function (opt) {
      if (q.answers.indexOf(opt.key) !== -1) return; // skip correct options
      var why = whyNots[opt.key];
      if (!why) return;
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      var picked = pickedKeys && pickedKeys.indexOf(opt.key) !== -1;
      strong.textContent = picked ? ('Why not ' + opt.key + ' (your pick): ') : ('Why not ' + opt.key + ': ');
      li.appendChild(strong);
      li.appendChild(document.createTextNode(why));
      if (picked) li.classList.add('whynot-picked');
      ul.appendChild(li);
    });
  }

  // ===============================================================
  // PRACTICE MODE
  // ===============================================================
  function practiceProgress() {
    return lsGet(LS_PRACTICE, {});
  }

  function savePracticeResult(qid, correct) {
    var prog = practiceProgress();
    var rec = prog[qid] || { attempts: 0, correct: 0 };
    rec.attempts++;
    if (correct) rec.correct++;
    rec.last = correct ? 'correct' : 'wrong';
    prog[qid] = rec;
    lsSet(LS_PRACTICE, prog);
  }

  function practiceFilterQuestions() {
    var dom = $('practice-domain').value;
    var src = $('practice-source').value;
    return state.questions.filter(function (q) {
      if (dom !== 'all' && String(q.domain) !== dom) return false;
      if (src !== 'all' && q.source !== src) return false;
      return true;
    });
  }

  function refreshPracticeFilter(reshuffle) {
    var filtered = practiceFilterQuestions();
    var changed = reshuffle ||
      state.practice.filtered.length !== filtered.length ||
      state.practice.order.length === 0;

    if (changed) {
      state.practice.filtered = filtered;
      state.practice.order = shuffle(filtered.map(function (_, i) { return i; }));
      state.practice.pos = 0;
    }

    updatePracticeStats();

    var area = $('practice-question-area');
    if (filtered.length === 0) {
      clearEl(area);
      $('practice-empty').hidden = false;
      return;
    }
    $('practice-empty').hidden = true;
    renderPracticeQuestion();
  }

  function updatePracticeStats() {
    var prog = practiceProgress();
    var answered = 0;
    var correct = 0;
    state.practice.filtered.forEach(function (q) {
      var rec = prog[q.id];
      if (rec && rec.attempts > 0) {
        answered++;
        if (rec.last === 'correct') correct++;
      }
    });
    var el = $('practice-stats');
    clearEl(el);
    var s1 = document.createElement('span');
    s1.textContent = 'Answered ';
    var b1 = document.createElement('strong');
    b1.textContent = answered + '/' + state.practice.filtered.length;
    var s2 = document.createElement('span');
    s2.textContent = ' · Correct ';
    var b2 = document.createElement('strong');
    b2.textContent = String(correct);
    el.appendChild(s1); el.appendChild(b1); el.appendChild(s2); el.appendChild(b2);
  }

  function renderPracticeQuestion() {
    var p = state.practice;
    if (p.order.length === 0) return;
    var idx = p.order[p.pos % p.order.length];
    var q = p.filtered[idx];
    var area = $('practice-question-area');

    renderQuestionCard(area, q, {
      counterText: 'Question ' + ((p.pos % p.order.length) + 1) + ' of ' + p.order.length,
      showHints: true,
      instantFeedback: true,
      onSubmit: function (keys, card) {
        var correct = showFeedback(card, q, keys);
        savePracticeResult(q.id, correct);
        updatePracticeStats();
      },
      onNext: function () {
        p.pos++;
        if (p.pos >= p.order.length) {
          // re-shuffle for a fresh pass
          shuffle(p.order);
          p.pos = 0;
        }
        renderPracticeQuestion();
      }
    });
  }

  function setupPractice() {
    $('practice-domain').addEventListener('change', function () { refreshPracticeFilter(true); });
    $('practice-source').addEventListener('change', function () { refreshPracticeFilter(true); });
    $('practice-reset').addEventListener('click', function () {
      if (window.confirm('Reset all practice progress? This cannot be undone.')) {
        lsRemove(LS_PRACTICE);
        updatePracticeStats();
      }
    });
  }

  // ===============================================================
  // EXAM SIMULATION
  // ===============================================================
  function savedExam() {
    var ex = lsGet(LS_EXAM, null);
    if (!ex || !ex.startedAt || !Array.isArray(ex.responses)) return null;
    return ex;
  }

  function examTimeLeft(ex) {
    return EXAM_DURATION_MS - (Date.now() - ex.startedAt);
  }

  function refreshExamHome() {
    if (state.exam) return; // already running, don't disturb
    var ex = savedExam();
    var resumable = ex && examTimeLeft(ex) > 0;
    $('exam-resume').hidden = !resumable;
    $('exam-intro').hidden = false;
    $('exam-running').hidden = true;
    $('exam-results').hidden = true;
    renderExamHistory();
    // Expired saved exam: auto-grade it as a timed-out attempt so the
    // answers given before the timer ran out are not silently lost.
    if (ex && !resumable) {
      if (state.examQuestions.length === EXAM_TOTAL &&
          Array.isArray(ex.responses) && ex.responses.length === EXAM_TOTAL) {
        state.exam = ex;
        finishExam(true); // grades, records history, clears storage, shows results
      } else {
        lsRemove(LS_EXAM); // incompatible/corrupted saved state: discard safely
      }
    }
  }

  function renderExamHistory() {
    var history = lsGet(LS_EXAM_HISTORY, []);
    var card = $('exam-history-card');
    var list = $('exam-history-list');
    if (!Array.isArray(history) || history.length === 0) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    clearEl(list);
    history.slice().reverse().forEach(function (h) {
      var li = document.createElement('li');
      var left = document.createElement('span');
      var d = new Date(h.date);
      left.textContent = d.toLocaleDateString() + ' ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var right = document.createElement('span');
      right.textContent = h.score + '/' + EXAM_TOTAL + ' (' + h.pct + '%) — ' + (h.pass ? 'PASS' : 'NOT YET');
      right.className = h.pass ? 'history-pass' : 'history-fail';
      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
  }

  function startExam(resume) {
    var ex;
    if (resume) {
      ex = savedExam();
      if (!ex || examTimeLeft(ex) <= 0) { refreshExamHome(); return; }
    } else {
      ex = {
        startedAt: Date.now(),
        current: 0,
        responses: state.examQuestions.map(function () { return []; }),
        flags: state.examQuestions.map(function () { return false; })
      };
      lsSet(LS_EXAM, ex);
    }
    state.exam = ex;
    $('exam-intro').hidden = true;
    $('exam-results').hidden = true;
    $('exam-running').hidden = false;
    buildExamGrid();
    renderExamQuestion();
    startExamTimer();
  }

  function startExamTimer() {
    stopExamTimer();
    var lowWarned = false;
    var announcedMilestones = {};
    function tick() {
      if (!state.exam) { stopExamTimer(); return; }
      var left = examTimeLeft(state.exam);
      var timerEl = $('exam-timer');
      timerEl.textContent = mmss(left);
      if (left < 15 * 60 * 1000 && !lowWarned) {
        timerEl.classList.add('timer-low');
        lowWarned = true;
      }
      // Screen-reader milestones (separate polite region, sparse updates)
      var minLeft = Math.ceil(left / 60000);
      [60, 30, 15, 5, 1].forEach(function (m) {
        if (minLeft === m && !announcedMilestones[m]) {
          announcedMilestones[m] = true;
          $('exam-timer-announce').textContent = m + (m === 1 ? ' minute' : ' minutes') + ' remaining';
        }
      });
      if (left <= 0) {
        stopExamTimer();
        finishExam(true);
      }
    }
    tick();
    state.examTimerId = window.setInterval(tick, 1000);
  }

  function stopExamTimer() {
    if (state.examTimerId) {
      window.clearInterval(state.examTimerId);
      state.examTimerId = null;
    }
    var timerEl = $('exam-timer');
    if (timerEl) timerEl.classList.remove('timer-low');
  }

  function buildExamGrid() {
    var grid = $('exam-grid');
    clearEl(grid);
    state.examQuestions.forEach(function (_, i) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'grid-cell';
      cell.textContent = String(i + 1);
      cell.setAttribute('aria-label', 'Go to question ' + (i + 1));
      cell.addEventListener('click', function () {
        state.exam.current = i;
        persistExam();
        renderExamQuestion();
      });
      grid.appendChild(cell);
    });
    updateExamGrid();
  }

  function updateExamGrid() {
    var ex = state.exam;
    if (!ex) return;
    var cells = $('exam-grid').querySelectorAll('.grid-cell');
    var answeredCount = 0;
    cells.forEach(function (cell, i) {
      var answered = ex.responses[i] && ex.responses[i].length > 0;
      if (answered) answeredCount++;
      cell.classList.toggle('cell-answered', answered);
      cell.classList.toggle('cell-flagged', !!ex.flags[i]);
      cell.classList.toggle('cell-current', i === ex.current);
      cell.setAttribute('aria-current', i === ex.current ? 'true' : 'false');
    });
    $('exam-progress').textContent =
      'Q ' + (ex.current + 1) + '/' + EXAM_TOTAL + ' · ' + answeredCount + ' answered';
    var flagBtn = $('exam-flag');
    var flagged = !!ex.flags[ex.current];
    flagBtn.textContent = flagged ? '🚩 Unflag' : '🚩 Flag';
    flagBtn.classList.toggle('exam-flagged-on', flagged);
    flagBtn.setAttribute('aria-pressed', flagged ? 'true' : 'false');
    $('exam-prev').disabled = ex.current === 0;
    $('exam-next').disabled = ex.current === EXAM_TOTAL - 1;
  }

  function persistExam() {
    if (state.exam) lsSet(LS_EXAM, state.exam);
  }

  function renderExamQuestion() {
    var ex = state.exam;
    var q = state.examQuestions[ex.current];
    var area = $('exam-question-area');
    renderQuestionCard(area, q, {
      counterText: 'Question ' + (ex.current + 1) + ' of ' + EXAM_TOTAL,
      showHints: false,
      instantFeedback: false,
      preselected: ex.responses[ex.current],
      onAnswerChange: function (keys) {
        ex.responses[ex.current] = keys;
        persistExam();
        updateExamGrid();
      }
    });
    updateExamGrid();
  }

  function finishExam(auto) {
    var ex = state.exam;
    if (!ex) return;

    if (!auto) {
      var unanswered = ex.responses.filter(function (r) { return !r || r.length === 0; }).length;
      if (unanswered > 0) {
        var ok = window.confirm(
          'You have ' + unanswered + ' unanswered question' + (unanswered === 1 ? '' : 's') +
          '. Finish anyway? Unanswered questions count as incorrect.');
        if (!ok) return;
      } else {
        if (!window.confirm('Submit your exam? You will not be able to change answers.')) return;
      }
    }

    stopExamTimer();

    // Grade
    var score = 0;
    var perDomain = {}; // domain -> {correct, total}
    var details = [];
    state.examQuestions.forEach(function (q, i) {
      var picked = ex.responses[i] || [];
      var correct = sameAnswers(picked, q.answers); // no partial credit
      if (correct) score++;
      var d = q.domain;
      if (!perDomain[d]) perDomain[d] = { correct: 0, total: 0 };
      perDomain[d].total++;
      if (correct) perDomain[d].correct++;
      details.push({ q: q, picked: picked, correct: correct });
    });

    var elapsed = Math.min(Date.now() - ex.startedAt, EXAM_DURATION_MS);
    var pct = Math.round((score / EXAM_TOTAL) * 100);
    var pass = score >= EXAM_PASS;

    state.lastResult = { score: score, pct: pct, pass: pass, elapsed: elapsed, perDomain: perDomain, details: details, auto: !!auto };

    // History
    var history = lsGet(LS_EXAM_HISTORY, []);
    if (!Array.isArray(history)) history = [];
    history.push({ date: Date.now(), score: score, pct: pct, pass: pass });
    if (history.length > 20) history = history.slice(history.length - 20);
    lsSet(LS_EXAM_HISTORY, history);

    lsRemove(LS_EXAM);
    state.exam = null;

    renderExamResults();
  }

  function renderExamResults() {
    var r = state.lastResult;
    if (!r) return;
    $('exam-running').hidden = true;
    $('exam-intro').hidden = true;
    $('exam-results').hidden = false;
    $('exam-review').hidden = true;

    var card = $('exam-results').querySelector('.result-card');
    card.classList.toggle('result-pass', r.pass);
    card.classList.toggle('result-fail', !r.pass);

    $('result-headline').textContent = r.pass ? 'PASS 🎉' : 'NOT YET — keep building!';
    $('result-score').textContent = r.score + ' / ' + EXAM_TOTAL + ' correct (' + r.pct + '%) · passing benchmark ' + EXAM_PASS + '/' + EXAM_TOTAL;
    $('result-time').textContent =
      (r.auto ? 'Time expired — auto-submitted. ' : '') +
      'Time used: ' + mmss(r.elapsed) + ' of 130:00';

    var ul = $('result-domains');
    clearEl(ul);
    Object.keys(r.perDomain).sort().forEach(function (d) {
      var pd = r.perDomain[d];
      var pctD = pd.total ? Math.round((pd.correct / pd.total) * 100) : 0;
      var li = document.createElement('li');
      var label = document.createElement('span');
      label.textContent = (DOMAIN_LABELS[d] || ('Domain ' + d)) + ': ' + pd.correct + '/' + pd.total + ' (' + pctD + '%)';
      var bar = document.createElement('div');
      bar.className = 'bd-bar';
      var fill = document.createElement('div');
      fill.className = 'bd-fill';
      fill.style.width = pctD + '%';
      bar.appendChild(fill);
      li.appendChild(label);
      li.appendChild(bar);
      ul.appendChild(li);
    });
  }

  function renderExamReview() {
    var r = state.lastResult;
    if (!r) return;
    var wrap = $('exam-review');
    wrap.hidden = false;
    clearEl(wrap);
    var tpl = $('tpl-review-item');

    r.details.forEach(function (det, i) {
      var q = det.q;
      var node = tpl.content.cloneNode(true);
      node.querySelector('.review-num').textContent = 'Q' + (i + 1);
      node.querySelector('.badge-domain').textContent = domainLabel(q);
      var verdict = node.querySelector('.review-verdict');
      verdict.textContent = det.correct ? 'Correct' : (det.picked.length ? 'Incorrect' : 'Unanswered');
      verdict.classList.add(det.correct ? 'ok' : 'bad');
      node.querySelector('.q-stem').textContent = q.stem;

      var optsUl = node.querySelector('.review-options');
      q.options.forEach(function (opt) {
        var li = document.createElement('li');
        li.textContent = opt.key + '. ' + opt.text;
        var isCorrect = q.answers.indexOf(opt.key) !== -1;
        var isPicked = det.picked.indexOf(opt.key) !== -1;
        if (isCorrect) {
          li.classList.add('rv-correct');
          var tag = document.createElement('span');
          tag.className = 'rv-tag';
          tag.textContent = isPicked ? 'Correct · your answer' : 'Correct answer';
          li.appendChild(tag);
        } else if (isPicked) {
          li.classList.add('rv-yours-wrong');
          var tag2 = document.createElement('span');
          tag2.className = 'rv-tag';
          tag2.textContent = 'Your answer';
          li.appendChild(tag2);
        }
        optsUl.appendChild(li);
      });

      node.querySelector('.feedback-explanation').textContent = q.explanation || '';
      fillWhyNots(node.querySelector('.feedback-whynots'), q, det.picked);
      node.querySelector('.feedback-chapter').textContent = chapterLine(q);
      wrap.appendChild(node);
    });
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setupExam() {
    $('exam-start').addEventListener('click', function () {
      var ex = savedExam();
      if (ex && examTimeLeft(ex) > 0) {
        if (!window.confirm('You have an exam in progress. Starting a new one discards it. Continue?')) return;
        lsRemove(LS_EXAM);
      }
      startExam(false);
    });
    $('exam-resume').addEventListener('click', function () { startExam(true); });
    $('exam-finish').addEventListener('click', function () { finishExam(false); });
    $('exam-prev').addEventListener('click', function () {
      if (state.exam && state.exam.current > 0) {
        state.exam.current--;
        persistExam();
        renderExamQuestion();
      }
    });
    $('exam-next').addEventListener('click', function () {
      if (state.exam && state.exam.current < EXAM_TOTAL - 1) {
        state.exam.current++;
        persistExam();
        renderExamQuestion();
      }
    });
    $('exam-flag').addEventListener('click', function () {
      if (!state.exam) return;
      state.exam.flags[state.exam.current] = !state.exam.flags[state.exam.current];
      persistExam();
      updateExamGrid();
    });
    $('exam-review-btn').addEventListener('click', renderExamReview);
    $('exam-again-btn').addEventListener('click', function () {
      state.lastResult = null;
      refreshExamHome();
    });
  }

  // ===============================================================
  // FLASHCARDS (Leitner, 3 boxes)
  // ===============================================================
  function cardsState() {
    var s = lsGet(LS_CARDS, {});
    return (s && typeof s === 'object') ? s : {};
  }

  function cardRecord(s, id) {
    var rec = s[id];
    if (!rec || typeof rec.box !== 'number') {
      return { box: 1, last: 0 };
    }
    return rec;
  }

  function isDue(rec, now) {
    var box = Math.min(Math.max(rec.box, 1), 3);
    if (box === 1) return true;
    return (now - (rec.last || 0)) >= BOX_INTERVALS[box];
  }

  function cardsFiltered() {
    var dom = $('cards-domain').value;
    return state.flashcards.filter(function (c) {
      if (dom !== 'all' && String(c.domain) !== dom) return false;
      return true;
    });
  }

  function refreshCardsHome() {
    $('cards-home').hidden = false;
    $('cards-session').hidden = true;
    $('cards-done').hidden = true;
    updateCardsStats();
  }

  function updateCardsStats() {
    var s = cardsState();
    var now = Date.now();
    var filtered = cardsFiltered();
    var boxes = { 1: 0, 2: 0, 3: 0 };
    var due = 0;
    filtered.forEach(function (c) {
      var rec = cardRecord(s, c.id);
      var box = Math.min(Math.max(rec.box, 1), 3);
      boxes[box]++;
      if (isDue(rec, now)) due++;
    });
    var el = $('cards-stats');
    clearEl(el);
    [1, 2, 3].forEach(function (b) {
      var span = document.createElement('span');
      span.className = 'box-stat';
      var strong = document.createElement('strong');
      strong.textContent = String(boxes[b]);
      span.appendChild(document.createTextNode('Box ' + b + ': '));
      span.appendChild(strong);
      el.appendChild(span);
    });
    var dueSpan = document.createElement('span');
    dueSpan.className = 'box-stat';
    var dueStrong = document.createElement('strong');
    dueStrong.textContent = String(due);
    dueSpan.appendChild(document.createTextNode('Due now: '));
    dueSpan.appendChild(dueStrong);
    el.appendChild(dueSpan);
    $('cards-none-due').hidden = due > 0;
    $('cards-start').disabled = due === 0;
  }

  function startCardsSession() {
    var s = cardsState();
    var now = Date.now();
    var eligible = cardsFiltered().filter(function (c) {
      return isDue(cardRecord(s, c.id), now);
    });
    if (eligible.length === 0) { updateCardsStats(); return; }
    shuffle(eligible);
    state.cards.queue = eligible.slice(0, SESSION_CAP);
    state.cards.pos = 0;
    state.cards.flipped = false;
    state.cards.gotCount = 0;
    state.cards.againCount = 0;
    $('cards-home').hidden = true;
    $('cards-done').hidden = true;
    $('cards-session').hidden = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    var c = state.cards.queue[state.cards.pos];
    var btn = $('flashcard');
    clearEl(btn);
    $('cards-progress').textContent =
      'Card ' + (state.cards.pos + 1) + ' of ' + state.cards.queue.length;

    var face = document.createElement('div');
    face.className = 'fc-face';

    if (!state.cards.flipped) {
      var term = document.createElement('div');
      term.className = 'fc-term';
      term.textContent = c.term;
      var badge = document.createElement('span');
      badge.className = 'badge badge-domain';
      badge.textContent = DOMAIN_LABELS[c.domain] || ('Domain ' + c.domain);
      face.appendChild(term);
      face.appendChild(badge);
      btn.setAttribute('aria-label', 'Flashcard front: ' + c.term + '. Activate to flip.');
    } else {
      var def = document.createElement('div');
      def.className = 'fc-definition';
      def.textContent = c.definition;
      face.appendChild(def);
      if (c.analogy) {
        var an = document.createElement('div');
        an.className = 'fc-analogy';
        var lbl = document.createElement('span');
        lbl.className = 'fc-analogy-label';
        lbl.textContent = "The book's analogy";
        an.appendChild(lbl);
        an.appendChild(document.createTextNode(c.analogy));
        face.appendChild(an);
      }
      if (c.sourceChapter) {
        var ch = document.createElement('div');
        ch.className = 'fc-chapter';
        ch.textContent = chapterName(c.sourceChapter);
        face.appendChild(ch);
      }
      btn.setAttribute('aria-label', 'Flashcard back for ' + c.term);
    }
    btn.appendChild(face);
    $('card-actions').hidden = !state.cards.flipped;
  }

  function flipCard() {
    if (state.cards.queue.length === 0) return;
    state.cards.flipped = !state.cards.flipped;
    renderFlashcard();
  }

  function gradeCard(gotIt) {
    var c = state.cards.queue[state.cards.pos];
    var s = cardsState();
    var rec = cardRecord(s, c.id);
    if (gotIt) {
      rec.box = Math.min(rec.box + 1, 3);
      state.cards.gotCount++;
    } else {
      rec.box = 1;
      state.cards.againCount++;
    }
    rec.last = Date.now();
    s[c.id] = rec;
    lsSet(LS_CARDS, s);

    state.cards.pos++;
    state.cards.flipped = false;
    if (state.cards.pos >= state.cards.queue.length) {
      endCardsSession();
    } else {
      renderFlashcard();
    }
  }

  function endCardsSession() {
    $('cards-session').hidden = true;
    $('cards-done').hidden = false;
    var reviewed = state.cards.gotCount + state.cards.againCount;
    $('cards-done-summary').textContent =
      'You reviewed ' + reviewed + ' card' + (reviewed === 1 ? '' : 's') +
      ' — ' + state.cards.gotCount + ' got it, ' + state.cards.againCount + ' to see again.';
  }

  function setupCards() {
    $('cards-domain').addEventListener('change', updateCardsStats);
    $('cards-start').addEventListener('click', startCardsSession);
    $('flashcard').addEventListener('click', flipCard);
    $('card-again').addEventListener('click', function () { gradeCard(false); });
    $('card-got').addEventListener('click', function () { gradeCard(true); });
    $('cards-end').addEventListener('click', function () {
      if (state.cards.gotCount + state.cards.againCount > 0) {
        endCardsSession();
      } else {
        refreshCardsHome();
      }
    });
    $('cards-back').addEventListener('click', refreshCardsHome);
    $('cards-reset').addEventListener('click', function () {
      if (window.confirm('Reset all flashcard boxes back to Box 1? This cannot be undone.')) {
        lsRemove(LS_CARDS);
        updateCardsStats();
      }
    });
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  function initAfterData() {
    switchMode('practice');
  }

  function init() {
    setupTabs();
    setupPractice();
    setupExam();
    setupCards();
    $('retry-load').addEventListener('click', loadData);
    loadData();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        /* SW registration failure is non-fatal */
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
