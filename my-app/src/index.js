import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import './index.css';


function Square(props){
  return(
    <button className="square"
    onClick={props.onClick}>
    {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      />
    )
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}


class Icon extends React.Component {
  render () {
    return <div className="icon"></div>
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{squares : Array(9).fill(null)}],
      xIsNext:true,
      stepNumber:0,
    }
  }
  jumpTo(step){
    this.setState({
      stepNumer: step,
      xIsNext: step % 2 === 0,
    })
  }
  handleClick(i) {
    const history = this.state.history.slice(0,this.state.stepNumber+1);
    const current = history[history.length-1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{squares:squares}]),
      xIsNext:!this.state.xIsNext,
      stepNumber: history.length,
    })
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares)
    let status;
    if (winner){
      status = 'Congrats! '+ winner;
    }else{
      status = 'Next player: '+ (this.state.xIsNext ? 'X' : 'O');
    }

    const moves = history.map((step,move)=>{
      const desc = move ? 'Go to move '+move : 'Go to start';
      return (
        <li key={move}>
          <button onClick={()=>this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    return (
      <header>
        <div className="top-bar">
          <svg className= "menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M96 176h80V96H96v80zm120 240h80v-80h-80v80zm-120 0h80v-80H96v80zm0-120h80v-80H96v80zm120 0h80v-80h-80v80zM336 96v80h80V96h-80zm-120 80h80V96h-80v80zm120 120h80v-80h-80v80zm0 120h80v-80h-80v80z"/></svg>
        </div>
      </header>
      <body>
        <div className="game-board">
          <Board
          squares={current.squares}
          onClick={(i)=>this.handleClick(i)}
          />
        </div>
        <div className="bottom-bar">
          <div className="bottom-third">
          </div>
          <div className="bottom-third"></div>
          <div className="bottom-third"></div>
        </div>
      </body>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
