let history = [];
let historyStep = -1;

function saveState() {
  history = history.slice(0, historyStep + 1); // Discard forward steps
  history.push(canvas.toDataURL());
  historyStep++;
}


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isErasing = false;

const colorPicker = document.getElementById('color');
const sizePicker = document.getElementById('size');
const clearButton = document.getElementById('clear');

let drawing = false;
let brushColor = colorPicker.value;
let brushSize = sizePicker.value;

// Resize canvas to fit window
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing functions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
function draw(e) {
  if (!drawing) return;

  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isErasing ? '#ffffff' : brushColor;

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// Touch support
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startDrawing({ offsetX: touch.clientX - canvas.offsetLeft, offsetY: touch.clientY - canvas.offsetTop });
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  draw({ offsetX: touch.clientX - canvas.offsetLeft, offsetY: touch.clientY - canvas.offsetTop });
});
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
 canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  draw(e);
  saveState();
});

}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  const bgColor = document.body.classList.contains('dark-mode') ? '#121212' : '#ffffff';
  ctx.strokeStyle = isErasing ? bgColor : brushColor;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath(); // resets the current path
}

// Update brush settings
colorPicker.addEventListener('input', () => {
  brushColor = colorPicker.value;
});
sizePicker.addEventListener('input', () => {
  brushSize = sizePicker.value;
});

// Clear the canvas
clearButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const themeToggle = document.getElementById('themeSwitcher');

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});

const saveButton = document.getElementById('save');

saveButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
});

const eraserBtn = document.getElementById('eraser');

eraserBtn.addEventListener('click', () => {
  isErasing = !isErasing;
  eraserBtn.classList.toggle('active', isErasing);
});

function restoreState(step) {
  const img = new Image();
  img.src = history[step];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

document.getElementById('undo').addEventListener('click', () => {
  if (historyStep > 0) {
    historyStep--;
    restoreState(historyStep);
  }
});

document.getElementById('redo').addEventListener('click', () => {
  if (historyStep < history.length - 1) {
    historyStep++;
    restoreState(historyStep);
  }
});

saveState(); // Save initial blank canvas
