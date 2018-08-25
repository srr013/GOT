
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
  console.log("shuffle", array)
  return array;
}
