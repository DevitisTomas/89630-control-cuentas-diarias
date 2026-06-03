const categoriaSelect = document.getElementById("categoria");
const filtroCategoria = document.getElementById("filtroCategoria");
const busquedaInput = document.getElementById("busqueda");

const formMovimiento = document.getElementById("formMovimiento");
const listaMovimientos = document.getElementById("listaMovimientos");

const tituloMovimientos =
    document.getElementById("tituloMovimientos");

const saldo = document.getElementById("saldo");
const ingresos = document.getElementById("ingresos");
const gastos = document.getElementById("gastos");

const estadisticas =
    document.getElementById("estadisticas");

let movimientos = [];
let grafico = null;

// Formato moneda argentina

function formatearMoneda(valor) {
    return valor.toLocaleString("es-AR");
}

// Cargar categorías

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

    });

// Filtros

filtroCategoria.addEventListener("change", () => {

    mostrarMovimientos();

});

busquedaInput.addEventListener("input", () => {

    mostrarMovimientos();

});

// Formulario

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
        icon: "success"
    });

    formMovimiento.reset();

});

// Mostrar movimientos

function mostrarMovimientos() {

    listaMovimientos.innerHTML = "";

    tituloMovimientos.textContent =
        `Movimientos (${movimientos.length})`;

    const categoriaSeleccionada =
        filtroCategoria.value;

    const textoBusqueda =
        busquedaInput.value.toLowerCase();

    let movimientosFiltrados = [...movimientos];

    if (categoriaSeleccionada !== "Todas") {

        movimientosFiltrados =
            movimientosFiltrados.filter(
                movimiento =>
                    movimiento.categoria === categoriaSeleccionada
            );

    }

    if (textoBusqueda !== "") {

        movimientosFiltrados =
            movimientosFiltrados.filter(
                movimiento =>
                    movimiento.descripcion
                        .toLowerCase()
                        .includes(textoBusqueda)
            );

    }

    movimientosFiltrados
        .slice()
        .reverse()
        .forEach(movimiento => {

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

// Eliminar

function eliminarMovimiento(index) {

    Swal.fire({
        title: "¿Eliminar movimiento?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar"
    }).then((result) => {

        if (result.isConfirmed) {

            movimientos.splice(index, 1);

            guardarDatos();

            mostrarMovimientos();

            actualizarResumen();

        }

    });

}

// Estadísticas

function mostrarEstadisticas() {

    estadisticas.innerHTML = "";

    const resumenCategorias = {};

    movimientos.forEach(movimiento => {

        if (!resumenCategorias[movimiento.categoria]) {

            resumenCategorias[movimiento.categoria] = 0;

        }

        resumenCategorias[movimiento.categoria] +=
            movimiento.monto;

    });

    for (const categoria in resumenCategorias) {

        const p =
            document.createElement("p");

        p.textContent =
            `${categoria}: $${formatearMoneda(resumenCategorias[categoria])}`;

        estadisticas.appendChild(p);

    }

}

// Resumen

function actualizarResumen() {

    let totalIngresos = 0;
    let totalGastos = 0;

    let cantidadIngresos = 0;
    let cantidadGastos = 0;

    movimientos.forEach(movimiento => {

        if (movimiento.tipo === "Ingreso") {

            totalIngresos += movimiento.monto;
            cantidadIngresos++;

        } else {

            totalGastos += movimiento.monto;
            cantidadGastos++;

        }

    });

    saldo.textContent =
        `Saldo: $${formatearMoneda(totalIngresos - totalGastos)}`;

    ingresos.textContent =
        `Ingresos: $${formatearMoneda(totalIngresos)} (${cantidadIngresos})`;

    gastos.textContent =
        `Gastos: $${formatearMoneda(totalGastos)} (${cantidadGastos})`;

    actualizarGrafico(
        totalIngresos,
        totalGastos
    );

    mostrarEstadisticas();

}

// Gráfico

function actualizarGrafico(
    totalIngresos,
    totalGastos
) {

    const ctx =
        document.getElementById("graficoFinanzas");

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

            datasets: [{
                data: [
                    totalIngresos,
                    totalGastos
                ],
                backgroundColor: [
                    "#198754",
                    "#dc3545"
                ]
            }]

        }

    });

}

// LocalStorage

function guardarDatos() {

    localStorage.setItem(
        "movimientos",
        JSON.stringify(movimientos)
    );

}

function cargarDatos() {

    const datos =
        localStorage.getItem("movimientos");

    if (datos) {

        movimientos =
            JSON.parse(datos);

        mostrarMovimientos();

        actualizarResumen();

    }

}

cargarDatos();