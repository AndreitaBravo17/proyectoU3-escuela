// Validamos los valores que se ingresan en los inputs
function validateValue(obj) {
    let {
        element,
        field,
        values,
        selector,
        validator,
        errors
    } = obj

    let msgError = document.querySelector(selector)
    if(typeof validator[field] === "boolean") {
        if(element.value === "") {
            values[field] = ""
            msgError.classList.remove("hidden")
            msgError.innerHTML = errors[field]
        } else {
            values[field] = element.value
            msgError.classList.add("hidden")
            msgError.innerHTML = "" 
        }

        return
    }

    let isValid = validator[field].test(element.value)
    if (isValid) {
        values[field] = element.value
        msgError.classList.add("hidden")
        msgError.innerHTML = ""
    } else {
        values[field] = ""
        msgError.classList.remove("hidden")
        msgError.innerHTML = errors[field]
    }

}

// Validar que todos esté lleno correctamente
function validateInputsObject(data){
    let keys = Object.keys(data)
    let counter = 0
    let totalKeys = keys.length
    keys.forEach(key => {
        let type = typeof data[key]
        if(type === 'string' || type === "number") {
            if (data[key] !== ""){
                counter++   
            }
        }
       
        if(type === 'boolean') {
            if (data[key] !== false){
                counter++   
            }
        }
    })

    let isValidated = counter === totalKeys
    return isValidated
}

function resetValues(values) {
    let keys = Object.keys(values)
    keys.forEach(key => {
        values[key] = ""
    })
}

export {
    validateValue,
    validateInputsObject,
    resetValues
}