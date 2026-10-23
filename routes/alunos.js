// routes/alunosRotas.js
import express from 'express'
import BD from '../db.js'

const router = express.Router()

// ORDER BY seguro (whitelist)
const ALUNO_ORDER = {
  nome: 'a.nome',
  nome_turma: 't.nome_turma',
  idade: 'a.idade',
  sexo: 'a.sexo',
  id: 'a.id_aluno',
}

// LISTA (GET /alunos?busca=&ordenar=&pg=)
router.get('/', async (req, res) => {
  try {
    const { busca = '', ordenar = 'nome', pg = '1' } = req.query

    const orderCol = ALUNO_ORDER[ordenar] ?? ALUNO_ORDER.nome
    const limite = 10
    const pagina = Math.max(1, parseInt(pg, 10) || 1)
    const offset = (pagina - 1) * limite
    const termo = `%${busca}%`

    const lista = await BD.query(
      `
      SELECT a.id_aluno,
             a.nome,
             a.idade,
             a.sexo,
             t.nome_turma
      FROM alunos a
      INNER JOIN turmas t ON t.id_turma = a.id_turma
      WHERE a.nome ILIKE $1
         OR t.nome_turma ILIKE $1
      ORDER BY ${orderCol}
      LIMIT $2 OFFSET $3
      `,
      [termo, limite, offset]
    )

    const tot = await BD.query(
      `
      SELECT COUNT(*)::int AS total
      FROM alunos a
      INNER JOIN turmas t ON t.id_turma = a.id_turma
      WHERE a.nome ILIKE $1
         OR t.nome_turma ILIKE $1
      `,
      [termo]
    )

    const total = tot.rows[0]?.total ?? 0
    const totalPgs = Math.max(1, Math.ceil(total / limite))

    res.render('alunos/lista', {
      alunos: lista.rows,
      busca,
      ordenar,
      pgAtual: pagina,
      totalPgs,
    })
  } catch (erro) {
    console.error('Erro ao listar alunos', erro)
    res.render('alunos/lista', {
      alunos: [],
      mensagem: erro.message,
      busca: '',
      ordenar: 'nome',
      pgAtual: 1,
      totalPgs: 1,
    })
  }
})

// CRIAR (GET /alunos/novo)
router.get('/novo', async (_req, res) => {
  try {
    const turmas = await BD.query(`SELECT id_turma, nome_turma FROM turmas ORDER BY nome_turma`)
    res.render('alunos/criar', { turmas: turmas.rows, mensagem: '' })
  } catch (e) {
    console.error('Erro ao carregar turmas', e)
    res.render('alunos/criar', { turmas: [], mensagem: 'Erro ao carregar turmas' })
  }
})

// CRIAR (POST /alunos/novo)
router.post('/novo', async (req, res) => {
  const { nome, idade, sexo, id_turma } = req.body
  try {
    await BD.query(
      `INSERT INTO alunos (nome, idade, sexo, id_turma) VALUES ($1, $2, $3, $4)`,
      [nome, idade, sexo, id_turma]
    )
    res.redirect('/alunos')
  } catch (e) {
    console.error('Erro ao criar aluno', e)
    const turmas = await BD.query(`SELECT id_turma, nome_turma FROM turmas ORDER BY nome_turma`)
    res.render('alunos/criar', { turmas: turmas.rows, mensagem: 'Erro ao salvar aluno' })
  }
})

// EDITAR (GET /alunos/:id/editar) — carrega aluno, turmas, disciplinas e notas
router.get('/:id/editar', async (req, res) => {
  try {
    const { id } = req.params

    const rAluno = await BD.query('SELECT * FROM alunos WHERE id_aluno = $1', [id])
    if (!rAluno.rows.length) return res.redirect('/alunos')

    const rTurmas = await BD.query('SELECT id_turma, nome_turma FROM turmas ORDER BY nome_turma')
    const rDisciplinas = await BD.query('SELECT id_disciplina, nome_disciplina FROM disciplinas ORDER BY nome_disciplina')
    const rNotas = await BD.query(`
      SELECT d.nome_disciplina, ad.media, ad.nr_faltas, ad.status,
             ad.id_disciplina, ad.id_aluno
      FROM aluno_disciplina ad
      INNER JOIN disciplinas d ON ad.id_disciplina = d.id_disciplina
      WHERE ad.id_aluno = $1
      ORDER BY d.nome_disciplina
    `, [id])

    res.render('alunos/editar', {
      aluno: rAluno.rows[0],
      turmas: rTurmas.rows,           // <- view usa "turmas"
      disciplinas: rDisciplinas.rows, // <- view usa "disciplinas"
      notas: rNotas.rows,             // <- view usa "notas"
      mensagem: ''
    })
  } catch (e) {
    console.error('Erro ao carregar dados do aluno', e)
    res.redirect('/alunos')
  }
})

// EDITAR (POST /alunos/:id/editar)
router.post('/:id/editar', async (req, res) => {
  const { id } = req.params
  const { nome, idade, sexo, id_turma } = req.body
  try {
    await BD.query(
      `UPDATE alunos SET nome = $1, idade = $2, sexo = $3, id_turma = $4 WHERE id_aluno = $5`,
      [nome, idade, sexo, id_turma, id]
    )
    res.redirect('/alunos')
  } catch (e) {
    console.error('Erro ao atualizar aluno', e)
    res.redirect('/alunos')
  }
})

// DELETAR (POST /alunos/:id/deletar)
router.post('/:id/deletar', async (req, res) => {
  const { id } = req.params
  try {
    await BD.query(`DELETE FROM alunos WHERE id_aluno = $1`, [id])
    res.redirect('/alunos')
  } catch (e) {
    console.error('Erro ao excluir aluno', e)
    res.redirect('/alunos')
  }
})

// LANÇAR NOTA (POST /alunos/:id/lancar-nota) — trigger define status
router.post('/:id/lancar-nota', async (req, res) => {
  try {
    const { id } = req.params
    const { media, faltas, id_disciplina } = req.body

    await BD.query(`
      INSERT INTO aluno_disciplina (id_disciplina, id_aluno, media, nr_faltas)
      VALUES ($1, $2, $3, $4)
    `, [id_disciplina, id, media, faltas])

    res.redirect(`/alunos/${id}/editar`)
  } catch (erro) {
    console.log('Erro ao gravar nota', erro)
    res.redirect(`/alunos/${req.params.id}/editar`)
  }
})

// EXCLUIR NOTA (POST /alunos/:id_disciplina/:id_aluno/deletar-nota)
router.post('/:id_disciplina/:id_aluno/deletar-nota', async (req, res) => {
  try {
    const { id_disciplina, id_aluno } = req.params
    await BD.query(
      'DELETE FROM aluno_disciplina WHERE id_disciplina = $1 AND id_aluno = $2',
      [id_disciplina, id_aluno]
    )
    res.redirect(`/alunos/${id_aluno}/editar`)
  } catch (erro) {
    console.log('Erro ao deletar nota', erro)
    res.redirect(`/alunos/${req.params.id_aluno}/editar`)
  }
})

export default router
