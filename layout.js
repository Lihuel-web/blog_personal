//from: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
class NavSite extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    this.innerHTML = `
    <nav class="site_content" id="cel">
    <ul>
        <li><a href="peliculas/peliculas.html">Películas</a></li>
        <li><a href="index.html">Acerca de</a></li>
        <li><a href="contacto.html">Contacto</a></li>
    </ul>
    </nav>
    `;

    //this.style.position = "fixed"; Lo dejo acá por si acaso
    //this.style.left = "0";
  }
  }

customElements.define('navsite-component', NavSite);