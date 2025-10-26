/*
 * @class
 * Represents a user in the Kanban system.
 * @property {string} id - Unique identifier for the user.
 * @property {string} name - Human-readable name of the user.
 */

export class User {
  /**
   * @param {number|string} id
   * @param {string} name
   */
  constructor(id, name) {
    this.id = String(id);
    this.name = name;

  }
}