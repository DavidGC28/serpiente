const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

const TAMANIO_BLOQUE = 25; 
const CONFIG_MAPA = canvas.width / TAMANIO_BLOQUE;

let serpiente = [];
let comida = { x: 0, y: 0 };
let direccion = "derecha";
let proximaDireccion = "derecha";
let puntaje = 0;
let juegoEjecutandose = false;
let bucleJuego = null;

const VELOCIDAD_INICIAL = 350; 
let velocidad = VELOCIDAD_INICIAL; 

function iniciarJuego() {
    if (juegoEjecutandose) return; 
    juegoEjecutandose = true;
    actualizarInterfaz("En curso", "¡Sobrevive al sistema!");

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
    serpiente = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direccion = "derecha";
    proximaDireccion = "derecha";
    puntaje = 0;
    velocidad = VELOCIDAD_INICIAL; 
    
    document.getElementById("puntaje").innerText = puntaje;
    generarComida();
    dibujar();
}

function cambiarDireccion(nuevaDireccion) {
    if (nuevaDireccion === "arriba" && direccion !== "abajo") proximaDireccion = "arriba";
    if (nuevaDireccion === "abajo" && direccion !== "arriba") proximaDireccion = "abajo";
    if (nuevaDireccion === "izquierda" && direccion !== "derecha") proximaDireccion = "izquierda";
    if (nuevaDireccion === "derecha" && direccion !== "izquierda") proximaDireccion = "derecha";
}

document.addEventListener("keydown", function(evento) {
    if (evento.key === "ArrowUp") cambiarDireccion("arriba");
    if (evento.key === "ArrowDown") cambiarDireccion("abajo");
    if (evento.key === "ArrowLeft") cambiarDireccion("izquierda");
    if (evento.key === "ArrowRight") cambiarDireccion("derecha");
    if (evento.key === " " || evento.key === "p") { 
        if (juegoEjecutandose) pausarJuego(); else iniciarJuego();
    }
});

function actualizarCuadro() {
    direccion = proximaDireccion;

    let cabezaX = serpiente[0].x;
    let cabezaY = serpiente[0].y;

    if (direccion === "arriba") cabezaY--;
    if (direccion === "abajo") cabezaY++;
    if (direccion === "izquierda") cabezaX--;
    if (direccion === "derecha") cabezaX++;

    if (cabezaX < 0 || cabezaX >= CONFIG_MAPA || cabezaY < 0 || cabezaY >= CONFIG_MAPA || verificarAutocolision(cabezaX, cabezaY)) {
        finalizarJuego();
        return;
    }

    let nuevaCabeza = { x: cabezaX, y: cabezaY };
    serpiente.unshift(nuevaCabeza);

    if (cabezaX === comida.x && cabezaY === comida.y) {
        puntaje += 10;
        document.getElementById("puntaje").innerText = puntaje;
        generarComida();

        // Incremento de velocidad agresivo (-35ms por comida)
        if (velocidad > 70) { 
            velocidad -= 35; 
            clearInterval(bucleJuego);
            bucleJuego = setInterval(actualizarCuadro, velocidad);
        }
    } else {
        serpiente.pop();
    }

    dibujar();
}

    let nuevaCabeza = { x: cabezaX, y: cabezaY };
    serpiente.unshift(nuevaCabeza);

    if (cabezaX === comida.x && cabezaY === comida.y) {
        puntaje += 10;
        document.getElementById("puntaje").innerText = puntaje;
        generarComida();

        // Aceleración dinámica con tope de dificultad en 80ms
        if (velocidad > 80) { 
            velocidad -= 15; 
            clearInterval(bucleJuego);
            bucleJuego = setInterval(actualizarCuadro, velocidad);
        }
    } else {
        serpiente.pop();
    }

    dibujar();



function verificarAutocolision(x, y) {
    for (let i = 0; i < serpiente.length; i++) {
        if (serpiente[i].x === x && serpiente[i].y === y) return true;
    }
    return false;
}

function generarComida() {
    comida.x = Math.floor(Math.random() * CONFIG_MAPA);
    comida.y = Math.floor(Math.random() * CONFIG_MAPA);

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
    serpiente = []; 
    actualizarInterfaz("Terminado", "CRITICAL ERROR: Sincronización rota.");
    alert("¡JUEGO TERMINADO! Tu puntaje final fue de: " + puntaje);
}

