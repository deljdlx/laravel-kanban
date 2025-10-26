import Sortable from 'sortablejs';
import { ColumnView } from './ColumnView.js';

/** @class
 * @property {HTMLElement} root
 * @property {Board} board
 * @property {Sortable[]} sortables
 * 
*/
export class BoardView {
  /**
   * @param {HTMLElement} rootElement
   * @param {Board} board
   */
  constructor(rootElement, board) {
    this.root = rootElement;
    this.board = board;
    /** @type {Sortable[]} */
    this.sortables = [];

    this.listeners = { };
  }

  addEventListener(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  fireEvent(eventName, detail = {}) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(cb => cb({ type: eventName, detail }));
    }
  }

  render() {
    this.root.innerHTML = '';
    const boardEl = document.createElement('div');
    boardEl.className = 'kanban-board';

    this.board.columns.forEach(col => {
      const colView = new ColumnView(col);
      boardEl.appendChild(colView.render());
    });

    this.root.appendChild(boardEl);
    this._initSortables();
  }

  _initSortables() {
    // cleanup
    this.sortables.forEach(s => s.destroy());
    this.sortables = [];

    /** @type {NodeListOf<HTMLElement>} */
    const lists = this.root.querySelectorAll('.kanban-tickets');

    lists.forEach(list => {

      const sortable = Sortable.create(list, {
        group: { name: 'kanban', pull: true, put: true },
        direction: 'vertical',
        animation: 150,
        draggable: '.kanban-ticket',

        ghostClass: 'kanban-placeholder',
        chosenClass: 'kanban-chosen',
        dragClass: 'kanban-drag',

        // ⇣ plus permissif pour insérer ENTRE les tickets et en fin de liste
        swapThreshold: 1,             // “snap” dès qu’on est dans la liste
        invertSwap: true,
        invertedSwapThreshold: 0.8,
        emptyInsertThreshold: 40,     // colonnes vides + fond de liste

        // ⇣ comportement stable multi-navigateurs
        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 4,

        // ⇣ évite que des parents mangent les events
        dragoverBubble: true,

        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 14,

        onAdd: ({ item, to, newIndex }) => {
          const id = item.dataset.id;
          const colId = to.dataset.columnId;
          // this.board.moveTicket(id, colId, newIndex);

          const customEvent = new CustomEvent('ticketMoved', {
            detail: { ticketId: id, toColumnId: colId, toIndex: newIndex }
          });

          this.fireEvent('ticketMoved', { ticketId: id, toColumnId: colId, toIndex: newIndex });
          this.root.dispatchEvent(customEvent);

        },
        onEnd: ({ item, to, from, oldIndex, newIndex }) => {
          if (to === from && oldIndex !== newIndex) {
            // this.board.reorderInsideColumn(item.dataset.id, newIndex);
            const customEvent = new CustomEvent('ticketReordered', {
              detail: { ticketId: item.dataset.id, newIndex: newIndex }
            });
            this.fireEvent('ticketReordered', { ticketId: item.dataset.id, newIndex: newIndex });
            this.root.dispatchEvent(customEvent);
          }
        }
      });

      this.sortables.push(sortable);
    });
  }
}