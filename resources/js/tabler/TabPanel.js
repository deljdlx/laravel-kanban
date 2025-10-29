/**
 * TabPanel - Panneau d’onglets accessible et réutilisable.
 * Usage :
 *   const tabPanel = new TabPanel({
 *     panels: {
 *       panel0: { title: 'Panel 0', content: 'This is the content of Panel 0' },
 *       panel1: { title: 'Panel 1', content: 'This is the content of Panel 1' },
 *     },
 *     activeKey: 'panel0' // optionnel (défaut: premier)
 *   });
 *   tabPanel.render(document.getElementById('tab-panel-container'));
 *
 * API :
 *   - render(container: HTMLElement): void
 *   - destroy(): void
 *   - select(key: string): void
 *   - addPanel(key: string, panel: {title: string, content: string|HTMLElement|() => (string|HTMLElement)}): void
 *   - removePanel(key: string): void
 *   - getActiveKey(): string|null
 *   - on(eventName: 'change'|'ready', handler: (detail) => void): void
 *   - off(eventName, handler): void
 */

export class TabPanel {
  /**
   * @typedef {Object} PanelDef
   * @property {string} title
   * @property {string|HTMLElement|(() => string|HTMLElement)} content
   */

  /**
   * @typedef {Object} TabPanelOptions
   * @property {Record<string, PanelDef>} panels
   * @property {string} [activeKey]
   * @property {string} [id]             - id racine optionnel
   * @property {string} [className]      - classe CSS supplémentaire
   * @property {boolean} [injectBaseStyles=true] - injecter un style minimal
   */

  /**
   * @param {TabPanelOptions} options
   */
  constructor(options) {
    /** @type {HTMLElement|null} */
    this.container = null;
    /** @type {HTMLElement|null} */
    this.root = null;
    /** @type {HTMLElement|null} */
    this.tablist = null;
    /** @type {Map<string, HTMLElement>} */
    this.tabs = new Map();
    /** @type {Map<string, HTMLElement>} */
    this.panels = new Map();

    /** @type {TabPanelOptions} */
    this.options = Object.assign(
      { panels: {}, activeKey: undefined, id: undefined, className: '', injectBaseStyles: true },
      options || {}
    );

    /** @type {string[]}*/
    this.order = Object.keys(this.options.panels);

    /** @type {string|null} */
    this.activeKey = this.options.activeKey && this.order.includes(this.options.activeKey)
      ? this.options.activeKey
      : (this.order[0] || null);

    /** @type {Map<string, Function[]>} */
    this.listeners = new Map([['change', []], ['ready', []]]);
  }

