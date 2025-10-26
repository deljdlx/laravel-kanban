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
  constructor(title, meta = {}, id = null) {
    this.title = title;
    this.taxonomies = {};
    this.description = '';

    this._meta = meta;

    if(meta.taxonomies) {
      this.taxonomies = meta.taxonomies;
    }

    if(meta.description) {
      this.description = meta.description;
    }

    this.id = id ? String(id) : crypto.randomUUID();
  }

  getDescription() {
    return this.description;
  }

  getTaxonomies() {
    return this.taxonomies;
  }
}
