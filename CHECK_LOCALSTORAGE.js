// 在浏览器控制台粘贴并执行这段代码

console.log('🔍 检查 localStorage...');
console.log('');

// 1. 显示所有 keys
const allKeys = Object.keys(localStorage);
console.log('📦 所有 localStorage keys:');
console.table(allKeys);
console.log('');

// 2. 查找 Supabase 相关的
const supabaseKeys = allKeys.filter(k => 
  k.toLowerCase().includes('supabase') || 
  k.toLowerCase().includes('auth') ||
  k.toLowerCase().includes('pkce') ||
  k.toLowerCase().includes('verifier')
);

console.log('🔑 Supabase 认证相关的 keys:');
if (supabaseKeys.length === 0) {
  console.error('❌ 没有找到任何 Supabase 认证相关的数据！');
  console.log('');
  console.log('这就是为什么 PKCE 流程失败了：');
  console.log('- 登录时应该存储 code_verifier');
  console.log('- 但 localStorage 是空的');
  console.log('- 所以回调时无法验证授权码');
  console.log('');
  console.log('💡 解决方案：');
  console.log('1. 配置 Supabase 回调到后端（推荐）');
  console.log('   Redirect URL: http://localhost:3000/api/auth/github/callback');
  console.log('');
  console.log('2. 或者检查为什么 localStorage 被清空了');
} else {
  console.table(supabaseKeys);
  console.log('');
  
  // 显示详细内容
  console.log('📄 详细内容:');
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`\n${key}:`);
    try {
      const parsed = JSON.parse(value);
      console.log(parsed);
    } catch {
      console.log(value);
    }
  });
}

console.log('');
console.log('✅ 检查完成！');

