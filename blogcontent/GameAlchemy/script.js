// script.js

// Ruta al archivo JSON con las recetas
const dataPath = 'alchemy-recipes.json';

// Estado del juego
let discoveredElements = loadGame() || {
  base: ["Singularidad", "Expansión"],
  combined: []
};

// Objeto con las combinaciones leídas del JSON
let alchemyRecipes = {};

// Array con todos los elementos posibles (base + combined) leídos del JSON
let allPossibleElements = [];

/**
 * Carga el estado del juego desde localStorage.
 */
function loadGame() {
  let savedGame = localStorage.getItem('discoveredElements');
  return savedGame
    ? JSON.parse(savedGame)
    : { base: ["Singularidad", "Expansión"], combined: [] };
}

// Variables para la detección de doble tap en móviles
let lastTapTime = 0;
let lastTapElement = null;

/**
 * Manejo de doble-tap específicamente para móviles.
 */
function handleMobileDoubleTap(element) {
  element.addEventListener('touchstart', function(e) {
    let currentTime = new Date().getTime();
    let tapLength = currentTime - lastTapTime;
    if (tapLength < 300 && tapLength > 0 && lastTapElement === e.target) {
      // Si el elemento es no combinable, lo movemos a la sección no combinable
      if (e.target.classList.contains('non-combinable')) {
        let clonedElement = e.target.cloneNode(true);
        addElementToNonCombinableSection(clonedElement);
        e.target.remove();
      }
    }
    lastTapTime = currentTime;
    lastTapElement = e.target;
  });
}

/**
 * Maneja el arrastre táctil (touch) en móviles.
 */
function handleTouchDrag(element, craftingArea) {
  let originalPosition = {};
  let moving = false;

  element.addEventListener('touchstart', function(e) {
    let rect = element.getBoundingClientRect();
    originalPosition = { x: rect.left, y: rect.top };

    let touch = e.touches[0];
    let offsetX = touch.clientX - rect.left;
    let offsetY = touch.clientY - rect.top;
    moving = true;

    element.style.position = 'absolute';
    element.style.zIndex = 1000;

    function moveAt(clientX, clientY) {
      element.style.left = clientX - offsetX + 'px';
      element.style.top = clientY - offsetY + 'px';
    }

    moveAt(touch.clientX, touch.clientY);

    // Prevenir scroll/zoom en móviles
    e.preventDefault();
  });

  element.addEventListener('touchmove', function(e) {
    if (moving) {
      // Podrías recalcular la posición exacta en cada movimiento si lo deseas
      e.preventDefault();
    }
  });

  element.addEventListener('touchend', function(e) {
    moving = false;
    element.style.position = '';
    element.style.zIndex = '';

    let craftingRect = craftingArea.getBoundingClientRect();
    let elementRect = element.getBoundingClientRect();

    // Verifica si NO se suelta dentro del área de crafteo
    if (
      !(
        elementRect.left > craftingRect.left &&
        elementRect.right < craftingRect.right &&
        elementRect.top > craftingRect.top &&
        elementRect.bottom < craftingRect.bottom
      )
    ) {
      // Retornar a la posición original
      element.style.left = originalPosition.x + 'px';
      element.style.top = originalPosition.y + 'px';
    }
  });
}

