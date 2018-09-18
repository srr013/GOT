
exports.getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}

//taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/25984542
exports.shuffle = function(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

exports.getNeighbors = function(squareID){
  let letter = squareID[0];
  letter = letter.charCodeAt(0)
  let num = parseInt(squareID[1]);
  let squares = [];
  let top = (letter > 65) ? true : false;
  let bottom = (letter < 71) ? true : false;
  let left = (num > 1) ? true : false;
  let right = (num < 8) ? true : false;
  //console.log("top, bottom, left, right", top, bottom, left, right)
  if (top){
    squares.push(String.fromCharCode(letter-1)+num);
  }if (top && left){
    squares.push(String.fromCharCode(letter-1)+(num-1));
  }if (top && right){
    squares.push(String.fromCharCode(letter-1)+(num+1));
  }if (bottom){
    squares.push(String.fromCharCode(letter+1)+num);
  }if (bottom && left){
    squares.push(String.fromCharCode(letter+1)+(num-1));
  }if (bottom && right){
    squares.push(String.fromCharCode(letter+1)+(num+1));
  }if (left){
    squares.push(String.fromCharCode(letter)+(num-1));
  }if (right){
    squares.push(String.fromCharCode(letter)+(num+1));
  }
  return squares;
}
