// The path to your JSON file
const dataPath = 'alchemy-recipes.json';
function loadGame() {
    let savedGame = localStorage.getItem('discoveredElements');
    return savedGame ? JSON.parse(savedGame) : { base: ["Singularidad", "Expansión"], combined: [] };
}
// Game state
let discoveredElements = loadGame() || {
  base: [],
  combined: []
};
let alchemyRecipes = {};

document.addEventListener('DOMContentLoaded', () => {
    const elementsContainer = document.getElementById('elements');
    const craftingArea = document.getElementById('crafting-area');
    const resultsArea = document.getElementById('combination-results');

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
        let combinationResult = combineElements(currentElements);
        if (combinationResult && !discoveredElements.combined.includes(combinationResult)) {
            // New element discovered
            resultsArea.textContent = `You've created: ${combinationResult}`;
            discoveredElements.combined.push(combinationResult);
            createElementDiv(combinationResult); // Add the new element to the container
            saveGame(discoveredElements);
        } else if (combinationResult) {
            // Element already discovered
            resultsArea.textContent = `You have combined to recreate: ${combinationResult}`;
        } else {
            // No new element discovered
            resultsArea.textContent = "Nothing happened...";
        }
        // Clear the crafting area
        craftingArea.innerHTML = '';
    }
}

    function combineElements(elements) {
        let foundCombination = Object.keys(alchemyRecipes).find(key =>
            alchemyRecipes[key].sort().join(',') === elements.sort().join(',')
        );
        return foundCombination || null;
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

// ... (rest of your existing code)

// You may also want to provide a button or some UI element to trigger this reset
// For example, add a reset button in your HTML:
// <button id="reset-button">Reset Game</button>

// And then, bind the resetGame function to the click event of this button:
document.getElementById('reset-button').addEventListener('click', resetGame);


});


