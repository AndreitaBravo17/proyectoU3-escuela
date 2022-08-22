from flask import request, jsonify, render_template, Response
import json
from bson import json_util
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash
def login():
    return render_template('layouts/docente.html')

def process(mongo):
    if request.method == "POST":
        # Obtenemos los datos enviamos y los almacenamos
        username = request.form["username"]
        password = request.form["password"]
        # Creamos el objeto con los datos que buscaremos
        data = {"Cedula": username, "Contraseña": password}
        # Ejecutamos la consulta
        res = mongo.db.docentes.find_one(data)
        # Verfiicamos si la consulta obtuvo resultados
        if res:
            # Retornamos un json
            return jsonify(json.dumps(res, default=str))
        else:
            return jsonify({"result": False}) 
    else:
        # En caso de querer acceder a la ruta sin enviar nada
        return f"<h1>No ha enviado datos</h1>"

def get_and_post(mongo):
    # Buscamos el rol por defecto del docente
    rol = mongo.db.roles.find_one({"descripcion": "docente"})   
    rol_permiso = mongo.db.roles_permisos.find_one({"rol": rol["_id"]})    
    # Creamos el nuevo docente para guardar
    if request.method == "POST":
        cedula = request.form["cedula"]
        nombre = request.form["nombre"]
        path = request.form["path"]
        password = generate_password_hash(cedula,"sha256", 10)
        # Verificamos que no exista esa cedula en la base de datos
        buscarCedula = mongo.db.usuarios.find_one({"cedula": cedula})
        if buscarCedula :
            return jsonify({"result": False})

        data = {
            "cedula": cedula,
            "nombre": nombre,
            "username":  "@_" + cedula,
            "password" : password,
            "roles_permisos": [rol_permiso["_id"]],
            "path": path
        }

        # Insertamos el nuevo docente
        mongo.db.usuarios.insert_one(data)
        return jsonify({
            "result": True,
            "message": "Docente agregado correctamente"
        })

    if request.method == "GET":
        result = json_util.dumps(mongo.db.usuarios.find({"roles_permisos": {"$all": [rol_permiso["_id"]]}}))
    
        return Response(result, mimetype="application/json")


def update(mongo):  
    if request.method == "POST":
        cedula = request.form["dni"]
        nombre = request.form["name"]
        id = ObjectId(request.form["id"])

        foundUser = mongo.db.usuarios.find_one({"cedula": cedula})
        if foundUser :
            isSame = foundUser["_id"] == id
            if isSame == False:
                return jsonify({
                    "result": False,
                    "error": "Ya existe un usuario con esa cédula"
                })
        
        password = generate_password_hash(cedula,"sha256", 10)
        # Insertamos el nuevo docente
        result = mongo.db.usuarios.find_one_and_update(
            {
                "_id": id
            }, 
            {
                "$set":{
                    "nombre": nombre,
                    "cedula": cedula,
                    "username": "@_"+cedula,
                    "password": password
                }
            }
        )

        return jsonify({
            "result": True,
            "message": "Docente modificado correctamente"
        })

    if request.method == "GET":
        return jsonify({
            "result": False,
            "error": "Recurso no encontrado"
        })

def getAdminTeachers(mongo):
    # Buscamos el rol por defecto del docente
    rol = mongo.db.roles.find_one({"descripcion": "docente"})   
    rol_permiso = mongo.db.roles_permisos.find_one({"rol": rol["_id"]})

    # Buscamos el rol por defecto del docente
    rolAdminID = mongo.db.roles.find_one({"descripcion": "administrador"})   
    rolAdmin = mongo.db.roles_permisos.find_one({"rol": rolAdminID["_id"]})

    if request.method == "GET":
        result = mongo.db.usuarios.aggregate([
            {
                "$match": {
                    "roles_permisos": {"$all": [rol_permiso["_id"]]}
                }
            }
        ])

        result = json_util.dumps({
            "result": result,
            "_idAdmin": rolAdmin["_id"]
        })

        return Response(result, mimetype="application/json")
