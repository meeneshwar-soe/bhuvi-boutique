require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function importData() {
  console.log('🔄 Connecting to Railway Database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true // Important for .sql files
  });

  console.log('✅ Connected. Reading boutique.sql...');
  const sql = fs.readFileSync('./boutique.sql', 'utf8');

  console.log('⏳ Importing data (this may take 30 seconds)...');
  await connection.query(sql);

  console.log('🎉 SUCCESS! All products and users are now live.');
  process.exit(0);
}

importData().catch(err => {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
});
