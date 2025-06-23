'use client';

import { useEffect, useState } from 'react';

export function AnimatedGradientBg() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to 0-100 range
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-300 ease-out"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(147, 51, 234, 0.1) 25%, 
            rgba(236, 72, 153, 0.08) 50%, 
            rgba(34, 197, 94, 0.05) 75%, 
            transparent 100%
          ),
          linear-gradient(135deg, 
            rgba(59, 130, 246, 0.05) 0%, 
            rgba(147, 51, 234, 0.03) 25%, 
            rgba(236, 72, 153, 0.02) 50%, 
            rgba(34, 197, 94, 0.03) 75%, 
            rgba(59, 130, 246, 0.02) 100%
          )
        `
      }}
    >
      {/* Floating orbs for additional visual interest */}
      <div
        className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out"
        style={{
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          left: `${20 + mousePosition.x * 0.1}%`,
          top: `${10 + mousePosition.y * 0.1}%`,
          transform: `translate(-50%, -50%) scale(${0.8 + mousePosition.x * 0.002})`
        }}
      />
      <div
        className="duration-1200 absolute h-80 w-80 rounded-full opacity-15 blur-3xl transition-all ease-out"
        style={{
          background: 'linear-gradient(135deg, #ec4899, #22c55e)',
          right: `${15 + mousePosition.y * 0.08}%`,
          top: `${60 + mousePosition.x * 0.05}%`,
          transform: `translate(50%, -50%) scale(${0.9 + mousePosition.y * 0.001})`
        }}
      />
      <div
        className="duration-1500 absolute h-72 w-72 rounded-full opacity-10 blur-3xl transition-all ease-out"
        style={{
          background: 'linear-gradient(225deg, #8b5cf6, #3b82f6)',
          left: `${60 + mousePosition.y * 0.06}%`,
          bottom: `${20 + mousePosition.x * 0.04}%`,
          transform: `translate(-50%, 50%) scale(${0.7 + mousePosition.x * 0.003})`
        }}
      />
    </div>
  );
}
