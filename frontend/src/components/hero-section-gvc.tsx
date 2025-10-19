export function HeroSectionGVC() {
  return (
    <section 
      className="scene-container relative min-h-[200vh] bg-cover bg-center bg-no-repeat overflow-hidden mx-4"
      style={{
        backgroundImage: 'url(/assets/backgrounds/background.png)',
      }}
    >
      <div className="cat-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '80px' }}
      >
        <img src="/assets/cat.png" alt="Cat" className="w-full h-auto" />
      </div>
      <div className="wolf-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '220px' }}
      >
        <img src="/assets/wolf.png" alt="Wolf" className="w-full h-auto" />
      </div>

      <div className="bear-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '400px'}}
      >
        <img src="/assets/bear.png" alt="Bear" className="w-full h-auto" />
      </div>

      <div className="dog-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '550px' }}
      >
        <img src="/assets/dog.png" alt="Dog" className="w-full h-auto" />
      </div>

      <div className="fox-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '680px' }}
      >
        <img src="/assets/fox.png" alt="Fox" className="w-full h-auto" />
      </div>

      <div className="bird-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '800px' }}
      >
        <img src="/assets/bird.png" alt="Bird" className="w-full h-auto" />
      </div>

      <div className="mouse-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
        style={{ bottom: '100px', left: '850px' }}
      >
        <img src="/assets/mouse.png" alt="Mouse" className="w-full h-auto" />
      </div>
    </section>
  );
}

