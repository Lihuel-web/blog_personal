//from: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
class Footer extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    this.innerHTML = `
    <footer>
        <p>Copyright 2022</p>
        <p>E-mail: a77lejandro@gmail.com</p>
    </footer>
    `;
  }
  }

customElements.define('footer-component', Footer);
