// Clasificador de impacto ambiental
// Evalúa objetos por huella hídrica y qué tan necesarios son
// Niveles: 1=lujo, 2=útil, 3=necesario

const tblNecesidad = {
  // In Bloom
  refresco: 1,
  lata: 1,
  agua: 3,
  cafe: 1,
  energia: 1,
  cerveza: 1,
  cable: 2,
  audifonos: 2,
  cargador: 2,
  powerbank: 2,
  celular: 3,
  tablet: 2,
  laptop: 3,
  monitor: 2,
  consola: 1,
  lapiz: 3,
  pluma: 3,
  marcador: 2,
  libreta: 3,
  cuaderno: 3,
  hoja: 3,
  paquete: 3,
  folder: 2,
  carpeta: 2,
  mochila: 3,
  calculadora: 2,
  cartucho: 2,
  toner: 2,
  libro: 3,
  playera: 3,
  camisa: 3,
  sudadera: 3,
  jeans: 3,
  vestido: 3,
  ropaInterior: 3,
  calcetines: 3,
  tenis: 3,
  chamarra: 3,
  toalla: 3,
  sabana: 3,
  cobija: 3,
  uniforme: 3,
  traje: 2,

  // Alimentos
  arroz: 3,
  carne: 3,
  pollo: 3,
  pescado: 3,
  leche: 3,
  queso: 3,
  yogurt: 3,
  huevo: 3,
  pan: 3,
  pasta: 3,

  // Higiene Personal
  jabon: 3,
  champu: 3,
  toallaSanitaria: 3,
  desodorante: 2,
  tipoCepillo: 3,
  pastedental: 3,
  rasurador: 1,
  locion: 1,

  // Accesorios
  bolsa: 2,
  cinturon: 1,
  gafas: 1,
  reloj: 1,
  collar: 1,
  pulsera: 1,
  anillo: 1,
  sombrero: 1,
  bufanda: 2,
  guantes: 2
};

// Reglas para clasificar según impacto + necesidad
// Combina el nivel de agua con qué tan esencial es el producto
const reglasCsaificacion = {
  // Impacto alto + Necesidad baja = Consumo innecesario
  'alto-1': {
    categoria: 'consumo innecesario',
    prioridad: 'critica'
  },
  'alto-2': {
    categoria: 'consumo innecesario',
    prioridad: 'alta'
  },

  // Impacto medio + Necesidad baja = Uso moderado
  'medio-1': {
    categoria: 'uso moderado',
    prioridad: 'alta'
  },

  // Impacto bajo + Necesidad baja = Uso moderado
  'bajo-1': {
    categoria: 'uso moderado',
    prioridad: 'media'
  },

  // Impacto medio + Necesidad media = Uso moderado
  'medio-2': {
    categoria: 'uso moderado',
    prioridad: 'media'
  },

  // Impacto bajo + Necesidad media = Uso moderado
  'bajo-2': {
    categoria: 'uso moderado',
    prioridad: 'media'
  },

  // Impacto alto + Necesidad media = Uso responsable
  'alto-3': {
    categoria: 'uso responsable',
    prioridad: 'media'
  },

  // Impacto medio + Necesidad alta = Uso responsable
  'medio-3': {
    categoria: 'uso responsable',
    prioridad: 'media'
  },

  // Impacto bajo + Necesidad alta = Uso responsable
  'bajo-3': {
    categoria: 'uso responsable',
    prioridad: 'baja'
  },

  // Impacto alto + Necesidad alta = Uso responsable
  'alto-3-especial': {
    categoria: 'uso responsable',
    prioridad: 'critica'
  }
};

// Para explicar el impacto en términos que la gente entienda
// Comparamos litros con cosas del día a día
const equivalencias = {
  5: 'media taza de café',
  10: 'una taza de café',
  50: 'una botella de refresco',
  100: 'una manguera de 10 minutos',
  250: 'un refresco grande',
  500: 'una manguera de 50 minutos',
  1000: 'una tina de baño llena',
  3000: 'tres tinas de baño',
  5000: 'cinco tinas de baño',
  10000: 'diez tinas de baño',
  20000: 'veinte tinas de baño'
};

