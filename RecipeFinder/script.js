document.addEventListener('DOMContentLoaded', () => {
    const searchView = document.getElementById('search-view');
    const detailView = document.getElementById('detail-view');
    const backButton = document.getElementById('back-button');
    const recipeCards = document.querySelectorAll('.recipe-card');

    // Detail view elements to update
    const detailImage = document.getElementById('detail-image');
    const detailTitle = document.getElementById('detail-title');
    const detailTime = document.getElementById('detail-time');
    const detailCals = document.getElementById('detail-cals');

    // Show Detail View
    function showDetail(card) {
        // Extract data from the card
        const imageSrc = card.querySelector('.recipe-image').src;
        const title = card.querySelector('.recipe-title').textContent;
        const time = card.querySelector('.recipe-time').textContent;
        const cals = card.querySelector('.recipe-cals').textContent.split(' ')[0]; // Just the number

        // Populate detail view
        detailImage.style.backgroundImage = `url("${imageSrc}")`;
        detailTitle.textContent = title;
        detailTime.textContent = time;
        detailCals.textContent = cals;

        // Transition
        searchView.classList.add('hidden');
        detailView.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    // Show Search View
    function showSearch() {
        detailView.classList.add('hidden');
        searchView.classList.remove('hidden');
    }

    // Event Listeners
    recipeCards.forEach(card => {
        card.addEventListener('click', () => showDetail(card));
    });

    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior if it's an anchor
            showSearch();
        });
    }
});












