//from: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
class Header extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    this.innerHTML = `
    <header>
            <div class="title_header"><h1>Blog del profe Lihuel</h1></div>
    </header>
        
    `;
  }
  }

customElements.define('header-component', Header);
