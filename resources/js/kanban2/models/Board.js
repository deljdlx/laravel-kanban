import { Taxonomy } from './Taxonomy.js';
import { Column } from './Column.js';
import { User } from './User.js';


/**
 * @class
 * @property {Column[]} columns
 * @property {Taxonomy[]} taxonomies
 * @property {User[]} users
 */

export class Board {

  constructor(columns = [], taxonomies = [], users = []) {
    this.columns = columns;
    this.taxonomies = taxonomies;
    this.users = users;
  }

  addColumn(column) {
    this.columns.push(column);
  }

  addTaxonomy(taxonomy) {
    this.taxonomies.push(taxonomy);
  }

  getTaxonomies() {
    return this.taxonomies;
  }

  getTaxonomyById(taxonomyId) {
    return this.taxonomies.find(t => t.id === taxonomyId) ?? null;
  }


  /**
   * Trouve une colonne par id.
   * @param {string} columnId
   * @returns {Column|null}
   */
  column(columnId) {
    return this.columns.find(c => c.id === columnId) ?? null;
  }
}
