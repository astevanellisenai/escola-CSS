// routes/notasRotas.js
import express from 'express';
import BD from '../db.js';

const router = express.Router();
//[pause]
const NOTAS_ORDER = {
  disciplina : 'd.nome_disciplina ASC',
  aluno      : 'a.nome ASC',
  turma      : 't.nome_turma ASC',
  status     : 'ad.status ASC, d.nome_disciplina ASC',
  media_desc : 'ad.media DESC, d.nome_disciplina ASC',
  faltas_desc: `ad.nr_faltas DESC, 
                d.nome_disciplina ASC`,
};

//[pause]
function parseDecimalFlex(v, def = 0) {
  if (v === undefined || v === null) return def;
  const s = String(v).trim().replace(',', '.');
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : def;
}

//[pause]
function parseIntFlex(v, def = 0) {
  if (v === undefined || v === null) return def;
  const s = String(v).trim();
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : def;
}

//[pause]
router.get('/', async (req, res) => {
  try {
    const { busca = '', 
            ordenar = 'disciplina', 
            pg = '1' } = req.query;

    const limite  = 10;
    const pagina  = Math.max(1, parseInt(pg, 10) || 1);
    const offset  = (pagina - 1) * limite;
    const termo   = `%${busca}%`;
    const orderBy = NOTAS_ORDER[ordenar] ?? 
                    NOTAS_ORDER.disciplina;

    const lista = await BD.query(
      `
      SELECT
        ad.id_disciplina,
        ad.id_aluno,
        ad.media,
        ad.nr_faltas,
        COALESCE(ad.status,'') AS status,
        d.nome_disciplina,
        a.nome           AS nome_aluno,
        t.nome_turma
      FROM aluno_disciplina ad
      JOIN alunos       a ON 
           a.id_aluno = ad.id_aluno
      JOIN disciplinas  d ON
           d.id_disciplina = ad.id_disciplina
      LEFT JOIN turmas  t ON 
           t.id_turma = a.id_turma
      WHERE
        a.nome ILIKE $1
        OR d.nome_disciplina ILIKE $1
        OR COALESCE(t.nome_turma,'') ILIKE $1
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
      `,
      [termo, limite, offset]
    );

    const tot = await BD.query(
      `
      SELECT COUNT(*)::int AS total
      FROM aluno_disciplina ad
      JOIN alunos       a ON 
           a.id_aluno = ad.id_aluno
      JOIN disciplinas  d ON 
           d.id_disciplina = ad.id_disciplina
      LEFT JOIN turmas  t ON 
           t.id_turma = a.id_turma
      WHERE
        a.nome ILIKE $1
        OR d.nome_disciplina ILIKE $1
        OR COALESCE(t.nome_turma,'') ILIKE $1
      `,
      [termo]
    );

    const total    = tot.rows[0]?.total ?? 0;
    const totalPgs = Math.max(1, Math.ceil(total / 
                     limite));

    res.render('notas/lista', {
      vetorDados: lista.rows,
      busca,
      ordenar,
      pgAtual: pagina,
      totalPgs,
      mensagem: ''
    });
  } catch (erro) {
    console.error('Erro ao listar notas', erro);
    res.render('notas/lista', {
      vetorDados: [],
      busca: '',
      ordenar: 'disciplina',
      pgAtual: 1,
      totalPgs: 1,
      mensagem: erro.message
    });
  }
});
//[pause]

router.get('/nova', async (req, res) => {
  try {
    const [alunos, disciplinas] = await Promise.all([
      BD.query(`SELECT 
                  id_aluno, 
                  nome 
                FROM 
                  alunos 
                ORDER BY nome ASC`),
      BD.query(`SELECT 
                 id_disciplina,
                 nome_disciplina 
                FROM disciplinas 
                ORDER BY nome_disciplina ASC`),
    ]);

    res.render('notas/criar', {
      titulo: 'Lançar nova nota',
      modo: 'novo',
      alunos: alunos.rows,
      disciplinas: disciplinas.rows,
      nota: { id_aluno: '', 
              id_disciplina: '', 
              media: '', 
              nr_faltas: '' },
      mensagem: ''
    });
  } catch (erro) {
    console.error(`Erro ao abrir novo lançamento de
                   nota`, erro);
    res.redirect('/notas');
  }
});

