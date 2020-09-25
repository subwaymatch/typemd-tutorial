import React from 'react';
import { Router, Link } from '@reach/router';

import withFirebaseAuth from 'react-with-firebase-auth';
import { firebaseAppAuth, providers } from 'lib/firebase';

import { Dashboard, Editor, SignIn } from 'components';
import './App.css';

const createComponentWithAuth = withFirebaseAuth({
  providers,
  firebaseAppAuth,
});

const App = ({ signInWithGoogle, signInWithGithub, signOut, user }) => {
  console.log(user);

  return (
    <>
      <header className="header">
        <Link to="/">
          <h2>TypeMD</h2>
        </Link>
        {user && (
          <div className="user-profile">
            <a
              className="log-out-link"
              href="#log-out"
              onClick={() => {
                console.log('Signed out...');
                signOut();
              }}
            >
              Log Out
            </a>
            <img alt="Profile" className="avatar" src={user.photoURL} />
          </div>
        )}
      </header>
      <Router>
        <SignIn
          path="/"
          user={user}
          signIns={{ signInWithGithub, signInWithGoogle }}
        />
        <Dashboard path="user/:userId" user={user} />
        <Editor path="user/:userId/editor/:fileId" user={user} />
      </Router>
    </>
  );
};

export default createComponentWithAuth(App);
