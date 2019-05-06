// Requires ( Librerias).
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Medico = require('../models/medico');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')

    //======================================
    // Obtener todos los medicos...
    //======================================

    .populate('usuario', 'nombre email')
        .populate('hospital')


    .skip(desde)
        .limit(5)
        .exec(
            (err, medico) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });

                } else {

                    Medico.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            medico: medico,
                            total: conteo
                        });

                    });

                }
            })

});

//======================================
// Actualizar medico...
//======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });

        }
        if (!medico) {

            res.status(400).json({
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });

        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });

            } else {

                medicoGuardado.password = ':)';

                res.status(200).json({
                    ok: true,
                    medico: medicoGuardado,
                    message: 'Medico actualizado correctamente'
                });

            }

        });


    });

});

//======================================
// Crear un nuevo medico...
//======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({

        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medicos',
                errors: err
            });

        } else {

            res.status(201).json({
                ok: true,
                medico: medicoGuardado,
                medicotoken: req.medico
            });

        }
    });

});

//======================================
// borrar medico...
//======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {


        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });

        }
        if (!medicoBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No exite medico con ese ID',
                errors: { message: 'no existe medico con ese ID' }
            });

        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
        });

    });

});


module.exports = app;