import { encodeImageFileAsURL } from "./encodedImage.js"
import { validateInputsObject, validateValue } from "./formValidator.js"
import { loadUser } from "./loadUser.js"
import { modalOption } from "./modal.js"


// Cargamos el usuario loggeado
loadUser()

let body = document.querySelector('body')
let form = document.querySelector('form')
let tbody = document.querySelector('tbody')
let selectedCourse = document.querySelector('#course')
// Ruta hacia donde dirigir las peticiones post y get
const STUDENTS_ROUTE = "/students"
const COURSES_ROUTE = "/courses"
const ROUTE_STUDENT_DELETE = "/students-delete"
let imageUpdated = ""

const {
    modal,
    hideModal,
    showModal,
    formModal
} = modalOption()

let {
    id_update,
    name_update,
    image_update,
    dni_update,
    course_update
} = formModal

const {
    dni, 
    name,
    course,
    image
} = form


// Expresiones regulares para validar
const validator = {
    dni: /^(1|0)+[\d]{9}$/,
    name: /^[a-zA-ZáéíóúÁÉÍÓÚ\s]{2,}$/,
    course: false,
    image: false
}

// Expresiones regulares para validar
const validatorUpdate = {
    dni_update: /^(1|0)+[\d]{9}$/,
    name_update: /^[a-zA-ZáéíóúÁÉÍÓÚ\s]{2,}$/,
    course_update: false,
    image_update: false
}

// Objeto que guarda los datos del formulario
const data = {
    dni: "",
    name: "",
    course: "",
    image: ""
}

const dataUpdate = {
    id_update: "",
    dni_update: "",
    name_update: "",
    course_update: ""
}

// Listados de error para los campos no permitidos
const errors = {
    dni: "Cédula debe contener 10 números y comenzar con 0 o 1",
    name: "Nombre de usuario no es válido",
    course: "Debes seleccionar el curso",
    image: "Debes seleccionar una imagen"
}

const errorsUpdate = {
    dni_update: "Cédula debe contener 10 números y comenzar con 0 o 1",
    name_update: "Nombre de usuario no es válido",
    course_update: "Debes seleccionar el curso",
    image_update: "Debes seleccionar una imegen"
}

// Añadimos evento input para detectar lo que escribimos
dni.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "dni",
        values: data,
        selector: ".error-dni",
        validator,
        errors
    }
    validateValue(objectValidator) 
}
name.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "name",
        values: data,
        selector: ".error-name",
        validator,
        errors
    }
    validateValue(objectValidator) 
}

course.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "course",
        values: data,
        selector: ".error-course",
        validator,
        errors
    }
    validateValue(objectValidator) 
}

dni_update.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "dni_update",
        values: dataUpdate,
        selector: ".error-update-dni",
        validator: validatorUpdate,
        errors: errorsUpdate
    }
    validateValue(objectValidator) 
}
name_update.oninput = function(e) {
    const objectValidator = {
        element: e.target,
        field: "name_update",
        values: dataUpdate,
        selector: ".error-update-name",
        validator: validatorUpdate,
        errors: errorsUpdate
    }
    validateValue(objectValidator) 
}

course_update.onchange = function(e) {
    const objectValidator = {
        element: e.target,
        field: "course_update",
        values: dataUpdate,
        selector: ".error-update-course",
        validator: validatorUpdate,
        errors: errorsUpdate
    }
    validateValue(objectValidator) 
}


body.addEventListener('click', (e) => {
    let element = e.target
    let btnEditar = element.dataset.update
    let btnBorrar = element.dataset.delete

    if(btnEditar) {
        let row = element.parentNode.parentNode
        let tds = row.querySelectorAll("td")
        let dni = tds[0].innerHTML
        let name = tds[2].innerHTML
        let course = tds[4].dataset.id

        dataUpdate.id_update = row.dataset.id
        dataUpdate.name_update = name
        dataUpdate.dni_update = dni
        dataUpdate.course_update = course

        let data = {
            dni_update: dni,
            name_update: name,
            course_update: course,
        }

        showModal(data)
    }

    if(btnBorrar) {
        let id = btnBorrar
        deleteStudent(id)
    }
})

let imgError = document.querySelector(".error-image")
let imgErrorUpdate = document.querySelector(".error-update-image")

