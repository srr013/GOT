'use strict';

class Card{
  constructor(obj, type){
    console.log("Card Obj", obj);
    if (type == 'House'){
      this.name = obj.name;
      this.strength = obj.strength;
      this.description = obj.description;
      this.special = obj.special;
    }
    else if(type == 'Season'){
      this.name = obj.name;
      this.strength = obj.strength;
      this.description = obj.description;
      this.special = obj.special;
      this.function = obj.function;
    }
  }
}

module.exports = Card;
