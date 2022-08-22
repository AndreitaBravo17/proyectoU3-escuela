import os
from flask import Flask, render_template
from flask_pymongo import PyMongo
from routes import  teacher, test_stars, student, parallel, admins, courses, user, subject

app = Flask(__name__)

app._static_folder = os.path.abspath("templates/static/")
app.config["MONGO_URI"] = "mongodb://localhost/escuela"
app.config["PHOTO"] = "./templates/static/fotos"
# Envolvemos la app en pymongo para tener acceso desde cualquier lugar
mongo = PyMongo(app)

@app.route('/docente')
def docente():
    return teacher.login()

@app.route('/')
def inicio():
    return render_template('layouts/inicio.html')

@app.route('/estudiante')
def estudiante():
    return render_template('layouts/estudiante.html')

@app.route('/rojo')
def rojo():
    return render_template('layouts/rojo.html')

@app.route('/azul')
def azul():
    return render_template('layouts/azul.html')

@app.route('/amarillo')
def amarillo():
    return render_template('layouts/amarillo.html')

@app.route('/test')
def test():
    return render_template('layouts/test.html')

@app.route('/entrenamiento')
def entrenamiento():
    return render_template('layouts/entrenamiento.html')

@app.route('/stars')
def stars():
    return render_template('layouts/stars.html')

@app.route('/notas')
def notas():
    return render_template('layouts/notas.html')

@app.route('/admin')
def admin():
    return render_template('layouts/admin.html')

# ---------- Agregar rol de administrador ---------------
@app.route('/set-admin', methods=["POST", "GET"])
def addAdminRol():
    return admins.setAdmin(mongo)

# ----------Procesamos logueo del datos docente -----------
@app.route('/processTeacher', methods=["POST", "GET"])
def processTeacher():
    return teacher.process(mongo)

# ------Procesamos los datos que envia el usuario admin al loguearse ---------
@app.route('/sesion-admin', methods=["POST", "GET"])
def sesionAdmin():
    return admins.access(mongo)

# ------Retornamos los docentes administradores ---------
@app.route('/get-teachers-admin', methods=["GET"])
def getAdmins():
    return teacher.getAdminTeachers(mongo)
    
 # -------- Retornamos el panel de control ---------------
@app.route('/c-panel')
def cpanel():
    return render_template('layouts/cpanel.html')

#  ----------- Procesamos las aulas ---------------
@app.route('/courses', methods=["POST", "GET"])
def coursesOption():
    return courses.insert(mongo)

#  ----------- Modificar las aulas ---------------
@app.route('/courses-update', methods=["POST", "GET"])
def updateCourses():
    return courses.update(mongo)

# ----------------- Procesar aulas ------------------
@app.route('/borrar-aula', methods=["POST", "GET"])
def borrarAula():
    return courses.delete(mongo)

# ---------- Borrar usuarios ---------------
@app.route('/borrar-usuarios', methods=["POST", "GET"])
def borrarUsuario():
    return user.delete(mongo)

# ------------------ Agregar u obtener docentes -----------------
@app.route('/teachers', methods=["POST", "GET"])
def teachers():
    return teacher.get_and_post(mongo)

# ------------------ Modificar docentes -----------------
@app.route('/teachers-update', methods=["POST", "GET"])
def updateTeachers():
    return teacher.update(mongo)

# ------------------ Procesar estudiantes -----------------
@app.route('/students', methods=["POST", "GET"])
def estudiantes():    
    return student.save(mongo)

# ------------------Modificar estudiantes -----------------
@app.route('/students-update', methods=["POST", "GET"])
def updateStudents():
    return student.update(mongo)

# ---------- Borrar estudiantes ---------------
@app.route('/students-delete', methods=["POST", "GET"])
def deleteStudents():
    return student.delete(mongo)

# -------------- Operaciones con materias ---------
@app.route('/subjects', methods=["POST", "GET"])
def subjects():
    return subject.create(mongo)

@app.route('/subjects-delete', methods=["POST", "GET"])
def deleteSubjects():
    return subject.delete(mongo)

@app.route('/subjects-update', methods=["POST", "GET"])
def updateSubjects():
    return subject.update(mongo)

# ----------- Guarda la calificación del juego ---------------
@app.route('/setStars', methods=["POST", "GET"])
def setStars():
    return test_stars.insert(mongo)

# --------------- Guarda los datos del test -----------------------------
@app.route('/saveData', methods=["POST", "GET"])
def saveData():
    return test_stars.student_test(mongo)

# ---------------- Obtener todos los estudiantes -----------------------
@app.route('/getParalelo', methods=["POST", "GET"])
def paralelo():
    return parallel.get_students(mongo)

if '__main__' == __name__:
    app.run(debug=True, port=5000)
