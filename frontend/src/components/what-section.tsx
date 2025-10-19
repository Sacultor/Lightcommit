export function WhatSection() {
  return (
    <section className="py-32 bg-[#F5F1E8]">
      <div className="container mx-auto px-6 max-w-4xl">
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
          <h2 className="text-5xl md:text-6xl font-black text-black mb-8">
            WHAT&apos;S&nbsp;LIGHTCOMMIT?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-12">
            LightCommit is a protocol for creating verifiable on-chain proof of digital work,
            focusing on software development. It allows developers to mint NFTs from commits,
            pull requests, or milestones, secured by cryptographic links to repositories like
            GitHub. This builds a public, immutable record of transparency and reputation.
          </p>

          <div className="h-[3px] bg-black mb-12" />

          <h3 className="text-3xl md:text-4xl font-black text-black mb-8">HOW IT WORKS</h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="mx-auto w-full max-w-md">
              <img
                src="/assets/images/how-it-works.png"
                alt="How it works diagram"
                className="w-full h-auto object-contain mix-blend-multiply opacity-90"
                style={{ filter: 'grayscale(100%) contrast(120%)' }}
              />
            </div>
            <ol className="list-decimal ml-6 space-y-4 text-lg font-medium text-gray-800">
              <li>Connect repo</li>
              <li>Mint proof-of-work NFT</li>
              <li>Build on-chain reputation</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
