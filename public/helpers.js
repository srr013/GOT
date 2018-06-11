//Takes in an object and an array of key/value pairs built as arrays.
//KV should be the key/value pairs that change. This function will trigger when the user deselects the square during the Orders/Action placement phase.
function updateSquObject(event, obj, ...kv){
    console.log("updating object");
    let squareID = arguments[0].target.id;
    //update the square object and send it to the server
    let i = 0;
    while (i < GAME.gameObj.map.length){
        if (GAME.gameObj.map[i].id == squareID){
            //update square object
            GAME.gameObj.map[i].terrain = 0;
            socket.emit('object update', GAME.gameobj.map[i]);
        }
        i++;
    }
};

//Takes an object in and updates the object's DOM. Perhaps can use this in createSquare as well.
function updateDOMFromSquareObject(object){
    console.log("updating DOM", object);
    let square = document.getElementById(object.id);
    square.style.backgroundColor = 'blue';
}

function toggleMenu(x){
   let list = Array.from(x.children);
    if (list[0].style.display == 'none'){
        list.forEach(y => {
            y.style.display = 'block';
        })
    } else{
        list.forEach(y => {
            y.style.display = 'none';
        });
    }
};

function toggleGameList(){
  let gameList = document.getElementById("gamelist");
  USERDATA.forEach((game) => {
    let g = document.createElement('div');
    g.addEventListener('click', function(){
      sendMessage('load game',game.gameId);
    });
    g.textContent = game.gameId;
    gameList.appendChild(g);
  }
)};
