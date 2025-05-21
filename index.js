  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const db = require('./bd');

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.post('/alunos', async (req, res) => {
    const { nome, sobrenome, dataNascimento, cpf, status } = req.body;
    try {
      const [result] = await db.execute(
        'INSERT INTO alunos (nome, sobrenome, dataNascimento, cpf, status) VALUES (?, ?, ?, ?, ?)',
        [nome, sobrenome, dataNascimento, cpf, status]
      );
      res.json({ id: result.insertId, nome, sobrenome, dataNascimento, cpf, status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/alunos', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM alunos');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/alunos/:id', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM alunos WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/alunos/:id', async (req, res) => {
    const { nome, sobrenome, dataNascimento, cpf, status } = req.body;
    try {
      const [result] = await db.execute(
        'UPDATE alunos SET nome = ?, sobrenome = ?, dataNascimento = ?, cpf = ?, status = ? WHERE id = ?',
        [nome, sobrenome, dataNascimento, cpf, status, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json({ message: 'Aluno atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/alunos/:id', async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM alunos WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/disciplinas', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT id, nome FROM disciplinas ORDER BY id');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    }
  });

  app.get('/notas/aluno/:aluno_id', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          notas.id,
          notas.aluno_id,
          notas.disciplina_id,
          disciplinas.nome AS disciplina,
          notas.trimestre,
          notas.nota,
          notas.descricao
        FROM notas
        INNER JOIN disciplinas ON notas.disciplina_id = disciplinas.id
        WHERE notas.aluno_id = ?
        ORDER BY notas.trimestre
      `, [req.params.aluno_id]);

      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/notas', async (req, res) => {
    const { aluno_id, disciplina_id, trimestre, nota, descricao } = req.body;

    if (!aluno_id || !disciplina_id || !trimestre || nota === undefined) {
      return res.status(400).json({ error: "aluno_id, disciplina_id, trimestre e nota são obrigatórios" });
    }

    try {
      const [result] = await db.execute(
        'INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, descricao) VALUES (?, ?, ?, ?, ?)',
        [aluno_id, disciplina_id, trimestre, nota, descricao || null]
      );
      res.json({ id: result.insertId, aluno_id, disciplina_id, trimestre, nota, descricao });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/notas/:id', async (req, res) => {
    const { disciplina_id, trimestre, nota, descricao } = req.body;

    if (!disciplina_id || !trimestre || nota == null) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    try {
      const [result] = await db.execute(
        `UPDATE notas SET disciplina_id = ?, trimestre = ?, nota = ?, descricao = ? WHERE id = ?`,
        [disciplina_id, trimestre, nota, descricao, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Nota não encontrada' });
      res.json({ message: 'Nota atualizada com sucesso.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar nota.' });
    }
  });

  app.delete('/notas/:id', async (req, res) => {
    try {
      const [result] = await db.execute('DELETE FROM notas WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Nota não encontrada' });
      res.json({ message: 'Nota removida com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/notas/media/:aluno_id', async (req, res) => {
    try {
      const [notas] = await db.execute(
        'SELECT nota FROM notas WHERE aluno_id = ?',
        [req.params.aluno_id]
      );
      if (notas.length === 0) return res.status(404).json({ error: 'Notas não encontradas' });
      const soma = notas.reduce((acc, n) => acc + parseFloat(n.nota), 0);
      const media = soma / notas.length;
      const passou = media >= 6;
      res.json({ media: media.toFixed(2), passou });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
