
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

  // 4. otomatis saat tombol ditekan
  snapBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxW = 640;
    const scale = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    // OCR whitelist digit SAJA
    Tesseract.recognize(canvas, 'ind', {
      tessedit_char_whitelist: '0123456789',
      logger: () => {}
    }).then(({ data: { text } }) => {
      const m = text.replace(/\D/g, '').match(/\d{15,17}/);
      if (m) {
        const nik = m[0].slice(-16);        // tepat 16 digit
        document.getElementById('nik').value = nik;
        // langsung fokus ke field berikutnya
        document.getElementById('nama').focus();
      } else {
        // gagal → otomatis minta ulang
        alert('Scan ulang…');
        document.getElementById('scanNikBtn').click();
      }
    }).catch(err => alert('OCR gagal: ' + err));
  };
});




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
      // --- capture & resize cepat
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxW = 640;
      const scale = maxW / video.videoWidth;
      canvas.width = maxW;
      canvas.height = video.videoHeight * scale;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(t => t.stop());
      wrap.remove();

      // --- OCR whitelist digit SAJA
      Tesseract.recognize(canvas, 'ind', {
        tessedit_char_whitelist: '0123456789',
        logger: () => {}
      }).then(({ data: { text } }) => {
        // ambil 15-17 digit berurutan
        const m = text.replace(/\D/g, '').match(/\d{15,17}/);
        if (m) {
          const nik = m[0].slice(-16);        // pastikan 16 digit
          document.getElementById('nik').value = nik;
          // opsional: langsung pindah ke field berikutnya
          document.getElementById('nama').focus();
        } else {
          // gagal → otomatis ulang tanpa klik
          alert('Scan ulang…');
          document.getElementById('scanNikBtn').click();
        }
      }).catch(err => {
        alert('OCR gagal: ' + err);
      });
    };
    }).catch(err => alert('OCR gagal: ' + err));
  };
});



