
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
   * @param {number|string} id
   * @param {string} name
   */
  constructor(id, name) {
    this.id = String(id);
    this.name = name;
  }
}