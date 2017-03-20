const cheerio = require('cheerio');
const axios = require('axios');
const readline = require('readline');
const async = require('async');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})




const wikiURL = 'https://fi.wikipedia.org';

const targetLink = 'https://fi.wikipedia.org/wiki/Filosofia';

let startURL = null;
let results = [];
let count = 0;

let currentURL;
let linksInSingleArticle = [];


console.log('Pelataan Wikipedia-peliä!');
console.log('Syötä mikä vaan suomenkielinen wikipedia-artikkeli (koko url tai hakusana):');

rl.prompt();

rl.on('line', (line) => {
    console.log();
    console.log(line);
    console.log();

    line = line.trim();

    if (line.startsWith('http://') || line.startsWith('https://')) { //test if line is a query string or a link
        if (line.match(/fi.wikipedia.org\/wiki\//) &&
            !line.match(/fi.wikipedia.org\/wiki\/Toiminnot:/) &&
            !line.match(/fi.wikipedia.org\/wiki\/Tiedosto:/)) { //test if link is valid

            startURL = line.trim();
        } else {
            console.log('Ei tuollainen haku kelpaa :D');
            process.exit(0);
        }
    } else {
        //search the wikipedia API with the given search term
        //startURL = fetchWithQueryString(line);
        fetchWithQueryString(line).then(fulfilled => {
            startURL = fulfilled;
        })
    }

    console.log(startURL);

    //startURL = line.trim();
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
                        !link.attr('href').match(/^\/wiki\/\d+\..+kuuta/) && //filter out dates
                        !link.attr('href').match(/^\/wiki\/Tiedosto:/) && //filter out files
                        !link.attr('href').match(/^\/wiki\/Toiminnot:/)) { //filter out actions

                        let i = pText.indexOf(link.text());

                        if (!(i > indexOfFirstOpeningParenthesis && i < indexOfFirstClosingParenthesis)) { //check that the link is not between parentehses
                            linksInSingleArticle.push(link.attr('href'));
                        }

                    }
                })

                //console.log(linksInSingleArticle);
                //console.log();

                results.push(currentURL);

                currentURL = wikiURL + linksInSingleArticle[0];
                if (!currentURL) { callback('error!!!!') }

                console.log(currentURL);


                count++;
                console.log(count);
                console.log();

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



function fetchWithQueryString(query) {
    const wikiAPI = 'https://fi.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=1&search=';
    let queryURL = wikiAPI + query;
    console.log(queryURL);

    let returnURL = null;

    //return Promise.resolve(
        return axios.get(queryURL).then(response => {
            console.log('axiosin sisällä :D');
            let data = response[0];
            console.log(data);
            return data;

        })
        .catch(err => {
            console.log('########## ERROR ##########');
            console.log(err);
            console.log('Ei löydy, sori :D');
            process.exit(0);
        })
    //)



    //let $ = cheerio.load(response.data);
    //console.log($('.firstHeading').text());
}
