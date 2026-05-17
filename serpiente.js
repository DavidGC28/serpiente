// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

// Tamaño de cada bloque (cuadrícula) y dimensiones del mapa
const TAMANIO_BLOQUE = 25; // 500 / 25 = 20 filas y 20 columnas
const CONFIG_MAPA = canvas.width / TAMANIO_BLOQUE;

// Estado del juego
let serpiente = [];
let comida = { x: 0, y: 0 };
let direccion = "derecha";
let proximaDireccion = "derecha";
let puntaje = 0;
let juegoEjecutandose = false;
let bucleJuego = null;
let velocidad = 130; // Tiempo en milisegundos por cada movimiento

// ==========================================
// CONTROLES DE FLUJO DEL JUEGO
// ==========================================

function iniciarJuego() {
    if (juegoEjecutandose) return; // Evita duplicar el bucle si ya está corriendo

    juegoEjecutandose = true;
    actualizarInterfaz("En curso", "¡Sobrevive al sistema!");

    // Si el juego se pausó y se reanuda, continúa donde estaba; si no, inicializa uno nuevo
    if (serpiente.length === 0) {
        inicializarComponentes();
    }

    bucleJuego = setInterval(actualizarCuadro, velocidad);
}

function pausarJuego() {
    if (!juegoEjecutandose) return;

    juegoEjecutandose = false;
    clearInterval(bucleJuego);
    actualizarInterfaz("Pausado", "Halt del sistema operativo.");
}

function reiniciarJuego() {
    clearInterval(bucleJuego);
    juegoEjecutandose = false;
    inicializarComponentes();
    iniciarJuego();
}

function inicializarComponentes() {
    // La serpiente inicia en el centro con un tamaño de 3 bloques
    serpiente = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direccion = "derecha";
    proximaDireccion = "derecha";
    puntaje = 0;
    
    document.getElementById("puntaje").innerText = puntaje;
    generarComida();
    dibujar();
}

// ==========================================
// ADMINISTRACIÓN DE DIRECCIONES
// ==========================================
function cambiarDireccion(nuevaDireccion) {
    // Evitamos que la serpiente gire 180 grados sobre sí misma directamente
    if (nuevaDireccion === "arriba" && direccion !== "abajo") proximaDireccion = "arriba";
    if (nuevaDireccion === "abajo" && direccion !== "arriba") proximaDireccion = "abajo";
    if (nuevaDireccion === "izquierda" && direccion !== "derecha") proximaDireccion = "izquierda";
    if (nuevaDireccion === "derecha" && direccion !== "izquierda") proximaDireccion = "derecha";
}

// Soporte para controlar el juego también con las flechas del teclado físico
document.addEventListener("keydown", function(evento) {
    if (evento.key === "ArrowUp") cambiarDireccion("arriba");
    if (evento.key === "ArrowDown") cambiarDireccion("abajo");
    if (evento.key === "ArrowLeft") cambiarDireccion("izquierda");
    if (evento.key === "ArrowRight") cambiarDireccion("derecha");
    if (evento.key === " " || evento.key === "p") { // Barra espaciadora o P para pausar
        if (juegoEjecutandose) pausarJuego(); else iniciarJuego();
    }
});

// ==========================================
// LÓGICA DE ACTUALIZACIÓN (MECÁNICAS)
// ==========================================
function actualizarCuadro() {
    direccion = proximaDireccion;

    // Calcular dónde estará la nueva cabeza
    let cabezaX = serpiente[0].x;
    let cabezaY = serpiente[0].y;

    if (direccion === "arriba") cabezaY--;
    if (direccion === "abajo") cabezaY++;
    if (direccion === "izquierda") cabezaX--;
    if (direccion === "derecha") cabezaX++;

    // 1. Detección de colisiones contra las paredes del mapa o contra su propio cuerpo
    if (cabezaX < 0 || cabezaX >= CONFIG_MAPA || cabezaY < 0 || cabezaY >= CONFIG_MAPA || verificarAutocolision(cabezaX, cabezaY)) {
        finalizarJuego();
        return;
    }

    // Insertar la nueva cabeza al inicio del arreglo de la serpiente
    let nuevaCabeza = { x: cabezaX, y: cabezaY };
    serpiente.unshift(nuevaCabeza);

    // 2. Detección de comida
    if (cabezaX === comida.x && cabezaY === comida.y) {
        puntaje += 10;
        document.getElementById("puntaje").innerText = puntaje;
        generarComida();
    } else {
        // Si no come, remueve el último bloque (mantiene el tamaño actual al moverse)
        serpiente.pop();
    }

    dibujar();
}

function verificarAutocolision(x, y) {
    // Comprueba si las coordenadas coinciden con alguna parte del cuerpo
    for (let i = 0; i < serpiente.length; i++) {
        if (serpiente[i].x === x && serpiente[i].y === y) return true;
    }
    return false;
}

function generarComida() {
    // Ubica la comida aleatoriamente dentro de la cuadrícula
    comida.x = Math.floor(Math.random() * CONFIG_MAPA);
    comida.y = Math.floor(Math.random() * CONFIG_MAPA);

    // Asegura que la comida no aparezca encima del cuerpo de la serpiente
    for (let i = 0; i < serpiente.length; i++) {
        if (serpiente[i].x === comida.x && serpiente[i].y === comida.y) {
            generarComida();
            break;
        }
    }
}

function finalizarJuego() {
    clearInterval(bucleJuego);
    juegoEjecutandose = false;
    serpiente = []; // Vacía la serpiente para forzar una reinicialización al iniciar de nuevo
    actualizarInterfaz("Terminado", "CRITICAL ERROR: Sincronización rota.");
    alert("¡JUEGO TERMINADO! Tu puntaje final fue de: " + puntaje);
}

function actualizarInterfaz(estado, mensaje) {
    document.getElementById("estado").innerText = estado;
    document.getElementById("mensaje").innerText = mensaje;
}

// ==========================================
// RENDERIZADO / GRÁFICOS DEL CANVAS
// ==========================================
function dibujar() {
    // Limpiar el lienzo completo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar la comida (Estilo Núcleo / Item de energía)
    ctx.fillStyle = "#10b981"; // El característico verde lima brillante
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#10b981"; // Efecto de brillo de energía
    ctx.fillRect(comida.x * TAMANIO_BLOQUE + 2, comida.y * TAMANIO_BLOQUE + 2, TAMANIO_BLOQUE - 4, TAMANIO_BLOQUE - 4);

    // Dibujar la Serpiente (Estilo Blindaje Mecánico de NERV)
    ctx.shadowBlur = 0; // Quitar brillo para el cuerpo por rendimiento
    for (let i = 0; i < serpiente.length; i++) {
        // La cabeza tiene un color ligeramente más claro/destacado que el cuerpo
        ctx.fillStyle = i === 0 ? "#a78bfa" : "#5c468c"; 
        ctx.strokeStyle = "#151221"; // Separador entre bloques
        
        let xPos = serpiente[i].x * TAMANIO_BLOQUE;
        let yPos = serpiente[i].y * TAMANIO_BLOQUE;

        ctx.fillRect(xPos, yPos, TAMANIO_BLOQUE, TAMANIO_BLOQUE);
        ctx.strokeRect(xPos, yPos, TAMANIO_BLOQUE, TAMANIO_BLOQUE);
    }
}

// Pintar la pantalla vacía inicial antes de arrancar
dibujar();



