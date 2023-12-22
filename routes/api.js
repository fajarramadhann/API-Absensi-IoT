import express from "express";
import db from "../database/db.js";

const router = express.Router();

// Endpoint untuk cek apakah server berjalan
router.get('/', (req, res) => {
  res.send("Test");
})

// Endpoint untuk mencatat kehadiran
router.get('/absen', async (req, res) => {
  // Dapatkan nomor kartu dari parameter query
  const noKartu = req.query.no_kartu;

  try {
    // Periksa apakah nomor kartu ada di tabel 'guru'
    const result_check = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);

    if (result_check.length > 0) {
      // Jika nomor kartu ditemukan di tabel 'guru'
      const { namaGuru, kelas_ajar, mata_pelajaran } = result_check[0];


      // Dapatkan waktu saat ini dan tentukan status kehadiran
      const jam_masuk = new Date().toLocaleTimeString('en-US', { hour12: false });
      let status_kehadiran = "";

      if (jam_masuk <= '12:00:00') {
        status_kehadiran = "Hadir Tepat Waktu";
      } else {
        status_kehadiran = "Hadir terlambat";
      }

      // Dapatkan tanggal saat ini untuk pencatatan kehadiran
      const tanggalAbsen = new Date().toISOString().split('T')[0];

      // Periksa apakah guru sudah melakukan absensi hari ini
      const result_check_duplicate = await queryAsync(`SELECT * FROM rekap_absen WHERE no_kartu = '${noKartu}' AND tanggal_absen = '${tanggalAbsen}'`);

      if (result_check_duplicate.length > 0) {
        // Jika sudah absen hari ini
        res.json({ message: "Anda sudah absen hari ini" });
      } else {
        // Jika belum absen hari ini, masukkan rekaman kehadiran ke tabel 'rekap_absen'
        const result_insert = await queryAsync(`INSERT INTO rekap_absen (no_kartu, nama_guru, kelas_ajar, mata_pelajaran, jam_masuk, status_kehadiran, tanggal_absen) 
                                  VALUES ('${noKartu}', '${namaGuru}', '${kelas_ajar}', '${mata_pelajaran}', NOW(), '${status_kehadiran}', '${tanggalAbsen}')`);

        res.json({ 
          message: "Absen berhasil", 
          namaGuru,
          jam: jam_masuk
        });
      }
    } else {
      // Jika nomor kartu tidak ditemukan di tabel 'guru'
      res.status(404).json({ message: "UID tidak ditemukan di tabel guru" });
    }
  } catch (error) {
    // Tangani kesalahan yang mungkin terjadi selama proses
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fungsi untuk menjalankan kueri SQL secara asynchronous
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

// Endpoint untuk menyimpan UID ke database
router.get('/kirim-uid', async (req, res) => {
  const noKartu = req.query.no_kartu;

  try {
    // Hapus data UID yang ada di tabel 'tmp_rfid'
    await queryAsync("DELETE FROM tmp_rfid");

    // Periksa apakah UID sudah ada di tabel 'tmp_rfid'
    const sql_check = `SELECT * FROM tmp_rfid WHERE no_kartu = '${noKartu}'`;
    const result_check = await queryAsync(sql_check);

    if (result_check.length === 0) {
      // Jika UID belum ada, masukkan UID ke tabel 'tmp_rfid'
      const sql_insert = `INSERT INTO tmp_rfid (no_kartu) VALUES ('${noKartu}')`;
      await queryAsync(sql_insert);
      res.json({ message: "UID berhasil disimpan" });
    } else {
      // Jika UID sudah ada di tabel 'tmp_rfid'
      res.json({ message: "UID sudah ada di database" });
    }
  } catch (error) {
    // Tangani kesalahan yang mungkin terjadi selama proses
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint untuk memeriksa UID pada tabel 'guru'
router.get('/cek-rfid', async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.nokartu) {
      const noKartu = req.query.nokartu;

      try {
        // Periksa apakah UID ada di tabel 'guru'
        const result = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);

        if (result.length > 0) {
          const row = result[0];
          res.json({
            status: "OK",
            message: "Success",
            nama_guru: row.nama_guru 
          });
        } else {
          // Jika UID tidak dikenal
          res.json({
            msg: "Kartu tidak dikenal"
          })
        }
      } catch (error) {
        // Tangani kesalahan yang mungkin terjadi selama proses
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      // Jika parameter nokartu tidak ada
      res.status(400).json({ message: "Parameter tidak lengkap: nokartu" });
    }
  } else {
    // Jika metode tidak diizinkan
    res.status(405).json({ message: "METHOD NOW ALLOWED" });
  }
});

// Endpoint untuk mendapatkan jam saat ini
router.get('/jam', (req, res) => {
  const jam = new Date().toLocaleTimeString('en-US', { hour12: false });

  res.json({
    jam: jam
  })
})

// Ekspor router untuk digunakan di modul lain
export default router;
