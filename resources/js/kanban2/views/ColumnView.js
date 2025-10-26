/**
 * Vue d'une colonne du Kanban.
 * @class
 * @property {Column} column
 */
import { TicketView } from './TicketView.js';
import Sortable from 'sortablejs';

export class ColumnView {
  constructor(column) {
    this.column = column;
  }

  render() {
    const colDiv = document.createElement('div');
    colDiv.className = 'kanban-column';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'kanban-column-title';
    titleDiv.textContent = this.column.name;
    colDiv.appendChild(titleDiv);
    const ticketsList = document.createElement('div');
    ticketsList.className = 'kanban-tickets';
    ticketsList.dataset.columnId = this.column.id;
    this.column.tickets.forEach(ticket => {
      const ticketView = new TicketView(ticket);
      ticketsList.appendChild(ticketView.render());
    });
    colDiv.appendChild(ticketsList);

    const sortable = Sortable.create(ticketsList, {
      group: 'kanban',
      animation: 150,
      draggable: '.kanban-ticket',
      ghostClass: 'kanban-placeholder', // appliquée à l'élément fantôme dans la liste
      chosenClass: 'kanban-chosen',     // pendant la sélection
      dragClass: 'kanban-drag',         // sur l’élément réellement déplacé
      // Conseillé si tu veux un rendu cohérent partout :
      fallbackOnBody: true,
      forceFallback: true,
      onEnd: (evt) => { /* maj de l’ordre si besoin */ }
    });


    console.group('%cColumnView.js :: 41 =============================', 'color: #161661; font-size: 1rem');
    console.log('sortable instance:', sortable);
    console.groupEnd();

    return colDiv;
  }
}
