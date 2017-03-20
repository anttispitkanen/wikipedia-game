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

console.log('\n========================================');
console.log('\nPelataan Wikipedia-peliä!');
console.log('Syötä mikä vaan suomenkielinen wikipedia-artikkeli (koko url tai hakusana):');

rl.prompt();

rl.on('line', (line) => {
    console.log();

    line = line.trim();

    if (line.startsWith('http://') || line.startsWith('https://')) { //test if line is a query string or a link

        //THIS WAY WITH A FULL URL GIVEN
        if (validateURL(line)) { //test if link is valid

            startURL = line.trim();
            playGame(startURL);

        } else {
            console.log('Ei tuollainen haku kelpaa :D\n');
            process.exit(0);
        }
    } else {
        //THIS WAY WITH A SEARCH TERM

        //search the wikipedia API with the given search term
        fetchWithQueryString(line).then(fulfilled => {
            startURL = fulfilled;
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

                results.push(currentURL);

                //in case there is no link to follow
                if (!linksInSingleArticle[0]) {
                    console.log('\nHups!');
                    console.log(`${$('.firstHeading').text()} ei johtanut mihinkään\n`);
                    console.log(`¯\\_(ツ)_/¯\n\n`);
                    process.exit(0);
                }

                currentURL = wikiURL + linksInSingleArticle[0];

                console.log(currentURL);

                count++;
                console.log(count + '\n');

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
                console.log('\n\nVOITIT! :D');
                console.log(`\nMeni ${count} steppiä Filosofiaan :D\n(${startURL})\n\n`);
            } else {
                console.log(`\nHups!\n\n${currentURL} aloitti luupin\n\n(╯°□°）╯︵ ┻━┻\n\n`);
            }

            process.exit(0);
        }
    )
}




function fetchWithQueryString(query) {
    const wikiAPI = 'https://fi.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=1&search=';
    let queryURL = wikiAPI + query;
    let returnURL = null;

    return axios.get(queryURL).then(response => {

        let newLink = response.data[3][0];

        //jos ei löydy hakusanalla
        if (!newLink) {
            console.log('\nEi löydy mitään, sori :D\n');
            process.exit(0);
        }

        return newLink;

    })
    .catch(err => {
        console.log('########## ERROR ##########');
        console.log(err);
        process.exit(0);
    })

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
