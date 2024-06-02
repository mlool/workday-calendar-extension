import React from 'react';
import './DiscordButton.css';
import DiscordIcon from '../Icons/DiscordIcon';
interface DiscordButtonProps {}

const DiscordButton: React.FC<DiscordButtonProps> = () => {
  return (
    <div id="discord-button">
      <a href="https://discord.gg/sjRX9BCCZ5" target="_blank" rel="noreferrer">
        <div className="icon">
          <DiscordIcon />
        </div>
        <span>Join the Discord</span>
      </a>
    </div>
  );
};

export default DiscordButton;
