import { query } from "../db/db_utils";

export const Media = {

    getAll() {
        return query(db, "SELECT * FROM Media");
    },

    getByProjectId(projectId) {
        const result = query(db, "SELECT * FROM Media WHERE idProgetto = ?", [projectId]);
        return result;
    },

    getByProjectSlug(projectSlug) {
        const project = progetto.getBySlug(projectSlug);
        const result = this.getByProjectId(project.id);
        return result;
    }
}