/**
 * @class
 * @property {BoardView} board
 * @property {Board} boardModel
 */

export class View
{
  constructor(board) {
    this.board = board;
    this.boardModel = board.getModel();
  }
}