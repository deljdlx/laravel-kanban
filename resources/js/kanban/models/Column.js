/**
 * @typedef {Object} ColumnDTO
 * @property {string} id
 * @property {string} name
 * @property {import('./Ticket').default[]} [tickets]
 */

import Ticket from './Ticket';

class Column {
    /** @type {string} Identifiant de la colonne (ex: 'todo', 'doing', 'done') */
    id = '';
    /** @type {string} Nom affiché de la colonne */
    name = '';
    /** @type {import('./Ticket').default[]} Tickets de la colonne */
    tickets = [];

    /**
     * Crée une instance de Column.
     * @param {string} id - Identifiant de la colonne
     * @param {string} name - Nom affiché
     * @param {import('./Ticket').default[]} [tickets] - Tickets de la colonne
     */
    constructor(id, name, tickets = []) {
        this.id = id;
        this.name = name;
        this.tickets = (tickets || []).map(t => t instanceof Ticket ? t : new Ticket(t));
    }
    /** @returns {ColumnDTO} */
    toJSON() { return { id: this.id, name: this.name, tickets: this.tickets.map(t => t.toJSON()) }; }
    /** @param {ColumnDTO} dto */
    static fromJSON(dto) { return new Column(dto.id, dto.name, (dto.tickets||[]).map(Ticket.fromJSON)); }
}

export default Column;
