-- =============================================
-- 适配 Supabase Auth 的迁移脚本
-- =============================================
-- 
-- 此脚本将 users 表与 Supabase Auth 系统集成
-- Supabase Auth 会自动管理 auth.users 表
-- 我们的 public.users 表需要引用 auth.users
--

-- 1. 修改 users 表结构以使用 Supabase Auth 的 UUID
-- 注意：如果表中已有数据，需要先备份

-- 删除旧的 users 表（如果需要保留数据，请先备份）
-- DROP TABLE IF EXISTS users CASCADE;

-- 创建新的 users 表，id 引用 auth.users
CREATE TABLE IF NOT EXISTS users_new (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  githubId TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatarUrl TEXT,
  accessToken TEXT,
  walletAddress TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建触发器自动更新 updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users_new;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users_new(githubId);
CREATE INDEX IF NOT EXISTS idx_users_username ON users_new(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users_new(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users_new(walletAddress);

-- 4. 更新 RLS 策略
-- 启用行级安全
ALTER TABLE users_new ENABLE ROW LEVEL SECURITY;

-- 允许认证用户查看所有用户数据（用于展示用户列表等）
CREATE POLICY "Authenticated users can view all users" ON users_new
  FOR SELECT
  TO authenticated
  USING (true);

-- 允许用户插入自己的数据（注册时）
CREATE POLICY "Users can insert own data" ON users_new
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的数据
CREATE POLICY "Users can update own data" ON users_new
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 允许服务角色完全访问
CREATE POLICY "Service role can manage users" ON users_new
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. 创建函数：在 auth.users 创建时自动在 public.users 创建记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_new (id, githubId, username, email, avatarUrl)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatarUrl = EXCLUDED.avatarUrl,
    updatedAt = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. 如果需要迁移旧数据，使用以下语句
-- INSERT INTO users_new (id, githubId, username, email, avatarUrl, accessToken, walletAddress, createdAt, updatedAt)
-- SELECT id::uuid, githubId, username, email, avatarUrl, accessToken, walletAddress, createdAt, updatedAt
-- FROM users
-- WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
-- ON CONFLICT (id) DO NOTHING;

-- 7. 重命名表（在确认数据迁移成功后执行）
-- DROP TABLE IF EXISTS users;
-- ALTER TABLE users_new RENAME TO users;

-- 8. 更新 repositories 表的外键
-- ALTER TABLE repositories DROP CONSTRAINT IF EXISTS repositories_userId_fkey;
-- ALTER TABLE repositories ADD CONSTRAINT repositories_userId_fkey
--   FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

-- 9. 更新 contributions 表的外键
-- ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_userId_fkey;
-- ALTER TABLE contributions ADD CONSTRAINT contributions_userId_fkey
--   FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE;

COMMENT ON TABLE users_new IS '用户表 - 与 Supabase Auth 集成';
COMMENT ON COLUMN users_new.id IS '用户 ID - 引用 auth.users.id';
COMMENT ON COLUMN users_new.githubId IS 'GitHub 用户 ID';
COMMENT ON COLUMN users_new.username IS 'GitHub 用户名';
COMMENT ON COLUMN users_new.email IS '用户邮箱';
COMMENT ON COLUMN users_new.avatarUrl IS 'GitHub 头像 URL';
COMMENT ON COLUMN users_new.walletAddress IS '用户钱包地址';


