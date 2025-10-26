import '../bootstrap';

import { KanbanController } from './controllers/KanbanController.js';
import { KanbanView } from './views/KanbanView.js';

import './css/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('kanban');
  const view = new KanbanView(root);
  const controller = new KanbanController(view);
  controller.init();
});
