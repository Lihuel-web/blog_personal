﻿// The path to your JSON file
const dataPath = 'alchemy-recipes.json';
function loadGame() {
    let savedGame = localStorage.getItem('discoveredElements');
    return savedGame ? JSON.parse(savedGame) : { base: ["Singularidad", "Expansión"], combined: [] };
}
// Game state
let discoveredElements = loadGame() || {
  base: ["Singularidad", "Expansión"],
  combined: []
};
let alchemyRecipes = {};





document.addEventListener('DOMContentLoaded', () => {
    const elementsContainer = document.getElementById('elements');
    const craftingArea = document.getElementById('crafting-area');
    const resultsArea = document.getElementById('combination-results');
    const toggleButton = document.getElementById('menu-toggle'); //agregados elementos del menú desplegable
    const sideMenu = document.getElementById('side-menu');

    // Fetch game data from JSON file
    fetch('alchemy-recipes.json')
        .then(response => response.json())
        .then(data => {
            alchemyRecipes = data.combinations;
            initGame();
        })
        .catch(error => console.error('Error loading game data:', error));

        function initGame() {
            // Only create divs for base elements and discovered combined elements
            discoveredElements.base.forEach(element => createElementDiv(element));
            discoveredElements.combined.forEach(element => createElementDiv(element));
        }

    function createElementDiv(element) {
        let elDiv = document.createElement('div');
        elDiv.textContent = element;
        elDiv.className = 'element';
        elDiv.setAttribute('data-element', element); 
        elDiv.setAttribute('draggable', true);
        elDiv.ondragstart = dragStart;
        elementsContainer.appendChild(elDiv);
    }

    function dragStart(e) {
        e.dataTransfer.setData('text', e.target.getAttribute('data-element'));
    }

    craftingArea.ondragover = e => e.preventDefault();

    craftingArea.ondrop = e => {
        e.preventDefault();
        let elementName = e.dataTransfer.getData('text');
        handleElementDrop(elementName);
    };

    function handleElementDrop(elementName) {
        let currentElements = [...craftingArea.querySelectorAll('.element')];
        // Check if the crafting area already has two elements
        if (currentElements.length < 2) {
            // Find the original element from the container
            let originalElement = document.querySelector(`.element[data-element="${elementName}"]`);
            // Clone the original element
            let clonedElement = originalElement.cloneNode(true);
            clonedElement.classList.add('in-crafting-area');
            // Append the cloned element to the crafting area
            craftingArea.appendChild(clonedElement);
            // Proceed to check for possible combinations
            if (currentElements.length + 1 === 2) { // Now we have two elements
                checkCombination();
            }
        }
    }

    function checkCombination() {
        let currentElements = [...craftingArea.querySelectorAll('.element')].map(el => el.getAttribute('data-element'));
        if (currentElements.length === 2) {
            let combinationResults = combineElements(currentElements);
            // Clear the crafting area before showing results or error message
            craftingArea.innerHTML = '';
            // If there are results, show them separated by commas
            if (combinationResults && combinationResults.length > 0) {
                let createdElementsList = combinationResults.map(combinationResult => {
                    if (!discoveredElements.combined.includes(combinationResult)) {
                        // New element discovered
                        discoveredElements.combined.push(combinationResult);
                        createElementDiv(combinationResult); // Add the new element to the container
                    }
                    return combinationResult; // Return the element to be added to the list
                }).join(', '); // Join the elements with a comma
                resultsArea.textContent = `Has creado: ${createdElementsList}`;
                saveGame(discoveredElements);
            } else {
                // If no results, show the error message
                resultsArea.textContent = "No ha pasado nada...";
            }
        }
    }

    function combineElements(elements) {
        // Intentar ambas combinaciones posibles
        let combinedElementsKey1 = elements[0] + elements[1];
        let combinedElementsKey2 = elements[1] + elements[0];
        
        // Buscar la clave en las recetas de alquimia
        let foundCombination = alchemyRecipes[combinedElementsKey1] || alchemyRecipes[combinedElementsKey2];
        
        // Si se encuentra una combinación, retornar los resultados posibles
        if (foundCombination) {
            return foundCombination.length > 4 ? foundCombination.slice(0, 4) : foundCombination;
        } else {
            // Si no se encuentra combinación, retornar nulo
            return null;
        }
    }


    function saveGame(gameState) {
        localStorage.setItem('discoveredElements', JSON.stringify(gameState));
    }

    function loadGame() {
        let savedGame = localStorage.getItem('discoveredElements');
        return savedGame ? JSON.parse(savedGame) : null;
    }

    // ... (rest of your existing code)

// Function to reset the game to its initial state
function resetGame() {
    // Reset the discovered elements to the base elements only
    discoveredElements = { base: ["Singularidad", "Expansión"], combined: [] };
    // Clear the local storage
    localStorage.removeItem('discoveredElements');
    // Clear the elements container and the crafting area
    document.getElementById('elements').innerHTML = '';
    craftingArea.innerHTML = '';
    // Clear any combination results displayed
    document.getElementById('combination-results').textContent = '';
    // Re-initialize the game elements
    initGame();
}

// And then, bind the resetGame function to the click event of this button:
document.getElementById('reset-button').addEventListener('click', resetGame);

    // Nuevo código para el botón de menú y el menú lateral
    document.addEventListener('DOMContentLoaded', () => {
        const elementsContainer = document.getElementById('elements');
        const craftingArea = document.getElementById('crafting-area');
        const resultsArea = document.getElementById('combination-results');
        const toggleButton = document.getElementById('menu-toggle'); //agregados elementos del menú desplegable
        const sideMenu = document.getElementById('side-menu');
    
        toggleButton.addEventListener('click', () => {
            // Alternar la clase 'expanded' del menú lateral
            sideMenu.classList.toggle('expanded');
    
            // Determinar el nuevo estado del menú lateral
            const isExpanded = sideMenu.classList.contains('expanded');
            // Cambiar el texto y la posición del botón basado en el nuevo estado del menú
            toggleButton.textContent = isExpanded ? '⮜' : '⮞';
            toggleButton.style.left = isExpanded ? '250px' : '0px';
    
            console.log('Menú ' + (isExpanded ? 'expandido.' : 'contraído.'));
        });
    });

//Lo siguiente es para comprobar errores
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const toggleButton = document.getElementById('menu-toggle');
        const sideMenu = document.getElementById('side-menu');

        if (!toggleButton) {
            console.error('El botón de menú no se encontró en el DOM.');
            return;
        }

        toggleButton.addEventListener('click', () => {
            const isExpanded = sideMenu.classList.contains('expanded');
            sideMenu.classList.toggle('expanded');
            toggleButton.textContent = isExpanded ? '⮞' : '⮜';
            console.log('Menú ' + (isExpanded ? 'contraído.' : 'expandido.'));
        });

        console.log('Evento de menú desplegable vinculado correctamente.');
    }, 100); // Retraso de 100ms
    
});
document.addEventListener('DOMContentLoaded', () => {
    // ... (resto del código de inicialización)

    // Este es el código de prueba
    const toggleButton = document.getElementById('menu-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            console.log('El botón de menú fue clickeado.');
        });
    } else {
        console.log('El botón de menú no se encontró.');
    }
});