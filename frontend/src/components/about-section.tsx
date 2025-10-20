'use client';

export function AboutSection() {
  return (
    <section className="py-32 bg-[#F5F1E8]" id="about">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* 绳结边框容器 */}
        <div className="p-12 relative" style={{
          backgroundColor: '#F5F1E8',
        }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: '8px solid black',
              borderImage: 'url(/assets/border.png) 100 repeat',
            }}
          />
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">
          ABOUT&nbsp;US
          </h2>

          <p className="text-gray-700 max-w-md leading-relaxed mb-12">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
          </p>

          {/* Avatar Row */}
          <div className="grid grid-cols-4 gap-0 mb-12" style={{ height: '400px' }}>
            {[
              { id: 1, src: '/assets/images/avatar-1.jpg', alt: '红帽猿猴' },
              { id: 2, src: '/assets/images/avatar-2.jpg', alt: '灰帽猿猴' },
              { id: 3, src: '/assets/images/avatar-3.jpg', alt: '眼镜猿猴' },
              { id: 4, src: '/assets/images/avatar-4.jpg', alt: '兔子' },
            ].map((avatar) => (
              <div key={avatar.id} className="h-full border border-black overflow-hidden">
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="h-[3px] bg-black mt-12" />
        </div>
      </div>
    </section>
  );
}

