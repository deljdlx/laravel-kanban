
/** @class
 * 
 * A Term represents a label or category that can be assigned to tasks or items within the Kanban board.
 * It consists of a unique identifier and a human-readable name.
 * @property {string} id
 * @property {string} name
 * 
 * 
*/

export class Term {
  /**
   * @param {object} payload - {id, name}
   */
  constructor(payload = {}) {
    this.id = String(payload.id);
    this.name = payload.name || '';
  }

  getName() {
    return this.name;
  }
}