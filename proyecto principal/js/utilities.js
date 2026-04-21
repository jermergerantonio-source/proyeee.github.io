// Utilidades: buscador, historial, notificaciones, backup y recomendaciones

function inicializarBuscadorDropdown() {
  const selectElement = document.getElementById('producto');
  if (!selectElement) return;
  
  // Crear contenedor para el buscador
  const wrapper = selectElement.parentElement;
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = 'position: relative; margin-bottom: 10px;';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '🔍 Buscar producto...';
  searchInput.id = 'search-producto';
  searchInput.style.cssText = `
    width: 100%;
    padding: 10px 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.95em;
    transition: all 0.3s ease;
  `;
  
  searchInput.addEventListener('focus', function() {
    this.style.borderColor = '#3c4776';
    this.style.boxShadow = '0 0 12px rgba(60, 71, 118, 0.2)';
  });
  
  searchInput.addEventListener('blur', function() {
    this.style.borderColor = '#ddd';
    this.style.boxShadow = 'none';
  });
  
  searchContainer.appendChild(searchInput);
  wrapper.insertBefore(searchContainer, selectElement);
  
  // Funcionalidad de búsqueda
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const options = selectElement.querySelectorAll('option');
    
    options.forEach(option => {
      if (option.value === '') return;
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  });
}

// Historial visual de búsquedas
function agregarAlHistorialVisual(producto, litros, clasificacion) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) return;
  
  const usuarioData = JSON.parse(localStorage.getItem('usuarioData_' + usuario.username)) || {};
  
  if (!usuarioData.historialVisual) {
    usuarioData.historialVisual = [];
  }
  
  usuarioData.historialVisual.push({
    producto: producto,
    litros: litros,
    clasificacion: clasificacion,
    fecha: new Date().toLocaleString(),
    timestamp: Date.now()
  });
  
  // Mantener solo los últimos 50 registros
  if (usuarioData.historialVisual.length > 50) {
    usuarioData.historialVisual = usuarioData.historialVisual.slice(-50);
  }
  
  localStorage.setItem('usuarioData_' + usuario.username, JSON.stringify(usuarioData));
}

// Convertir litros a minutos de ducha (para que la gente entienda)
function obtenerEquivalenteDuchas(litros) {
  const litrosPorDucha = 60; // Promedio de ducha: 60 litros
  const duchas = Math.ceil(litros / litrosPorDucha);
  const minutos = Math.round((litros / litrosPorDucha) * 10) / 10;
  
  return {
    duchas: duchas,
    minutos: minutos,
    litrosPorDucha: litrosPorDucha,
    descripcion: `${litros.toLocaleString()} L de agua = ${minutos} minutos de ducha (~${duchas} ducha${duchas !== 1 ? 's' : ''})`
  };
}

// Alerta si el impacto es demasiado alto
function mostrarNotificacionImpactoAlto(litros, producto) {
  const UMBRAL_CRITICO = 5000; // 5000+ litros
  
  if (litros >= UMBRAL_CRITICO) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      margin: 15px 0;
      border-left: 5px solid #ff1744;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
      animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
      <span style="font-size: 1.5em;">⚠️</span>
      <div>
        <strong>¡IMPACTO ALTO!</strong>
        <p style="margin: 5px 0 0 0; font-size: 0.9em;">
          El producto seleccionado consume ${litros.toLocaleString()} litros de agua. 
          Esto es ${(litros / 60).toFixed(1)} duchas.
        </p>
      </div>
    `;
    
    const resultadoDiv = document.getElementById('resultado');
    if (resultadoDiv) {
      resultadoDiv.insertBefore(notification, resultadoDiv.firstChild);
      
      // Agregar animación CSS
      if (!document.getElementById('style-animations')) {
        const style = document.createElement('style');
        style.id = 'style-animations';
        style.textContent = `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        notification.style.animation = 'slideOutLeft 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }
  }
}