  /**
   * Rendu dans un container.
   * @param {HTMLElement} container
   */
  render(container, clear = false) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('TabPanel.render: container must be an HTMLElement');
    }

    this.container = container;
    if (clear) {
      this._clear(container);
    }

    if (this.options.injectBaseStyles) this._ensureBaseStyles();

    // Racine
    this.root = document.createElement('div');
    this.root.className = `tp-root${this.options.className ? ' ' + this.options.className : ''}`;
    if (this.options.id) this.root.id = this.options.id;
    this.root.setAttribute('role', 'tablist');
    this.root.setAttribute('aria-label', 'Tabs');

    // Barre d’onglets
    const tablist = document.createElement('div');
    tablist.className = 'tp-tablist';
    tablist.setAttribute('role', 'tablist');
    this.tablist = tablist;

    // Zone panels
    const panelsWrap = document.createElement('div');
    panelsWrap.className = 'tp-panels';

    // Construire onglets + panels
    this.order.forEach((key, idx) => {
      const def = this.options.panels[key];
      const tabId = `${this._uid('tab')}-${key}`;
      const panelId = `${this._uid('panel')}-${key}`;

      // Onglet
      const tab = document.createElement('button');
      tab.className = 'tp-tab';
      tab.type = 'button';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
      tab.textContent = def.title;

      // Panel
      const panel = document.createElement('div');
      panel.className = 'tp-panel';
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.hidden = true;

      // Contenu
      this._mountContent(panel, def.content);

      // Mapping
      this.tabs.set(key, tab);
      this.panels.set(key, panel);

      // Écouteurs
      tab.addEventListener('click', () => this.select(key));
      tab.addEventListener('keydown', (e) => this._onTabKeydown(e, key));

      tablist.appendChild(tab);
      panelsWrap.appendChild(panel);

      // Actif initial
      if (key === this.activeKey || (!this.activeKey && idx === 0)) {
        this.activeKey = key;
      }
    });

    this.root.appendChild(tablist);
    this.root.appendChild(panelsWrap);
    container.appendChild(this.root);

    // Appliquer l’état actif
    if (this.activeKey) {
      this._applyActive(this.activeKey, { focusTab: false });
    }

    this._emit('ready', { activeKey: this.activeKey });
  }

  /**
   * Sélectionner un onglet par sa clé.
   * @param {string} key
   */
  select(key) {
    if (!this.tabs.has(key)) return;
    if (key === this.activeKey) return;
    this._applyActive(key, { focusTab: true });
    this._emit('change', { activeKey: key });
  }

  /**
   * Ajouter dynamiquement un panel.
   * @param {string} key
   * @param {PanelDef} def
   */
  addPanel(key, def) {
    if (!this.root || !this.tablist) {
      // Ajout avant render
      this.options.panels[key] = def;
      if (!this.order.includes(key)) this.order.push(key);
      if (!this.activeKey) this.activeKey = key;
      return;
    }
    if (this.tabs.has(key)) return; // déjà présent

    const tabId = `${this._uid('tab')}-${key}`;
    const panelId = `${this._uid('panel')}-${key}`;

    const tab = document.createElement('button');
    tab.className = 'tp-tab';
    tab.type = 'button';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
    tab.textContent = def.title;

    const panel = document.createElement('div');
    panel.className = 'tp-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;

    this._mountContent(panel, def.content);

    tab.addEventListener('click', () => this.select(key));
    tab.addEventListener('keydown', (e) => this._onTabKeydown(e, key));

    this.tablist.appendChild(tab);
    this.this.root.querySelector('.tp-panels').appendChild(panel);

    this.tabs.set(key, tab);
    this.panels.set(key, panel);
    this.order.push(key);
    this.options.panels[key] = def;

    if (!this.activeKey) {
      this._applyActive(key, { focusTab: false });
    }
  }

  /**
   * Supprimer un panel par sa clé.
   * @param {string} key
   */
  removePanel(key) {
    const tab = this.tabs.get(key);
    const panel = this.panels.get(key);
    if (tab) tab.remove();
    if (panel) panel.remove();
    this.tabs.delete(key);
    this.panels.delete(key);
    this.order = this.order.filter(k => k !== key);
    delete this.options.panels[key];

    if (this.activeKey === key) {
      const next = this.order[0] || null;
      this.activeKey = null;
      if (next) this._applyActive(next, { focusTab: false });
    }
  }

  /**
   * Détruire le composant (nettoyage DOM/événements).
   */
  destroy() {
    if (this.container && this.root) {
      this._clear(this.container);
    }
    this.container = null;
    this.root = null;
    this.tablist = null;
    this.tabs.clear();
    this.panels.clear();
    this.order = [];
    this.activeKey = null;
    this.listeners.forEach(arr => arr.length = 0);
  }

  /**
   * @returns {string|null}
   */
  getActiveKey() {
    return this.activeKey;
  }

  /**
   * @param {'change'|'ready'} eventName
   * @param {(detail:any)=>void} handler
   */
  on(eventName, handler) {
    const arr = this.listeners.get(eventName);
    if (arr) arr.push(handler);
  }

  /**
   * @param {'change'|'ready'} eventName
   * @param {(detail:any)=>void} handler
   */
  off(eventName, handler) {
    const arr = this.listeners.get(eventName);
    if (!arr) return;
    const i = arr.indexOf(handler);
    if (i >= 0) arr.splice(i, 1);
  }

  // ---------- Internals ----------

  _emit(name, detail) {
    const arr = this.listeners.get(name);
    if (arr && arr.length) {
      arr.forEach(fn => {
        try { fn(detail); } catch (_) { /* no-op */ }
      });
    }
  }

  _applyActive(key, opts) {
    const { focusTab } = Object.assign({ focusTab: true }, opts);
    // reset
    this.tabs.forEach((tabEl, k) => {
      const panelEl = this.panels.get(k);
      tabEl.setAttribute('aria-selected', k === key ? 'true' : 'false');
      tabEl.setAttribute('tabindex', k === key ? '0' : '-1');
      if (panelEl) panelEl.hidden = (k !== key);
    });
    this.activeKey = key;
    if (focusTab) {
      const t = this.tabs.get(key);
      if (t) t.focus();
    }
  }

  _onTabKeydown(e, key) {
    const idx = this.order.indexOf(key);
    if (idx < 0) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const next = this.order[(idx + 1) % this.order.length];
        this.select(next);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prev = this.order[(idx - 1 + this.order.length) % this.order.length];
        this.select(prev);
        break;
      }
      case 'Home': {
        e.preventDefault();
        this.select(this.order[0]);
        break;
      }
      case 'End': {
        e.preventDefault();
        this.select(this.order[this.order.length - 1]);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        this.select(key);
        break;
      }
      default:
        break;
    }
  }

  _mountContent(target, content) {
    // content : string | HTMLElement | () => (string|HTMLElement)
    const value = (typeof content === 'function') ? content() : content;
    if (value instanceof HTMLElement) {
      target.appendChild(value);
    } else if (typeof value === 'string') {
      target.innerHTML = value;
    } else {
      // fallback vide
      target.textContent = '';
    }
  }

  _clear(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  _uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  _ensureBaseStyles() {
    const MARK_ID = 'tp-base-styles';
    if (document.getElementById(MARK_ID)) return;
    const style = document.createElement('style');
    style.id = MARK_ID;
    style.textContent = `
.tp-root { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.tp-tablist { display: flex; gap: .25rem; border-bottom: 1px solid #ddd; }
.tp-tab { appearance: none; background: none; border: none; padding: .5rem .75rem; cursor: pointer; border-bottom: 2px solid transparent; }
.tp-tab[aria-selected="true"] { border-color: #555; font-weight: 600; }
.tp-tab:focus { outline: 2px solid #777; outline-offset: 2px; }
.tp-panels { padding-top: .5rem; }
.tp-panel { padding: .5rem 0; }
    `.trim();
    document.head.appendChild(style);
  }
}