function actualizarInterfaz(estado, mensaje) {
    document.getElementById("estado").innerText = estado;
    document.getElementById("mensaje").innerText = mensaje;
}

function dibujar() {
    // Limpiar pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Color monocromático del píxel activo de Nokia 3310
    const COLOR_PIXEL = "#12160f";
    ctx.fillStyle = COLOR_PIXEL;
    ctx.shadowBlur = 0; // Desactivar resplandores modernos

    // ==========================================
    // --- 1. COMIDA: RATÓN PIXELADO DE 8 BITS ---
    // ==========================================
    let fx = comida.x * TAMANIO_BLOQUE;
    let fy = comida.y * TAMANIO_BLOQUE;
    let p = 3; // Tamaño del píxel interno del ratón

    // Orejas
    ctx.fillRect(fx + 3 * p, fy + 1 * p, p, p);
    ctx.fillRect(fx + 4 * p, fy + 2 * p, p, p);
    // Cuerpo
    ctx.fillRect(fx + 2 * p, fy + 3 * p, 4 * p, 2 * p);
    ctx.fillRect(fx + 1 * p, fy + 4 * p, p, p); // Nariz (Izquierda)
    // Patas
    ctx.fillRect(fx + 2 * p, fy + 5 * p, p, p);
    ctx.fillRect(fx + 5 * p, fy + 5 * p, p, p);
    // Cola
    ctx.fillRect(fx + 6 * p, fy + 4 * p, p, p);
    ctx.fillRect(fx + 7 * p, fy + 3 * p, p, p);


    // ==========================================
    // --- 2. SERPIENTE PIXELADA DINÁMICA ---
    // ==========================================
    for (let i = 0; i < serpiente.length; i++) {
        let xPos = serpiente[i].x * TAMANIO_BLOQUE;
        let yPos = serpiente[i].y * TAMANIO_BLOQUE;

        if (i === 0) {
            // --- CABEZA DE LA SERPIENTE (Bloque Completo) ---
            ctx.fillStyle = COLOR_PIXEL;
            ctx.fillRect(xPos, yPos, TAMANIO_BLOQUE, TAMANIO_BLOQUE);

            // Ojos en "pantalla LCD" (píxeles apagados/transparentes del fondo)
            ctx.fillStyle = "#b2bfa2"; 
            let offset = 4;
            let tamOjo = 4;

            if (direccion === "derecha" || direccion === "izquierda") {
                let mult = direccion === "derecha" ? 1 : -1;
                let dexFrente = mult === 1 ? TAMANIO_BLOQUE - offset - tamOjo : offset;
                
                ctx.fillRect(xPos + dexFrente, yPos + offset, tamOjo, tamOjo);
                ctx.fillRect(xPos + dexFrente, yPos + TAMANIO_BLOQUE - offset - tamOjo, tamOjo, tamOjo);
            } else {
                let mult = direccion === "abajo" ? 1 : -1;
                let deyFrente = mult === 1 ? TAMANIO_BLOQUE - offset - tamOjo : offset;

                ctx.fillRect(xPos + offset, yPos + deyFrente, tamOjo, tamOjo);
                ctx.fillRect(xPos + TAMANIO_BLOQUE - offset - tamOjo, yPos + deyFrente, tamOjo, tamOjo);
            }

        } else {
            // --- CUERPO SEGMENTADO (Efecto cónico retro) ---
            ctx.fillStyle = COLOR_PIXEL;
            
            // Va reduciendo 2 píxeles de grosor cada ciertos segmentos hacia la cola
            let reduccion = Math.min(8, Math.floor(i / 2) * 2); 
            let nuevoTamanio = TAMANIO_BLOQUE - reduccion;
            let centrado = reduccion / 2;

            // Dibujar el bloque del cuerpo centrado en su cuadrícula
            ctx.fillRect(xPos + centrado, yPos + centrado, nuevoTamanio, nuevoTamanio);

            // Pequeña cuadrícula divisoria interna entre bloques para que se note la animación
            ctx.strokeStyle = "#b2bfa2"; 
            ctx.lineWidth = 1;
            ctx.strokeRect(xPos + centrado, yPos + centrado, nuevoTamanio, nuevoTamanio);
        }
    }
}