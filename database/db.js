import mysql2 from 'mysql2';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'absensi-guru-iot',
  connectionLimit: 10,
};

const db = mysql2.createConnection(dbConfig);

db.connect((err) => {
  if (err) throw err;
  console.log("DB connected");
});

export default db;
