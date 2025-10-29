
const SYM_META = Symbol('domkit.meta');
const nodeToMeta = new WeakMap();

export class DomKit {
  static registry = new Map();
  static define(name, factory) { this.registry.set(name, factory); }

  static create(desc = {}) {
    const { tagName, componentName, attributes = {}, children = [], key } = desc;

    // composant enregistré
    if (componentName && this.registry.has(componentName)) {
      const el = this.registry.get(componentName)(attributes || {}, children);
      this.#setMeta(el, { desc, key });
      return el;
    }

    // élément natif
    const el = document.createElement(tagName || 'div');
    this.#applyProps(el, attributes);
    this.#appendChildren(el, children);
    this.#setMeta(el, { desc, key });
    return el;
  }

  static update(el, patch) {
    const meta = this.meta(el);
    if (!meta) throw new Error('update: element not managed by DomKit');
    meta.desc = { ...meta.desc, ...patch };
    if (patch.attributes) this.#applyProps(el, patch.attributes);
    if ('children' in patch) {
      el.replaceChildren();
      this.#appendChildren(el, patch.children);
    }
  }

  static meta(el) { return el?.[SYM_META] || nodeToMeta.get(el) || null; }

  static #setMeta(el, meta) {
    nodeToMeta.set(el, meta);
    Object.defineProperty(el, SYM_META, { value: meta, enumerable: false, configurable: true });
  }

static #applyProps(el, props = {}) {
  for (const [key, val] of Object.entries(props)) {
    if (val == null) continue;

    // 1) Fonctions
    if (typeof val === 'function') {
      if (key.startsWith('on')) {
        const type = key.slice(2).toLowerCase(); // onClick -> click
        el.addEventListener(type, val);
      } else if (key in el) {
        // ex: onload, onerror en prop directe
        el[key] = val;
      }
      continue;
    }

    // 2) Style
    if (key === 'style') {

      console.group('%cDomKit.js :: 64 =============================', 'color: #034383; font-size: 1rem');
      console.log(key, val);
      console.groupEnd();

      if (typeof val === 'string') el.style.cssText = val;
      else if (val && typeof val === 'object') Object.assign(el.style, val);
      continue;
    }

    // 3) Classe
    if (key === 'className') { el.className = String(val); continue; }
    if (key === 'class')     { el.setAttribute('class', String(val)); continue; }

    // 4) Dataset
    if (key === 'dataset' && val && typeof val === 'object') {
      for (const [dk, dv] of Object.entries(val)) {
        if (dv != null) el.dataset[dk] = String(dv);
      }
      continue;
    }

    // 5) data-* / aria-* -> attributs
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      el.setAttribute(key, String(val));
      continue;
    }

    // 6) Booléens
    if (typeof val === 'boolean') {
      if (key in el) { try { el[key] = val; } catch {} }
      if (val) el.setAttribute(key, '');
      else el.removeAttribute(key);
      continue;
    }

    // 7) Props natives sinon attribut
    if (key in el) {
      try { el[key] = val; }
      catch { el.setAttribute(key, String(val)); }
    } else {
      el.setAttribute(key, String(val));
    }
  }
}


  static #appendChildren(el, children) {
    children?.flat().forEach(c => {
      if (c instanceof Node) el.appendChild(c);
      else if (typeof c === 'object') el.appendChild(DomKit.create(c));
      else el.appendChild(document.createTextNode(String(c)));
    });
  }
}
export const h = (...a) => DomKit.create(...a);