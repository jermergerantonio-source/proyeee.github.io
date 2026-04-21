let chartProductos = null;
let chartCategorias = null;

// Mapeo: producto -> categoría
const MAPA_CATEGORIAS = {
  refresco: 'Bebidas', lata: 'Bebidas', agua: 'Bebidas', cafe: 'Bebidas', energia: 'Bebidas', cerveza: 'Bebidas',
  cable: 'Electrónica', audifonos: 'Electrónica', cargador: 'Electrónica', powerbank: 'Electrónica',
  celular: 'Electrónica', tablet: 'Electrónica', laptop: 'Electrónica', monitor: 'Electrónica', consola: 'Electrónica',
  lapiz: 'Escolares', pluma: 'Escolares', marcador: 'Escolares', libreta: 'Escolares', cuaderno: 'Escolares',
  hoja: 'Escolares', paquete: 'Escolares', folder: 'Escolares', carpeta: 'Escolares', mochila: 'Escolares',
  calculadora: 'Escolares', cartucho: 'Escolares', toner: 'Escolares', libro: 'Escolares',
  playera: 'Ropa', camisa: 'Ropa', sudadera: 'Ropa', jeans: 'Ropa', vestido: 'Ropa',
  ropaInterior: 'Ropa', calcetines: 'Ropa', tenis: 'Ropa', chamarra: 'Ropa', toalla: 'Ropa',
  sabana: 'Ropa', cobija: 'Ropa', uniforme: 'Ropa', traje: 'Ropa',
  arroz: 'Alimentos', carne: 'Alimentos', pollo: 'Alimentos', pescado: 'Alimentos',
  leche: 'Alimentos', queso: 'Alimentos', yogurt: 'Alimentos', huevo: 'Alimentos',
  pan: 'Alimentos', pasta: 'Alimentos',
  jabon: 'Higiene', champu: 'Higiene', toallaSanitaria: 'Higiene', desodorante: 'Higiene',
  tipoCepillo: 'Higiene', pastedental: 'Higiene', rasurador: 'Higiene', locion: 'Higiene',
  bolsa: 'Accesorios', cinturon: 'Accesorios', gafas: 'Accesorios', reloj: 'Accesorios',
  collar: 'Accesorios', pulsera: 'Accesorios', anillo: 'Accesorios', sombrero: 'Accesorios',
  bufanda: 'Accesorios', guantes: 'Accesorios'
};

// Carga los datos cuando entra a la página
window.addEventListener('DOMContentLoaded', function() {
  const sesionActiva = localStorage.getItem('usuarioActivo');
  if (!sesionActiva) {
    window.location.href = 'login.html';
    return;
  }
  
  const usuario = JSON.parse(sesionActiva);
  const usuarioData = obtenerDatosUsuario(usuario.username);
  
  document.getElementById('nombreUsuario').textContent = usuario.username;
  document.getElementById('fechaLogin').textContent = 'Sesión iniciada: ' + usuario.fechaLogin;
  document.getElementById('fechaRegistro').textContent = 'Miembro desde: ' + usuarioData.fechaRegistro;
  
  // Foto de perfil (si existe)
  const fotoGuardada = usuarioData.fotoPerfil;
  if (fotoGuardada) {
    document.getElementById('fotoPerfil').src = fotoGuardada;
  }
  
  // Estadisticas
  actualizarEstadisticas(usuarioData);
  
  // Recomendaciones personalizadas
  mostrarRecomendacionesEnPerfil();
  
  // Evento para subir foto
  document.getElementById('uploadFoto').addEventListener('change', cargarFoto);
});

function obtenerDatosUsuario(username) {
  let usuarioData = JSON.parse(localStorage.getItem('usuarioData_' + username));
  if (!usuarioData) {
    usuarioData = {
      username: username,
      fotoPerfil: null,
      fechaRegistro: new Date().toLocaleString(),
      historial: [],
      estadisticas: {
        totalBusquedas: 0,
        productosConteo: {},
        totalLitros: 0
      }
    };
    localStorage.setItem('usuarioData_' + username, JSON.stringify(usuarioData));
  }
  return usuarioData;
}

function guardarDatosUsuario(username, datos) {
  localStorage.setItem('usuarioData_' + username, JSON.stringify(datos));
}

function cargarFoto() {
  const file = document.getElementById('uploadFoto').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const fotoBase64 = e.target.result;
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    const usuarioData = obtenerDatosUsuario(usuario.username);
    
    usuarioData.fotoPerfil = fotoBase64;
    guardarDatosUsuario(usuario.username, usuarioData);
    
    document.getElementById('fotoPerfil').src = fotoBase64;
  };
  reader.readAsDataURL(file);
}

