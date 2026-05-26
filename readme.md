# 🎤 Sistema de Palestras

Aplicação web completa para gerenciamento de eventos e palestras, com cadastro de usuários, autenticação, controle de acesso por perfil e inscrição em eventos.

---

## 📋 Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Segurança](#segurança)
- [Banco de dados](#banco-de-dados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como executar](#como-executar)
- [Rotas da API](#rotas-da-api)
- [Perfis de acesso](#perfis-de-acesso)

---

## Sobre o projeto

O **Sistema de Palestras** é uma aplicação web desenvolvida como projeto prático para consolidar conceitos de desenvolvimento full stack. O sistema permite que qualquer pessoa crie uma conta, faça login e visualize eventos disponíveis. Usuários com perfil administrador podem cadastrar novas palestras, enquanto usuários comuns podem se inscrever nos eventos de interesse.

---

## Tecnologias utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| Angular | 19 | Framework principal, SPA |
| Bootstrap | 5.3 | Estilização e responsividade |
| ng-bootstrap | 17 | Componentes Bootstrap para Angular |
| TypeScript | 5.6 | Tipagem estática |
| RxJS | 7.8 | Programação reativa, HttpClient |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | LTS | Ambiente de execução |
| Express | 4.19 | Framework HTTP, API REST |
| mysql2 | 3.9 | Conexão com o banco de dados |
| bcrypt | 5.1 | Criptografia de senhas |
| cors | 2.8 | Liberação de acesso cross-origin |

### Banco de dados
| Tecnologia | Uso |
|---|---|
| MySQL (via WAMP) | Persistência dos dados |
| phpMyAdmin | Interface de administração do banco |

---

## Arquitetura

A aplicação segue o padrão de três camadas:

```
Navegador (Angular :4200)
        ↓  HTTP / JSON
API REST (Node.js + Express :3000)
        ↓  SQL
Banco de dados (MySQL :3306)
```

O Angular nunca acessa o banco diretamente. Toda comunicação passa pela API REST construída com Express, que valida os dados, aplica regras de negócio e responde em JSON.

---

## Funcionalidades

### Usuário comum
- [x] Cadastro com nome, e-mail e senha
- [x] Login com autenticação por e-mail e senha
- [x] Visualização da lista de eventos disponíveis
- [x] Inscrição em palestras de interesse
- [x] Bloqueio de inscrição duplicada no mesmo evento

### Administrador
- [x] Todas as funcionalidades do usuário comum
- [x] Acesso ao painel de cadastro de eventos
- [x] Cadastro de palestras com título, descrição, palestrante, local e data
- [x] Visualização dos eventos sem o botão "Participar"

---

## Segurança

### Criptografia de senhas com bcrypt
As senhas **nunca são armazenadas em texto puro** no banco de dados. O sistema utiliza a biblioteca `bcrypt` com fator de custo 10 para gerar um hash seguro no momento do cadastro e compará-lo no login.

```js
// Cadastro — gera o hash antes de salvar
const senhaHash = await bcrypt.hash(senha, 10);

// Login — compara a senha digitada com o hash salvo
const senhaValida = await bcrypt.compare(senha, verificaUsuario.senha);
```

### Proteção contra SQL Injection
Todas as queries utilizam **prepared statements** com parâmetros `?`, impedindo a injeção de comandos SQL maliciosos.

```js
await conexao.execute(
  'INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)',
  [email, nome, senhaHash]
);
```

### Controle de acesso por perfil
O campo `admin` (boolean) na tabela `usuarios` define o nível de acesso. O frontend oculta rotas e botões conforme o perfil, e o backend é a camada responsável por garantir a integridade dos dados.

### Prevenção de inscrições duplicadas
A tabela `inscricoes` possui uma constraint `UNIQUE (idUsuario, idPalestra)`, garantindo no nível do banco que um usuário não pode se inscrever duas vezes no mesmo evento. O backend trata o erro `ER_DUP_ENTRY` e retorna uma mensagem amigável ao usuário.

### CORS configurado
O middleware `cors` está habilitado no Express para permitir apenas requisições originadas do frontend Angular.

---

## Banco de dados

### Diagrama de tabelas

```
usuarios
├── ID          INT PK AUTO_INCREMENT
├── email       VARCHAR(255)
├── nome        VARCHAR(255)
├── senha       VARCHAR(255)  ← hash bcrypt
└── admin       BOOLEAN DEFAULT 0

palestra
├── id              INT PK AUTO_INCREMENT
├── titulo          VARCHAR(255)
├── descricao       VARCHAR(255)
├── nomePalestrante VARCHAR(255)
├── localEvento     VARCHAR(255)
└── dataEvento      TIMESTAMP

inscricoes
├── id          INT PK AUTO_INCREMENT
├── idUsuario   INT FK → usuarios(ID)
├── idPalestra  INT FK FK → palestra(id)
└── UNIQUE(idUsuario, idPalestra)
```

### Script de criação

```sql
CREATE DATABASE IF NOT EXISTS palestras;
USE palestras;

CREATE TABLE IF NOT EXISTS usuarios (
  ID    INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255),
  nome  VARCHAR(255),
  senha VARCHAR(255),
  admin BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS palestra (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  titulo          VARCHAR(255),
  descricao       VARCHAR(255),
  nomePalestrante VARCHAR(255),
  localEvento     VARCHAR(255),
  dataEvento      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inscricoes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario  INT,
  idPalestra INT,
  FOREIGN KEY (idUsuario)  REFERENCES usuarios(ID),
  FOREIGN KEY (idPalestra) REFERENCES palestra(id),
  UNIQUE (idUsuario, idPalestra)
);
```

---

## Estrutura do projeto

```
sistemaPalestras/
│
├── backend/
│   ├── db.js          ← pool de conexão MySQL
│   ├── server.js      ← API REST (rotas Express)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── index.html
    │   ├── main.ts
    │   ├── styles.css
    │   └── app/
    │       ├── app.component.ts    ← navbar + controle de sessão
    │       ├── app.component.html
    │       ├── app.routes.ts       ← definição de rotas Angular
    │       ├── app.config.ts       ← providers globais
    │       ├── auth.ts             ← serviço de autenticação (localStorage)
    │       ├── palestra.ts         ← serviço + interface Palestra
    │       ├── home/
    │       │   ├── home.ts         ← lista eventos + inscrição
    │       │   └── home.html
    │       ├── cadastro/
    │       │   ├── cadastro.ts     ← formulário reativo + validação
    │       │   └── cadastro.html
    │       ├── login/
    │       │   ├── login.ts        ← autenticação + redirecionamento
    │       │   └── login.html
    │       └── cadastrar-evento/
    │           ├── cadastrar-evento.ts   ← painel admin
    │           └── cadastrar-evento.html
    ├── angular.json
    └── package.json
```

---

## Como executar

### Pré-requisitos
- Node.js (LTS)
- Angular CLI (`npm install -g @angular/cli`)
- WAMP Server (Windows) ou XAMPP (Linux)

### 1. Banco de dados
1. Inicie o WAMP e certifique-se de que o ícone está **verde**
2. Acesse `http://localhost/phpmyadmin`
3. Execute o script SQL da seção [Banco de dados](#banco-de-dados)

### 2. Backend
```bash
cd backend
npm install
node server.js
# Servidor rodando na porta 3000
```

### 3. Frontend
```bash
cd frontend
npm install
ng serve
# Aplicação disponível em http://localhost:4200
```

### 4. Criar o primeiro administrador
Cadastre um usuário normalmente pela tela de cadastro e execute no phpMyAdmin:
```sql
UPDATE usuarios SET admin = 1 WHERE email = 'seu@email.com';
```

---

## Rotas da API

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/cadastro` | Cria novo usuário | Pública |
| `POST` | `/api/login` | Autentica usuário | Pública |
| `POST` | `/api/admin` | Cadastra nova palestra | Admin |
| `GET` | `/api/palestras` | Lista todos os eventos | Logado |
| `POST` | `/api/inscricao` | Inscreve usuário em evento | Logado |

---

## Perfis de acesso

| Funcionalidade | Usuário | Admin |
|---|:---:|:---:|
| Cadastrar conta | ✅ | ✅ |
| Fazer login | ✅ | ✅ |
| Ver eventos | ✅ | ✅ |
| Inscrever-se em evento | ✅ | ❌ |
| Cadastrar palestras | ❌ | ✅ |
| Acessar painel admin | ❌ | ✅ |

---

## Autor

Desenvolvido como projeto prático do **Módulo IV** — Projeto com Angular, Node.js e MySQL.
