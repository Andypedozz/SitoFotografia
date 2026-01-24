import SafeORM, { AUTOINCREMENT, EMAIL, INTEGER, STRING, TEXT } from '../../modules/orm.js';

export const orm = new SafeORM('./db.sqlite', {
  logQueries: true
});

orm.define('Utente', {
  id: {
    type: AUTOINCREMENT,
    primaryKey: true
  },
  email: {
    type: EMAIL,
    required: true,
    unique: true
  },
  passwordHash: {
    type: STRING,
    required: true
  },
  ruolo: {
    type: STRING,
    required: true
  }
}, {
  hooks: {
    beforeCreate(data) {
      data.createdAt = Date.now();
    }
  }
});

orm.define('Progetto', {
  id: {
    type: AUTOINCREMENT,
    primaryKey: true
  },
  nome: {
    type: STRING,
    required: true
  },
  slug: {
    type: STRING,
    required: true
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
  }
}, {
  hooks: {
    beforeCreate(data) {
      data.createdAt = Date.now();
    }
  }
});

orm.define("Media", {
  id: {
    type: AUTOINCREMENT,
    primaryKey: true
  },
  nome: {
    type: STRING,
    required: true
  },
  percorso: {
    type: STRING,
    required: true
  },
  idProgetto: {
    type: INTEGER,
    required: true
  }
})

orm.belongsTo("Media", "Progetto", {
  as: "media",
  foreignKey: "idProgetto"
})

export const Utente = orm.model('Utente');
export const Progetto = orm.model('Progetto');
export const Media = orm.model('Media');
