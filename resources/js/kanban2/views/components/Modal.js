import {Modal as TablerModal} from '@tabler/core/dist/js/tabler.min.js';
import { View } from '../View.js';

/**
 * @class Modal
 * @property {HTMLElement} rootElement
 * @property {HTMLElement} element
 * @property {HTMLElement} contentElement
 * @property {HTMLElement} titleElement
 * @property {String} id
 */

export class Modal extends View
{

  constructor(board, id = 'mainModal', rootElement = null) {

    super(board);


    if(!rootElement) {
      this.rootElement = document.body;
    } else {
      this.rootElement = rootElement;
    }

    this.listeners = {};

    this.id = id;
    this.content = null;
    this.title = '';
    this.footer = '';

    const html = `>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            ${this.title ? `<h5 class="modal-title">${this.title}</h5>` : ''}
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${this.content || ''}
          </div>
          ${this.footer  ? ('<div class="modal-footer">' + this.footer + '</div>') : ''}
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.className = 'modal';
    element.id = this.id;
    element.tabIndex = -1;
    this.element = element;
    this.element.innerHTML = html;


    this.contentElement = this.element.querySelector('.modal-body');
    this.titleElement = this.element.querySelector('.modal-title');
    this.footerElement = this.element.querySelector('.modal-footer');

    this.tabler  = new TablerModal(this.element);

    this.element.addEventListener('hidden.bs.modal', () => {
      this.fireEvent('close');
    });
  }

  setContent(content) {
    this.content = content;
    this.contentElement.innerHTML = this.content;
    // this.destroy();
    // this.render();
  }

  setFooter(footer) {
    this.footer = footer;
    if(this.footerElement) {
      this.footerElement.innerHTML = this.footer;
    } else {
      const footerDiv = document.createElement('div');
      footerDiv.className = 'modal-footer';
      footerDiv.innerHTML = this.footer;
      this.element.querySelector('.modal-content').appendChild(footerDiv);
      this.footerElement = footerDiv;
    }
  }

  destroy() {
    if(this.element) {
      this.element.remove();
      this.element = null;
    }
  }


  open() {
    this.tabler.show();
  }

  close() {
    this.tabler.hide();
  }



  render() {
    this.rootElement.appendChild(this.element);
  }
}
