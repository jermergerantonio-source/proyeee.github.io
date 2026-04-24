(function() {
  const KEY = 'modo_tema_activo'; 
  const GOTHIC_HREF = 'css/gothic.css';
  const BTN_ID = 'theme-toggle-button';

  // Obtiene el tema guardado
  function getMode() {
    if (localStorage.getItem('tema_gotico_activo') === '1') {
      localStorage.removeItem('tema_gotico_activo');
      localStorage.setItem(KEY, 'gothic');
      return 'gothic';
    }
    const mode = localStorage.getItem(KEY);
    
    return (mode === 'custom' || !mode) ? 'normal' : mode;
  }

  function setMode(mode) {
    localStorage.setItem(KEY, mode);
  }

  function addLink() {
    if (document.getElementById('gothic-stylesheet')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = GOTHIC_HREF;
    link.id = 'gothic-stylesheet';
    document.head.appendChild(link);
  }

  function removeLink() {
    const existing = document.getElementById('gothic-stylesheet');
    if (existing) existing.remove();
  }

  function applyTheme(mode) {
    // Aplica el tema correspondiente
    if (mode === 'gothic') addLink();
    else removeLink();

    // Limpiar estilos custom previos
    const customStyle = document.getElementById('custom-theme-style');
    if (customStyle) customStyle.remove();
    const editBtn = document.getElementById('theme-edit-button');
    if (editBtn) editBtn.remove();
  }

  function createButton() {
    if (document.getElementById(BTN_ID)) return document.getElementById(BTN_ID);
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.title = 'Cambiar tema';
    btn.setAttribute('aria-label', 'Toggle tema gótico');
    btn.innerText = 'Tema Normal';
    
    const headerContainer = document.querySelector('.header-app .container');
    Object.assign(btn.style, {
      cursor: 'pointer',
      fontSize: '20px',
      borderRadius: '6px', /* Bordes redondeados de boton normal */
      padding: '5px 12px',
      width: 'auto',
      height: 'auto',
      border: 'none',
      background: 'transparent'
    });

    if (headerContainer) {

      Object.assign(btn.style, {
        float: 'right',       // Alinear a la derecha
        position: 'static',   // Posicion normal en el flujo
        marginTop: '15px',    // Ajuste vertical aproximado
        background: 'rgba(0, 0, 0, 0.2)', // Fondo semi
        border: '1px solid rgba(139, 22, 34, 0.4)',
        transform: 'none'
      });
      // Insertar botón al principio
      headerContainer.insertBefore(btn, headerContainer.firstChild);
    } else {
      
      Object.assign(btn.style, {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 9999,
        background: '#1b0a0d',
        border: '1px solid #8b1622',
        color: '#e6dcdc'
      });
      document.body.appendChild(btn);
    }

    btn.addEventListener('click', function() {
      // Alterna entre normal y gótico
      const current = getMode();
      const next = current === 'gothic' ? 'normal' : 'gothic';
      
      setMode(next);
      applyTheme(next);
      updateButtonState(next);
    });

    return btn;
  }

  function updateButtonState(mode) {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;
    
    if (mode === 'normal') {
      btn.innerText = 'Tema Normal';
    } else if (mode === 'gothic') {
      btn.innerText = 'Tema Oscuro';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const mode = getMode();
    applyTheme(mode);
    createButton();
    updateButtonState(mode);
  });
})();
