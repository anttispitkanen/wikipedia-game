const cheerio = require('cheerio');
const axios = require('axios');
const readline = require('readline');
const async = require('async');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})


console.log('Pelataan Wikipedia-peliä!');
console.log('Syötä mikä vaan suomenkielinen wikipedia-artikkeli (koko url):');

const wikiURL = 'https://fi.wikipedia.org';

const targetLink = 'https://fi.wikipedia.org/wiki/Filosofia';

let startURL = null;
let results = [];
let count = 0;
//let startURL = testURL7;
let currentURL;
let linksInSingleArticle = [];


rl.prompt();

rl.on('line', (line) => {
    console.log('lol kirjoitit että ' + line + ' :D');

    startURL = line.trim();
    currentURL = startURL;

    async.whilst(

        () => { return currentURL !== null && currentURL !== targetLink && results.indexOf(currentURL) === -1 },

        (callback) => {

            axios.get(currentURL).then(response => {
                let $ = cheerio.load(response.data);
                console.log($('.firstHeading').text());



                let pText = $('#mw-content-text > p').text();

                let indexOfFirstOpeningParenthesis = pText.indexOf('('); //find the indexOf first '('
                let indexOfFirstClosingParenthesis = pText.indexOf(')'); //find the indexOf first ')'

                $('#mw-content-text > p a').each((i, elem) => {
                    let link = $(elem);


                    if(!link.text().match(/^\[/) && //filter out all remarks like "[1]"
                        link.attr('href').startsWith('/wiki/') && //check that links are valid articles and not e.g. scripts
                        !link.text().match(/^\d+$/) && //filter out years
                        !link.attr('href').match(/^\/wiki\/\d+\..+kuuta/) &&
                        !link.attr('href').match(/^\/wiki\/Tiedosto:/)) { //filter out dates

                        let i = pText.indexOf(link.text());

                        if (!(i > indexOfFirstOpeningParenthesis && i < indexOfFirstClosingParenthesis)) { //check that the link is not between parentehses
                            linksInSingleArticle.push(link.attr('href'));
                        }

                    }
                })

                console.log();

                //console.log(linksInSingleArticle);
                //console.log();

                results.push(currentURL);

                currentURL = wikiURL + linksInSingleArticle[0];
                console.log(currentURL);


                count++;
                console.log(count);

                linksInSingleArticle = [];

                callback(null, count);
            })
            .catch(err => {
                console.log('*********** ERROR ***********');
                console.log(err);
            })

        },

        (err, n) => {
            if (results.indexOf(currentURL) === -1) {
                console.log(`it took ${count} steps to get from ${startURL} to Filosofia :D`);
            } else {
                console.log(`woops! ${currentURL} started a loop!`);
            }

            process.exit(0);
        }
    )

}).on('close', () => {
    process.exit(0);
})
