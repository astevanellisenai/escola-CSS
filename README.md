# 🏫 Sistema Escolar

Sistema web para gerenciamento de **alunos, professores, turmas, disciplinas, notas, faltas e usuários**, desenvolvido com **Node.js**, **Express**, **EJS** e **PostgreSQL**.

O projeto possui uma página inicial pública e uma área administrativa protegida por login, permitindo o gerenciamento dos principais dados acadêmicos de uma escola.

---

## 📌 Funcionalidades

### 🌐 Área pública

- Página inicial da aplicação
- Apresentação do sistema
- Acesso à área de login

### 🔐 Autenticação

- Login de usuários
- Controle de sessão com `express-session`
- Validação de usuário autenticado
- Proteção das rotas administrativas
- Logout

### 👨‍🏫 Professores

- Listagem de professores
- Cadastro
- Edição
- Exclusão
- Registro de telefone
- Registro de formação

### 🏫 Turmas

- Listagem de turmas
- Cadastro
- Edição
- Exclusão

### 📚 Disciplinas

- Listagem de disciplinas
- Cadastro
- Edição
- Exclusão
- Associação da disciplina com professor

### 👨‍🎓 Alunos

- Listagem de alunos
- Cadastro
- Edição
- Exclusão
- Registro de idade
- Registro de CPF
- Registro de sexo
- Associação do aluno com uma turma

### 📝 Notas e faltas

- Associação entre aluno e disciplina
- Lançamento de média
- Registro de número de faltas
- Controle da situação acadêmica
- Status de aprovado, recuperação ou reprovado

### 👤 Usuários

- Listagem de usuários
- Cadastro
- Edição
- Exclusão
- Controle de usuário ativo
- Utilização dos usuários para autenticação no sistema

---

## 🛠️ Tecnologias utilizadas

- Node.js
- Express 5
- EJS
- PostgreSQL
- pg
- express-session
- Nodemon
- JavaScript
- HTML
- CSS

---

## 📁 Estrutura do projeto

```text
escola-Twind/
│
├── public/                         # Arquivos estáticos da aplicação
│
├── routes/                         # Rotas da aplicação
│   ├── admin.js
│   ├── alunos.js
│   ├── disciplinas.js
│   ├── login.js
│   ├── notas.js
│   ├── professores.js
│   ├── turmas.js
│   └── usuarios.js
│
├── views/                          # Interfaces EJS
│   ├── admin/
│   ├── alunos/
│   ├── disciplinas/
│   ├── includes/
│   ├── landing/
│   ├── notas/
│   ├── professores/
│   ├── turmas/
│   └── usuarios/
│
├── app.js                          # Arquivo principal da aplicação
├── db.js                           # Configuração da conexão PostgreSQL
├── escola.sql                      # Estrutura e dados iniciais do banco
├── usuários.sql                    # Script de criação do usuário inicial
├── TRIGGER.sql                     # Triggers do banco de dados
├── twind.config.js                 # Configuração visual do projeto
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- Git

Você pode verificar a instalação do Node.js e do npm com:

```bash
node -v
npm -v
```

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/astevanellisenai/escola-Twind.git
```

Entre na pasta:

```bash
cd escola-Twind
```

### 2. Instalar as dependências

```bash
npm install
```

O comando instala automaticamente as dependências definidas no `package.json`.

Caso seja necessário instalar o Nodemon separadamente:

```bash
npm install nodemon
```

Ou globalmente:

```bash
npm install -g nodemon
```

---

## 📦 Principais dependências

O projeto utiliza:

```text
express
ejs
pg
express-session
nodemon
```

O projeto utiliza módulos ES através da configuração:

```json
"type": "module"
```

O `package.json` está configurado para iniciar o projeto com Nodemon:

```json
"scripts": {
  "start": "nodemon app.js"
}
```

---

## 🗄️ Configuração do banco de dados

Crie no PostgreSQL um banco chamado:

```text
escola
```

Depois execute o arquivo:

```text
escola.sql
```

O script cria as principais tabelas:

```text
professores
turmas
disciplinas
alunos
aluno_disciplina
```

