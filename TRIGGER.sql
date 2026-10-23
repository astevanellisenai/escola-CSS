

DROP TRIGGER IF EXISTS trigger_atualiza_status ON aluno_disciplina;
DROP FUNCTION IF EXISTS atualiza_status_aluno();

-- 1️⃣ Função com a lógica
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

-- 2️⃣ Trigger que chama a função automaticamente
CREATE TRIGGER trigger_atualiza_status
BEFORE INSERT OR UPDATE ON aluno_disciplina
FOR EACH ROW
EXECUTE FUNCTION atualiza_status_aluno();
