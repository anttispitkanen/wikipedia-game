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




// let testURL1 = 'https://fi.wikipedia.org/wiki/Tieto';
// let testURL2 = 'https://fi.wikipedia.org/wiki/Andr%C3%A9_Previn';
// let testURL3 = 'https://fi.wikipedia.org/wiki/Oikeutusteoria';
// let testURL4 = 'https://fi.wikipedia.org/wiki/Propositio';
// let testURL5 = 'https://fi.wikipedia.org/wiki/J%C3%A4knabackenin_j%C3%A4tinkirkko';
// let testURL6 = 'https://fi.wikipedia.org/wiki/Espanjan_vastarintaliike';
// let testURL7 = 'https://fi.wikipedia.org/wiki/Ealing_Studios';
// let testURL8 = 'https://fi.wikipedia.org/wiki/Adolf_Hitler';
// let testURL9 = 'https://fi.wikipedia.org/wiki/Enemmist%C3%B6_(%C3%A4%C3%A4nestys)';
// let testURL10 = 'https://fi.wikipedia.org/wiki/Julkisoikeus';
// let testURL11 = 'https://fi.wikipedia.org/wiki/Anna_Abreu';


//let links = [testURL1];
//let numOfPagesVisited = 0;


/*
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
            console.log(`it took ${count} steps to get from ${startURL} to ${currentURL}`);
        } else {
            console.log(`woops! ${currentURL} started a loop!`);
        }

        process.exit(0);
    }
)
*/

/*
axios.get(nextLink)
.then(response => {
    numOfPagesVisited++;
    console.log(`visited ${numOfPagesVisited} pages`);

    let $ = cheerio.load(response.data);
    console.log($('.firstHeading').text());
    //console.log($('#mw-content-text p').text());
    $('#mw-content-text p a').each((i, elem) => {
        let link = $(elem);

        //filter out all remarks like "[1]"
        if(!link.text().match(/^\[/)) {
            links.push(link);
        }
    })

    let fullURL = wikiURL + $(links[0]).attr('href');
    console.log(fullURL);
    if (fullURL === targetLink) {
        stillSearching = false;
        console.log(`From ${testURL} to Filosofia in ${numOfPagesVisited} steps!`);

    }*/  /* else {
        nextLink =
    }*/

    /*links.map(link => {
        console.log($(link).text() + ': ' + wikiURL + $(link).attr('href'));
    })*/

/*
})
.catch(err => {
    console.error(error);
    stillSearching = false;
})
*/




/*
let testHTML = `
<div>
    <ul>
        <li>Jou</li>
        <li>Mään</li>
        <li>Tsikako</li>
        <li>:D</li>
    </ul>
    <p>ei tätä mutta <a href="#">TÄMÄ PITÄISI LÖYTÄÄ :D</a> eikä tätä</p>
    <p>ei tätä :P <a>entäs tämä?</a></p>

</div>
`


let $ = cheerio.load(testHTML);
let links = [];

$('div p a').each((i, elem) => {
    links.push($(elem).text());
    console.log($(elem).text());
})


console.log(links);
*/
