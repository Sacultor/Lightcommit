export default function Hero() {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-8 relative">
          <div className="relative">
            {/* Decorative icon - positioned at top left of title */}
            <div className="absolute -top-12 -left-16">
              <svg width="109" height="66" viewBox="0 0 109 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M87 48.875L104 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M53.25 65L1 48.875" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M61.5 56L45 46" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M78.125 48.875V32" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M95.5 51.5L108 40.4375" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M69 51.5L50 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                Own Your Contribution
            </h1>
          </div>

          <p className="pt-12 text-3xl text-gray-900 leading-relaxed max-w-md">
              Build your developer portfolio <br />
              with verifiable, on-chain proof of <br />
              your work.
          </p>

          <a href="/api/auth/github" className="px-8 py-3 border-2 border-black rounded-[39px] backdrop-blur-[13.591px] bg-[rgba(220,220,220,0.3)] hover:bg-[rgba(220,220,220,0.4)] transition-all duration-200 font-normal text-black text-[18px] shadow-lg hover:shadow-xl">
            <span className="underline decoration-solid">Start with GitHub</span>
          </a>

          {/* Decorative mouse icon */}
          <svg width="215" height="240" viewBox="0 0 215 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_1008_3431)">
              <path fillRule="evenodd" clipRule="evenodd" d="M134.728 121.163C120.228 111.943 101.165 114.715 89.8916 127.683C77.9196 141.455 78.6513 162.145 91.5663 175.037L124.971 208.383C141.842 225.224 169.621 223.606 184.423 204.919C199.114 186.371 194.524 159.185 174.557 146.488L134.728 121.163Z" stroke="black" strokeWidth="2.8" strokeLinejoin="round"/>
              <path d="M143.55 127.25L97.7199 181.15" stroke="black" strokeWidth="2.1" strokeLinejoin="round"/>
              <path d="M88.7846 128.831L101.338 139.997" stroke="black" strokeWidth="2.1" strokeLinejoin="round"/>
              <rect width="10.5" height="24.5" rx="5.25" transform="matrix(-0.656059 0.75471 0.75471 0.656059 104.609 136.125)" fill="black"/>
              <path d="M88.7847 128.831C88.7847 128.831 48.2513 99.4903 76.4488 79.2118C98.5149 63.3427 30.1347 60.9362 19.8458 44.1562" stroke="black" strokeWidth="2.1"/>
              <path d="M5.448 5.18848C5.44794 1.13059 4.66317 -0.801576 4.23022 2.96973C3.46081 9.6734 9.69898 18.7231 24.5056 27.499C25.3079 27.9745 26.1069 28.4349 26.9001 28.8789C24.4994 29.794 22.441 30.9217 20.863 32.2383C16.9368 35.514 16.0944 39.8323 18.9402 44.6875L20.7517 43.625C18.4344 39.6713 19.0567 36.4797 22.2078 33.8506C23.9542 32.3935 26.4407 31.1663 29.4011 30.2344C42.066 36.8748 52.9433 39.0942 55.863 34.0273C57.7656 30.7256 55.4987 28.1969 50.7605 27.0049C46.7375 25.9929 40.9812 25.8934 35.4041 26.7305C33.3711 27.0356 31.4311 27.4517 29.6287 27.9717C28.2947 27.2616 26.9406 26.5016 25.5769 25.6934C11.8862 17.579 5.448 9.24664 5.448 5.18848ZM35.7156 28.8076C41.0361 28.0091 46.5188 28.104 50.2478 29.042C53.8417 29.9461 55.0285 31.269 54.0437 32.9785C52.1013 36.3495 43.1661 34.6566 32.4548 29.416C33.5041 29.1793 34.594 28.976 35.7156 28.8076Z" fill="black"/>
            </g>
            <defs>
              <filter id="filter0_d_1008_3431" x="0.167236" y="0.944336" width="198.281" height="228.498" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1008_3431"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1008_3431" result="shape"/>
              </filter>
            </defs>
          </svg>

          {/* Decorative dots - 3 columns */}
          <div className="absolute right-0 bottom-0 ">
            <div className="flex gap-4">
              {[...Array(3)].map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4" style={{ marginTop: `-${colIndex * 24}px` }}>
                  {[...Array(12)].map((_, rowIndex) => (
                    <div key={rowIndex} style={{ width: '6px', height: '6px', backgroundColor: 'black', borderRadius: '50%' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Card Display */}
        <div className="relative">
          {/* Main Card */}
          <div className="relative mx-auto max-w-md">
            <div className="relative h-[50vh] bg-[rgba(220,220,220,0.3)] backdrop-blur-[13.591px] border-2 border-black rounded-[60px] p-8 shadow-[0px_60px_40px_0px_rgba(0,0,0,0.1)] flex flex-col justify-between main-card">
              {/* GitHub Icon - Using exact SVG from Figma */}
              <div className="flex justify-center mb-6">
                <div className="w-[110px] h-[110px]">
                  <svg
                    preserveAspectRatio="none"
                    width="100%"
                    height="100%"
                    overflow="visible"
                    style={{ display: 'block' }}
                    viewBox="0 0 110 110"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M55 0C85.3875 0 110 25.235 110 56.3912C109.997 68.2065 106.38 79.7235 99.6589 89.3209C92.9374 98.9184 83.4498 106.113 72.5313 109.892C69.7813 110.456 68.75 108.694 68.75 107.214C68.75 105.31 68.8188 99.2484 68.8188 91.7061C68.8188 86.4195 67.1 83.036 65.1063 81.2738C77.3438 79.864 90.2 75.0707 90.2 53.4306C90.2 47.2276 88.0687 42.2229 84.5625 38.2755C85.1125 36.8657 87.0375 31.0856 84.0125 23.3318C84.0125 23.3318 79.4063 21.7811 68.8875 29.1119C64.4875 27.8431 59.8125 27.2087 55.1375 27.2087C50.4625 27.2087 45.7875 27.8431 41.3875 29.1119C30.8688 21.8516 26.2625 23.3318 26.2625 23.3318C23.2375 31.0856 25.1625 36.8657 25.7125 38.2755C22.2063 42.2229 20.075 47.2981 20.075 53.4306C20.075 75.0002 32.8625 79.864 45.1 81.2738C43.5188 82.6835 42.075 85.1507 41.5938 88.8161C38.4313 90.2963 30.525 92.693 25.575 84.1638C24.5438 82.4721 21.45 78.3132 17.1188 78.3837C12.5125 78.4542 15.2625 81.0623 17.1875 82.1196C19.525 83.4589 22.2063 88.4636 22.825 90.0849C23.925 93.2569 27.5 99.3189 41.3188 96.7108C41.3188 101.434 41.3875 105.874 41.3875 107.214C41.3875 108.694 40.3563 110.386 37.6063 109.892C26.6519 106.154 17.1238 98.9736 10.3736 89.3704C3.62345 79.7671 -0.00605329 68.2284 7.5784e-06 56.3912C7.5784e-06 25.235 24.6125 0 55 0Z"
                      fill="#24292F"
                    />
                  </svg>
                </div>
              </div>

              {/* Repo Name */}
              <div className="text-center mb-4">
                <p className="text-[21px] text-[#767676] tracking-[1px] leading-[30px]">
                    your-org/your-repo
                </p>
              </div>

              {/* Divider Line */}
              <div className="w-full h-[1px] bg-black mb-4"></div>

              {/* Commit Info */}
              <div className="text-center mb-4">
                <h3 className="text-[29.2px] text-black leading-normal">
                    Commit #a1b2c3d
                </h3>
              </div>

              {/* Stats */}
              <div className="text-center mb-6">
                <p className="text-[16.04px] text-black leading-[30px]">
                    +250 lines, -80 lines
                </p>
              </div>

              {/* Verification Button */}
              <div className="flex justify-center">
                <button className="px-12 py-3 bg-black border-2 border-black rounded-[39px] text-white text-[20px] leading-normal hover:bg-gray-800 transition-all duration-200">
                  Verifiable on-chain
                </button>
              </div>
            </div>

            {/* Decorative curved arrow */}
            <div className="absolute -right-40 top-0">
              <svg width="145" height="232" viewBox="0 0 145 232" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M143.258 1C116.385 46.2819 149.11 111.243 129.454 133.073C109.798 154.903 67.17 72.3829 84.3936 60.6694C101.617 48.9558 137.808 132.719 107.024 155.512C76.2397 178.305 19.97 108.496 39.0735 93.3147C58.1769 78.1336 108.334 143.444 80.7959 180.667C53.2581 217.89 2.88477 226.335 2.88477 226.335" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.3521 216.049C15.3521 216.049 7.89326 223.744 1.49377 226.843C9.76295 226.843 18.1905 230.225 18.1905 230.225" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <p className="pt-20 text-center text-2xl text-black font-normal tracking-[1.2px] leading-[30px]">
              No one knows you better than I do
          </p>
        </div>
      </div>
    </main>
  );
}