// Verificar que nadie manipuló los datos en localStorage
function validarSeguidadLocalStorage() {
  try {
    // Validar que los datos no han sido manipulados
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    
    if (!usuarioActivo) return true;
    
    // Verificar que el usuario existe
    const usuarioExiste = usuarios.some(u => u.username === usuarioActivo.username);
    
    if (!usuarioExiste) {
      console.warn('Posible manipulación de datos detectada');
      localStorage.removeItem('usuarioActivo');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error validando seguridad:', e);
    return false;
  }
}

// Descargar un backup de todos tus datos
function crearBackupCompleto() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    alert('Debes iniciar sesión para hacer backup');
    return;
  }
  
  const backup = {
    usuarios: JSON.parse(localStorage.getItem('usuarios')),
    usuarioData: JSON.parse(localStorage.getItem('usuarioData_' + usuario.username)),
    usuarioActivo: usuario,
    fechaBackup: new Date().toLocaleString()
  };
  
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup-calculadora-' + new Date().getTime() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Backup creado exitosamente');
}

function restaurarBackup(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      
      // Validaciones
      if (!backup.usuarios || !backup.usuarioData || !backup.usuarioActivo) {
        alert('Archivo de backup inválido');
        return;
      }
      
      // Restaurar datos
      localStorage.setItem('usuarios', JSON.stringify(backup.usuarios));
      localStorage.setItem('usuarioData_' + backup.usuarioActivo.username, JSON.stringify(backup.usuarioData));
      localStorage.setItem('usuarioActivo', JSON.stringify(backup.usuarioActivo));
      
      alert('Datos restaurados exitosamente. Recargando...');
      window.location.reload();
    } catch (e) {
      alert('Error al restaurar backup: ' + e.message);
    }
  };
  reader.readAsText(file);
}

// Analiza tus búsquedas y da consejos personalizados
function generarRecomendacionesPersonalizadas() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) return;
  
  const usuarioData = JSON.parse(localStorage.getItem('usuarioData_' + usuario.username));
  if (!usuarioData || !usuarioData.estadisticas) return;
  
  const stats = usuarioData.estadisticas;
  const recomendaciones = [];
  
  // Analizar patrones
  const productosConteo = stats.productosConteo || {};
  const productosArray = Object.entries(productosConteo).sort((a, b) => b[1] - a[1]);
  
  if (productosArray.length > 0) {
    const [productoMasBuscado, veces] = productosArray[0];
    
    if (veces > 5) {
      recomendaciones.push(`📊 Nota: Has calculado "${productoMasBuscado}" ${veces} veces. Considera reducir su consumo.`);
    }
  }
  
  // Análisis de impacto promedio
  if (stats.totalBusquedas > 10) {
    const promedio = stats.totalLitros / stats.totalBusquedas;
    
    if (promedio > 5000) {
      recomendaciones.push('⚠️ Tu promedio de consumo de agua es muy alto. Considera alternativas más sostenibles.');
    } else if (promedio > 2000) {
      recomendaciones.push('💧 Tu consumo promedio es moderado. Hay oportunidades para mejorar.');
    } else {
      recomendaciones.push('✅ ¡Excelente! Tu consumo promedio de agua es responsable.');
    }
  }
  
  // Recomendación de alimentos vs otros
  const categoriasAlimentos = ['arroz', 'carne', 'pollo', 'pescado', 'leche', 'queso'];
  const consumoAlimentos = categoriasAlimentos.reduce((suma, prod) => {
    return suma + (productosConteo[prod] || 0);
  }, 0);
  
  if (consumoAlimentos > 3) {
    recomendaciones.push('🥕 Considera reducir tu consumo de carne y productos lacteos - son los de mayor huella hidrica.');
  }
  
  return recomendaciones.length > 0 ? recomendaciones : ['📝 Sin recomendaciones especificas aun.'];
}

function mostrarRecomendacionesEnPerfil() {
  const recomendaciones = generarRecomendacionesPersonalizadas();
  if (!recomendaciones || recomendaciones.length === 0) return;
  
  const container = document.createElement('div');
  container.id = 'recomendaciones-container';
  
  container.innerHTML = '<h3>💡 Recomendaciones Personalizadas</h3>' +
    recomendaciones.map(r => `<p>${r}</p>`).join('');
  
  const estadisticasSection = document.querySelector('.estadisticas-section');
  if (estadisticasSection) {
    estadisticasSection.insertAdjacentElement('afterend', container);
  }
}

// Inicializar buscador cuando el DOM carga
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('producto')) {
    inicializarBuscadorDropdown();
    validarSeguidadLocalStorage();
  }
});
