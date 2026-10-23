// routes/disciplinasRotas.js
import express from "express";
import BD from "../db.js";

const router = express.Router();

// Whitelist para ORDER BY (segurança)
const DISC_ORDER = {
  nome_disciplina: 'd.nome_disciplina',
  nome_professor: 'p.nome_professor',
}

router.get('/', async (req, res) => {
  try {
    const { busca = '', ordenar = 'nome_disciplina', pg = '1' } = req.query

    const orderCol = DISC_ORDER[ordenar] ?? DISC_ORDER.nome_disciplina
    const limite = 10
    const pagina = Math.max(1, parseInt(pg, 10) || 1)
    const offset = (pagina - 1) * limite
    const termo = `%${busca}%`

    const lista = await BD.query(
      `
      select d.id_disciplina,
             d.nome_disciplina,
             coalesce(p.nome_professor, '—') as nome_professor
      from disciplinas d
        left join professores p on p.id_professor = d.id_professor
      where d.nome_disciplina ilike $1
         or p.nome_professor   ilike $1
      order by ${orderCol}
      limit $2 offset $3
      `,
      [termo, limite, offset]
    )

    const tot = await BD.query(
      `
      select count(*)::int as total
      from disciplinas d
        left join professores p on p.id_professor = d.id_professor
      where d.nome_disciplina ilike $1
         or p.nome_professor   ilike $1
      `,
      [termo]
    )

    const total = tot.rows[0]?.total ?? 0
    const totalPgs = Math.max(1, Math.ceil(total / limite))

    res.render('disciplinas/lista', {
      vetorDados: lista.rows,
      busca,
      ordenar,
      pgAtual: pagina,
      totalPgs,
    })
  } catch (erro) {
    console.error('Erro ao listar disciplinas', erro)
    res.render('disciplinas/lista', {
      vetorDados: [],
      mensagem: erro.message,
      busca: '',
      ordenar: 'nome_disciplina',
      pgAtual: 1,
      totalPgs: 1,
    })
  }
})

/* === CRIAR (GET) === */
router.get('/novo', async (_req, res) => {
  try {
    const rProf = await BD.query(
      'SELECT id_professor, nome_professor FROM professores ORDER BY nome_professor'
    );
    res.render('disciplinas/criar', {
      professoresCadastrados: rProf.rows,
      mensagem: ''
    });
  } catch (erro) {
    console.error('Erro ao abrir criação de disciplina', erro);
    res.render('disciplinas/criar', {
      professoresCadastrados: [],
      mensagem: 'Erro ao carregar professores'
    });
  }
});

/* === CRIAR (POST) === */
router.post('/novo', async (req, res) => {
  try {
    const { nome_disciplina, id_professor } = req.body;
    await BD.query(
      'INSERT INTO disciplinas (nome_disciplina, id_professor) VALUES ($1, $2)',
      [nome_disciplina, id_professor || null]
    );
    res.redirect('/disciplinas');
  } catch (erro) {
    console.error('Erro ao criar disciplina', erro);
    res.redirect('/disciplinas');
  }
});

/* === EDITAR (GET) === */
router.get("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;

    const rDisc = await BD.query(
      "SELECT * FROM disciplinas WHERE id_disciplina = $1",
      [id]
    );
    if (!rDisc.rows.length) return res.redirect("/disciplinas");

    const rProf = await BD.query(
      "SELECT id_professor, nome_professor FROM professores ORDER BY nome_professor"
    );

    res.render("disciplinas/editar", {
      disciplina: rDisc.rows[0],
      professoresCadastrados: rProf.rows,
    });
  } catch (erro) {
    console.error("Erro ao abrir edição de disciplina", erro);
    res.render("disciplinas/editar", {
      disciplina: null,
      professoresCadastrados: [],
      mensagem: "Erro ao carregar dados",
    });
  }
});

/* === EDITAR (POST) === */
router.post("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_disciplina, id_professor } = req.body;

    await BD.query(
      "UPDATE disciplinas SET nome_disciplina = $1, id_professor = $2 WHERE id_disciplina = $3",
      [nome_disciplina, id_professor || null, id]
    );

    res.redirect("/disciplinas");
  } catch (erro) {
    console.error("Erro ao salvar disciplina", erro);
    res.redirect("/disciplinas");
  }
});

// DELETAR (POST)
router.post('/:id/deletar', async (req, res) => {
  try {
    const { id } = req.params;
    await BD.query('DELETE FROM disciplinas WHERE id_disciplina = $1', [id]);
    res.redirect('/disciplinas');
  } catch (erro) {
    console.error('Erro ao excluir disciplina', erro);
    res.redirect('/disciplinas');
  }
});

export default router;
