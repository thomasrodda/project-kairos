import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const MainMenu = () => {

    // Grainy Texture
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Generate grain
        for (let i = 0; i < 80000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 0.5;
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Set canvas as background
        const grainyGradientElement = document.querySelector('.grainyGradient');
        const existingBackground = getComputedStyle(grainyGradientElement).backgroundImage;
        grainyGradientElement.style.backgroundImage = `url(${canvas.toDataURL()}), ${existingBackground}`;
      }, []);
  
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login'); // Navigate to Login Screen
  };

  return (
    <div className="mainMenu menuBackground" onClick={goToLogin}>
      <div className="mainMenuContentArea boxShadowBlackL grainyGradient">
        <div className="mainMenuContent">
            <h1 className="mainMenuHeading">Slate-Ai</h1>
            <h2 className="mainMenuSubheading">Start writing...</h2>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
