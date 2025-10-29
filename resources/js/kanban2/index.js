import '../bootstrap';

// import { KanbanController } from './controllers/KanbanController.js';


import { Kanban } from './Kanban.js';

import { BoardView } from './views/BoardView.js';
import { Board } from './models/Board.js';
import { Column } from './models/Column.js';
import { Ticket } from './models/Ticket.js';
import { Taxonomy } from './models/Taxonomy.js';
import { Term } from './models/Term.js';


// import { TabPanel } from '../tabler/TabPanel.js';

import { DomKit } from '../DomKit/DomKit.js';
import { h } from '../DomKit/DomKit.js';



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
  todo.addTicket(new Ticket(board, {
    title: 'Mettre en place Vite', description: 'npm install && npm run dev', taxonomies: {
      priority: 'high'
    }
  }));
  todo.addTicket(new Ticket(board, { title: 'Créer structure fichiers', description: 'models/, views/, controllers/' }));
  todo.addTicket(new Ticket(board, { title: 'Implémenter drag & drop', description: 'SortableJS' }));

  board.addColumn(todo);

  const doing = new Column(board, {
    id: 'doing',
    name: 'En cours'
  });
  doing.addTicket(new Ticket(board, { title: 'Créer modèles JS', description: 'Board, Column, Ticket' }));
  doing.addTicket(new Ticket(board, { title: 'Créer vues JS', description: 'BoardView, ColumnView, TicketView' }));

  board.addColumn(doing);

  const done = new Column(board, {
    id: 'done',
    name: 'Terminé'
  });
  done.addTicket(new Ticket(board, { title: 'Initialiser projet', description: 'npm init, installer dépendances' }));
  done.addTicket(new Ticket(board, { title: 'Configurer Vite', description: 'vite.config.js' }));
  board.addColumn(done);

  const priorityTaxonomy = new Taxonomy({
    id: 'priority',
    name: 'Priority',
    terms: [
      new Term({ id: 'low', name: 'Low' }),
      new Term({ id: 'medium', name: 'Medium' }),
      new Term({ id: 'high', name: 'High' }),
    ]
  });
  board.addTaxonomy(priorityTaxonomy);


  const typesTaxonomy = new Taxonomy({
    id: 'type',
    name: 'Type',
    terms: [
      new Term({ id: 'bug', name: 'Bug' }),
      new Term({ id: 'feature', name: 'Feature' }),
      new Term({ id: 'improvement', name: 'Improvement' }),
    ]
  });
  board.addTaxonomy(typesTaxonomy);

  const kanban = new Kanban(board, '#kanban-root');
  kanban.render();

})();











/* ========= Composant : CounterButton ========= */
DomKit.define('CounterButton', (props) => {
  let count = props.initial ?? 0;

  const button = h({
    tagName: 'button',
    attributes: {
      className: 'btn',
      onClick: () => {
        count++;
        button.textContent = `Clicked ${count} time${count > 1 ? 's' : ''}`;
      }
    },
    children: [`Clicked ${count} time${count > 1 ? 's' : ''}`]
  });

  return button;
});

/* ========= Montage ========= */
const app = document.getElementById('app');

const counter = DomKit.create({
  componentName: 'CounterButton',
  attributes: { initial: 0 }
});
app.appendChild(counter);


// Un conteneur avec 4 compteurs
const container = DomKit.create({
  tagName: 'div',
  attributes: { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
  children: [
    { componentName: 'CounterButton', attributes: { initial: 0, style: 'color: #f0f'  }},
    { componentName: 'CounterButton', attributes: { initial: 0 } },
    { componentName: 'CounterButton', attributes: { initial: 0 } },
    { componentName: 'CounterButton', attributes: { initial: 0 } },
  ]
});

app.appendChild(container);