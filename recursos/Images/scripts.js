function showModal(index) {
    const imageCard = document.querySelectorAll('.image-card')[index - 1];
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
  
    modalImage.src = imageCard.querySelector('img').src;
    modalDescription.textContent = imageCard.querySelector('.image-description').textContent;
  
    document.getElementById('modal').style.display = 'block';
  }
  
  function closeModal() {
    document.getElementById('modal').style.display = 'none';
  }