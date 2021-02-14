var express = require('express');
var exphbs  = require('express-handlebars');
var pos = require('pos');
var natural = require('natural');

var app = express();

app.use(express.static(__dirname + '/public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get('/', function (_, res) {
    res.render('home');
});

var cleanParagraph = '';

function preprocessing(paragraph) {
    var p = paragraph;
    p = p.replace(/\n/g, ' ');
    p = p.replace(/\t/g, ' ');
    p = p.replace(/,/gi, '.');      // todas las , por .
    p = p.replace(/[.]/gi, ' ');    // todas las - por
    p = p.replace(/•/gi, ' ');      // todas las , por .
    p = p.replace(/:/gi, ' ');      // todas las , por .
    p = p.replace(/–/gi, ' ');      // todas las , por .
    p = p.replace(/;/gi, ' ');      // todas las , por .
    p = p.replace(/'/gi, ' ');      // todas las , por .
    p = p.replace(/["'()?]/g, "");
    p = p.replace(/ +/g, ' ');      // dejar solo 1 espacio
    cleanParagraph = p;
    return p;
}

function posTransformation(paragraph) {
    var myParagraph = preprocessing(paragraph);
    var words = new pos.Lexer().lex(myParagraph);
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
    nouns = [];
    for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        // var tag = taggedWord[1];
        if (!deleteFromText.includes(taggedWord[1])) {
            if (nouns.indexOf(word) == -1){
                nouns.push(word);
            }
        }
    }
    return nouns;
}

function measureNouns(paragraph, nouns){
    var myParagraph = cleanParagraph;
    var paragraphSplitted = myParagraph.split(' ');

    var TfIdf = natural.TfIdf;
    var tfidf = new TfIdf();
    tfidf.addDocument(paragraph);
    
    measuredNouns = [];
    totalMeasure = 0;
    
    // Recorrer todas las palabras que tengo en el map y ver la importancia
    for (i in paragraphSplitted) {
        if(nouns != undefined && i != paragraphSplitted.length) {
            tfidf.tfidfs(paragraphSplitted[i], function(_, measure){
                if (nouns.indexOf(paragraphSplitted[i]) >= 0) {
                    measuredNouns = insertValue(measuredNouns, paragraphSplitted[i], measure);
                    totalMeasure += measure;
                }
            });
        }
    }

    meanMeasure = totalMeasure / measuredNouns.length;
    list2return = [];
    measuredNouns.forEach(pair => {
        if (meanMeasure < pair[1]) {
            list2return.push(pair[0]);
        }
    });
    return list2return;
}

function insertValue(measuredNouns, word, measure) {
    var inserted = false;
    var k = 0;
    measuredNouns.forEach(pair => {
        if (pair[0] == word) {
            measuredNouns[k][1] = measuredNouns[k][1] + measure;
            inserted = true;
        }
        k++;
    });
    if (!inserted) {
        measuredNouns.push([word, measure]);
    }
    return measuredNouns;
}

function divide(paragraph, nouns, measuredNouns){
    //Texto divido en secciones (objetivo)
    dividedText = []
    //Texto dividido palabras
    words = paragraph.split(' ')
    //Índice de la frase en la que se encuentra el iterador.
    phraseNumber = 0;
    //Nombre de las rutas
    titles = []
    //Este if estaría a true si se encuentra el principio del nombre de una ruta.
    findingTitle = false;
    //Obtener los nombres de las rutas, junto al índice de su frase.
    words.forEach(word =>{
        //Ha encontrado el principio del título
        if (findingTitle && nouns.indexOf(word) >= 0){
            titles[titles.length-1][0] += " " + word
        } 
        //Encuentra el final del título
        else if (findingTitle){
            findingTitle = false;
        }
        //Encuentra el principio del título
        else if (measuredNouns.indexOf(word) >= 0){
            titles.push([word, phraseNumber])
            finding = true;
        }
        //Encuentra una frase nueva.
        if (word.includes(".")){
            phraseNumber++;
        }
    })
    //Texto dividido en frases.
    phrases = paragraph.split(' ')

    //Ligar cada frase a un título
    for (i=0; i<phrases.length; i++) {
        for (j=0; j<titles.length; j++){
            if (i==j){
                dividedText.push(titles[j], phrases[i])
            }
        }
    } 
    return dividedText;

}

function sortOut(paragraph){
    var nouns = posTransformation(paragraph)
    measuredNouns = measureNouns(paragraph, nouns);
    divided = divide(paragraph, nouns, measuredNouns);
    return measuredNouns;
}

app.post('/transform', function (req, res) {
    res.render('solution', {solution: sortOut(req.body.textArea)});
});

app.listen(3000, (_req, _res) => {
    console.log('listening on port 3000');
});
  