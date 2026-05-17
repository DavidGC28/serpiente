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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Comida Neón
    ctx.fillStyle = "#10b981"; 
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#10b981"; 
    ctx.fillRect(comida.x * TAMANIO_BLOQUE + 2, comida.y * TAMANIO_BLOQUE + 2, TAMANIO_BLOQUE - 4, TAMANIO_BLOQUE - 4);

    // Serpiente (Cabeza Neón / Cuerpo Morado NERV)
    for (let i = 0; i < serpiente.length; i++) {
        let xPos = serpiente[i].x * TAMANIO_BLOQUE;
        let yPos = serpiente[i].y * TAMANIO_BLOQUE;

        if (i === 0) {
            ctx.fillStyle = "#10b981"; 
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#10b981";
        } else {
            ctx.fillStyle = "#5c468c"; 
            ctx.shadowBlur = 0; 
        }
        
        ctx.strokeStyle = "#151221"; 
        ctx.fillRect(xPos, yPos, TAMANIO_BLOQUE, TAMANIO_BLOQUE);
        ctx.strokeRect(xPos, yPos, TAMANIO_BLOQUE, TAMANIO_BLOQUE);
    }
}

dibujar();