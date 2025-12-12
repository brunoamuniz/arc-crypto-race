# 🚗 Como Adicionar Novos Modelos de Carros

Este guia explica como adicionar novos modelos de carros ao jogo para aumentar a diversidade visual.

## 📋 Pré-requisitos

1. **Sprites de carros**: Imagens PNG dos novos carros
2. **Sprite sheet**: O jogo usa um sprite sheet único (`sprites.png`)
3. **Coordenadas**: Você precisa das coordenadas (x, y, width, height) de cada sprite no sheet

## 🎨 Estrutura Atual

### Carros Existentes

O jogo atualmente tem **6 tipos de veículos**:

1. **CAR01** - Carro esportivo pequeno
2. **CAR02** - Carro compacto
3. **CAR03** - Carro médio
4. **CAR04** - Carro sedan
5. **SEMI** - Caminhão grande
6. **TRUCK** - Caminhão médio

### Localização dos Sprites

Os sprites estão definidos em `/public/game/common.js`:

```javascript
SPRITES.CAR01: { x: 1205, y: 1018, w: 80, h: 56 },
SPRITES.CAR02: { x: 1383, y: 825, w: 80, h: 59 },
SPRITES.CAR03: { x: 1383, y: 760, w: 88, h: 55 },
SPRITES.CAR04: { x: 1383, y: 894, w: 80, h: 57 },
SPRITES.SEMI:  { x: 1365, y: 490, w: 122, h: 144 },
SPRITES.TRUCK: { x: 1365, y: 644, w: 100, h: 78 },
```

E a lista de carros disponíveis:

```javascript
SPRITES.CARS = [SPRITES.CAR01, SPRITES.CAR02, SPRITES.CAR03, SPRITES.CAR04, SPRITES.SEMI, SPRITES.TRUCK];
```

## 🔧 Como Adicionar Novos Carros

### Passo 1: Adicionar Sprite ao Sprite Sheet

1. Abra o arquivo `public/game/assets/images/sprites.png`
2. Adicione o novo sprite de carro em uma área vazia
3. Anote as coordenadas (x, y) e dimensões (width, height)

### Passo 2: Adicionar Definição do Sprite

Edite `/public/game/common.js` e adicione a definição do novo carro:

```javascript
SPRITES.CAR05: { x: [X_COORD], y: [Y_COORD], w: [WIDTH], h: [HEIGHT] },
```

**Exemplo:**
```javascript
SPRITES.CAR05: { x: 1205, y: 1080, w: 85, h: 60 },
```

### Passo 3: Adicionar à Lista de Carros

Adicione o novo carro ao array `SPRITES.CARS`:

```javascript
SPRITES.CARS = [
  SPRITES.CAR01, 
  SPRITES.CAR02, 
  SPRITES.CAR03, 
  SPRITES.CAR04, 
  SPRITES.CAR05,  // ← Novo carro
  SPRITES.SEMI, 
  SPRITES.TRUCK
];
```

### Passo 4: Copiar para Diretório de Desenvolvimento

Se você editou `public/game/common.js`, copie também para `game/common.js`:

```bash
cp public/game/common.js game/common.js
```

## 📐 Especificações dos Sprites

### Dimensões Recomendadas

- **Carros pequenos**: 80x55 pixels
- **Carros médios**: 85x60 pixels  
- **Carros grandes**: 90x65 pixels
- **Caminhões**: 100-120x75-80 pixels

### Estilo Visual

- **Estilo retro/pixel art** para manter consistência
- **Vista lateral** (lado do carro)
- **Cores vibrantes** para visibilidade na pista
- **Contraste** suficiente para destacar na estrada

## 🎮 Como os Carros São Selecionados

Os carros são selecionados aleatoriamente em `game-wrapper.js`:

```javascript
sprite = window.Util.randomChoice(window.SPRITES.CARS);
```

Isso significa que cada novo carro adicionado terá a mesma probabilidade de aparecer que os outros.

## 🚀 Exemplo Completo

Vamos adicionar um novo carro esportivo (CAR05):

1. **Adicionar sprite** em `common.js`:
```javascript
SPRITES.CAR05: { x: 1205, y: 1080, w: 85, h: 60 },
```

2. **Adicionar à lista**:
```javascript
SPRITES.CARS = [
  SPRITES.CAR01, 
  SPRITES.CAR02, 
  SPRITES.CAR03, 
  SPRITES.CAR04, 
  SPRITES.CAR05,  // Novo!
  SPRITES.SEMI, 
  SPRITES.TRUCK
];
```

3. **Testar no jogo** - o novo carro aparecerá aleatoriamente na pista!

## 📝 Notas Importantes

1. **Sprite Sheet**: Se você adicionar sprites novos, certifique-se de atualizar o arquivo `sprites.png`
2. **Performance**: Mais carros na lista não afeta performance, apenas aumenta variedade visual
3. **Velocidade**: A velocidade dos carros é calculada dinamicamente, não depende do tipo de sprite
4. **Testes**: Sempre teste após adicionar novos sprites para garantir que aparecem corretamente

## 🐛 Troubleshooting

### Carro não aparece
- Verifique se as coordenadas estão corretas
- Certifique-se de que o sprite foi adicionado ao array `SPRITES.CARS`
- Verifique o console do navegador para erros

### Carro aparece cortado
- Verifique se as dimensões (w, h) estão corretas
- Certifique-se de que o sprite está completamente dentro do sprite sheet

### Carro muito grande/pequeno
- Ajuste as dimensões (w, h) na definição do sprite
- O jogo usa `SPRITES.SCALE` para redimensionar automaticamente

## 📚 Recursos

- Sprite sheet atual: `/public/game/assets/images/sprites.png`
- Definições de sprites: `/public/game/common.js` (linha ~400)
- Lista de carros: `/public/game/common.js` (linha 423)
- Lógica de spawn: `/public/game/game-wrapper.js` (função `resetCars`)
