import React, { useState } from "react";
import axios from 'axios';
import GoogleLogin from 'react-google-login';
import { FaGoogle } from "react-icons/fa";

export const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/dj-rest-auth/registration/', {
                email: email,
                password1: password1,
                password2: password2
            });

            // Registration successful
            setSuccessMessage('Registration successful. Redirecting to login page...');
            setError('');

            // Redirect to login page after a short delay (e.g., 2 seconds)
            setTimeout(() => {
                window.location.href = '/login'; // Redirect to the login page
            }, 2000);
        } catch (error) {
            // Registration failed
            setSuccessMessage('');
            setError('Registration failed. Please try again.');
        }
    };

    const handleGoogleSuccess = async (response) => {
        const { accessToken } = response;
        
        try {
            const res = await axios.post('http://localhost:8000/rest-auth/google/', {
                access_token: accessToken
            });

            console.log(res.data);
            // Handle successful Google authentication (optional)
        } catch (error) {
            console.error('Error signing up with Google:', error);
            // Handle Google authentication error
        }
    };

    const handleGoogleFailure = (error) => {
        console.error('Google authentication failed:', error);
        // Handle Google authentication failure
    };
    return (
        <div className="home">
            <div className="home-container form-container">
                <h1>- Create an account -</h1>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <form className="create-form" onSubmit={handleSubmit}>
                    <div className="text create-input">
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="text create-input">
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-text"
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            required
                        />
                    </div>
                    <div className="text create-input">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="input-text"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <div className="text create-input">
                        <button type="submit" className="generate-btn">
                            Signup
                        </button>
                    </div>
                    {/* <div className="text or">
                        <h3>or</h3>
                    </div>
                    <div className="text create-input">
                        <GoogleLogin
                            clientId="879908604520-cpeqnqqdlvf7ordd2nerh3pk08bpv61u.apps.googleusercontent.com"
                            buttonText="SIGNUP WITH GOOGLE"
                            onSuccess={handleGoogleSuccess}
                            onFailure={handleGoogleFailure}
                            render={(renderProps) => (
                                <button
                                  onClick={renderProps.onClick}
                                  disabled={renderProps.disabled}
                                  className="generate-btn"
                                >
                                  <FaGoogle /> <span>Sign up with Google</span>
                                </button>
                              )}
                        />
                        
                    </div> */}

                </form>
            </div>
        </div>
    );
};


