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

let currentURL;

console.log('Pelataan Wikipedia-peliä!');
console.log('Syötä mikä vaan suomenkielinen wikipedia-artikkeli (koko url tai hakusana):');

rl.prompt();

rl.on('line', (line) => {
    console.log();
    console.log(line);
    console.log();

    line = line.trim();

    if (line.startsWith('http://') || line.startsWith('https://')) { //test if line is a query string or a link

        //THIS WAY WITH A FULL URL GIVEN
        if (validateURL(line)) { //test if link is valid

            startURL = line.trim();
            playGame(startURL);

        } else {
            console.log('Ei tuollainen haku kelpaa :D');
            process.exit(0);
        }
    } else {
        //THIS WAY WITH A SEARCH TERM

        //search the wikipedia API with the given search term
        //startURL = fetchWithQueryString(line);
        fetchWithQueryString(line).then(fulfilled => {
            startURL = fulfilled;
            console.log(startURL);
            console.log('täällä oltaisiin promisen thenissä :D')
            playGame(startURL);
        })
    }



}).on('close', () => {
    process.exit(0);
})


//the actual crawling through links
function playGame(startURL) {

    let currentURL = startURL;

    let results = [];
    let count = 0;
    let linksInSingleArticle = [];

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

                    if(filterOutWrongLinks(link)) {

                        let i = pText.indexOf(link.text());

                        if (!(i > indexOfFirstOpeningParenthesis && i < indexOfFirstClosingParenthesis)) { //check that the link is not between parentehses
                            linksInSingleArticle.push(link.attr('href'));
                        }
                    }
                })

                //console.log(linksInSingleArticle);
                //console.log();

                results.push(currentURL);

                //FIXME: situation where there's no links in the p text

                if (!linksInSingleArticle[0]) {
                    //callback('error!!!!')
                    console.log('\nHups!');
                    console.log(`${$('.firstHeading').text()} ei johtanut mihinkään\n`);
                    console.log(`¯\\_(ツ)_/¯\n\n`);
                    process.exit(0);
                }

                currentURL = wikiURL + linksInSingleArticle[0];

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
                console.log(`\nHups!\n\n ${currentURL} aloitti luupin\n\n ¯\\_(ツ)_/¯!`);
            }

            process.exit(0);
        }
    )
}




function fetchWithQueryString(query) {
    const wikiAPI = 'https://fi.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=1&search=';
    let queryURL = wikiAPI + query;
    console.log(queryURL);

    let returnURL = null;

    //return Promise.resolve(
        return axios.get(queryURL).then(response => {
            console.log('axiosin sisällä :D');
            let newLink = response.data[3][0];
            console.log(newLink);
            return newLink;

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


//takes a link (cheerio element) as input and returns true if it's valid, false otherwise
function filterOutWrongLinks(link) {

    const linkText = link.text();
    const linkHref = link.attr('href');

    if(!linkText.match(/^\[/) && //filter out all remarks like "[1]"
        linkHref.startsWith('/wiki/') && //check that links are valid articles and not e.g. scripts
        !linkText.match(/^\d+$/) && //filter out years
        !linkHref.match(/^\/wiki\/\d+\..+kuuta/) && //filter out dates
        !linkHref.match(/^\/wiki\/Tiedosto:/) && //filter out files
        !linkHref.match(/^\/wiki\/Toiminnot:/)) { //filter out actions

        return true;
    }
    return false;
}


//takes a search string and returns true if it's valid, false otherwise
function validateURL(url) {
    if (url.match(/fi.wikipedia.org\/wiki\//) &&
        !url.match(/fi.wikipedia.org\/wiki\/Toiminnot:/) &&
        !url.match(/fi.wikipedia.org\/wiki\/Tiedosto:/)) { //test if link is valid)

        return true;
    }
    return false;
}
