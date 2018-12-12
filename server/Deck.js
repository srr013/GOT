'use strict';
let fs = require('fs');
let Card = require('./Card.js');

class Deck{
  constructor(filename,type){
    //load a text file that corresponds with the type. Text file should contain all cards in the deck.
    this.cardList = [];
    let results = fs.readFileSync('server/GOT/Decks/'+filename,'utf-8');
    //console.log("results", results);
    results = JSON.parse(results);
    results.forEach((card)=>{
      this.cardList.push(new Card(card, type));
    })
  }

  drawCard(){
    return this.cardList.shift();
  }

}

module.exports = Deck;
