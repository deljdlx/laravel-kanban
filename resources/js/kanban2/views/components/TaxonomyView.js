import { View } from '../View.js';

export class TaxonomyView extends View {


  constructor(boardView, taxonomy, value = null) {
    super(boardView);
    this.taxonomy = taxonomy;
    this.value = value;


    console.group('%cTaxonomyView.js :: 12 =============================', 'color: #f0f; font-size: 1rem');
    console.log(this.value);
    console.groupEnd();

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



    console.group('%cTaxonomyView.js :: 37 =============================', 'color: #705193; font-size: 1rem');
    console.log(this.value);
    console.groupEnd();


    this.taxonomy.terms.forEach(term => {
      const option = document.createElement('option');
      option.value = term.id;
      option.textContent = term.name;


      console.group('%cTaxonomyView.js :: 50 =============================', 'color: #825333; font-size: 1rem');
      console.log(this.value, term.id);
      console.groupEnd();


      if (this.value && this.value === term.id) {
        option.selected = true;
      }

      select.appendChild(option);
    });
    el.appendChild(title);
    el.appendChild(select);
    return el;
  }
}
