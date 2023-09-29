import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import '../index.css';

const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const Login = () => {
  return (
    <div className="mainMenu menuBackground">
        <div className="menuContentArea boxShadowBlackL flex flex-col items-center justify-center">
            <div className="workspaceCreationHeading">
                <h1 className="text-pageName font-bold">Sign in to Slate-AI</h1>
                {/* The text changes based on the stage */}
                <h2 className="text-h4 text-grey mx-2">Log in with your Google account</h2>
            </div>
            <div id="signInGoogle" className="flex justify-center">
                <button onClick={signInWithGoogle} type="submit" className="w-full z-10">
                    <div className="SpecialButton SpecialButton:hover gradient-border gradient-border:after">
                        <h2 className="SpecialButtonText">
                          Sign in with Google
                        </h2>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Login;
