# Mapa Interativo · Mercado de Origem

Simulação do totem de sinalização e navegação do Mercado de Origem (Belo Horizonte · MG).
É um site estático, sem build e sem dependências: HTML, CSS e JavaScript puros.

- `index.html`: versão **interativa** (totem touch, computador e celular)
- `estatico.html`: versão **estática**, com uma placa por andar (1080 × 1920) para impressão ou PDF

> As posições das lojas são ilustrativas porque ainda não temos a planta oficial.

## O que o mapa faz
- Tela de boas-vindas com fotos do Mercado. No modo totem, ela volta sozinha após 90 s sem uso.
- Troca de andar (G, 1º + Deck, 2º, 3º, Rooftop) com transição em 3D, além da **vista 3D do prédio inteiro**.
- Busca por nome, produto ou palavra-chave (ex.: "queijo", "cachaça", "pet", "banheiro").
- Filtros por categoria e por serviços do prédio: sanitários, elevadores, bebedouros, água para pets, fraldário e sanitário acessível.
- Ficha da loja com foto, descrição, andar, número e ponto de referência próximo, mais Instagram, link para compartilhar e **"Como chegar daqui"**.
- Rotas animadas a partir do "Você está aqui", inclusive entre andares, pelo elevador.
- Pontos de referência: Torre do Relógio, Praça do Jardim, Jardim Vertical, Deck e Claraboia.
- Zoom e arraste: pinça no touch, roda do mouse e botões.

## Parâmetros de URL
| URL | Efeito |
|---|---|
| `/?totem=t1` | Totem da entrada principal (1º andar). Também liga o modo totem. |
| `/?totem=t2`, `t3`, `tr`, `tg` | Totem do 2º andar, do 3º andar, do rooftop e do estacionamento |
| `/?modo=totem` | Liga a volta automática à tela inicial |
| `/?loja=maturei` | Abre direto na ficha de uma loja (é o link do botão "Compartilhar") |

## Como editar lojas
Todos os dados ficam em `js/data.js`: nome, categoria, andar, posição (x, y, largura, altura), descrição, Instagram e foto.
As fotos ficam em `assets/img/lojas/<id>.jpg`.

## Publicar (GitHub + Vercel)
1. Crie um repositório no GitHub (ex.: `mapa-mercado-de-origem`).
2. Envie o **conteúdo desta pasta**. `index.html` precisa ficar na raiz do repositório.
   - Pelo site: *Add file → Upload files* e arraste todos os arquivos e pastas.
   - Pelo terminal:
     ```
     git init
     git add .
     git commit -m "Mapa interativo Mercado de Origem"
     git branch -M main
     git remote add origin https://github.com/<seu-usuario>/mapa-mercado-de-origem.git
     git push -u origin main
     ```
3. Em [vercel.com](https://vercel.com), clique em *Add New → Project* e importe o repositório.
   - Framework Preset: **Other**. Não há Build Command nem Output Directory para preencher.
   - Clique em **Deploy**. O link sai no formato `https://mapa-mercado-de-origem.vercel.app`.
4. Cada novo *push* no GitHub atualiza o site sozinho.

## Créditos das imagens
As fotos do espaço vêm do site oficial (mercadodeorigem.com.br). As fotos das lojas vêm dos perfis de Instagram dos lojistas.
As fachadas das lojas âncora são as composições do moodboard de âncoras (proposta).
