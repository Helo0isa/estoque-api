const API = '/produtos';
const $ = (id) => document.getElementById(id);
const form = $('form-produto');
let produtos = [];

function escapeHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarMensagem(texto, erro = false) {
  const el = $('mensagem');
  el.textContent = texto;
  el.className = 'mensagem ' + (erro ? 'erro' : 'ok');
  el.hidden = false;
  clearTimeout(mostrarMensagem.timer);
  mostrarMensagem.timer = setTimeout(() => (el.hidden = true), 4000);
}

async function requisicao(url, opcoes = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opcoes });
  if (res.status === 204) return null;
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

function renderizar() {
  $('vazio').hidden = produtos.length > 0;
  $('lista').innerHTML = produtos.map((p) => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.nome)}</td>
      <td>${escapeHtml(p.categoria)}</td>
      <td>${formatarPreco(p.preco)}</td>
      <td>${p.quantidade}</td>
      <td class="acoes">
        <button data-acao="entrada" data-id="${p.id}">+ Entrada</button>
        <button data-acao="saida" data-id="${p.id}">- Saída</button>
        <button data-acao="editar" data-id="${p.id}" class="secundario">Editar</button>
        <button data-acao="excluir" data-id="${p.id}" class="perigo">Excluir</button>
      </td>
    </tr>
  `).join('');
}

async function carregarProdutos() {
  try {
    produtos = await requisicao(API);
    renderizar();
  } catch (err) {
    mostrarMensagem(err.message, true);
  }
}

function limparFormulario() {
  form.reset();
  $('produto-id').value = '';
  $('btn-salvar').textContent = 'Cadastrar';
  $('btn-cancelar').hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('produto-id').value;
  const dados = {
    nome: $('nome').value.trim(),
    categoria: $('categoria').value.trim(),
    preco: Number($('preco').value),
    quantidade: Number($('quantidade').value),
  };
  try {
    if (id) {
      await requisicao(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
      mostrarMensagem('Produto atualizado!');
    } else {
      await requisicao(API, { method: 'POST', body: JSON.stringify(dados) });
      mostrarMensagem('Produto cadastrado!');
    }
    limparFormulario();
    carregarProdutos();
  } catch (err) {
    mostrarMensagem(err.message, true);
  }
});

$('btn-cancelar').addEventListener('click', limparFormulario);

$('lista').addEventListener('click', async (e) => {
  const botao = e.target.closest('button');
  if (!botao) return;
  const { acao, id } = botao.dataset;
  const produto = produtos.find((p) => String(p.id) === id);

  try {
    if (acao === 'excluir') {
      if (!confirm(`Excluir "${produto.nome}"?`)) return;
      await requisicao(`${API}/${id}`, { method: 'DELETE' });
      mostrarMensagem('Produto excluído!');
      carregarProdutos();
    } else if (acao === 'editar') {
      $('produto-id').value = produto.id;
      $('nome').value = produto.nome;
      $('categoria').value = produto.categoria ?? '';
      $('preco').value = produto.preco;
      $('quantidade').value = produto.quantidade;
      $('btn-salvar').textContent = 'Salvar alterações';
      $('btn-cancelar').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const texto = acao === 'entrada' ? 'entrada' : 'saída';
      const valor = Number(prompt(`Quantidade de ${texto} para "${produto.nome}":`));
      if (!valor) return;
      await requisicao(`${API}/${id}/${acao}`, {
        method: 'POST',
        body: JSON.stringify({ quantidade: valor }),
      });
      mostrarMensagem(`Registrada ${texto} de ${valor} unidade(s).`);
      carregarProdutos();
    }
  } catch (err) {
    mostrarMensagem(err.message, true);
  }
});

carregarProdutos();