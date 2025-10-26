/**
 * Vue principale du Kanban.
 * @class
 * @property {HTMLElement} root
 */
import { ColumnView } from './ColumnView.js';
import Sortable from 'sortablejs';

export class KanbanView {
  /**
   * @param {HTMLElement} rootElement
   */
  constructor(rootElement) {
    this.root = rootElement;
    this.sortables = [];
  }

  /**
   * Affiche le board avec colonnes et tickets
   * @param {Column[]} columns
   */
  renderBoard(columns) {
    this.root.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'kanban-board';
    // Rendu des colonnes
    columns.forEach(col => {
      const colView = new ColumnView(col);
      board.appendChild(colView.render());
    });
    this.root.appendChild(board);
    // Drag & drop centralisé avec SortableJS
    this._initSortables();
  }

  /**
   * Initialise SortableJS sur toutes les colonnes
   */
// KanbanView.js
_initSortables() {
  // 1) cleanup
  this.sortables.forEach(s => s.destroy());
  this.sortables = [];

  const lists = this.root.querySelectorAll('.kanban-tickets');

  lists.forEach(list => {
    const sortable = Sortable.create(list, {
      // ✅ group uniforme et explicite
      group: { name: 'kanban', pull: true, put: true },

      // UX/fiabilité
      animation: 150,
      direction: 'vertical',
      draggable: '.kanban-ticket',
      ghostClass: 'kanban-placeholder',
      chosenClass: 'kanban-chosen',
      dragClass: 'kanban-drag',
      swapThreshold: 0.65,
      invertSwap: true,
      invertedSwapThreshold: 0.6,
      emptyInsertThreshold: 15,

      // Fallback = comportements plus prévisibles multi-navigateurs
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 5,

      // Auto-scroll (utile si board déborde)
      scroll: true,
      scrollSensitivity: 30,
      scrollSpeed: 14,

      onAdd: ({ item, to, newIndex }) => {
        const ticketId = item.dataset.id;
        const newColumnId = to.dataset.columnId;
        // TODO: maj modèle + persist
        // moveTicket(ticketId, newColumnId, newIndex)
      },
      onRemove: ({ item, from }) => {
        // (optionnel) si tu veux réagir côté source
      },
      onEnd: ({ item, to, newIndex }) => {
        // (même colonne) persist order si besoin
      }
    });

    this.sortables.push(sortable);
  });
}

}
