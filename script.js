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






// ---------- Clipboard ----------
document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('nik').value = text.trim();
  } catch (e) {
    alert('Tidak bisa akses clipboard. Pastikan izin diberikan.');
  }
});

// ---------- OCR ----------
document.getElementById('camBtn').addEventListener('click', () => {
  document.getElementById('fileInp').click();
});

document.getElementById('fileInp').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // load Tesseract.min.js (ringan, ~400 kB gzip)
  if (!window.Tesseract) {
    await import('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
  }

  const { data: { text } } = await Tesseract.recognize(file, 'ind', {
    logger: m => console.log(m) // opsional
  });

  // ambil 16 angka pertama (NIK)
  const nik = (text.match(/\d{16}/) || [])[0];
  if (nik) {
    document.getElementById('nik').value = nik;
  } else {
    alert('NIK 16 digit tidak terbaca. Silakan potong ulang atau paste manual.');
  }
});
