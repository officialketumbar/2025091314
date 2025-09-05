
/* ==========  CONFIG  ========== */
const scriptURL = 'https://script.google.com/macros/s/AKfycbwiP8iz0KzA5yWuWyLOEj9cOfX0Pj4ulr7Lp3m99AdmMor401Kh2aQP8JIoONhTrY4GkA/exec'; // Ganti dengan ID kamu

/* ==========  CEK NIK  ========== */
function cekNIK() {
  const nik = document.getElementById('nik').value.trim();
  if (!nik) { alert('Masukkan NIK dulu.'); return; }

  fetch(`${scriptURL}?nik=${nik}`)
    .then(r => r.json())
    .then(data => {
      if (data.found) {
        document.getElementById('dataLama').style.display = 'block';
        document.getElementById('nama').value    = data.nama;
        document.getElementById('instansi').value= data.instansi;
        document.getElementById('email').value   = data.email;
        document.getElementById('notelp').value  = data.notelp;
        document.getElementById('profesi').value = data.profesi;
      } else {
        document.getElementById('dataLama').style.display = 'none';
        alert('Data tidak ditemukan, silakan isi lengkap.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Gagal cek NIK.');
    });
}

/* ==========  SUBMIT  ========== */
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();
  const payload = new FormData(this);
  fetch(scriptURL, { method: 'POST', body: payload })
    .then(r => r.text())
    .then(() => {
      document.getElementById('status').textContent = 'Data berhasil disimpan.';
      this.reset();
    })
    .catch(() => {
      document.getElementById('status').textContent = 'Gagal menyimpan.';
    });
});

/* ==========  SCAN KTP  ========== */
document.getElementById('scanNikBtn').addEventListener('click', async () => {
  // 0. validasi HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    alert('Fitur kamera butuh HTTPS / localhost.'); return;
  }
  // 1. load Tesseract on-demand
  if (!window.Tesseract) {
    await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }
  // 2. buka kamera belakang
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });
  const video = document.createElement('video');
  video.srcObject = stream; video.playsInline = true;
  video.play();

  // 3. UI overlay
  const snapBtn = document.createElement('button');
  snapBtn.textContent = '📸 Ambil Foto';
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#000', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  });
  wrap.append(video, snapBtn); document.body.append(wrap);

  // 4. saat tombol ditekan
  snapBtn.onclick = () => {
    // 4a. capture & resize biar OCR ringan
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    const maxW   = 640;
    const scale  = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height= video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    // 4b. crop 25 % bawah (area NIK)
    const crop = document.createElement('canvas');
    const cctx = crop.getContext('2d');
    const h    = canvas.height;
    crop.width = canvas.width;
    crop.height= h * 0.25;
    cctx.drawImage(canvas, 0, h * 0.75, canvas.width, h * 0.25, 0, 0, crop.width, crop.height);

    // 4c. OCR whitelist huruf & angka
    Tesseract.recognize(crop, 'ind', {
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.: ',
      logger: () => {}
    }).then(({ data: { text } }) => {
      // 4d. cari baris yang ada "NIK" lalu ambil 16 digit
      const rows = text.split(/\r?\n/);
      let nik = null;
      for (let r of rows) {
        if (/nik/i.test(r)) {
          const m = r.match(/[0-9]{16}/);
          if (m) { nik = m[0]; break; }
        }
      }
      if (nik) {
        document.getElementById('nik').value = nik;
      } else {
        alert('Baris bertuliskan "NIK" + 16 digit tidak ditemukan.\n\nHasil OCR:\n' + text);
      }
    }).catch(err => alert('OCR gagal: ' + err));
  };
});
