import { db } from "../db/db";
import { query } from "../db/db_utils";

export const progettoService = {
    async getAll() {
        return await query(db, "SELECT * FROM Progetto ORDER BY id DESC");
    },

    async getBySlug(slug) {
        const result = await query(db, "SELECT * FROM Progetto WHERE slug = ?", [slug]);
        return result[0];
    },

    async getById(id) {
        const result = await query(db, "SELECT * FROM Progetto WHERE id = ?", [id]);
        return result[0];
    },

    async create(data) {
        const { nome, slug, copertina } = data;
        
        const result = await query(db, `
            INSERT INTO Progetto (nome, slug, copertina)
            VALUES (?, ?, ?)
        `, [nome, slug, copertina]);

        return await this.getById(result.lastInsertRowid);
    },

    async update(id, data) {
        const { nome, slug, copertina } = data;
        
        const result = await query(db, `
            UPDATE Progetto 
            SET nome = COALESCE(?, nome),
                slug = COALESCE(?, slug),
                copertina = COALESCE(?, copertina),
            WHERE id = ?
        `, [nome, slug, copertina, id]);

        if (result.changes === 0) return null;

        return await this.getById(id);
    },

    async delete(id) {
        const result = await query(db, "DELETE FROM Progetto WHERE id = ?", [id]);
        return result.changes > 0;
    }
};