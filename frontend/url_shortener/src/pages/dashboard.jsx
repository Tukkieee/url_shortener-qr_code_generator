import React, { useState, useEffect } from "react";
import axios from 'axios';
import copy from 'clipboard-copy';
import { FiLink2 } from "react-icons/fi";
import { BsQrCodeScan } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { FaRegCopy } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { MdOutlineFileDownload, MdAutorenew, MdOutlinePerson2 } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const [generateType, setGenerateType] = useState('Link');
    const [generatedValue, setGeneratedValue] = useState('');
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [originalUrl, setOriginalUrl] = useState('');
    const [email, setEmail] = useState('');
    const [urlsData, setUrlsData] = useState([]);
    const [generatedURL, setGeneratedURL] = useState('')
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const options = [
        { value: 'Link', label: 'Link', icon: <FiLink2 /> },
        { value: 'Code', label: 'Code', icon: <BsQrCodeScan /> },
    ];

    useEffect(() => {
        const fetchUserDetails = async () => {
            const accessToken = localStorage.getItem('access');
            try {
                const response = await axios.get('http://localhost:8000/dj-rest-auth/user/', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setEmail(response.data.email);
            } catch (error) {
                console.error('Error fetching user details:', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserDetails();
    }, [navigate]);

    useEffect(() => {
        const fetchShortenedURLs = async () => {
            const accessToken = localStorage.getItem('access');
            try {
                const response = await axios.get('http://localhost:8000/url/shortened-urls/', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setUrlsData(response.data);
                // console.log(response.data);
            } catch (error) {
                console.error('Error fetching shortened URLs:', error);
            }
        };
        fetchShortenedURLs();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = generateType === 'Link' ? 'shorten/' : 'generate-code/';
            // console.log(endpoint)
            const response = await axios.post(
                `http://localhost:8000/url/${endpoint}`,
                { original_url: originalUrl },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
            );
            const generatedValue = response.data.short_url || response.data.qr_code;
            setGeneratedValue(generatedValue);
            setError('');
            if (response.data.qr_code) {
                setGeneratedURL(response.data.qr_code);
                console.log(generatedURL)

            } else {
                setGeneratedURL(''); // Reset generatedURL if no QR code URL is returned
            }
        } catch (error) {
            console.error('Error generating:', error);
            const errorMessage = error.response?.data.error || 'An error occurred while processing the request';
            setError(errorMessage);
            setGeneratedValue('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionClick = (value) => {
        setGenerateType(value);
        setIsOpen(false);
        setGeneratedValue('');
        setError('');
    };

    const handleCopyValue = (value) => {
        copy(value);
        alert('Copied to clipboard!');
    };

    const handleDownloadImage = (imageUrl, fileName) => {
        axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'blob', // Important: responseType must be 'blob' to handle binary data
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const handleLogout = async () => {
        try {
          const response = await axios.post(
            "http://localhost:8000/dj-rest-auth/logout/"
          );
          localStorage.removeItem('access')
        //   console.log( response.data);
          navigate('/login');
          // Perform any additional actions after logout (e.g., redirect)
        } catch (error) {
        //   console.error("Logout failed:", error);
          // Handle logout error
        }
      };

    return (
        <div className="home history">
            <div className="home-container dashboard-container">
                {email && (
                    <div className="user" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={handleLogout}>
                        <div className="user-container auth">
                            {isHovered?'': <MdOutlinePerson2 style={{ marginRight: '1rem' }} /> }
                            {isHovered ? <span>Logout <MdOutlineLogout  style={{ marginLeft: '1rem' }}/></span> : email}
                        </div>
                    </div>
                )}
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
                    {isLoading && (
                        <div className="result-container">
                            <p>Generating link <MdAutorenew /></p>
                        </div>
                    )}
                    {error && (
                        <div className="result-container">
                            <p className="error-message">{error}</p>
                        </div>
                    )}
                    {generatedValue && !error && (
                        <div className="result-container" style={{height:"auto"}}>
                            {generateType === 'Link' ? (
                                <div>
                                    <p> {generatedValue}</p>
                                    <FaRegCopy onClick={() => handleCopyValue(generatedValue)} />
                                </div>
                            ) : (
                                <div className="qr-container">
                                    <img className="qr-image" src={`http://localhost:8000${generatedURL}`} alt="QR Code" />
                                    <p onClick={() => handleDownloadImage(
                                    `http://localhost:8000${generatedURL}`,
                                    'qr_code.png'
                                )}>Download <MdOutlineFileDownload /></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <h1>-History-</h1>
                {Array.isArray(urlsData) && urlsData.map((urlData) => (
                    <div key={urlData.id} >
                        {urlData.short_url && (
                            <div className="input input-small">
                                <div className=" url">{urlData.original_url}</div>
                                <div className=" url url1">{urlData.short_url}</div>
                                <div className=" download">
                                    <FaRegCopy onClick={() => handleCopyValue(urlData.short_url)} />
                                </div>
                                {/* <div className=" download edit">
                                    <BiEdit/>
                                </div> */}
                            </div>
                        )}
                        {urlData.qr_code && (
                            <div className="input input-small">
                                <div className=" url">{urlData.original_url}</div>
                                <div className=" url url1"> <img className="download-img" src={`http://localhost:8000${urlData.qr_code}`} alt="qr_code" /></div>
                                <div className=" download">
                                    <MdOutlineFileDownload onClick={() => handleDownloadImage(
                                    `http://localhost:8000${urlData.qr_code}`,
                                    'shortened_image.png'
                                )} />
                                </div>
                                {/* <div className="download edit">
                                    <BiEdit/>
                                </div> */}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


