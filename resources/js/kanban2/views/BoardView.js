import Sortable from 'sortablejs';
import { ColumnView } from './ColumnView.js';

import { View } from './View.js';

/** @class
 * @property {HTMLElement} root
 * @property {Board} board
 * @property {Sortable[]} sortables
 */
export class BoardView {
  /**
   * @param {HTMLElement} rootElement
   * @param {Board} board
   */
  constructor(rootElement, board) {
    this.board = board;
    this.model = board;

    this.root = rootElement;
    /** @type {Sortable[]} */
    this.sortables = [];
    /** @type {Sortable|null} */
    this.columnsSortable = null;
    /** @type {HTMLElement|null} */
    this.boardEl = null;

    this.listeners = {};

    this.columns = [];
  }


  getModel() {
    return this.board;
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

  getColumns() {
    return this.columns;
  }

  getColumnById(columnId) {
    return this.columns.find(c => c.column.id === columnId) || null;
  }

  render() {
    this.root.innerHTML = '';
    const boardEl = document.createElement('div');
    boardEl.className = 'kanban-board';
    this.boardEl = boardEl;

    this.board.columns.forEach(col => {
      const colView = new ColumnView(this, col);
      const colEl = colView.render();
      // s'assure que chaque colonne porte un id exploitable par Sortable
      colEl.dataset.columnId = col.id;
      boardEl.appendChild(colEl);

      this.columns.push(colView);
    });

    this.root.appendChild(boardEl);

    this._initColumnsSortable();  // ← NEW (colonnes)
    this._initSortables();        // ← tickets
  }

  /**
   * Drag & drop des colonnes (horizontal)
   */
  _initColumnsSortable() {
    // cleanup
    if (this.columnsSortable) {
      this.columnsSortable.destroy();
      this.columnsSortable = null;
    }

    if (!this.boardEl) return;

    this.columnsSortable = Sortable.create(this.boardEl, {
      group: { name: 'kanban-columns', pull: false, put: false },
      animation: 150,
      direction: 'horizontal',
      draggable: '.kanban-column',
      // handle: '.kanban-column-title', // ← décommente si tu veux drag uniquement via le header
      ghostClass: 'kanban-column-ghost',
      chosenClass: 'kanban-column-chosen',
      dragClass: 'kanban-column-drag',
      swapThreshold: 0.6,
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 4,
      scroll: true,
      scrollSensitivity: 40,
      scrollSpeed: 16,

      onEnd: ({ from, oldIndex, newIndex, item }) => {
        if (oldIndex === newIndex) return;
        const columnId = item?.dataset?.columnId;

        // Si tu as un modèle Board avec un reorder de colonnes, branche-le ici
        // this.board.reorderColumn(columnId, newIndex);

        // events custom
        this.fireEvent('columnReordered', { columnId, oldIndex, newIndex });
        this.root.dispatchEvent(
          new CustomEvent('columnReordered', { detail: { columnId, oldIndex, newIndex } })
        );
      }
    });
  }

  /**
   * Drag & drop des tickets (vertical, inter-colonnes)
   */
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

        // plus permissif pour déposer entre/fin de liste
        swapThreshold: 1,
        invertSwap: true,
        invertedSwapThreshold: 0.8,
        emptyInsertThreshold: 40,

        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 4,

        dragoverBubble: true,

        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 14,

        onAdd: ({ item, to, newIndex }) => {
          const id = item.dataset.id;
          const colId = to.dataset.columnId;

          this.fireEvent('ticketMoved', { ticketId: id, toColumnId: colId, toIndex: newIndex });
          this.root.dispatchEvent(
            new CustomEvent('ticketMoved', { detail: { ticketId: id, toColumnId: colId, toIndex: newIndex } })
          );
        },

        onEnd: ({ item, to, from, oldIndex, newIndex }) => {
          if (to === from && oldIndex !== newIndex) {
            this.fireEvent('ticketReordered', { ticketId: item.dataset.id, newIndex });
            this.root.dispatchEvent(
              new CustomEvent('ticketReordered', { detail: { ticketId: item.dataset.id, newIndex } })
            );
          }
        }
      });

      this.sortables.push(sortable);
    });
  }
}
