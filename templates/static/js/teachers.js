import { imageDefault } from "./imageBase64Default.js"
import { loadUser } from "./loadUser.js"
import { modalOption } from "./modal.js"
import { 
    validateInputsObject, 
    validateValue, 
    resetValues 
} from "./formValidator.js"
import { validatorTeacher, validatorUpdateTeacher } from "./validators.js"

// Obtenemos la opciones de la ventana de modificar
const {
    modal, 
    hideModal, 
    showModal,
    formModal
} = modalOption()

formModal.addEventListener("submit", (e) => {
    const UPDATE_TEACHER_ROUTE = "/teachers-update"
    const data = {
        id: formModal["id"].value,
        name: formModal["name"].value,
        dni: formModal["dni"].value
    }

    e.preventDefault()
    $.post(UPDATE_TEACHER_ROUTE, data , (response) => {
        if(response.result) {
            Swal.fire(
                "Listo",
                "Docente se ha modificado correctamente",
                "success"
            )
            .then(ok => {
                loadTeachers()
                formModal.reset()  // Reseteamos formulario 
                hideModal()
            })

        } else {
            Swal.fire(
                "Atención",
                "Ya existe un docente con ese número de cédula",
                "warning"
            )
        }

    })
})


// Ruta hacia donde dirigir las peticiones post y get
const TEACHERS_ROUTE = "/teachers"

// Carga lso datos del suario loggeado
loadUser()

let body = document.querySelector('body')
let form = document.querySelector('form')
let tbody = document.querySelector('tbody')



const {
    cedula, 
    nombre
} = form


// Objeto que guarda los datos del formulario
const dataCreate = {
    nombre: "",
    cedula: "",
    path: imageDefault
}

// Objeto que guarda los datos de actualizacion
const dataUpdate = {
    name: "",
    dni: ""
}

let validatorCreate = validatorTeacher.validator
let errorsCreate = validatorTeacher.errors

let validatorUpdate = validatorUpdateTeacher.validator
let errorsUpdate = validatorUpdateTeacher.errors

// Añadimos evento input para detectar lo que escribimos
nombre.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "nombre",
        values: dataCreate,
        selector: ".error-nombre",
        validator:validatorCreate,
        errors:errorsCreate
    }
    validateValue(objectValidator) 
}

cedula.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "cedula",
        values: dataCreate,
        selector: ".error-cedula",
        validator:validatorCreate,
        errors:errorsCreate
    }
    validateValue(objectValidator) 
}
 
formModal["name"].oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "name",
        values: dataUpdate,
        selector: ".error-name",
        validator:validatorUpdate,
        errors: errorsUpdate
    }
    validateValue(objectValidator) 
}
// Añadimos evento input para detectar lo que escribimos
formModal["dni"].oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "dni",
        values: dataUpdate,
        selector: ".error-dni",
        validator:validatorUpdate,
        errors: errorsUpdate
    }
    validateValue(objectValidator) 
}

body.addEventListener('click', (e) => {
    let element = e.target
    let btnEditar = e.target.dataset.update
    let btnBorrar = e.target.dataset.delete

    if(btnEditar) {
        let row = element.parentNode.parentNode
        let tds = row.querySelectorAll("td")
        let dni = tds[0].innerHTML
        let name = tds[1].innerHTML
        let data = {
            id: row.dataset.id,
            name, dni
        }
  
        showModal(data)
    }

    if(btnBorrar) {
        let id = btnBorrar
        deleteTeacher(id)
    }
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    if(validateInputsObject(dataCreate)) {
        $.post(TEACHERS_ROUTE, dataCreate , ({result}) => {
            if(result) {
                Swal.fire(
                    "Listo",
                    "Docente se ha guardado correctamente",
                    "success"
                )
                .then(ok => {
                    loadTeachers()
                    form.reset()  // Reseteamos formulario 
                    resetValues(dataCreate) // Reseteamos los valores
                })

            } else {
                Swal.fire(
                    "Atención",
                    "Ya existe un docente con ese número de cédula",
                    "warning"
                )
            }

        })

    } else {
        Swal.fire(
            "Atención",
            "Debe rellenar todos los campos",
            "warning"
        )
    }
})

function loadTeachers() {
    tbody.innerHTML = ""
    $.get(TEACHERS_ROUTE, (response) => {
        response.forEach((data, index) => {
            let fila = `
            <tr data-id="${data._id.$oid}">
                <th scope="row" class="text-center">${index + 1}</th>
                <td>${data.cedula}</td>
                <td>${data.nombre}</td>
                <td>${data.username}</td>
                <td>
                    <button type= "button" class="btn btn-success"data-update="${data._id.$oid}">Editar</button>
                    <button type= "button" class="btn btn-danger" data-delete="${data._id.$oid}">Borrar</button>
                </td>
            </tr>`
            tbody.innerHTML += fila
        })
    })
}

function deleteTeacher(id) {
    Swal.fire(
        "Atención",
        "¿Está seguro de querer borrar este docente?",
        "warning"
    ).then(ok => {
        $.post("/borrar-usuarios", {id}, ({result}) => {
                if(result) {
                Swal.fire(
                    "Listo",
                    "Docente ha sido borrado correctamente",
                    "success"
                ).then(ok => {
                    loadTeachers()
                })
            } else {
                Swal.fire(
                    "Error",
                    "No es posible eliminar este docente, Docente tiene una aula asignada",
                    "error"
                )
            } 

        })
    })
}

loadTeachers()