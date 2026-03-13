(function () {

  var trials = 0;
  var correct = 0;
  var sumRT = 0.0;
  var avgRT = 0.0;
  var stimulus = '';
  var expected = '';
  var startTime = 0;
  var running = true;

  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var digits = '0123456789'.split('');

  var stimulusWrapper = document.querySelector('.stimulus-wrapper');
  var stimulusEl = document.getElementById('stimulus');
  var summaryEl = document.getElementById('summary');
  var statTrials = document.getElementById('stat-trials');
  var statCorrect = document.getElementById('stat-correct');
  var statMistakes = document.getElementById('stat-mistakes');
  var statAccuracy = document.getElementById('stat-accuracy');
  var statAvgRT = document.getElementById('stat-avgRT');
  var btnLetter = document.getElementById('btn-letter');
  var btnReset = document.getElementById('btn-reset');
  var btnNumber = document.getElementById('btn-number');
  var inputMaxTrials = document.getElementById('input-max-trials');
  var inputMaxMistakes = document.getElementById('input-max-mistakes');
  var statTrialsLimit = document.getElementById('stat-trials-limit');
  var statMistakesLimit = document.getElementById('stat-mistakes-limit');
  var progressWrap = document.getElementById('progress-wrap');
  var progressBar = document.getElementById('progress-bar');

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateAndShowStimulus() {
    if (Math.random() < 0.5) {
      stimulus = pickRandom(letters);
      expected = 'A';
    } else {
      stimulus = pickRandom(digits);
      expected = 'L';
    }
    stimulusEl.textContent = stimulus;
    startTime = performance.now();
  }

  function getMaxTrials() {
    var n = parseInt(inputMaxTrials && inputMaxTrials.value, 10);
    return (n > 0) ? n : 0;
  }

  function getMaxMistakes() {
    var n = parseInt(inputMaxMistakes && inputMaxMistakes.value, 10);
    return (n > 0) ? n : 0;
  }

  function updateStats() {
    var mistakes = trials - correct;
    var maxT = getMaxTrials();
    var maxM = getMaxMistakes();

    statTrials.textContent = trials;
    if (statTrialsLimit) {
      statTrialsLimit.textContent = maxT > 0 ? ' / ' + maxT : '';
    }
    statCorrect.textContent = correct;
    if (statMistakes) statMistakes.textContent = mistakes;
    if (statMistakesLimit) {
      statMistakesLimit.textContent = maxM > 0 ? ' / ' + maxM : '';
    }
    if (statAccuracy) statAccuracy.textContent = trials > 0 ? ((correct / trials) * 100).toFixed(1) : '—';
    if (trials > 0) {
      statAvgRT.textContent = (sumRT / trials).toFixed(0);
    } else {
      statAvgRT.textContent = '—';
    }

    if (progressWrap && progressBar) {
      if (maxT > 0) {
        progressWrap.classList.remove('hidden');
        var pct = Math.min(100, (trials / maxT) * 100);
        progressBar.style.width = pct + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(pct));
      } else if (maxM > 0) {
        progressWrap.classList.remove('hidden');
        var pct = Math.min(100, (mistakes / maxM) * 100);
        progressBar.style.width = pct + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(pct));
      } else {
        progressWrap.classList.add('hidden');
      }
    }
  }

  function showStimulusView() {
    if (summaryEl) summaryEl.classList.add('hidden');
    if (stimulusWrapper) stimulusWrapper.classList.remove('hidden');
  }

  function showSummary() {
    if (stimulusWrapper) stimulusWrapper.classList.add('hidden');
    if (summaryEl) {
      summaryEl.classList.remove('hidden');
      var mistakes = trials - correct;
      var accuracy = trials > 0 ? ((correct / trials) * 100).toFixed(1) : '—';
      var avg = trials > 0 ? (sumRT / trials).toFixed(0) : '—';
      summaryEl.innerHTML =
        '<h2 class="summary-title">Session ended</h2>' +
        '<dl class="summary-stats">' +
        '<div class="summary-row"><dt>Trials</dt><dd>' + trials + '</dd></div>' +
        '<div class="summary-row"><dt>Correct</dt><dd>' + correct + '</dd></div>' +
        '<div class="summary-row"><dt>Mistakes</dt><dd>' + mistakes + '</dd></div>' +
        '<div class="summary-row"><dt>Accuracy</dt><dd>' + accuracy + '%</dd></div>' +
        '<div class="summary-row"><dt>Avg RT</dt><dd>' + avg + ' ms</dd></div>' +
        '</dl>';
    }
  }

  function endRun() {
    running = false;
    showSummary();
  }

  function reset() {
    trials = 0;
    correct = 0;
    sumRT = 0.0;
    avgRT = 0.0;
    running = true;
    showStimulusView();
    updateStats();
    generateAndShowStimulus();
  }

  function handleResponse(key) {
    if (!running || (key !== 'A' && key !== 'L')) return;

    var endTime = performance.now();
    var rt = endTime - startTime;
    var wasCorrect = key === expected;

    trials += 1;
    if (wasCorrect) correct += 1;
    sumRT += rt;
    avgRT = sumRT / trials;

    updateStats();

    var maxTrials = getMaxTrials();
    var maxMistakes = getMaxMistakes();
    var mistakes = trials - correct;
    if ((maxTrials > 0 && trials >= maxTrials) || (maxMistakes > 0 && mistakes >= maxMistakes)) {
      endRun();
      return;
    }

    if (stimulusWrapper) {
      stimulusWrapper.classList.remove('feedback-correct', 'feedback-wrong');
      stimulusWrapper.classList.add(wasCorrect ? 'feedback-correct' : 'feedback-wrong');
      setTimeout(function () {
        stimulusWrapper.classList.remove('feedback-correct', 'feedback-wrong');
        generateAndShowStimulus();
      }, 500);
    } else {
      generateAndShowStimulus();
    }
  }

  function onKeyDown(e) {
    if (e.repeat) return;

    var key = (e.key || '').toUpperCase();
    if (key === ' ') {
      e.preventDefault();
      reset();
      return;
    }
    if (!running) return;
    if (key === 'A' || key === 'L') {
      e.preventDefault();
      handleResponse(key);
    }
  }

  btnLetter.addEventListener('click', function () {
    handleResponse('A');
  });
  btnReset.addEventListener('click', function () {
    reset();
  });
  btnNumber.addEventListener('click', function () {
    handleResponse('L');
  });
  document.addEventListener('keydown', onKeyDown);

  // Initialize: show first stimulus and start timer
  generateAndShowStimulus();
  updateStats();
})();
