import SafeORM, { STRING, INTEGER, EMAIL, BOOLEAN, AUTOINCREMENT } from './modules/orm.js';

// ================ INIZIALIZZAZIONE ================
const orm = new SafeORM('esempio.db', { logLevel: 'info' });

// ================ MIGRAZIONI ================
const migrations = {
  1: (db) => {
    // Versione 1: tabelle base
    console.log('Applicando migrazione 1...');
  },
  2: (db) => {
    // Versione 2: aggiunta indice per email
    console.log('Applicando migrazione 2...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
  }
};

// Applica migrazioni fino alla versione 2
orm.migrateTo(2, migrations);
console.log('Versione database:', orm.getDatabaseVersion());

// ================ DEFINIZIONE MODELLI ================

// Utente con validazione avanzata
orm.define('User', {
  id: { type: AUTOINCREMENT },
  nome: { type: STRING, required: true },
  cognome: { type: STRING, required: true },
  email: { type: EMAIL, required: true, unique: true },
  eta: { type: INTEGER },
  attivo: { type: BOOLEAN, default: true }
}, {
  hooks: {
    beforeCreate: (user) => {
      user.email = user.email.toLowerCase().trim();
      user.nome = user.nome.charAt(0).toUpperCase() + user.nome.slice(1).toLowerCase();
      console.log('Hook beforeCreate:', user);
    }
  }
});

// Articolo
orm.define('Article', {
  id: { type: AUTOINCREMENT },
  titolo: { type: STRING, required: true },
  contenuto: { type: STRING },
  userId: { type: INTEGER, required: true },
  pubblicato: { type: BOOLEAN, default: false }
});

// Categoria
orm.define('Category', {
  id: { type: AUTOINCREMENT },
  nome: { type: STRING, required: true, unique: true },
  descrizione: { type: STRING }
});

// ================ DEFINIZIONE RELAZIONI ================

// Un utente ha molti articoli
orm.hasMany('User', 'Article', { 
  as: 'articles', 
  foreignKey: 'userId' 
});

// Un articolo appartiene a un utente
orm.belongsTo('Article', 'User', { 
  as: 'author', 
  foreignKey: 'userId' 
});

// Articoli e categorie: relazione molti-a-molti
orm.manyToMany('Article', 'Category', {
  through: 'ArticleCategory',
  aKey: 'articleId',
  bKey: 'categoryId'
});

// ================ OPERAZIONI CRUD ================

// Creazione utenti
const user1 = orm.create('User', {
  nome: 'mario',
  cognome: 'rossi',
  email: 'MARIO.ROSSI@EXAMPLE.COM', // verrà normalizzato dal hook
  eta: 30,
  attivo: true
});
console.log('User1 creato con ID:', user1.lastInsertRowid);

const user2 = orm.create('User', {
  nome: 'lucia',
  cognome: 'verdi',
  email: 'lucia.verdi@example.com',
  eta: 25
});

// Creazione articoli
const article1 = orm.create('Article', {
  titolo: 'Introduzione a SafeORM',
  contenuto: 'SafeORM è un ORM leggero e sicuro...',
  userId: user1.lastInsertRowid,
  pubblicato: true
});

const article2 = orm.create('Article', {
  titolo: 'Guida alle relazioni',
  contenuto: 'Le relazioni in SafeORM sono esplicite...',
  userId: user1.lastInsertRowid
});

// Creazione categorie
const cat1 = orm.create('Category', { nome: 'Tecnologia', descrizione: 'Articoli tech' });
const cat2 = orm.create('Category', { nome: 'Programmazione' });

// ================ QUERY CON EAGER LOADING ================

console.log('\n=== TUTTI GLI UTENTI CON I LORO ARTICOLI ===');
const usersWithArticles = orm.findAll('User', {
  include: ['articles']
});
usersWithArticles.forEach(user => {
  console.log(`${user.nome} ${user.cognome}: ${user.articles?.length || 0} articoli`);
});

console.log('\n=== ARTICOLI CON AUTORE ===');
const articlesWithAuthor = orm.findAll('Article', {
  where: { pubblicato: true },
  include: ['author']
});
articlesWithAuthor.forEach(article => {
  console.log(`"${article.titolo}" di ${article.author?.nome} ${article.author?.cognome}`);
});

// Query con condizioni avanzate
console.log('\n=== UTENTI ATTIVI OVER 25 ===');
const usersOver25 = orm.findAll('User', {
  where: {
    attivo: true,
    eta: { $gt: 25 }
  }
});
console.log('Utenti >25:', usersOver25);

// ================ TRANSACTION ================
console.log('\n=== TRANSAZIONE ===');
try {
  const result = orm.transaction(() => {
    // Creazione di un nuovo utente con il suo primo articolo
    const newUser = orm.create('User', {
      nome: 'carlo',
      cognome: 'bianchi',
      email: 'carlo.bianchi@example.com'
    });
    
    const newArticle = orm.create('Article', {
      titolo: 'Articolo in transazione',
      contenuto: 'Creato atomicamente con l\'utente',
      userId: newUser.lastInsertRowid,
      pubblicato: true
    });
    
    // Collegamento a categorie
    orm.create('ArticleCategory', {
      articleId: newArticle.lastInsertRowid,
      categoryId: cat1.lastInsertRowid
    });
    
    return { user: newUser, article: newArticle };
  });
  
  console.log('Transazione completata:', result);
} catch (error) {
  console.error('Transazione fallita:', error);
}

// ================ UPDATE E DELETE ================

// Aggiorna un utente
orm.update('User', 
  { eta: 31 }, 
  { id: user1.lastInsertRowid }
);

// Trova e modifica un articolo
const articleToUpdate = orm.findOne('Article', {
  where: { titolo: 'Guida alle relazioni' }
});
if (articleToUpdate) {
  orm.update('Article', 
    { pubblicato: true }, 
    { id: articleToUpdate.id }
  );
}

// Elimina un utente (solo se non ha articoli)
const usersToDelete = orm.findAll('User', {
  where: { email: 'test@example.com' }
});
usersToDelete.forEach(user => {
  const userArticles = orm.findAll('Article', {
    where: { userId: user.id }
  });
  
  if (userArticles.length === 0) {
    orm.delete('User', { id: user.id });
  }
});

// ================ QUERY COMPLESSE ================

// Articoli pubblicati con autore e categorie
console.log('\n=== ARTICOLI PUBBLICATI COMPLETI ===');
const publishedArticles = orm.findAll('Article', {
  where: { pubblicato: true }
});

// Caricamento manuale delle relazioni (alternativa a include)
publishedArticles.forEach(article => {
  const author = orm.findOne('User', { where: { id: article.userId } });
  const categoryLinks = orm.findAll('ArticleCategory', { 
    where: { articleId: article.id } 
  });
  
  const categoryIds = categoryLinks.map(link => link.categoryId);
  const categories = categoryIds.length > 0 
    ? orm.findAll('Category', { 
        where: { id: { $gt: 0 } } // Simulazione di IN
      })
    : [];
  
  console.log(`Articolo: ${article.titolo}`);
  console.log(`  Autore: ${author?.nome} ${author?.cognome}`);
  console.log(`  Categorie: ${categories.map(c => c.nome).join(', ')}`);
});

// ================ UTILIZZO DELL'API FLUENTE ================
console.log('\n=== API FLUENTE ===');
const UserModel = orm.model('User');
const ArticleModel = orm.model('Article');

// Usa l'API fluente
const mario = UserModel.findOne({ 
  where: { nome: 'Mario' } 
});
console.log('Trovato via API fluente:', mario);

const articlesCount = ArticleModel.findAll().length;
console.log(`Totale articoli: ${articlesCount}`);

// ================ PULIZIA ================
orm.close();
console.log('\nDatabase chiuso.');