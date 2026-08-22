import {useState} from 'react';

const FORMSPARK_URL = 'https://submit-form.com/vwsJT57aO';

const STATUS = {
  idle: 'idle',
  sending: 'sending',
  success: 'success',
  error: 'error',
};

export function ContactForm() {
  const [status, setStatus] = useState(STATUS.idle);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus(STATUS.sending);
    try {
      await postFormspark(form);
      form.reset();
      setStatus(STATUS.success);
    } catch {
      setStatus(STATUS.error);
    }
  }

  const sending = status === STATUS.sending;
  const success = status === STATUS.success;

  return (
    <form onSubmit={handleSubmit} action={FORMSPARK_URL} method="POST">
      <div className="form-row">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
        />
      </div>
      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="form-row">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={5} required />
      </div>
      <button
        type="submit"
        id="submitBtn"
        className={`btn btn--primary${success ? ' is-success' : ''}`}
        style={{width: '100%'}}
        disabled={sending || success}
      >
        {sending ? 'Sending…' : success ? '✓ Sent!' : 'Send Message'}
      </button>
      <div
        className={`form-status${status === STATUS.success ? ' success' : ''}${status === STATUS.error ? ' error' : ''}`}
        role="alert"
      >
        {status === STATUS.success
          ? '✓ Thank you! Your message has been sent.'
          : status === STATUS.error
            ? 'Something went wrong. Please try again or email us directly.'
            : ''}
      </div>
    </form>
  );
}

async function postFormspark(form) {
  const response = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: {Accept: 'application/json'},
  });
  if (!response.ok) throw new Error('Submission failed');
}
