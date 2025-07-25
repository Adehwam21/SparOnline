import React, { useState } from 'react';
import Login from '../components/Forms/Login';
import SignUp from '../components/Forms/SignUp';

const LandingPage: React.FC = () =>  {
    const [showLogin, setShowLogin] = useState(true);

    const toggleForm = () => {
        setShowLogin(!showLogin);
    };

    return (
        <div className="font-poppins flex items-center pt-10 justify-center">
            <div className="landing-content w-full mt-5 text-white md:w-96 p-4 py-2">
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