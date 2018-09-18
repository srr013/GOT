const socket = io();
let USERDATA = {};
let STORE = sessionStorage;
let GAME = '';
let MAP = '';
let PLAYER = '';
let PLAYERS = '';
let POPUP = '';
let DATA_TO_SEND = [];
let SELECTEDELEMENT = '';

//These run on load
$(function () {
  $.getJSON("/api/user_data", function(data) {
    console.log("API data:",data);
      if (data.hasOwnProperty('userid')) {
          USERDATA = data;
          data.games.forEach((game) => {
            if (game != null){
              $('#gamelist').append("<li><a href=/games/"+game+">"+game+"</li>");
            }
          });
      }else{
        $('.userdataform').css('display', 'block');
        $('.mainmenu').css('display', 'none');
      }
  }).then(function(response){
    if (USERDATA.userid == ''){
      console.log("userdata is blank?", USERDATA.userid)
        $('.userdataform').css('display', 'block');
        $('.mainmenu').css('display', 'none');
      }else{
        if (!USERDATA.gameid){
          //Need to fetch the gameID from the web address
          let parser = document.createElement('a');
          parser.href = document.URL;
          let gameid = parser.pathname.replace(/\/games\//g,'');
          gameid = gameid.replace(/\W/g,'');
          USERDATA.gameid = gameid;
          console.log("Game ID", gameid)
        }
        console.log('getting game data ', USERDATA);
        sendMessage('load game',USERDATA);
      }
    }, function(error){
      return error;
      }
)
});
$(function(){
  if (document.URL.includes('games')) {
    $('.mainmenu').css('display', 'none');
    }
  });

//Open game navigates to the game page
socket.on('open game', (data) => {
  console.log("opening game", data);
  window.location = "/games/"+data.gameObj.gameId
});
//Load game loads the map
socket.on("load game", ([game,playerData,map]) => {
  console.log("Loading game",game,map, playerData);
  GAME = game;
  if (map){
      MAP = map;
  }
  PLAYERS = playerData;
  let i = 0;
  let letters = ['A','B','C','D','E','F','G','H','I','J'];
  let gameboard = document.getElementById('gameboard');
  for (index in map){
      let s = 'column'+letters[i];
      let j = 0;
      if (s in map){
        while (j < map[s].length){
          gameboard.appendChild(createSquare(map,letters[i],j));
          j++;
        }
      }
    i++;
    }
  if (playerData.length == game.gameRounds.numPlayers){
    loadPlayers(playerData);
    getUserPlayer();
    validationDisplay();
  }
});

socket.on('object update', ([game, playerData,map]) => {
    console.log("client update received", game, playerData);
    GAME = game;
    if (map){
        MAP = map;
    }
    PLAYERS = playerData;
    loadPlayers(playerData);
    getUserPlayer();
    validationDisplay();
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

function joinGame(){
let gameID = $('#gameIDtoLoad').val();
sendMessage('open game', [USERDATA,gameID]);

}

function submitTurn(){
  //console.log("Player",PLAYER.object.orders);
  //do some validation here?
  PLAYER.object.ready = true;
  sendMessage('submit turn', PLAYER);
}





//////// UTILITY FUNCTIONS ///////////////
function sendMessage(message, data){
    console.log("sending message")
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
      sendMessage('load game',game.gameId, USERDATA.userid);
    });
    g.textContent = game.gameId;
    gameList.appendChild(g);
  }
)};

function toggleGameIDEntry(){
  $('.gameIDEntry').css('display','inline');
}

function getSquareObjFromID(id){
  let row = id[0];
  return eval("MAP.column"+row+'[id[1]-1]');
}


///////////////DISPLAY/DOM HANDLERS////////////////
function validationDisplay(){
  let display = '';
  if (GAME.gameObj.phase == 'start' || GAME.gameObj.phase == 'ordering'){
    display = orderValidation();
  }
  if (display == false){
    console.log("order validation failed");//not working
    return false;
  }else{
    $('#validation').text('Available Orders: '+ display);
  }
}

