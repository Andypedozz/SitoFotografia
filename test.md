`Media` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `nome` VARCHAR(255) NOT NULL UNIQUE,
    `percorso` VARCHAR(255) NOT NULL UNIQUE,
    `idProgetto` INTEGER NOT NULL REFERENCES `Progetto` (`id`),
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL
)
`Progetto` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `nome` VARCHAR(255) NOT NULL UNIQUE,
    `descrizione` VARCHAR(255),
    `anno` INTEGER,
    `copertina` INTEGER NOT NULL REFERENCES `Media` (`id`),
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL
)


Admin Dashboard:

Gestione Homepage:
La Homepage avrà al massimo:
* 6 progetti mostrati con copertina immagine
* 2 video mostrati
Entrambe le risorse saranno selezionabili dalla dashboard

Gestione progetti:
Nuovo progetto:
Nome:
Descrizione:
Anno:

Gestione Media:
Carica Media
Elimina Media
Rinomina Media