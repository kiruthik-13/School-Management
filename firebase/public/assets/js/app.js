/* School Management - global UX helpers */
(function () {
  'use strict';

  var toastBox = null;

  function ensureToastBox() {
    if (toastBox) return toastBox;
    toastBox = document.createElement('div');
    toastBox.className = 'toast-box';
    toastBox.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastBox);
    return toastBox;
  }

  function toast(type, message) {
    var icons = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill' };
    var el = document.createElement('div');
    el.className = 'sms-toast shadow rounded-4 bg-white ' + type;
    el.setAttribute('data-type', type);
    el.innerHTML =
      '<div class="d-flex align-items-center gap-2 p-3">' +
      '<span class="toast-icon text-' + (type === 'danger' ? 'danger' : type) + '"><i class="bi ' + (icons[type] || icons.info) + '"></i></span>' +
      '<span class="toast-msg">' + message + '</span>' +
      '<button type="button" class="btn-close ms-auto" aria-label="Close"></button>' +
      '</div>';
    ensureToastBox().appendChild(el);
    var close = function () {
      el.classList.add('hiding');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    };
    el.querySelector('.btn-close').addEventListener('click', close);
    setTimeout(close, 4000);
  }

  /* -------- Server flashes (req.flash) appear as pop-up toasts -------- */
  (function () {
    var el = document.getElementById('pageFlashes');
    if (!el) return;
    var list;
    try { list = JSON.parse(el.textContent); } catch (e) { return; }
    (list || []).forEach(function (f) { toast(f.type || 'info', f.message || ''); });
  })();

  /* -------- Confirm modal for [data-confirm] actions -------- */
  var confirmTitle = 'Please confirm';
  var confirmText = 'Are you sure?';
  var confirmOk = false;

  function requestConfirm(title, text) {
    confirmTitle = title || 'Please confirm';
    confirmText = text || 'Are you sure you want to continue?';
    confirmOk = false;
    return new Promise(function (resolve) {
      var modalEl = document.getElementById('smsConfirmModal');
      if (!modalEl) return resolve(true);
      modalEl.querySelector('.modal-title').textContent = confirmTitle;
      modalEl.querySelector('.modal-body p').textContent = confirmText;
      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
      var done = function (value) {
        modal.hide();
        confirmOk = value;
        cleanup();
        resolve(value);
      };
      function onOk() { done(true); }
      function onNo() { done(false); }
      function onHidden() { if (!confirmOk) resolve(false); }
      function cleanup() {
        modalEl.querySelector('[data-confirm-ok]').removeEventListener('click', onOk);
        modalEl.querySelector('[data-confirm-no]').removeEventListener('click', onNo);
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
      }
      modalEl.querySelector('[data-confirm-ok]').addEventListener('click', onOk);
      modalEl.querySelector('[data-confirm-no]').addEventListener('click', onNo);
      modalEl.addEventListener('hidden.bs.modal', onHidden);
    });
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-confirm]');
    if (!trigger) return;
    var message = trigger.getAttribute('data-confirm') || 'Are you sure you want to continue?';
    e.preventDefault();
    e.stopImmediatePropagation();
    requestConfirm('Please confirm', message).then(function (ok) {
      if (!ok) return;
      var tag = (trigger.tagName || '').toLowerCase();
      if (tag === 'a') {
        window.location.href = trigger.getAttribute('href');
      } else if (tag === 'button' && trigger.getAttribute('data-form')) {
        document.getElementById(trigger.getAttribute('data-form')).submit();
      } else if (tag === 'form') {
        trigger.submit();
      } else {
        window.location.href = trigger.getAttribute('href');
      }
    });
  }, true);

  /* -------- Table search: <input data-table-filter="#id"> filters rows -------- */
  document.querySelectorAll('[data-table-filter]').forEach(function (input) {
    input.addEventListener('input', function () {
      var target = document.querySelector(input.getAttribute('data-table-filter'));
      if (!target) return;
      var q = input.value.trim().toLowerCase();
      target.querySelectorAll('tbody tr').forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
      });
    });
  });

  /* -------- Grow animated progress bars on load -------- */
  (function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var bars = document.querySelectorAll('.progress-bar');
    bars.forEach(function (bar) {
      var target = bar.style.width || '';
      function grow() {
        bar.style.width = '0%';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { bar.style.width = target; });
        });
      }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { grow(); io.disconnect(); }
          });
        }, { threshold: 0.3 });
        io.observe(bar);
      } else {
        grow();
      }
    });
  })();

  /* -------- Password visibility toggle (eye icon) -------- */
  document.querySelectorAll('input[type="password"]').forEach(function (inp) {
    var group = inp.closest('.input-group');
    var authGroup = inp.closest('.auth-input-group');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn password-toggle';
    btn.setAttribute('aria-label', 'Toggle password visibility');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<i class="bi bi-eye"></i>';
    btn.addEventListener('click', function () {
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      btn.innerHTML = '<i class="bi bi-' + (show ? 'eye-slash' : 'eye') + '"></i>';
    });
    if (group) {
      group.appendChild(btn);
    } else if (authGroup) {
      authGroup.appendChild(btn);
    } else {
      var wrap = document.createElement('div');
      wrap.className = 'input-group';
      inp.parentNode.insertBefore(wrap, inp);
      wrap.appendChild(inp);
      wrap.appendChild(btn);
    }
  });

  window.SMS = { toast: toast, confirm: requestConfirm };
})();