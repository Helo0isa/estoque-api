const Database = require('better-sqlite3');

const db = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : 'estoque.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    preco REAL NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0
  )
`);

module.exports = db;