let fs = require('fs');

exports.loadFile = function (){
    let results = fs.readFileSync('server/Map.txt','utf-8'); 
    let columns = function (data){
        let squares = data.replace(/\s/g, '|');
//squares 0|0|0|0|0|0|1|0|#|0|0|0|0|0|0|0|0|#|0|0|1,C|0|0|1|0|1|#|1|1|1|1|1|1,C|1,S|1|#|1|1,S|1|1|1|1,C|1|1|#|1|1|1|1,S|1|1|1|1,C|#|0|1|0|1|1,S|1,S|1|1|#|0|0|0|0|0|0|0|0|#|0|0|0|1,C|0|0|0|0|#|0|0|0|0|0|0|0|0|#|

        let columns = []
        let i = 0;
        let c = 65;
        objectCounter = 0;
        while (i < squares.length){
            let row = [];
            let j = 1;
            while (squares[i] != '#' && i < squares.length){
                let s = '';
                while (squares[i] != '|' && i < squares.length){
                    s += squares[i];
                    i++;
                }
                if (s != ''){
                    sObject = square(s, j, String.fromCharCode(c));
                    sObject.index = objectCounter;
                    ++objectCounter;
                    row.push(sObject);
                    j++;
                }
                i++;
                }
            if (row.length > 0){
            columns.push(row);
            }
            i++;
            c++;
        };
        return columns;
    };
    return columns(results);
};

function square(data, row, column){
    let i = 0;
    let obj = {id: column+row, index: 0, terrain:'',castle:'',bonus:'', units:{footman:0, knight:0, seige:0, ship:0}};
    let commacounter = 0;
    while (i < data.length){
        if (data[i] != ','){
            if (commacounter == 0){
                obj.terrain += data[i];
                i++;
            } else if (commacounter == 1){
                obj.castle += data[i];
                i++;
            }else if (commacounter == 2){
                obj.bonus += data[i]
                i++;
            } // units?
            }else{
                commacounter += 1;
                i++;
            }
        }
    return obj;
}


//[ [ { id: 'A1', terrain: '0', castle: '', bonus: '' },
//    { id: 'A2', terrain: '0', castle: '', bonus: '' },
//    { id: 'A3', terrain: '0', castle: '', bonus: '' },
//    { id: 'A4', terrain: '0', castle: '', bonus: '' },
//    { id: 'A5', terrain: '0', castle: '', bonus: '' },
//    { id: 'A6', terrain: '0', castle: '', bonus: '' },
//    { id: 'A7', terrain: '1', castle: '', bonus: '' },
//    { id: 'A8', terrain: '0', castle: '', bonus: '' } ],
//  [ { id: 'B1', terrain: '0', castle: '', bonus: '' },
//    { id: 'B2', terrain: '0', castle: '', bonus: '' },
//    { id: 'B3', terrain: '0', castle: '', bonus: '' },
//    { id: 'B4', terrain: '0', castle: '', bonus: '' },
//    { id: 'B5', terrain: '0', castle: '', bonus: '' },
//    { id: 'B6', terrain: '0', castle: '', bonus: '' },
//    { id: 'B7', terrain: '0', castle: '', bonus: '' },
//    { id: 'B8', terrain: '0', castle: '', bonus: '' } ],
