'use strict';

class Player{
  constructor(playernum){
    this.number: playernum;
    this.house: '??';
    this.attackDeck: '<deck object>'
    this.ready:false;
    this.orders:[];
    this.supply: 3;
    this.powerTokens: 5;
    this.castleCount: 2;
    this.strongholdCount:1;
    this.totalCastles: 3;
    this.actionQueue:[];
  }
}
