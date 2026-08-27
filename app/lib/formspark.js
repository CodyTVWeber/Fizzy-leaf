import {logError, logInfo} from '~/lib/log';

export const FORMSPARK_URL = 'https://submit-form.com/vwsJT57aO';

export async function postFormspark(form) {
  const topicField = form.elements?.namedItem?.('topic');
  const topic = topicField && 'value' in topicField ? topicField.value : '(none)';
  logInfo('formspark', 'submit start', {action: form.action, topic});
  const response = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: {Accept: 'application/json'},
  });
  if (!response.ok) {
    logError('formspark', 'submit failed', {status: response.status});
    throw new Error('Submission failed');
  }
  logInfo('formspark', 'submit ok', {status: response.status});
}
