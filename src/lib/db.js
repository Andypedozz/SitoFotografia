import { INTEGER, Sequelize, STRING } from "sequelize";

export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db.sqlite",
    logging: false,
    define: {
        freezeTableName: true,
    }
})

export const Utente = sequelize.define("Utente", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: STRING,
        unique: true,
        allowNull: false
    },
    passwordHash: {
        type: STRING,
        allowNull: false
    },
    ruolo: {
        type: STRING,
        allowNull: false
    }
})

export const Progetto = sequelize.define("Progetto", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    descrizione: {
        type: STRING,
        allowNull: true
    },
    anno: {
        type: INTEGER,
        allowNull: true
    },
    homepage: {
        type: INTEGER,
        defaultValue: 0
    }
})

export const Media = sequelize.define("Media", {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: STRING,
        unique: true,
        allowNull: false
    },
    percorso: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    idProgetto: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: Progetto,
            key: "id"
        }
    }
})