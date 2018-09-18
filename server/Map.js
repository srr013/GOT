let fs = require('fs');

exports.loadMapFromFile = function (){
    let results = fs.readFileSync('server/GOT/Map.txt','utf-8');
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
                    sObject = new Square(s, j, String.fromCharCode(c));
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

class Square{
  constructor(data, row, column){
    this.id = column+row;
    this.index = 0;
    this.terrain = '';
    this.castle = '';
    this.bonus = '';
    this.port = false;
    let commacounter = 0;
    let i = 0;
    while (i < data.length){
        if (data[i] != ','){
            if (commacounter == 0){
                this.terrain += data[i];
                i++;
            } else if (commacounter == 1){
                this.castle += data[i];
                i++;
            }else if (commacounter == 2){
                this.bonus += data[i]
                i++;
            }else if (commacounter == 3){
              this.port = true;
              i++;
            }
            }else{
                commacounter += 1;
                i++;
            }
        }
    return this;
  }
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
