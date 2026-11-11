const request = require('supertest');
const app = require('../src/app');

describe('POST /produtos', () => {
  test('cadastra produto válido e retorna 201', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({ nome: 'Caneta', categoria: 'Papelaria', preco: 2.5, quantidade: 10 });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Caneta');
    expect(res.body.id).toBeDefined();
  });

  test('rejeita produto sem nome com 400', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({ categoria: 'Papelaria', preco: 2.5, quantidade: 10 });
    expect(res.status).toBe(400);
  });
});

const criar = (dados = {}) =>
  request(app)
    .post('/produtos')
    .send({ nome: 'Lápis', categoria: 'Papelaria', preco: 1.5, quantidade: 5, ...dados });

describe('GET /produtos', () => {
  test('lista produtos com 200', async () => {
    await criar();
    const res = await request(app).get('/produtos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /produtos/:id', () => {
  test('retorna produto existente', async () => {
    const { body } = await criar();
    const res = await request(app).get(`/produtos/${body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Lápis');
  });

  test('retorna 404 para produto inexistente', async () => {
    const res = await request(app).get('/produtos/9999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /produtos/:id', () => {
  test('atualiza produto existente', async () => {
    const { body } = await criar();
    const res = await request(app)
      .put(`/produtos/${body.id}`)
      .send({ nome: 'Lápis HB', categoria: 'Papelaria', preco: 2, quantidade: 8 });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Lápis HB');
    expect(res.body.quantidade).toBe(8);
  });

  test('retorna 404 ao atualizar produto inexistente', async () => {
    const res = await request(app)
      .put('/produtos/9999')
      .send({ nome: 'X', categoria: 'Y', preco: 1, quantidade: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /produtos/:id', () => {
  test('remove produto existente com 204', async () => {
    const { body } = await criar();
    const res = await request(app).delete(`/produtos/${body.id}`);
    expect(res.status).toBe(204);
    const busca = await request(app).get(`/produtos/${body.id}`);
    expect(busca.status).toBe(404);
  });

  test('retorna 404 ao excluir produto inexistente', async () => {
    const res = await request(app).delete('/produtos/9999');
    expect(res.status).toBe(404);
  });
});

describe('Validação de produto', () => {
  test('rejeita preço negativo no cadastro', async () => {
    const res = await criar({ preco: -5 });
    expect(res.status).toBe(400);
  });

  test('rejeita quantidade negativa no cadastro', async () => {
    const res = await criar({ quantidade: -1 });
    expect(res.status).toBe(400);
  });

  test('rejeita produto sem preço', async () => {
    const res = await request(app)
      .post('/produtos')
      .send({ nome: 'Borracha', categoria: 'Papelaria', quantidade: 3 });
    expect(res.status).toBe(400);
  });

  test('rejeita preço negativo na edição', async () => {
    const { body } = await criar();
    const res = await request(app)
      .put(`/produtos/${body.id}`)
      .send({ nome: 'Lápis', categoria: 'Papelaria', preco: -1, quantidade: 5 });
    expect(res.status).toBe(400);
  });
});