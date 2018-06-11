const socket = io();
let USER = {};
let STORE = sessionStorage;
let GAME = '';
let POPUP = '';
let DATA_TO_SEND = [];


//Navigation to game page
socket.on('open game', (data) => {
  let x = STORE.setItem("game",JSON.stringify(data));
  window.location = "/games/"+data.gameObj.gameId+"#game"
});


$(function () {
  $.getJSON("api/user_data", function(data) {
      console.log("Fetching user", data);
      if (data.hasOwnProperty('userid')) {
          USER = data;
      }else{
        $('.userdataform').css('display', 'block');
      }
  });
    if (USER.userid == ''){
        window.location = "/";
    }else{
      if (document.URL.includes('#game')) {
        GAME = JSON.parse(STORE.game);
        console.log("loading game", GAME);
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
      highlightOwnedSquares();
      }
    }
});



socket.on('userIndex', (data)=>{
  console.log("setting index from server", data)
  STORE.setItem("userIndex", data);
  USERDATA.index = data;
})
//Client receives square object update and logs it to GAME_BOARD, replacing previous object.
socket.on('object update', (object) => {
    console.log("client update received", object);
    GAME = object;
    //updateDOMFromSquareObject(object);
});

//Chat submission and appending to div
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
    });

$('#chatform').submit(function(){
    console.log("submitting");
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

/////////////////// LOGIN HANDLING ////////////////////
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

//this takes over login form submission and sends a socket message with form data
//window.addEventListener("load", function () {
  // function sendUserData() {
  //   USERDATA.displayname = form.elements['displayname'].value;
  //   USERDATA.authcode = form.elements['authcode'].value;
  //   let data = {displayname: USERDATA.displayname, authcode: USERDATA.authcode};
  //   console.log("login form data", data);
  //   socket.emit('login', data);
  // }
//   var form = document.getElementById("loginForm");
//   form.addEventListener("submit", function (event) {
//     event.preventDefault();
//     form.style.display = 'none';
//     sendUserData();
//   });
// });

// function setUserData(){
//   if (USERDATA.index > 0){
//     document.getElementById("loginForm").style.display = 'none';
//   } else if (STORE.getItem("userIndex") != null){
//     console.log("retrieving index from store" ,STORE.getItem("userIndex"));
//     USERDATA.index = STORE.getItem("userIndex");
//     document.getElementById("loginForm").style.display = 'none';
//   }
// }

///////// GAMEPLAY /////////

function submitTurn(){
  sendMessage('submit turn', GAME);
}





//////// UTILITY FUNCTIONS ///////////////
function sendMessage(message, data){
    socket.emit(message, data);
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

function getSquareObjFromID(id){
  let row = id.charCodeAt(0) - 65;
  console.log(row);
  return GAME.gameObj.map[row][id[1]-1];
}


///////////////DISPLAY/DOM HANDLERS////////////////

//Takes in an object and an array of key/value pairs built as arrays.
//KV should be the key/value pairs that change. This function will trigger when the user deselects the square during the Orders/Action placement phase.
function selectSquObject(event, obj, ...kv){
    let square = arguments[0].target;
    let board = GAME.gameObj.map;
    //update the square object and send it to the server
    let i = 0;
    let j = 0
    let selectedSquare = '';
    while (i < board.length){
      while (j < board[i].length){
        if (board[i][j].id == square.id){
            selectedSquare = board[i][j];
        }
        j++;
      }
    i++;
    }
    if (GAME.gameObj.gameVariables.phase == 'actionRound'){
      if (POPUP == ''){
        let popupForm = createSquarePopup(selectedSquare);
        $(square).append(popupForm);
        dragElement(document.getElementById('popup'));
        POPUP = $('#popup');
      }
      // else{
      //   $(POPUP).remove();
      //   POPUP = '';
      //   return selectedSquare;
      // }
    }
};
//Takes an object in and updates the object's DOM. Perhaps can use this in createSquare as well.
function updateDOMFromSquareObject(object){
    console.log("updating DOM", object);
    let square = document.getElementById(object.id);
    square.style.backgroundColor = 'blue';
}
function createSquare(data,i,j){
    let square = document.createElement('div');
    let squareID = document.createElement('p');
    squareID.classList.add("idonsquare");
    let centerTitle = document.createElement('p');
    centerTitle.classList.add("topcenteronsquare")
    let subTitle = document.createElement('p');
    subTitle.classList.add("uppercenteronsquare");
    let bottomText = document.createElement('p');
    bottomText.classList.add("bottomonsquare");
    square.classList.add('square');
    $(square).append(squareID, centerTitle, subTitle, bottomText);
    //square.style.height = (.99/data.length)*100+'%';
    //square.style.width = (.97/data[i].length)*100+'%';

    let squ = data[i][j];
    square.setAttribute("id", squ.id);
    squareID.textContent = squ.id;
    if (squ.terrain == 0){
        square.style.backgroundColor = 'blue';
    } else{
        square.style.backgroundColor = 'green';
    };
    if (squ.castle == 'C'){
        centerTitle.textContent ='Castle';
    } else if (squ.castle == 'S'){
        centerTitle.textContent = 'Stronghold';
    }
    if (squ.bonus != ''){
      let supply = (squ.bonus.match(/S/g) || []).length;
      let power = (squ.bonus.match(/P/g) || []).length;
      if (supply > 0 && power == 0){
        subTitle.textContent = 'Supply: '+ supply;
      }else if (power > 0 && supply == 0){
        subTitle.textContent = 'Power: '+ power;
      }else if(supply >0 && power>0){
        subTitle.textContent = 'Supply: '+ supply+', '+ 'Power: '+power;
      }
    }
    if (squ.units.footman > 0){
      if (squ.units.footman > 1){
        bottomText.textContent = squ.units.footman + " Footmen\n";
      }else{
        bottomText.textContent = squ.units.footman + " Footman\n";
    }
  }
  if (squ.units.knight > 0){
      if (squ.units.footman > 1){
        bottomText.textContent += squ.units.knight + " Knights\n";
      }else{
        bottomText.textContent += squ.units.knight + " Knight\n";
        }
  }
  if (squ.units.siege > 0){
        bottomText.textContent += squ.units.siege + " Siege\n";
  }
  if (squ.units.ship > 0){
    if (squ.units.ship > 1){
      bottomText.textContent = squ.units.ship + " Ships\n";
  }else{
    bottomText.textContent = squ.units.ship + " Ship\n";
    }
  }
  if (squ.units.token > 0){
        bottomText.textContent += '1 Token\n';
      }

    square.addEventListener('click', selectSquObject);

    return square;
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id)) {
    document.getElementById(elmnt.id).onmousedown = dragMouseDown;
  } else {

    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    e.stopPropagation();
  }

  function elementDrag(e) {
    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement(e) {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    e.stopPropagation();
  }
}

function highlightOwnedSquares(){
  let color = '';
  GAME.gameObj.players.forEach((player) =>{
    (player.house == 'Lannister') ? color = 'rgba(180,0,0,.8)' :
    (player.house == 'Boratheon') ? color = 'mustard' :
    (player.house == 'Stark') ? color = 'grey' : color = 'green'

    player.ownedSquares.forEach((square) =>{
      let bg = getSquareObjFromID(square);
      console.log(bg);
      if (bg.terrain == 1){
      $('#'+square).css("background",'linear-gradient(30deg, '+color+',green 30%)')
    }else{
      $('#'+square).css("background",'linear-gradient(30deg, '+color+' ,blue 50%)')
      }
    });
  });
}

///////////////////HTML STRING BUILDERS///////////////
function createSquarePopup(selectedSquare){
  let html = [
    '<div id="popup" class="popup">',
        '<form class="popup-form">',
        'First name:<br>',
        '<input type="text" name="firstname"', 'value="Mickey"><br>',
        'Last name:<br>',
        '<input type="text" name="lastname"', 'value="Mouse"><br><br>',
        '<input type="submit" value="Submit">',
        '</form>',
    '</div>'
  ].join("\n");
  console.log("pop-up created", selectedSquare);
  return html;
}
