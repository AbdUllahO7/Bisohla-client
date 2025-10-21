'use client';
import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const ContactUs: React.FC = () => {
  const t = useTranslations('contactPage');
  
  const contactInfo = {
    email: 'bishola4h@gmail.com',
    phones: ['+905389370863', '+905318673917']
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C3C39 0%, #198341 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 animate-pulse" 
             style={{ backgroundColor: '#ABDE3B' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 animate-pulse" 
             style={{ backgroundColor: '#ABDE3B', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 animate-pulse" 
             style={{ backgroundColor: '#ABDE3B', animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-6xl">
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Header & Info */}
              <div className="relative p-8 sm:p-12 text-white overflow-hidden" 
                   style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" 
                     style={{ backgroundColor: '#ABDE3B', transform: 'translate(30%, -30%)' }}></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" 
                     style={{ backgroundColor: '#ABDE3B', transform: 'translate(-30%, 30%)' }}></div>
                
                <div className="relative z-10">
                  {/* Logo */}
                  <div className="mb-8 animate-fadeIn">
                    <div className="inline-block p-3 rounded-2xl backdrop-blur-sm" 
                         style={{ backgroundColor: 'rgba(171, 222, 59, 0.2)' }}>
                      <Image
                        src="/assets/images/logo/bisholaLogo2.jpg"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="h-16 w-auto sm:h-20 rounded-xl shadow-lg"
                        priority
                        onError={(e) => {
                          console.error('Failed to load logo image');
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fadeIn" 
                      style={{ animationDelay: '0.1s' }}>
                    {t('title')}
                  </h1>
                  <p className="text-lg text-white/90 mb-8 animate-fadeIn" 
                     style={{ animationDelay: '0.2s' }}>
                    {t('subtitle')}
                  </p>

                  {/* Availability Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fadeIn"
                       style={{ backgroundColor: 'rgba(171, 222, 59, 0.2)', animationDelay: '0.3s' }}>
                    <Clock className="w-4 h-4" style={{ color: '#ABDE3B' }} />
                    <span className="text-sm font-medium">{t('availability')}</span>
                  </div>

                  {/* Decorative Line */}
                  <div className="h-1 w-20 rounded-full mb-8" 
                       style={{ backgroundColor: '#ABDE3B' }}></div>

                  {/* Additional Info */}
                  <div className="space-y-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-5 h-5" style={{ color: '#ABDE3B' }} />
                      <span>Available Worldwide</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Details */}
              <div className="p-8 sm:p-12 bg-gradient-to-br from-gray-50 to-white">
               

                <div className="space-y-6">
                  {/* Email Card */}
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(20px)' }}></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-opacity-50"
                         style={{ borderColor: '#ABDE3B' }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 rounded-xl" 
                             style={{ backgroundColor: '#ABDE3B' }}>
                          <Mail className="w-6 h-6" style={{ color: '#2C3C39' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" 
                              style={{ color: '#198341' }}>
                            {t('email.label')}
                          </h3>
                          <a 
                            href={`mailto:${contactInfo.email}`}
                            className="text-lg font-medium hover:underline transition-colors block"
                            style={{ color: '#2C3C39' }}
                          >
                            {contactInfo.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="group relative">
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(20px)' }}></div>
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-opacity-50"
                         style={{ borderColor: '#ABDE3B' }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 rounded-xl" 
                             style={{ backgroundColor: '#ABDE3B' }}>
                          <Phone className="w-6 h-6" style={{ color: '#2C3C39' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" 
                              style={{ color: '#198341' }}>
                            {t('phone.label')}
                          </h3>
                          <div className="space-y-2">
                            {contactInfo.phones.map((phone, index) => (
                              <a
                                key={index}
                                href={`tel:${phone}`}
                                className="block text-lg font-medium hover:underline transition-colors"
                                style={{ color: '#2C3C39' }}
                              >
                                {phone}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    className="w-full mt-8 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 group"
                    style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}
                  >
                    <span>{t('cta')}</span>
                    <Send className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
        }

        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactUs;