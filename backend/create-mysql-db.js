const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD;

  console.log('Attempting to connect to MySQL...');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Password length: ${password ? password.length : 0}`);

  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    console.log('Successfully connected to MySQL server.');

    const dbName = process.env.DB_NAME || 'eyecare_db';
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" created/verified successfully.`);

    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Failed to connect or create database:', error);
    process.exit(1);
  }
}

createDatabase();
