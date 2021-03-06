// Requires ( Librerias).
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')

    //======================================
    // Obtener todos los usuarios...
    //======================================

    .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });

                } else {

                    Usuario.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            usuarios: usuarios,
                            total: conteo
                        });

                    });

                }
            })

});

//======================================
// Actualizar usuario...
//======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });

        }
        if (!usuario) {

            res.status(400).json({
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });

        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });

            } else {

                usuarioGuardado.password = ':)';

                res.status(200).json({
                    ok: true,
                    usuarios: usuarioGuardado,
                    message: 'Usuario actualizado correctamente'
                });

            }

        });


    });

});


//======================================
// Crear un nuevo usuario...
//======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });

        } else {

            res.status(201).json({
                ok: true,
                usuarios: usuarioGuardado,
                usuariotoken: req.usuario
            });

        }
    });

});

//======================================
// borrar usuario...
//======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {


        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });

        }
        if (!usuarioBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No exite usuario con ese ID',
                errors: { message: 'no existe usuario con ese ID' }
            });

        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
        });

    });

});


module.exports = app;