
import { initDb } from "./src/lib/initDb.js";
import { fillDb } from "./fillDb.js"; 

async function createDb() {
    await initDb();
    await fillDb();
}

(async () => {
    await createDb();
})();