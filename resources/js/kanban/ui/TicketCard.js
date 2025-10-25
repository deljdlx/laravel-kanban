/**
 * TicketCard (vue de carte) — guide débutant:
 * - Cette classe affiche une carte et gère les clics/suppression via des callbacks.
 * - Elle ne devrait pas connaître les détails du stockage.
 * - Pour changer le système de popup, passe un service modal dans les options au lieu d'utiliser board.popup.
 */
import formatTicketDate from '../utils/formatDate';
import escapeHtml from '../utils/escapeHtml';
import { sanitizeTaxonomies, legacyToTaxonomies } from '../utils/taxonomies';
import { renderTaxonomyChip } from './components/TaxonomyChip';
import { buildTicketDetails } from './components/TicketDetails';

import { TicketForm } from './TicketForm.js';

/** @typedef {import('../KanbanView').KanbanView} KanbanView */
/** @typedef {import('../models/KanbanState').default} KanbanState */

/**
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} title
 * @property {string|null} [description]
 * @property {string|null} [author]
 * @property {string|null} [authorId]
 * @property {Record<string, string|null>} [taxonomies]
 * @property {number} [createdAt]
 * @property {string|null} [label]    legacy
 * @property {string|null} [category] legacy
 * @property {string|null} [complexity] legacy
 */

/**
 * @typedef {Object} TicketCardOptions
 * @property {(id: string, el: HTMLElement) => void} [onClick]
 * @property {(id: string, el: HTMLElement) => void} [onRemove]
 * @property {Object<string, Set<string>>} [allowedMap]
 * @property {{ id: string, name: string }[]} [authors]
 */

/**
 * TicketCard: agnostic UI component for rendering a ticket card element.
 * - No state or datasource dependency
 * - Accepts callbacks for interactions
 * - Can receive an allowedMap to sanitize taxonomies against board meta
 */
