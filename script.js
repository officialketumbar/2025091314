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
