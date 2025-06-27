// --- PDF Report Download ---
const downloadPdfBtn = document.getElementById('download-pdf');

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener('click', async () => {
    if (!currentData || !currentData.length) {
      alert('Primero carga y analiza un archivo de datos.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 12;
    doc.setFontSize(16);
    doc.text('Reporte de Análisis de Datos', 10, y);
    y += 10;
    doc.setFontSize(11);
    doc.text('Este informe fue generado automáticamente con la demo "Generador de Reportes Inteligente". El objetivo es democratizar el análisis de datos, facilitando la exploración y visualización de información para cualquier persona, sin necesidad de programar.', 10, y, {maxWidth: 185});
    y += 14;
    doc.setFontSize(12);
    doc.text('¿Qué incluye este informe?', 10, y);
    y += 7;
    doc.setFontSize(11);
    doc.text('- Vista previa de los datos cargados', 12, y); y += 6;
    doc.text('- Análisis exploratorio automático de columnas numéricas', 12, y); y += 6;
    doc.text('- Visualizaciones básicas (histograma, dispersión, frecuencia)', 12, y); y += 6;
    doc.text('- Simulación de agrupamiento (K-means)', 12, y); y += 8;
    doc.setFontSize(12);
    doc.text('Vista previa de datos:', 10, y);
    y += 6;
    // Tabla de datos (primeras 5 filas)
    const cols = Object.keys(currentData[0]);
    const rows = currentData.slice(0, 5).map(row => cols.map(c => String(row[c])));
    doc.autoTable({ head: [cols], body: rows, startY: y, theme: 'grid', headStyles: {fillColor: [0,180,255]}, styles: {fontSize:8} });
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;
    // EDA
    doc.setFontSize(12);
    doc.text('Análisis exploratorio:', 10, y);
    y += 6;
    doc.setFontSize(10);
    doc.text('Se calculan estadísticas básicas (media, mínimo y máximo) para cada columna numérica detectada en los datos.', 12, y, {maxWidth: 180});
    y += 10;
    const numericCols = cols.filter(col => currentData.every(row => !isNaN(parseFloat(row[col]))));
    numericCols.forEach(col => {
      const vals = currentData.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      const mean = (vals.reduce((a,b) => a+b,0)/vals.length).toFixed(2);
      const min = Math.min(...vals).toFixed(2);
      const max = Math.max(...vals).toFixed(2);
      doc.text(`${col}: media=${mean}, min=${min}, max=${max}`, 12, y);
      y += 6;
    });
    // IA (clustering)
    y += 2;
    doc.setFontSize(12);
    doc.text('Simulación IA (K-means):', 10, y);
    y += 6;
    doc.setFontSize(10);
    doc.text('Se aplica un algoritmo de agrupamiento simple (K-means, 2 clusters) sobre las dos primeras columnas numéricas, solo con fines demostrativos.', 12, y, {maxWidth: 180});
    y += 10;
    if (numericCols.length >= 2) {
      const {c1, c2} = kmeans2D(currentData, numericCols[0], numericCols[1]) || {};
      if (c1 && c2) {
        doc.text(`Centroides:`, 12, y);
        y += 6;
        doc.text(`${numericCols[0]}=${c1[0].toFixed(2)}, ${numericCols[1]}=${c1[1].toFixed(2)}`, 14, y);
        y += 6;
        doc.text(`${numericCols[0]}=${c2[0].toFixed(2)}, ${numericCols[1]}=${c2[1].toFixed(2)}`, 14, y);
        y += 6;
      } else {
        doc.text('No se pudo calcular clustering.', 12, y);
        y += 6;
      }
    } else {
      doc.text('No hay suficientes columnas numéricas.', 12, y);
      y += 6;
    }
    // Visualizaciones (explicación)
    doc.setFontSize(12);
    doc.text('Visualizaciones generadas:', 10, y);
    y += 6;
    doc.setFontSize(10);
    doc.text('- Histograma: muestra la distribución de la primera columna numérica.', 12, y, {maxWidth: 180}); y += 6;
    doc.text('- Dispersión: compara las dos primeras columnas numéricas.', 12, y, {maxWidth: 180}); y += 6;
    doc.text('- Frecuencia: cuenta los valores de la primera columna categórica.', 12, y, {maxWidth: 180}); y += 10;

    // --- Visualizaciones como imágenes ---
    const chartCanvases = Array.from(document.querySelectorAll('#charts-container canvas'));
    for (let i = 0; i < chartCanvases.length; i++) {
      const imgData = chartCanvases[i].toDataURL('image/png', 1.0);
      if (y > 220) { doc.addPage(); y = 15; }
      doc.setFontSize(11);
      let desc = '';
      if (i === 0) desc = 'Histograma de la primera columna numérica';
      else if (i === 1) desc = 'Gráfico de dispersión de las dos primeras columnas numéricas';
      else if (i === 2) desc = 'Gráfico de barras de frecuencia de la primera columna categórica';
      doc.text(desc, 10, y);
      y += 4;
      doc.addImage(imgData, 'PNG', 10, y, 90, 45);
      y += 50;
    }

    // Nota de responsabilidad
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setFontSize(10);
    doc.text('Nota: Este informe es solo una referencia inicial. La interpretación de los datos debe hacerse con responsabilidad y contexto. No se deben tomar decisiones críticas solo con base en este análisis automático.', 10, y, {maxWidth: 185});
    // Descargar
    doc.save('reporte_datos.pdf');
  });
}

// jsPDF autotable plugin loader (solo si no está ya cargado)
if (window.jspdf && !window.jspdf.autoTable) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.0/dist/jspdf.plugin.autotable.min.js';
  document.head.appendChild(script);
}
// Demo: Generador de Reportes Inteligente (Frontend JS)
// Procesa CSV, muestra análisis exploratorio y gráficos, simula clustering K-means

