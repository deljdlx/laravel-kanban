import escapeHtml from '../utils/escapeHtml';

/**
 * NewTicketForm
 * - Rend un formulaire de création de ticket
 * - Retourne { el, getData }
 *
 * @param {Object} options
 * @param {Function} options.getOptions - Retourne les options pour une taxonomie
 * @param {Function} options.getKeys - Retourne les clés de taxonomies
 * @param {Function} options.getMeta - Retourne les métadonnées d’une taxonomie
 * @param {Function} options.getAuthors - Retourne la liste des auteurs
 * @returns {{ el: HTMLFormElement, getData: Function }}
 */
export function NewTicketForm({ getOptions, getKeys, getMeta, getAuthors } = {}) {
  // Helpers par défaut si non fournis
  getOptions = getOptions || (() => []);
  getKeys = getKeys || (() => []);
  getMeta = getMeta || ((k) => ({ label: k, options: [] }));
  getAuthors = getAuthors || (() => []);

  /**
   * Rend le select pour une taxonomie
   * @param {string} key
   * @returns {string}
   */
  function renderTaxonomySelect(key) {
    const meta = getMeta(key) || { label: key, options: [] };
    const values = (meta.options || getOptions(key) || []).filter(Boolean);
    const optionsHtml = ['<option value="">--</option>']
      .concat(values.map(o => `<option value="${escapeHtml(String(o.key))}">${escapeHtml(String(o.label))}</option>`))
      .join('');
    return `
      <label class="tf-field">
        <span class="tf-label">${escapeHtml(String(meta.label || key))}</span>
        <select class="tf-input" name="${key}">${optionsHtml}</select>
      </label>
    `;
  }

  /**
   * Rend le select des auteurs
   * @returns {string}
   */
  function renderAuthorSelect() {
    const authors = getAuthors() || [];
    const optionsHtml = ['<option value="">--</option>']
      .concat(authors.map(a => `<option value="${escapeHtml(String(a.id))}">${escapeHtml(String(a.name))}</option>`))
      .join('');
    return `
      <label class="tf-field">
        <span class="tf-label">Auteur</span>
        <select class="tf-input" name="authorId">${optionsHtml}</select>
      </label>
    `;
  }

  /**
   * Rend le markup du formulaire
   * @returns {string}
   */
  function renderForm() {
    const taxoKeys = getKeys().filter(Boolean);
    const selects = taxoKeys.map(renderTaxonomySelect);
    const firstSelect = selects.shift();
    const rowsAfter = [];
    for (let i = 0; i < selects.length; i += 2) {
      rowsAfter.push(`<div class="tf-row">${selects[i] || ''}${selects[i+1] || ''}</div>`);
    }
    return `
      <div class="tf-grid">
        <label class="tf-field">
          <span class="tf-label">Titre</span>
          <input class="tf-input" name="title" type="text" required placeholder="Titre du ticket">
        </label>
        <label class="tf-field">
          <span class="tf-label">Description</span>
          <textarea class="tf-input" name="description" rows="3" placeholder="Description (optionnelle)"></textarea>
        </label>
        <div class="tf-row">
          ${renderAuthorSelect()}
          ${firstSelect || ''}
        </div>
        ${rowsAfter.join('')}
        <div class="tf-actions">
          <button type="submit" class="btn">Créer</button>
        </div>
      </div>
    `;
  }

  /**
   * Extrait les données du formulaire
   * @returns {{ title: string, description: string|null, authorId: string|null, taxonomies: Object }}
   */
  function getData() {
    const fd = new FormData(el);
    const title = String(fd.get('title') || '').trim();
    const description = String(fd.get('description') || '').trim() || null;
    const authorId = String(fd.get('authorId') || '').trim() || null;
    const taxonomies = getKeys().reduce((acc, key) => {
      const val = fd.get(key);
      acc[key] = val ? String(val) : null;
      return acc;
    }, {});
    return { title, description, authorId, taxonomies };
  }

  // Création du formulaire
  const el = document.createElement('form');
  el.className = 'ticket-form';
  el.innerHTML = renderForm();

  return { el, getData };
}
