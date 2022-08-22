import { validateInputsObject, validateValue } from "./formValidator.js"
import { loadUser } from "./loadUser.js"
import { modalOption } from "./modal.js"

loadUser()

let body = document.querySelector('body')
let form = document.querySelector('form')
let tbody = document.querySelector('tbody')

let MAX_QUANTITY = 100
const ROUTE_ABS = "/courses" // Rutas para envio de datos

let {
    modal,
    formModal,
    showModal,
    hideModal
} = modalOption()

// --- Extramos los campos del formulario de creacion -------
const {
    level,
    parallel,
    teacher,
    totalQuotas
} = form

// --- Extramos los campos del formulario de modificacion -------
const {
    level_update,
    parallel_update,
    teacher_update,
    totalQuotas_update
} = formModal

loadQuotes(MAX_QUANTITY)

// ----------Validators--------
const validator = {
    level: false,
    parallel: false,
    teacher: false,
    totalQuotas: false
}

const validatorUpdate = {
    level_update: false,
    parallel_update: false,
    teacher_update: false,
    totalQuotas_update: false
}

// ----------- Objectos que almacene los datos para enviar ----------
const data = {
    level: "",
    parallel: "",
    teacher: "",
    totalQuotas: ""
}

let dataUpdate = {
    id_update: "",
    level_update: "",
    parallel_update: "",
    teacher_update: "",
    totalQuotas_update: ""
}

// ------------- Errores a mostrar -------------------------
const errors = {
    level: "Debes seleccionar el nivel",
    parallel: "Debes seleccionar el paralelo",
    teacher: "Debes seleccionar el docente",
    totalQuotas: "Debes seleccionar el total de cupos"
}

const errorsUpdate = {
    level_update: "Debes seleccionar el nivel",
    parallel_update: "Debes seleccionar el paralelo",
    teacher_update: "Debes seleccionar el docente",
    totalQuotas_update: "Debes seleccionar el total de cupos"
}

// ------- Detectar cuando se seleccionan opciones para enviar -----------
level.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "level",
        values: data,
        selector: ".error-level",
        validator,
        errors
    }
    validateValue(objectValidator)
}

teacher.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "teacher",
        values: data,
        selector: ".error-teacher",
        validator,
        errors
    }
    validateValue(objectValidator)
}

parallel.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "parallel",
        values: data,
        selector: ".error-parallel",
        validator,
        errors
    }
    validateValue(objectValidator)
}

totalQuotas.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "totalQuotas",
        values: data,
        selector: ".error-quotas",
        validator,
        errors
    }
    validateValue(objectValidator)
}

// -------- Detectar la seleccion de opciones para modificar ----------
level_update.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "level_update",
        values: dataUpdate,
        selector: ".error-update-level",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator)
}

teacher_update.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "teacher_update",
        values: dataUpdate,
        selector: ".error-update-teacher",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator)
}

parallel_update.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "parallel_update",
        values: dataUpdate,
        selector: ".error-update-parallel",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator)
}

totalQuotas_update.onchange = (e) => {
    const objectValidator = {
        element: e.target,
        field: "totalQuotas_update",
        values: dataUpdate,
        selector: ".error-update-quotas",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator)
}

// --- Funcion que rellena los cupos de ambos formularios -----
function loadQuotes(max) {
    totalQuotas.innerHTML = `
        <option value="">Seleccione los cupos totales</option>
    `
    totalQuotas_update.innerHTML = `
        <option value="">Seleccione los cupos totales</option>
    `
    for (let i = 1; i <= max; i++) {
        let option = `
            <option value="${i}">${i}</option>
        `
        totalQuotas.innerHTML += option
        totalQuotas_update.innerHTML += option
    }
}

body.addEventListener('click', (e) => {
    let btnEditar = e.target.dataset.update
    let btnBorrar = e.target.dataset.delete
    
    if(btnEditar) {

        // Extraemos los datos de este usuario para poder precargarlos
        let row = e.target.parentNode.parentNode
        let id = row.dataset.id
        
        let tds = row.querySelectorAll("td")
        let level = tds[0].innerHTML
        let parallel = tds[1].innerHTML
        let teacher = tds[2].dataset.id
        let quotas = tds[3].innerHTML
        let limit = quotas - tds[4].innerHTML
    
        dataUpdate = {
            id_update: id,
            level_update: level,
            parallel_update: parallel,
            teacher_update: teacher,
            totalQuotas_update: quotas,
            actual_quota: limit
        }

        // mostramos el formulario para modificar
        showModal(dataUpdate)
    }

    if(btnBorrar) {
        let id = btnBorrar
        deleteCourse(id)
    }
})

