require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now + '=' + file.originalnamename)
});
const upload = multer({  storage });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if(err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao MySQL.');
  }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para receber o formulário
app.post('/enviar', upload.fields([
  { name: 'artigo', maxCount: 1 }, 
  { name: 'termo', maxCount: 1 }
]), (req, res) => {
  const { nome, email, titulo, categoria } = req.body;
  const artigoPath = req.files['artigo'][0].filename;
  const termoPath = req.files['termo'][0].filename;

  if (!artigo || !termo) {
    return res.status(400).send('Arquivos não enviados corretamente.');
  }

  // Gravar no banco
  db.query('INSERT INTO artigos (nome, email, titulo, categoria, artigo_path, termo_path) VALUES (?, ?, ?, ?, ?)',
    [nome, email, titulo, artigo.filename, termo.filename],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao salvar no banco de dados.');
      }
        res.send('Artigo enviado com sucesso!');
      });
    });

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});
// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});