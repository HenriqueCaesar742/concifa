require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));

// Configurando o Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'artigo' && path.extname(file.originalname) !== '.pdf') {
      return cb(new Error('O artigo deve ser um arquivo PDF.'));
    }
    if (file.fieldname === 'termo' && path.extname(file.originalname) !== '.doc') {
      return cb(new Error('O termo de cessão deve ser um arquivo DOC.'));
    }
    cb(null, true);
  }
});

// Configurando o Banco de Dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Configurando o Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Rota para receber o formulário
app.post('/enviar', upload.fields([{ name: 'artigo', maxCount: 1 }, { name: 'termo', maxCount: 1 }]), (req, res) => {
  const { nome, email, titulo } = req.body;
  const artigo = req.files['artigo'][0];
  const termo = req.files['termo'][0];

  if (!artigo || !termo) {
    return res.status(400).send('Arquivos não enviados corretamente.');
  }

  // Gravar no banco
  db.query('INSERT INTO artigos (nome_autor, email_autor, titulo_artigo, caminho_artigo, caminho_termo) VALUES (?, ?, ?, ?, ?)', 
    [nome, email, titulo, artigo.filename, termo.filename], 
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao salvar no banco de dados.');
      }

      // Enviar e-mail de confirmação
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Confirmação de recebimento de artigo',
        text: `Olá ${nome}, recebemos seu artigo "${titulo}" com sucesso! Obrigado pela submissão.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send('Erro ao enviar e-mail.');
        }

        res.send('Artigo enviado com sucesso!');
      });
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
