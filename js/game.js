//"use strict";

var tictactoe = (function (exports){

        var exports = {
            needReset: false,
            resetPlayers: false,
            playerO: 'O',
            playerX: 'X',
            playerOName: '',
            playerXName: '',
            playerOComputer: false,
            playerXComputer: false,
            isTurn: 'X',
            isWinner: 'keep playing',
            filledBoxes: [],
            gameBoardState: [
                [[0,'E'],[1,'E'],[2,'E'],'none'],  // 0
                [[3,'E'],[4,'E'],[5,'E'],'none'],  // 1
                [[6,'E'],[7,'E'],[8,'E'],'none'],  // 2
                [[0,'E'],[3,'E'],[6,'E'],'none'],  // 3
                [[1,'E'],[4,'E'],[7,'E'],'none'],  // 4
                [[2,'E'],[5,'E'],[8,'E'],'none'],  // 5
                [[0,'E'],[4,'E'],[8,'E'],'none'],  // 6
                [[2,'E'],[4,'E'],[6,'E'],'none'],  // 7
              ],
            filledInClassNameforActivePlayer: '',
            filledInClassNameforO: 'box box-filled-1',
            filledInClassNameforX: 'box box-filled-2',
            $liPlayerX: '',
            $liPlayerO: '',
            $boxes: '',
            $boardElmnt: '',
            $startElmnt: '',
            $finishElmnt: '',
            $playerONameInput: '',
            $playerXNameInput: '',
            $playerONameLabel: '',
            $playerXNameLabel: '',

        }; // end exports object

          exports.computer = {
              turnIsComplete: false,
              moveNo: 0,
              player: '',
              opponent: '',
              cpBoxFilledClass: '',
              opponentBoxFilledClass: '',
              possibleWinners: {
                center: [4],
                corners: [0,2,6,8],
                sides: [1,3,5,7]
              },
          };

          exports.trackFilledBoxes = function(game, selectedBoxNumber, selectedBy){


              // first figure out who the active player is
              let activePlayer = '';
              let inactivePlayer = '';
              if (game.isTurn === game.playerX){
                activePlayer = 'X';
                inactivePlayer = 'O';
              } else {
                activePlayer = 'O';
                inactivePlayer = 'X';
              }

              // as the game progresses, track who fills each box
              // who has a potential winning row, which rows are blocked
              // r1 = 1 box in a winning row, r2 = 1 boxes in a winning row
              // if the active player has just gotten a 3 in a row, or a winner

              game.gameBoardState.forEach(function(itemArray, itemArrayIndex){
                  // each item is an itemArray has 4 items,
                  // 0,1 and 2 are arrays,
                  // item 3 is a string, which player 1 or 2 boxes selected
                  itemArray.forEach(function(rowItem, indexofRowItem){
                       // skip condition test for indexofRowItem 3,
                       // which is not an array
                    if (indexofRowItem < 3) {
                      // each rowItem is an array
                       // has a 2 elements, a box# and a char; E, X, or O
                      if (rowItem[0] == selectedBoxNumber) {
                        // if box # = selected boxNumber
                        rowItem[1] = selectedBy;
                        if( itemArray[3] == `p${activePlayer}-r2` ){
                            // and if active player has 2 boxes in this row
                            itemArray[3] = `${activePlayer}-winner`;
                            // then this row is a winner
                          } else if ( itemArray[3] == `p${inactivePlayer}-r2` ) {
                            // else if inactive player has 2 in boxes in this row
                            itemArray[3] = `blocked`;
                            // then marked it as blocked
                          } else if( itemArray[3] === `p${activePlayer}-r1`){
                            // else if active player already has 1 box in this row
                            itemArray[3] = `p${activePlayer}-r2`;
                            // then label it a row for active player, -r2
                        } else if ( itemArray[3] == `p${inactivePlayer}-r1` ) {
                          // else if inactive player has 1 in boxes in this row
                          itemArray[3] = `blocked`;
                          // then marked it as blocked
                        } else if ( itemArray[3] == `none` ){
                            // if no one has boxes in this row
                            itemArray[3] = `p${selectedBy}-r1`;
                            // then label it a row for active player, -r1
                        }
                      }
                    }

                  });
              });


          };// end trackFilledBoxes() method

          exports.emptyArray = function(arrayToEmpty){

            // utility to empty all arrays used during a game
            // seems there should be a better way to do this...

            let origArrayLength = arrayToEmpty.length;
            for (var i = origArrayLength; i > 0; i--){
              var bucket = arrayToEmpty.pop();
            }
            return arrayToEmpty;

          }; // end emptyArray()

          exports.findTargetBox = function(game, computerORplayer, noBoxesInRow){

            // called by computerPlayer() as part of choosing best move,
            // find empty box in computer or players's winning row

            // required paramters:
            // game object
            // computerORplayer; string for 'O' or 'X'
            // noBoxesInRow; string
               // for '-r2' for 2 in a row
               // or '-r1' for 1 in a row


            const isTargetBox = 'E';  // any empty, 'E', box is a target for block or a  win
            const targets = [];  // array for target boxes
            let rowStatus = '';

            if (noBoxesInRow == 'blocked' ){
              rowStatus = 'blocked';
            } else {
              rowStatus = `p${computerORplayer}-${noBoxesInRow}`;
            }

            game.gameBoardState.forEach(function(rowItem, rowIndex){
                // does computer or player have 1 or 2 boxes in any row
                 if (rowItem[3] == rowStatus){
                   // iterate through that row,
                    rowItem.forEach(function(rowItemArray, rowItemIndex){
                    // find empty box
                      if (rowItemArray[1] == isTargetBox){
                         // choose box represented by rowItemArray[0]
                         targets.push(rowItemArray[0]);
                       }  // end if == isTargetBox
                  }); // end forEach rowItem
                } // if computer or player has winning row
            }); // end for gameBoardState

            return targets;

          }; // end findTargetBox() function

          exports.detectIfWinner = function(game){

            let blockedRows = 0;

            // count blocked rows
            game.gameBoardState.forEach(function(winRowItem, winRowIndex){
              if (winRowItem[3] == 'blocked'){
                blockedRows += 1;
              }
            });  // end forEach to count blocked rows

            // test if any player has a winning row
            if (game.isTurn === 'X') {

              game.gameBoardState.forEach(function(winRowItem, winRowIndex){
                // iterate each item of possible winning rows
                if (winRowItem[3] === 'X-winner'){
                    game.isWinner = 'playerX';
                 }
               });
            } else if (game.isTurn === 'O'){

              game.gameBoardState.forEach(function(winRowItem, winRowIndex){
                // iterate each item of possible winning rows
                if (winRowItem[3] === 'O-winner')
                    game.isWinner = 'playerO';
              });
            }

            if (blockedRows == 8 && game.filledBoxes.length == 9){
                  // if all rows blocked, and all boxes have been filled, then game is a draw
                game.isWinner = "draw";
              } // end if blocked rows = 8

          }; // end detectIfWinner() method

          exports.takeTurn = function(indexNoOfSelectedBox, itemNoOfSelectedBox, game){

            if (game.isTurn === 'X'){
              // active player is X, so use css box-filled-in class name for X
              game.filledInClassNameforActivePlayer = game.filledInClassNameforX;
            } else {
              // active player is X, so use css box-filled-in class name for O
              game.filledInClassNameforActivePlayer = game.filledInClassNameforO;
            }

              // keep track of filled boxes
              game.trackFilledBoxes(game, indexNoOfSelectedBox, game.isTurn);
              // change class name of box, to trigger css to fill-in box for X or O
              itemNoOfSelectedBox.setAttribute('class', game.filledInClassNameforActivePlayer);
              // return state of game, winner, tie or 'keep playing'
              game.winner = game.detectIfWinner(game);
              // changing isTurn to end player's turn,
              // so if computer is playing, computer will not fill-in more boxes
              // but whose turn just finished, is preserved
              if (game.isTurn = 'X'){
                game.isTurn = 'EX';
              } else {
                game.isTurn = 'EO';
              }
              // temporarily disabling the tictactoe boxes from click and hover event handlers
              // so human player can't fill-in more boxes either
              game.$boxes.each(function(index, item){
                $(item).off('hover');
                $(item).off('click');
              });
              // check if game is over
              game.isGameOver(game);

          }; // end takeTurn()

          exports.isGameOver = function(game){
            // after each turn is taken, do we have a winner ...or is game a draw
            if (game.isWinner === 'playerX' || game.isWinner === 'playerO' || game.isWinner === 'draw' ) {

              setTimeout(game.finishGame, 500, game);

            } else { // else game is NOT over...

              // toggle who is active player
              if ( game.$liPlayerO[0].className == 'players active' ){
                // setting isTurn to complete computer's turn, but so we still know whose turn just finished
                game.isTurn = 'X';
                game.$liPlayerO[0].className = 'players';
                game.$liPlayerX[0].className = 'players active';


              } else if (game.$liPlayerX[0].className == 'players active'){
                /// setting isTurn to complete computer's turn, but so we still know whose turn just finished
                game.isTurn = 'O';
                game.$liPlayerX[0].className = 'players';
                game.$liPlayerO[0].className = 'players active';

              }

              setTimeout(game.playGame, 500, game);
            }
          };  // end isGameOver()

          exports.humanPlaying = function(game){
              // event handler for hover affect on tictactoe boxes
              game.$boxes.each(function(index, item){
                  $(this).hover(  // when the mouse hovers over a box...
                    function(){ // execute this function
                      // if box is not selected, (or is empty)
                      if (this.attributes[0].value === "box"){
                        // if it's playerO's turn ..
                        if (game.isTurn === game.playerO && game.playerOComputer == false) {
                          // playerO's symbol appears...
                          this.style.backgroundImage = "url('img/o.svg')";
                          this.style.backgroundColor = '#FFA000';
                        } else if (game.isTurn === game.playerX && game.playerXComputer == false){
                          // else playerX's symbol appears...
                          this.style.backgroundImage = "url('img/x.svg')";
                          this.style.backgroundColor = '#3688C3';
                        } // end if game.isTurn
                      } // end if this.attributes[0].value === "box"
                    },// end hover if class 'box', (is not yet selected)
                     function(){
                      // "X" or "O" disappears when mouse moves away from box
                      if (this.attributes[0].value === "box"){
                          this.style.backgroundImage = "";
                          this.style.backgroundColor = "";
                        } // end if active player
                    }
                  ); // end hover event handler

                  $(this).click(function(){
                    if (item.attributes[0].value === "box"){ // if not filled in yet
                        // store box number that was clicked
                        game.filledBoxes.push(index);
                        // fill in chosen box with X or O depending on game.isTurn ...
                        game.takeTurn(index, item, game);
                        // if either below is true, start computer player
                    } // end if (if box not filled in yet)
                  }); // end box click event handler

              }); // end for each tictactoe box
          }; // end onlyHumansPlaying() funbction

          exports.playGame = function(game){

            if (game.isTurn !== game.computer.player){
              game.humanPlaying(game);
            } else {
              game.computer.computerPlay(game);
            }

          }; // end playGame() method

          exports.finishGame = function(game){

            game.isTurn = 'E';
            // show winner, or draw
            let finishGameText = '';
            if (game.isWinner === 'playerX'){
              finishGameText = ` ${game.playerXName}!`;
              game.$finishElmnt.attr('class', "screen screen-win-two");
            } else if ( game.isWinner === 'playerO' ){
              finishGameText = ` ${game.playerOName}!`;
              game.$finishElmnt.attr('class', "screen screen-win-one");
            } else {
              finishGameText = `It's a tie!`;
              game.$finishElmnt.attr('class', "screen screen-win-tie");
            }
            $('.message')[0].textContent=finishGameText;
            game.$boardElmnt.hide();
            game.$finishElmnt.show();

            // if 'play again' button clicked, just reset game, show empty tictactoe board
            $('#resetGame').click(function(){

              game.needReset = true;
              // game.setupNewGame(game, true);
              // game.playGame(game);
              game.startGame(game);

            });

            // if 'new game, different players', reset game, reset player names, back to start screen
            $('#newPlayers').click(function(){

              game.resetPlayers = true;
              game.needReset = true;
              game.playerOName = '';
              game.playerXName = '';
              //game.setupNewGame(game, true, true);
              game.startGame(game);

            });
          }; // end finishGame() method

          exports.setupNewGame = function(game){

            if (game.needReset) { // make sure board is cleared for new game

              //reset styling of boxes to original or 'empty'
              $('.boxes').children().attr('class', 'box');

              game.$boxes.each(function(){  // just to be sure...
                this.style.backgroundColor = '';
                this.style.backgroundImage = '';
              }); // reset each box background Color and Image style to ''

              game.gameBoardState.forEach(function(winRowArray, indexWinRowArray){

                  winRowArray.forEach(function(itemArray, indexOfItemArray){
                    if (indexOfItemArray < 3){
                     itemArray[1] = 'E';
                    }
                  });
                  winRowArray[3] = 'none';
              }); //reset array used track state of the game board

              // make sure each array for O and X filled are empty
              game.filledBoxes = game.emptyArray(game.filledBoxes);

              game.$boardElmnt.show(); // reset game board
              game.$boardElmnt = $('#board');  // reselect emptied game board element
              game.isTurn = this.playerX; // make sure isTurn to X player

              // visually activate player X's label and de-activate player O label
              game.$liPlayerO.attr('class', 'players');
              game.$liPlayerX.attr('class', 'players active');
              // hide start and finish screens
              game.$startElmnt.hide();
              game.$finishElmnt.hide();

              // reset isWinner
              game.isWinner = 'keep playing';

              // resetting which turn number
              game.computer.moveNo = 0;

              // now that game is reset, set needReset to false
              game.needReset = false;

            } else if (!game.needReset && !game.resetPlayers) { // then this is the FIRST game...

              // visually activate player X's label and de-activate player O label
              game.$liPlayerO.attr('class', 'players');
              game.$liPlayerX.attr('class', 'players active');
              // hide start screen, show game board screen
              game.$startElmnt.hide();
              game.$boardElmnt.show();

              if (!game.playerOName) {  // if one of the player inputs is blank

                // if player O name input blank, then setup computer to play O
                game.computer.player = game.playerO;
                game.computer.cpBoxFilledClass = 'box box-filled-1';
                game.computer.opponent = game.playerX;
                game.$playerONameLabel[0].textContent = 'the computer';
                game.playerOName = 'the computer';
                game.playerOComputer = true;

              } else if (!game.playerXName) {
                // if playerX name input is blank setup computer to play X
                game.computer.player = game.playerX;
                game.computer.cpBoxFilledClass = 'box box-filled-2';
                game.computer.opponent = game.playerO;
                game.$playerXNameLabel[0].textContent = 'the computer';
                game.playerXName = 'the computer';
                game.playerXComputer = true;
              }

            } // end if(game.needReset)


              if (game.resetPlayers){ // if setting up for new players

                // reset players, human and computer, and player names
                game.playerOName = null;
                game.playerXName = null;
                game.computer.player = '';
                game.computer.opponent = '';
                game.playerOComputer = false;
                game.playerXComputer = false;
                $('#playerO')[0].value = '';
                $('#playerX')[0].value = '';
                $('#player1Name')[0].textContent = '';
                $('#player2Name')[0].textContent = '';
                // hide game board and finish screen
                game.$boardElmnt.hide();
                game.$finishElmnt.hide();
                // show start screen
                game.$startElmnt.show();
                // reset flag to false
                game.resetPlayers = false;

              } // end if (!game.setNewPlayers)

          }; // end setupNewGame()

          exports.startGame = function(game){

            // startGame called by start screen 'start' button
              // and finsh screen 'play again' and 'new game, different players' buttons
              if (game.needReset && game.resetPlayers) {
                // then we're resetting the game, and resetting players,
                // setupNewGame then shws the start screen
                game.setupNewGame(game, true);
              } else {
                // else either playing the first game or need a game reset
                game.setupNewGame(game);
                // after which run playGame()
                game.playGame(game);
              }
          }; // end startGame() method

          exports.computer.computerPlay = function(game){

            var decideMove = function(game, moveNo){

              // decide on move to make,
              // test for targets to block 3 or 2 in row by opponent
              // test for targets to get 3 or 2 in row
              // 1 in a row, r1
              // 2 in a row, r2

              if (moveNo == 1 ){
                let possibleTargetsR1 = '';
                possibleTargetsR1 = game.computer.analyzeGameBoard(game, 'r1', 'r1');
                // which empty boxes are targets to block opponent from getting 2 in a row
                // and which are targets to get 2 in a row

                if (possibleTargetsR1.possibleWins[0].length > 0){
                  // if target for computer to get 2 in a row
                    var targetBoxNo =makeWinMove(game, possibleTargetsR1);
                    // play it
                    return targetBoxNo;

                 } else if(possibleTargetsR1.possibleBlocks[0].length > 0){ // if opponent has a r2
                   // else if target to block opponent from getting 2 in a row
                    var targetBoxNo = makeBlockMove(game, possibleTargetsR1);
                    // block it
                    return targetBoxNo;

                 } else {

                   let targetBoxes = [0,2,4,6,8];
                   const randomBoxNumber = Math.floor(Math.random() * targetBoxes.length);
                   const targetBoxNo = targetBoxes[randomBoxNumber];
                   // store box being filled in
                   game.filledBoxes.push(targetBoxNo);
                   // then call takeTurn, to play that box
                   game.takeTurn(targetBoxNo, game.$boxes[targetBoxNo], game);
                   return targetBoxNo;

                 }// end if possibleTargetsR1

              } else if (moveNo == 2) {

                let possibleTargets = '';
                possibleTargets = game.computer.analyzeGameBoard(game, 'r2', 'r2');
                // which empty boxes are targets to block opponent from completing 3 in a row
                // and which empty boxes are targets for computyer to complete 2 in a row

                if (possibleTargets.possibleWins[0].length > 0){
                  // if target for computer to complete 3 in a row
                   var targetBoxNo = makeWinMove(game, possibleTargets);
                    // play it, for a win
                    return targetBoxNo;

                } else if(possibleTargets.possibleBlocks[0].length > 0){
                  // else if target to block opponent from completing 3 in a row
                    var targetBoxNo = makeBlockMove(game, possibleTargets);
                   // block it
                   return targetBoxNo;

                } else {

                   let possibleTargetsR1 = '';
                   possibleTargetsR1 = game.computer.analyzeGameBoard(game, 'r1', 'r1');
                   // which empty boxes are targets to block opponent from getting 2 in a row
                   // and which are targets to get 2 in a row

                   if (possibleTargetsR1.possibleWins[0].length > 0){
                     // if target for computer to get 2 in a row
                       var targetBoxNo =makeWinMove(game, possibleTargetsR1);
                       // play it
                       return targetBoxNo;

                    } else if(possibleTargetsR1.possibleBlocks[0].length > 0){ // if opponent has a r2
                      // else if target to block opponent from getting 2 in a row
                       var targetBoxNo = makeBlockMove(game, possibleTargetsR1);
                       // block it
                       return targetBoxNo;

                    }

                  }// end if possibleTargets

              } else if (moveNo == 3){

                let possibleTargets = '';
                possibleTargets = game.computer.analyzeGameBoard(game, 'r2', 'r2');
                // which empty boxes are targets to block opponent from completing 3 in a row
                // and which empty boxes are targets for computyer to complete 2 in a row

                if (possibleTargets.possibleWins[0].length > 0){
                  // if target for computer to complete 3 in a row
                   var targetBoxNo = makeWinMove(game, possibleTargets);
                    // play it, for a win
                    return targetBoxNo;

                } else if(possibleTargets.possibleBlocks[0].length > 0){
                  // else if target to block opponent from completing 3 in a row
                    var targetBoxNo = makeBlockMove(game, possibleTargets);
                   // block it
                   return targetBoxNo;

                } else {

                   let possibleTargetsR1 = '';
                   possibleTargetsR1 = game.computer.analyzeGameBoard(game, 'r1', 'r1');
                   // which empty boxes are targets to block opponent from getting 2 in a row
                   // and which are targets to get 2 in a row

                   if (possibleTargetsR1.possibleWins[0].length > 0){
                     // if target for computer to get 2 in a row
                       var targetBoxNo =makeWinMove(game, possibleTargetsR1);
                       // play it
                       return targetBoxNo;

                    } else if(possibleTargetsR1.possibleBlocks[0].length > 0){ // if opponent has a r2
                      // else if target to block opponent from getting 2 in a row
                       var targetBoxNo = makeBlockMove(game, possibleTargetsR1);
                       // block it
                       return targetBoxNo;

                    } // end if (possibleTargetsR1)

                  }  // end if (possibleTargets)

              } else if (moveNo == 4){

                let possibleTargets = '';
                possibleTargets = game.computer.analyzeGameBoard(game, 'r2', 'r2');
                // which empty boxes are targets to block opponent from completing 3 in a row
                // and which empty boxes are targets for computyer to complete 2 in a row

                if (possibleTargets.possibleWins[0].length > 0){
                  // if target for computer to complete 3 in a row
                   var targetBoxNo = makeWinMove(game, possibleTargets);
                    // play it, for a win
                    return targetBoxNo;

                } else if(possibleTargets.possibleBlocks[0].length > 0){
                  // else if target to block opponent from completing 3 in a row
                    var targetBoxNo = makeBlockMove(game, possibleTargets);
                   // block it
                   return targetBoxNo;

                } else {

                   let possibleTargetsR1 = '';
                   possibleTargetsR1 = game.computer.analyzeGameBoard(game, 'r1', 'r1');
                   // which empty boxes are targets to block opponent from getting 2 in a row
                   // and which are targets to get 2 in a row

                   if (possibleTargetsR1.possibleWins[0].length > 0){
                     // if target for computer to get 2 in a row
                       var targetBoxNo =makeWinMove(game, possibleTargetsR1);
                       // play it
                       return targetBoxNo;

                    } else if(possibleTargetsR1.possibleBlocks[0].length > 0){ // if opponent has a r2
                      // else if target to block opponent from getting 2 in a row
                       var targetBoxNo = makeBlockMove(game, possibleTargetsR1);
                       // block it
                       return targetBoxNo;

                    } // end if (possibleTargetsR1)

                } // end if (possibleTargets)

              } else if (moveNo == 5){

                let possibleTargets = '';
                possibleTargets = game.computer.analyzeGameBoard(game, 'r2', 'r2');
                // which empty boxes are targets to block opponent from completing 3 in a row
                // and which empty boxes are targets for computyer to complete 2 in a row

                if (possibleTargets.possibleWins[0].length > 0){
                  // if target for computer to complete 3 in a row
                   var targetBoxNo = makeWinMove(game, possibleTargets);
                    // play it, for a win
                    return targetBoxNo;

                } else if(possibleTargets.possibleBlocks[0].length > 0){
                  // else if target to block opponent from completing 3 in a row
                    var targetBoxNo = makeBlockMove(game, possibleTargets);
                   // block it
                   return targetBoxNo;

                } else {

                   let possibleTargetsR1 = '';
                   possibleTargetsR1 = game.computer.analyzeGameBoard(game, 'r1', 'r1');
                   // which empty boxes are targets to block opponent from getting 2 in a row
                   // and which are targets to get 2 in a row

                   if (possibleTargetsR1.possibleWins[0].length > 0){
                     // if target for computer to get 2 in a row
                       var targetBoxNo =makeWinMove(game, possibleTargetsR1);
                       // play it
                       return targetBoxNo;

                    } else if(possibleTargetsR1.possibleBlocks[0].length > 0){ // if opponent has a r2
                      // else if target to block opponent from getting 2 in a row
                       var targetBoxNo = makeBlockMove(game, possibleTargetsR1);
                       // block it
                       return targetBoxNo;

                    } else {

                     // else fill-in last empty box
                     let lastEmptyBox = '';
                     lastEmptyBox = game.computer.analyzeGameBoard(game, 'blocked', 'blocked');
                     if(lastEmptyBox.possibleBlocks[0].length > 0){
                       return makeBlockMove(game, lastEmptyBox);

                     } // end if (lastEmptyBox)

                   } // end if (possibleTargetsR1)

                } // end if (possibleTargets)

              } // end if (moveNo)

            }; // end decideMove()

            var makeBlockMove = function(game, possibleTargets){

               const targetBoxes = [];
               game.computer.possibleWinners.center.forEach(function(centerItem, centerIndex){
                 possibleTargets.possibleBlocks[0].forEach(function(ptItem, ptIndex){
                  // itrate through target boxes,
                     if(centerItem == ptItem){
                       // select center box if empty
                       if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                        // if not a duplicate
                        targetBoxes.push(ptItem);
                        // to add that box as target box for a r1 or r2
                        }
                       }
                 }); // end for center box
               }); // end for possibleWinners.center


                if(targetBoxes.length == 0){ // if center box is not empty

                  game.computer.possibleWinners.corners.forEach(function(cornerItem, cornerIndex){
                   possibleTargets.possibleBlocks[0].forEach(function(ptItem, ptIndex){
                    // itrate through target boxes,
                       if(cornerItem == ptItem){
                         // select target that is a corner box from computer r1 to for a r2
                         if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                          // if not a duplicate
                          targetBoxes.push(ptItem);
                          // to add that box as target box for a r1 or r2
                          }
                        }
                    }); // end for each corner box
                  }); // end for possibleWinners.corners

                  game.computer.possibleWinners.sides.forEach(function(sideItem, sideIndex){
                    possibleTargets.possibleBlocks[0].forEach(function(ptItem, ptIndex){
                     // itrate through target boxes,
                        if(sideItem == ptItem){
                            // select target that is a side box from computer r1 to for a r2
                            if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                             // if not a duplicate
                             targetBoxes.push(ptItem);
                             // to add that box as target box for a r1 or r2
                             }
                          }
                    }); // end for each center box
                  }); // end for possibleWinners.sides

                } // end if (center box is empty )

               if (targetBoxes.length > 1){
                 // from the possible targets, randomly choose one
                 const randomBoxNumber = Math.floor(Math.random() * targetBoxes.length);
                 const targetBoxNo = targetBoxes[randomBoxNumber];
                 // store box being filled in
                 game.filledBoxes.push(targetBoxNo);
                 // then call takeTurn, to play that box
                 game.takeTurn(targetBoxNo, game.$boxes[targetBoxNo], game);
                 return targetBoxNo;
                 //
               } else { // else if only one possible empty box is a target for a block
                  const targetBoxNo = targetBoxes[0];
                  // store box being filled in
                  game.filledBoxes.push(targetBoxNo);
                  //then call takeTurn, to play that empty box
                  game.takeTurn(targetBoxNo, game.$boxes[targetBoxNo], game);
                  return targetBoxNo;
                } // end if multiple targets

              }; // end makeBlockMove function

            var makeWinMove = function(game, possibleTargets){

               const targetBoxes = [];

               game.computer.possibleWinners.center.forEach(function(centerItem, centerIndex){
                 possibleTargets.possibleWins[0].forEach(function(ptItem, ptIndex){
                  // itrate through target boxes,
                     if(centerItem == ptItem){
                       // select center box if empty
                          if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                           // if not a duplicate
                           targetBoxes.push(ptItem);
                           // to add that box as target box for a r1 or r2
                           }
                       }
                 }); // end for center box
               }); // end forEach possibleWinners.center

                if(targetBoxes.length == 0){
                  game.computer.possibleWinners.corners.forEach(function(cornerItem, cornerIndex){
                   possibleTargets.possibleWins[0].forEach(function(ptItem, ptIndex){
                    // itrate through target boxes,
                       if(cornerItem == ptItem){
                         // select target that is a corner box from computer r1 to for a r2
                         if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                          // if not a duplicate
                          targetBoxes.push(ptItem);
                          // to add that box as target box for a r1 or r2
                          }
                         }
                    }); // end for each corner box
                  }); // end forEach possibleWinners.corners

                  game.computer.possibleWinners.sides.forEach(function(sideItem, sideIndex){
                    possibleTargets.possibleWins[0].forEach(function(ptItem, ptIndex){
                     // itrate through target boxes,
                        if(sideItem == ptItem){
                          // select target that is a side box from computer r1 to for a r2
                           if (ptItem !== targetBoxes[targetBoxes.length - 1 ]){
                            // if not a duplicate
                            targetBoxes.push(ptItem);
                            // to add that box as target box for a r1 or r2
                            }
                          }
                    }); // end for each side box
                  }); // end for possibleWinners.sides
                } // end if (targetBoxes.length == 0)


               if (targetBoxes.length > 1){
                 // from possible targets, randomly choose one
                 const randomBoxNumber = Math.floor(Math.random() * targetBoxes.length);
                 const targetBoxNo = targetBoxes[randomBoxNumber];
                 // store box being filled in
                 game.filledBoxes.push(targetBoxNo);
                 // then call takeTurn, to play that box
                 game.takeTurn(targetBoxNo, game.$boxes[targetBoxNo], game);
                 return targetBoxNo;
                } else { // only 1 empty box is a possible target for a winning move
                    const targetBoxNo = targetBoxes[0];
                    // store box being filled in
                    game.filledBoxes.push(targetBoxNo);
                    // call takeTurn to play that box
                    game.takeTurn(targetBoxNo, game.$boxes[targetBoxNo], game);
                    return targetBoxNo;
                } // end if (multiple targets)
              }; // end makeWinMove function;

            // if it's computer.player's turn
            if (game.isTurn === game.computer.player) {
                // increment moveNo,
                game.computer.moveNo += 1;
                // decide on best move, brief delay so human player can notice visual affects
                var targetBoxNo = decideMove(game, game.computer.moveNo);
                //game.computer.turnComplete(game, true);
                return targetBoxNo;

            } // end if game.isTurn

          }; //end computerPlay()

          exports.computer.turnComplete = function(game, turnIsComplete){
            if (turnIsComplete) {
              game.isTurn = game.computer.opponent;

              if (game.playerOComputer = true){
                game.computer.computerPlayerActiveTriggered = false;
              } else if (game.playerXComputer = true){
                game.computer.computerPlayerActiveTriggered = false;
              }
            }
          };

          exports.computer.analyzeGameBoard = function(game, opponentWno, computerWno){

            // function to 'analyze' game board
            // new set of possibleTargets each time computer 'analyzes' gameBoard
            const possibleTargets = {
              possibleBlocks:[],
              possibleWins:[]
            };

            // checking for computer's and player's possible winning rows
            // and which of the boxes in these rows are 'targets', or are empty

            if(opponentWno) {
              possibleTargets.possibleBlocks.push(game.findTargetBox(game, game.computer.opponent, opponentWno));
            }
            if (computerWno){
              possibleTargets.possibleWins.push(game.findTargetBox(game, game.computer.player, computerWno));
            }

            return possibleTargets;
          }; // end analyzeGameBoard() function

          $(document).ready(function() {

            // labels and input allow for players to enter names
            // computer plays player input that is blank
            // game will not start unless one name is entered

            $('#playerO').change(function(){
              exports.playerOName = $(this)[0].value;
              $('#player1Name')[0].textContent = exports.playerOName;
            });

            // get name for player O
            $('#playerX').focus().change(function(){
              exports.playerXName = $(this)[0].value;
              $('#player2Name')[0].textContent = exports.playerXName;
            });


            // at present it is implied that user must type in thier name in input for player
            $('#start .button').click(function(){

              if (!exports.playerOName && !exports.playerXName) {
                // require at least one name entered
                $('#playerX')[0].placeholder = "enter your name for X or O";
                $('#playerX').focus()
              } else if (exports.playerOName || exports.playerXName){
                // new Game
                exports.playerO = 'O';
                exports.playerX = 'X';
                exports.$liPlayerO = $('#player1');
                exports.$liPlayerX = $('#player2');
                exports.$boxes = $('li.box');
                exports.$boardElmnt = $('#board');
                exports.$startElmnt = $('#start');
                exports.$finishElmnt = $('#finish');
                exports.$playerONameInput = $('#playerO');
                exports.$playerXNameInput = $('#playerX');
                exports.$playerONameLabel = $('#player1Name');
                exports.$playerXNameLabel = $('#player2Name');

                exports.startGame(exports);
              }

            });

          });

          return exports   // returning the entire object and it's methods

}(tictactoe || { } ));