class TicketCard {
  /**
   * Ouvre le popup de détails du ticket
   * @param {HTMLElement} el
   * @param {Ticket} data
   */
  openDetailsPopup(el, data) {
    const modal = this?.opts?.modal;
    const buildContent = () => {
      const authors = Array.isArray(this?.opts?.authors) ? this.opts.authors : (Array.isArray(this.state.board?.authors) ? this.state.board.authors : []);
      // Tabs container
      const tabs = document.createElement('div');
      tabs.className = 'kanban-popup-tabs';
      tabs.innerHTML = `
        <div class="tab-header" style="display:flex; gap:8px; margin-bottom:8px;">
          <button type="button" class="btn btn-light tab-btn" data-tab="info">Infos</button>
          <button type="button" class="btn btn-light tab-btn" data-tab="comments">Commentaires</button>
        </div>
        <div class="tab-content" data-tab-content="info"></div>
        <div class="tab-content" data-tab-content="comments" style="display:none;"></div>
      `;
      // Info tab content
      const infoNode = buildTicketDetails({ ticket: data, getTaxonomyMeta: (k) => this.getTaxonomyMeta(k), authors });
      const actions = document.createElement('div');
      actions.className = 'tf-actions';
      actions.style.marginTop = '8px';
      actions.innerHTML = `
        <button type="button" class="btn btn-primary" data-edit>Éditer</button>
        <button type="button" class="btn btn-danger" data-delete>Supprimer</button>
      `;
      infoNode.appendChild(actions);
      tabs.querySelector('[data-tab-content="info"]').appendChild(infoNode);
      // Comments tab content (affiche les vrais commentaires + formulaire)
      const commentsNode = document.createElement('div');
      commentsNode.className = 'kanban-comments-list';
      const comments = Array.isArray(data.comments) ? data.comments : [];
      const renderComments = () => {
        if (comments.length === 0) {
          commentsNode.innerHTML = `<div style="padding:8px; color:#888;">Aucun commentaire pour le moment.</div>`;
        } else {
          commentsNode.innerHTML = comments.map(c => `
            <div class="kanban-comment" style="border-bottom:1px solid #eee; padding:8px 0;">
              <div style="font-size:13px; color:#555; margin-bottom:2px;">
                <span style="font-weight:bold;">${escapeHtml(c.author || 'Anonyme')}</span>
                <span style="color:#aaa; font-size:12px; margin-left:8px;">${new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <div style="font-size:14px;">${escapeHtml(c.text)}</div>
            </div>
          `).join('');
        }
      };
      renderComments();

      // Formulaire d’ajout de commentaire
      const form = document.createElement('form');
      form.className = 'kanban-comment-form';
      form.innerHTML = `
        <textarea name="comment" rows="2" style="width:100%;margin-bottom:6px;resize:vertical;" placeholder="Ajouter un commentaire..."></textarea>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button type="submit" class="btn btn-primary">Envoyer</button>
        </div>
      `;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = form.querySelector('textarea[name="comment"]');
        const text = textarea.value.trim();
        if (!text) return;
        let Commentaire = null;
        try { Commentaire = require('../models/Commentaire').default; } catch { Commentaire = window.Commentaire; }
        const author = (Array.isArray(authors) && authors[0]?.name) ? authors[0].name : 'Anonyme';
        const authorId = (Array.isArray(authors) && authors[0]?.id) ? authors[0].id : null;
        const commentaire = Commentaire ? new Commentaire(text, { ticketId: data.id, author, authorId }) : { text, author, authorId, ticketId: data.id, createdAt: Date.now() };
        if (typeof data.addComment === 'function') {
          data.addComment(commentaire);
        } else {
          if (!Array.isArray(data.comments)) data.comments = [];
          data.comments.push(commentaire);
        }
        textarea.value = '';
        renderComments();
        if (this.state && typeof this.state.updateTicket === 'function') {
          this.state.updateTicket(data.id, { comments: data.comments });
        }
      });
      const commentsTab = tabs.querySelector('[data-tab-content="comments"]');
      commentsTab.appendChild(commentsNode);
      commentsTab.appendChild(form);
      // Tab switching logic
      const btns = tabs.querySelectorAll('.tab-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.getAttribute('data-tab');
          tabs.querySelectorAll('.tab-content').forEach(tc => {
            tc.style.display = tc.getAttribute('data-tab-content') === tab ? '' : 'none';
          });
        });
      });
      // Default active tab
      btns[0].classList.add('active');
      // Actions listeners
      setTimeout(() => {
        infoNode.querySelector('[data-edit]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditPopup(el, data);
        });
        infoNode.querySelector('[data-delete]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openDeleteConfirm(el);
        });
      });
      return tabs;
    };

    if (modal && typeof modal.open === 'function') {
      const handle = modal.open({ title: data?.title || 'Ticket', body: buildContent() });
      this._lastModal = handle;
      return;
    }

    this.popup.open({
      title: data?.title || 'Ticket',
      content: buildContent
    });
  }
  /**
   * @param {KanbanView} board
   * @param {Object} ticket
   * @param {string} ticket.id
   * @param {string} ticket.title
   * @param {(string|null)} [ticket.description]
   * @param {(string|null)} [ticket.author]
   * @param {Object<string, (string|null)>} [ticket.taxonomies]
   * @param {number} [ticket.createdAt]
   * @param {(string|null)} [ticket.label] Legacy support
   * @param {(string|null)} [ticket.category] Legacy support
   * @param {(string|null)} [ticket.complexity] Legacy support
   * @param {Object} [opts]
   * @param {(id: string, el: HTMLElement) => void} [opts.onClick]
   * @param {(id: string, el: HTMLElement) => void} [opts.onRemove]
   * @param {Object<string, Set<string>>} [opts.allowedMap] Map of taxonomyKey -> Set of allowed option keys
   */


  /**
   * @type  {KanbanView}
   */
  board = null;

  /**
   * @type {KanbanState}
   */
  state = null;

  /**
   * @param {KanbanView} board - la vue kanban parente (fournit l'état et les utilitaires)
   * @param {Ticket} ticket - les données de la carte
   * @param {TicketCardOptions} [opts] - callbacks et options UI
   */
  constructor(board, ticket, opts = {}) {
    this.board = board;
    this.state = board.getState();
    this.popup = board.popup;
    this.opts = opts;


    const tx = sanitizeTaxonomies(ticket?.taxonomies || legacyToTaxonomies(ticket || {}), opts.allowedMap);
    this.ticket = { ...ticket, taxonomies: tx };
    this.onRemove = opts.onRemove;
  }


  // note: rendering of taxonomy chips is centralized in components/TaxonomyChip.js used directly in render()

  /**
   * @param {string} key
   * @returns {{ label: string, options: Array<{key: string, label: string}> }|undefined}
   */
  getTaxonomyMeta(key) {
    return this.board.getState().getTaxonomyMeta?.(key);
  }



  /**
   * Ouvre les détails du ticket dans une popup
   * @param {string} id
   * @param {HTMLElement} el
   * @param {Ticket} data
   */
  onClick(id, el, data) {
    this.openDetailsPopup(el, data);
  }
