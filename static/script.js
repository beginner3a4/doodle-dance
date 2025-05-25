const v = document.getElementById('v');
const d = document.getElementById('d');
const startBtn = document.getElementById('startBtn');
let running = false;

const c = document.createElement('canvas');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { v.srcObject = stream; })
  .catch(err => alert('Error accessing camera: ' + err));

async function runDoodle() {
  if (!running) return;

  const scale = 0.5;
  c.width = v.videoWidth * scale;
  c.height = v.videoHeight * scale;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);

  const data = c.toDataURL('image/jpeg');
  try {
    const res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: data })
    });
    if (!res.ok) {
      alert('Server error: ' + res.status);
      running = false;
      startBtn.disabled = false;
      startBtn.textContent = "Start Doodle Dance";
      return;
    }
    const blob = await res.blob();
    d.src = URL.createObjectURL(blob);
    d.style.display = 'inline';
  } catch (err) {
    alert('Fetch error: ' + err);
    running = false;
    startBtn.disabled = false;
    startBtn.textContent = "Start Doodle Dance";
    return;
  }

  requestAnimationFrame(runDoodle);
}

startBtn.addEventListener('click', () => {
  if (running) return;
  running = true;
  startBtn.disabled = true;
  startBtn.textContent = "Doodle Dancing...";
  runDoodle();
});
