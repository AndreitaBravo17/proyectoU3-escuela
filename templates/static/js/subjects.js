import { loadUser } from "../js/loadUser.js"
import { validateInputsObject, validateValue } from "./formValidator.js"
import { modalOption } from "./modal.js"

let selectedCourse = document.querySelector("#aula")
const COURSES_ROUTE = "/courses"
let body = document.querySelector('body')
let tbody = document.querySelector('tbody')

let { formModal, showModal, hideModal } = modalOption()

// Cargamos los datos del usuario loggeado
loadUser()

function loadCourses() {
    selectedCourse.innerHTML = `
        <option value = "">Selecciona el aula</option>
    `
    aula_update.innerHTML = `
        <option value = "">Selecciona el aula</option>
    `
    $.get(COURSES_ROUTE, (response) => {
        response.forEach((data, index) => {
            let option = `
            <option value="${data._id.$oid}">
                ${data.nivel + " - " + data.paralelo}
            </option>
            `
            selectedCourse.innerHTML += option
            aula_update.innerHTML += option
        }); 
    })
}

// Cargamos  en el select las aulas ingresadas
let form = document.querySelector("form")
let {materia, aula, horario} = form
let {materia_update, aula_update, horario_update} = formModal

loadCourses()
const validator = {
    materia: /^[a-zA-ZáéíóúÁÉÍÓÚ\s\d]{2,}$/,
    aula: false,
    horario: false
}

const data = {
    materia: "",
    aula: "",
    horario: ""
}

const errors = {
    materia: "Nombre de materia no es válido",
    aula: "Debes seleccionar una aula",
    horario: "Debes seleccionar un horario"
}

const validatorUpdate = {
    materia_update: validator.materia,
    aula_update: validator.aula,
    horario_update: validator.horario
}

let dataUpdate = {
    id: "",
    materia_update: "",
    aula_update: "",
    horario_update: ""
}

const errorsUpdate = {
    materia_update: errors.materia,
    aula_update: errors.aula,
    horario_update: errors.horario
}

materia.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "materia",
        values: data,
        selector: ".error-materia",
        validator,
        errors
    }
    validateValue(objectValidator) 
}

aula.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "aula",
        values: data,
        selector: ".error-aula",
        validator,
        errors
    }
    validateValue(objectValidator) 
}

horario.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "horario",
        values: data,
        selector: ".error-horario",
        validator,
        errors
    }
    validateValue(objectValidator) 
}

materia_update.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "materia_update",
        values: dataUpdate,
        selector: ".error-update-materia",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator) 
}

aula_update.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "aula_update",
        values: dataUpdate,
        selector: ".error-update-aula",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator) 
}

horario_update.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "horario_update",
        values: dataUpdate,
        selector: ".error-update-horario",
        validator:validatorUpdate,
        errors:errorsUpdate
    }
    validateValue(objectValidator) 
}

const SUBJEC_ROUTE = "/subjects"
const SUBJEC_ROUTE_UPDATE = "/subjects-update"

form.addEventListener("submit", (e) => {
    e.preventDefault()
    if(validateInputsObject(data)) {
        $.post(SUBJEC_ROUTE, data , (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Materia ha sido guardada correctamente",
                    "success"
                )
                .then(ok => {
                    form.reset() // Reseteamos formulario 
                    loadSubjects()
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
            "Debes rellenar y seleccionar todos los campos",
            "warning"
        )
    }

})

formModal.addEventListener("submit", (e) => {
    e.preventDefault()

    if(validateInputsObject(dataUpdate)) {
        $.post(SUBJEC_ROUTE_UPDATE, dataUpdate , (response) => {
            console.log(response)
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Materia ha sido guardada correctamente",
                    "success"
                )
                .then(ok => {
                    form.reset() // Reseteamos formulario 
                    loadSubjects()
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
            "Debes rellenar y seleccionar todos los campos",
            "warning"
        )
    }

})

function loadSubjects() {
    tbody.innerHTML = ""
    $.get(SUBJEC_ROUTE, (response) => {
        response.forEach((data, index) => {
            let {nivel, paralelo, _id} = data.aula[0]
            let fila = `
            <tr data-id="${data._id.$oid}">
                <th scope="row" class="text-center">${index + 1}</th>
                <td>${data.materia}</td>
                <td data-id= ${_id.$oid}>${nivel+" - "+paralelo}</td>
                <td>${data.horario}</td>
                <td>
                    <button type= "button" class="btn btn-success"data-update="${data._id.$oid}">Editar</button>
                    <button type= "button" class="btn btn-danger" data-delete="${data._id.$oid}">Borrar</button>
                </td>
            </tr>`
            tbody.innerHTML += fila
        })
    })
}

function deleteSubject(id) {
    Swal.fire(
        "Atención",
        "¿Está seguro de querer borrar esta materia?",
        "warning"
    ).then(ok => {
        $.post("/subjects-delete", {id}, (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Materia ha sido borrada correctamente",
                    "success"
                ).then(ok => {
                    loadSubjects()
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

loadSubjects()


body.addEventListener('click', (e) => {
    let element = e.target
    let btnEditar = e.target.dataset.update
    let btnBorrar = e.target.dataset.delete

    if(btnEditar) {
        let row = element.parentNode.parentNode
        let tds = row.querySelectorAll("td")
        let materia = tds[0].innerHTML
        let aula = tds[1].dataset.id
        let horario = tds[2].innerHTML
        let data = {
            id: row.dataset.id,
            materia_update: materia,
            aula_update: aula,
            horario_update: horario
        }

        dataUpdate = {...data}  
        showModal(data)
    }

    if(btnBorrar) {
        let id = btnBorrar
        deleteSubject(id)
    }
})



