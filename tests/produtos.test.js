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