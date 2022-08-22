function encodeImageFileAsURL(element) {

    let file = element.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise((resolve, reject) =>{
        reader.onloadend = function() {
          return resolve(reader.result)
        }
    })
}


export { encodeImageFileAsURL }