function orderValidation(){
  let orders = ['Move','Move','Move*', 'Support','Support','Support*', 'Raid','Raid','Raid*', 'Defense','Defense','Defense*', 'Consolidate Power','Consolidate Power','Consolidate Power*'];
  PLAYER.object.orders.forEach((order)=>{
    if (order.name != null){
      if (order.star == true){
        if (orders.indexOf(order.name+'*') == -1){
          return false;
        }else{
          orders.splice(orders.indexOf(order.name+'*'),1);
        }
      }else{
        if (orders.indexOf(order.name) == -1){
          return false;
        }else{
          orders.splice(orders.indexOf(order.name),1);
        }
      }
    }
  })
  return orders;
}

function toggleOrderFormOptions(square){
  //console.log("here",$('#popup > form > select').val());
  if ($('#popup > form > select').val() == '1'){//move
    addMoveElements(square);
  }else if($('#popup > form > select').val() == '3'){//move
    addRaidElements(square);
  }
}

//Takes in an object and an array of key/value pairs built as arrays.
//KV should be the key/value pairs that change. This function will trigger when the user deselects the square during the Orders/Action placement phase.
function playerOwnsSquare(player,squareID){
  let owned = false;
  player.object.ownedSquares.forEach((s)=>{
    if (s.id == squareID){
      owned = true;
    }
  })
  return owned;
}

function selectSquObject(event, obj, ...kv){
  let square = arguments[0].target.id;
  if (!arguments[0].target.id){
    square = arguments[0].target.parentElement.id;
  }
  if ((GAME.gameObj.phase == 'ordering' || GAME.gameObj.phase == 'start') && square.length == 2){
      if (POPUP == '' && playerOwnsSquare(PLAYER,square)){
        let popupForm = createSquarePopup(square);
        $('#'+square).append(popupForm);
        getOrderList();
        POPUP = dragElement(document.getElementById('popup'));
      }
      else if(SELECTEDELEMENT != ''){ //this will break if square IDs become 3 digits
        updatePopUp(square);
      }else{
        console.log("idk");
      }
    }
};
function removePopUp(){
  $("#popup").remove();
  POPUP = '';
}
//Takes an object in and updates the object's DOM. Perhaps can use this in createSquare as well.
function updateDOMFromSquareObject(object){
    console.log("updating DOM", object);
    let square = document.getElementById(object.id);
    //square.style.backgroundColor = 'blue';
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
    if (squ.port){
      subTitle.textContent += ', Port';
    }
    square.addEventListener('click', selectSquObject);
    return square;
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;


  function dragMouseDown(e) {
    e = e || window.event;
    //e.preventDefault();
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
    //e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    document.onmouseup = null;
  }
  function closeDragElement(e) {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    e.stopPropagation();
  }
  return elmnt;
}

function saveOrder(element){
  //get the values from the HTML elements and store them
  let type = $('#popup > form > select').val();
  let order = {};
  let name = (type == 1) ? 'Move': (type == 2) ? 'Support' : (type == 3) ? 'Raid' : (type == 4) ? 'Defense' : (type == 5) ? 'Consolidate Power' : null;
  let star = ($('#usestar').prop('checked') == false) ? false : true;

  if ( type == '1'){//move
    let selections = $('#orderForm-conditionals input[type=button]').toArray();
    let destinations = [];
    console.log("star",($('#usestar').prop('checked') == false), $('#usestar').prop('checked'))
    if (!PLAYER){
      getUserPlayer();
    }
    selections.forEach((d)=>{
      destinations.push([
        d.name,
        d.value,
        $('#attack'+d.id.charAt(d.id.length-1)).prop('checked')
      ])
    })
      order = {
        id: $('#popup').parent().attr("id"),
        type: type,
        name: name,
        star: star,
        picktoken: ($('#picktoken').prop('checked') == undefined || $('#picktoken').prop('checked') == false ) ? false : true,
        destinations:destinations,
        priority: 1,
      }
  }else if (type == '3'){ //raid
    //console.log("raidpri",$('#raidpriority').val());
    order = {
      id: $('#popup').parent().attr("id"),
      type: type,
      name: name,
      star: star,
      preference: $('#raidpriority:selected').val(),
      priority: 1,
    }
  }else {
    order = {
      id: $('#popup').parent().attr("id"),
      type: type,
      name: name,
      star: star,
      priority: 1,
    }
  }
  if (validationDisplay() != false){
    let overwrite = false
    let i = 0;
    PLAYER.object.orders.forEach((o)=> {
      if (o.id == order.id){
        PLAYER.object.orders.splice(i,1,order);
        overwrite = true;
      } i++;
    })
    if (!overwrite){
      PLAYER.object.orders.push(order);
    }
      console.log("Orders:",PLAYER.object.orders);
    removePopUp();
  }else{
    $('#messages').append($('<li>').text('No orders remaining of that type. Remove order from another square before placing.'));
  }
}

