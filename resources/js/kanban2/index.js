import '../bootstrap';

// import { KanbanController } from './controllers/KanbanController.js';


import { Kanban } from './Kanban.js';

import { BoardView } from './views/BoardView.js';
import { Board } from './models/Board.js';
import { Column } from './models/Column.js';
import { Ticket } from './models/Ticket.js';
import { Taxonomy } from './models/Taxonomy.js';
import { Term } from './models/Term.js';

import './css/main.scss';

/**
 * Bootstrapping =====================================================
 */
(function bootstrap() {

  const board = new Board();
  
  // Données d’exemple
  const todo = new Column(board, {
    id: 'todo',
    name: 'À faire'
  });
  todo.addTicket(new Ticket('Mettre en place Vite', { description: 'npm install && npm run dev', taxonomies:{
    priority: 'high'
  }}));
  todo.addTicket(new Ticket('Créer structure fichiers', { description: 'models/, views/, controllers/' }));
  todo.addTicket(new Ticket('Implémenter drag & drop', { description: 'SortableJS' }));

  board.addColumn(todo);

  const doing = new Column(board, {
    id: 'doing',
    name: 'En cours'
  });
  doing.addTicket(new Ticket('Créer modèles JS', { description: 'Board, Column, Ticket' }));
  doing.addTicket(new Ticket('Créer vues JS', { description: 'BoardView, ColumnView, TicketView' }));

  board.addColumn(doing);

  const done = new Column(board, {
    id: 'done',
    name: 'Terminé'
  });
  done.addTicket(new Ticket('Initialiser projet', { description: 'npm init, installer dépendances' }));
  done.addTicket(new Ticket('Configurer Vite', { description: 'vite.config.js' }));
  board.addColumn(done);

  const priorityTaxonomy = new Taxonomy({
    id: 'priority',
    name: 'Priority',
    terms: [
      new Term('low', 'Low'),
      new Term('medium', 'Medium'),
      new Term('high', 'High'),
    ]
  });

  board.addTaxonomy(priorityTaxonomy);



  const kanban = new Kanban(board, '#kanban-root');
  kanban.render();

 
})();

