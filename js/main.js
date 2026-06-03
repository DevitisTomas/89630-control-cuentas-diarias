const categoriaSelect = document.getElementById("categoria");
const filtroCategoria = document.getElementById("filtroCategoria");
const busquedaInput = document.getElementById("busqueda");

const formMovimiento = document.getElementById("formMovimiento");
const listaMovimientos = document.getElementById("listaMovimientos");

const saldo = document.getElementById("saldo");
const ingresos = document.getElementById("ingresos");
const gastos = document.getElementById("gastos");

let movimientos = [];
let grafico = null;

// Formato moneda argentina

function formatearMoneda(valor) {
    return valor.toLocaleString("es-AR");
}

// Cargar categorías desde JSON

fetch("./data/categorias.json")
    .then(response => response.json())
    .then(categorias => {

        categorias.forEach(categoria => {

            const optionFormulario =
                document.createElement("option");

            optionFormulario.value = categoria.nombre;
            optionFormulario.textContent = categoria.nombre;

            categoriaSelect.appendChild(optionFormulario);

            const optionFiltro =
                document.createElement("option");

            optionFiltro.value = categoria.nombre;
            optionFiltro.textContent = categoria.nombre;

            filtroCategoria.appendChild(optionFiltro);

        });

    })
    .catch(error => {

        console.error(
            "Error al cargar categorías:",
            error
        );

    });

// Eventos filtros

filtroCategoria.addEventListener("change", () => {

    mostrarMovimientos();

});

busquedaInput.addEventListener("input", () => {

    mostrarMovimientos();

});

// Evento formulario

formMovimiento.addEventListener("submit", (e) => {

    e.preventDefault();

    const descripcion =
        document.getElementById("descripcion").value;

    const monto = Number(
        document.getElementById("monto").value
    );

    const categoria =
        document.getElementById("categoria").value;

    const tipo =
        document.getElementById("tipo").value;

    const fecha =
        new Date().toLocaleDateString("es-AR");

    const movimiento = {
        descripcion,
        monto,
        categoria,
        tipo,
        fecha
    };

    movimientos.push(movimiento);

    guardarDatos();

    mostrarMovimientos();

    actualizarResumen();

    Swal.fire({
        title: "Movimiento agregado",
        text: `${descripcion} por $${formatearMoneda(monto)}`,
        icon: "success",
        confirmButtonText: "Aceptar"
    });

    formMovimiento.reset();

});

// Mostrar movimientos

function mostrarMovimientos() {

    listaMovimientos.innerHTML = "";

    const categoriaSeleccionada =
        filtroCategoria.value;

    const textoBusqueda =
        busquedaInput.value.toLowerCase();

    let movimientosFiltrados = movimientos;

    // Filtrar categoría

    if (categoriaSeleccionada !== "Todas") {

        movimientosFiltrados =
            movimientosFiltrados.filter(
                movimiento =>
                    movimiento.categoria === categoriaSeleccionada
            );

    }

    // Filtrar texto

    if (textoBusqueda !== "") {

        movimientosFiltrados =
            movimientosFiltrados.filter(
                movimiento =>
                    movimiento.descripcion
                        .toLowerCase()
                        .includes(textoBusqueda)
            );

    }

    movimientosFiltrados.forEach(
        (movimiento) => {

            const div =
                document.createElement("div");

            div.classList.add("movimiento");

            if (movimiento.tipo === "Ingreso") {

                div.classList.add("ingreso");

            } else {

                div.classList.add("gasto");

            }

            div.innerHTML = `
                <p>
                    ${movimiento.fecha}
                    -
                    ${movimiento.tipo}
                    -
                    ${movimiento.descripcion}
                    -
                    ${movimiento.categoria}
                    -
                    $${formatearMoneda(movimiento.monto)}

                    <button onclick="eliminarMovimiento(${movimientos.indexOf(movimiento)})">
                        🗑️
                    </button>
                </p>
            `;

            listaMovimientos.appendChild(div);

        });

}

// Eliminar movimiento

function eliminarMovimiento(index) {

    Swal.fire({
        title: "¿Eliminar movimiento?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {

        if (result.isConfirmed) {

            movimientos.splice(index, 1);

            guardarDatos();

            mostrarMovimientos();

            actualizarResumen();

            Swal.fire({
                title: "Eliminado",
                text: "El movimiento fue eliminado correctamente.",
                icon: "success"
            });

        }

    });

}

// Actualizar resumen

function actualizarResumen() {

    let totalIngresos = 0;
    let totalGastos = 0;

    movimientos.forEach(movimiento => {

        if (movimiento.tipo === "Ingreso") {

            totalIngresos += movimiento.monto;

        } else {

            totalGastos += movimiento.monto;

        }

    });

    const saldoActual =
        totalIngresos - totalGastos;

    saldo.textContent =
        `Saldo: $${formatearMoneda(saldoActual)}`;

    ingresos.textContent =
        `Ingresos: $${formatearMoneda(totalIngresos)}`;

    gastos.textContent =
        `Gastos: $${formatearMoneda(totalGastos)}`;

    actualizarGrafico(
        totalIngresos,
        totalGastos
    );

}

// Gráfico

function actualizarGrafico(
    totalIngresos,
    totalGastos
) {

    const ctx =
        document.getElementById(
            "graficoFinanzas"
        );

    if (grafico) {

        grafico.destroy();

    }

    grafico = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [
                "Ingresos",
                "Gastos"
            ],

            datasets: [

                {

                    data: [
                        totalIngresos,
                        totalGastos
                    ],

                    backgroundColor: [
                        "#198754",
                        "#dc3545"
                    ]

                }

            ]

        }

    });

}

// Guardar datos

function guardarDatos() {

    localStorage.setItem(
        "movimientos",
        JSON.stringify(
            movimientos
        )
    );

}

// Recuperar datos

function cargarDatos() {

    const datosGuardados =
        localStorage.getItem(
            "movimientos"
        );

    if (datosGuardados) {

        movimientos =
            JSON.parse(
                datosGuardados
            );

        mostrarMovimientos();

        actualizarResumen();

    }

}

// Iniciar aplicación

cargarDatos();