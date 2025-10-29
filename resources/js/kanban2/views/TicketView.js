import { Ticket } from '../models/Ticket.js';
import { TicketDetailsModal } from './modals/TicketDetailsModal.js';
import { EditTicketModal } from './modals/EditTicketModal.js';
import { View } from './View.js';

/** @class
 * 
 * 
 * 
*/
export class TicketView extends View{
  /**
   * @param {Ticket} ticket
   */
  constructor(board, ticket) {

    super(board);

    this.ticket = ticket;
    this.model = ticket;

    this.element = document.createElement('div');
    this.element.model = this.ticket;
    this.element.className = 'kanban-ticket';
    this.element.dataset.id = this.ticket.id;

    const title = document.createElement('h4');
    title.className = 'kanban-ticket-title';
    title.textContent = this.ticket.title;
    this.element.appendChild(title);

    this.renderTaxonomies();

    const description = document.createElement('div');
    description.className = 'kanban-ticket-description';
    description.textContent = this.ticket.getDescription();
    this.element.appendChild(description);

    this.element.addEventListener('click', () => {
      this.showDetails();
    });
  }

  showDetails() {
    const detailsModal = new TicketDetailsModal(
      this.boardView,
      this.ticket
    );
    detailsModal.addEventListener('edit', (e) => {
      detailsModal.close();
      this.openEditModal(e.detail.ticket);
    });
    detailsModal.open();
  }

  openEditModal(ticket) {
    const editModal = new EditTicketModal(this.boardView, this.model);
    editModal.render();
    // Pré-remplir le formulaire avec les données du ticket
    editModal.form.querySelector('#ticket-title').value = ticket.getTitle();
    editModal.form.querySelector('#ticket-description').value = ticket.getDescription();
    // Pré-remplir les taxonomies si présentes
    const taxonomies = ticket.getTaxonomies();
    Object.entries(taxonomies).forEach(([taxonomyId, termId]) => {
      const select = editModal.form.querySelector(`.kanban-taxonomy[data-id="${taxonomyId}"]`);
      if (select) select.value = termId;
    });
    editModal.open();
    // Wiring de l'événement save (à compléter selon la logique métier)
    editModal.addEventListener('save', (ev) => {


      console.group('%cTicketView.js :: 73 =============================', 'color: #407897; font-size: 1rem');
      console.log('TODO: implement ticket update logic here');
      console.groupEnd();


      // Met à jour le modèle du ticket
      // const data = ev.detail;
      // this.ticket.title = data.title;
      // this.ticket.description = data.description;
      // this.ticket.taxonomies = data.taxonomies;

      // // Met à jour le DOM
      // this.element.querySelector('.kanban-ticket-title').textContent = data.title;
      // this.element.querySelector('.kanban-ticket-description').textContent = data.description;

      // // Met à jour les taxonomies affichées
      // // Supprime les anciens badges
      // this.element.querySelectorAll('.kanban-ticket-taxonomy').forEach(el => el.remove());
      // // Ajoute les nouveaux badges
      // const taxonomies = this.ticket.getTaxonomies();
      // for (const [taxonomyId, termId] of Object.entries(taxonomies)) {
      //   const taxonomy = this.boardModel.getTaxonomyById?.(taxonomyId);
      //   if (!taxonomy) continue;
      //   const term = taxonomy.getTermById?.(termId);
      //   if (!term) continue;
      //   const taxoDiv = document.createElement('div');
      //   taxoDiv.textContent = `Term ${term.getName()}`;
      //   taxoDiv.dataset.taxonomyId = taxonomyId;
      //   taxoDiv.dataset.termId = termId;
      //   taxoDiv.classList.add('badge','kanban-ticket-taxonomy',`taxonomy--${termId}`,`term--${termId}`);
      //   this.element.insertBefore(taxoDiv, this.element.querySelector('.kanban-ticket-description'));
      // }
    });
  }


  renderTaxonomies() {
    const taxonomies = this.ticket.getTaxonomies();
    for (const [taxonomyId, termId] of Object.entries(taxonomies)) {


      const taxonomy = this.boardModel.getTaxonomyById(taxonomyId);
      if (!taxonomy) {
        continue;
      }

      const term = taxonomy.getTermById(termId);
      if (!term) {
        continue;
      }

      
      const taxoDiv = document.createElement('div');

      taxoDiv.textContent = `Term ${term.getName()}`;
      
      taxoDiv.dataset.taxonomyId = taxonomyId;
      taxoDiv.dataset.termId = termId;
      
      taxoDiv.classList.add(
        'badge',
        'kanban-ticket-taxonomy',
        `taxonomy--${termId}`,
        `term--${termId}`
      );

      this.element.appendChild(taxoDiv);

      this.element.classList.add(`has-taxonomy--${taxonomyId}`, `has--term-${termId}`);

    }
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    // IMPORTANT : l’élément DRAGGABLE doit être l’enfant direct de .kanban-tickets





    return this.element;
  }
}