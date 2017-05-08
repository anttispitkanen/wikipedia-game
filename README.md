# Super awesome Wikipedia game :D

You probably know the Wikipedia oddity that [almost every article links eventually to Philosophy](https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy)? Now you don't have to click yourself!

The rules are simple: you start from any article and move to the first link in the main body of text that's not
* in parentheses,
* in italic,
* a year,
* a date,
* in red,
* an external link or
* a reference to the same page

...and repeat the process in the article you end up in.

You win the game if you can reach the article Philosophy. How long a path can you find?

You lose the game if you end up in a loop or a dead end (an article with no valid links).


## Installation and playing

Now you can play too in English or Finnish Wikipedia, just follow these steps (you need Node.js 7.6 or higher installed):


```
git clone https://github.com/anttispitkanen/wikipedia-game.git
```
```
cd wikipedia-game
```
```
npm install
```
For English game:
```
node english.js
```
For Finnish game:
```
node finnish.js
```
The Finnish version can also be run in older Node versions with
```
node old-finnish.js
```
Good luck and have fun!
