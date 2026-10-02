# Guia de Conexão: GitHub e Vercel (TechView HD)

Este guia orienta a configuração e resolução de conexões ao publicar o projeto via **GitHub** e **Vercel**.

---

## 1. Estrutura de Pastas e Categorias Oficiais
As categorias principais do projeto foram padronizadas exclusivamente para as pastas numeradas:
- **`07 - LAMINAÇÃO`** *(Subpasta de equipamento: ROTOMEC)*
- **`08 - EXTRUSÃO`** *(Subpastas de equipamento: VAREX I, VAREX II)*
- **`10 - CORTE`** *(Subpastas de equipamento: KAMPF I, KAMPF II)*
- **`13 - UTILIDADES`** *(Subpasta de equipamento: SUBESTAÇÃO)*

> Nomes avulsos de equipamentos (como `ROTOMEC` ou `KAMPF`) não aparecem como categorias raiz duplicadas; eles ficam organizados dentro de sua respectiva pasta numerada.

---

## 2. Configuração do Vercel (`vercel.json`)
O arquivo `vercel.json` já está incluído na raiz do projeto com as regras de rewrite para Single Page Application (SPA):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Conexão Única com Google Drive
A aplicação utiliza um fluxo de conexão único e infalível:
- O botão oficial **"Conectar Google Drive (manutencaolaminor@gmail.com)"** vincula a conta do projeto instantaneamente tanto na Vercel quanto em qualquer ambiente.
- Não existem opções duplicadas ou configurações manuais: a sessão é mantida com persistência contínua no navegador e acesso irrestrito às pranchas, visualizador CAD em alta definição, zoom e exportação de PDF.

---

## 4. Busca de Desenhos no Banco de Dados do Drive
- **Barra de Pesquisa com Botão "Drive":** Digite o código do desenho (ex: `DWG-104`, `ROT`, `KAMPF`), equipamento ou tag e pressione `Enter` ou clique em **"Drive"** para localizar a prancha no banco `techview_database.json` do Google Drive.
- **Botão "Banco do Drive":** Abre a tela de pesquisa detalhada onde é possível filtrar pranchas por categoria numerada, sincronizar o arquivo de banco de dados do Drive em 1 clique ou importar desenhos via link direto do Google Drive.

---

## 4. Variáveis de Ambiente no Vercel (Opcional)
Se desejar utilizar credenciais Firebase próprias em produção na Vercel, defina no painel da Vercel (*Settings > Environment Variables*):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_OAUTH_CLIENT_ID`
