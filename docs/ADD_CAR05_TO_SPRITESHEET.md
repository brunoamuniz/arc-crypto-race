# 🚗 Adicionar CAR05 ao Sprite Sheet

O CAR05 foi adicionado ao código, mas precisa ser adicionado ao sprite sheet `sprites.png` para aparecer no jogo.

## 📍 Posição no Sprite Sheet

O CAR05 deve ser adicionado na seguinte posição:
- **X**: 1205
- **Y**: 1080  
- **Width**: 80
- **Height**: 57

## 🔧 Como Adicionar

### Opção 1: Usando Editor de Imagens (GIMP, Photoshop, etc.)

1. Abra `/public/game/assets/images/sprites.png`
2. Abra `/public/game/assets/sprites/car05.png` 
3. Copie o car05.png
4. Cole no sprites.png na posição (1205, 1080)
5. Salve o sprites.png

### Opção 2: Usando Python/Pillow (Script)

```python
from PIL import Image

# Abrir sprite sheet
sprites = Image.open('public/game/assets/images/sprites.png')
car05 = Image.open('public/game/assets/sprites/car05.png')

# Colar car05 na posição (1205, 1080)
sprites.paste(car05, (1205, 1080))

# Salvar
sprites.save('public/game/assets/images/sprites.png')
```

### Opção 3: Usando ImageMagick (Terminal)

```bash
cd /Users/brunoamuniz/Documents/GitHub/arc-crypto-race
composite -geometry +1205+1080 \
  public/game/assets/sprites/car05.png \
  public/game/assets/images/sprites.png \
  public/game/assets/images/sprites.png
```

## ✅ Verificação

Após adicionar ao sprite sheet:
1. O CAR05 aparecerá aleatoriamente na pista junto com os outros carros
2. Verifique no console do navegador se há erros de carregamento
3. Teste o jogo para ver o novo carro aparecendo

## 📝 Nota

O arquivo `car05.png` já está em:
- `/game/assets/sprites/car05.png` (desenvolvimento)
- `/public/game/assets/sprites/car05.png` (produção)

Mas precisa ser adicionado ao sprite sheet `sprites.png` para funcionar no jogo.

