// Crea footer en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
  // Crear el footer si no existe
  if (!document.getElementById('app-footer')) {
    const footer = document.createElement('footer');
    footer.id = 'app-footer';
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-section">
          <h4>Sobre la Calculadora</h4>
          <p>Herramienta educativa para concienciar sobre el consumo innecesario de agua en la producción de bienes.</p>
        </div>
        <div class="footer-section">
          <h4>Información</h4>
          <ul>
            <li><a href="#" onclick="mostrarAcercaDe(); return false;">Acerca de</a></li>
            <li><a href="#" onclick="mostrarFAQ(); return false;">Preguntas Frecuentes</a></li>
            <li><a href="#" onclick="mostrarContacto(); return false;">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Datos</h4>
          <ul>
            <li><a href="#" onclick="exportarDatos(); return false;">Exportar mis datos</a></li>
            <li><a href="#" onclick="descargarPDF(); return false;">Descargar reporte</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Email: info@calculadoraagua.com</p>
          <p>© 2026 Calculadora de Agua. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }
});

function mostrarAcercaDe() {
  alert('Calculadora de Gasto Innecesario de Agua' +
        'Esta herramienta educativa calcula la cantidad de agua virtual usada en la ' +
        'producción de diversos productos de consumo diario.\\n\\n' +
        'Objetivos:' +
        '- Concientizar sobre el consumo de agua\\n' +
        '- Educar sobre el impacto ambiental\\n' +
        '- Promover el consumo responsable\\n\\n' +
        'Versión 2.0 - 2026');
}

function mostrarFAQ() {
  alert('PREGUNTAS FRECUENTES\\n\\n' +
        '¿Qué es el agua virtual?\\n' +
        'Es la cantidad total de agua usada para producir un bien.\\n\\n' +
        '¿Por qué la carne usa tanta agua?\\n' +
        'Porque se gasta agua en alimento del ganado, bebida, y procesamiento.\\n\\n' +
        '¿Es exacto este cálculo?\\n' +
        'Son estimaciones basadas en estudios ambientales.\\n\\n' +
        'Mas información en nuestro sitio web.');
}

function mostrarContacto() {
  alert('CONTACTO\\n\\n' +
        'Email: info@calculadoraagua.com\\n' +
        'Teléfono: +1-234-567-8900\\n' +
        'Web: www.calculadoraagua.com\\n\\n' +
        'Siguenos en redes sociales:\\n' +
        '@calculadoraagua');
}

function exportarDatos() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    alert('Debes iniciar sesión');
    return;
  }

  const usuarioData = JSON.parse(localStorage.getItem('usuarioData_' + usuario.username));
  const json = JSON.stringify(usuarioData, null, 2);
  
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'datos-usuario-' + usuario.username + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('Datos exportados exitosamente');
}

function descargarPDF() {
  alert('✨ Funcionalidad avanzada:\\n\\n' +
        'Para descargar tu reporte en PDF:\\n' +
        '1. Ve a tu perfil y selecciona "Exportar mis datos"\\n' +
        '2. Abre el archivo JSON en línea en: www.json2csv.com\\n' +
        '3. Usa herramientas como print-to-PDF de tu navegador\\n\\n' +
        'También puedes usar programas como LibreOffice para importar los datos.');
}
