const scriptURL = 'https://script.google.com/macros/s/AKfycbwiP8iz0KzA5yWuWyLOEj9cOfX0Pj4ulr7Lp3m99AdmMor401Kh2aQP8JIoONhTrY4GkA/exec';

/* ===== VALIDASI NIK ===== */
const nikInput = document.getElementById('nik');
const nikError = document.getElementById('nikError');

function cekNik() {
  const val = nikInput.value.trim();
  if (val.length === 0) {
    nikError.style.display = 'none';
    return;
  }
  if (!/^\d{16}$/.test(val)) {
    nikError.style.display = 'block';
  } else {
    nikError.style.display = 'none';
  }
}

nikInput.addEventListener('input', cekNik);

document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  if (!/^\d{16}$/.test(nikInput.value.trim())) {
    e.preventDefault();
    nikInput.focus();
    cekNik();
  }
});

/* ===== CEK NIK DARI SERVER ===== */
function cekNIK() {
  const nik = nikInput.value.trim();
  if (!nik) {
    alert('Masukkan NIK dulu.');
    return;
  }

  fetch(`${scriptURL}?nik=${nik}`)
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById('dataLama');
      if (data.found) {
        box.style.display = 'block';
        document.getElementById('nama').value = data.nama;
        document.getElementById('instansi').value = data.instansi;
        document.getElementById('email').value = data.email;
        document.getElementById('notelp').value = data.notelp;
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

/* ===== SUBMIT FORM ===== */
document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();
  const payload = new FormData(this);
  fetch(scriptURL, { method: 'POST', body: payload })
    .then(r => r.text())
    .then(() => {
      document.getElementById('status').textContent = class="blink-hijau">'Data berhasil disimpan.';
      this.reset();
      document.getElementById('dataLama').style.display = 'none';
    })
    .catch(() => {
      document.getElementById('status').textContent = 'Gagal menyimpan.';
    });
});

/* ===== SCAN KTP DENGAN KAMERA ===== */
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
    const ctx = canvas.getContext('2d');
    const maxW = 640;
    const scale = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    Tesseract.recognize(canvas, 'ind', {
      tessedit_char_whitelist: '0123456789',
      logger: () => {}
    }).then(({ data: { text } }) => {
      const match = text.replace(/\D/g, '').match(/\d{15,17}/);
      if (match) {
        const nik = match[0].slice(-16);
        nikInput.value = nik;
        document.getElementById('nama').focus();
      } else {
        alert('Scan ulang…');
        document.getElementById('scanNikBtn').click();
      }
    }).catch(err => alert('OCR gagal: ' + err));
  };
});

