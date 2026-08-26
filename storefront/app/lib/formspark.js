export const FORMSPARK_URL = 'https://submit-form.com/vwsJT57aO';

export async function postFormspark(form) {
  const response = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: {Accept: 'application/json'},
  });
  if (!response.ok) throw new Error('Submission failed');
}
