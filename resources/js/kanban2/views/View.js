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
    this.listeners = {};
  }

  addEventListener(eventName, callback) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(callback);
  }

  fireEvent(eventName, detail = {}) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(cb => cb({ type: eventName, detail }));
    }
  }
}
