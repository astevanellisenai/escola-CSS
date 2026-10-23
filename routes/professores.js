// routes/professoresRotas.js (ESM)
import express from "express";
import BD from "../db.js"; // Pool do pg já configurado em ESM no projeto

const router = express.Router();

// Whitelist para ORDER BY (segurança)
const PROF_ORDER = {
  nome_professor: 'nome_professor',
  telefone: 'telefone',
  formacao: 'formacao',
  id: 'id_professor',
}

router.get('/', async (req, res) => {
  try {
    const { busca = '', ordenar = 'nome_professor', pg = '1' } = req.query

    const orderCol = PROF_ORDER[ordenar] ?? PROF_ORDER.nome_professor
    const limite = 10
    const pagina = Math.max(1, parseInt(pg, 10) || 1)
    const offset = (pagina - 1) * limite
    const termo = `%${busca}%`

    // Lista paginada
    const lista = await BD.query(
      `
      select id_professor, nome_professor, telefone, formacao
      from professores
      where nome_professor ilike $1
         or telefone ilike $1
         or formacao ilike $1
      order by ${orderCol}
      limit $2 offset $3
      `,
      [termo, limite, offset]
    )

    // Total p/ paginação
    const tot = await BD.query(
      `
      select count(*)::int as total
      from professores
      where nome_professor ilike $1
         or telefone ilike $1
         or formacao ilike $1
      `,
      [termo]
    )

    const total = tot.rows[0]?.total ?? 0
    const totalPgs = Math.max(1, Math.ceil(total / limite))

    // Mantém o nome já usado na view: "professores"
    res.render('professores/lista', {
      professores: lista.rows,
      busca,
      ordenar,
      pgAtual: pagina,
      totalPgs,
    })
  } catch (erro) {
    console.error('Erro ao listar professores', erro)
    res.render('professores/lista', {
      professores: [],
      mensagem: erro.message,
      busca: '',
      ordenar: 'nome_professor',
      pgAtual: 1,
      totalPgs: 1,
    })
  }
})

// NOVO (GET) - tela de criação
router.get("/novo", (req, res) => {
  res.render("professores/criar");
});

// CRIAR (POST) - insere no banco
router.post("/novo", async (req, res) => {
  try {
    const { nome_professor, telefone, formacao } = req.body;
    await BD.query(
      "INSERT INTO professores (nome_professor, telefone, formacao) VALUES ($1, $2, $3)",
      [nome_professor, telefone, formacao]
    );
    res.redirect("/professores");
  } catch (erro) {
    console.error("Erro ao criar professor", erro);
    res.render("professores/criar", { mensagem: "Erro ao criar professor" });
  }
});

// EDITAR (GET) - carrega a tela com os dados
router.get("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await BD.query(
      "SELECT id_professor, nome_professor, telefone, formacao FROM professores WHERE id_professor = $1",
      [id]
    );
    res.render("professores/editar", { professor: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao abrir edição do professor", erro);
    res.redirect("/professores");
  }
});

// EDITAR (POST) - grava alterações
router.post("/:id/editar", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_professor, telefone, formacao } = req.body;
    await BD.query(
      "UPDATE professores SET nome_professor = $1, telefone = $2, formacao = $3 WHERE id_professor = $4",
      [nome_professor, telefone, formacao, id]
    );
    res.redirect("/professores");
  } catch (erro) {
    console.error("Erro ao editar professor", erro);
    res.redirect("/professores");
  }
});

// DELETAR (POST)
router.post("/:id/deletar", async (req, res) => {
  try {
    const { id } = req.params;
    await BD.query("DELETE FROM professores WHERE id_professor = $1", [id]);
    res.redirect("/professores");
  } catch (erro) {
    console.error("Erro ao deletar professor", erro);
    res.redirect("/professores");
  }
});

export default router;
