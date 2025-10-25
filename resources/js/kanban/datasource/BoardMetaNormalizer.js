
/**
 * BoardMetaNormalizer
 * - Normalise les métadonnées du board Kanban (taxonomies, auteurs, nom, image)
 * - Entrée flexible -> Sortie standardisée { taxonomies: { key: {label, options[]} }, authors[] }
 */
export class BoardMetaNormalizer {
  /**
   * Retourne un board par défaut (vide)
   * @returns {{ taxonomies: Object, authors: Array }}
   */
  defaultBoard() {
    return { taxonomies: {}, authors: [] };
  }

  /**
   * Normalise un objet meta en board standardisé
   * @param {Object} meta
   * @returns {{ taxonomies: Object, authors: Array, name?: string, backgroundImage?: string }}
   */
  normalize(meta) {
    const taxonomies = this.#normalizeTaxonomies(meta?.taxonomies);
    const authors = this.#normalizeAuthors(meta?.authors);
    const board = { taxonomies, authors };
    if (typeof meta?.name === 'string' && meta.name.trim()) {
      board.name = meta.name.trim();
    }
    if (typeof meta?.backgroundImage === 'string' && meta.backgroundImage) {
      board.backgroundImage = meta.backgroundImage;
    }
    return board;
  }

  /**
   * Transforme les taxonomies en format standardisé
   * @private
   * @param {Object} src
   * @returns {Object}
   */
  #normalizeTaxonomies(src) {
    if (!src || typeof src !== 'object') return {};
    const result = {};
    for (const [key, value] of Object.entries(src)) {
      // Cas 1: { options: [...] }
      if (value && typeof value === 'object' && (Array.isArray(value.options) || value.options instanceof Set)) {
        const optionsArr = Array.isArray(value.options) ? value.options : Array.from(value.options);
        const optionsNorm = optionsArr.map(o => (typeof o === 'object' && o && 'key' in o)
          ? o
          : { key: String(o), label: String(o) });
        result[key] = { label: value.label || key, options: optionsNorm };
      }
      // Cas 2: tableau ou Set directement
      else if (Array.isArray(value) || value instanceof Set) {
        const optionsArr = Array.isArray(value) ? value : Array.from(value);
        const optionsNorm = optionsArr.map(o => ({ key: String(o), label: String(o) }));
        result[key] = { label: key, options: optionsNorm };
      }
      // Cas inattendu
      else {
        this.#warn(`Taxonomy '${key}' ignorée: attendu { options } ou tableau, reçu`, value);
      }
    }
    return result;
  }

  /**
   * Transforme la liste d’auteurs en format standardisé
   * @private
   * @param {Array} authors
   * @returns {Array}
   */
  #normalizeAuthors(authors) {
    if (!Array.isArray(authors)) return [];
    return authors
      .filter(a => a && typeof a === 'object' && a.id && a.name)
      .map(a => ({
        id: String(a.id),
        name: String(a.name),
        avatar: a.avatar ? String(a.avatar) : undefined
      }));
  }

  /**
   * Affiche un warning lisible dans la console
   * @private
   */
  #warn(msg, extra) {
    try {
      console.warn('[Kanban config]', msg, extra ?? '');
    } catch {}
  }
}
