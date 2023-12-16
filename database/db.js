import express from "express";
import mysql2 from 'mysql2';

const db = mysql2.createConnection({
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