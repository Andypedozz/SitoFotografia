import { sequelize } from "./db";

export async function initDb() {
    // Initialization logic here
    try {
        await sequelize.sync();
        console.log("Database synchronized successfully.");
    } catch (error) {
        console.error("Error synchronizing database:", error);
    }
}