const fileInput = document.getElementById('file-input');
const loadDemoBtn = document.getElementById('load-demo');
const dataPreview = document.getElementById('data-preview');
const tableContainer = document.getElementById('table-container');
const analysisSection = document.getElementById('analysis-section');
const edaSummary = document.getElementById('eda-summary');
const chartsContainer = document.getElementById('charts-container');
const aiResult = document.getElementById('ai-result');

let currentData = null;

// Demo dataset (Iris)
const demoCSV = `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
6.2,3.4,5.4,2.3,virginica
5.9,3.0,5.1,1.8,virginica
5.7,2.8,4.1,1.3,versicolor
6.3,3.3,4.7,1.6,versicolor
`;

function showTable(data) {
  if (!data || !data.length) return;
  let html = '<table><thead><tr>';
  Object.keys(data[0]).forEach(col => html += `<th>${col}</th>`);
  html += '</tr></thead><tbody>';
  data.slice(0, 20).forEach(row => {
    html += '<tr>';
    Object.values(row).forEach(val => html += `<td>${val}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  tableContainer.innerHTML = html;
  dataPreview.style.display = '';
}

function showEDA(data) {
  if (!data || !data.length) return;
  // Solo columnas numéricas
  const numericCols = Object.keys(data[0]).filter(col => data.every(row => !isNaN(parseFloat(row[col]))));
  let html = '<ul>';
  numericCols.forEach(col => {
    const vals = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    const mean = (vals.reduce((a,b) => a+b,0)/vals.length).toFixed(2);
    const min = Math.min(...vals).toFixed(2);
    const max = Math.max(...vals).toFixed(2);
    html += `<li><b>${col}</b>: media=${mean}, min=${min}, max=${max}</li>`;
  });
  html += '</ul>';
  edaSummary.innerHTML = html;
  analysisSection.style.display = '';
}

function showCharts(data) {
  chartsContainer.innerHTML = '';
  const numericCols = Object.keys(data[0]).filter(col => data.every(row => !isNaN(parseFloat(row[col]))));
  const catCols = Object.keys(data[0]).filter(col => !numericCols.includes(col));
  // Histograma de la primera columna numérica
  if (numericCols.length > 0) {
    const col = numericCols[0];
    const vals = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    const canvas = document.createElement('canvas');
    chartsContainer.appendChild(canvas);
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: vals.map((_,i) => i+1),
        datasets: [{ label: `Histograma: ${col}`, data: vals, backgroundColor: '#00b4ff88' }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  // Gráfico de dispersión (scatter) para las dos primeras numéricas
  if (numericCols.length >= 2) {
    const colX = numericCols[0], colY = numericCols[1];
    const points = data.map(row => ({x: parseFloat(row[colX]), y: parseFloat(row[colY])})).filter(p => !isNaN(p.x) && !isNaN(p.y));
    const canvas = document.createElement('canvas');
    chartsContainer.appendChild(canvas);
    new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: `Dispersión: ${colX} vs ${colY}`,
          data: points,
          backgroundColor: '#43a04799',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: colX } },
          y: { title: { display: true, text: colY } }
        }
      }
    });
  }
  // Gráfico de barras para la primera columna categórica
  if (catCols.length > 0) {
    const catCol = catCols[0];
    const freq = {};
    data.forEach(row => {
      const v = row[catCol];
      if (v) freq[v] = (freq[v]||0)+1;
    });
    const labels = Object.keys(freq);
    const counts = labels.map(l => freq[l]);
    const canvas = document.createElement('canvas');
    chartsContainer.appendChild(canvas);
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: `Frecuencia: ${catCol}`, data: counts, backgroundColor: '#f9a825cc' }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
}

// Simulación IA: K-means clustering (2 clusters, 2D)
function kmeans2D(data, colX, colY) {
  // Algoritmo simple, solo para demo
  const points = data.map(row => [parseFloat(row[colX]), parseFloat(row[colY])]).filter(([x,y]) => !isNaN(x)&&!isNaN(y));
  if (points.length < 2) return null;
  let c1 = points[0], c2 = points[1];
  for (let iter=0; iter<5; iter++) {
    const clusters = [[],[]];
    points.forEach(p => {
      const d1 = Math.hypot(p[0]-c1[0], p[1]-c1[1]);
      const d2 = Math.hypot(p[0]-c2[0], p[1]-c2[1]);
      clusters[d1<d2?0:1].push(p);
    });
    c1 = clusters[0].reduce((a,b)=>[a[0]+b[0],a[1]+b[1]], [0,0]).map(x=>x/clusters[0].length);
    c2 = clusters[1].reduce((a,b)=>[a[0]+b[0],a[1]+b[1]], [0,0]).map(x=>x/clusters[1].length);
  }
  return {c1, c2};
}

function showAI(data) {
  // Usa las dos primeras columnas numéricas
  const numericCols = Object.keys(data[0]).filter(col => data.every(row => !isNaN(parseFloat(row[col]))));
  if (numericCols.length < 2) { aiResult.innerHTML = 'No hay suficientes columnas numéricas.'; return; }
  const {c1, c2} = kmeans2D(data, numericCols[0], numericCols[1]) || {};
  if (!c1 || !c2) { aiResult.innerHTML = 'No se pudo calcular clustering.'; return; }
  aiResult.innerHTML = `<b>Centroides K-means:</b><br>${numericCols[0]}=${c1[0].toFixed(2)}, ${numericCols[1]}=${c1[1].toFixed(2)}<br>${numericCols[0]}=${c2[0].toFixed(2)}, ${numericCols[1]}=${c2[1].toFixed(2)}`;
}

function processData(data) {
  currentData = data;
  showTable(data);
  showEDA(data);
  showCharts(data);
  showAI(data);
}

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => processData(results.data)
    });
  } else if (file.name.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) processData(data);
        else alert('El JSON debe ser un array de objetos.');
      } catch {
        alert('JSON inválido.');
      }
    };
    reader.readAsText(file);
  } else {
    alert('Solo se permiten archivos CSV o JSON en la demo.');
  }
});

loadDemoBtn.addEventListener('click', () => {
  Papa.parse(demoCSV, {
    header: true,
    skipEmptyLines: true,
    complete: results => processData(results.data)
  });
});