// ---- funcion para actualizar el curso ------------
function updateCourse() {
    const COURSE_UPDATE_ROUTE = "/courses-update"

    let limit =  parseInt(dataUpdate.totalQuotas_update)
    if(limit < dataUpdate.actual_quota) {
        Swal.fire(
            "Atención",
            "El cupo definido debe ser mayor o igual al número de estudiantes registrados",
            "warning"
        )
        return 
    }

    if (validateInputsObject(dataUpdate)) {
        // Verificamos que no se asigne una cuota inferior 
        // al numero d estudiantes ingresados

        $.post(COURSE_UPDATE_ROUTE, dataUpdate, (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Aula se ha modificado correctamente",
                    "success"
                )
                .then(ok => {
                    loadCourses()
                    formModal.reset()
                    hideModal()
                })
            } else {
                Swal.fire(
                    "Atención",
                    response.error,
                    "warning"
                )
            }
        })

    } else {
        Swal.fire(
            "Atención",
            "Debe seleccionar todos los campos",
            "warning"
        )
    }
}

// ---- funcion para crear el curso ------------
function createCourse() {
    const COURSE_ROUTE = "/courses"

    if (validateInputsObject(data)) {
        // Verificamos que no se asigne una cuota inferior 
        // al numero d estudiantes ingresados

        $.post(COURSE_ROUTE, data, (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Aula se ha modificado correctamente",
                    "success"
                )
                .then(ok => {
                    loadCourses()
                    form.reset()
                })
            } else {
                Swal.fire(
                    "Atención",
                    response.error,
                    "warning"
                )
            }
        })

    } else {
        Swal.fire(
            "Atención",
            "Debe seleccionar todos los campos",
            "warning"
        )
    }
}

// --------------FORMULARIO DE CREACIÓN --------------------
form.addEventListener('submit', (e) => {
    e.preventDefault()
    createCourse()
})

// ----------------- FORMULARIO DE MODIFICACIÓN ---------------
formModal.addEventListener('submit', (e) => {
    e.preventDefault()
    updateCourse()
})

// --------------- FUNCIÓN PARA CARGAR LOS CURSOS YA INGRESADOS -----------
function loadCourses() {
    tbody.innerHTML = ""
    $.get(ROUTE_ABS, (response) => {
        response.forEach((data, index) => {
            let loadedStudents = data.aula.length
            let available = data.cupos - loadedStudents
            let fila = `
            <tr data-id="${data._id.$oid}">
                <th scope="row" class="text-center">${index + 1}</th>
                <td class="text-center">${data.nivel}</td>
                <td class="text-center">${data.paralelo}</td>
                <td class="text-center" data-id= ${data.docente[0]._id.$oid}>
                    ${data.docente[0].nombre}
                </td>
                <td class="text-center">${data.cupos}</td>
                <td class="text-center">${available}</td>
                <td>
                    <button type= "button" class="btn btn-success"data-update="${data._id.$oid}">Editar</button>
                    <button type= "button" class="btn btn-danger" data-delete="${data._id.$oid}">Borrar</button>
                </td>
            </tr>`
            tbody.innerHTML += fila
        }); 
    })
}

// --------------------FUNCION PARA ELIMINAR UN CURSO ---------------
function deleteCourse(id) {
    Swal.fire(
        "Atención",
        "¿Está seguro de querer borrar esta aula?",
        "warning"
    ).then(ok => {
        $.post("/borrar-aula", {id}, (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    response.message,
                    "success"
                    ).then(ok => {
                        loadCourses()
                }) 
            } else {
                Swal.fire(
                    "Error",
                    response.error,
                    "error"
                )
            }
        })
    })
}

//  ---------------- FUNCIÓN QUE CARGA LOS DOCENTES ----------------
function loadTeachers() {
    let selectDocente = document.querySelector("#teacher")
    teacher_update.innerHTML =  `<option value="">Seleccione un docente</option>`
    selectDocente.innerHTML = `<option value="">Seleccione un docente</option>`

    $.get("/teachers", (response) => {
        response.forEach(docente => {
            let option = `
                <option value="${docente._id.$oid}">${docente.nombre}</option>
            `
        selectDocente.innerHTML += option
        teacher_update.innerHTML += option
        
        })
    })
}
// --- Cargamos los cursos y los docentes -------
loadTeachers()
loadCourses()
