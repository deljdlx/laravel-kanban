import '../bootstrap';

// import { KanbanController } from './controllers/KanbanController.js';


import { Kanban } from './Kanban.js';

import { BoardView } from './views/BoardView.js';
import { Board } from './models/Board.js';
import { Column } from './models/Column.js';
import { Ticket } from './models/Ticket.js';

import './css/main.scss';

/**
 * Bootstrapping =====================================================
 */
(function bootstrap() {

  const board = new Board();
  
  // Données d’exemple
  const todo = new Column(board, 'todo', 'À faire');
  todo.addTicket(new Ticket('Mettre en place Vite', { hint: 'npm install && npm run dev' }));
  todo.addTicket(new Ticket('Créer structure fichiers', { hint: 'models/, views/, controllers/' }));
  todo.addTicket(new Ticket('Implémenter drag & drop', { hint: 'SortableJS' }));

  board.addColumn(todo);

  const doing = new Column(board, 'doing');
  doing.addTicket(new Ticket('Créer modèles JS', { hint: 'Board, Column, Ticket' }));
  doing.addTicket(new Ticket('Créer vues JS', { hint: 'BoardView, ColumnView, TicketView' }));

  board.addColumn(doing);

  const done = new Column(board, 'done', 'Terminé');
  done.addTicket(new Ticket('Initialiser projet', { hint: 'npm init, installer dépendances' }));
  done.addTicket(new Ticket('Configurer Vite', { hint: 'vite.config.js' }));
  board.addColumn(done);


  const kanban = new Kanban(board, '#kanban-root');
  kanban.render();

 
})();

