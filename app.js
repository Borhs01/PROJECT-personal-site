(() => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const currentFile = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.header__nav__link').forEach((link) => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    const linkFile = href.split('/').pop();
    const homeMatch = linkFile === 'index.html' && (currentFile === 'index.html' || currentFile === 'overview' || path === '/');
    const blogMatch = linkFile === 'blog.html' && (currentFile === 'blog.html' || currentFile.startsWith('blog-'));
    const active = homeMatch || blogMatch || linkFile === currentFile;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
  });
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.grid__item[data-category]');
  filters.forEach((button) => button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    projects.forEach((project) => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
  }));
  document.querySelectorAll('[data-year]').forEach((year) => { year.textContent = new Date().getFullYear(); });

  const liveAppLinks = document.querySelectorAll('[data-project-url^="http"]');
  if (liveAppLinks.length) {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="project-modal__backdrop" data-modal-close></div>
      <section class="project-modal__panel" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <header class="project-modal__header">
          <div><span>Live project</span><h2 id="project-modal-title">BORHS VTU App</h2></div>
          <div class="project-modal__actions">
            <a href="#" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
            <button type="button" data-modal-close aria-label="Close project preview">×</button>
          </div>
        </header>
        <iframe title="Live project preview" loading="lazy"></iframe>
      </section>`;
    document.body.appendChild(modal);

    const frame = modal.querySelector('iframe');
    const heading = modal.querySelector('h2');
    const externalLink = modal.querySelector('.project-modal__actions a');
    const closeButton = modal.querySelector('button[data-modal-close]');
    let returnFocus;
    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      frame.src = 'about:blank';
      if (returnFocus) returnFocus.focus();
    };
    liveAppLinks.forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      returnFocus = link;
      heading.textContent = link.dataset.projectTitle;
      frame.src = link.dataset.projectUrl;
      frame.title = `${link.dataset.projectTitle} live preview`;
      externalLink.href = link.dataset.projectUrl;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      closeButton.focus();
    }));
    modal.querySelectorAll('[data-modal-close]').forEach((control) => control.addEventListener('click', closeModal));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }
})();
