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
          关于我们
        </h2>

        <p className="text-gray-700 max-w-md leading-relaxed mb-6">
          LightCommit 是一个去中心化协议，将 GitHub 的提交、PR 与 Issue 等开源活动转化为链上可验证的 NFT 或 SBT。通过连接 Web2 协作与 Web3 激励，我们为开发者沉淀不可篡改的贡献凭证与可组合的链上声誉，并以费用回流金库形成自循环激励。
        </p>
        <ul className="text-gray-800 max-w-xl space-y-2 text-lg font-medium mb-12 list-disc list-inside">
          <li>实时铸造：贡献发生即上链，分钟级凭证生成</li>
          <li>智能抗女巫：多维度行为与质量验证识别真实贡献</li>
          <li>零知识隐私：可选择性披露能力而不暴露账号</li>
          <li>自循环经济：协议费用直接反哺贡献者与重要议题</li>
        </ul>

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

