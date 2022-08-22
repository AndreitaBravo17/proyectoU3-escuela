from flask import request, jsonify, Response
from bson import json_util
from bson.objectid import ObjectId

def insert(mongo):
    if request.method == "POST":
        # Obtenemos los datos
        nivel = request.form["level"]
        paralelo = request.form["parallel"]
        docente = request.form["teacher"]
        cupos = request.form["totalQuotas"]
        # Verificamos que no exista esa aula
        buscarAula = mongo.db.aulas.find_one({
            "nivel": nivel,
            "paralelo": paralelo
        })

        if buscarAula != None:
            return jsonify({
                "error": "Aula ya existe" 
            })

        # Verificamos si el docente no ha sido asignado
        buscarDocente = mongo.db.aulas.find_one({
            "docente": ObjectId(docente)        
        })

        if buscarDocente != None:
            return jsonify({
                "error": "Docente ya ha sido asignado" 
            })
        
        data = {
            "nivel": nivel, 
            "paralelo": paralelo,
            "docente": ObjectId(docente),
            "cupos": cupos
        }

        # Inseramos el auka nueva
        result = mongo.db.aulas.insert_one(data)
        if result:
            # Retornamos un json como respuesta
            return jsonify({"result": True})

        return jsonify({"result": False})

    if request.method == "GET":
        result = mongo.db.aulas.aggregate([
            { "$lookup": {
                    "from": "usuarios", 
                    "foreignField": "_id",
                    "localField": "docente",
                    "as": "docente"
                }
            },
            { "$lookup": {
                    "from": "usuarios", 
                    "foreignField": "aula",
                    "localField": "_id",
                    "as": "aula"
                }
            }
        ])

        response = json_util.dumps(result)
        return Response(response, mimetype="application/json")

def update(mongo):
    if request.method == "POST":
        # Obtenemos los datos
        id = ObjectId(request.form["id_update"])
        docente = ObjectId(request.form["teacher_update"])
        nivel = request.form["level_update"]
        paralelo = request.form["parallel_update"]
        cupos = request.form["totalQuotas_update"]

        # Verificamos que no exista esa aula
        buscarAnterior = mongo.db.aulas.find_one({
            "_id": id
        })

        # Verificamos que no exista esa aula
        buscarNueva = mongo.db.aulas.find_one({
            "nivel": nivel,
            "paralelo": paralelo
        })

        if buscarNueva != None:
            sonIguales = buscarAnterior["_id"] == buscarAnterior["_id"]
            if sonIguales != True:
                jsonify({
                    "result": False,
                    "error": "Aula ya existe"
                })
        
        # Verficamos que nuevo docente no exista
        buscarDocente = mongo.db.aulas.find_one({"docente": docente})

        if buscarDocente != None:
            esMismoDocente = buscarAnterior["_id"] == buscarDocente["_id"]
            if esMismoDocente != True:
                return jsonify({
                        "result": False,
                        "error": "Docente ya ha sido asignado a una aula"
                    })

        # Inseramos el auka nueva
        result = mongo.db.aulas.find_one_and_update(
            {
                "_id": id
            },
            {
                "$set": {
                    "nivel": nivel, 
                    "paralelo": paralelo,
                    "docente": docente,
                    "cupos": cupos
                }
            }
        )

        if result:
            # Retornamos un json como respuesta
            return jsonify({"result": True})

        return jsonify({"result": False})

    if request.method == "GET":
        result = mongo.db.aulas.aggregate([
            { "$lookup": {
                    "from": "usuarios", 
                    "foreignField": "_id",
                    "localField": "docente",
                    "as": "docente"
                }
            },
            { "$lookup": {
                    "from": "usuarios", 
                    "foreignField": "aula",
                    "localField": "_id",
                    "as": "aula"
                }
            }
        ])

        response = json_util.dumps(result)
        return Response(response, mimetype="application/json")

def delete(mongo):
    if request.method == "POST":
        id = request.form["id"]
        result = mongo.db.usuarios.find_one({"aula": ObjectId(id)})
        if result: 
            return jsonify({
                "result": False,
                "error": "No se puede eliminar aula, hay estudiantes asignados"
            })

        materias = mongo.db.materias.find_one({"aula": ObjectId(id)})
        if materias: 
            return jsonify({
                "result": False,
                "error": "No se puede eliminar aula, hay materias ya registradas"
            })

        mongo.db.aulas.delete_one({"_id": ObjectId(id)})
        return jsonify({
            "result": True,
            "message": "Aula eliminada correctamente"
        })
    if request.method == "GET":
        return jsonify({"result": False})