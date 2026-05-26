const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcrypt');
const conexao  = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────
// CADASTRO DE USUÁRIO
// ─────────────────────────────────────────
app.post('/api/cadastro', async (req, res) => {
  const { email, nome, senha } = req.body;
  try {
    const [rows] = await conexao.execute(
      "SELECT id FROM usuarios WHERE email = ?", [email]
    );
    if (rows.length > 0)
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    await conexao.execute(
      "INSERT INTO usuarios (email, nome, senha) VALUES (?, ?, ?)",
      [email, nome, hash]
    );
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: `Erro ao cadastrar: ${err.message}` });
  }
});

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await conexao.execute(
      "SELECT * FROM usuarios WHERE email = ?", [email]
    );
    if (rows.length === 0)
      return res.json({ message: 'E-mail ou senha inválidos.', tipoMensagem: 'danger' });

    const u = rows[0];
    const senhaValida = await bcrypt.compare(senha, u.senha);
    if (!senhaValida)
      return res.json({ message: 'Senha inválida.', tipoMensagem: 'danger' });

    const userData = {
      id:    u.id,
      email: u.email,
      nome:  u.nome,
      admin: u.admin === 1 || u.admin === true
    };
    res.json({ message: 'Login realizado com sucesso!', userData, tipoMensagem: 'success' });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// ─────────────────────────────────────────
// CADASTRAR PALESTRA  (admin)
// ─────────────────────────────────────────
app.post('/api/admin', async (req, res) => {
  const { titulo, descricao, nomePalestrante, localEvento, dataEvento } = req.body;
  try {
    await conexao.execute(
      "INSERT INTO palestra (titulo, descricao, nomePalestrante, localEvento, dataEvento) VALUES (?,?,?,?,?)",
      [titulo, descricao, nomePalestrante, localEvento, dataEvento]
    );
    res.status(201).json({ message: 'Evento cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: `Erro ao cadastrar evento: ${err.message}` });
  }
});

// ─────────────────────────────────────────
// LISTAR PALESTRAS
// ─────────────────────────────────────────
app.get('/api/palestras', async (_req, res) => {
  try {
    const [rows] = await conexao.execute(
      "SELECT * FROM palestra ORDER BY dataEvento ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar palestras.' });
  }
});

// ─────────────────────────────────────────
// INSCRIÇÃO EM PALESTRA
// ─────────────────────────────────────────
app.post('/api/inscricao', async (req, res) => {
  const { idUsuario, idPalestra } = req.body;
  try {
    await conexao.execute(
      "INSERT INTO inscricoes (idUsuario, idPalestra) VALUES (?,?)",
      [idUsuario, idPalestra]
    );
    res.status(201).json({ message: 'Inscrição realizada com sucesso! 🎉' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Você já está inscrito neste evento!' });
    res.status(500).json({ message: 'Erro ao realizar inscrição.' });
  }
});

// ─────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));