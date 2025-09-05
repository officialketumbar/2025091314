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
    snapBtn.onclick = () => {
      // --- ambil full frame
      const canvas = document.getElementById('canvas');
      const ctx    = canvas.getContext('2d');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      stream.getTracks().forEach(t => t.stop());
      dlg.remove();

      // --- crop 25 % bawah (tempat NIK) → hemat CPU
      const crop = document.getElementById('cropCanvas');
      const cctx = crop.getContext('2d');
      const h    = canvas.height;
      crop.width  = canvas.width;
      crop.height = h * 0.25;
      cctx.drawImage(canvas, 0, h * 0.75, canvas.width, h * 0.25, 0, 0, canvas.width, h * 0.25);

      // --- OCR di area sempit
      Tesseract.recognize(crop, 'ind', { tessedit_char_whitelist: '0123456789' })
        .then(({ data: { text } }) => {
          // toleransi 15-17 digit
          const cand = text.match(/[0-9]{15,17}/);
          if (cand) {
            const nik = cand[0].slice(-16);        // ambil 16 digit terakhir
            document.getElementById('nik').value = nik;
            document.getElementById('previewWrap').style.display = 'none';
          } else {
            // tampilkan pratinjau + tombol ulang
            document.getElementById('previewWrap').style.display = 'block';
            document.getElementById('useBtn').style.display = 'none';
          }
        });
    };




// ---------- tambahan ----------
document.getElementById('retakeBtn').onclick = () => {
  document.getElementById('previewWrap').style.display = 'none';
  document.getElementById('scanNikBtn').click();
};
document.getElementById('useBtn').onclick = () => {
  document.getElementById('previewWrap').style.display = 'none';
};
