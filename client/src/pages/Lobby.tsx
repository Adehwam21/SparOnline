import React, { useState } from 'react';
import Login from '../components/Forms/Login';
import SignUp from '../components/Forms/SignUp';
import Header from '../components/Header';

const LandingPage: React.FC = () =>  {
    const [showLogin, setShowLogin] = useState(true);

    const toggleForm = () => {
        setShowLogin(!showLogin);
    };

    return (
        <div className="landing-page font-poppins min-h-screen flex items-center p-4 pt-10 justify-center">
            <Header/>
            <div className="landing-content text-white md:w-96 p-4 bg-green-900 py-2 rounded-lg shadow-lg">
                {showLogin ? (
                    <Login toggleForm={toggleForm} />
                ) : (
                    <SignUp toggleForm={toggleForm} />
                )}
                <div className=" form-toggle-link my-4 text-center">
                    <p>
                        {showLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            onClick={toggleForm}
                            className="text-yellow-300 hover:text-yellow-400 cursor-pointer font-semibold"
                        >
                            {showLogin ? 'Sign Up' : 'Log In'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;