function actualizarEstadisticas(usuarioData) {
  const stats = usuarioData.estadisticas;
  
  // Actualiza números
  document.getElementById('totalBusquedas').textContent = stats.totalBusquedas;
  document.getElementById('totalLitros').textContent = stats.totalLitros.toLocaleString();
  
  const promedio = stats.totalBusquedas > 0 ? (stats.totalLitros / stats.totalBusquedas).toFixed(0) : 0;
  document.getElementById('promediaLitros').textContent = promedio;
  
  // Producto más buscado
  let productoMasBuscado = '-';
  let maxBusquedas = 0;
  for (let [producto, cantidad] of Object.entries(stats.productosConteo)) {
    if (cantidad > maxBusquedas) {
      maxBusquedas = cantidad;
      productoMasBuscado = producto;
    }
  }
  document.getElementById('productoMasBuscado').textContent = productoMasBuscado;
  
  // Dibuja gráficos
  dibujarGraficos(usuarioData);
}

function dibujarGraficos(usuarioData) {
  const stats = usuarioData.estadisticas;
  
  // Top 5 productos más buscados
  const productosOrdenados = Object.entries(stats.productosConteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const nombresProductos = productosOrdenados.map(p => p[0]);
  const cantidadesProductos = productosOrdenados.map(p => p[1]);
  
  const ctxProductos = document.getElementById('chartProductos').getContext('2d');
  
  if (chartProductos) {
    chartProductos.destroy();
  }
  
  chartProductos = new Chart(ctxProductos, {
    type: 'bar',
    data: {
      labels: nombresProductos.length > 0 ? nombresProductos : ['Sin datos'],
      datasets: [{
        label: 'Búsquedas',
        data: cantidadesProductos.length > 0 ? cantidadesProductos : [0],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(244, 208, 63, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 107, 107, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(244, 208, 63, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(255, 107, 107, 1)'
        ],
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
  
  // Gráfico: distribución por categoría
  const categorias = {
    'Bebidas': 0,
    'Electrónica': 0,
    'Escolares': 0,
    'Ropa': 0
  };
  
  for (let [producto, cantidad] of Object.entries(stats.productosConteo)) {
    const categoria = MAPA_CATEGORIAS[producto] || 'Otros';
    if (categoria in categorias) {
      categorias[categoria] += cantidad;
    }
  }
  
  const ctxCategorias = document.getElementById('chartCategorias').getContext('2d');
  
  if (chartCategorias) {
    chartCategorias.destroy();
  }
  
  chartCategorias = new Chart(ctxCategorias, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(244, 208, 63, 0.8)',
          'rgba(76, 175, 80, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(244, 208, 63, 1)',
          'rgba(76, 175, 80, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function limpiarHistorial() {
  if (confirm('¿Estás seguro de que deseas limpiar todo el historial? Esta acción no se puede deshacer.')) {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    const usuarioData = obtenerDatosUsuario(usuario.username);
    
    usuarioData.estadisticas = {
      totalBusquedas: 0,
      productosConteo: {},
      totalLitros: 0
    };
    usuarioData.historial = [];
    
    guardarDatosUsuario(usuario.username, usuarioData);
    
    
    window.location.reload();
  }
}

/* FUNCIONES PARA MODALES DE ESTADISTICAS */

function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
  
  // Cierra modal al hacer clic fuera
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      cerrarModal(modalId);
    }
  });
  
  // Cierra modal con ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      cerrarModal(modalId);
    }
  });
}

function abrirModalBusquedas() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioData = obtenerDatosUsuario(usuario.username);
  
  const historicalBusquedas = document.getElementById('historicalBusquedas');
  historicalBusquedas.innerHTML = '';
  
  if (usuarioData.historial && usuarioData.historial.length > 0) {
    const historialInvertido = [...usuarioData.historial].reverse();
    
    historialInvertido.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'historial-item';
      div.innerHTML = `
        <div class="historial-item-info">
          <div class="historial-item-producto">${item.producto}</div>
          <div class="historial-item-detalles">
            Búsqueda #${usuarioData.historial.length - index} • ${item.fecha || 'Sin fecha'}
          </div>
        </div>
        <div class="historial-item-litros">${item.litros || '0'} L</div>
      `;
      historicalBusquedas.appendChild(div);
    });
  } else {
    historicalBusquedas.innerHTML = '<p style="text-align: center; color: #999;">No hay búsquedas registradas</p>';
  }
  
  abrirModal('modalBusquedas');
}

