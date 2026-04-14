import { defineMiddleware } from 'astro/middleware';
import { db } from './db/db.js';

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
    session = (await db.execute("SELECT * FROM Sessione WHERE id = ?", [sessionId])).rows[0];
  } catch (error) {
    locals.user = null;
    return next();
  }

  if (!session) {
    locals.user = null;
    return next();
  }

  if (new Date(session.expiresAt) < new Date()) {
    await db.execute("DELETE FROM Sessione WHERE id = ?", [sessionId]);
    locals.user = null;
    return next();
  }

  const user = (await db.execute("SELECT * FROM Utente WHERE id = ?", [session.userId])).rows[0];

  locals.user = user;
  return next();
});