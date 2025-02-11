import React from 'react';
import { useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Create a style tag for custom animations
const AnimationStyles = () => (
  <style>{`
    @keyframes enter {
      0% { transform: translateX(100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes leave {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }

    .animate-enter {
      animation: enter 0.3s ease-out;
    }

    .animate-leave {
      animation: leave 0.2s ease-in forwards;
    }
  `}</style>
);

const socket = io(import.meta.env.VITE_API_URL || 'https://amebo-server.onrender.com', {
  withCredentials: true
});

export const NotificationProvider = ({ children }) => {
  const audioRef = useRef(new Audio('/notification.wav'));
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('newPost', (data) => {
      console.log('Received new post notification:', data);
      const { notification, post } = data;
      
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Audio play failed:', error);
          });
        }
      } catch (error) {
        console.log('Audio play failed:', error);
      }
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 transition-all duration-300 ease-in-out transform ${
            t.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Bell className="h-10 w-10 text-blue-500 p-2 bg-blue-50 rounded-full" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 leading-5">
                  {notification.message}
                </p>
                <div className="mt-2 flex space-x-3">
                  <button 
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full transition-colors duration-200"
                    onClick={() => {
                      navigate(`/post/${post._id}`);
                      toast.dismiss(t.id);
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full m-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-right',
      });
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newPost');
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <>
      <AnimationStyles />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />
      <audio id="notificationSound" src="/notification.wav" preload="auto" />
    </>
  );
};