import express from "express";
import mysql from 'mysql';

const db = mysql.createConnection({
  host: '103.253.213.45:2083',
  user: 'netco405_jarssdev',
  password: 'jarssdevelop',
  database: 'netco405_absen-iot'
})

db.connect((err) => {
  if (err) throw err;
  console.log("DB connect")
});

 export default db;