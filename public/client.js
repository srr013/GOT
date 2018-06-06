const socket = io();
const GAME_SQUARES = []

function sendMessage(message){
    socket.emit(message);
    }

$('form').submit(function(){
    console.log("submitting");
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});
socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
    });

socket.on('new map', (data) => {
    let i = 0;
    let map = document.getElementById('gameboard');
    while (i < data.length){
        let j = 0;
        while (j < data[i].length){
            GAME_SQUARES.push(data[i][j])
            map.appendChild(createSquare(data,i,j));
            j++;
        }
        i++;
    }
    
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

//Takes in an object and an array of key/value pairs built as arrays.
function updateSquObject(event, obj, ...kv){
    console.log("updating object");
    let squareID = arguments[0].target.id;
    //update the square object and send it to the server
    let i = 0;
    while (i < GAME_SQUARES.length){
        if (GAME_SQUARES[i].id == squareID){
            //update square object
            GAME_SQUARES[i].terrain = 0;
            socket.emit('object update', GAME_SQUARES[i]); 
        }
        i++;
    }
};

//Client receives square object update and logs it to GAME_BOARD, replacing previous object.
//calls update to the DOM
socket.on('object update', (object) => {
    console.log("client update received", object);
    GAME_SQUARES[object.index] = object;
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