DROP TABLE IF EXISTS usuarios CASCADE;

-- Cria a tabela de usuários
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,   
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuário padrão
INSERT INTO usuarios (nome, usuario, senha, ativo)
VALUES ('Administrador', 'admin', '123', TRUE);
