const remainingEl = document.getElementById("remaining");
const progressEl = document.getElementById("progress");
const statusEl = document.getElementById("status");
const durationInput = document.getElementById("duration");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const setButton = document.getElementById("setButton");
const voiceEnabled = document.getElementById("voiceEnabled");

let totalSeconds = 300;
let remainingSeconds = 300;
let running = false;
let endTime = 0;
let intervalId = null;
let lastAnnounced = null;

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

  // 30秒ごとの節目で読み上げる（開始直後の数値は読み上げない）
  if (remainingSeconds > 0 && remainingSeconds % 30 === 0 && remainingSeconds !== lastAnnounced) {
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
  }
}

function start() {
  if (running) return;
  if (remainingSeconds <= 0) remainingSeconds = totalSeconds;
  running = true;
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
  statusEl.textContent = "いったん おやすみ";
  startButton.textContent = "▶ つづきから";
  pauseButton.disabled = true;
}

function reset() {
  running = false;
  stopTicker();
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
