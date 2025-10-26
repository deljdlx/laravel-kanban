export class TaxonomyView {


  constructor(taxonomy) {
    this.taxonomy = taxonomy;
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    const el = document.createElement('div');
    el.className = 'kanban-taxonomy';
    el.dataset.id = this.taxonomy.id;

    const title = document.createElement('h4');
    title.className = 'kanban-taxonomy-title';
    title.textContent = this.taxonomy.name;

    const select = document.createElement('select');
    select.classList.add('kanban-taxonomy', 'form-select');
    select.name = `taxonomy[${this.taxonomy.id}]`; 
    select.dataset.id = this.taxonomy.id;

    this.taxonomy.terms.forEach(term => {
      const option = document.createElement('option');
      option.value = term.id;
      option.textContent = term.name;
      select.appendChild(option);
    });
    el.appendChild(title);
    el.appendChild(select);
    return el;
  }
}
