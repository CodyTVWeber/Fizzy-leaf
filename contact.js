/* Contact page: async form submission with an animated accepted state. */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  function setStatus(type, message) {
    status.className = type ? 'form-status ' + type : 'form-status';
    status.textContent = message;
  }

  function showSending() {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('', '');
  }

  function showAccepted() {
    form.reset();
    submitBtn.classList.add('is-success');
    submitBtn.textContent = '✓ Sent!';
    setStatus('success', '✓ Thank you! Your message has been sent.');
  }

  function showError() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    setStatus('error', 'Something went wrong. Please try again or email us directly.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    showSending();
    try {
      var response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      showAccepted();
    } catch (err) {
      showError();
    }
  }

  form.addEventListener('submit', handleSubmit);
})();
