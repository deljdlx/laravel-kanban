/**
 * Représente un ticket du Kanban.
 * @class
 * @property {string} id
 * @property {string} title
 * @property {string} description
 */
export class Ticket {
  constructor({ id, title, description }) {
    this.id = id;
    this.title = title;
    this.description = description || '';
  }
}