// ...existing code...

  /**
   * Ouvre le popup d’édition du ticket et gère la mise à jour
   * @param {HTMLElement} el - Élément DOM de la carte
   * @param {Object} ticket - Données du ticket à éditer
   */
  openEditPopup(el, ticket) {
    // Utilise le service TicketService injecté via la vue
    const ticketService = this.board?.services?.ticketService;
    if (ticketService && typeof ticketService.openEditTicketPopup === 'function') {
      ticketService.openEditTicketPopup(ticket, el);
      return;
    }
    const form = TicketForm({
      getOptions: (k) => this.state.getTaxonomyOptions(k),
      getKeys: () => this.state.getTaxonomyKeys(),
      getMeta: (k) => this.state.getTaxonomyMeta(k),
      getAuthors: () => Array.isArray(this.state.board?.authors) ? this.state.board.authors : [],
      ticket,
      mode: 'edit'
    });
    const onSubmit = async (e) => {
      e.preventDefault();
      if (!form.el.checkValidity?.() && form.el.reportValidity) {
        form.el.reportValidity();
        return;
      }
      const data = form.getData();
      await this.state.updateTicket(ticket.id, data);
      const card = this.board.createCardElement({ ...ticket, ...data });
      el.replaceWith(card);
      this.board.updateCounts();
      this.popup.close();
    };
    setTimeout(() => {
      form.el.addEventListener('submit', onSubmit, { once: true });
    });
    this.popup.open({
      title: `Éditer le ticket`,
      content: () => form.el
    });
  }

  /**
   * Ouvre le popup de confirmation de suppression du ticket
   * @param {HTMLElement} el
   */
  openDeleteConfirm(el) {
    const id = this.ticket.id;
    const title = this.ticket.title;

    const modal = this?.opts?.modal;
    if (modal && typeof modal.open === 'function') {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
          <div style="display:grid; gap:12px;">
            <p>Êtes-vous sûr de vouloir supprimer «\u00A0${escapeHtml(String(title))}\u00A0» ?</p>
            <p style="color: var(--kanban-muted); font-size: 12px;">Cette action est irréversible.</p>
          </div>
        `;

      const footer = document.createElement('div');
      footer.innerHTML = `
              <button class="btn" data-cancel>Annuler</button>
              <button class="btn btn-danger" data-confirm>Supprimer</button>
            `;

      const handle = modal.open({ title: 'Supprimer ce ticket ?', body: wrap, footer });
      footer.querySelector('[data-cancel]')?.addEventListener('click', () => handle.close());
      footer.querySelector('[data-confirm]')?.addEventListener('click', async () => {
        try {
          await this.onRemove?.(id, el, this.ticket);
        } finally {
          handle.close();
        }
      });
      return;
    }

    this.popup.open({
      title: 'Supprimer ce ticket ?',
      content: () => {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <div style="display:grid; gap:12px;">
            <p>Êtes-vous sûr de vouloir supprimer «\u00A0${escapeHtml(String(title))}\u00A0» ?</p>
            <p style="color: var(--kanban-muted); font-size: 12px;">Cette action est irréversible.</p>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn" data-cancel>Annuler</button>
              <button class="btn btn-danger" data-confirm>Supprimer</button>
            </div>
          </div>
        `;
        setTimeout(() => {
          const cancel = wrap.querySelector('[data-cancel]');
          const confirm = wrap.querySelector('[data-confirm]');
          cancel?.addEventListener('click', () => this.popup.close());
          confirm?.addEventListener('click', async () => {
            try {
              await this.onRemove?.(id, el, this.ticket);
            } finally {
              this.popup.close();
            }
          });
        });
        return wrap;
      }
    });
  }

  /**
   * Crée et retourne l'élément DOM pour la carte ticket
   */
  render() {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = this.ticket.id;
    el.setAttribute('role', 'listitem');
    el.setAttribute('aria-label', this.ticket.title);

    // Propagate taxonomy tags onto the card container (classes + data-attributes)
    const tx = this.ticket.taxonomies || {};
    const sanitize = (s) => String(s).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const txKeys = Object.keys(tx);
    if (txKeys.length) el.classList.add('has-taxonomies');
    for (const [k, v] of Object.entries(tx)) {
      const keySafe = sanitize(k);
      if (keySafe) el.classList.add(`taxo-key-${keySafe}`);
      if (v != null && v !== '') {
        const valSafe = sanitize(v);
        el.setAttribute(`data-taxo-${keySafe}`, String(v));
        if (keySafe && valSafe) el.classList.add(`taxo-${keySafe}-${valSafe}`);
      } else {
        el.setAttribute(`data-taxo-${keySafe}`, '');
      }
    }

    // Build dynamic taxonomy chips with backward-compatible classes for known keys
    const chips = [];
    for (const [k, v] of Object.entries(tx)) {
      if (v == null || v === '') continue;
      const key = String(k);
      const valKey = String(v);
      // Known taxo keys keep their legacy classes
      if (key === 'label') chips.push(`<span class="label ${valKey}">${escapeHtml(valKey.toUpperCase())}</span>`);
      else if (key === 'category') chips.push(`<span class="category cat-${valKey}">${escapeHtml(valKey)}</span>`);
      else if (key === 'complexity') chips.push(`<span class="complexity complexity-${valKey.toLowerCase()}">${escapeHtml(valKey.toUpperCase())}</span>`);
      else chips.push(`<span class="taxo-chip taxo-${escapeHtml(key)} taxo-${escapeHtml(key)}-${escapeHtml(valKey)}">${escapeHtml(valKey)}</span>`);
    }

    const descHtml = this.ticket.description ? `<div class="card-desc">${escapeHtml(this.ticket.description)}</div>` : '';

    // author rendering: prefer entity name via authorId, fallback to legacy author string
    const authors = Array.isArray(this?.opts?.authors) ? this.opts.authors : (Array.isArray(window.__kanbanAuthors) ? window.__kanbanAuthors : []);
    const authorName = (this.ticket.authorId ? (authors.find(a => a.id === this.ticket.authorId)?.name) : null) || this.ticket.author || null;

    el.innerHTML = `
      <div class="card-title">${escapeHtml(this.ticket.title)}</div>
      <div class="card-actions">
        <button type="button" class="btn btn-icon btn-danger card-delete" aria-label="Supprimer" title="Supprimer">🗑</button>
      </div>
      ${descHtml}
      <div class="card-meta">
    <span>${formatTicketDate(this.ticket.createdAt)}</span>
  ${authorName ? `<span class="author">${escapeHtml(authorName)}</span>` : ''}
    ${chips.join(' ')}
      </div>
    `;

    el.addEventListener('click', () => this.onClick(this.ticket.id, el, this.ticket));
    const delBtn = el.querySelector('.card-delete');
    delBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.openDeleteConfirm(el); });

    return el;
  }

  /**
   * Ouvre le popup d’édition du ticket et gère la mise à jour
   * @param {HTMLElement} el - Élément DOM de la carte
   * @param {Object} ticket - Données du ticket à éditer
   */
  openEditPopup(el, ticket) {
    // Utilise le service TicketService injecté via la vue
    const ticketService = this.board?.services?.ticketService;
    if (ticketService && typeof ticketService.openEditTicketPopup === 'function') {
      ticketService.openEditTicketPopup(ticket, el);
      return;
    }
    // Fallback : popup simple avec formulaire d’édition
    // const TicketForm = window.TicketForm || window.NewTicketForm;
    // if (!TicketForm) {
    //   console.error('TicketForm ou NewTicketForm n’est pas disponible dans window.');
    //   return;
    // }

    const form = TicketForm({
      getOptions: (k) => this.state.getTaxonomyOptions(k),
      getKeys: () => this.state.getTaxonomyKeys(),
      getMeta: (k) => this.state.getTaxonomyMeta(k),
      getAuthors: () => Array.isArray(this.state.board?.authors) ? this.state.board.authors : [],
      ticket,
      mode: 'edit'
    });
    const onSubmit = async (e) => {
      e.preventDefault();
      if (!form.el.checkValidity?.() && form.el.reportValidity) {
        form.el.reportValidity();
        return;
      }
      const data = form.getData();
      await this.state.updateTicket(ticket.id, data);
      const card = this.board.createCardElement({ ...ticket, ...data });
      el.replaceWith(card);
      this.board.updateCounts();
      this.popup.close();
    };
    setTimeout(() => {
      form.el.addEventListener('submit', onSubmit, { once: true });
    });
    this.popup.open({
      title: `Éditer le ticket`,
      content: () => form.el
    });
  }

  openDeleteConfirm(el) {
    const id = this.ticket.id;
    const title = this.ticket.title;

    const modal = this?.opts?.modal;
    if (modal && typeof modal.open === 'function') {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
          <div style="display:grid; gap:12px;">
            <p>Êtes-vous sûr de vouloir supprimer «\u00A0${escapeHtml(String(title))}\u00A0» ?</p>
            <p style="color: var(--kanban-muted); font-size: 12px;">Cette action est irréversible.</p>
          </div>
        `;

      const footer = document.createElement('div');
      footer.innerHTML = `
              <button class="btn" data-cancel>Annuler</button>
              <button class="btn btn-danger" data-confirm>Supprimer</button>
            `;

      const handle = modal.open({ title: 'Supprimer ce ticket ?', body: wrap, footer });
      footer.querySelector('[data-cancel]')?.addEventListener('click', () => handle.close());
      footer.querySelector('[data-confirm]')?.addEventListener('click', async () => {
        try {
          await this.onRemove?.(id, el, this.ticket);
        } finally {
          handle.close();
        }
      });
      return;
    }

    this.popup.open({
      title: 'Supprimer ce ticket ?',
      content: () => {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
          <div style="display:grid; gap:12px;">
            <p>Êtes-vous sûr de vouloir supprimer «\u00A0${escapeHtml(String(title))}\u00A0» ?</p>
            <p style="color: var(--kanban-muted); font-size: 12px;">Cette action est irréversible.</p>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn" data-cancel>Annuler</button>
              <button class="btn btn-danger" data-confirm>Supprimer</button>
            </div>
          </div>
        `;
        setTimeout(() => {
          const cancel = wrap.querySelector('[data-cancel]');
          const confirm = wrap.querySelector('[data-confirm]');
          cancel?.addEventListener('click', () => this.popup.close());
          confirm?.addEventListener('click', async () => {
            try {
              await this.onRemove?.(id, el, this.ticket);
            } finally {
              this.popup.close();
            }
          });
        });
        return wrap;
      }
    });
  }




  /** Create and return the DOM element for the ticket card */
  render() {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = this.ticket.id;
    el.setAttribute('role', 'listitem');
    el.setAttribute('aria-label', this.ticket.title);

    // Propagate taxonomy tags onto the card container (classes + data-attributes)
    const tx = this.ticket.taxonomies || {};
    const sanitize = (s) => String(s).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const txKeys = Object.keys(tx);
    if (txKeys.length) el.classList.add('has-taxonomies');
    for (const [k, v] of Object.entries(tx)) {
      const keySafe = sanitize(k);
      if (keySafe) el.classList.add(`taxo-key-${keySafe}`);
      if (v != null && v !== '') {
        const valSafe = sanitize(v);
        el.setAttribute(`data-taxo-${keySafe}`, String(v));
        if (keySafe && valSafe) el.classList.add(`taxo-${keySafe}-${valSafe}`);
      } else {
        el.setAttribute(`data-taxo-${keySafe}`, '');
      }
    }

    // Build dynamic taxonomy chips with backward-compatible classes for known keys
    const chips = [];
    for (const [k, v] of Object.entries(tx)) {
      if (v == null || v === '') continue;
      const key = String(k);
      const valKey = String(v);
      // Known taxo keys keep their legacy classes
      if (key === 'label') chips.push(`<span class="label ${valKey}">${escapeHtml(valKey.toUpperCase())}</span>`);
      else if (key === 'category') chips.push(`<span class="category cat-${valKey}">${escapeHtml(valKey)}</span>`);
      else if (key === 'complexity') chips.push(`<span class="complexity complexity-${valKey.toLowerCase()}">${escapeHtml(valKey.toUpperCase())}</span>`);
      else chips.push(`<span class="taxo-chip taxo-${escapeHtml(key)} taxo-${escapeHtml(key)}-${escapeHtml(valKey)}">${escapeHtml(valKey)}</span>`);
    }

    const descHtml = this.ticket.description ? `<div class="card-desc">${escapeHtml(this.ticket.description)}</div>` : '';

    // author rendering: prefer entity name via authorId, fallback to legacy author string
    const authors = Array.isArray(this?.opts?.authors) ? this.opts.authors : (Array.isArray(window.__kanbanAuthors) ? window.__kanbanAuthors : []);
    const authorName = (this.ticket.authorId ? (authors.find(a => a.id === this.ticket.authorId)?.name) : null) || this.ticket.author || null;

    el.innerHTML = `
      <div class="card-title">${escapeHtml(this.ticket.title)}</div>
      <div class="card-actions">
        <button type="button" class="btn btn-icon btn-danger card-delete" aria-label="Supprimer" title="Supprimer">🗑</button>
      </div>
      ${descHtml}
      <div class="card-meta">
    <span>${formatTicketDate(this.ticket.createdAt)}</span>
  ${authorName ? `<span class="author">${escapeHtml(authorName)}</span>` : ''}
    ${chips.join(' ')}
      </div>
    `;

  el.addEventListener('click', () => this.onClick(this.ticket.id, el, this.ticket));
  const delBtn = el.querySelector('.card-delete');
  delBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.openDeleteConfirm(el); });

    return el;
  }
}

export default TicketCard;
