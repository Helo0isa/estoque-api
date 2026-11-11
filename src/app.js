const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

function validarProduto({ nome, preco, quantidade }) {
  if (!nome) return 'Nome é obrigatório';
  if (typeof preco !== 'number' || preco < 0) return 'Preço inválido';
  if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
    return 'Quantidade inválida';
  }
  return null;
}

const buscarPorId = (id) => db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

app.post('/produtos', (req, res) => {
  const erro = validarProduto(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, categoria, preco, quantidade } = req.body;
  const qtd = quantidade ?? 0;
  const info = db
    .prepare('INSERT INTO produtos (nome, categoria, preco, quantidade) VALUES (?, ?, ?, ?)')
    .run(nome, categoria || null, preco, qtd);
  res.status(201).json(buscarPorId(info.lastInsertRowid));
});

app.get('/produtos', (req, res) => {
  res.json(db.prepare('SELECT * FROM produtos').all());
});

app.get('/produtos/:id', (req, res) => {
  const produto = buscarPorId(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

app.put('/produtos/:id', (req, res) => {
  if (!buscarPorId(req.params.id)) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  const erro = validarProduto(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, categoria, preco, quantidade } = req.body;
  db.prepare('UPDATE produtos SET nome = ?, categoria = ?, preco = ?, quantidade = ? WHERE id = ?')
    .run(nome, categoria || null, preco, quantidade ?? 0, req.params.id);
  res.json(buscarPorId(req.params.id));
});

app.delete('/produtos/:id', (req, res) => {
  const info = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.status(204).send();
});

app.post('/produtos/:id/entrada', (req, res) => {
  const produto = buscarPorId(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const { quantidade } = req.body;
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser um inteiro positivo' });
  }

  db.prepare('UPDATE produtos SET quantidade = ? WHERE id = ?')
    .run(produto.quantidade + quantidade, produto.id);
  res.json(buscarPorId(produto.id));
});

app.post('/produtos/:id/saida', (req, res) => {
  const produto = buscarPorId(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const { quantidade } = req.body;
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser um inteiro positivo' });
  }
  if (quantidade > produto.quantidade) {
    return res.status(400).json({ erro: 'Estoque insuficiente' });
  }

  db.prepare('UPDATE produtos SET quantidade = ? WHERE id = ?')
    .run(produto.quantidade - quantidade, produto.id);
  res.json(buscarPorId(produto.id));
});

module.exports = app;