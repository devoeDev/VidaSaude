# VidaSaúde — Frontend para apresentação

Aplicativo mobile-first feito com **React + TypeScript + Vite + Tailwind CSS 4**. Funciona no navegador e **não precisa de backend ou banco de dados**.

## Telas implementadas

1. `/` — Abertura (splash) por 2,5 segundos, seguida do login.
2. `/login` — Login reproduzido do Figma, com máscara de telefone, botão para mostrar/ocultar senha, validação de campos, indicação de erros e acesso à recuperação simulada.
3. `/cadastro` — Destino provisório do botão Se Cadastrar, a ser substituído quando o Figma da tela de cadastro for enviado.
4. `/inicio` — Destino provisório após login demonstrativo, a ser substituído pela tela inicial do Figma.

## Instalação e execução

Requisito: Node.js 20.19+ ou 22.12+.

Abra esta pasta no VS Code e execute no terminal:

```bash
npm install
npm run dev
```

Acesse o endereço indicado pelo Vite, normalmente http://localhost:5173.

## Testando o login

Por ser uma apresentação **sem autenticação real**, qualquer telefone válido com DDD e 10 ou 11 dígitos e qualquer senha de 6 ou mais caracteres permite avançar. Exemplo para testar:

- Telefone: `(11) 99999-9999`
- Senha: `123456`

O login não consulta contas reais. A senha não é enviada nem salva. A recuperação de senha é totalmente simulada e **não envia SMS**.

## Compilar para hospedagem estática

```bash
npm run build
```

O conteúdo da pasta `dist/` pode ser publicado. Em hospedagens estáticas, configure o redirecionamento de rotas para `index.html` caso use links diretos como `/login`.

## Aparência e acessibilidade

- Layout responsivo: celular em tela cheia; computador com prévia centralizada.
- Cores, tipografia e posicionamento próximos ao Figma original.
- Campos com rótulos, alertas de validação, botão para mostrar senha e foco visível.
- Preferência de redução de movimento respeitada.

Próximas etapas: substituir as telas provisórias por layouts reais enviados do Figma, uma por vez.
