'use strict';
let fs = require('fs');

class Deck{
  constructor(type){
    //load a text file that corresponds with the type. Text file should contain all cards in the deck.
    this.cardList = [];
    let results = fs.readFileSync('server/Decks/'+type+'.txt','utf-8');
    console.log("loading deck",type, results)
    //the deck should be setup as a list of objects
    while (results.length < 0){
      this.cardList.append(results.shift())
    }
  }


  function shuffle(){
    //randomize card order
  }

  function drawCard(){
    //take card from [0]
  }

}
