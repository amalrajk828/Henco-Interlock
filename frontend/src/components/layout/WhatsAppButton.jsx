import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  
  const whatsappNum = settings.whatsappNumber || '919876543210';
  const message = encodeURIComponent('Hello Henco Interlock, I am interested in your products. I would like to get a quote.');
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 animate-pulse-glow"
      title="Chat with us on WhatsApp"
      aria-label="WhatsApp chat button"
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
