import express from "express";
import mysql from 'mysql';

const db = mysql.createConnection({
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