from flask import request, jsonify, Response
from bson import json_util
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

def access(mongo):
    # Buscamos el rol por defecto del administrador
    rol = mongo.db.roles.find_one({"descripcion": "administrador"})   
    rol_permiso = mongo.db.roles_permisos.find_one({"rol": rol["_id"]})

    if request.method == "POST":
        # Obtenemos los datos enviamos y los almacenamos
        username = request.form["username"]
        password = request.form["password"]
        # Creamos un objeto con las credenciales
        data = {
            "username": username,
            "roles_permisos": {
                "$all": [ObjectId(rol_permiso["_id"])]
            }
        }
        # Buscamos un usuario
        foundUser = mongo.db.usuarios.find_one(data)

        # Si las credenciales están incorrectas retornamos de inmediato
        if foundUser == None:
            return jsonify({
                "access": False, 
                "error": "Usuario incorrecto"
            })

        passwordBD = foundUser["password"]
        isValid = check_password_hash(passwordBD, password)
        if isValid:
            # Creamos la respuesta y la retornamos 
            response = {"access": True, "body": foundUser}
            response = json_util.dumps(response)
            return Response(response, mimetype="application/json")

        else:
            response = {
                "access": False,
                "error": "Acceso denegado. Contraseña incorrecta"
            }     
            response = json_util.dumps(response)
            return Response(response, mimetype="application/json")

    else:
        # En caso de querer acceder a la ruta sin enviar nada
        return f"<h1>No ha enviado datos</h1>"

def setAdmin(mongo):
    # Buscamos el rol por defecto del administrador
    rol = mongo.db.roles.find_one({"descripcion": "administrador"})   
    rol_permiso = mongo.db.roles_permisos.find_one({"rol": rol["_id"]})
    if request.method == "POST":
        # Obtenemos los datos enviamos y los almacenamos
        id = ObjectId(request.form["id"])
        isAdmin = request.form["admin"]
        isActive = isAdmin == "true"

        if isActive: 
            mongo.db.usuarios.find_one_and_update(
                {
                    "_id": id
                },
                {
                    "$push": {"roles_permisos": rol_permiso["_id"]}
                }
            )
            
            response = {
                "result": True,
                "message": "Usuario fue asignado como administrador"
            }     
            response = json_util.dumps(response)
            return Response(response, mimetype="application/json")

        else:
            mongo.db.usuarios.find_one_and_update(
                {
                    "_id": id
                },
                {
                    "$pull": {"roles_permisos": rol_permiso["_id"]}
                }
            )
            
            response = {
                "result": False,
                "message": "Usuario ha dejado de ser administrador"
            }     
            response = json_util.dumps(response)
            return Response(response, mimetype="application/json")
    else:
        # En caso de querer acceder a la ruta sin enviar nada
        return f"<h1>No ha enviado datos</h1>"
