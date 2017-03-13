const cheerio = require('cheerio');
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
})

/*
console.log('Pelataan Wikipedia-peliä!');
console.log('Syötä mikä vaan suomenkielinen wikipedia-artikkeli (koko url):');
*/

/*
rl.prompt();

rl.on('line', (line) => {
    console.log('lol kirjoitit että ' + line + ' :D');
    rl.close();
}).on('close', () => {
    process.exit(0);
})
*/


let testURL = 'https://fi.wikipedia.org/wiki/Tieto';

axios.get(testURL)
.then(response => {
    console.log(response.data);
    console.log();
    let $ = cheerio.load(response.data);
    console.log($('.firstHeading').text());
    console.log($('#mw-content-text').text());
})
.catch(err => {
    console.error(error);
})



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
