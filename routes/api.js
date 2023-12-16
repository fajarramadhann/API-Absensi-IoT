import express from "express";
import db from "../database/db.js";

const router = express.Router();

router.get('/absen', async (req, res) => {
  const noKartu = req.query.no_kartu;

  try {
    const result_check = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);

    if (result_check.length > 0) {
      const row = result_check[0];
      const namaGuru = row.nama_guru;
      const kelas_ajar = row.kelas_ajar;
      const mata_pelajaran = row.mata_pelajaran;

      const jam_masuk = new Date().toLocaleTimeString('en-US', { hour12: false });
      let status_kehadiran = "";

      // const jadwal_msk = req.query.jadwal_masuk;
      // const jadwal_masuk = await queryAsync(`SELECT * FROM jadwal WHERE jadwal_masuk = ${jadwal_msk}`)

      if (jam_masuk <= '07:00:00') {
        status_kehadiran = "Hadir";
      } else {
        status_kehadiran = "Hadir terlambat";
      }

      const tanggalAbsen = new Date().toISOString().split('T')[0];

      const result_check_duplicate = await queryAsync(`SELECT * FROM rekap_absen WHERE no_kartu = '${noKartu}' AND tanggal_absen = '${tanggalAbsen}'`);

      if (result_check_duplicate.length > 0) {
        res.json({ message: "Anda sudah absen hari ini" });
      } else {
        const result_insert = await queryAsync(`INSERT INTO rekap_absen (no_kartu, nama_guru, kelas_ajar, mata_pelajaran, jam_masuk, status_kehadiran, tanggal_absen) 
                                  VALUES ('${noKartu}', '${namaGuru}', '${kelas_ajar}', '${mata_pelajaran}', NOW(), '${status_kehadiran}', '${tanggalAbsen}')`);

        res.json({ 
          message: "Absen berhasil", 
          namaGuru: namaGuru,
          jam: jam_masuk
        });
      }
    } else {
      res.status(404).json({ message: "UID tidak ditemukan di tabel guru" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}



router.get('/kirim-uid', async (req, res) => {
  const noKartu = req.query.nokartu;

  try {
    await queryAsync("DELETE FROM tmp_rfid");

    const sql_check = `SELECT * FROM tmp_rfid WHERE no_kartu = '${noKartu}'`;
    const result_check = await queryAsync(sql_check);

    if (result_check.length === 0) {
      const sql_insert = `INSERT INTO tmp_rfid (no_kartu) VALUES ('${noKartu}')`;
      await queryAsync(sql_insert);
      res.json({ message: "UID berhasil disimpan" });
    } else {
      res.json({ message: "UID sudah ada di database" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

function AsyncQuery(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

router.get('/cek-rfid', async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.nokartu) {
      const noKartu = req.query.nokartu;

      try {
        const result = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);

        if (result.length > 0) {
          const row = result[0];
          res.json({
            status: "OK",
            message: "Success",
            nama_guru: row.nama_guru 
          });
        } else {
          res.json({
            msg: "kartu tidak dikenal"
          })
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      res.status(400).json({ message: "Missing parameter: nokartu" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
});

function queryAsink(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

router.get('/jam', (req, res) => {
  const jam = new Date().toLocaleTimeString('en-US', { hour12: false });

  res.json({
    jam: jam
  })
})

export default router;