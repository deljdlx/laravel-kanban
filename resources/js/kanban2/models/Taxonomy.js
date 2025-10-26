import { Term } from './Term.js';

/**
 * @class
 * @property {string} id
 * @property {string} name
 * @property {Term[]} terms
 */


export class Taxonomy {
  /**
   * @param {object} payload - {id, name, terms}
   */
  constructor(payload = {}) {
    this.id = String(payload.id);
    this.name = payload.name || '';
    this.terms = payload.terms || [];
  }

  getName() {
    return this.name;
  }

  getNameByValue(value) {
    const term = this.terms.find(t => t.id === value);
    return term ? term.name : '';
  }

  getTermById(termId) {
    return this.terms.find(t => t.id === termId) ?? null;
  }
}