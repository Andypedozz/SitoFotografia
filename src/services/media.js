import { db } from "../db/db";
import { query } from "../db/db_utils";
import fs from "node:fs";

export const Media = {

    getAll() {
        return query(db, "SELECT * FROM Media");
    },

    getById() {
        return query(db, "SELECT * FROM MEdia WHERE id = ?", [id]);
    },

    getByProjectId(projectId) {
        const result = query(db, "SELECT * FROM Media WHERE idProgetto = ?", [projectId]);
        return result;
    },

    getByProjectSlug(projectSlug) {
        const project = progetto.getBySlug(projectSlug);
        const result = this.getByProjectId(project.id);
        return result;
    },

    delete(id) {
        const image = query("SELECT * FROM Media WHERE id = ?", [id]);
        const result = query(db,"DELETE FROM Media WHERE id = ?", [id]);

        fs.rmSync(IMAGES_PATH+"/"+image.percorso);
        return result.changes > 0;
    },


}