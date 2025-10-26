import '../bootstrap';

// import { KanbanController } from './controllers/KanbanController.js';
import { KanbanView } from './views/KanbanView.js';
import { Column } from './models/Column.js';

import './css/main.scss';

// document.addEventListener('DOMContentLoaded', () => {
//   const root = document.getElementById('kanban');
//   const view = new KanbanView(root);
//   const controller = new KanbanController(view);
//   controller.init();
// });


/**
 * Modèles ==========================================================
 */

/** @class */
class Ticket {
  /**
   * @param {number|string} id
   * @param {string} title
   * @param {object} [meta]
   */
  constructor(id, title, meta = {}) {
    this.id = String(id);
    this.title = title;
    this.meta = meta;
  }
}



/** @class */
class Board {
  /**
   * @param {Column[]} columns
   */
  constructor(columns = []) {
    this.columns = columns;
  }

  /**
   * Trouve une colonne par id.
   * @param {string} columnId
   * @returns {Column|null}
   */
  column(columnId) {
    return this.columns.find(c => c.id === columnId) ?? null;
  }

  /**
   * Trouve le ticket et sa colonne d’origine.
   * @param {string} ticketId
   * @returns {{ticket: Ticket, column: Column, index: number}|null}
   */
  locateTicket(ticketId) {
    for (const col of this.columns) {
      const idx = col.tickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) return { ticket: col.tickets[idx], column: col, index: idx };
    }
    return null;
  }

  /**
   * Déplace un ticket (inter ou intra colonne) et l’insère à l’index demandé.
   * @param {string} ticketId
   * @param {string} toColumnId
   * @param {number} toIndex
   * @returns {boolean}
   */
  moveTicket(ticketId, toColumnId, toIndex) {
    const located = this.locateTicket(ticketId);
    if (!located) return false;

    const { ticket, column: fromCol } = located;
    const toCol = this.column(toColumnId);
    if (!toCol) return false;

    // Retire de la source
    fromCol.removeById(ticketId);
    // Insère dans la cible
    toCol.insertAt(ticket, toIndex);
    return true;
  }

  /**
   * Réordonne un ticket à l’intérieur de sa colonne.
   * @param {string} ticketId
   * @param {number} newIndex
   * @returns {boolean}
   */
  reorderInsideColumn(ticketId, newIndex) {
    const located = this.locateTicket(ticketId);
    if (!located) return false;

    const { ticket, column, index: oldIndex } = located;
    if (oldIndex === newIndex) return true;

    column.tickets.splice(oldIndex, 1);
    column.insertAt(ticket, newIndex);
    return true;
  }
}

/**
 * Bootstrapping =====================================================
 */
(function bootstrap() {
  // Données d’exemple
  const todo = new Column('todo', 'À faire', [
    new Ticket(1, 'Configurer Traefik', { hint: 'reverse proxy' }),
    new Ticket(2, 'Écrire la doc Readme', { hint: 'dev onboarding' }),
    new Ticket(3, 'Préparer les envs', { hint: 'dev/staging/prod' }),
  ]);

  const doing = new Column('doing', 'En cours', [
    new Ticket(4, 'Refacto ColumnView', { hint: 'DOM direct child' }),
    new Ticket(5, 'Brancher API /persist', { hint: 'POST /tickets/move' }),
  ]);

  const done = new Column('done', 'Terminé', [
    new Ticket(6, 'Vite assets images', { hint: 'import.meta.glob' }),
  ]);

  const board = new Board([todo, doing, done]);

  const root = /** @type {HTMLElement} */ (document.getElementById('kanban-root'));
  const kanbanView = new KanbanView(root, board);
  kanbanView.render();

  // (Optionnel) expose pour debug dans la console
  // @ts-ignore
  window.__kanban = { board, kanbanView };
})();

