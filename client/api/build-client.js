import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server we need to specify the url to call the nginx server

    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // we are on the browser and we can use the base url as '' as it will be appended by the browser itself
    return axios.create({
      baseUrl: '/',
    });
  }
};
