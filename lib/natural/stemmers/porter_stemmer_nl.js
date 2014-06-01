/*
Copyright (c) 2014, Martijn de Boer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* Dutch is a hard language with a lot of exceptions.
   And I'm not really an NLP expert neither.

   There are some words not covered by the stemming algorithm implemented.
   Lidstaten should stem as Lidstat, but in reality it should become Lidstaat.
   These words are exception rules in dutch and as such hard to stem using logic
   only. Used this as a resource:
   http://snowball.tartarus.org/algorithms/dutch/stemmer.html and some inspiration
   from the NLTK class DutchStemmer */

var Stemmer = require('./stemmer_nl');
var sr1,sr2; // hold modified r1r2

/* Left some Frisian diacrytics in here for dutch/frisian dual writers. */
function normalize(token) {

    var r = token.toLowerCase();

    r = r.replace(new RegExp(/[àáâä]/g), "a");
    r = r.replace(new RegExp(/[èéêë]/g), "e");
    r = r.replace(new RegExp(/[ìíîï]/g), "i");
    r = r.replace(new RegExp(/[òóôö]/g), "o");
    r = r.replace(new RegExp(/[ùúûü]/g), "u");

    return r;

}

function isVowel(char) {

    return (['a','à','á','â','ä','e','è','é','ê','ë','i','ì','í','î','ï','o','ò','ó','ô','ö','u','ù','ú','û','ü','y'].indexOf(char) >= 0);

}

function getR1R2(word) {

    var r1 = '';
    var r2 = '';

    for ( var i = 1; i < word.length; i++) {

        if (!isVowel(word.charAt(i)) && isVowel(word.charAt(i-1))) {
            if (i < word.length-3) {
                r1 = word.substring(i);
            } else if (r1.length < 4) {
                r1 = word.substring(word.length-3);
            }
        }
    }

    for ( var i = 1; i < r1.length; i++) {
        if (!isVowel(r1.charAt(i)) && isVowel(r1.charAt(i-1))) {
            r2 = r1.substring(i);
        }
    }

    return {'r1': r1, 'r2': r2};
}

function step1(token) {

    if (PorterStemmer.stopwords.words.indexOf(token) >= 0) {
        return token;
    }

    var word = normalize(token);
    var r1r2 = getR1R2(word);
    sr1 = r1r2.r1;
    sr2 = r1r2.r1;

    if (word.substring(word.length-5) == 'heden') {
        word = word.substring(0,word.length-5) + 'heid';
        sr1 = sr1.substring(0,sr1.length-5) + 'heid';

        if (sr2.length >=5 && sr2.substring(r2.length-5) == 'heden') {
            sr2 = sr2.substring(0, sr2.length-5) + 'heid';
        }
    } else
    if (word.substring(word.length-3) == 'ene' &&
        !isVowel(word.charAt(word.length-4))) {
        word = word.substring(0,word.length-3);
        sr1 = sr1.substring(0,sr1.length-3);
        if (sr2.length >=3 && sr2.substring(word.length-3)) {
            sr2 = sr2.substring(0,word.length-3);
        }

        if (word.substring(word.length-2).indexOf(['kk','dd','tt']) >= 0) {
            word = word.substring(0,word.length-1);
        }
        if (sr1.substring(sr1.length-2).indexOf(['kk','dd','tt']) >= 0) {
            sr1 = sr1.substring(0,sr1.length-1);
        }
        if (sr2.substring(sr2.length-2).indexOf(['kk','dd','tt']) >= 0) {
            sr2 = sr2.substring(0,sr2.length-1);
        }
    } else
    if (word.substring(word.length-2) == 'en' &&
        !isVowel(word.charAt(word.length-3))) {
        word = word.substring(0,word.length-2);
        sr1 = sr1.substring(0,sr1.length-2);
        if (sr2.length >=2 && sr2.substring(word.length-2) == 'en') {
            sr2 = sr2.substring(0,word.length-2);
        }

        if (word.substring(word.length-2).indexOf(['kk','dd','tt']) >= 0) {
            word = word.substring(0,word.length-1);
        }
        if (sr1.substring(sr1.length-2).indexOf(['kk','dd','tt']) >= 0) {
            sr1 = sr1.substring(0,sr1.length-1);
        }
        if (sr2.substring(sr2.length-2).indexOf(['kk','dd','tt']) >= 0) {
            sr2 = sr2.substring(0,sr2.length-1);
        }
    }

    return word;

}

function step2(token) {

    return token;

}

function step3(token) {

    return token;

}

function step3a(token) {

    return token;

}

function step3b(token) {

    return token;

}

function step4(token) {

    return token;

}

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;

// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
    return step4(step3(step2(step1(token.toLowerCase())))).toString();
};

console.log(step1('lichtverontreinigde'),'lichtverontreinigd');
console.log(step1('lichthoeveelheid'),'lichthoevel');
console.log(step1('lichthoeveelheden'),'lichthoeveelheid');
console.log(step1('opgingen'),'opging');
console.log(step1('ophaaldienst'),'ophaaldienst');
console.log(step1('lichtdoorlatende'),'lichtdoorlat');
