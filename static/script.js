const v = document.getElementById('v');
const d = document.getElementById('d');
const btn = document.getElementById('startBtn');
let running = false;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => { v.srcObject = s; });

async function go() {
  if (running) return;
  running = true;
  d.style.display = "inline";
  btn.disabled = true;
  btn.textContent = "Doodle Dancing...";
  while (running) {
    let c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    let data = c.toDataURL('image/jpeg');
    let res = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: data })
    });
    let blob = await res.blob();
    d.src = URL.createObjectURL(blob);
    await new Promise(r => setTimeout(r, 60));
  }
}