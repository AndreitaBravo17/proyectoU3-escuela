function modalOption() {
    const modal = document.querySelector('.update-modal')
    const formModal = modal.querySelector('form')
    const closeBtn = document.querySelector('.exit-icon')
    const inputs = formModal.querySelectorAll("input")

    closeBtn.onclick = (e) => {
        hideModal()
    }

    function cleanFields(){
        inputs.forEach(input => {
            if(input.name !== "") {
                formModal[input.name].value = ""
            }
        })
    }

    function showModal(data) {
        modal.classList.remove("hidden")
        let keys = Object.keys(data)
        keys.forEach(key => {
            formModal[key].value = data[key]
        })
    }

    function hideModal() {
        modal.classList.add("hidden")
        cleanFields()
    }

    return {
        modal, showModal, hideModal, formModal
    }

}

export { modalOption }

