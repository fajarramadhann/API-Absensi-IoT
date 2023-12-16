import express from "express";
import mysql2 from 'mysql2';

const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'absensi-guru-iot'
})

db.connect((err) => {
  if (err) throw err;
  console.log("DB connect")
});

 export default db;