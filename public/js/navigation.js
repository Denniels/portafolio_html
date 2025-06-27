// Puedes usar esto más adelante para cargar contenido dinámicamente
console.log("Navegación cargada correctamente.");

// Tema y color dinámico para todo el sitio
(function() {
  const root = document.documentElement;
  const modeSelect = document.getElementById('theme-mode');
  const colorSelect = document.getElementById('theme-color');

  // Paletas de color para claro y oscuro
  const palettes = {
    light: {
      gray:   { main: '#444',    bg: '#f6f6f6', card: '#e0e0e0' },
      blue:   { main: '#0077b6', bg: '#f8fafd', card: '#e0f7fa' },
      green:  { main: '#43a047', bg: '#f7faf8', card: '#e0f7e9' },
      purple: { main: '#6c3fc5', bg: '#f8f7fa', card: '#ede7f6' },
      gold:   { main: '#bfa13a', bg: '#fcfaf3', card: '#fff9e1' }
    },
    dark: {
      gray:   { main: '#e0e0e0', bg: '#23272e', card: '#444' },
      blue:   { main: '#90caf9', bg: '#181c24', card: '#22334a' },
      green:  { main: '#a5d6a7', bg: '#1b2320', card: '#2e4736' },
      purple: { main: '#b39ddb', bg: '#231c2e', card: '#3a2a4d' },
      gold:   { main: '#ffe082', bg: '#2e2a1b', card: '#4d432a' }
    }
  };

  function applyTheme(mode, color) {
    if (!palettes[mode] || !palettes[mode][color]) color = 'gray';
    const palette = palettes[mode][color];
    root.style.setProperty('--main-color', palette.main);
    root.style.setProperty('--main-bg', palette.bg);
    root.style.setProperty('--card-bg', palette.card);
    if (mode === 'dark') {
      root.style.setProperty('--main-text', '#f4f4f4');
      root.style.setProperty('--sidebar-bg', '#23272e');
      root.style.setProperty('--sidebar-text', '#f4f4f4');
      root.style.setProperty('--sidebar-link', '#f4f4f4');
      document.body.style.background = palette.bg;
      document.body.style.color = '#f4f4f4';
    } else {
      root.style.setProperty('--main-text', '#222');
      root.style.setProperty('--sidebar-bg', '#e0f7fa');
      root.style.setProperty('--sidebar-text', '#222');
      root.style.setProperty('--sidebar-link', '#0077b6');
      document.body.style.background = palette.bg;
      document.body.style.color = '#222';
    }
  }

  function saveTheme(mode, color) {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-color', color);
  }

  function loadTheme() {
    const mode = localStorage.getItem('theme-mode') || 'light';
    const color = localStorage.getItem('theme-color') || 'gray';
    if (modeSelect) modeSelect.value = mode;
    if (colorSelect) colorSelect.value = color;
    applyTheme(mode, color);
  }

  if (modeSelect && colorSelect) {
    modeSelect.addEventListener('change', function() {
      applyTheme(modeSelect.value, colorSelect.value);
      saveTheme(modeSelect.value, colorSelect.value);
    });
    colorSelect.addEventListener('change', function() {
      applyTheme(modeSelect.value, colorSelect.value);
      saveTheme(modeSelect.value, colorSelect.value);
    });
    loadTheme();
  } else {
    // Si no hay selectores, igual aplica el tema guardado
    const mode = localStorage.getItem('theme-mode') || 'light';
    const color = localStorage.getItem('theme-color') || 'gray';
    applyTheme(mode, color);
  }
})();
