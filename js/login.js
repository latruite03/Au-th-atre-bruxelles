/* ============================================================
   Page de connexion — Authentification Supabase
   ============================================================ */

;(function () {
  'use strict'

  var form = document.getElementById('login-form')
  var emailInput = document.getElementById('login-email')
  var passwordInput = document.getElementById('login-password')
  var errorBox = document.getElementById('login-error')
  var submitBtn = document.getElementById('login-submit')

  // Check if already authenticated → redirect to admin
  ;(async function checkAuth() {
    try {
      var result = await supabaseClient.auth.getUser()
      if (result.data && result.data.user) {
        window.location.href = 'admin.html'
      }
    } catch (e) {
      // Not logged in, stay on login page
    }
  })()

  form.addEventListener('submit', async function (e) {
    e.preventDefault()
    errorBox.classList.add('hidden')
    submitBtn.disabled = true
    submitBtn.textContent = 'Connexion\u2026'

    try {
      var result = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
      })

      if (result.error) {
        showError(result.error.message)
      } else {
        window.location.href = 'admin.html'
      }
    } catch (err) {
      showError('Une erreur est survenue')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Se connecter'
    }
  })

  function showError(msg) {
    errorBox.textContent = msg
    errorBox.classList.remove('hidden')
  }
})()
