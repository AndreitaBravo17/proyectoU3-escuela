function loadUser() {
    let userImg = document.querySelector('#user-img')
    let userLogged = document.querySelector('#user-logged')
    let admin = JSON.parse(localStorage.getItem('session-admin'))
    userImg.src = admin.path
    userLogged.innerHTML = admin.nombre

    let footer = document.querySelector(".currentPeriod")
    let date = new Date()
    let currentYear = date.getFullYear()
    let nextYear = currentYear + 1
    footer.innerHTML = `
        <b>Periodo: </b>
        <span>${currentYear} - ${nextYear}</span>
    `
}

export {loadUser}