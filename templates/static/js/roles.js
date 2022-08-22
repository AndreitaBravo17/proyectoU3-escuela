import { loadUser } from "./loadUser.js";

const tbody = document.querySelector("tbody")
const body = document.querySelector("body")
const TEACHERS_ROUTE = "/teachers"
const CHANGE_ROL_ROUTES = "/set-admin"

// Cargamos los datos del usuario loggeado
loadUser()

body.addEventListener("click", (e) => {
    let element = e.target
    let isCheck = element.dataset.rol
    if(isCheck) {
        if(element.checked === true) {
            $.post(CHANGE_ROL_ROUTES,{id: isCheck, admin: true}, (response) => {
                if(response.result) {
                    Swal.fire(
                    "Listo",
                    response.message,
                    "success"
                    )
                }
            })
        } else {
            $.post(CHANGE_ROL_ROUTES,{id: isCheck, admin: false}, (response) => {
                if(!response.result) {
                    Swal.fire(
                    "Listo",
                    response.message,
                    "success"
                    )
                }
            })
        }
    }
})


function loadTeachersAdmin() {
    const TEACHER_ADMINS = "/get-teachers-admin"
    $.get(TEACHER_ADMINS, (response) => {
        let _idAdmin = response._idAdmin["$oid"]
        tbody.innerHTML = ""
        response.result.forEach((data, index) => {
            let isAdmin = false
            data.roles_permisos.forEach(key=>{
                if(key["$oid"] === _idAdmin) isAdmin = true
            })

            let row = document.createElement("tr")
            row.setAttribute('id', data._id.$oid)

            let number = document.createElement("td")
            let dni = document.createElement("td")
            let name = document.createElement("td")
            let check = document.createElement("td")

            number.innerHTML = index + 1     
            dni.innerHTML = data.cedula
            name.innerHTML = data.nombre
            
            number.classList.add("text-center")
            dni.classList.add("text-center")
            name.classList.add("text-center")


            let input = document.createElement('input')
            input.setAttribute("type", "checkbox")
            input.setAttribute("data-rol", data._id.$oid)
            input.checked = isAdmin

            check.appendChild(input)
            check.classList.add("text-center")
            
            row.appendChild(number)
            row.appendChild(dni)
            row.appendChild(name)
            row.appendChild(check)

            tbody.appendChild(row)
        })
    })
}

loadTeachersAdmin()