const express = require('express');
var bodyParser = require('body-parser')
const cheerio = require('cheerio');

const PORT = 3000;

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(bodyParser.json())

app.use(express.static('public'));

app.listen(PORT,console.log(`Server listening on port: ${PORT}`));



app.post('/actions', (req, res) => {
    console.log("Acción de usuario");
    // type: 1 (click) , 2 (escribir letras), 3 (movimiento de ratón)
    // id_element: elemento sobre el que se realiza la acción (si es que tiene)
    // x , y
    // date: timestamp
    // html : sobre el que se realiza la acción
    // html_father : HTML padre, a veces el propio elemento no es suficiente

    // *Solo para type: 3, incluyen las coordendas de toda la actividad en la página
    // coordenadas : array con todas las coordenadas [{x,y,date:timestap}]
    //console.log(req.body);

    var acciones = req.body.acciones;
    var accionEjemplo = acciones.find(a => a.type == 1 && a.html_father != "");
    if (accionEjemplo != null){
        $ = cheerio.load(accionEjemplo.html_father);
        $('a').each(function (i, elem) {
            console.log("Enlace \t "+$(this).text());
        });
    }

    res.send("ok")
});

app.post('/page', (req, res) => {
    console.log("Abrir una página");
    // url: dirección global del sitio (sin página)
    // path: página
    // time_in: timestamp
    // time_out: 0,
    // ip: IP usarla para identificar al usuario
    console.log(req.body);
    res.send("ok")
});

