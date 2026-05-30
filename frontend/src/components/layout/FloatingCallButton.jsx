import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PhoneCall } from 'lucide-react';

const FloatingCallButton = () => {
  const { settings } = useSettings();
  
  const rawPhone = settings.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, ''); // strip letters and symbols for tel link

  return (
    <a
      href={`tel:${cleanPhone}`}
      className="fixed bottom-6 left-6 z-40 md:hidden bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-primary-600/30 border border-primary-500/20"
      title="Call our Office"
      aria-label="Direct call dialer button"
    >
      <PhoneCall className="w-6 h-6" />
    </a>
  );
};

export default FloatingCallButton;
