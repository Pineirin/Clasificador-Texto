var express = require('express');
var exphbs  = require('express-handlebars');

var app = express();

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get('/', function (_, res) {
    res.render('home');
});

app.post('/transform', function (req, res) {
    res.render('solution', {solution: req.body.textArea});
});

app.listen(3000, (_req, _res) => {
    console.log('listening on port 3000');
});
  