Para criar a tabela de usuários e o usuário inicial, também pode ser utilizado:

```text
usuários.sql
```

O projeto também possui:

```text
TRIGGER.sql
```

para implementação de triggers no banco de dados.

---

## 🔗 Relacionamentos do banco de dados

Estrutura principal:

```text
professores
    │
    └── disciplinas
            │
            └── aluno_disciplina
                    │
                    └── alunos
                           │
                           └── turmas
```

Os principais relacionamentos são:

- `disciplinas.id_professor` → `professores.id_professor`
- `alunos.id_turma` → `turmas.id_turma`
- `aluno_disciplina.id_disciplina` → `disciplinas.id_disciplina`
- `aluno_disciplina.id_aluno` → `alunos.id_aluno`

A tabela `aluno_disciplina` utiliza uma chave primária composta por:

```text
id_disciplina + id_aluno
```

Ela armazena informações acadêmicas como média, faltas e status do aluno em cada disciplina.

---

## 🔌 Configuração da conexão

A conexão com o PostgreSQL está definida no arquivo:

```text
db.js
```

Configuração utilizada atualmente:

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const BD = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'escola',
  password: 'admin',
  port: 5432
});

export default BD;
```

Caso sua instalação do PostgreSQL possua usuário ou senha diferentes, altere essas informações no arquivo `db.js`.

> Para projetos em produção, recomenda-se utilizar variáveis de ambiente para armazenar dados de conexão e outras informações sensíveis.

---

## ▶️ Executando o projeto

Execute:

```bash
npm start
```

O projeto utiliza **Nodemon**, portanto o servidor será reiniciado automaticamente sempre que houver alterações no código.

A aplicação ficará disponível em:

```text
http://localhost:3002
```

---

## 🔑 Usuário de teste

O arquivo `usuários.sql` possui um usuário inicial para testes.

### Administrador

```text
Usuário: admin
Senha: 123
```

> Essas credenciais são destinadas somente ao ambiente didático/de desenvolvimento e devem ser alteradas antes de qualquer publicação real do sistema.

---

## 🧭 Principais rotas

| Rota | Descrição |
|---|---|
| `/` | Página inicial pública |
| `/auth/login` | Login |
| `/admin` | Área administrativa |
| `/professores` | Gerenciamento de professores |
| `/turmas` | Gerenciamento de turmas |
| `/disciplinas` | Gerenciamento de disciplinas |
| `/alunos` | Gerenciamento de alunos |
| `/notas` | Gerenciamento de notas e faltas |
| `/usuarios` | Gerenciamento de usuários |

As rotas administrativas exigem que o usuário esteja autenticado.

---

## 📊 Situação acadêmica

A tabela `aluno_disciplina` permite registrar:

```text
media
nr_faltas
status
```

Entre os status utilizados no banco de dados estão:

```text
Aprovado
Recuperação
Reprovado
```

Isso permite acompanhar o desempenho do aluno individualmente em cada disciplina.

---

## 🎨 Interface

O projeto possui uma configuração visual própria no arquivo:

```text
twind.config.js
```

A configuração define uma paleta de cores para a interface, incluindo:

- Azul para elementos principais do sistema
- Verde para ações de sucesso e edição
- Vermelho para exclusões e erros
- Tons neutros para fundos e textos

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido para fins educacionais, aplicando conceitos de:

- Desenvolvimento Web Backend
- Node.js e Express
- Renderização com EJS
- CRUD
- Sessões e autenticação
- PostgreSQL
- Chaves primárias e estrangeiras
- Relacionamentos entre tabelas
- Chave primária composta
- Consultas SQL
- Notas e faltas escolares
- Rotas protegidas
- Integração entre Backend e banco de dados
- Organização de rotas e views

---

## 📚 Projeto Sistema Escolar

Este repositório pode ser utilizado como exemplo prático de integração entre uma aplicação web Node.js e um banco de dados PostgreSQL, contemplando autenticação, gerenciamento de alunos, professores, turmas, disciplinas, usuários, notas e faltas.

Projeto desenvolvido para fins educacionais no **SESI/SENAI**.
