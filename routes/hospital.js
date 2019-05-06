// Requires ( Librerias).
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');

// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})

    //======================================
    // Obtener todos los hospitales...
    //======================================

    .populate('usuario', 'nombre email')
        .populate('hospital')

    .skip(desde)
        .limit(5)
        .exec(
            (err, hospital) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });

                } else {

                    Hospital.count({}, (err, conteo) => {

                        res.status(200).json({
                            ok: true,
                            hospital: hospital,
                            total: conteo
                        });

                    });

                }
            })

});

//======================================
// Actualizar hospital...
//======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });

        }
        if (!hospital) {

            res.status(400).json({
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe el hospital con ese ID' }
            });

        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });

            } else {

                res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado,
                    message: 'Hospital actualizado correctamente'
                });

            }

        });


    });

});

//======================================
// Crear un nuevo hospital...
//======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({

        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospitales',
                errors: err
            });

        } else {

            res.status(201).json({
                ok: true,
                hospitalGuardado: hospitalGuardado,
                hospitaltoken: req.hospital
            });

        }
    });

});

//======================================
// borrar hospital...
//======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {


        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });

        }
        if (!hospitalBorrado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No exite hospital con ese ID',
                errors: { message: 'no existe hospital con ese ID' }
            });

        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });

    });

});


module.exports = app;