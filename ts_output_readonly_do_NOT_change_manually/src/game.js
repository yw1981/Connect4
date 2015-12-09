var game;
(function (game) {
    'use strict';
    game.isYourTurn = false;
    var rowsNum = 6;
    var colsNum = 7;
    var canMakeMove = false;
    function init() {
        resizeGameAreaService.setWidthToHeight(1.16667);
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
    }
    game.init = init;
    function sendComputerMove() {
        gameService.makeMove(gameLogic.createComputerMove(game.board, game.turnIndex));
    }
    function getIntegersTill(number) {
        var res = [];
        for (var i = 0; i < number; i++) {
            res.push(i);
        }
        return res;
    }
    function updateUI(params) {
        // check if commented: $scope.jsonState = angular.toJson(params.stateAfterMove, true);
        game.board = params.stateAfterMove.board;
        game.delta = params.stateAfterMove.delta;
        if (game.board === undefined) {
            game.board = [
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
                ['', '', '', '', '', '', ''],
            ];
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        game.isYourTurn = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; //it's my turn
        game.turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        if (game.isYourTurn
            && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            game.isYourTurn = false;
            $timeout(sendComputerMove, 1100);
        }
    }
    updateUI({ stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2 });
    function cellClicked(row, col) {
        log.info(["Clicked on cell:", row, col], "isYourTurn ", game.isYourTurn);
        if (!game.isYourTurn) {
            return;
        }
        try {
            var move = gameLogic.createMove(game.board, row, col, game.turnIndex);
            game.isYourTurn = false; // to prevent making another move
            gameService.makeMove(move);
        }
        catch (e) {
            log.info(["wrong move", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    ;
    function shouldSlowlyAppear(row, col) {
        return game.delta !== undefined
            && game.delta.row === row && game.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function shouldShowImage(row, col) {
        var cell = game.board[row][col];
        //log.info('shouldShowImae, r, c, v:', row, col, cell!="");
        return cell !== "";
    }
    game.shouldShowImage = shouldShowImage;
    ;
    function rows() { return getIntegersTill(rowsNum); }
    game.rows = rows;
    function cols() { return getIntegersTill(colsNum); }
    game.cols = cols;
    function isWhite(row, col) {
        if (game.board[row][col] === 'B') {
            return true;
        }
        else {
            return false;
        }
    }
    game.isWhite = isWhite;
    function isBlack(row, col) {
        if (game.board[row][col] === 'R') {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBlack = isBlack;
    function oddSum(row, col) {
        if ((row + col) % 2 !== 0) {
            return true;
        }
        else {
            return false;
        }
    }
    game.oddSum = oddSum;
    function evenSum(row, col) {
        if ((row + col) % 2 === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    game.evenSum = evenSum;
    function getImageSrc(row, col) {
        var cell = game.board[row][col];
        return cell === "R" ? "img/red.png"
            : cell === "B" ? "img/blue.png" : "";
    }
    game.getImageSrc = getImageSrc;
    ;
    function handleDragEvent(type, clientX, clientY) {
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
        var centerXY = getSquareCenterXY(row, col);
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
        function getSquareTopLeft(row, col) {
            var size = getSquareWidthHeight();
            return { top: row * size.height, left: col * size.width };
        }
        function getSquareCenterXY(row, col) {
            var size = getSquareWidthHeight();
            return {
                x: col * size.width + size.width / 2,
                y: row * size.height + size.height / 2
            };
        }
    }
    function dragDone(row, col) {
        log.info("Dragged to " + row + "x" + col);
        cellClicked(row, col);
    }
    function getPreviewSrc() {
        return game.turnIndex === 1 ? "img/blue.png" : "img/red.png";
    }
    game.getPreviewSrc = getPreviewSrc;
    ;
})(game || (game = {}));
// angular.module('myApp')
// .controller('Ctrl', ['$scope','$rootScope', '$log', '$timeout',
//        'gameService', 'gameLogic', 'resizeGameAreaService','dragAndDropService', function (
//    $scope, $rootScope, $log, $timeout,
//   gameService, gameLogic, resizeGameAreaService,dragAndDropService) {
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        "RULES_OF_CONNECT4": "Rules of Connect4",
        "RULES_SLIDE1": "Each player drops a disc of their color down a column. The disc can fall only on the lowest available spot in the column",
        "RULES_SLIDE2": "The objective of the game is to connect four of one's own discs of the same color next to each other vertically, horizontally, or diagonally before your opponent",
        "CLOSE": "Close"
    });
    game.init();
});
