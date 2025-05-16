projeto-recebimento-artigos/
├── uploads/               # Pasta para armazenar os arquivos enviados
├── .env                   # Variáveis de ambiente (SMTP, DB, etc.)
├── server.js              # Servidor principal
├── package.json
├── form.html              # Formulário frontend

Processo de Recebimento de Artigos:

[Usuário acessa o formulário]
        ↓
[Preenche dados e faz upload do artigo (.pdf) e termo de cessão (.doc)]
        ↓
[Clica em "Enviar"]
        ↓
[Servidor Node.js]
    ↳ Valida os arquivos (extensões corretas?)
    ↳ Salva arquivos no servidor/nuvem
    ↳ Grava dados no banco de dados
    ↳ Envia e-mail de confirmação
        ↓
[Usuário recebe e-mail confirmando recebimento]

