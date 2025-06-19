const stars = document.querySelectorAll('.star');
const ratingValueDisplay = document.getElementById('rating-value-display');

if (stars.length > 0) {
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);

    star.addEventListener('mouseenter', () => {
      highlightStars(value);
      ratingValueDisplay.textContent = `${value}/5`;
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
      ratingValueDisplay.textContent = selectedRating ? `${selectedRating}/5` : `0/5`;
    });

    star.addEventListener('click', () => {
      selectedRating = value;
      highlightStars(selectedRating);
      ratingValueDisplay.textContent = `${selectedRating}/5`;
    });
  });
}

// تغيير لون النجوم
function highlightStars(rating) {
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    star.classList.toggle('selected', val <= rating);
    star.classList.toggle('hovered', val <= rating);
  });
}