import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

/**
 * This function will be executed on the server on
 *
 * Hard refresh of page
 * Clicking link from different domain
 * Typing URL on the address bar
 *
 * It will be executed on the browser on navigating from one page to another
 * while inside the app
 *
 */

LandingPage.getInitialProps = async (context) => {
  console.log('Landing Page getInitialProps executed!');
  const client = buildClient(context);

  const { data } = await client.get('/api/users/currentuser');

  return data;
};

export default LandingPage;
