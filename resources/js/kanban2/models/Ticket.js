/** @class */
export class Ticket {
  /**
   * @param {number|string} id
   * @param {string} title
   * @param {object} [meta]
   */
  constructor(id, title, meta = {}) {
    this.id = String(id);
    this.title = title;
    this.meta = meta;
  }
}
