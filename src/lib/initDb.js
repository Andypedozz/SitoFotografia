import { sequelize } from "./db.js";

export async function initDb() {
    // Initialization logic here
    try {
        await sequelize.sync({ alter: true });
        console.log("Database synchronized successfully.");
    } catch (error) {
        console.error("Error synchronizing database:", error);
    }
}