export function HeroSectionGVC() {
  return (
    <section 
      className="scene-container relative w-full min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/backgrounds/background.png)',
      }}
    >
      <div className="cat-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '620px', left: '80px', width: '17%' }}>
        <img src="/assets/cat.png" alt="Cat" className="w-full h-auto" />
      </div>

      <div className="wolf-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '550px', left: '220px', width: '18%' }}>
        <img src="/assets/wolf.png" alt="Wolf" className="w-full h-auto" />
      </div>

      <div className="bear-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '560px', left: '400px', width: '16%' }}>
        <img src="/assets/bear.png" alt="Bear" className="w-full h-auto" />
      </div>

      <div className="dog-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '580px', left: '550px', width: '12%' }}>
        <img src="/assets/dog.png" alt="Dog" className="w-full h-auto" />
      </div>

      <div className="fox-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '530px', left: '680px', width: '15%' }}>
        <img src="/assets/fox.png" alt="Fox" className="w-full h-auto" />
      </div>

      <div className="bird-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '450px', left: '800px', width: '13%' }}>
        <img src="/assets/bird.png" alt="Bird" className="w-full h-auto" />
      </div>

      <div className="mouse-character absolute transition-all duration-300 hover:scale-110 hover:z-50" 
           style={{ top: '600px', left: '850px', width: '15%' }}>
        <img src="/assets/mouse.png" alt="Mouse" className="w-full h-auto" />
      </div>
    </section>
  );
}

