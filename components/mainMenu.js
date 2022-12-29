//from: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
class mainMenu extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    this.innerHTML = `
    <div class= "main-menu"><nav>
        <ul>
            <li><a href="index.html">Inicio</a></li>
            <li><a href="">Acerca de</a></li>
            <li><a href="">Contacto</a></li>
        </ul>
    </nav>
  </div>
        
    `;
  }
  }

customElements.define('mainmenu-component', mainMenu);
  