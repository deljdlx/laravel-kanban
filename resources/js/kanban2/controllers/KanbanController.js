import { Ticket } from '../models/Ticket.js';
import { Column } from '../models/Column.js';

/**
 * Contrôleur principal du Kanban.
 * @class
 * @property {KanbanView} view
 * @property {Column[]} columns
 */
export class KanbanController {
  constructor(view) {
    this.view = view;
    this.columns = [];
  }

  init() {
    // 4 colonnes de test
    this.columns = [
      new Column({ id: 'todo', name: 'À faire', tickets: [
        new Ticket({ id: 't1', title: 'Ticket 1', description: 'À faire' }),
        new Ticket({ id: 't2', title: 'Ticket 2', description: 'À faire' })
      ] }),
      new Column({ id: 'inprogress', name: 'En cours', tickets: [
        new Ticket({ id: 't3', title: 'Ticket 3', description: 'En cours' })
      ] }),
      new Column({ id: 'review', name: 'À relire', tickets: [
        new Ticket({ id: 't4', title: 'Ticket 4', description: 'À relire' })
      ] }),
      new Column({ id: 'done', name: 'Terminé', tickets: [
        new Ticket({ id: 't5', title: 'Ticket 5', description: 'Terminé' })
      ] })
    ];
    this.view.renderBoard(this.columns);
  }
}
