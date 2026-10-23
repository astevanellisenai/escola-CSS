import express from 'express';
import BD from '../db.js'; // conexão PostgreSQL via Pool

const router = express.Router();

// Dashboard principal
router.get('/', async (req, res) => {
  try {
    // === 1. TOTAL DE ALUNOS ===
    const { rows: r1 } = await BD.query('SELECT COUNT(*)::int AS total FROM alunos');
    const totalAlunos = r1[0]?.total ?? 0;

    // === 2. TOTAL DE DISCIPLINAS ===
    const { rows: r2 } = await BD.query('SELECT COUNT(*)::int AS total FROM disciplinas');
    const totalDisciplinas = r2[0]?.total ?? 0;

    // === 3. MÉDIA GERAL POR DISCIPLINA (usando aluno_disciplina) ===
    const { rows: r3 } = await BD.query(`
      SELECT 
        d.nome_disciplina,
        ROUND(AVG(ad.media)::numeric, 2) AS media
      FROM aluno_disciplina ad
      INNER JOIN disciplinas d ON d.id_disciplina = ad.id_disciplina
      GROUP BY d.nome_disciplina
      ORDER BY d.nome_disciplina
    `);
    const mediaDisciplinas = r3 ?? [];

    // === 4. STATUS DE APROVAÇÃO DOS ALUNOS (usando aluno_disciplina) ===
    const { rows: r4 } = await BD.query(`
      SELECT 
        CASE 
          WHEN AVG(ad.media) >= 6 THEN 'Aprovado'
          WHEN AVG(ad.media) BETWEEN 4 AND 5.99 THEN 'Recuperação'
          ELSE 'Reprovado'
        END AS status,
        COUNT(DISTINCT ad.id_aluno)::int AS total
      FROM aluno_disciplina ad
      GROUP BY status
      ORDER BY status
    `);
    const statusAluno = r4 ?? [];

    // === 5. MÉDIA POR DISCIPLINA E TURMA (usando aluno_disciplina) ===
    const { rows: r5 } = await BD.query(`
      SELECT 
        t.nome_turma,
        d.nome_disciplina,
        ROUND(AVG(ad.media)::numeric, 2) AS media
      FROM aluno_disciplina ad
      INNER JOIN disciplinas d ON d.id_disciplina = ad.id_disciplina
      INNER JOIN alunos a ON a.id_aluno = ad.id_aluno
      INNER JOIN turmas t ON t.id_turma = a.id_turma
      GROUP BY t.nome_turma, d.nome_disciplina
      ORDER BY t.nome_turma, d.nome_disciplina
    `);
    const mediasDisciplinasTurmas = r5 ?? [];

    // === 6. ALUNOS EM RISCO DE REPROVAÇÃO (sem faltas; faltas = 0) ===
    const { rows: r6 } = await BD.query(`
      SELECT 
        a.nome,
        t.nome_turma,
        d.nome_disciplina,
        ROUND(AVG(ad.media)::numeric, 2) AS media,
        0 AS nr_faltas,
        CASE 
          WHEN AVG(ad.media) < 6 THEN 'Em risco'
          ELSE 'Regular'
        END AS status
      FROM alunos a
      INNER JOIN turmas t ON t.id_turma = a.id_turma
      INNER JOIN aluno_disciplina ad ON ad.id_aluno = a.id_aluno
      INNER JOIN disciplinas d ON d.id_disciplina = ad.id_disciplina
      GROUP BY a.nome, t.nome_turma, d.nome_disciplina
      HAVING AVG(ad.media) < 6
      ORDER BY a.nome
    `);
    const alunoEmRisco = r6 ?? [];

    // === 7. Cálculo da Taxa de Aprovação ===
    const totalGeral = statusAluno.reduce((s, x) => s + (Number(x.total) || 0), 0);
    const aprovados = statusAluno.find(x => x.status === 'Aprovado')?.total ?? 0;
    const taxaAprovacao = totalGeral ? Math.round((aprovados / totalGeral) * 100) : 0;

    // Renderiza o dashboard com todos os dados
    res.render('admin/dashboard', {
      totalAlunos,
      totalDisciplinas,
      mediaDisciplinas,
      statusAluno,
      mediasDisciplinasTurmas,
      alunoEmRisco,
      taxaAprovacao
    });

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    res.render('admin/dashboard', {
      totalAlunos: 0,
      totalDisciplinas: 0,
      mediaDisciplinas: [],
      statusAluno: [],
      mediasDisciplinasTurmas: [],
      alunoEmRisco: [],
      taxaAprovacao: 0
    });
  }
});

export default router;
