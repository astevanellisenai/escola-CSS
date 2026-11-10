import express from 'express';
import session from 'express-session';
import BD from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

import loginRotas from "./routes/login.js";
import adminRotas from './routes/admin.js';
import professoresRotas from './routes/professores.js';
import turmasRotas from './routes/turmas.js';
import disciplinasRotas from './routes/disciplinas.js'
import alunosRotas from './routes/alunos.js'
import notasRotas from './routes/notas.js'
import usuariosRotas from './routes/usuarios.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Página inicial (landing)
app.get('/', (req, res) => res.render('landing/index'));

// Sessão
app.use(
  session({
    secret: "sesisenai",
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware de autenticação
const verificarAutenticacao = (req, res, next) => {
  if (req.session.usuarioLogado) {
    res.locals.usuarioLogado = req.session.usuarioLogado;
    res.locals.nomeUsuario = req.session.nomeUsuario;
    res.locals.idUsuario = req.session.idUsuario;
    res.locals.is_admin = req.session.is_admin;
    next();
  } else {
    res.redirect("/auth/login");
  }
};

// Rotas principais
app.use('/auth', loginRotas); // login/logout não exige autenticação
app.use('/admin', verificarAutenticacao, adminRotas);
app.use('/professores', verificarAutenticacao, professoresRotas);
app.use('/turmas', verificarAutenticacao, turmasRotas);
app.use('/disciplinas', verificarAutenticacao, disciplinasRotas);
app.use('/alunos', verificarAutenticacao, alunosRotas);
app.use('/notas', verificarAutenticacao , notasRotas);
app.use('/usuarios', verificarAutenticacao , usuariosRotas);

// Testa a conexão com o PostgreSQL antes de iniciar o servidor.
const porta = 3002;

async function iniciarServidor() {
  try {
    const resultado = await BD.query('SELECT current_database() AS nome');

    console.log('✅ PostgreSQL conectado com sucesso!');
    console.log('📁 Banco de dados: ' + resultado.rows[0].nome);

    app.listen(porta, () => {
      console.log('✅ Servidor iniciado: http://localhost:' + porta);
    });
  } catch (erro) {
    console.error('❌ Não foi possível conectar ao PostgreSQL.');
    console.error('Motivo: ' + erro.message);
    console.error('Verifique se o PostgreSQL está ativo e confira a conexão em db.js.');

    await BD.end();
    process.exitCode = 1;
  }
}

iniciarServidor();
