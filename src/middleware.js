import { defineMiddleware } from 'astro/middleware';
import { db } from './db/db_knex.js';

// Paths da bloccare
const BLOCKED_PATHS = [
  '/data/db.sqlite',
  '/data/',
  '.sqlite',
  '.db',
  '.env',
  '.git',
  'node_modules'
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, cookies } = context;
  const url = new URL(request.url);
  
  // Controllo file sensibili
  const shouldBlock = BLOCKED_PATHS.some(path => 
    url.pathname.includes(path) || 
    url.pathname.endsWith('.sqlite') || 
    url.pathname.endsWith('.db')
  );
  
  if (shouldBlock) {
    return new Response('Accesso negato', { 
      status: 403,
      statusText: 'Forbidden'
    });
  }

  // Gestione sessione (il tuo codice originale)
  const sessionId = cookies.get("session")?.value;

  if (!sessionId) {
    locals.user = null;
    return next();
  }

  let session;
  try {
    session = await db("Sessione").select("*").where("id", sessionId).first();
  } catch (error) {
    locals.user = null;
    return next();
  }

  if (!session) {
    locals.user = null;
    return next();
  }

  if (new Date(session.expiresAt) < new Date()) {
    await db("Sessione").delete().where("id", sessionId);
    locals.user = null;
    return next();
  }

  const user = await db("Utente").select(["id", "username", "ruolo"]).where("id", session.userId).first();

  locals.user = user;
  return next();
});