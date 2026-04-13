import { defineConfig } from 'astro/config';
import dotenv from 'dotenv';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from "node:path";
import { fileURLToPath } from 'node:url';
import vercel from "@astrojs/vercel"

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	output: 'server',
	adapter: vercel(),
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
			{
				name: "block-sensitive-files",
				configureServer(server) {
					server.middlewares.use((req, res, next) => {
						const url = req.url;
						
						// Pattern di file sensibili da bloccare
						const sensitivePatterns = [
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
				deny: ['.env']
			}
		},
	},
});