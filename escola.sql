-- ============================================================
-- SISTEMA ESCOLAR
-- Banco de dados: escola
-- Script único de criação, dados iniciais e trigger
-- ============================================================

-- ============================================================
-- LIMPEZA
-- ============================================================
DROP TABLE IF EXISTS aluno_disciplina CASCADE;
DROP TABLE IF EXISTS alunos CASCADE;
DROP TABLE IF EXISTS disciplinas CASCADE;
DROP TABLE IF EXISTS turmas_escola CASCADE;
DROP TABLE IF EXISTS turmas CASCADE;
DROP TABLE IF EXISTS professores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP FUNCTION IF EXISTS atualiza_status_aluno();

-- ============================================================
-- USUÁRIOS
-- ============================================================
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROFESSORES
-- ============================================================
CREATE TABLE professores (
  id_professor SERIAL PRIMARY KEY,
  nome_professor VARCHAR(100) NOT NULL,
  telefone VARCHAR(30),
  formacao VARCHAR(100)
);

-- ============================================================
-- TURMAS
-- ============================================================
CREATE TABLE turmas (
  id_turma SERIAL PRIMARY KEY,
  nome_turma VARCHAR(100) NOT NULL
);

-- ============================================================
-- DISCIPLINAS
-- ============================================================
CREATE TABLE disciplinas (
  id_disciplina SERIAL PRIMARY KEY,
  nome_disciplina VARCHAR(100) NOT NULL,
  id_professor INTEGER REFERENCES professores(id_professor)
);

-- ============================================================
-- ALUNOS
-- ============================================================
CREATE TABLE alunos (
  id_aluno SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  idade INTEGER,
  cpf VARCHAR(20),
  sexo CHAR(1),
  id_turma INTEGER REFERENCES turmas(id_turma)
);

-- ============================================================
-- NOTAS E FALTAS POR DISCIPLINA
-- ============================================================
CREATE TABLE aluno_disciplina (
  id_disciplina INTEGER REFERENCES disciplinas(id_disciplina),
  id_aluno INTEGER REFERENCES alunos(id_aluno),
  media NUMERIC(5,2),
  nr_faltas INTEGER,
  status VARCHAR(15),
  PRIMARY KEY (id_disciplina, id_aluno)
);

-- ============================================================
-- FUNÇÃO E TRIGGER PARA ATUALIZAR STATUS DO ALUNO
-- ============================================================
CREATE OR REPLACE FUNCTION atualiza_status_aluno()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.media >= 7 AND NEW.nr_faltas <= 25 THEN
    NEW.status := 'Aprovado';
  ELSIF NEW.media >= 5 AND NEW.media < 7 AND NEW.nr_faltas <= 25 THEN
    NEW.status := 'Recuperação';
  ELSE
    NEW.status := 'Reprovado';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualiza_status
BEFORE INSERT OR UPDATE ON aluno_disciplina
FOR EACH ROW
EXECUTE FUNCTION atualiza_status_aluno();

-- ============================================================
-- USUÁRIO PADRÃO
-- ============================================================
INSERT INTO usuarios (nome, usuario, senha, ativo, is_admin)
VALUES ('Administrador', 'admin', '123', TRUE, TRUE);

-- ============================================================
-- PROFESSORES INICIAIS
-- ============================================================
INSERT INTO professores (nome_professor, telefone, formacao)
VALUES
  ('Ana Paula', '(18) 1111-1111', 'Matemática'),
  ('Bruno Silva', '(18) 2222-2222', 'Física'),
  ('Carlos Souza', '(18) 3333-3333', 'História');

-- ============================================================
-- TURMAS INICIAIS
-- ============================================================
INSERT INTO turmas (nome_turma)
VALUES
  ('1º Ano A'),
  ('1º Ano B'),
  ('2º Ano A');

-- ============================================================
-- DISCIPLINAS INICIAIS
-- ============================================================
INSERT INTO disciplinas (nome_disciplina, id_professor)
VALUES
  ('Matemática', 1),
  ('Física', 2),
  ('História', 3);

-- ============================================================
-- ALUNOS INICIAIS
-- ============================================================
INSERT INTO alunos (nome, idade, cpf, sexo, id_turma)
VALUES
  ('João Pedro', 15, '000.000.000-00', 'M', 1),
  ('Maria Clara', 16, '111.111.111-11', 'F', 2),
  ('Pedro Henrique', 17, '222.222.222-22', 'M', 3),
  ('Ana Beatriz', 15, '333.333.333-33', 'F', 1),
  ('Lucas Gabriel', 16, '444.444.444-44', 'M', 2),
  ('Isabela Santos', 15, '555.555.555-55', 'F', 3),
  ('Rafael Almeida', 17, '666.666.666-66', 'M', 1),
  ('Larissa Souza', 16, '777.777.777-77', 'F', 2),
  ('Matheus Oliveira', 15, '888.888.888-88', 'M', 3),
  ('Giovanna Costa', 16, '999.999.999-99', 'F', 1),
  ('Felipe Martins', 15, '123.456.789-00', 'M', 2),
  ('Laura Rodrigues', 17, '987.654.321-00', 'F', 3),
  ('Gabriel Pereira', 16, '456.789.123-00', 'M', 1),
  ('Camila Barbosa', 15, '654.321.987-00', 'F', 2),
  ('Thiago Fernandes', 17, '321.654.987-00', 'M', 3),
  ('Beatriz Melo', 15, '741.852.963-00', 'F', 1),
  ('Eduardo Ribeiro', 16, '852.963.741-00', 'M', 2),
  ('Sofia Lima', 17, '963.741.852-00', 'F', 3),
  ('André Nascimento', 15, '159.357.258-00', 'M', 1),
  ('Helena Cardoso', 16, '258.159.357-00', 'F', 2);

-- ============================================================
-- NOTAS E FALTAS INICIAIS
-- O campo status é preenchido automaticamente pela trigger.
-- ============================================================
INSERT INTO aluno_disciplina (id_disciplina, id_aluno, media, nr_faltas)
VALUES
  (1, 1, 8.5, 10),
  (2, 1, 6.0, 12),
  (3, 2, 4.0, 30),
  (1, 3, 7.5, 20),
  (3, 3, 5.5, 15),
  (2, 4, 9.0, 8),
  (3, 4, 7.8, 18),
  (1, 5, 5.2, 22),
  (2, 5, 4.5, 18),
  (3, 6, 8.9, 10),
  (1, 7, 7.0, 25),
  (2, 7, 6.4, 15),
  (3, 8, 9.1, 5),
  (1, 9, 4.0, 12),
  (2, 9, 5.6, 20),
  (3, 10, 8.3, 12),
  (1, 11, 6.5, 22),
  (2, 11, 7.3, 10),
  (3, 12, 9.4, 3),
  (1, 13, 7.1, 17),
  (2, 13, 6.2, 22),
  (3, 14, 4.8, 26),
  (1, 15, 7.8, 10),
  (3, 15, 6.9, 20),
  (2, 16, 8.0, 18),
  (3, 17, 4.7, 10),
  (1, 18, 9.2, 8),
  (3, 18, 6.0, 15),
  (2, 19, 7.5, 25),
  (3, 20, 5.3, 12),
  (1, 20, 4.0, 30);

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
