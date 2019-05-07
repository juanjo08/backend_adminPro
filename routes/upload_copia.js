// Requires ( Librerias).
var express = require('express');

// Inicializar variables
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {

        res.status(500).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe seleccionar una imagen' }
        });

    }

    // Obtener nombre del archivo.

    var archivo = req.files.imagen;
    var ext = archivo.name.split('.');
    var extensionArchivo = ext[ext.length - 1];

    // tipos de coleccion.. 

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valido.',
            error: { message: 'Los tipos de colección no son validos ' + tiposValidos.join(', ') }
        });

    }

    // solo estas extensiones aceptamos.

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida.',
            error: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });

    }

    // nombre de archivo personalizado.

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo a un path especifico.

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error a mover el archivo.',
                error: err
            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen anterior.
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, (err) => {

                    if (err) {

                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar el archivo anterior.',
                            error: err
                        });

                    }

                });
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                if (err) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el archivo en BD.',
                        error: err
                    });

                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado,
                });

            });

        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {


            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen anterior.
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, (err) => {

                    if (err) {

                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar el archivo anterior.',
                            error: err
                        });

                    }

                });
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                if (err) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el archivo en BD.',
                        error: err
                    });

                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });

            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {


            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen anterior.
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, (err) => {

                    if (err) {

                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al eliminar el archivo anterior.',
                            error: err
                        });

                    }

                });
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                if (err) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el archivo en BD.',
                        error: err
                    });

                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });

            });

        });

    }

}

module.exports = app;