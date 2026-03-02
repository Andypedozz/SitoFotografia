import Database from 'better-sqlite3';

// Percorso del database (nella root del progetto)
const DB_PATH = import.meta.env.DB_PATH;

// Inizializza il database
function initDatabase() {
    console.log('Inizializzazione database SQLite...');
    
    try {
        // Crea/apri il database
        const db = new Database(DB_PATH);
        
        // Configurazioni consigliate
        // db.pragma('journal_mode = WAL');
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