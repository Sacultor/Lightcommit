export function HeroSectionGVC() {
  return (
    <section
      className="scene-container relative min-h-[200vh] bg-cover bg-center bg-no-repeat overflow-hidden mx-4"
      style={{
        backgroundImage: 'url(/assets/backgrounds/background.png)',
      }}
    >
      <div className="cat-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '5%' }}
      >
        <img src="/assets/cat.png" alt="Cat" className="w-full h-auto character-glow" />
      </div>
      <div className="wolf-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '20%' }}
      >
        <img src="/assets/wolf.png" alt="Wolf" className="w-full h-auto character-glow" />
      </div>

      <div className="bear-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '36%'}}
      >
        <img src="/assets/bear.png" alt="Bear" className="w-full h-auto character-glow" />
      </div>

      <div className="dog-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '50%' }}
      >
        <img src="/assets/dog.png" alt="Dog" className="w-full h-auto character-glow" />
      </div>

      <div className="fox-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '60%' }}
      >
        <img src="/assets/fox.png" alt="Fox" className="w-full h-auto character-glow" />
      </div>

      <div className="bird-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '500px', left: '68%' }}
      >
        <img src="/assets/bird.png" alt="Bird" className="w-full h-auto character-glow" />
      </div>

      <div className="mouse-character absolute transition-all duration-300 hover:scale-110 hover:z-50"
        style={{ bottom: '100px', left: '80%' }}
      >
        <img src="/assets/mouse.png" alt="Mouse" className="w-full h-auto character-glow" />
      </div>
    </section>
  );
}

