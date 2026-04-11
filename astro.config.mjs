import { defineConfig } from 'astro/config';
import dotenv from 'dotenv';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from "node:path";
import fs from "node:fs/promises"; // Usa la versione promises
import { fileURLToPath } from 'node:url';
import { createTables } from "./src/db/createTables.js"
import vercel from "@astrojs/vercel"

dotenv.config();
createTables();
const DEVELOPMENT = process.env.DEVELOPMENT;

import "./src/db/db_knex.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Funzione migliorata per copiare il database
function copyDatabase() {
  return {
    name: 'copy-database',
    closeBundle: async () => {
      const source = path.join(__dirname, 'data', 'db.sqlite');
      const destDir = path.join(__dirname, 'dist', 'data');
      const destination = path.join(destDir, 'db.sqlite');
      
      try {
        // Verifica se il file source esiste
        await fs.access(source);
        
        // Crea la cartella di destinazione
        await fs.mkdir(destDir, { recursive: true });
        
        // Copia il file
        await fs.copyFile(source, destination);
        
        console.log('\n✅ Database copiato in dist/data/db.sqlite');
        
        // Opzionale: copia anche altri file nella cartella data se necessario
        try {
          const otherFiles = await fs.readdir(path.join(__dirname, 'data'));
          for (const file of otherFiles) {
            if (file !== 'db.sqlite' && file.endsWith('.sqlite')) {
              const otherSource = path.join(__dirname, 'data', file);
              const otherDest = path.join(destDir, file);
              await fs.copyFile(otherSource, otherDest);
              console.log(`   📄 Copiato anche: ${file}`);
            }
          }
        } catch (readError) {
          // Ignora errori nella lettura di altri file
        }
        
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('\n⚠️  File database non trovato in data/db.sqlite');
        } else {
          console.error('\n❌ Errore nella copia del database:', error.message);
        }
      }
    }
  };
}

function getAdapter() {
  if (DEVELOPMENT) {
	return node({
	  mode: 'standalone'
	});
  } else {
	return vercel();
  }
}

export default defineConfig({
	output: 'server',
	adapter: getAdapter(),
	integrations: [react()],
	
	// Configurazione server
	server: {
		headers: {
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Referrer-Policy': 'strict-origin-when-cross-origin'
		}
	},
	
	// Configurazione build
	build: {
		assets: 'assets',
		serverEntry: 'entry.mjs',
	},
	
	vite: {
		plugins: [
			tailwindcss(),
			copyDatabase(), // Aggiunto il plugin per copiare il database
			{
				name: "block-sensitive-files",
				configureServer(server) {
					server.middlewares.use((req, res, next) => {
						const url = req.url;
						
						// Pattern di file sensibili da bloccare
						const sensitivePatterns = [
							"/data/db.sqlite",
							"/data/",
							".sqlite",
							".db",
							".env",
							".git",
							"node_modules",
							"package.json",
							"package-lock.json"
						];

						// Controlla se l'URL contiene pattern sensibili
						const isSensitive = sensitivePatterns.some(pattern => 
							url.includes(pattern) || url.endsWith('.sqlite') || url.endsWith('.db')
						);

						// if (isSensitive && !url.includes('@vite') && !url.includes('@id')) {
						// 	console.log(`🚫 Bloccato accesso a: ${url}`);
						// 	res.statusCode = 403;
						// 	res.setHeader('Content-Type', 'text/plain');
						// 	res.end('Accesso a file sensibili non consentito');
						// 	return;
						// }

						next();
					});
				}
			}
		],
		
		// Configurazione filesystem di Vite
		server: {
			fs: {
				// Permetti solo queste cartelle
				allow: ['public', 'src', 'node_modules'],
				// Nega esplicitamente la cartella data
				deny: ['.env', '.sqlite', '.db', 'data/', './data/']
			}
		},
		
		// Ottimizzazioni build
		build: {
			rollupOptions: {
				external: ['data/**/*', '**/*.sqlite', '**/*.db'],
				output: {
					manualChunks: {
						react: ['react', 'react-dom'],
					}
				}
			},
			sourcemap: process.env.NODE_ENV === 'development'
		},
		
		// Risoluzione moduli
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@db': path.resolve(__dirname, './src/db')
			}
		},
		
		// Ottimizzazioni dipendenze
		optimizeDeps: {
			include: ['react', 'react-dom'],
			exclude: ['knex', 'sqlite3'] // Escludi knex e sqlite3 dal pre-bundling
		}
	},
});