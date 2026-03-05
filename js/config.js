/* ============================================================
   Configuration Supabase
   ============================================================
   Remplacez les valeurs ci-dessous par vos credentials Supabase.
   La cle anon est une cle publique securisee par les Row Level
   Security policies de votre base de donnees.
   ============================================================ */

const SUPABASE_URL = 'https://orcuuknomvpzduiyrfpw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_NkKpX5JgIFFqWk9D3R8VlQ_wgeJ8x_l'

// Client Supabase global (utilise par toutes les pages)
// Le script supabase-js doit etre charge avant ce fichier
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ============================================================
   Newsletter — Brevo (double opt-in)
   ============================================================ */
;(function initNewsletter() {
  function setup() {
    document.querySelectorAll('.newsletter-form').forEach(function(form) {
      if (form.dataset.brevo) return; // déjà initialisé
      form.dataset.brevo = '1';

      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var emailInput = form.querySelector('.newsletter-input');
        var btn = form.querySelector('.newsletter-btn');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        btn.disabled = true;
        var originalText = btn.textContent;
        btn.textContent = '…';

        var formData = new FormData();
        formData.append('EMAIL', email);
        formData.append('email_address_check', '');
        formData.append('locale', 'fr');

        try {
          var response = await fetch(
            'https://6e2e5c97.sibforms.com/serve/MUIFAArw5uz0jHeZVDUGK8QyhuviJe30C_m-nBMMNHWCABd1dUyUOq11bAJrS_eY0Uj7xT0EUSyusfQUKZOj3MSN4bP9wfruo45mFdGpWiVMFJkospHYI7sRXXxOa_PDox5ghc3QSw-TfdkeIqxqq9ELq4c78uDHfZcECbR6zBwg0MtNONmnJ_-NB0s-2V4JSHf2_6X3fGp-oBqmdQ==',
            { method: 'POST', body: formData }
          );
          if (response.ok) {
            emailInput.value = '';
            btn.textContent = '✓';
            var hint = document.createElement('p');
            hint.style.cssText = 'font-size:0.8rem;margin-top:0.4rem;color:inherit;opacity:0.85';
            hint.textContent = 'Vérifiez votre boîte mail pour confirmer.';
            form.appendChild(hint);
          } else {
            btn.disabled = false;
            btn.textContent = originalText;
            alert('Une erreur est survenue. Veuillez réessayer.');
          }
        } catch (err) {
          btn.disabled = false;
          btn.textContent = originalText;
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

/* ============================================================
   Analytics (Umami)
   ============================================================ */
;(function injectUmami() {
  try {
    // Avoid double-inject
    if (document.querySelector('script[data-website-id="e0bd5182-608e-4ec4-a1bd-2485bd85bf6a"]')) return

    var s = document.createElement('script')
    s.defer = true
    s.src = 'https://cloud.umami.is/script.js'
    s.setAttribute('data-website-id', 'e0bd5182-608e-4ec4-a1bd-2485bd85bf6a')
    document.head.appendChild(s)
  } catch (e) {
    // no-op
  }
})()
