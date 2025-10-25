
/**
 * TicketService
 * - Encapsule les opérations sur les tickets (création, édition, suppression, etc.)
 */
export class TicketService {
  /**
   * @param {Object} deps
   * @param {any} deps.view - Vue Kanban (UI)
   * @param {any} deps.state - État Kanban
   * @param {any} [deps.logger] - Logger/debug
   */
  constructor({ view, state, logger }) {
    this.view = view;
    this.state = state;
    this.logger = logger;
  }

  /**
   * Ouvre le popup de création de ticket, gère le submit et l’ajout au board
   * @param {string} [columnId] - ID de la colonne cible
   */
  openCreateTicketPopup(columnId) {
    const form = NewTicketForm({
      getOptions: (k) => this.state.getTaxonomyOptions(k),
      getKeys: () => this.state.getTaxonomyKeys(),
      getMeta: (k) => this.state.getTaxonomyMeta(k),
      getAuthors: () => Array.isArray(this.state.board?.authors) ? this.state.board.authors : [],
    });

    this.view.popup.open({
      title: 'Créer un ticket',
      content: () => {
        setTimeout(() => {
          form.el.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.el.checkValidity?.() && form.el.reportValidity) {
              form.el.reportValidity();
              return;
            }
            const data = form.getData();
            const targetCol = columnId ? this.state.columns.find(c => c.id === columnId) : this.state.columns[0];
            if (!targetCol) return;
            const ticket = {
              id: undefined,
              title: data.title,
              description: data.description,
              authorId: data.authorId,
              taxonomies: data.taxonomies,
              createdAt: Date.now(),
            };
            this.logger?.debug?.('createTicket.submit', { columnId: targetCol.id, ticket });
            await this.state.addTicket(targetCol.id, ticket);
            const list = document.querySelector(`#list-${targetCol.id}`);
            const added = this.state.columns.find(c => c.id === targetCol.id)?.tickets[0] ?? ticket;
            const card = this.view.createCardElement(added);
            list?.prepend(card);
            card.setAttribute('tabindex', '-1');
            card.focus({ preventScroll: true });
            this.view.updateCounts();
            this.view.popup.close();
          }, { once: true });
        });
        return form.el;
      },
    });
  }
}
