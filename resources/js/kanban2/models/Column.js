/**
 * Représente une colonne du Kanban.
 * @class
 * @property {string} id
 * @property {string} name
 * @property {Ticket[]} tickets
 */
export class Column {
  constructor({ id, name, tickets = [] }) {
    this.id = id;
    this.name = name;
    this.tickets = tickets;
  }
}