//[pause]
router.post('/nova', async (req, res) => {
  try {
    const id_aluno      = 
          parseIntFlex(req.body.id_aluno);
    const id_disciplina =
          parseIntFlex(req.body.id_disciplina);
    const media         = 
          parseDecimalFlex(req.body.media, 0);
    const nr_faltas     = 
          parseIntFlex(req.body.nr_faltas, 0);

    if (!id_aluno || !id_disciplina) {
      throw new Error(`Aluno e Disciplina são 
        obrigatórios.`);
    }

    const sql = `
      INSERT INTO aluno_disciplina
     (id_aluno, id_disciplina, media, nr_faltas)
      VALUES ($1, $2, $3, $4)
    `;
    await BD.query(sql, [id_aluno, 
                        id_disciplina,
                         media, 
                        nr_faltas]);

    res.redirect('/notas');
  } catch (erro) {
    console.error('Erro ao lançar nota', erro);
    try {
      const [alunos, disciplinas] = 
        await Promise.all([
        BD.query(`SELECT 
                   id_aluno, 
                   nome
                    FROM alunos 
                    ORDER BY nome ASC`),
        BD.query(`SELECT 
                   id_disciplina,
                    nome_disciplina
                     FROM disciplinas
                      ORDER BY nome_disciplina ASC`),
      ]);

      res.render('notas/criar', {
        titulo: 'Lançar nova nota',
        modo: 'novo',
        alunos: alunos.rows,
        disciplinas: disciplinas.rows,
        nota: {
          id_aluno: req.body.id_aluno ?? '',
          id_disciplina: req.body.id_disciplina ?? '',
          media: req.body.media ?? '',
          nr_faltas: req.body.nr_faltas ?? ''
        },
        mensagem: erro.message
      });
    } catch (e2) {
      console.error(`Erro ao recarregar 
        form de nova nota`, e2);
      res.redirect('/notas');
    }
  }
});

//[pause]
router.get('/:id_disciplina/:id_aluno/editar', 
  async (req, res) => {
  try {
    const { id_disciplina, id_aluno } = req.params;

    const registro = await BD.query(
      `
      SELECT ad.id_disciplina, ad.id_aluno, 
             ad.media, ad.nr_faltas,
             a.nome AS nome_aluno, d.nome_disciplina
      FROM aluno_disciplina ad
      JOIN alunos a ON a.id_aluno = ad.id_aluno
      JOIN disciplinas d ON 
         d.id_disciplina = ad.id_disciplina
      WHERE ad.id_disciplina = $1 AND
       ad.id_aluno = $2
      `,
      [id_disciplina, id_aluno]
    );

    if (!registro.rowCount) {
      return res.redirect('/notas');
    }

     res.render('notas/editar', {
      titulo: 'Editar lançamento de nota',
      modo: 'editar',
      alunos: [],         
      disciplinas: [],     
      nota: registro.rows[0],
      mensagem: ''
    });
  } catch (erro) {
    console.error(`Erro ao abrir edição de nota`, erro);
    res.redirect('/notas');
  }
});

//[pause]
router.post('/:id_disciplina/:id_aluno/editar', 
  async (req, res) => {
  const { id_disciplina: idDiscOld, 
          id_aluno: idAluOld } = req.params;

  try {
    const media     = 
          parseDecimalFlex(req.body.media, 0);
    const nr_faltas =
          parseIntFlex(req.body.nr_faltas, 0);

    const sql = `
      UPDATE aluno_disciplina
         SET media = $1,
             nr_faltas = $2
       WHERE id_disciplina = $3 AND id_aluno = $4
      RETURNING 1
    `;
    const r = await BD.query(sql, [
      media,
      nr_faltas,
      parseIntFlex(idDiscOld),
      parseIntFlex(idAluOld),
    ]);

    if (!r.rowCount) {
      throw new Error(`Lançamento não encontrado 
        para atualizar.`);
    }

    res.redirect('/notas');
  } catch (erro) {
    console.error('Erro ao salvar edição de nota', erro);
 
    res.render('notas/editar', {
      titulo: 'Editar lançamento de nota',
      modo: 'editar',
      alunos: [],
      disciplinas: [],
      nota: {
        id_aluno: parseIntFlex(idAluOld),
        id_disciplina: parseIntFlex(idDiscOld),
        media: req.body.media ?? '',
        nr_faltas: req.body.nr_faltas ?? '',
        nome_aluno: req.body.nome_aluno,          
        nome_disciplina: req.body.nome_disciplina 
      },
      mensagem: erro.message
    });
  }
});

//[pause]
router.post('/:id_disciplina/:id_aluno/deletar', 
  async (req, res) => {
  try {
    const { id_disciplina, id_aluno } = req.params;
    await BD.query(
      `DELETE FROM aluno_disciplina 
       WHERE id_disciplina = $1 AND id_aluno = $2`,
      [id_disciplina, id_aluno]
    );
    res.redirect('/notas');
  } catch (erro) {
    console.error('Erro ao excluir nota', erro);
    res.redirect('/notas');
  }
});

export default router;
