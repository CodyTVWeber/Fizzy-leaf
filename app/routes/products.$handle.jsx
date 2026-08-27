import {redirect} from 'react-router';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/shop');
}

/** @typedef {import('./+types/products.$handle').Route} Route */
