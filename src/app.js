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
  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Preço inválido' });
  }
  if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
    return res.status(400).json({ erro: 'Quantidade inválida' });
  }
  const qtd = quantidade || 0;
  const info = db
    .prepare('INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)')
    .run(nome, categoria || null, preco, qtd);
  res.status(201).json({ id: info.lastInsertRowid, nome, categoria, preco, quantidade: qtd });
});

app.get('/produtos', (req, res) => {
  res.json(db.prepare('SELECT * FROM produtos').all());
});

app.get('/produtos/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

app.put('/produtos/:id', (req, res) => {
  const existe = db.prepare('SELECT id FROM produtos WHERE id = ?').get(req.params.id);
  if (!existe) return res.status(404).json({ erro: 'Produto não encontrado' });
  const { nome, categoria, preco, quantidade } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Preço inválido' });
  }
  if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
    return res.status(400).json({ erro: 'Quantidade inválida' });
  }
  db.prepare('UPDATE produtos SET nome = ?, categoria = ?, preco = ?, quantidade = ? WHERE id = ?')
    .run(nome, categoria || null, preco, quantidade, req.params.id);
  res.json(db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id));
});

app.delete('/produtos/:id', (req, res) => {
  const info = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.status(204).send();
});

module.exports = app;