// Tips para consumir mejor y más responsable
const alternativasEco = {
  refresco: 'agua natural con frutas o infusiones caseras',
  lata: 'envases retornables o vidrio',
  agua: 'un filtro en casa y llevar tu propio termo',
  cafe: 'prepararlo en casa y usar taza reutilizable',
  energia: 'bebidas naturales o dormir mejor para recuperar energia real',
  cerveza: 'cerveza de barril o envases retornables',
  cable: 'cuidar los conectores y enrollarlos suavemente',
  audifonos: 'limpiarlos regularmente y guardarlos en estuche',
  cargador: 'desconectarlo cuando no esté en uso',
  powerbank: 'baterias recargables de alta calidad',
  celular: 'reparar tu equipo actual o cambiar solo la bateria',
  tablet: 'usarla para lectura en lugar de imprimir documentos',
  laptop: 'realizar mantenimiento preventivo y limpieza de ventiladores',
  monitor: 'ajustar el brillo para ahorrar energia',
  consola: 'apagarla completamente en lugar de dejarla en reposo',
  lapiz: 'lápices de madera certificada o portaminas recargable',
  pluma: 'plumas recargables o de material reciclado',
  marcador: 'marcadores recargables',
  libreta: 'usar el reverso de hojas usadas',
  cuaderno: 'cuadernos de papel reciclado o digitalizar notas',
  hoja: 'usar papel reciclado y digitalizar notas',
  paquete: 'comprar a granel para reducir empaques',
  folder: 'reutilizar carpetas viejas con nuevas etiquetas',
  carpeta: 'organizadores digitales en la nube',
  mochila: 'reparar cierres y costuras antes de comprar una nueva',
  calculadora: 'usar la app del celular o solar',
  cartucho: 'rellenar cartuchos de tinta',
  toner: 'usar modo borrador y tipografias ecologicas',
  libro: 'bibliotecas, libros digitales o intercambio',
  playera: 'algodón orgánico o comprar de segunda mano',
  camisa: 'lavar con agua fría y secar al aire',
  sudadera: 'fibras recicladas y lavado poco frecuente',
  jeans: 'lavarlos con menos frecuencia (cada 5-10 usos)',
  vestido: 'intercambio de ropa o moda circular',
  ropaInterior: 'materiales naturales como bambú o algodón',
  calcetines: 'zurcir agujeros pequeños en lugar de tirar',
  tenis: 'limpiarlos a mano y reparar suelas',
  chamarra: 'donar si ya no la usas o reparar cierres',
  toalla: 'secarla al sol para usarla más veces',
  sabana: 'lavar con carga completa en la lavadora',
  cobija: 'usar ropa abrigadora en casa para bajar la calefacción',
  uniforme: 'heredar a hermanos menores o donar a la escuela',
  traje: 'limpieza en seco solo cuando sea estrictamente necesario',
  botella: 'un termo de acero inoxidable',
  carne: 'opciones vegetales un par de dias a la semana',
  arroz: 'cultivar propio arroz o apoyo a agricultura local',
  pollo: 'crianza en condiciones sostenibles',
  pescado: 'pesca sostenible certificada',
  leche: 'leches vegetales: almendra, avena, soja',
  queso: 'quesos vegetales o reducir frecuencia de consumo',
  yogurt: 'preparar yogurt casero en mayor cantidad',
  huevo: 'huevos de granja certificada',
  pan: 'pan de panaderia local en lugar de empacado',
  pasta: 'pasta integral u orgánica',
  jabon: 'jabón sólido reutilizable múltiples veces',
  champu: 'champú en barra o champú de pasta',
  toallaSanitaria: 'alternativas reutilizables como copa menstrual',
  desodorante: 'barras sólidas reusables o cristal natural',
  tipoCepillo: 'cepillos de bambú biodegradables',
  pastedental: 'tabletas de pasta dental o naturales',
  rasurador: 'rasurador de seguridad reutilizable',
  locion: 'aceites naturales o mantecas vegetales',
  bolsa: 'bolsas de tela reutilizable',
  cinturon: 'reparación de hebillas o intercambio',
  gafas: 'reparación de armaduras o lentes',
  reloj: 'pilas recargables o solares',
  collar: 'joyeria reciclada o heredada',
  pulsera: 'materiales naturales o reciclados',
  anillo: 'oro reciclado certificado',
  sombrero: 'sombreros de paja natural o tela',
  bufanda: 'lanas orgánicas de origen ético',
  guantes: 'lana merina o algodón orgánico'
};

// Funciones auxiliares
function calcularImpacto(litros) {
  if (litros <= 100) return 'bajo';
  if (litros <= 1000) return 'medio';
  return 'alto';
}

