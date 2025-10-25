/**
 * @typedef {Object} TicketDTO
 * @property {string} id
 * @property {string} title
 * @property {('blue'|'green'|'orange'|null)} [label]
 * @property {('bug'|'feature'|'docs'|'chore'|null)} [category]
 * @property {string|null} [description]
 * @property {string|null} [author]   // legacy display name
 * @property {string|null} [authorId] // entity id reference
 * @property {('xs'|'s'|'m'|'l'|'xl'|null)} [complexity]
 * @property {Record<string,string|null>} [taxonomies]
 * @property {number} createdAt
 */

class Ticket {
    /**
     * @type {Commentaire[]}
     */
    comments = [];

    /**
     * Ajoute un commentaire au ticket
     * @param {Commentaire} commentaire
     */
    addComment(commentaire) {
        if (commentaire && commentaire.ticketId === this.id) {
            this.comments.push(commentaire);
        }
    }

    /**
     * Retourne la liste des commentaires
     * @returns {Commentaire[]}
     */
    getComments() {
        return this.comments;
    }
    /** @type {string} Identifiant unique du ticket */
    id = '';
    /** @type {string} Titre du ticket */
    title = '';
    /** @type {string|null} Description du ticket */
    description = null;
    /** @type {string|null} Auteur (legacy display name) */
    author = null;
    /** @type {string|null} Identifiant de l'auteur (entity id) */
    authorId = null;
    /** @type {'blue'|'green'|'orange'|null} Label (legacy shim) */
    label = null;
    /** @type {'bug'|'feature'|'docs'|'chore'|null} Catégorie (legacy shim) */
    category = null;
    /** @type {'xs'|'s'|'m'|'l'|'xl'|null} Complexité (legacy shim) */
    complexity = null;
    /** @type {Record<string,string|null>|undefined} Taxonomies associées */
    taxonomies = undefined;
    /** @type {number} Timestamp de création (ms) */
    createdAt = 0;

    /**
     * Crée une instance de Ticket.
     * @param {string} title - Titre du ticket (obligatoire)
     * @param {Object} [params] - Paramètres optionnels
     * @param {string} [params.id] - Identifiant unique
     * @param {'blue'|'green'|'orange'|null} [params.label]
     * @param {'bug'|'feature'|'docs'|'chore'|null} [params.category]
     * @param {string|null} [params.description]
     * @param {string|null} [params.author]
     * @param {string|null} [params.authorId]
     * @param {'xs'|'s'|'m'|'l'|'xl'|null} [params.complexity]
     * @param {Record<string,string|null>} [params.taxonomies]
     * @param {number} [params.createdAt]
     */
    constructor(title, params = {}) {
        this.title = title;
        this.id = params.id ?? (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
        this.label = params.label ?? null;
        this.category = params.category ?? null;
        this.description = params.description ?? null;
        this.author = params.author ?? null;
        this.authorId = params.authorId ?? null;
        this.complexity = params.complexity ?? null;
        this.taxonomies = params.taxonomies ?? undefined;
        this.createdAt = params.createdAt ?? Date.now();
    }
    /** @returns {TicketDTO} */
    toJSON() {
    const base = { id: this.id, title: this.title, description: this.description, author: this.author, authorId: this.authorId, createdAt: this.createdAt };
    // Prefer taxonomies bag; fall back to legacy shim if needed
    const tx = this.taxonomies || { label: this.label ?? null, category: this.category ?? null, complexity: this.complexity ?? null };
    const comments = Array.isArray(this.comments) ? this.comments.map(c => (typeof c.toJSON === 'function' ? c.toJSON() : c)) : [];
    return { ...base, taxonomies: tx, comments };
    }
    /** @param {TicketDTO & {taxonomies?: Record<string,string|null>}} dto */
    static fromJSON(dto) {
                // Build taxonomies from explicit bag or legacy fields
                const taxonomies = dto.taxonomies ? { ...dto.taxonomies } : undefined;
                const ticket = new Ticket(dto.title, { ...dto, taxonomies });
                if (Array.isArray(dto.comments)) {
                    // eslint-disable-next-line global-require
                    const Commentaire = require('./Commentaire').default;
                    ticket.comments = dto.comments.map(c => Commentaire.fromJSON ? Commentaire.fromJSON(c) : c);
                }
                return ticket;
    }
}

export default Ticket;
