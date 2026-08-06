/* Portfolio gallery previews and lightbox. */
(function() {
	'use strict';

	var galleries = Array.prototype.slice.call(document.querySelectorAll('.portfolio-gallery'));
	if (!galleries.length)
		return;

	var lightbox = document.createElement('div');
	lightbox.className = 'portfolio-lightbox';
	lightbox.setAttribute('role', 'dialog');
	lightbox.setAttribute('aria-modal', 'true');
	lightbox.setAttribute('aria-label', 'Galeria zdjęć');
	lightbox.innerHTML =
		'<button class="portfolio-lightbox__close" type="button" aria-label="Zamknij galerię">×</button>' +
		'<button class="portfolio-lightbox__previous" type="button" aria-label="Poprzednie zdjęcie">‹</button>' +
		'<figure><img alt="" /><figcaption></figcaption></figure>' +
		'<button class="portfolio-lightbox__next" type="button" aria-label="Następne zdjęcie">›</button>';
	document.body.appendChild(lightbox);

	var image = lightbox.querySelector('img');
	var caption = lightbox.querySelector('figcaption');
	var closeButton = lightbox.querySelector('.portfolio-lightbox__close');
	var previousButton = lightbox.querySelector('.portfolio-lightbox__previous');
	var nextButton = lightbox.querySelector('.portfolio-lightbox__next');
	var activeImages = [];
	var activeIndex = 0;
	var lastFocusedElement;

	function showImage(index) {
		activeIndex = (index + activeImages.length) % activeImages.length;
		var item = activeImages[activeIndex];
		image.src = item.href;
		image.alt = item.image.alt;
		caption.textContent = (activeIndex + 1) + ' / ' + activeImages.length;
		previousButton.hidden = activeImages.length < 2;
		nextButton.hidden = activeImages.length < 2;
	}

	function openGallery(items, index) {
		activeImages = items;
		lastFocusedElement = document.activeElement;
		showImage(index);
		lightbox.classList.add('is-visible');
		document.body.classList.add('portfolio-lightbox-open');
		closeButton.focus();
	}

	function closeGallery() {
		lightbox.classList.remove('is-visible');
		document.body.classList.remove('portfolio-lightbox-open');
		image.removeAttribute('src');
		if (lastFocusedElement)
			lastFocusedElement.focus();
	}

	galleries.forEach(function(gallery) {
		var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
		var name = gallery.getAttribute('data-gallery-name') || 'Portfolio';
		var items = links.map(function(link) {
			return { href: link.href, image: link.querySelector('img') };
		});

		if (!items.length)
			return;

		gallery.classList.add('is-enhanced');
		if (items.length > 2) {
			links[2].classList.add('portfolio-gallery__more');
			links[2].setAttribute('data-remaining', '+' + (items.length - 2));
		}

		links.forEach(function(link, index) {
			link.setAttribute('aria-label', 'Pokaż galerię „' + name + '” — zdjęcie ' + (index + 1) + ' z ' + items.length);
			link.addEventListener('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				openGallery(items, index);
			});
		});
	});

	closeButton.addEventListener('click', closeGallery);
	previousButton.addEventListener('click', function() { showImage(activeIndex - 1); });
	nextButton.addEventListener('click', function() { showImage(activeIndex + 1); });
	lightbox.addEventListener('click', function(event) {
		if (event.target === lightbox)
			closeGallery();
	});

	window.addEventListener('keyup', function(event) {
		if (!lightbox.classList.contains('is-visible'))
			return;
		if (event.key === 'Escape')
			closeGallery();
		else if (event.key === 'ArrowLeft')
			showImage(activeIndex - 1);
		else if (event.key === 'ArrowRight')
			showImage(activeIndex + 1);
		else
			return;
		event.preventDefault();
		event.stopPropagation();
	}, true);
})();
