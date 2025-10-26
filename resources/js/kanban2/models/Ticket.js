/** @class */
export class Ticket {
  /**
   * @param {number|string} id
   * @param {string} title
   * @param {object} [meta]
   */
  constructor(title, meta = {}, id = null) {
    this.title = title;
    this.meta = meta;

    this.id = id ? String(id) : crypto.randomUUID();
  }
}
