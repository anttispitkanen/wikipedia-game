/*
Wikipedia game

A script for finding the article about philosophy on Wikipedia.

This version uses async/await.

FOR ENGLISH WIKIPEDIA.

Antti Pitkänen 2017
*/

const cheerio = require('cheerio');
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})


const wikiURL = 'https://en.wikipedia.org';
const targetLink = 'https://en.wikipedia.org/wiki/Philosophy';
// rnnamespace=0 searches from articles
const randomURL = 'https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnlimit=1&rnnamespace=0';
const wikiAPI = 'https://en.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=1&search=';

let startURL = null;
let currentURL;


console.log('\n========================================');
console.log('\nLet\'s play the Wikipedia game!');
console.log('Enter any English Wikipedia article (full url or search term), empty query picks one at random:');

rl.prompt();

rl.on('line', (line) => {
    console.log();
    line = line.trim();

    if (line.length === 0) {
        // THIS WAY WITH EMPTY SEARCH
        playRandom();

    } else if (line.startsWith('http://') || line.startsWith('https://')) {
        //THIS WAY WITH A FULL URL GIVEN
        playWithFullURL(line);

    } else {
        //THIS WAY WITH A SEARCH TERM
        playWithSearchTerm(line);
    }

}).on('close', () => {
    process.exit(0);
})


async function playRandom() {
    console.log('Here\'s a random article:');
    let article = await fetchRandomArticle();
    console.log(article + '\n');
    let startURL = await fetchWithQueryString(article);
    playGame(startURL);
}

//search the wikipedia API with the given search term
async function playWithSearchTerm(term) {
    let startURL = await fetchWithQueryString(term.trim());
    playGame(startURL);
}

function playWithFullURL(url) {
    if (validateURL(url)) {
        playGame(url.trim());
    } else {
        console.log('That kind of search won\'t do :D\n');
        process.exit(0);
    }
}



//the actual crawling through links
async function playGame(startURL) {

    let currentURL = encodeURI(startURL);

    let results = [];
    let count = 0;

    while (currentURL !== null && currentURL !== targetLink && results.indexOf(currentURL) === -1) {

        let response = await axios.get(currentURL);
        let $ = cheerio.load(response.data);
        console.log($('.firstHeading').text());

        try {
            let nextLink = findNextLink($);
            results.push(currentURL);
            count++;
            currentURL = wikiURL + nextLink;
            console.log(currentURL + '\n' + count + '\n');

        } catch (e) {
            console.log(`\nOops!\n${$('.firstHeading').text()} didn\'t get you anywhere\n¯\\_(ツ)_/¯\n\n`);
            process.exit(0);
        }
    }

    if (results.indexOf(currentURL) === -1) {
        console.log(`\n\nVICTORY! :D\n\nIt took ${count} steps to Philosophy :D\n(${startURL})\n\n`);
    } else {
        console.log(`\nOops!\n\n${currentURL} started a loop\n\n(╯°□°）╯︵ ┻━┻\n\n`);
    }

    process.exit(0);

}



// /* FOR DEMOING */
// function resolveAfterSecond(x) {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve(x);
//         }, 1000);
//     });
// }
//
// (async () => {
//     for (let i = 0; i < 20; i++) {
//         console.log('\n\n' + await resolveAfterSecond(i) + ' SECONDS PASSED\n\n\n');
//     }
// })();
// /* FOR DEMOING */







// takes a cheerio element of the loaded response data, returns the first valid link
function findNextLink($) {
    let pText = $('#mw-content-text > p').text();
    let indexOfFirstOpeningParenthesis = pText.indexOf('('); //find the indexOf first '('
    let indexOfFirstClosingParenthesis = pText.indexOf(')'); //find the indexOf first ')'
    let linksInSingleArticle = [];

    $('#mw-content-text > p > a').each((index, elem) => {
        let link = $(elem);
        if (linkIsValid(link)) {
            let i = pText.indexOf(link.text());

            if (!(i > indexOfFirstOpeningParenthesis && i < indexOfFirstClosingParenthesis)) {
                linksInSingleArticle.push(link.attr('href'));
            }
        }
    })

    if (linksInSingleArticle[0]) {
        return linksInSingleArticle[0];
    } else {
        throw new Error();
    }
}


async function fetchWithQueryString(query) {

    let queryURL = wikiAPI + encodeURIComponent(query);
    let returnURL = null;

    try {
        let response = await axios.get(queryURL);
        let newLink = response.data[3][0];

        if (!newLink) {
            console.log('\nCan\'t find anything, sorry :D\n');
            process.exit(0);
        }

        return decodeURIComponent(newLink);

    } catch (e) {
        console.log('########## ERROR ##########');
        console.log(e);
        process.exit(0);
    }
}


async function fetchRandomArticle() {
    let newLink;

    try {
        let response = await axios.get(randomURL);
        newLink = response.data.query.random[0].title;

        if (!newLink) {
            console.log('no link found :/');
            process.exit(0);
        }

        return decodeURIComponent(newLink);

    } catch (e) {
        console.log('########## ERROR ##########');
        console.log(e);
        process.exit(0);
    }
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/* FILTERS */


//takes a link (cheerio element) as input and returns true if it's valid, false otherwise
function linkIsValid(link) {

    const linkText = link.text();
    const linkHref = link.attr('href');

    if(!linkText.match(/^\[/) && //filter out all remarks like "[1]"
        linkHref.startsWith('/wiki/') && //check that links are valid articles and not e.g. scripts
        !linkText.match(/^\d+$/) && //filter out years
        // !linkHref.match(/^\/wiki\/\d+\..+kuuta/) && //filter out dates
        !linkHref.match(/^\/wiki\/File:/) && //filter out files
        !linkHref.match(/^\/wiki\/Wikipedia:/) && //filter out whatever utility links these are
        !linkHref.match(/^\/wiki\/Special:/) && //filter out actions
        !linkHref.match(/^\/wiki\/Template_talk:/) &&
        !linkHref.match(/^\/wiki\/Portal:/) &&
        !linkHref.match(/^\/wiki\/Main_Page:/) &&
        !linkHref.match(/^\/wiki\/Category:/) &&
        !linkHref.match(/^\/wiki\/Help:/)
    ) {

        return true;
    }
    return false;
}


//takes a search string and returns true if it's valid, false otherwise
function validateURL(url) {
    if (url.match(/en.wikipedia.org\/wiki\//) &&
        !url.match(/en.wikipedia.org\/wiki\/Main_Page/) &&
        !url.match(/en.wikipedia.org\/wiki\/Portal:/) &&
        !url.match(/en.wikipedia.org\/wiki\/Category:/) &&
        !url.match(/en.wikipedia.org\/wiki\/File:/) &&
        !url.match(/en.wikipedia.org\/wiki\/Template_talk:/) &&
        !url.match(/en.wikipedia.org\/wiki\/Special:/) &&
        !url.match(/en.wikipedia.org\/wiki\/Help:/) &&
        !url.match(/en.wikipedia.org\/wiki\/Wikipedia:/)
    ) {

        return true;
    }
    return false;
}
