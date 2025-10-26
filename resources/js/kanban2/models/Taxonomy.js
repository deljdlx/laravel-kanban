import { Term } from './Term.js';

/**
 * @class
 * @property {string} id
 * @property {string} name
 * @property {Term[]} terms
 */

export class Taxonomy {
  /**
   * @param {number|string} id
   * @param {string} name
   */
  constructor(id, name, terms = []) {
    this.id = String(id);
    this.name = name;
    this.terms = terms;
  }

  getName() {
    return this.name;
  }

  getNameByValue(value) {
    const term = this.terms.find(t => t.id === value);
    return term ? term.name : '';
  }
}