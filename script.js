const remainingEl = document.getElementById("remaining");
const progressEl = document.getElementById("progress");
const statusEl = document.getElementById("status");
const durationInput = document.getElementById("duration");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const setButton = document.getElementById("setButton");
const voiceEnabled = document.getElementById("voiceEnabled");
const announceIntervalInput = document.getElementById("announceInterval");

let totalSeconds = 300;
let remainingSeconds = 300;
let running = false;
let endTime = 0;
let intervalId = null;
let lastAnnounced = null;
let wakeLock = null;

// 対応ブラウザでは、カウントダウン中に画面が消えないようにする
async function keepScreenAwake() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  try {
    if (wakeLock && !wakeLock.released) return;
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    }, { once: true });
  } catch (error) {
    // 省電力設定やブラウザの制限で取得できない場合も、タイマー自体は動作させる
    console.info("画面の点灯維持は利用できません:", error);
  }
}

async function releaseScreenWakeLock() {
  if (!wakeLock) return;
  const lock = wakeLock;
  wakeLock = null;
  try {
    await lock.release();
  } catch (error) {
    console.info("画面キープの解除に失敗しました:", error);
  }
}

// 画面復帰時、カウントダウン中なら画面キープを取り直す
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && running) {
    keepScreenAwake();
  }
});

function speak(message) {
  if (!voiceEnabled.checked || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function render() {
  remainingEl.textContent = remainingSeconds;
  const percent = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;
  progressEl.style.width = `${percent}%`;
}

function stopTicker() {
  if (intervalId !== null) clearInterval(intervalId);
  intervalId = null;
}

function tick() {
  const next = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  if (next !== remainingSeconds) {
    remainingSeconds = next;
    render();
  }

  // 経過時間が選択した間隔に達したタイミングで読み上げる
  const announceInterval = Number(announceIntervalInput.value);
  const elapsedSeconds = totalSeconds - remainingSeconds;
  if (
    remainingSeconds > 0 &&
    elapsedSeconds > 0 &&
    elapsedSeconds % announceInterval === 0 &&
    remainingSeconds !== lastAnnounced
  ) {
    lastAnnounced = remainingSeconds;
    speak(`あと${remainingSeconds}秒だよ`);
    statusEl.textContent = `あと ${remainingSeconds} 秒だよ！`;
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    running = false;
    stopTicker();
    render();
    statusEl.textContent = "おしまい！ よくできました！";
    startButton.textContent = "▶ もういちど";
    pauseButton.disabled = true;
    speak("おしまい！ よくできました！");
    releaseScreenWakeLock();
  }
}

function start() {
  if (running) return;
  if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
  running = true;
  keepScreenAwake();
  endTime = Date.now() + remainingSeconds * 1000;
  statusEl.textContent = "カウントダウン中！";
  startButton.textContent = "▶ カウント中";
  pauseButton.disabled = false;
  stopTicker();
  intervalId = setInterval(tick, 100);
  tick();
}

function pause() {
  if (!running) return;
  tick();
  running = false;
  stopTicker();
  releaseScreenWakeLock();
  statusEl.textContent = "いったん おやすみ";
  startButton.textContent = "▶ つづきから";
  pauseButton.disabled = true;
}

function reset() {
  running = false;
  stopTicker();
  releaseScreenWakeLock();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  remainingSeconds = totalSeconds;
  lastAnnounced = null;
  render();
  statusEl.textContent = "スタートを おしてね";
  startButton.textContent = "▶ スタート";
  pauseButton.disabled = true;
}

function setDuration(value) {
  const seconds = Number(value);
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 3600) {
    statusEl.textContent = "1〜3600秒で いれてね";
    return;
  }
  totalSeconds = seconds;
  durationInput.value = seconds;
  reset();
}

startButton.addEventListener("click", start);
pauseButton.addEventListener("click", pause);
resetButton.addEventListener("click", reset);
setButton.addEventListener("click", () => setDuration(durationInput.value));
durationInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") setDuration(durationInput.value);
});
document.querySelectorAll("[data-seconds]").forEach((button) => {
  button.addEventListener("click", () => setDuration(button.dataset.seconds));
});

render();
