import express from "express";
import db from "../database/db.js";

const router = express.Router();

const STATUS_OK = "OK";
const STATUS_ERROR = "Error";

function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

async function getGuruData(noKartu) {
  const result = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);
  return result.length > 0 ? result[0] : null;
}

async function isAlreadyAbsenToday(noKartu, tanggalAbsen) {
  const result = await queryAsync(`SELECT * FROM rekap_absen WHERE no_kartu = '${noKartu}' AND tanggal_absen = '${tanggalAbsen}'`);
  return result.length > 0;
}

async function insertAbsenData(noKartu, namaGuru, kelasAjar, mataPelajaran, jamMasuk, statusKehadiran, tanggalAbsen) {
  const sql = `INSERT INTO rekap_absen (no_kartu, nama_guru, kelas_ajar, mata_pelajaran, jam_masuk, status_kehadiran, tanggal_absen) 
               VALUES ('${noKartu}', '${namaGuru}', '${kelasAjar}', '${mataPelajaran}', NOW(), '${statusKehadiran}', '${tanggalAbsen}')`;
  await queryAsync(sql);
}

router.get('/', (req, res) => {
  res.send('Express JS on Vercel')
})

router.get('/absen', async (req, res) => {
  const noKartu = req.query.no_kartu;

  try {
    const guruData = await getGuruData(noKartu);

    if (guruData) {
      const { namaGuru, kelasAjar, mataPelajaran } = guruData;
      const jamMasuk = new Date().toLocaleTimeString('en-US', { hour12: false });
      const statusKehadiran = jamMasuk <= '07:00:00' ? "Hadir" : "Hadir terlambat";
      const tanggalAbsen = new Date().toISOString().split('T')[0];

      const isAlreadyAbsen = await isAlreadyAbsenToday(noKartu, tanggalAbsen);

      if (isAlreadyAbsen) {
        res.json({ message: "Anda sudah absen hari ini" });
      } else {
        await insertAbsenData(noKartu, namaGuru, kelasAjar, mataPelajaran, jamMasuk, statusKehadiran, tanggalAbsen);

        res.json({ 
          message: "Absen berhasil", 
          namaGuru: namaGuru,
          jam: jamMasuk
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

router.get('/kirim-uid', async (req, res) => {
  const noKartu = req.query.nokartu;

  try {
    await queryAsync("DELETE FROM tmp_rfid");

    const sqlCheck = `SELECT * FROM tmp_rfid WHERE no_kartu = '${noKartu}'`;
    const resultCheck = await queryAsync(sqlCheck);

    if (resultCheck.length === 0) {
      const sqlInsert = `INSERT INTO tmp_rfid (no_kartu) VALUES ('${noKartu}')`;
      await queryAsync(sqlInsert);
      res.json({ message: "UID berhasil disimpan" });
    } else {
      res.json({ message: "UID sudah ada di database" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/cek-rfid', async (req, res) => {
  if (req.method === 'GET') {
    if (req.query.nokartu) {
      const noKartu = req.query.nokartu;

      try {
        const result = await queryAsync(`SELECT * FROM guru WHERE no_kartu = '${noKartu}'`);

        if (result.length > 0) {
          const row = result[0];
          res.json({
            status: STATUS_OK,
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

router.get('/jam', (req, res) => {
  const jam = new Date().toLocaleTimeString('en-US', { hour12: false });

  res.json({
    jam: jam
  })
})

export default router;
