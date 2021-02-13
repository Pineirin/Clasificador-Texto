var express = require('express');
var exphbs  = require('express-handlebars');
var pos = require('pos');

var app = express();

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get('/', function (_, res) {
    res.render('home');
});

function preprocessing(paragraph) {
    // paragraph = paragraph.toLowerCase();
    paragraph = paragraph.replace(/\n/g, ' ');
    paragraph = paragraph.replace(/\t/g, ' ');
    paragraph = paragraph.replace(/,/gi, '.');      // todas las , por .
    paragraph = paragraph.replace(/[.]/gi, ' ');    // todas las - por
    paragraph = paragraph.replace(/•/gi, ' ');      // todas las , por .
    paragraph = paragraph.replace(/:/gi, ' ');      // todas las , por .
    paragraph = paragraph.replace(/–/gi, ' ');      // todas las , por .
    paragraph = paragraph.replace(/;/gi, ' ');      // todas las , por .
    paragraph = paragraph.replace(/'/gi, ' ');      // todas las , por .
    paragraph = paragraph.replace(/["'()?]/g, "");
    paragraph = paragraph.replace(/ +/g, ' ');      // dejar solo 1 espacio
    return paragraph;
}

function posTransformation(paragraph) {
    paragraph = preprocessing(paragraph);
    var words = new pos.Lexer().lex(paragraph);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    var deleteFromText = 
        ["CC",  "CD",   "DT",   "EX",   "FW", 
         "IN",  "JJ",   "JJR",  "JJS",  "LS", 
         "MD",  "NNS",  "NN",   "PDT",
         "POS", "PRP",  "PRP$", "RB",   "RBR",
         "RBS", "RP",   "SYM",  "TO",   "UH",
         "VB",  "VBD",  "VBG",  "VBN",  "VBP",
         "VBZ", "WDT",  "WP",   "WP$",  "WRB"];
    paragraphSimple = "";
    for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        // var tag = taggedWord[1];
        if (!deleteFromText.includes(taggedWord[1])) {
            paragraphSimple += word + " ";
        }
    }
    return paragraphSimple;
}

app.post('/transform', function (req, res) {
    res.render('solution', {solution: posTransformation(req.body.textArea)});
});

app.listen(3000, (_req, _res) => {
    console.log('listening on port 3000');
});
  