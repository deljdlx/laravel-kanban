/**
 * Commentaire: modèle pour les commentaires de ticket Kanban
 * @property {string} id - Identifiant unique du commentaire
 * @property {string} ticketId - Identifiant du ticket associé
 * @property {string} authorId - Identifiant de l’auteur
 * @property {string} author - Nom de l’auteur
 * @property {string} text - Texte du commentaire
 * @property {number} createdAt - Timestamp de création
 */
class Commentaire {
  /**
   * @param {string} text
   * @param {Object} opts
   * @param {string} [opts.id]
   * @param {string} [opts.ticketId]
   * @param {string} [opts.authorId]
   * @param {string} [opts.author]
   * @param {number} [opts.createdAt]
   */
  constructor(text, opts = {}) {
    this.id = opts.id || Commentaire.generateId();
    this.ticketId = opts.ticketId || null;
    this.authorId = opts.authorId || null;
    this.author = opts.author || null;
    this.text = text;
    this.createdAt = opts.createdAt || Date.now();
  }

  /**
   * Génère un identifiant unique
   * @returns {string}
   */
  static generateId() {
    return 'cmt_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
  }

  /**
   * Sérialise le commentaire en JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      ticketId: this.ticketId,
      authorId: this.authorId,
      author: this.author,
      text: this.text,
      createdAt: this.createdAt
    };
  }

  /**
   * Instancie un commentaire à partir d’un objet JSON
   * @param {Object} json
   * @returns {Commentaire}
   */
  static fromJSON(json) {
    return new Commentaire(json.text, json);
  }
}

export default Commentaire;
