import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDb = async () => {
  // Connexion sans DB pour la créer
  const connection = await mysql.createConnection({
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '3306'),
    user: process.env['DB_USER'] || 'root',
    password: process.env['DB_PASSWORD'] || '',
  });

  try {
    // Créer la base de données
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${process.env['DB_NAME'] || 'studenthub_db'}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Base de données "${process.env['DB_NAME']}" créée`);

    await connection.execute(`USE \`${process.env['DB_NAME'] || 'studenthub_db'}\``);

    // Créer la table students
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(20) NOT NULL UNIQUE,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(200) NOT NULL UNIQUE,
        filiere VARCHAR(100) NOT NULL,
        niveau ENUM('L1', 'L2', 'L3', 'M1', 'M2', 'Ing1', 'Ing2', 'Ing3') NOT NULL,
        date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "students" créée');

    // Insérer des données de test
    const testStudents = [
      ['STU001', 'Ben Ali', 'Ahmed', 'ahmed.benali@epi.tn', 'IoT', 'Ing2'],
      ['STU002', 'Mansouri', 'Fatima', 'fatima.mansouri@epi.tn', 'IoT', 'Ing2'],
      ['STU003', 'Trabelsi', 'Mohamed', 'mohamed.trabelsi@epi.tn', 'Informatique', 'Ing1'],
      ['STU004', 'Khalil', 'Sarah', 'sarah.khalil@epi.tn', 'Informatique', 'Ing3'],
      ['STU005', 'Bouaziz', 'Omar', 'omar.bouaziz@epi.tn', 'Réseaux', 'M1'],
      ['STU006', 'Ferchichi', 'Leila', 'leila.ferchichi@epi.tn', 'Réseaux', 'M2'],
      ['STU007', 'Hamdi', 'Youssef', 'youssef.hamdi@epi.tn', 'IoT', 'Ing3'],
      ['STU008', 'Jlassi', 'Nour', 'nour.jlassi@epi.tn', 'Informatique', 'L3'],
    ];

    for (const student of testStudents) {
      await connection.execute(
        `INSERT IGNORE INTO students (numero, nom, prenom, email, filiere, niveau) VALUES (?, ?, ?, ?, ?, ?)`,
        student
      );
    }
    console.log('✅ Données de test insérées (8 étudiants)');

  } finally {
    await connection.end();
  }

  console.log('\n🎓 Base de données StudentHub initialisée avec succès!\n');
};

initDb().catch(console.error);