function loadPlayers(players){
  clearUnits();
  console.log("loadPlayers", players);
  players.forEach((player) =>{
    let object = player.object;
    highlightOwnedSquares(object);
    placeUnits(player);
  });
};

function getUserPlayer(){
  let player = '';
  if (PLAYERS){
    PLAYERS.forEach((p)=>{
      if (p.user == USERDATA.userid){
        PLAYER = p;
      }
    })
  }else{
    console.log("error - no Player data")
  }
  return player;
}

function clearUnits(){
  for (let column in MAP){
    if (typeof MAP[column] == 'object'){
      MAP[column].forEach((square)=>{
        $('#'+square.id+' p.bottomonsquare').text('');
      })
    }
  }
}

function placeUnits(player){
  for (let unit in player.object.units){
    player.object.units[unit].forEach((u)=>{
      let unitText = $('#'+u+' p.bottomonsquare').text();
      unitText = unitText +" "+ unit;
      $('#'+u+' p.bottomonsquare').text(unitText);
    })
  }
};

function highlightOwnedSquares(player){
  let color = '';
  //console.log("Hightlighting", player);
  (player.house == 'Lannister') ? color = 'rgba(180,0,0,.8)' :
  (player.house == 'Baratheon') ? color = 'rgba(255,215,0,.8)' :
  (player.house == 'Stark') ? color = 'rgba(255,255,255,.8)' : color = 'green'
  player.ownedSquares.forEach((square) =>{
    let bg = getSquareObjFromID(square.id);
  //  console.log(bg);
    if (bg.terrain == 1){
    $('#'+square.id).css("background",'linear-gradient(30deg, '+color+',green 40%)')
  }else{
    $('#'+square.id).css("background",'linear-gradient(30deg, '+color+' ,blue 40%)')
    }
  });
};

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
function createSquarePopup(square){
  let html = [
    '<div id="popup" class="popup">',
        '<form class="popup-form">',
        'Order:<br>',
        '<select id="orderSelect" onchange="toggleOrderFormOptions('+square+')">',
          '<option value="0">No Action</option>',
        '</select>',
        '<div id="orderForm-conditionals"></div>',
        '<input type="button" value="Save" onclick="saveOrder()">',
        '<input type="button" value="Cancel" onclick="removePopUp()">',
        '</form>',
    '</div>'
  ].join("\n");

  return html;
}
function getOrderList(){
  if ($(validation).text().indexOf('Move') != -1){
  $('#orderSelect').append('<option id="Move" value="1">Move</option>')
  }
  if ($(validation).text().indexOf('Support') != -1){
  $('#orderSelect').append('<option id="Support" value="2">Support</option>')
  }
  if ($(validation).text().indexOf('Raid') != -1){
  $('#orderSelect').append('<option id="Raid" value="3">Raid</option>')
  }
  if ($(validation).text().indexOf('Defense') != -1){
  $('#orderSelect').append('<option id="Defense" value="4">Defense</option>')
  }
  if ($(validation).text().indexOf('Consolidate Power') != -1){
  $('#orderSelect').append('<option id="ConsolidatePower" value="5">Consolidate Power</option>')
  }
}


