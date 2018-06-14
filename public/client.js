const socket = io();
let USERDATA = {};
let STORE = sessionStorage;
let GAME = '';
let POPUP = '';
let DATA_TO_SEND = [];

//These run on load
$(function () {
  $.getJSON("/api/user_data", function(data) {
    console.log("API data:",data);
      if (data.hasOwnProperty('userid')) {
          USERDATA = data;
          data.games.forEach((game) => {
            console.log(game);
            if (game != null){
              $('#gamelist').append("<li><a href=/games/"+game+">"+game+"</li>");
            }
          });
      }else{
        $('.userdataform').css('display', 'block');
      }
  }).then(function(response){
    if (USERDATA.userid == ''){
        $('.userdataform').css('display', 'block');
        $('.mainmenu').css('display', 'none');
      }
    }, function(error){
      return error;
      }
)})
$(function(){
  console.log(document.URL);
  if (document.URL.includes('games')) {
    $('.mainmenu').css('display', 'none');
    if (!USERDATA.hasOwnProperty("gameid")){
      let parser = document.createElement('a');
      parser.href = document.URL;
      let gameid = parser.pathname.replace(/\/games\//g,'');
      gameid = gameid.replace(/\W/g,'');
      USERDATA.gameid = gameid;
      console.log(gameid,USERDATA)
    }
      console.log('loading game', USERDATA.gameid, USERDATA.userid);
      sendMessage('load game', String(USERDATA.gameid), String(USERDATA.userid));
    }
  });

//Open game navigates to the game page
socket.on('open game', (data) => {
  window.location = "/games/"+data.gameObj.gameId
});
//Load game loads the map
socket.on("load game", (game,map,players) => {
  console.log(game,map, players);
  let i = 1;
  let gameboard = document.getElementById('gameboard');
  for (index in map){
      let s = 'column'+i
      let j = 0;
      if (s in map){
        while (j < map[s].length){
          gameboard.appendChild(createSquare(map,i,j));
          j++;
        }
      }
    i++;
    }
  highlightOwnedSquares(players);
});


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

let logout = function(){
  STORE.removeItem('gameid');
  window.location = '/logout';
}


///////// GAMEPLAY /////////

function newGame(){
  if (USERDATA.userid == ''){
    $.getJSON("api/user_data", function(data){
        if (data.hasOwnProperty('userid')){
            USERDATA = data;
          }else{
            console.log("error getting UserID");
          }
        });
  }
  console.log("sending new game message");
  sendMessage('new game', USERDATA.userid);
}

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
  let list =
  list.forEach((game) => {
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

    let squ = data['column'+i][j];
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

function highlightOwnedSquares(players){
  let color = '';
  players.forEach((player) =>{
    (player.object.house == 'Lannister') ? color = 'rgba(180,0,0,.8)' :
    (player.object.house == 'Boratheon') ? color = 'mustard' :
    (player.object.house == 'Stark') ? color = 'grey' : color = 'green'
    player.object.ownedSquares.forEach((square) =>{
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

function toggleBottomBar(){
  if ($('#bottombar').css("height") == '0px'){
    $('#bottombar').css("height","25vh");
    $('.bottom').css("display","");
    $('#bottomgrabber').css("bottom","20vh");
    $('#bottomgrabber').css("backgroundColor", "rgba(0,0,0,.2)");
  }else{
    $('#bottombar').css("height","0px");
    $('.bottom').css("display","none");
    $('#bottomgrabber').css("bottom","0vh");
    $('#bottomgrabber').css("backgroundColor", "rgba(0,0,0,.4)");

  }
};



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
