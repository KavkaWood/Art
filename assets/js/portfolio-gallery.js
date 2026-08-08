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
		'<div class="portfolio-lightbox__panel">' +
			'<header class="portfolio-lightbox__header">' +
				'<p class="portfolio-lightbox__title"></p>' +
				'<p class="portfolio-lightbox__count" aria-live="polite"></p>' +
				'<button class="portfolio-lightbox__close" type="button" aria-label="Zamknij galerię"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>' +
			'</header>' +
			'<div class="portfolio-lightbox__stage">' +
				'<button class="portfolio-lightbox__previous" type="button" aria-label="Poprzednie zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button>' +
				'<figure><img alt="" /><figcaption></figcaption></figure>' +
				'<button class="portfolio-lightbox__next" type="button" aria-label="Następne zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg></button>' +
			'</div>' +
			'<div class="portfolio-lightbox__thumbnails" aria-label="Wybierz zdjęcie"></div>' +
			'<p class="portfolio-lightbox__hint">Użyj klawiszy ← →, aby przeglądać · Esc, aby zamknąć</p>' +
			'<div class="portfolio-lightbox__mobile-controls">' +
				'<button class="portfolio-lightbox__previous" type="button" aria-label="Poprzednie zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button>' +
				'<span class="portfolio-lightbox__mobile-count"></span>' +
				'<button class="portfolio-lightbox__next" type="button" aria-label="Następne zdjęcie"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg></button>' +
			'</div>' +
		'</div>';
	document.body.appendChild(lightbox);

	var image = lightbox.querySelector('img');
	var caption = lightbox.querySelector('figcaption');
	var title = lightbox.querySelector('.portfolio-lightbox__title');
	var count = lightbox.querySelector('.portfolio-lightbox__count');
	var mobileCount = lightbox.querySelector('.portfolio-lightbox__mobile-count');
	var thumbnails = lightbox.querySelector('.portfolio-lightbox__thumbnails');
	var hint = lightbox.querySelector('.portfolio-lightbox__hint');
	var closeButton = lightbox.querySelector('.portfolio-lightbox__close');
	var previousButtons = Array.prototype.slice.call(lightbox.querySelectorAll('.portfolio-lightbox__previous'));
	var nextButtons = Array.prototype.slice.call(lightbox.querySelectorAll('.portfolio-lightbox__next'));
	var activeImages = [];
	var activeIndex = 0;
	var lastFocusedElement;
	var hasShownHint = false;

	function showImage(index) {
		activeIndex = (index + activeImages.length) % activeImages.length;
		var item = activeImages[activeIndex];
		var imageCount = (activeIndex + 1) + ' / ' + activeImages.length;
		image.classList.remove('is-loaded');
		image.src = item.href;
		image.alt = item.image.alt;
		caption.textContent = item.image.alt;
		title.textContent = item.name;
		count.textContent = imageCount;
		mobileCount.textContent = imageCount;
		previousButtons.concat(nextButtons).forEach(function(button) {
			button.hidden = activeImages.length < 2;
		});
		Array.prototype.slice.call(thumbnails.children).forEach(function(thumbnail, thumbnailIndex) {
			var isActive = thumbnailIndex === activeIndex;
			thumbnail.classList.toggle('is-active', isActive);
			thumbnail.setAttribute('aria-current', isActive ? 'true' : 'false');
		});
	}

	image.addEventListener('load', function() {
		image.classList.add('is-loaded');
	});

	function renderThumbnails() {
		thumbnails.innerHTML = '';
		activeImages.forEach(function(item, index) {
			var thumbnail = document.createElement('button');
			var thumbnailImage = document.createElement('img');
			thumbnail.type = 'button';
			thumbnail.className = 'portfolio-lightbox__thumbnail';
			thumbnail.setAttribute('aria-label', 'Pokaż zdjęcie ' + (index + 1));
			thumbnailImage.src = item.href;
			thumbnailImage.alt = '';
			thumbnail.appendChild(thumbnailImage);
			thumbnail.addEventListener('click', function() { showImage(index); });
			thumbnails.appendChild(thumbnail);
		});
	}

	function openGallery(items, index) {
		activeImages = items;
		lastFocusedElement = document.activeElement;
		renderThumbnails();
		showImage(index);
		lightbox.classList.add('is-visible');
		document.body.classList.add('portfolio-lightbox-open');
		hint.hidden = hasShownHint;
		hasShownHint = true;
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
			return { href: link.href, image: link.querySelector('img'), name: name };
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
	previousButtons.forEach(function(button) {
		button.addEventListener('click', function() { showImage(activeIndex - 1); });
	});
	nextButtons.forEach(function(button) {
		button.addEventListener('click', function() { showImage(activeIndex + 1); });
	});
	lightbox.addEventListener('click', function(event) {
		// The lightbox lives directly under <body>. Keep its clicks from
		// reaching the page-level handler that closes the current article.
		event.stopPropagation();
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
