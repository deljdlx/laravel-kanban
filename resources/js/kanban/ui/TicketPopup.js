import { buildTicketDetails } from './components/TicketDetails';
import { escapeHtml } from '../utils/escapeHtml';

import { TicketCard } from './TicketCard';
import { TicketForm } from './TicketForm';

import { Commentaire } from '../models/Commentaire';



/**
 * @property { TicketCard } card
 * @property { State} state
 * @property { Board} board
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
    this.state = card.state;
    this.board = card.board;
    this.ticket = card.ticket;

    this.el = el;
    this.data = data;
    this.modal = modal;
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
    this.commentsNode = document.createElement('div');


    this.commentsNode.className = 'kanban-comments-list';
    const comments = Array.isArray(this.data.comments) ? this.data.comments : [];
    this.renderComments(comments);

    // Formulaire d’ajout de commentaire
    this.commentForm = document.createElement('form');
    this.commentForm.className = 'kanban-comment-form';
    this.commentForm.innerHTML = `
      <textarea name="comment" rows="2" style="width:100%;margin-bottom:6px;resize:vertical;" placeholder="Ajouter un commentaire..."></textarea>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button type="submit" class="btn btn-primary">Envoyer</button>
      </div>
    `;
    this.commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveComment();
    });
    const commentsTab = tabs.querySelector('[data-tab-content="comments"]');
    commentsTab.appendChild(this.commentsNode);
    commentsTab.appendChild(this.commentForm);
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
        // this.card.openEditPopup(this.el, this.data);
        this.openEditPopup(this.el, this.data);
      });
      infoNode.querySelector('[data-delete]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDeleteConfirm(this.el);
      });
    });
    return tabs;
  }

  saveComment() {
      const textarea = this.commentForm.querySelector('textarea[name="comment"]');
      const text = textarea.value.trim();
      if (!text) return;
      const author = (Array.isArray(this.authors) && this.authors[0]?.name) ? this.authors[0].name : 'Anonyme';
      const authorId = (Array.isArray(this.authors) && this.authors[0]?.id) ? this.authors[0].id : null;
      const commentaire = new Commentaire(text, {
          ticketId: this.data.id,
          author,
          authorId
      });

      if (typeof this.data.addComment === 'function') {
        this.data.addComment(commentaire);
      } else {
        if (!Array.isArray(this.data.comments)) this.data.comments = [];
        this.data.comments.push(commentaire);
      }
      textarea.value = '';
      this.renderComments(this.data.comments);
      if (this.state && typeof this.state.updateTicket === 'function') {
        this.state.updateTicket(this.data.id, { comments: this.data.comments });
      }
  }

  renderComments(comments) {
    if (comments.length === 0) {
      this.commentsNode.innerHTML = `<div style="padding:8px; color:#888;">Aucun commentaire pour le moment.</div>`;
    } else {
      this.commentsNode.innerHTML = comments.map(c => `
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
      const card = this.card.board.createCardElement({ ...ticket, ...data });
      el.replaceWith(card);
      this.board.updateCounts();
      this.card.popup.close();
    };
    setTimeout(() => {
      form.el.addEventListener('submit', onSubmit, { once: true });
    });
    this.card.popup.open({
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

    this.card.popup.open({
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
          cancel?.addEventListener('click', () => this.card.popup.close());
          confirm?.addEventListener('click', async () => {
            try {
              await this.card.onRemove?.(id, el, this.ticket);
            } finally {
              this.card.popup.close();
            }
          });
        });
        return wrap;
      }
    });
  }
}