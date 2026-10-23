// routes/turmasRotas.js (ESM)
import express from 'express';
import BD from '../db.js';

const router = express.Router();

// Listar turmas (R – Read)

// Whitelist p/ ORDER BY (evita SQL injection)
const TURMA_ORDER = {
  nome_turma: 'nome_turma',
  id_turma: 'id_turma'
}

// GET /turmas/
router.get('/', async (req, res) => {
  try {
    const { busca = '', ordenar = 'nome_turma', pg = '1' } = req.query

    const orderCol = TURMA_ORDER[ordenar] ?? TURMA_ORDER.nome_turma
    const limite = 10
    const pagina = Math.max(1, parseInt(pg, 10) || 1)
    const offset = (pagina - 1) * limite
    const termo = `%${busca}%`

    // Lista paginada
    const lista = await BD.query(
      `
      select id_turma, nome_turma
      from turmas
      where nome_turma ilike $1
      order by ${orderCol}
      limit $2 offset $3
      `,
      [termo, limite, offset]
    )

    // Total para paginação
    const tot = await BD.query(
      `select count(*)::int as total
       from turmas
       where nome_turma ilike $1`,
      [termo]
    )
    const total = tot.rows[0]?.total ?? 0
    const totalPgs = Math.max(1, Math.ceil(total / limite))

    // Se sua view usa "turmas", mantenha assim:
    res.render('turmas/lista', {
      turmas: lista.rows,
      busca,
      ordenar,
      pgAtual: pagina,
      totalPgs
    })
  } catch (erro) {
    console.error('Erro ao listar turmas', erro)
    res.render('turmas/lista', { mensagem: erro.message, turmas: [], busca: '', ordenar: 'nome_turma', pgAtual: 1, totalPgs: 1 })
  }
})

// Criar turma (GET)
router.get('/novo', (req, res) => {
  res.render('turmas/criar');
});

// Criar turma (POST)
router.post('/novo', async (req, res) => {
  const { nome_turma } = req.body;
  try {
    await BD.query('INSERT INTO turmas (nome_turma) VALUES ($1)', [nome_turma]);
    res.redirect('/turmas');
  } catch (erro) {
    console.log('Erro ao criar turma', erro);
    res.render('turmas/criar', { mensagem: 'Erro ao salvar turma' });
  }
});

// Editar turma (GET)
router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await BD.query('SELECT * FROM turmas WHERE id_turma = $1', [id]);
    res.render('turmas/editar', { turma: resultado.rows[0] });
  } catch (erro) {
    console.log('Erro ao carregar turma', erro);
    res.redirect('/turmas');
  }
});

// Editar turma (POST)
router.post('/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { nome_turma } = req.body;
  try {
    await BD.query('UPDATE turmas SET nome_turma = $1 WHERE id_turma = $2', [nome_turma, id]);
    res.redirect('/turmas');
  } catch (erro) {
    console.log('Erro ao atualizar turma', erro);
    res.redirect('/turmas');
  }
});

// Excluir turma
router.post('/:id/deletar', async (req, res) => {
  const { id } = req.params;
  try {
    await BD.query('DELETE FROM turmas WHERE id_turma = $1', [id]);
    res.redirect('/turmas');
  } catch (erro) {
    console.log('Erro ao excluir turma', erro);
    res.redirect('/turmas');
  }
});

export default router;
