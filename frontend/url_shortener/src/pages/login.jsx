import React, { useState } from "react";
import axios from 'axios';
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


import GoogleLogin from 'react-google-login';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/dj-rest-auth/login/', {
                email: email,
                password: password
            },  {headers: {
                "Content-Type" : "application/json"
            },
            withCredentials: true
        },);

            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            // console.log(response.data)
            setSuccessMessage('Login successful.');
            setIsAuthenticated(true);
            navigate('/dashboard');
            setError('');

        } catch (error) {
            // Registration failed
            setSuccessMessage('');
            setError('Login failed. Please try again.');
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
                <h1>- WELCOME BACK -</h1>
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                   
                    <div className="text create-input">
                        <button type="submit" className="generate-btn">
                            Login
                        </button>
                    </div>
                    {/* <div className="text or">
                        <h3>or</h3>
                    </div> */}
                    {/* <div className="text create-input">
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
                                  <FaGoogle /> <span>Sign In with Google</span>
                                </button>
                              )}
                        />
                      
                    </div> */}

                </form>
            </div>
        </div>
    );
};


