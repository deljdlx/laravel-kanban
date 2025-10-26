import { Ticket } from './Ticket.js';
import { Board } from './Board.js';

/** @class
 * 
 * @property {string} id
 * @property {string} name
 * @property {Ticket[]} tickets
 * 
*/
export class Column {
  /**
   * @param {Board} board
   * @param {string} id
   * @param {string} name
   * @param {Ticket[]} [tickets]
   */
  constructor(board, id, name, tickets = []) {
    this.board = board;
    this.id = id;
    this.name = name;
    this.tickets = tickets;
  }

  addTicket(ticket) {
    this.tickets.push(ticket);
  }

  /**
   * Insère un ticket à une position.
   * @param {Ticket} ticket
   * @param {number} index
   */
  insertAt(ticket, index) {
    const i = Math.max(0, Math.min(index, this.tickets.length));
    this.tickets.splice(i, 0, ticket);
  }

  /**
   * Supprime un ticket (par id) et le renvoie.
   * @param {string} ticketId
   * @returns {Ticket|null}
   */
  removeById(ticketId) {
    const idx = this.tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return null;
    const [t] = this.tickets.splice(idx, 1);
    return t;
  }
}

