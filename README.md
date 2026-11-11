# Controle de Estoque

Aplicação web para cadastro de produtos e controle de entradas e saídas de estoque,
com API REST própria, testes automatizados (TDD) e versionamento com Git.

## Tecnologias
- Node.js + Express (API REST)
- SQLite com better-sqlite3 (persistência)
- HTML, CSS e JavaScript (interface)
- Jest + Supertest (testes)

## Pré-requisitos
- Node.js 18 ou superior
- Git

## Instalação
1 - git clone https://github.com/Helo0isa/estoque-api.git

2 - cd estoque-api

3 - npm install

## Execução
1 - npm start

2 - Acesse http://localhost:3000

## Testes
npm test

## Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /produtos | Lista produtos |
| GET | /produtos/:id | Busca um produto |
| POST | /produtos | Cadastra produto |
| PUT | /produtos/:id | Atualiza produto |
| DELETE | /produtos/:id | Exclui produto |
| POST | /produtos/:id/entrada | Registra entrada de estoque |
| POST | /produtos/:id/saida | Registra saída de estoque |

Exemplo de corpo (POST /produtos):
{ "nome": "Caneta", "categoria": "Papelaria", "preco": 2.5, "quantidade": 10 }

## Regras de negócio
- Nome obrigatório; preço e quantidade não podem ser negativos.
- A saída não pode ser maior que o estoque disponível.

## Desenvolvimento (TDD e Git)
O projeto foi construído com o ciclo Red, Green e Refactor, com commits separados
para cada etapa. Cada funcionalidade foi feita em uma branch e integrada por Pull Request.

## Integrantes
- Heloisa Avelino Mazon
- Filipe Henrique Ricci
- Guilherme Avelino Betelli

----
Análise e desenvolvimento de sistemas - Profº Ederaldo Luiz Ratz
