const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/produtos', (req, res) => {
  const { nome, categoria, preco, quantidade } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }
  const qtd = quantidade || 0;
  const info = db
    .prepare('INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)')
    .run(nome, categoria || null, preco, qtd);
  res.status(201).json({ id: info.lastInsertRowid, nome, categoria, preco, quantidade: qtd });
});

module.exports = app;