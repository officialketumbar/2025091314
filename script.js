const scriptURL = 'https://script.google.com/macros/s/AKfycbwiP8iz0KzA5yWuWyLOEj9cOfX0Pj4ulr7Lp3m99AdmMor401Kh2aQP8JIoONhTrY4GkA/exec'; // GANTI DENGAN URL ANDA

/* ---------- VALIDASI NIK ---------- */
const nik    = document.getElementById('nik');
const errBox = document.getElementById('nikError');

function cekNik() {
  const val = nik.value.trim();
  if (val.length === 0) {
    errBox.style.display = 'none';
    return;
  }
  if (!/^\d{16}$/.test(val)) {
    errBox.style.display = 'block';
  } else {
    errBox.style.display = 'none';
  }
}
nik.addEventListener('input', cekNik);

document.querySelector('form')?.addEventListener('submit', e => {
  if (!/^\d{16}$/.test(nik.value.trim())) {
    e.preventDefault();
    nik.focus();
    cekNik();
  }
});

/* ---------- CEK NIK ---------- */
function cekNIK() {
  const nikVal = nik.value.trim();
  if (!nikVal) { alert('Masukkan NIK dulu.'); return; }

  fetch(`${scriptURL}?nik=${nikVal}`)
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById('dataLama');
      if (data.found) {
        box.style.display = 'block';
        document.getElementById('nama').value    = data.nama;
        document.getElementById('instansi').value= data.instansi;
        document.getElementById('email').value   = data.email;
        document.getElementById('notelp').value  = data.notelp;
        document.getElementById('profesi').value = data.profesi;
      } else {
        box.style.display = 'none';
        alert('Data tidak ditemukan, silakan isi lengkap.');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Gagal cek NIK.');
    });
}

/* ---------- SUBMIT ---------- */
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();

  const wrap = document.getElementById('progressWrap');
  const bar  = document.getElementById('progressBar');
  const msg  = document.getElementById('msgSukses');
  wrap.style.display = 'block';
  bar.style.width = '0%';

  let w = 0;
  const t = setInterval(() => {
    w += 3; bar.style.width = w + '%';
    if (w >= 90) clearInterval(t);
  }, 30);

  const payload = new FormData(this);
  fetch(scriptURL, { method: 'POST', body: payload })
    .then(r => r.text())
    .then(() => {
      clearInterval(t);
      bar.style.width = '100%';
      setTimeout(() => {
        wrap.style.display = 'none';
        msg.style.display = 'block';
      }, 300);
    })
    .catch(() => {
      clearInterval(t);
      wrap.style.display = 'none';
      alert('Gagal menyimpan.');
    });
});

/* ---------- INPUT KEMBALI ---------- */
document.getElementById('btnInputKembali').addEventListener('click', () => {
  location.reload();
});

/* ---------- SCAN KTP ---------- */
document.getElementById('scanNikBtn').addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Browser tidak support kamera.\nGunakan Chrome/Safari dan pastikan HTTPS.');
    return;
  }
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    alert('Scan KTP hanya berjalan di HTTPS atau localhost.');
    return;
  }

  if (!window.Tesseract) {
    await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: 'environment' } }
    });
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
  }

  const video = document.createElement('video');
  video.srcObject = stream;
  video.playsInline = true;
  video.play();

  const snapBtn = document.createElement('button');
  snapBtn.textContent = '📸 Ambil Foto';
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#000', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  });
  wrap.append(video, snapBtn);
  document.body.append(wrap);

  snapBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    const maxW   = 640;
    const scale  = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    Tesseract.recognize(canvas, 'ind', {
      tessedit_char_whitelist: '0123456789',
      logger: () => {}
    }).then(({ data: { text } }) => {
      const m = text.replace(/\D/g, '').match(/\d{15,17}/);
      if (m) {
        const nik = m[0].slice(-16);
        document.getElementById('nik').value = nik;
        document.getElementById('nama').focus();
      } else {
        alert('Scan ulang…');
        document.getElementById('scanNikBtn').click();
      }
    }).catch(err => alert('OCR gagal: ' + err));
  };
});
