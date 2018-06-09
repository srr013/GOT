const socket = io();
let USERDATA = {index:-1, alias:'', code:''};
let STORE = sessionStorage;
let GAME = {};
setUserData();

function sendMessage(message, data){
    socket.emit(message, data);
    }

$('form').submit(function(){
    console.log("submitting");
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

$(function () {
    if (document.URL.includes('#game')) {
      GAME = JSON.parse(STORE.game);
      let i = 0;
      let map = document.getElementById('gameboard');
      while (i < GAME.gameObj.map.length){
        let j = 0;
        while (j < GAME.gameObj.map[i].length){
          map.appendChild(createSquare(GAME.gameObj.map,i,j));
          j++;
        }
      i++;
      }
    }
});

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
    });

socket.on('open game', (data) => {
  let x = STORE.setItem("game",JSON.stringify(data));
  window.location = "/games/"+data.gameObj.gameId+"#game"
});
socket.on('userIndex', (data)=>{
  console.log("setting index from server", data)
  STORE.setItem("userIndex", data);
  USERDATA.index = data;
})

function setUserData(){
  if (USERDATA.index > 0){
    document.getElementById("loginForm").style.display = 'none';
  } else if (STORE.getItem("userIndex") != null){
    console.log("retrieving index from store" ,STORE.getItem("userIndex"));
    USERDATA.index = STORE.getItem("userIndex");
    document.getElementById("loginForm").style.display = 'none';
  }
}

//this takes over login form submission and sends a socket message with form data
window.addEventListener("load", function () {
  function sendData() {
    USERDATA.displayname = form.elements['displayname'].value;
    USERDATA.authcode = form.elements['authcode'].value;
    let data = {displayname: USERDATA.displayname, authcode: USERDATA.authcode};
    console.log("login form data", data);
    socket.emit('login', data);
  }
  var form = document.getElementById("loginForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.style.display = 'none';
    sendData();
  });
});

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
)


}

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
            socket.emit('object update', GAME.map[i]);
        }
        i++;
    }
};

//Client receives square object update and logs it to GAME_BOARD, replacing previous object.
//calls update to the DOM
socket.on('object update', (object) => {
    console.log("client update received", object);
    GAME.gameObj.map[object.index] = object;
    updateDOMFromSquareObject(object);
});

//Takes an object in and updates the object's DOM. Perhaps can use this in createSquare as well.
function updateDOMFromSquareObject(object){
    console.log("updating DOM", object);
    let square = document.getElementById(object.id);
    square.style.backgroundColor = 'blue';
}


function createSquare(data,i,j){
    let square = document.createElement('div');
    let centerTitle = document.createElement('p');
    centerTitle.classList.add("centeronsquare")
    let topLeft = document.createElement('p');
    topLeft.classList.add("topleftonsquare");
    let bottomRight = document.createElement('p');
    bottomRight.classList.add("bottomleftonsquare");
    square.classList.add('square');
    square.appendChild(centerTitle);
    square.appendChild(topLeft);
    square.appendChild(bottomRight);
    square.style.height = (.99/data.length)*100+'%';
    square.style.width = (.97/data[i].length)*100+'%';
    square.style.border = '.05rem solid black';

    let squ = data[i][j];
    square.setAttribute("id", squ.id);
    if (squ.terrain == 0){
        square.style.backgroundColor = 'blue';
    } else{
        square.style.backgroundColor = 'green';
    };
    if (squ.castle == 'C'){
        centerTitle.textContent = 'Castle';
    } else if (squ.castle == 'S'){
        centerTitle.textContent = 'Stronghold';
    };
    if (squ.bonus != ''){
        bottomRight.textContent = squ.bonus;
    }

    square.addEventListener('click', updateSquObject);

    return square;
}
