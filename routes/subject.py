from flask import request, jsonify, Response
from bson import json_util
from bson.objectid import ObjectId

def create(mongo):
    if request.method == "POST":
        # Obtenemos los datos
        materia = request.form["materia"]
        aula = ObjectId(request.form["aula"])
        horario = request.form["horario"]   
        # Verificamos que no exista esa aula
        buscarMateria = mongo.db.materias.find_one({
            "aula": aula,
            "horario": horario
        })

        if buscarMateria != None:
            return jsonify({
                "error": "Ya existe una materia en ese horario" 
            })

        # Verificamos que no exista esa aula
        insertado = mongo.db.materias.insert_one({
            "materia": materia,
            "aula": aula,
            "horario": horario
        })

        if insertado != None:
            # Retornamos un json como respuesta
            return jsonify({"result": True})
        else:
            return jsonify({"result": False})

    if request.method == "GET":
        result = mongo.db.materias.aggregate([
            { "$lookup": {
                    "from": "aulas", 
                    "foreignField": "_id",
                    "localField": "aula",
                    "as": "aula"
                }
            }
        ])

        response = json_util.dumps(result)
        return Response(response, mimetype="application/json")

def delete(mongo):
    if request.method == "POST":
        # Obtenemos los datos
        materia = ObjectId(request.form["id"])

        buscarMateria = mongo.db.notas.find_one({
            "materia": materia,
        })

        if buscarMateria != None:
            return jsonify({
                "error": "No se posible eliminar materia. Hay notas registradas" 
            })

        # Verificamos que no exista esa aula
        eliminado = mongo.db.materias.delete_one({
            "_id": materia,
        })

        if eliminado != None:
            # Retornamos un json como respuesta
            return jsonify({"result": True})
        else:
            return jsonify({"result": False})

    if request.method == "GET":
        return jsonify(
            {
                "result": False,
            })
        
def update(mongo):
    if request.method == "POST":
        # Obtenemos los datos
        id = ObjectId(request.form["id"])
        materia = request.form["materia_update"]
        aula = ObjectId(request.form["aula_update"])
        horario = request.form["horario_update"]

        buscarMateria = mongo.db.materias.find_one({
            "aula": aula,
            "horario": horario
        })

        if buscarMateria != None:   
            esMismaAulaHorario = buscarMateria["_id"] == id  
            if esMismaAulaHorario != True:    
                return jsonify({
                    "error": "Ya existe una materia registrada en ese horario" 
                })

        modificada = mongo.db.materias.find_one_and_update(
            {
                "_id": id
            },
            {
                "$set": {
                    "materia": materia,
                    "aula": aula,
                    "horario": horario
                }
            }
        )
       

        if modificada:
            # Retornamos un json como respuesta
            return jsonify({"result": True})
        else:
            return jsonify({"result": False})

    if request.method == "GET":
        return jsonify(
            {
                "result": False,
            })
        