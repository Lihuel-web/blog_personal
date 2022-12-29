//from: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
class NavPage extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    this.innerHTML = `
    <nav class="page_content">
    <ul>
        <li><a href="#¡Hola!">¡Hola!</a></li>
        <li><a href="#Inteligencia artificial">Inteligencia artificial</a></li>
        <li><a href="">lala</a></li>
    </ul>
</nav>
    `;
  }
  }

customElements.define('navpage-component', NavPage);
//RE OJOTEE: según chat gpt el elemento definido no sólo tiene que tener un guion o hyphen si no también no debe tener mayus
//por eso no funcionaba

//<!--On the page you want to link to:
//Así se crea un link a otra página según ChatGPT, google no me daba la info
//Copy code
//<h2 id="target">This is the target element</h2>
//On the page with the link:
//Copy code
//<a href="otherpage.html#target">Click here to go to the target element on the other page</a> -->     