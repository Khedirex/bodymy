// Cardápio base (7 dias) em espanhol. Fonte única usada pelo seed e pelo
// gerador da migração de tradução. Conteúdo educativo — não substitui
// nutricionista. Sem promessas de emagrecimento.

export interface Refeicao {
  titulo: string
  itens: string[]
}
export interface CardapioDia {
  cafe: Refeicao
  almoco: Refeicao
  lanche: Refeicao
  jantar: Refeicao
}

export function cardapioBaseES(): CardapioDia[] {
  const dia = (cafe: string[], almoco: string[], lanche: string[], jantar: string[]): CardapioDia => ({
    cafe: { titulo: 'Desayuno', itens: cafe },
    almoco: { titulo: 'Almuerzo', itens: almoco },
    lanche: { titulo: 'Merienda', itens: lanche },
    jantar: { titulo: 'Cena', itens: jantar },
  })

  return [
    dia(
      ['Café con leche', 'Pan integral con huevo revuelto', 'Papaya'],
      ['Arroz', 'Frijoles', 'Pollo a la plancha', 'Ensalada de hojas verdes'],
      ['Yogur natural', 'Banana'],
      ['Sopa de verduras', 'Tostada integral'],
    ),
    dia(
      ['Tapioca con queso', 'Jugo de naranja natural'],
      ['Arroz integral', 'Lentejas', 'Carne molida salteada', 'Calabacín'],
      ['Fruta de estación', 'Nueces'],
      ['Omelette de verduras', 'Ensalada verde'],
    ),
    dia(
      ['Batido de banana con avena'],
      ['Arroz', 'Frijoles', 'Pescado al horno', 'Zanahoria y remolacha'],
      ['Yogur', 'Manzana'],
      ['Wrap integral con pollo y ensalada'],
    ),
    dia(
      ['Café con leche', 'Pan integral con queso crema', 'Mandarina'],
      ['Puré de papa', 'Pollo deshebrado', 'Brócoli'],
      ['Mix de frutas'],
      ['Sopa de calabaza con pollo'],
    ),
    dia(
      ['Huevos revueltos', 'Rebanada de melón'],
      ['Arroz', 'Frijoles', 'Bistec a la plancha', 'Ensalada de tomate'],
      ['Yogur con granola'],
      ['Panqueque de avena con queso fresco'],
    ),
    dia(
      ['Tapioca con huevo'],
      ['Pasta integral', 'Salsa de tomate casera', 'Pollo', 'Ensalada'],
      ['Fruta', 'Puñado de nueces'],
      ['Caldo de verduras', 'Tostada'],
    ),
    dia(
      ['Café con leche', 'Bizcocho casero de maíz (rebanada pequeña)', 'Fruta'],
      ['Guiso ligero de frijoles con verduras', 'Arroz', 'Naranja'],
      ['Yogur natural'],
      ['Ensalada completa con atún y huevo'],
    ),
  ]
}
