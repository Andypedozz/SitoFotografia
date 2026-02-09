import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Percorso del database (nella root del progetto)
const DB_PATH = path.join(process.cwd(), 'db.sqlite');

// Inizializza il database
function initDatabase() {
    console.log('Inizializzazione database SQLite...');
    
    try {
        // Crea/apri il database
        const db = new Database(DB_PATH);
        
        // Configurazioni consigliate
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        db.pragma('encoding = "UTF-8"');
        
        console.log(`Database creato/aperto: ${DB_PATH}`);
        
        return db;
    } catch (error) {
        console.error('Errore durante l\'inizializzazione del database:', error);
        throw error;
    }
}

// Esporta l'istanza del database
const db = initDatabase();

export { db };