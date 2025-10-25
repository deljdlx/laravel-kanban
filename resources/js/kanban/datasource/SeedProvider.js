import { BoardMetaNormalizer } from './BoardMetaNormalizer';

/**
 * SeedProvider
 * - Génère le board et les colonnes de départ pour le Kanban
 * - Accepte une factory (fonction ou objet) et un normalizer
 */
export class SeedProvider {
  /**
   * @param {Function|Object} factoryOrConfig - Fonction de seed ou objet de config
   * @param {BoardMetaNormalizer} normalizer - Instance pour normaliser le board
   */
  constructor(factoryOrConfig, normalizer = new BoardMetaNormalizer()) {
    this.factory = factoryOrConfig;
    this.normalizer = normalizer;
  }

  /**
   * Retourne un board par défaut (vide)
   * @returns {{ taxonomies: Object, authors: Array }}
   */
  defaultBoard() {
    return this.normalizer.defaultBoard();
  }

  /**
   * Génère le seed initial (board + colonnes)
   * @returns {{ board: Object, columns: Array }}
   */
  seed() {
    const seed = this.#getSeedFromFactory();
    if (Array.isArray(seed)) {
      // Cas: la factory retourne directement un tableau de colonnes
      return { board: this.defaultBoard(), columns: seed };
    }
    if (seed && typeof seed === 'object') {
      // Cas: la factory retourne un objet { board, columns }
      const board = this.normalizer.normalize(seed.board || this.defaultBoard());
      return { board, columns: seed.columns || [] };
    }
    // Cas: rien ou format inattendu
    return { board: this.defaultBoard(), columns: [] };
  }

  /**
   * Détecte et retourne le seed à partir de la factory
   * @private
   * @returns {Object|Array|null}
   */
  #getSeedFromFactory() {
    if (typeof this.factory === 'function') {
      try {
        return this.factory();
      } catch {
        // Erreur dans la factory, on ignore
        return null;
      }
    }
    if (this.factory && typeof this.factory === 'object') {
      return this.factory;
    }
    return null;
  }
}