function abrirModalProducto() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioData = obtenerDatosUsuario(usuario.username);
  const stats = usuarioData.estadisticas;
  
  const detallesProducto = document.getElementById('detallesProducto');
  detallesProducto.innerHTML = '';
  
  // Producto más buscado
  let productoMasBuscado = '-';
  let maxBusquedas = 0;
  for (let [producto, cantidad] of Object.entries(stats.productosConteo)) {
    if (cantidad > maxBusquedas) {
      maxBusquedas = cantidad;
      productoMasBuscado = producto;
    }
  }
  
  // Top 5 productos
  const productosOrdenados = Object.entries(stats.productosConteo)
    .sort((a, b) => b[1] - a[1]);
  
  const htmlContent = `
    <div class="detalle-stat">
      <div class="detalle-stat-label">Producto Más Buscado</div>
      <div class="detalle-stat-valor">${productoMasBuscado}</div>
      <div class="detalle-stat-subtexto">Búsquedas: ${maxBusquedas}</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Porcentaje del Total</div>
      <div class="detalle-stat-valor">${stats.totalBusquedas > 0 ? ((maxBusquedas / stats.totalBusquedas) * 100).toFixed(1) : '0'}%</div>
      <div class="detalle-stat-subtexto">de ${stats.totalBusquedas} búsquedas totales</div>
    </div>
    
    <div style="margin-top: 25px;">
      <h3 style="color: #3c4776; font-size: 1.1em; margin-bottom: 15px;">Top 5 Productos Más Buscados</h3>
      <div class="producto-top-list">
        ${productosOrdenados.slice(0, 5).map((item, index) => `
          <div class="producto-item">
            <div class="producto-nombre">${index + 1}. ${item[0]}</div>
            <div class="producto-cantidad">${item[1]} búsquedas</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  detallesProducto.innerHTML = htmlContent;
  abrirModal('modalProducto');
}

function abrirModalPromedio() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioData = obtenerDatosUsuario(usuario.username);
  const stats = usuarioData.estadisticas;
  
  const detallesPromedio = document.getElementById('detallesPromedio');
  detallesPromedio.innerHTML = '';
  
  const promedio = stats.totalBusquedas > 0 ? (stats.totalLitros / stats.totalBusquedas).toFixed(2) : 0;
  const minimo = usuarioData.historial.length > 0 
    ? Math.min(...usuarioData.historial.map(h => parseFloat(h.litros) || 0))
    : 0;
  const maximo = usuarioData.historial.length > 0 
    ? Math.max(...usuarioData.historial.map(h => parseFloat(h.litros) || 0))
    : 0;
  
  const htmlContent = `
    <div class="detalle-stat">
      <div class="detalle-stat-label">Promedio de Litros</div>
      <div class="detalle-stat-valor">${promedio}</div>
      <div class="detalle-stat-subtexto">Litros por búsqueda</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Minimo Registrado</div>
      <div class="detalle-stat-valor">${minimo}</div>
      <div class="detalle-stat-subtexto">Menor cantidad de litros</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Máximo Registrado</div>
      <div class="detalle-stat-valor">${maximo}</div>
      <div class="detalle-stat-subtexto">Mayor cantidad de litros</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Desviación Estándar</div>
      <div class="detalle-stat-valor">${calcularDesviacionEstandar(usuarioData.historial).toFixed(2)}</div>
      <div class="detalle-stat-subtexto">Variabilidad en el consumo</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Total de Búsquedas</div>
      <div class="detalle-stat-valor">${stats.totalBusquedas}</div>
    </div>
  `;
  
  detallesPromedio.innerHTML = htmlContent;
  abrirModal('modalPromedio');
}

function abrirModalTotal() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const usuarioData = obtenerDatosUsuario(usuario.username);
  const stats = usuarioData.estadisticas;
  
  const detallesTotal = document.getElementById('detallesTotal');
  detallesTotal.innerHTML = '';
  
  const promedio = stats.totalBusquedas > 0 ? (stats.totalLitros / stats.totalBusquedas).toFixed(2) : 0;
  const productosUnicos = Object.keys(stats.productosConteo).length;
  
  const htmlContent = `
    <div class="detalle-stat">
      <div class="detalle-stat-label">Total de Litros</div>
      <div class="detalle-stat-valor">${stats.totalLitros.toLocaleString()}</div>
      <div class="detalle-stat-subtexto">Consumo total acumulado</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Total de Búsquedas</div>
      <div class="detalle-stat-valor">${stats.totalBusquedas}</div>
      <div class="detalle-stat-subtexto">Consultas realizadas</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Productos Diferentes</div>
      <div class="detalle-stat-valor">${productosUnicos}</div>
      <div class="detalle-stat-subtexto">Variedad de búsquedas</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Promedio por Búsqueda</div>
      <div class="detalle-stat-valor">${promedio}</div>
      <div class="detalle-stat-subtexto">Litros por cada búsqueda</div>
    </div>
    
    <div class="detalle-stat">
      <div class="detalle-stat-label">Miembro Desde</div>
      <div class="detalle-stat-valor" style="font-size: 1.2em;">${usuarioData.fechaRegistro}</div>
    </div>
  `;
  
  detallesTotal.innerHTML = htmlContent;
  abrirModal('modalTotal');
}

function calcularDesviacionEstandar(historial) {
  if (historial.length === 0) return 0;
  
  const litros = historial.map(h => parseFloat(h.litros) || 0);
  const promedio = litros.reduce((a, b) => a + b, 0) / litros.length;
  const varianza = litros.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / litros.length;
  
  return Math.sqrt(varianza);
}

function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
  }
}

function irAlCalculador() {
  window.location.href = 'index.html';
}
