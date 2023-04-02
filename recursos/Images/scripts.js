// Function to display the modal with the selected image and its description
function showModal(index) {
  // Get the image card based on the index provided in the function argument
  const imageCard = document.querySelectorAll('.image-card')[index - 1];

  // Get the modal image and modal description elements
  const modalImage = document.getElementById('modal-image');
  const modalDescription = document.getElementById('modal-description');

  // Set the modal image source and description based on the selected image card
  modalImage.src = imageCard.querySelector('img').src;
  modalDescription.textContent = imageCard.querySelector('.image-description').textContent;

  // Display the modal
  document.getElementById('modal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
  // Hide the modal
  document.getElementById('modal').style.display = 'none';
}

// Event listener for keydown events
document.addEventListener('keydown', function(event) {
  // Check if the pressed key is the ESC key
  if (event.key === 'Escape') {
    // Call the closeModal function to close the modal
    closeModal();
  }
});