function obtenerNecesidad(objeto) {
  return tblNecesidad[objeto] || 2;
}

function nivelATexto(nivel) {
  const textos = {
    1: 'no esencial',
    2: 'util',
    3: 'necesario'
  };
  return textos[nivel] || 'desconocido';
}

// Encuentra la equivalencia más cercana (ej: ducha de X minutos)
function encontrarEquivalencia(litros) {
  const claves = Object.keys(equivalencias)
    .map(Number)
    .sort((a, b) => Math.abs(a - litros) - Math.abs(b - litros));
  
  return equivalencias[claves[0]] || 'cierta cantidad de agua';
}

function aplicarRegla(objeto, litros) {
  const necesidad = obtenerNecesidad(objeto);
  const impacto = calcularImpacto(litros);
  
  // Caso especial: alto impacto con alta necesidad
  if (impacto === 'alto' && necesidad === 3 && litros > 10000) {
    return reglasCsaificacion['alto-3-especial'];
  }
  
  const clave = `${impacto}-${necesidad}`;
  return reglasCsaificacion[clave] || {
    categoria: 'uso moderado',
    prioridad: 'media'
  };
}

// Genera el mensaje que ve el usuario
function generarMensaje(datos) {
  const {
    nombre,
    litros,
    impacto,
    necesidad,
    categoria
  } = datos;

  const equivalencia = encontrarEquivalencia(litros);
  const nivelTxt = nivelATexto(necesidad);
  let mensaje = '';


  const recomendaciones = {
    'consumo innecesario': 
      `Este producto no es esencial. Considera reducir su consumo o buscar alternativas más sostenibles.\nCada compra evitada ahorraría agua significativamente.`,
    'uso moderado': 
      `Úsalo de forma consciente y responsable. Intenta alargar su vida útil al máximo.\nCuida el producto para evitar reemplazos innecesarios.`,
    'uso responsable': 
      `Es un producto necesario para tu vida diaria. Cuidalo bien y usalo frecuentemente.\nExtender su vida util es la mejor forma de reducir el impacto ambiental.`
  };

  // Construccion del mensaje unificado
  const titulo = categoria.toUpperCase();
  const infoProducto = `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} requiere ${litros.toLocaleString()} litros de agua para producirse.`;
  const infoEquivalencia = `Equivalente a ${equivalencia}.`;
  const recomendacion = recomendaciones[categoria] || 'Considera el impacto hidrico de este objeto.';
  
  // Agregar tip ecologico si existe para este producto
  const tip = alternativasEco[nombre];
  const textoTip = tip ? `\n\n TIP INTELIGENTE:\nPrueba cambiarlo por ${tip} para reducir tu huella.` : '';

  return `${titulo}\n\n${infoProducto}\n${infoEquivalencia}\n\nRECOMENDACION:\n${recomendacion}${textoTip}`;
}

/**
 * Clasifica objeto completo automaticamente
 * @param {string} nombreObjeto - Nombre del objeto (clave en datos)
 * @param {number} litros - Litros de agua necesarios
 * @returns {object} - Estructura de clasificacion completa
 */
function clasificarObjeto(nombreObjeto, litros) {
  if (!nombreObjeto || typeof litros !== 'number' || litros < 0) {
    return {
      error: 'Datos inválidos',
      nombre: nombreObjeto,
      litros: litros
    };
  }

  const necesidad = obtenerNecesidad(nombreObjeto);
  const impacto = calcularImpacto(litros);
  const regla = aplicarRegla(nombreObjeto, litros);
  const resultado = {
    nombre: nombreObjeto,
    litros: litros,
    impacto: impacto,
    necesidad: nivelATexto(necesidad),
    categoria: regla.categoria,
    prioridad: regla.prioridad,
    explicacion: generarMensaje({
      nombre: nombreObjeto,
      litros: litros,
      impacto: impacto,
      necesidad: necesidad,
      categoria: regla.categoria
    })
  };

  return resultado;
}

function clasificarMultiples(listaObjetos) {
  return Object.entries(listaObjetos).map(([nombre, litros]) => 
    clasificarObjeto(nombre, litros)
  );
}

function obtenerEstadisticas(clasificaciones) {
  const stats = {
    'consumo innecesario': 0,
    'uso moderado': 0,
    'uso responsable': 0
  };

  clasificaciones.forEach(item => {
    if (item.categoria) {
      stats[item.categoria]++;
    }
  });

  return stats;
}