image.addEventListener('change', async(e)=> {
    if(!e.target.files[0]) {
        data.image = ""
        return
    }

    let file = e.target.files[0].name.split(".")
    let extens = ["png", "jpg"]
    let esValid = extens.includes(file[file.length - 1])
    if(!esValid) {
        Swal.fire(
            "Atención",
            "Solo se permiten archivos .jpg y png",
            "warning"
        ). then(ok => {
            e.target.value = ""
            data.image = ""
            imgError.innerHTML = errors["image"]
            imgError.classList.remove("hidden")
        })
    } else {
        let encodedImage = await encodeImageFileAsURL(e.target)
        data.image = encodedImage

        imgError.innerHTML = ""
        imgError.classList.add("hidden")
    }
})
imageUpdated = ""
image_update.addEventListener('change', async(e)=> {
    if(!e.target.files[0]) { 
        imageUpdated = ""
        return 
    }

    let file = e.target.files[0].name.split(".")
    let extens = ["png", "jpg"]
    let esValid = extens.includes(file[file.length - 1])
    if(!esValid) {
        Swal.fire(
            "Atención",
            "Solo se permiten archivos .jpg y png",
            "warning"
        ). then(ok => {
            e.target.value = ""
            imgErrorUpdate.innerHTML = errors["image"]
            imgErrorUpdate.classList.remove("hidden")
        })
    } else {
        let encodedImage = await encodeImageFileAsURL(e.target)
        imageUpdated = encodedImage
        imgErrorUpdate.innerHTML = ""
        imgErrorUpdate.classList.add("hidden")
    }
})


form.addEventListener('submit', (e) => {
    e.preventDefault()
    if(validateInputsObject(data)) {
        let formData = new FormData()
        formData.append("dni", data.dni)
        formData.append("name", data.name)
        formData.append("image", data.image)
        formData.append("course", data.course)

        fetch(STUDENTS_ROUTE, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            if(res.result) {
                Swal.fire(
                    "Listo",
                    "Estudiante guardado correctamente",
                    "success"
                ).then(ok => {
                    form.reset()
                    loadCourses()
                    loadStudents()
                })
            } else {
                    Swal.fire(
                    "Atención",
                    res.error,
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

formModal.addEventListener("submit", async(e) => {
    e.preventDefault()
    if(validateInputsObject(dataUpdate)) {
        const STUDENTS_UPDATE = "/students-update"
        let formData = new FormData()
        console
        formData.append("id", dataUpdate.id_update)
        formData.append("dni", dataUpdate.dni_update)
        formData.append("name", dataUpdate.name_update)
        formData.append("image", imageUpdated)
        formData.append("course", dataUpdate.course_update)

        fetch(STUDENTS_UPDATE, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            if(res.result) {
                Swal.fire(
                    "Listo",
                    "Estudiante editado correctamente",
                    "success"
                ).then(ok => {
                    form.reset()
                    loadCourses()
                    loadStudents()
                    hideModal()
                })
            } else {
                    Swal.fire(
                    "Atención",
                    res.error,
                    "warning"
                )
            }
        })
    } else {
        Swal.fire(
            "Atención",
            "Debes rellenar los campos obligatorios a excepción de la foto.",
            "warning"
        )
    }
    
})

function loadCourses() {
    let courseUpdate = modal.querySelector("select")
    courseUpdate.innerHTML = `
        <option value = "">Selecciona el aula</option>
    `
    selectedCourse.innerHTML = `
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
            courseUpdate.innerHTML += option
        }); 
    })
}

function loadStudents() {
    tbody.innerHTML = ""
    $.get(STUDENTS_ROUTE, (response) => {

        response.forEach((data, index) => {
            let course = data.aula[0]
            let courseId = course._id.$oid
            let levelCourse = course.nivel + " - " + course.paralelo

            let fila = `
            <tr data-id="${data._id.$oid}">
                <th scope="row" class="text-center">${index + 1}</th>
                <td>${data.cedula}</td>
                <td>
                    <img src="${data.path}" alt="img"/>
                </td>
                <td>${data.nombre}</td>
                <td>${data.username}</td>
                <td data-id=${courseId}>${levelCourse}</td>
                <td>
                    <button type= "button" class="btn btn-success"data-update="${data._id.$oid}">Editar</button>
                    <button type= "button" class="btn btn-danger" data-delete="${data._id.$oid}">Borrar</button>
                </td>
            </tr>`
            tbody.innerHTML += fila
        }); 
    })
}


function deleteStudent(id) {
    Swal.fire(
        "Atención",
        "¿Está seguro de querer borrar este estudiante?",
        "warning"
    ).then(ok => {
        $.post(ROUTE_STUDENT_DELETE, {id}, (response) => {
            if(response.result) {
                Swal.fire(
                    "Listo",
                    "Estudiante ha sido borrada correctamente",
                    "success"
                ).then(ok => {
                    loadCourses()
                    loadStudents()                        
                })
            }else {
                Swal.fire(
                    "Error",
                    response.error,
                    "error"
                )
            }
        })
    })
}

loadCourses()
loadStudents()
