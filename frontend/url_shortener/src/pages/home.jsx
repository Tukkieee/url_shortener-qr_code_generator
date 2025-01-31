import React, { useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom"
import copy from 'clipboard-copy';
import { FiLink2 } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import { FaRegCopy } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { MdAutorenew } from "react-icons/md";


export const Home = () => {
  const [generateType, setGenerateType] = useState('Link');
  const [generatedValue, setGeneratedValue] = useState('');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');

  const options = [
    { value: 'Link', label: 'Link', icon: <FiLink2 /> },
    { value: 'Code', label: 'Code', icon: <BsQrCodeScan /> },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault(); // Prevent form submission
    setIsLoading(true);

    try {
      let endpoint = generateType === 'Link' ? 'shorten/' : 'generate-qr/';
      const response = await axios.post(`http://localhost:8000/url/${endpoint}`, {
        original_url: originalUrl
      }, {
        withCredentials: true
      });

      const generatedValue = response.data.short_url || response.data.qr_code;
      setGeneratedValue(generatedValue);
      setError(''); // Clear any previous error
    } catch (error) {
      console.error('Error generating:', error);

      let errorMessage = 'An error occurred while processing the request';
      if (error.response) {
        // Server responded with an error status (4xx or 5xx)
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server';
      }

      setError(errorMessage);
      setGeneratedValue(''); // Clear generated value on error
    }  finally {
      setIsLoading(false); // Reset loading state after request completes
    }
  };

  const handleOptionClick = (value) => {
    setGenerateType(value);
    setIsOpen(false); // Close dropdown after selecting an option
    setGeneratedValue(''); // Clear generated value when switching options
    setError(''); // Clear any previous error
  };

  const handleCopyValue = () => {
    if (generatedValue) {
      copy(generatedValue);
      alert('Generated value copied to clipboard!');
    }
  };

  const handleDownloadQrCode = () => {
    if (generatedValue) {
      const link = document.createElement('a');
      link.href = generatedValue;
      link.download = 'qr_code.png';
      link.click();
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        <h1>- Link Shortener & QR Code Generator -</h1>
        <form onSubmit={handleGenerate} className="input">
          <div className="link">
            <div className="dropdown-container">
              <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                {options.find(option => option.value === generateType)?.label}
                {options.find(option => option.value === generateType)?.icon}{' '}
              </div>
              {isOpen && (
                <div className="dropdown-options">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="dropdown-option"
                      onClick={() => handleOptionClick(option.value)}
                    >
                      <div className="space">
                        <span className="label">{option.label}</span>
                        <span className="icon">{option.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text">
            <input
              type="text"
              placeholder="https://example.com"
              className="input-text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>
          <div className="generate">
            <button type="submit" className="generate-btn">
              Generate
            </button>
          </div>
        </form>
        <div className="result">
          {isLoading && <div className="result-container"> <p >generating link <MdAutorenew /></p></div> }
          {error && <div className="result-container"> <p className="error-message">{error}</p></div>}
          {generatedValue && !error && (
            <div className="result-container">
              {generateType === 'Link' ? (
                <div>
                  <p> {generatedValue}</p>
                  <FaRegCopy onClick={handleCopyValue} />
                </div>
              ) : (
                <div>
                  <img src={generatedValue} alt="QR Code" />
                  <p onClick={handleDownloadQrCode}>Download <MdOutlineFileDownload /></p>

                </div>
              )}
            </div>
          )}
        </div>
        <div className="footer">
          <div className="footer-container">
            <Link to="/signUp" className="auth black" ><span>Sign up</span></Link>
            <Link to="/login" className="auth" ><span>Sign in</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};


