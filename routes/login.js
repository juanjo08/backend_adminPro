// Requires ( Librerias).
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

//Google

var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =========================================
// Autenticacion de Google
//==========================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {

            return res.status(403).json({

                ok: false,
                mensaje: 'Token no válido'

            });

        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });

        }

        if (usuarioBD) {

            if (usuarioBD.google === false) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: err
                });

            } else {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) //4H

                res.status(200).json({
                    ok: true,
                    message: 'Login correcto',
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id

                });

            }

        } else {

            // El usuario no existe hay que crearlo...
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear el usuario',
                        errors: err
                    });

                }

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) //4H

                res.status(200).json({
                    ok: true,
                    message: 'Usuario creado con exito.',
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id

                });

            });
        }

    });

});

// =========================================
// Autenticacion Normal
//==========================================

// Inicializar modelo USUARIO
var Usuario = require('../models/usuario');

app.post("/", (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });

        }

        if (!usuarioBD) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });

        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - pass',
                errors: err
            });
        }

        // creamos el token..
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }) //4H

        res.status(200).json({
            ok: true,
            message: 'Login correcto',
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id

        });

    });

});

module.exports = app;