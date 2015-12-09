
module game {
  'use strict';
  export var board:string[][];
  export var turnIndex:number;
  export var isYourTurn:boolean = false;
  export var turnIndex:number;
  export var delta:any;
  var rowsNum = 6;
  var colsNum = 7;
  var canMakeMove = false;


  export function init(){
    resizeGameAreaService.setWidthToHeight(1.16667);
    dragAndDropService.addDragListener("gameArea", handleDragEvent);
    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });

  }


  function sendComputerMove(){
    gameService.makeMove(
      gameLogic.createComputerMove(board, turnIndex));
    }

    function getIntegersTill(number:number) {
      var res:number[] = [];
      for (var i = 0; i < number; i++) {
        res.push(i);
      }
      return res;
    }

    function updateUI(params:any) {
      // check if commented: $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      board = params.stateAfterMove.board;
      delta = params.stateAfterMove.delta;
      if (board === undefined) {
        board = [
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],

        ];
      }

      canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn


      isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; //it's my turn
      turnIndex = params.turnIndexAfterMove;
      // Is it the computer's turn?
      if (isYourTurn
        && params.playersInfo[params.yourPlayerIndex].playerId === '') {
          isYourTurn = false;
          $timeout(sendComputerMove, 1100);
        }
      }



      updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

      export function cellClicked (row:number, col:number) {
        log.info(["Clicked on cell:", row, col], "isYourTurn ", isYourTurn);
        if (!isYourTurn) {
          return;
        }

        try {
          var move = gameLogic.createMove(board, row, col, turnIndex);
          isYourTurn = false; // to prevent making another move

          gameService.makeMove(move);
        } catch (e) {
          log.info(["wrong move", row, col]);
          return;
        }
      };

      export function shouldSlowlyAppear (row:number, col:number) {
        return delta !== undefined
        && delta.row === row && delta.col === col;
      }

      export function shouldShowImage (row:number, col:number) {
        var cell = board[row][col];
        //log.info('shouldShowImae, r, c, v:', row, col, cell!="");
        return cell !== "";
      };

      export function rows() { return getIntegersTill(rowsNum);}
      export function cols() { return getIntegersTill(colsNum);}

      export function isWhite (row:number, col:number) {
        if (board[row][col] === 'B')
        {
          return true;
        }
        else
        {
          return false;
        }
      }

      export function isBlack (row:number, col:number) {
        if (board[row][col] === 'R')
        {
          return true;
        }
        else
        {
          return false;
        }
      }

      export function oddSum (row:number, col:number){
        if ((row + col) % 2 !== 0)
        {
          return true;
        }
        else
        {
          return false;
        }
      }

      export function evenSum (row:number, col:number){
        if ((row + col) % 2 === 0)
        {
          return true;
        }
        else
        {
          return false;
        }
      }

      export function getImageSrc (row:number, col:number) {
        var cell = board[row][col];
        return cell === "R" ? "img/red.png"
        : cell === "B" ? "img/blue.png" : "";
      };

      function handleDragEvent(type:string, clientX:number, clientY:number) {

        var draggingLines = document.getElementById("draggingLines");
        var horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
        var verticalDraggingLine = document.getElementById("verticalDraggingLine");
        var clickToDragPiece = document.getElementById("clickToDragPiece");
        var gameArea = document.getElementById("gameArea");

        //if not your turn, dont handle event
        // if (!canMakeMove) {
        //   return;
        // }
        // Center point in gameArea
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        // Is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
          clickToDragPiece.style.display = "none";
          draggingLines.style.display = "none";
          return;
        }

        clickToDragPiece.style.display = "inline";
        draggingLines.style.display = "inline";

        // Inside gameArea. Let's find the containing square's row and col
        var col = Math.floor(colsNum * x / gameArea.clientWidth);
        var row = Math.floor(rowsNum * y / gameArea.clientHeight);

        var centerXY:ICenterXY = getSquareCenterXY(row, col);
        verticalDraggingLine.setAttribute("x1", centerXY.x);
        verticalDraggingLine.setAttribute("x2", centerXY.x);
        horizontalDraggingLine.setAttribute("y1", centerXY.y);
        horizontalDraggingLine.setAttribute("y2", centerXY.y);
        var topLeft = getSquareTopLeft(row, col);
        clickToDragPiece.style.left = topLeft.left + "px";
        clickToDragPiece.style.top = topLeft.top + "px";

        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
          // drag ended
          clickToDragPiece.style.display = "none";
          draggingLines.style.display = "none";
          dragDone(row, col);
        }
        function getSquareWidthHeight() {
          return {
            width: gameArea.clientWidth / colsNum,
            height: gameArea.clientHeight / rowsNum
          };
        }
        function getSquareTopLeft(row:number, col:number) {
          var size = getSquareWidthHeight();
          return {top: row * size.height, left: col * size.width};
        }

        function getSquareCenterXY(row:number, col:number) {
          var size = getSquareWidthHeight();
          return {
            x: col * size.width + size.width / 2,
            y: row * size.height + size.height / 2
          };
        }
      }




      function dragDone(row:number, col:number) {
        log.info("Dragged to " + row + "x" + col);
        cellClicked(row, col);


      }

      export function getPreviewSrc () {
        return  turnIndex === 1 ? "img/blue.png" : "img/red.png";
      };


      // gameService.setGame({
      //   gameDeveloperEmail: "purnima.p01@gmail.com",
      //   minNumberOfPlayers: 2,
      //   maxNumberOfPlayers: 2,
      // //  exampleGame: gameLogic.exampleGame(),
      //   //riddles: gameLogic.riddles(),
      //   isMoveOk: gameLogic.isMoveOk,
      //   updateUI: updateUI
      // });
      // } ]);
    }

    // angular.module('myApp')
    // .controller('Ctrl', ['$scope','$rootScope', '$log', '$timeout',
    //        'gameService', 'gameLogic', 'resizeGameAreaService','dragAndDropService', function (
    //    $scope, $rootScope, $log, $timeout,
    //   gameService, gameLogic, resizeGameAreaService,dragAndDropService) {
    angular.module('myApp',  ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function() {
      $rootScope['game'] = game;
      translate.setLanguage('en',{
      "RULES_OF_CONNECT4":"Rules of Connect4",
      "RULES_SLIDE1":"Each player drops a disc of their color down a column. The disc can fall only on the lowest available spot in the column",
      "RULES_SLIDE2":"The objective of the game is to connect four of one's own discs of the same color next to each other vertically, horizontally, or diagonally before your opponent",
      "CLOSE":"Close"
      });
      game.init();
    });