function addMoveElements(square){
  //What about priority??
    let useStar = 'Use Star? <input id="usestar" type="checkbox" name="Use Star?">';
    let moveAll = 'Move all to same square? <input type="checkbox" name="Move All?" checked="checked"><br>';
    let elementList = [useStar, moveAll];
    let i = 0;
    //console.log(PLAYER);
    for (let unit in PLAYER.object.units){
      PLAYER.object.units[unit].forEach((u)=>{
        if (u==square.id){
          if ( unit != "Token"){
            let move = '<p>'+unit+': '+'</p>';
            let destination = '<input type=button id='+unit+i+' onclick="setElement('+unit+i+')" name='+unit+' value= "Select a Destination">';
            let attack = 'Attack? <input id=attack'+i+' type="checkbox" name="Attack?" checked><br>';
            elementList.push(move,destination, attack);
            i++;
          }else{
            if (i >=0){
              let token =  '<p>'+unit+': '+'</p>'
              elementList.push(token);
              }
            }
          }
      })
    }
    let token = '';
//    console.log("hastoken?",square, PLAYER.object.units['Token']);
    if (getSquareObjFromID(square.id).terrain == 1){
      if (PLAYER.object.units['Token'].indexOf(square.id) == -1){
        token = 'Drop token to retain square? <input id=droptoken type="checkbox" checked><br>';
      }else{
        token = 'Pick up Token? <input id=picktoken type="checkbox" name="PickUp?"><br>';
      }
    }
    elementList.push(token);
    elementList.forEach((e)=>{
      $('#orderForm-conditionals').append(e);
    });
    getAcceptableSquares(square.id);
}

function addRaidElements(square){
  let priority = [
    'Priority: <select id=raidpriority>',
      '<option value="2">Support</option>',
      '<option value="5">Consolidate Power</option>',
      '<option value="3">Raid</option>',
      '<option value="4">Defense (Requires Bonus)</option>',
    '</select>'].join("\n");
    $('#orderForm-conditionals').append(priority);
}



function setElement(elementID){
  SELECTEDELEMENT = elementID.id;
}

ACCEPTABLESQUARES = [];
function updatePopUp(square, unit){
  //check to see if square is valid
  console.log("unit", unit)
  if (square){
    let parentSquareID = $('#popup').parent().attr("id");
    if (ACCEPTABLESQUARES.indexOf(square)!= -1){
      //Update text
      if ($('#popup > form > select').val() == 1 && square){
        if ($('input[name="Move All?"]').css("checked", "checked")){
          //update all the units in square
          //console.log(SELECTEDELEMENT);
          let selections = $('#orderForm-conditionals input[type=button]').toArray();
          selections.forEach((s) =>{
            console.log(s, s.id);
            $('#'+s.id).val(square);
          })
        }else{
          $('#'+SELECTEDELEMENT).val(square)
        }
        SELECTEDELEMENT = '';
      }
      //raid
    }
  }
}

function getAcceptableSquares(squareID, originID, shipsTested){
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
  if (!originID){
    ACCEPTABLESQUARES = [];
    originID = squareID;
    shipsTested = [];
  }
  let isLand = (getSquareObjFromID(originID).terrain == 1) ? true: false;
  let newTerrain = false;
  squares.forEach((s) => {
    let destination = getSquareObjFromID(s);
    //From water to port - land terrain can be a port. Comes from Map. Ports allow a second move on a square w/ some exclusions. Ships can move into and out of ports.
    //From port to water ^
    if (destination != undefined){
      if (isLand){
        if (destination.terrain == 1){
          if (ACCEPTABLESQUARES.indexOf(destination.id) == -1
          && destination.id != originID){
            ACCEPTABLESQUARES.push(destination.id);
            newTerrain = true;
          }
      }else{
        PLAYER.object.units.Ship.forEach((ship) =>{
          if (destination.id == ship
            && shipsTested.indexOf(ship) == -1){
            shipsTested.push(ship)
            getAcceptableSquares(ship, originID, shipsTested);
            }
        })
      }
    }else if (!isLand){
      if (destination.terrain == 0){
        if (ACCEPTABLESQUARES.indexOf(destination.id) == -1
        && destination.id != originID){
          ACCEPTABLESQUARES.push(destination.id);
          }
        }
      }
    }
  })
}
