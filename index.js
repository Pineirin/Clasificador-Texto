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
    var mapTodasLasPalabras = new Map();
    paragraphs = [
        paragraph,
        "Hiking is a long, vigorous walk, usually on trails or footpaths in the countryside. Walking for pleasure developed in Europe during the eighteenth century. Religious pilgrimages have existed much longer but they involve walking long distances for a spiritual purpose associated with specific religions. ",
        "\"Hiking\" is the preferred term in Canada and the United States; the term \"walking\" is used in these regions for shorter, particularly urban walks. In the United Kingdom and the Republic of Ireland, the word \"walking\" describes all forms of walking, whether it is a walk in the park or backpacking in the Alps. The word hiking is also often used in the UK, along with rambling (a slightly old-fashioned term), hillwalking, and fell walking (a term mostly used for hillwalking in northern England). The term bushwalking is endemic to Australia, having been adopted by the Sydney Bush Walkers club in 1927.[1] In New Zealand a long, vigorous walk or hike is called tramping.[2] It is a popular activity with numerous hiking organizations worldwide, and studies suggest that all forms of walking have health benefits.[3][4]",
        "In the United States, Canada, the Republic of Ireland, and the United Kingdom, hiking means walking outdoors on a trail, or off trail, for recreational purposes.[5] A day hike refers to a hike that can be completed in a single day. However, in the United Kingdom, the word walking is also used, as well as rambling, while walking in mountainous areas is called hillwalking. In Northern England, Including the Lake District and Yorkshire Dales, fellwalking describes hill or mountain walks, as fell is the common word for both features there.",
        "Hiking sometimes involves bushwhacking and is sometimes referred to as such. This specifically refers to difficult walking through dense forest, undergrowth, or bushes where forward progress requires pushing vegetation aside. In extreme cases of bushwhacking, where the vegetation is so dense that human passage is impeded, a machete is used to clear a pathway. The Australian term bushwalking refers to both on and off-trail hiking.[6] Common terms for hiking used by New Zealanders are tramping (particularly for overnight and longer trips),[7] walking or bushwalking. Trekking is the preferred word used to describe multi-day hiking in the mountainous regions of India, Pakistan, Nepal, North America, South America, Iran, and the highlands of East Africa. Hiking a long-distance trail from end-to-end is also referred to as trekking and as thru-hiking in some places.[8] In North America, multi-day hikes, usually with camping, are referred to as backpacking.[5]",
        "The poet Petrarch is frequently mentioned as an early example of someone hiking. Petrarch recounts that on April 26, 1336, with his brother and two servants, he climbed to the top of Mont Ventoux (1,912 meters (6,273 ft), a feat which he undertook for recreation rather than necessity.[9] The exploit is described in a celebrated letter addressed to his friend and confessor, the monk Dionigi di Borgo San Sepolcro, composed some time after the fact. However, some have suggested that Petrach's climb was fictional.[10][11]",
        "Jakob Burckhardt, in The Civilization of the Renaissance in Italy (in German in 1860) declared Petrarch \"a truly modern man\", because of the significance of nature for his \"receptive spirit\"; even if he did not yet have the skill to describe nature.[12] Petrarch's implication that he was the first to climb mountains for pleasure,[13] and Burckhardt's insistence on Petrarch's sensitivity to nature have been often repeated since.[14] There are also numerous references to Petrarch as an \"alpinist\",[15] although Mont Ventoux is not a hard climb, and is not usually considered part of the Alps.[16] This implicit claim of Petrarch and Burckhardt, that Petrarch was the first to climb a mountain for pleasure since antiquity, was disproven by Lynn Thorndike in 1943,[17] Mount Ventoux was climbeds by Jean Buridan, on his way to the papal court in Avignon before the year 1334, \"in order to make some meteorological observations\".[18][19] and there were ascents accomplished during the Middle Ages,[20][21] Lynn Thorndike mentions that \"a book on feeling for nature in Germany in the tenth and eleventh centuries, noted various ascents and descriptions of mountains from that period\", and that \"in the closing years of his life archbishop Anno II, Archbishop of Cologne ((c. 1010 – 1075)) climbed his beloved mountain oftener than usual\".[22] ",
        "However, the idea of taking a walk in the countryside only really developed during the 18th century in Europe, and arose because of changing attitudes to the landscape and nature associated with the Romantic movement.[23] In earlier times walking generally indicated poverty and was also associated with vagrancy.[24]: In previous centuries long walks were undertaken as part of religious pilgrimages and this tradition continues throughout the world."
    ];
    paragraphs.forEach( paragraph => {
        paragraph = paragraph.replace(/,/gi, '.'); // todas las , por .
        paragraph = paragraph.replace(/[.]/gi, ' '); // todas las - por
        paragraph = paragraph.replace(/•/gi, ' '); // todas las , por .
        paragraph = paragraph.replace(/:/gi, ' '); // todas las , por .
        paragraph = paragraph.replace(/–/gi, ' '); // todas las , por .
        paragraph = paragraph.replace(/;/gi, ' '); // todas las , por .
        paragraph = paragraph.replace(/'/gi, ' '); // todas las , por .
        paragraphArray = paragraph.split(' ');
        for( i=0; i < paragraphArray.length; i++){
            mapTodasLasPalabras.set(paragraphArray[i], 0);
        } 
    });

    var myParagraph = cleanParagraph;
    var paragraphSplitted = myParagraph.split(' ');

    var TfIdf = natural.TfIdf;
    var tfidf = new TfIdf();

    //Incluir todos los parrafos
    paragraphs.forEach( paragraph => {
        tfidf.addDocument(paragraph);
    });
    
    measuredNouns = [];
    totalMeasure = 0;
    
    for (const [key, _] of mapTodasLasPalabras.entries()) {
        noun = false;
    
        if (nouns.indexOf(key) >= 0){
            noun = true;
        }
        tfidf.tfidfs(key, function(i, measure){
            if (noun && i == 0){
                measuredNouns.push([key, measure])
                totalMeasure += measure;
            }
        });
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

function divide(nouns, measuredNouns){
    //Texto divido en secciones (objetivo)
    dividedText = []
    //Texto dividido palabras
    words = cleanParagraph.split(' ')
    //Índice de la frase en la que se encuentra el iterador.
    phraseNumber = 0;
    //Nombre de las rutas
    titles = []
    body = []
    //Este if estaría a true si se encuentra el principio del nombre de una ruta.
    findingTitle = false;
    //Obtener los nombres de las rutas, junto al índice de su frase.
    words.forEach(word =>{
        //Ha encontrado el principio del título
        if (findingTitle && nouns.indexOf(word) >= 0){
            titles[titles.length-1] += " " + word;
        } 
        //Encuentra el final del título
        else if (findingTitle){
            findingTitle = false;
            phraseNumber++;
        }
        //Encuentra el principio del título
        else if (measuredNouns.indexOf(word) >= 0){
            titles.push(word);
            findingTitle = true;
        }
        if(phraseNumber-1 >= 0 && !findingTitle) {
            if(body[phraseNumber-1] === undefined) {
                body.push(word);
            } else {
                body[phraseNumber-1] += " " + word;
            }
        }
    });
    result = '';
    m = 0
    /*titles.forEach((title) => {
        result += title + "\n";
        // result += body[m];
    });*/
    return titles;
}

function obtainTitles(titlesList) {
    var result = "";
    titlesList.forEach((title) => {
        if ( title.split(' ').length > 1 ) {
            if ( !result.includes(title) ) {
                result += ',' + title;
            }
        }
    });
    return result.split(',');
}

function obtainBodies(titles, paragraph) {
    var result = '';
    var isFirst = true;
    var splittedText = paragraph.split('.');
    splittedText.forEach(sentence => {
        var tempSentence = sentence.replace(/,/gi, '');
        var wasTitle = false;
        titles.some(title => {
            if (tempSentence.includes(title) && title.length/tempSentence.length*100 >= 60 ) {
                wasTitle = true;
                if (isFirst) {
                    result += sentence + "\n\n";
                    isFirst = false;
                } else {
                    result += "\n\n" + sentence + "\n\n";
                }
                return result;
            }
        });
        if(!wasTitle) {
            result += sentence + ".";
        }
    });
    return result;
}

function sortOut(paragraph){
    var nouns = posTransformation(paragraph)
    measuredNouns = measureNouns(paragraph, nouns);
    divided = divide(nouns, measuredNouns);
    var titles = obtainTitles(divided);
    titles.shift();
    var result = obtainBodies(titles, paragraph);
    return result;
}

app.post('/transform', function (req, res) {
    res.render('solution', {solution: sortOut(req.body.textArea)});
});

app.listen(3000, (_req, _res) => {
    console.log('listening on port 3000');
});
  