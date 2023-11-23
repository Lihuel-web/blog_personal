// The path to your JSON file
const dataPath = 'alchemy-recipes.json';

// Game state
let discoveredElements = loadGame() || {
  base: ["Singularidad", "Expansión"],
  combined: []
};
let alchemyRecipes = {};

function loadGame() {
    let savedGame = localStorage.getItem('discoveredElements');
    return savedGame ? JSON.parse(savedGame) : { base: ["Singularidad", "Expansión"], combined: [] };
}
// Place this at the top of your script.js file
//Double tap for cellphones
let lastTapTime = 0;
let lastTapElement = null;

function handleMobileDoubleTap(element) {
    element.addEventListener('touchstart', function(e) {
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0 && lastTapElement === e.target) {
            // Lógica para doble tap aquí
            if (e.target.classList.contains('non-combinable')) {
                let clonedElement = e.target.cloneNode(true);
                addElementToMenu(clonedElement);
                e.target.remove();
            }
        }
        lastTapTime = currentTime;
        lastTapElement = e.target;
    });
}


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
            updateNonCombinableElements(); // Call it here to update elements on game initialization
        }

    function createElementDiv(element) {
        let elDiv = document.createElement('div');
        elDiv.textContent = element;
        elDiv.className = 'element';
        elDiv.setAttribute('data-element', element); 
        elDiv.setAttribute('draggable', true);
        elDiv.ondragstart = dragStart;
         // Add dblclick event listener to move non-combinable element to the left menu on double-click
         elDiv.ondblclick = function(e) {
            if (e.target.classList.contains('non-combinable')) {
                // Clonar y mover el elemento al menú de la izquierda
                let clonedElement = e.target.cloneNode(true);
                addElementToMenu(clonedElement);
                e.target.remove(); // Opcional: remover el elemento del área principal
            }
        // Add this line within the function
        handleMobileDoubleTap(elDiv);  // For mobile double-tap handling
        };
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
                updateNonCombinableElements(); // Update non-combinable elements after a successful combination
            } else {
                // If no results, show the error message
                resultsArea.textContent = "No ha pasado nada...";
            }
        }
    }

    function hasMoreCombinations(elementName) {
        // Check if elementName is part of any undiscovered combinations in alchemyRecipes
    for (let recipe in alchemyRecipes) {
        if (recipe.includes(elementName)) {
            let possibleResults = alchemyRecipes[recipe];
            // Check if any of the combination results have not been discovered yet
            if (possibleResults.some(result => !discoveredElements.combined.includes(result))) {
                return true;
            }
        }
    }
    return false;
}
    //dos siguientes funciones para mandar elementos usados no combinables al menú
    function markElementAsNonCombinable(elementName) {
        console.log("Marking element as non-combinable:", elementName);
        let element = document.querySelector(`.element[data-element="${elementName}"]`);
        if (element && !element.classList.contains('non-combinable')) {
            element.classList.add('non-combinable');
            // Removed the automatic addition to the left menu
        }
    }
    function updateNonCombinableElements() {
        // Iterate over all discovered elements
        discoveredElements.base.concat(discoveredElements.combined).forEach(elementName => {
            if (!hasMoreCombinations(elementName)) {
                // If all combinations involving the element have been discovered, mark it as non-combinable
                markElementAsNonCombinable(elementName);
            }
        });
    }
    
    function addElementToMenu(element) {
        let menu = document.getElementById('non-combinable-elements');
        element.classList.add('in-menu');
        menu.appendChild(element);
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
    // Clear the left menu ("Elementos No Combinables")
    document.getElementById('non-combinable-elements').innerHTML = '';
    // Re-initialize the game elements
    initGame();
}

// And then, bind the resetGame function to the click event of this button:
document.getElementById('reset-button').addEventListener('click', resetGame);
})
