import { 
    validateInputsObject, 
    validateValue, 
    resetValues 
} from "./formValidator.js"

const form = document.querySelector("form")
const validator = {
    username: /^(@)+([a-zA-Z\d\_\$\.\#)]{7,})$/,
    password:/^([a-zA-Z\d@_]{8,})$/
}

const errors = {
    username: "Nombre de usuario no es valido",
    password: "Contraseña invalida o contiene caracteres no permitidos"
}

const data = {
    username: "",
    password: ""
}

let {
    username, 
    password
} = form

username.oninput = function(e){
    const objectValidator = {
        element: e.target,
        field: "username",
        values: data,
        selector: ".error-username",
        validator,
        errors
    }

    validateValue(objectValidator)
}

password.oninput = function(e){
    const objectValidator = {
        element: e.target,
        field: "password",
        values: data,
        selector: ".error-password",
        validator,
        errors
    }

    validateValue(objectValidator)
}


// Verifcar si existe la sesion
// Si la session existe redirecciona a la ventana de las notas
let storage = localStorage.getItem("session-admin")
if(storage !== null) {
    window.location = "/c-panel"
}

// Validamos los datos de acceso
$("form").on("submit", (e) => {
    e.preventDefault()
    if(validateInputsObject(data)) {
        $.post("/sesion-admin", $("form").serialize(), function(response) {
            if(!response.access) {
                Swal.fire(
                    'Atención!',
                    response.error,
                    'warning'
                )
            } else {
                let data = JSON.stringify(response.body)
                localStorage.setItem("session-admin", data)
                window.location = "/c-panel"
                form.reset()
                resetValues(data)
            }
        })
    } else {
        Swal.fire(
            'Atención!',
            'Rellene todos los campos',
            'warning'
        )
    }
})