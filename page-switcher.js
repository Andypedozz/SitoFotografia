(function () {
  function hideAllPages() {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function (p) {
      p.style.display = 'none';
    });
  }

  function showPage(pageId) {
    hideAllPages();
    var page = document.querySelector('.page[data-page-id="' + pageId + '"]');
    if (page) {
      page.style.display = '';
    }
  }

  function initPageSwitcher() {
    // Nasconde tutte le pagine tranne la prima
    var pages = document.querySelectorAll('.page');
    pages.forEach(function (p, index) {
      p.style.display = index === 0 ? '' : 'none';
    });

    // Listener sui pulsanti
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-page]');
      if (!target) return;

      e.preventDefault();
      var pageId = target.getAttribute('data-page');
      showPage(pageId);
    });
  }

  // Espone una mini API globale (opzionale)
  window.PageSwitcher = {
    show: showPage,
    init: initPageSwitcher
  };

  // Auto-init quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageSwitcher);
  } else {
    initPageSwitcher();
  }
})();
