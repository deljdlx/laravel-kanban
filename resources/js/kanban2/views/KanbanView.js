/**
 * Vue principale du Kanban.
 * @class
 * @property {HTMLElement} root
 */
import { ColumnView } from './ColumnView.js';

export class KanbanView {
  /**
   * @param {HTMLElement} rootElement
   */
  constructor(rootElement) {
    this.root = rootElement;
  }

  /**
   * Affiche le board avec colonnes et tickets
   * @param {Column[]} columns
   */
  renderBoard(columns) {
    this.root.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'kanban-board';
    columns.forEach(col => {
      const colView = new ColumnView(col);
      board.appendChild(colView.render());
    });
    this.root.appendChild(board);
  }
}
