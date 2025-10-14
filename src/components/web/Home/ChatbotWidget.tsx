'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Image from 'next/image';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[999] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <Image
            src="/assets/images/logo/bisholaLogo2.jpg"
            alt="Bishola Logo"
            width={50}
            height={50}
            className="relative rounded-full mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
            priority
          />
        </button>
      )}

      {/* Chat Window - Increased height */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[999] w-80 h-[500px] shadow-lg rounded-lg overflow-hidden bg-white">
          {/* Header with close button */}
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full"></div>
              <span className="font-medium">Bishola Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-700 p-1 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Iframe */}
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/g3yoN7TtHvu0hpPOEaaIc"
            width="100%"
            style={{ height: "calc(100% - 52px)" }}
            frameBorder="0"
            title="Bishola Customer Support Chat"
          />
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;