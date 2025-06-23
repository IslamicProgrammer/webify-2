'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5
    }));

    setParticles(initialParticles);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          // Calculate attraction to mouse
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const attraction = Math.min(distance / 50, 1);

          let newX = particle.x + particle.speedX + dx * 0.001 * attraction;
          let newY = particle.y + particle.speedY + dy * 0.001 * attraction;

          // Wrap around edges
          if (newX < 0) newX = 100;
          if (newX > 100) newX = 0;
          if (newY < 0) newY = 100;
          if (newY > 100) newY = 0;

          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className="-z-5 pointer-events-none fixed inset-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
}
