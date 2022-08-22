// Expresiones regulares para validar
const validatorTeacher ={
    validator: {
        nombre: /^[a-zA-ZáéíóúÁÉÍÓÚ\s]{2,}$/,
        cedula: /^(1|0)+[\d]{9}$/
    },
    errors: {
        nombre: "Nombre de usuario no es válido",
        cedula: "Cédula debe contener 10 números y comenzar con 0 o 1",
    }
}

// Expresiones regulares para validar
const validatorUpdateTeacher ={
    validator: {
        name: /^[a-zA-ZáéíóúÁÉÍÓÚ\s]{2,}$/,
        dni: /^(1|0)+[\d]{9}$/
    },
    errors: {
        name: "Nombre de usuario no es válido",
        dni: "Cédula debe contener 10 números y comenzar con 0 o 1",
    }
}


export {
    validatorTeacher,
    validatorUpdateTeacher
}