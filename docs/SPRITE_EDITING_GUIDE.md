# 🎨 Guia de Edição de Sprites

## Estrutura do Spritesheet

O arquivo `sprites.png` é um **spritesheet** que contém todas as imagens do jogo em uma única imagem PNG. Cada sprite tem coordenadas e dimensões definidas no código.

## 📍 Localização das Definições

As definições dos sprites estão em:
- `public/game/common.js` (linhas 372-414)
- `game/common.js` (mesma estrutura)

## 🛠️ Como Editar Sprites

### Método 1: Editor de Imagens (Recomendado)

1. **Abra o arquivo:**
   ```
   arc-crypto-race/game/assets/sprites.png
   ```

2. **Use um editor de imagens que suporta coordenadas:**
   - **GIMP** (gratuito) - Mostra coordenadas no canto inferior
   - **Photoshop** - Mostra coordenadas na barra de informações
   - **Aseprite** (ideal para pixel art) - Mostra coordenadas e grid
   - **Piskel** (online) - Editor pixel art gratuito

3. **Localize o sprite usando as coordenadas:**
   - Cada sprite tem: `{ x: X, y: Y, w: WIDTH, h: HEIGHT }`
   - Exemplo: `CAR01: { x: 1205, y: 1018, w: 80, h: 56 }`
   - Isso significa: começa em (1205, 1018) e tem 80px de largura × 56px de altura

4. **Edite o sprite:**
   - **IMPORTANTE:** Mantenha as **mesmas dimensões** (w, h)
   - Você pode mudar o conteúdo visual, mas não o tamanho
   - Se precisar mudar o tamanho, atualize também as coordenadas no código

5. **Salve o arquivo:**
   - Salve como PNG
   - Copie para `public/game/assets/images/sprites.png` também

### Método 2: Usando Ferramentas de Pixel Art

#### Aseprite (Recomendado para Pixel Art)
1. Abra `sprites.png` no Aseprite
2. Use "View > Grid" para ver o grid
3. Use "View > Show Pixel Grid" para precisão
4. Selecione a área do sprite usando as coordenadas
5. Edite e exporte

#### Piskel (Online)
1. Acesse https://www.piskelapp.com/
2. Importe o sprites.png
3. Use a ferramenta de seleção com coordenadas
4. Edite e exporte

## 📋 Lista de Sprites Disponíveis

### Carros
- `CAR01`: { x: 1205, y: 1018, w: 80, h: 56 }
- `CAR02`: { x: 1383, y: 825, w: 80, h: 59 }
- `CAR03`: { x: 1383, y: 760, w: 88, h: 55 }
- `CAR04`: { x: 1383, y: 894, w: 80, h: 57 }
- `SEMI`: { x: 1365, y: 490, w: 122, h: 144 }
- `TRUCK`: { x: 1365, y: 644, w: 100, h: 78 }

### Player (Seu Carro)
- `PLAYER_STRAIGHT`: { x: 1085, y: 480, w: 80, h: 41 }
- `PLAYER_LEFT`: { x: 995, y: 480, w: 80, h: 41 }
- `PLAYER_RIGHT`: { x: 995, y: 531, w: 80, h: 41 }
- `PLAYER_UPHILL_STRAIGHT`: { x: 1295, y: 1018, w: 80, h: 45 }
- `PLAYER_UPHILL_LEFT`: { x: 1383, y: 961, w: 80, h: 45 }
- `PLAYER_UPHILL_RIGHT`: { x: 1385, y: 1018, w: 80, h: 45 }

### Árvores e Plantas
- `PALM_TREE`: { x: 5, y: 5, w: 215, h: 540 }
- `TREE1`: { x: 625, y: 5, w: 360, h: 360 }
- `TREE2`: { x: 1205, y: 5, w: 282, h: 295 }
- `DEAD_TREE1`: { x: 5, y: 555, w: 135, h: 332 }
- `DEAD_TREE2`: { x: 1205, y: 490, w: 150, h: 260 }
- `BUSH1`: { x: 5, y: 1097, w: 240, h: 155 }
- `BUSH2`: { x: 255, y: 1097, w: 232, h: 152 }
- `CACTUS`: { x: 929, y: 897, w: 235, h: 118 }
- `STUMP`: { x: 995, y: 330, w: 195, h: 140 }

### Pedras
- `BOULDER1`: { x: 1205, y: 760, w: 168, h: 248 }
- `BOULDER2`: { x: 621, y: 897, w: 298, h: 140 }
- `BOULDER3`: { x: 230, y: 280, w: 320, h: 220 }

### Billboards
- `BILLBOARD01`: { x: 625, y: 375, w: 300, h: 170 }
- `BILLBOARD02`: { x: 245, y: 1262, w: 215, h: 220 }
- `BILLBOARD03`: { x: 5, y: 1262, w: 230, h: 220 }
- `BILLBOARD04`: { x: 1205, y: 310, w: 268, h: 170 }
- `BILLBOARD05`: { x: 5, y: 897, w: 298, h: 190 }
- `BILLBOARD06`: { x: 488, y: 555, w: 298, h: 190 }
- `BILLBOARD07`: { x: 313, y: 897, w: 298, h: 190 }
- `BILLBOARD08`: { x: 230, y: 5, w: 385, h: 265 }
- `BILLBOARD09`: { x: 150, y: 555, w: 328, h: 282 }

### Outros
- `COLUMN`: { x: 995, y: 5, w: 200, h: 315 }

## ⚠️ Regras Importantes

1. **Mantenha as dimensões:** Se um sprite tem `w: 80, h: 56`, ele DEVE continuar com essas dimensões
2. **Não sobreponha:** Certifique-se de que os sprites editados não se sobreponham a outros
3. **Formato PNG:** Sempre salve como PNG com transparência
4. **Copie para ambos os locais:**
   - `game/assets/sprites.png`
   - `public/game/assets/images/sprites.png`

## 🔧 Mudando o Tamanho de um Sprite

Se você PRECISAR mudar o tamanho de um sprite:

1. Edite o sprite no spritesheet
2. Atualize as coordenadas em `common.js`:
   ```javascript
   CAR01: { x: NOVO_X, y: NOVO_Y, w: NOVA_LARGURA, h: NOVA_ALTURA }
   ```
3. Certifique-se de que não há sobreposição com outros sprites
4. Teste o jogo para verificar se está renderizando corretamente

## 🎨 Dicas de Design

- **Estilo pixel art:** Mantenha o estilo pixel art consistente
- **Cores:** Use cores vibrantes que combinem com o tema retro
- **Transparência:** Use transparência (alpha channel) para áreas vazias
- **Tamanho:** Sprites menores são mais fáceis de editar e renderizam mais rápido

## 🧪 Testando Mudanças

1. Edite o sprite
2. Salve o arquivo
3. Copie para `public/game/assets/images/sprites.png`
4. Recarregue o jogo no navegador (Ctrl+F5 para limpar cache)
5. Verifique se o sprite aparece corretamente

## 📚 Ferramentas Recomendadas

- **Aseprite** - Melhor para pixel art ($19.99, mas vale a pena)
- **GIMP** - Gratuito, poderoso
- **Piskel** - Online, gratuito, bom para iniciantes
- **Photoshop** - Profissional, mas caro
- **Paint.NET** - Gratuito, Windows