/**
 * Se ejecuta cuando el DOM está cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
  const elementsContainer = document.getElementById('elements');
  const craftingArea = document.getElementById('crafting-area');
  const resultsArea = document.getElementById('combination-results');

  // Botones / modal
  const diagramButton = document.getElementById('diagram-toggle-button');
  const diagramModal = document.getElementById('diagram-modal');
  const diagramCloseBtn = document.getElementById('diagram-close-button');

  // Cargamos los datos del JSON
  fetch(dataPath)
    .then(response => response.json())
    .then(data => {
      // Unimos base + combined en un solo array
      allPossibleElements = data.elements.base.concat(data.elements.combined);
      // Guardamos sus combinaciones
      alchemyRecipes = data.combinations;
      // Inicializamos el juego
      initGame();
    })
    .catch(error => console.error('Error loading game data:', error));

  /**
   * Inicializa el juego creando elementos base y combinados.
   */
  function initGame() {
    discoveredElements.base.forEach(createElementDiv);
    discoveredElements.combined.forEach(createElementDiv);
    updateNonCombinableElements();
  }

  /**
   * Crea un div para cada elemento y lo agrega a #elements.
   */
  function createElementDiv(elementName) {
    let elDiv = document.createElement('div');
    elDiv.textContent = elementName;
    elDiv.className = 'element';
    elDiv.setAttribute('data-element', elementName);
    elDiv.setAttribute('draggable', true);

    // Drag and Drop (desktop)
    elDiv.ondragstart = dragStart;

    // Doble clic en desktop
    elDiv.ondblclick = function(e) {
      if (e.target.classList.contains('non-combinable')) {
        let clonedElement = e.target.cloneNode(true);
        addElementToNonCombinableSection(clonedElement);
        e.target.remove();
      }
    };

    // Eventos para móviles
    handleMobileDoubleTap(elDiv);
    handleTouchDrag(elDiv, craftingArea);

    elementsContainer.appendChild(elDiv);
  }

  /**
   * Drag and Drop: inicia el arrastre en desktop.
   */
  function dragStart(e) {
    e.dataTransfer.setData('text', e.target.getAttribute('data-element'));
  }

  // Permite el drop en el área de crafteo
  craftingArea.ondragover = e => e.preventDefault();

  // Maneja drop en el área de crafteo
  craftingArea.ondrop = e => {
    e.preventDefault();
    let elementName = e.dataTransfer.getData('text');
    handleElementDrop(elementName);
  };

  /**
   * Lógica de soltar un elemento en el área de crafteo.
   */
  function handleElementDrop(elementName) {
    let currentElements = [...craftingArea.querySelectorAll('.element')];
    // Permitimos máximo 2 elementos para intentar combinar
    if (currentElements.length < 2) {
      let originalElement = document.querySelector(
        `.element[data-element="${elementName}"]`
      );
      let clonedElement = originalElement.cloneNode(true);
      clonedElement.classList.add('in-crafting-area');
      craftingArea.appendChild(clonedElement);

      // Si ahora hay 2, revisamos la posible combinación
      if (currentElements.length + 1 === 2) {
        checkCombination();
      }
    }
  }

  /**
   * Verifica si los dos elementos en crafting-area forman una combinación válida.
   */
  function checkCombination() {
    let currentElements = [...craftingArea.querySelectorAll('.element')].map(el =>
      el.getAttribute('data-element')
    );

    if (currentElements.length === 2) {
      let combinationResults = combineElements(currentElements);

      // Limpia el área de crafteo
      craftingArea.innerHTML = '';

      if (combinationResults && combinationResults.length > 0) {
        // Agrega los nuevos elementos descubiertos
        let createdElementsList = combinationResults
          .map(result => {
            if (!discoveredElements.combined.includes(result)) {
              discoveredElements.combined.push(result);
              createElementDiv(result);
            }
            return result;
          })
          .join(', ');

        resultsArea.textContent = `Has creado: ${createdElementsList}`;
        saveGame(discoveredElements);
        updateNonCombinableElements();
      } else {
        resultsArea.textContent = 'No ha pasado nada...';
      }
    }
  }

  /**
   * Determina si un elemento todavía puede combinarse con algo no descubierto.
   */
  function hasMoreCombinations(elementName) {
    for (let recipe in alchemyRecipes) {
      if (recipe.includes(elementName)) {
        let possibleResults = alchemyRecipes[recipe];
        // Si al menos un resultado no está en discoveredElements, aún hay algo pendiente
        if (possibleResults.some(r => !discoveredElements.combined.includes(r))) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Marca y mueve un elemento a "no combinables" si no tiene más combinaciones.
   */
  function markElementAsNonCombinable(elementName) {
    let element = document.querySelector(`.element[data-element="${elementName}"]`);
    if (element && !element.classList.contains('non-combinable')) {
      element.classList.add('non-combinable');
      addElementToNonCombinableSection(element);
    }
  }

  /**
   * Recorre todos los elementos descubiertos y manda los que no pueden combinar más.
   */
  function updateNonCombinableElements() {
    discoveredElements.base.concat(discoveredElements.combined).forEach(name => {
      if (!hasMoreCombinations(name)) {
        markElementAsNonCombinable(name);
      }
    });
  }

  /**
   * Mueve un elemento al contenedor de no combinables.
   */
  function addElementToNonCombinableSection(element) {
    let container = document.getElementById('non-combinable-elements');
    element.classList.add('in-menu');
    container.appendChild(element);
  }

  /**
   * Combina 2 elementos si existe una receta; retorna sus resultados o null.
   */
  function combineElements(elements) {
    let key1 = elements[0] + elements[1];
    let key2 = elements[1] + elements[0];
    let foundCombination = alchemyRecipes[key1] || alchemyRecipes[key2];

    if (foundCombination) {
      // Si hay más de 4 resultados, tomar sólo los primeros 4 (opcional)
      return foundCombination.length > 4
        ? foundCombination.slice(0, 4)
        : foundCombination;
    } else {
      return null;
    }
  }

  /**
   * Guarda el estado del juego en localStorage.
   */
  function saveGame(gameState) {
    localStorage.setItem('discoveredElements', JSON.stringify(gameState));
  }

  /**
   * Reinicia el juego.
   */
  function resetGame() {
    discoveredElements = {
      base: ["Singularidad", "Expansión"],
      combined: []
    };
    localStorage.removeItem('discoveredElements');

    document.getElementById('elements').innerHTML = '';
    craftingArea.innerHTML = '';
    resultsArea.textContent = '';
    document.getElementById('non-combinable-elements').innerHTML = '';

    initGame();
  }

  // Botón de reset
  document.getElementById('reset-button').addEventListener('click', resetGame);

  /**
   * Separa una clave, p. ej. "SingularidadExpansión" -> ["Singularidad","Expansión"],
   * usando allPossibleElements para buscar.
   */
  function parseComboKey(comboKey) {
    for (let i = 0; i < allPossibleElements.length; i++) {
      let e1 = allPossibleElements[i];
      if (comboKey.startsWith(e1)) {
        let remainder = comboKey.slice(e1.length);
        if (allPossibleElements.includes(remainder)) {
          return [e1, remainder];
        }
      }
    }
    return ["???", "???"];
  }

  /**
   * Dibuja el diagrama con Vis.js en #network-container,
   * mostrando sólo los elementos descubiertos y sus combinaciones.
   */
  function renderDiagram() {
    const container = document.getElementById('network-container');
    container.innerHTML = '';

    let allDiscovered = discoveredElements.base.concat(discoveredElements.combined);

    // Crear nodos
    let nodesArray = allDiscovered.map(name => ({
      id: name,
      label: name
    }));

    // Crear edges
    let edgesArray = [];
    for (let comboKey in alchemyRecipes) {
      let results = alchemyRecipes[comboKey];
      let [element1, element2] = parseComboKey(comboKey);

      results.forEach(result => {
        // Solo dibujamos la arista si tanto 'elementX' como 'result' están descubiertos
        if (allDiscovered.includes(result)) {
          if (allDiscovered.includes(element1)) {
            edgesArray.push({ from: element1, to: result, arrows: 'to' });
          }
          if (allDiscovered.includes(element2)) {
            edgesArray.push({ from: element2, to: result, arrows: 'to' });
          }
        }
      });
    }

    // DataSet para Vis.js
    let nodes = new vis.DataSet(nodesArray);
    let edges = new vis.DataSet(edgesArray);

    // Opciones de Vis.js
    let data = { nodes, edges };
    let options = {
      layout: {
        improvedLayout: true
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 200 }
      },
      interaction: {
        dragNodes: true,
        zoomView: true,
        dragView: true
      }
    };

    // Crear la red en el container
    new vis.Network(container, data, options);
  }

  // === Eventos para abrir/cerrar el modal overlay del diagrama ===

  // ABRIR (click en "Ver Diagrama")
  diagramButton.addEventListener('click', () => {
    diagramModal.classList.add('visible');
    renderDiagram();
  });

  // CERRAR (click en X)
  diagramCloseBtn.addEventListener('click', () => {
    diagramModal.classList.remove('visible');
  });

  // CERRAR si se hace clic en el fondo (overlay)
  diagramModal.addEventListener('click', (e) => {
    // Si se hace clic exactamente en el modal (no en un hijo), se cierra
    if (e.target === diagramModal) {
      diagramModal.classList.remove('visible');
    }
  });

});
