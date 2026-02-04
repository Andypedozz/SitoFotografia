import SafeORM, { AUTOINCREMENT, EMAIL, INTEGER, STRING, TEXT, BOOLEAN, DATETIME } from '../../modules/orm_new.js';

export const orm = new SafeORM('./db.sqlite', {
  logLevel: 'info' // logQueries non esiste, usa logLevel
});

// ==================== MODELLO UTENTE ====================
orm.define('Utente', {
  id: {
    type: AUTOINCREMENT
    // primaryKey non è supportato, AUTOINCREMENT è già primary
  },
  email: {
    type: EMAIL,
    required: true,
    unique: true,
    maxLength: 255
  },
  passwordHash: {
    type: STRING,
    required: true,
    minLength: 60, // Per hash bcrypt
    maxLength: 255
  },
  ruolo: {
    type: STRING,
    required: true,
    default: 'visitatore'
  }
}, {
  timestamps: true, // Questo aggiunge automaticamente createdAt e updatedAt
  indexes: [
    { columns: ['email'], unique: true },
    { columns: ['ruolo'] }
  ]
});

// ==================== MODELLO PROGETTO ====================
orm.define('Progetto', {
  id: {
    type: AUTOINCREMENT
  },
  nome: {
    type: STRING,
    required: true,
    maxLength: 200
  },
  slug: {
    type: STRING,
    required: true,
    unique: true,
    maxLength: 200
  },
  descrizione: {
    type: TEXT,
    required: true
  },
  anno: {
    type: INTEGER,
    required: true
  },
  copertina: {
    type: STRING,
    required: true
  },
  homePage: {
    type: INTEGER,
    default: 0
    // Nota: se vuoi un booleano, usa type: BOOLEAN
  }
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt automaticamente
  // I hook vanno definiti diversamente nell'ORM attuale
  hooks: {
    beforeCreate: (data) => {
      // Non impostare createdAt manualmente, lo fa timestamps
      // Ma puoi aggiungere altre logiche
      console.log('Creazione progetto:', data.nome);
      return data;
    }
  },
  indexes: [
    { columns: ['slug'], unique: true },
    { columns: ['anno'] },
    { columns: ['homePage'] }
  ]
});

// ==================== MODELLO MEDIA ====================
orm.define('Media', {
  id: {
    type: AUTOINCREMENT
  },
  nome: {
    type: STRING,
    required: true,
    maxLength: 255
  },
  percorso: {
    type: STRING,
    required: true
  },
  idProgetto: {
    type: INTEGER,
    required: true,
    references: {
      table: 'Progetto',
      column: 'id',
      onDelete: 'CASCADE' // Importante: se cancello progetto, cancello media
    }
  },
  // Aggiungo campi utili per un portfolio
  tipo: {
    type: STRING,
    default: 'immagine'
  },
  ordine: {
    type: INTEGER,
    default: 0
  },
  didascalia: {
    type: TEXT
  }
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt
  indexes: [
    { columns: ['idProgetto'] }, // Indice importante per performance
    { columns: ['tipo'] },
    { columns: ['ordine'] }
  ]
});

// ==================== DEFINIZIONE RELAZIONI ====================

// ERRATA: belongsTo("Media", "Progetto") non è corretto per questa relazione
// CORREZIONE:

// 1. Un Progetto ha molti Media
orm.hasMany('Progetto', 'Media', {
  as: 'media',
  foreignKey: 'idProgetto'
});

// 2. Un Media appartiene a un Progetto
orm.belongsTo('Media', 'Progetto', {
  as: 'progetto',
  foreignKey: 'idProgetto'
});

// Aggiungo anche relazione Utente-Progetti se serve:
// 3. Un Utente può avere molti Progetti (se aggiungi creatoDa)
// Prima aggiungi campo al modello Progetto:
// creatoDa: { type: INTEGER, references: { table: 'Utente', column: 'id' } }
// Poi:
// orm.hasMany('Utente', 'Progetto', { as: 'progetti', foreignKey: 'creatoDa' });
// orm.belongsTo('Progetto', 'Utente', { as: 'creatore', foreignKey: 'creatoDa' });

// ==================== ESPORTAZIONE MODELLI ====================

export const Utente = orm.model('Utente');
export const Progetto = orm.model('Progetto');
export const Media = orm.model('Media');

// ==================== INIZIALIZZAZIONE DATABASE ====================

// Migrazioni se necessario
const migrations = {
  1: (db) => {
    // Migrazione iniziale - le tabelle vengono create automaticamente con define()
    console.log('Applicata migrazione v1');
  }
};

// Applica migrazioni se necessario
try {
  const currentVersion = orm.getDatabaseVersion();
  if (currentVersion < 1) {
    orm.migrateTo(1, migrations);
  }
} catch (error) {
  console.log('Database già inizializzato o errore migrazione:', error.message);
}