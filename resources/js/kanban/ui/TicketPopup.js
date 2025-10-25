import { renderTaxonomyChip } from './components/TaxonomyChip';
import { buildTicketDetails } from './components/TicketDetails';
/**
 * TicketPopup: gère l'affichage et les interactions du popup de ticket (détails, commentaires, formulaire, actions)
 */
export class TicketPopup {
  /**
   * @param {Object} params
   * @param {TicketCard} params.card
   * @param {HTMLElement} params.el
   * @param {Object} params.data
   * @param {Object} params.modal
   */
  constructor({ card, el, data, modal }) {
    this.card = card;
    this.el = el;
    this.data = data;
    this.modal = modal;
    this.state = card.state;
    this.authors = Array.isArray(card?.opts?.authors) ? card.opts.authors : (Array.isArray(card.state.board?.authors) ? card.state.board.authors : []);
  }

  buildContent() {
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
    const infoNode = buildTicketDetails({ ticket: this.data, getTaxonomyMeta: (k) => this.card.getTaxonomyMeta(k), authors: this.authors });
    const actions = document.createElement('div');
    actions.className = 'tf-actions';
    actions.style.marginTop = '8px';
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" data-edit>Éditer</button>
      <button type="button" class="btn btn-danger" data-delete>Supprimer</button>
    `;
    infoNode.appendChild(actions);
    tabs.querySelector('[data-tab-content="info"]').appendChild(infoNode);
    // Comments tab content
    const commentsNode = document.createElement('div');
    commentsNode.className = 'kanban-comments-list';
    const comments = Array.isArray(this.data.comments) ? this.data.comments : [];
    this.renderComments(commentsNode, comments);

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
      const author = (Array.isArray(this.authors) && this.authors[0]?.name) ? this.authors[0].name : 'Anonyme';
      const authorId = (Array.isArray(this.authors) && this.authors[0]?.id) ? this.authors[0].id : null;
      const commentaire = Commentaire ? new Commentaire(text, { ticketId: this.data.id, author, authorId }) : { text, author, authorId, ticketId: this.data.id, createdAt: Date.now() };
      if (typeof this.data.addComment === 'function') {
        this.data.addComment(commentaire);
      } else {
        if (!Array.isArray(this.data.comments)) this.data.comments = [];
        this.data.comments.push(commentaire);
      }
      textarea.value = '';
      this.renderComments(commentsNode, this.data.comments);
      if (this.state && typeof this.state.updateTicket === 'function') {
        this.state.updateTicket(this.data.id, { comments: this.data.comments });
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
    btns[0].classList.add('active');
    setTimeout(() => {
      infoNode.querySelector('[data-edit]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.card.openEditPopup(this.el, this.data);
      });
      infoNode.querySelector('[data-delete]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.card.openDeleteConfirm(this.el);
      });
    });
    return tabs;
  }

  renderComments(commentsNode, comments) {
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
  }

  open(modalOrPopup) {
    if (this.modal && typeof this.modal.open === 'function') {
      const handle = this.modal.open({ title: this.data?.title || 'Ticket', body: this.buildContent() });
      return handle;
    }
    modalOrPopup.open({
      title: this.data?.title || 'Ticket',
      content: () => this.buildContent()
    });
  }
}