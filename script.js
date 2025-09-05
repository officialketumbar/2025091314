const scriptURL = 'https://script.google.com/macros/s/AKfycbwiP8iz0KzA5yWuWyLOEj9cOfX0Pj4ulr7Lp3m99AdmMor401Kh2aQP8JIoONhTrY4GkA/exec'; // Ganti dengan ID kamu

function cekNIK() {
  const nik = document.getElementById('nik').value;
  if (!nik) {
    alert("Masukkan NIK terlebih dahulu.");
    return;
  }

  fetch(`${scriptURL}?nik=${nik}`)
    .then(res => res.json())
    .then(data => {
      if (data.found) {
        document.getElementById('dataLama').style.display = 'block';
        document.getElementById('nama').value = data.nama;
        document.getElementById('instansi').value = data.instansi;
        document.getElementById('email').value = data.email;
        document.getElementById('notelp').value = data.notelp;
        document.getElementById('profesi').value = data.profesi;
      } else {
        document.getElementById('dataLama').style.display = 'none';
        alert("Data tidak ditemukan. Silakan isi formulir.");
      }
    })
    .catch(err => {
      alert("Terjadi kesalahan saat memeriksa NIK.");
      console.error(err);
    });
}

document.getElementById('formRegistrasi').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = {
    nik: document.getElementById('nik').value,
    nama: document.getElementById('nama').value,
    instansi: document.getElementById('instansi').value,
    email: document.getElementById('email').value,
    notelp: document.getElementById('notelp').value,
    profesi: document.getElementById('profesi').value
  };

  fetch(scriptURL, {
    method: 'POST',
    body: new URLSearchParams(data)
  })
    .then(res => res.text())
    .then(msg => {
      document.getElementById('status').textContent = "Data berhasil disimpan!";
      document.getElementById('formRegistrasi').reset();
    })
    .catch(err => {
      document.getElementById('status').textContent = "Gagal menyimpan data.";
      console.error(err);
    });

});






// ---------- tambahan ----------
// ---------- KAMERA + OCR ----------
document.getElementById('scanNikBtn').onclick = async () => {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    alert('Maaf, fitur kamera hanya berjalan di HTTPS atau localhost.');
    return;
  }
  if (!window.Tesseract) {
    await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
  } catch (e) {
    alert('Kamera diblokir atau tidak ada.\n\n' + e);
    return;
  }

  const video = document.createElement('video');
  video.srcObject = stream;
  video.playsInline = true;  // iOS wajib
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
    // Resize ke 640px agar OCR ringan
    const maxW = 640;
    const scale = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * scale;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(t => t.stop());
    wrap.remove();

    // Crop 25 % bawah
    const crop = document.createElement('canvas');
    const cctx = crop.getContext('2d');
    const h = canvas.height;
    crop.width = canvas.width;
    crop.height = h * 0.25;
    cctx.drawImage(canvas, 0, h * 0.75, canvas.width, h * 0.25, 0, 0, crop.width, crop.height);

    // OCR whitelist digit only
    Tesseract.recognize(crop, 'ind', {
      tessedit_char_whitelist: '0123456789',
      logger: () => {}
    }).then(({ data: { text } }) => {
      const m = text.match(/[0-9]{15,17}/);
      if (m) {
        document.getElementById('nik').value = m[0].slice(-16);
      } else {
        alert('NIK 16 digit tidak terbaca. Silakan coba foto ulang.\n\nHasil OCR: ' + text);
      }
    }).catch(err => {
      alert('OCR gagal: ' + err);
    });
  };
};
