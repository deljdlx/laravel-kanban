/**
 * @class
 * @property {BoardView} board
 * @property {Board} boardModel
 */

export class View
{
  constructor(board) {
    this.boardView = board;
    this.boardModel = board.getModel();
  }
}