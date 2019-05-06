// Requires ( Librerias).
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar variables
var app = express();

// Body-Parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())


// Importar Routes
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var loginHospital = require('./routes/hospital');
var loginMedico = require('./routes/medico');

// Conexión a la BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

//Rutas
app.use('/login', loginRoutes);
app.use('/hospital', loginHospital);
app.use('/medico', loginMedico);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);



// Escuchar peticiones
app.listen(3000, () => {

    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});