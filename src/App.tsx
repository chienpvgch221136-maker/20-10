import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import './App.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  drift: number;
}

interface Flower {
  id: number;
  bloom: number;
}

function App() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([
    { id: 1, bloom: 0 },
    { id: 2, bloom: 0 },
    { id: 3, bloom: 0 },
    { id: 4, bloom: 0 },
    { id: 5, bloom: 0 },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkleIdRef = useRef(0);
  const petalIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPetals((prev) => {
        const newPetals = prev
          .map((petal) => ({
            ...petal,
            y: petal.y + petal.speed,
            x: petal.x + Math.sin(petal.y / 30) * petal.drift,
            rotation: petal.rotation + 2,
          }))
          .filter((petal) => petal.y < window.innerHeight);

        if (isRevealed && Math.random() > 0.7) {
          newPetals.push({
            id: petalIdRef.current++,
            x: Math.random() * window.innerWidth,
            y: -20,
            rotation: Math.random() * 360,
            speed: 1 + Math.random() * 2,
            drift: Math.random() * 0.5,
          });
        }

        return newPetals;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRevealed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        const opacity = particle.life / 100;
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [particles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 2,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRevealed) {
      setCursorPosition({ x: e.clientX, y: e.clientY });

      if (Math.random() > 0.8) {
        const newSparkle = {
          id: sparkleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
        };
        setSparkles((prev) => [...prev, newSparkle]);

        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
        }, 800);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isRevealed) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 3;
        newParticles.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 100,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setIsRevealed(true);
      }, 300);
    }
  };

  const handleFlowerHover = (id: number) => {
    setFlowers((prev) =>
      prev.map((flower) =>
        flower.id === id ? { ...flower, bloom: 100 } : flower
      )
    );
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-cream to-lavender">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      />

      {!isRevealed && (
        <div
          className="fixed inset-0 bg-slate-800 bg-opacity-80 flex items-center justify-center z-40 cursor-none transition-opacity duration-1000"
          style={{ opacity: isRevealed ? 0 : 1 }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          <div className="custom-cursor" style={{ left: cursorPosition.x, top: cursorPosition.y }} />

          {sparkles.map((sparkle) => (
            <Sparkles
              key={sparkle.id}
              className="sparkle-trail"
              style={{ left: sparkle.x, top: sparkle.y }}
              size={16}
              color="#FFD700"
            />
          ))}

          <h2 className="text-4xl md:text-5xl text-pink-100 font-elegant text-center px-8 animate-pulse">
            Điều diệu kỳ nào đang chờ bạn khám phá?
          </h2>
        </div>
      )}

      <div
        className={`transition-all duration-1000 ${
          isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="petal"
            style={{
              left: petal.x,
              top: petal.y,
              transform: `rotate(${petal.rotation}deg)`,
            }}
          />
        ))}

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="title-main text-5xl md:text-7xl font-bold text-brown-dark mb-6 md:mb-8 hover:text-gold transition-all duration-300 hover-underline">
              Mừng ngày Phụ nữ Việt Nam 20-10
            </h1>

            <div className="max-w-3xl mx-auto">
              <p className="message-text text-xl md:text-2xl text-gray-700 leading-relaxed hover:text-gold transition-colors duration-300 px-4">
                Gửi đến những người bà, người mẹ, người chị, người em và những người phụ nữ tuyệt vời.
                Cảm ơn vì đã khiến thế giới này trở nên rực rỡ như những đóa hoa.
                Chúc bạn một ngày 20/10 luôn xinh đẹp, hạnh phúc và đong đầy yêu thương!
              </p>
            </div>
          </div>

          <div className="flower-garden">
            {flowers.map((flower) => (
              <div
                key={flower.id}
                className="flower-container"
                onMouseEnter={() => handleFlowerHover(flower.id)}
              >
                <div
                  className="flower"
                  style={{
                    transform: `scale(${0.3 + flower.bloom / 150})`,
                  }}
                >
                  <div className="flower-petals">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="flower-petal"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-20px)`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flower-center" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
