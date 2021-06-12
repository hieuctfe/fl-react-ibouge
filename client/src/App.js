import React, {useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {Helmet} from 'react-helmet';

import Cookies from 'js-cookie';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PersonalProfile from './pages/PersonalProfile';
import MapView from './pages/MapView';
import Users from './pages/Users';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import CountryView from './pages/Country';
import RestorePassword from './pages/RestorePassword';
import NewPassword from './pages/NewPassword';
import CreateEvent from './pages/CreateEvent';
import Event from './pages/Event';
import Chatroom from './components/Chat';

// import PrivateRoute from './hoc/requireAuth';
import {logInUserWithOauth, loadMe} from './actions/authActions';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const common = useSelector((state) => state.common);

  useEffect(() => {
    if (!auth.sess && sessionStorage.getItem('current_user')) {
      dispatch(loadMe());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMe]);

  // redosled hookova
  useEffect(() => {
    if (window.location.hash === '#_=_') window.location.hash = '';

    const cookieJwt = Cookies.get('x-auth-cookie');
    if (cookieJwt) {
      Cookies.remove('x-auth-cookie');
      dispatch(logInUserWithOauth(cookieJwt));
    }
  }, [dispatch]);
  useEffect(() => {
    if (
      !auth.appLoaded &&
      !auth.isLoading &&
      auth.token &&
      !auth.isAuthenticated
    ) {
      if (!auth.sess && sessionStorage.getItem('current_user')) {
        dispatch(loadMe());
      }
    }
  }, [auth.appLoaded, auth.isAuthenticated, auth.isLoading, auth.sess, auth.token, dispatch]);
  // const handleClick = () => {};
  return (
    <div className="App">
      <Helmet>
        <meta charSet="utf-8" />
        <title>iBouge | {common.title ? common.title : ''}</title>
        <link rel="canonical" href="https://ibouge.com" />
      </Helmet>
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/restorepassword" component={RestorePassword} />
          <Route exact path="/newpassword" component={NewPassword} />
          <Route exact path="/profile_setup/:step" component={ProfileSetup} />
          <Route exact path="/users" component={Users} />
          <Route exact path="/notfound" component={NotFound} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/mydashboard" component={Dashboard} />
          <Route exact path="/create-event" component={CreateEvent} />
          <Route exact path="/mapOverview" component={MapView} />
          <Route exact path="/mapOSM" component={CountryView} />
          <Route exact path="/myprofilesettings" component={Profile} />
          <Route exact path="/profile/:id" component={PersonalProfile} />
          <Route exact path="/event/:id" component={Event} />
          <Route exact path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Chatroom />
    </div>
  );
}

export default App;
