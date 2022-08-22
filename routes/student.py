from operator import countOf
import json
from typing import Counter, Type
from flask import request, jsonify, Response
from bson import json_util
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash

def delete(mongo):
    
    if request.method == "POST":
        id = request.form["id"]
        mongo.db.usuarios.delete_one({"_id": ObjectId(id)})
        return jsonify({
            "result": True,
            "message": "Usuario eliminado correctamente"
        })
    if request.method == "GET":
        return jsonify({"result": False})


def save(mongo):
     # Buscamos el rol por defecto del docente
    rol = mongo.db.roles.find_one({"descripcion": "estudiante"})   
    rol_permiso = mongo.db.roles_permisos.find_one({"rol": rol["_id"]})

    if request.method == "POST":
        cedula = request.form["dni"]
        aula = ObjectId(request.form["course"])
        nombre = request.form["name"]
        path = request.form["image"]
        password = generate_password_hash(cedula,"sha256", 10)

        # Verificamos si ya existe esa cedula
        foundUser = mongo.db.usuarios.find_one({"cedula": cedula})
        if foundUser:
            return jsonify({
                "result": False,
                "error": "Ya existe un usuario con esa cédula"
            })

        # Obtenemos los cupos totales
        foundCourse = mongo.db.aulas.find_one({"_id": aula})
        limit = int(foundCourse["cupos"])
        # Obtenemos todos los estudiantes de esa aula
        students = mongo.db.usuarios.find({ "aula": aula})

        totalRegistrados = len(json.loads(json_util.dumps(students)))
        hayCupos = totalRegistrados < limit

        if hayCupos == True:
            data = {
                "cedula": cedula,
                "nombre": nombre,
                "username":  "@_" + cedula,
                "password" : password,
                "path": path,
                "aula":aula,
                "roles_permisos": [rol_permiso["_id"]]
            }

            mongo.db.usuarios.insert_one(data)

            return jsonify({
                "result": True,
                "message": "Estudiante guardado correctamente"})
        else:
            return jsonify({
                "result": False,
                "error": "No hay cupos Disponibles"
            })
    if request.method == "GET":
        result = mongo.db.usuarios.aggregate([
            {
                "$match": {
                    "roles_permisos": {"$all": [rol_permiso["_id"]]}
                }
            },
            { "$lookup": {
                    "from": "aulas",
                    "localField": "aula",
                    "foreignField": "_id",
                    "as": "aula"
                }
        }])

        result = json_util.dumps(result)
    
        return Response(result, mimetype="application/json")


def update(mongo):

    if request.method == "POST":
        id = ObjectId(request.form["id"])
        cedula = request.form["dni"]
        aula = ObjectId(request.form["course"])
        nombre = request.form["name"]
        path = request.form["image"]

        password = generate_password_hash(cedula,"sha256", 10)
        
        # Verificamos si ya existe esa cedula
        foundUser = mongo.db.usuarios.find_one({"cedula": cedula})
       
        if foundUser != None:
            isSame = foundUser["_id"] == id
            if isSame != True:
                return jsonify({
                    "result": False,
                    "error": "Ya existe un usuario con esa cédula"
                })
        # Obtenemos los cupos totales
        foundCourse = mongo.db.aulas.find_one({"_id": aula})
        limit = int(foundCourse["cupos"])

        # Obtenemos todos los estudiantes de esa aula
        students = mongo.db.usuarios.find({ "aula": aula})
        foundUser = mongo.db.usuarios.find({"_id": id})
        aulaActual= json.loads(json_util.dumps(foundUser))
        aulaActualId = aulaActual[0]["aula"]["$oid"]
        
        # primero validamos si no es el mismo curso
        esMismaAula = aulaActualId == aula
        if esMismaAula == True:
            if path == "":
                mongo.db.usuarios.find_one_and_update(
                    {
                    "_id": id
                    },
                    {
                        "$set": {
                            "cedula": cedula,
                            "nombre": nombre,
                            "username":  "@_" + cedula,
                            "password" : password,
                            "aula":ObjectId(aula)
                        }
                    }
                )
            else:
                mongo.db.usuarios.find_one_and_update(
                    {
                    "_id": id
                    },
                    {
                        "$set": {
                            "cedula": cedula,
                            "nombre": nombre,
                            "username":  "@_" + cedula,
                            "path": path,
                            "password" : password,
                            "aula":ObjectId(aula)
                        }
                    }
                )
            
            return jsonify({
                "result": True,
                "message": "Estudiante guardado correctamente"})

        # Aqui estaamos validando una aula diferente
        totalRegistrados = len(json.loads(json_util.dumps(students)))
        hayCupos = totalRegistrados < limit

        if hayCupos == True:
            if path == "":
                mongo.db.usuarios.find_one_and_update(
                    {
                    "_id": id
                    },
                    {
                        "$set": {
                            "cedula": cedula,
                            "nombre": nombre,
                            "username":  "@_" + cedula,
                            "password" : password,
                            "aula":ObjectId(aula)
                        }
                    }
                )
            else:
                mongo.db.usuarios.find_one_and_update(
                    {
                    "_id": id
                    },
                    {
                        "$set": {
                            "cedula": cedula,
                            "nombre": nombre,
                            "username":  "@_" + cedula,
                            "path": path,
                            "password" : password,
                            "aula":ObjectId(aula)
                        }
                    }
                )
            
            return jsonify({
                "result": True,
                "message": "Estudiante guardado correctamente"})
        else:      
            return jsonify({
                "result": True,
                "error": "No hay cupos disponibles en esa aula"})
    else:
        return jsonify({
            "result": False,
            "error": "Recurso no encontrado"
        })

