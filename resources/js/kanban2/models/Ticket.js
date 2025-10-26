import { Taxonomy } from '../models/Taxonomy.js';

/** @class
 * @description Represents a ticket in the Kanban board.
 * @property {string} id - The unique identifier of the ticket.
 * @property {string} title - The title of the ticket.
 * @property {string} description - The description of the ticket.
 * @property {Taxonomy[]} taxonomies - The taxonomies associated with the ticket.
 * 
 * @property {object} _meta - Additional metadata for the ticket.
 * 
*/
export class Ticket {
  /**
   * @param {number|string} id
   * @param {string} title
   * @param {object} [meta]
   */
  constructor(board, payload = {}) {

    this.board = board;

    this.id = payload.id || crypto.randomUUID();
    this.title = payload.title || 'Untitled ticket';
    this.description = payload.description || '';
    this.taxonomies = payload.taxonomies || {};
  }

  getTitle() {
    return this.title;
  } 

  getDescription() {
    return this.description;
  }

  getTaxonomies() {
    return this.taxonomies;
  }
}
