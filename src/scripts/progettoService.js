import { db } from "../db/db";
import { query, queryAsync } from "../db/db_utils";
import fs from "node:fs";

export const progettoService = {
    getAll() {
        return query(db, "SELECT * FROM Progetto ORDER BY id DESC");
    },

    getBySlug(slug) {
        const result = query(db, "SELECT * FROM Progetto WHERE slug = ?", [slug]);
        return result[0];
    },

    getById(id) {
        const result = query(db, "SELECT * FROM Progetto WHERE id = ?", [id]);
        return result[0];
    },

    create(data) {
        const { nome, slug, copertina } = data;
        
        const result = query(db, `
            INSERT INTO Progetto (nome, slug, copertina)
            VALUES (?, ?, ?)
        `, [nome, slug, copertina]);

        return this.getById(result.lastInsertRowid);
    },

    update(id, data) {
        const { nome, slug, copertina } = data;
        const sql = "UPDATE Progetto SET nome = COALESCE(?, nome), slug = COALESCE(?, slug), copertina = COALESCE(?, copertina) WHERE id = ?";
        
        const result = query(db, sql, [nome, slug, copertina, id]);

        if (result.changes === 0) return null;

        return this.getById(id);
    },

    async delete(id) {
        const result = query(db, "DELETE FROM Progetto WHERE id = ?", [id]);
        return result.changes > 0;
    }
};