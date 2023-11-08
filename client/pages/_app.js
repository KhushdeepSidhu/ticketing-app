import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />;
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  console.log('appContext', appContext);

  const client = buildClient(appContext.ctx);

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  const { data } = await client.get('/api/users/currentuser');

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
