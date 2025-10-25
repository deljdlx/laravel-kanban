import '../bootstrap';




import '../../css/kanban.css';
import KanbanApplication from './KanbanApplication';
import { MouseFX } from './ui/ParticlesFX';



(async function bootstrap() {

  console.group('%cindex.js :: 8 =============================', 'color: #135484; font-size: 1rem');
  console.log('📅', new Date().toLocaleString());
  console.log('🌐', 'Not in package');
  console.groupEnd();

    const root = document.getElementById('kanban');
    if (!root) return;
    // Injection de dépendances
    const controller = new KanbanApplication({
        root,
        // On peut injecter ici des factories personnalisées si besoin
        // createLogger: () => createLogger('Kanban'),
        // createStorage: () => createDefaultStorage(),
        // createDataSource: (logger, storage) => new DemoDataSource(demoFactory, 'demo.kanban.v6', logger, storage),
        // createThemeService: (storage) => new ThemeService(storage),
        // createBackgroundService: (storage) => new BackgroundService(storage),
        // createFilterService: (state, storage, view, logger) => new FilterService(state, storage, view, logger),
        // createImportService: (view, cb) => new ImportService(view, cb),
        // createModal: () => new PopupModalAdapter(),
    });
    await controller.init();
    // Soft mouse trail (gentle)
    try {
        const fx = new MouseFX({ effect: 'trail' });
        fx.start();
        window.__mouseFx = fx; // optional for toggling/debug
    } catch {}
})();
