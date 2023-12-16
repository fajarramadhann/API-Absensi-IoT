import mysql from 'mysql';

const db = mysql.createConnection({
  host: 'semin.wonsacloud.com',
  user: 'netcodem_jarssdev',
  password: 'jarssdeveloper',
  database: 'netcodem_absen-iot'
})

db.connect((err) => {
  if (err) throw err;
  console.log("DB connect")
});

 export default db;