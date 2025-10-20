-
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "githubId" VARCHAR NOT NULL UNIQUE,
    username VARCHAR NOT NULL,
    email VARCHAR,
    "avatarUrl" VARCHAR,
    "accessToken" VARCHAR,
    "walletAddress" VARCHAR,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 仓库表
CREATE TABLE IF NOT EXISTS repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "githubId" VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    "fullName" VARCHAR NOT NULL,
    description TEXT,
    url VARCHAR,
    "isPrivate" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 贡献类型枚举
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contribution_type') THEN
        CREATE TYPE contribution_type AS ENUM ('commit', 'pull_request', 'issue');
    END IF;
END $$;

-- 贡献状态枚举
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contribution_status') THEN
        CREATE TYPE contribution_status AS ENUM ('pending', 'minting', 'minted', 'failed');
    END IF;
END $$;

-- 贡献表
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "githubId" VARCHAR NOT NULL UNIQUE,
    type contribution_type NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "repositoryId" UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    contributor VARCHAR NOT NULL,
    title VARCHAR,
    description TEXT,
    url VARCHAR,
    status contribution_status DEFAULT 'pending',
    "transactionHash" VARCHAR,
    "tokenId" VARCHAR,
    "metadataUri" VARCHAR,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users("githubId");
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories("githubId");
CREATE INDEX IF NOT EXISTS idx_repositories_full_name ON repositories("fullName");
CREATE INDEX IF NOT EXISTS idx_contributions_github_id ON contributions("githubId");
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions("userId");
CREATE INDEX IF NOT EXISTS idx_contributions_repository_id ON contributions("repositoryId");
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions("createdAt");

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_repositories_updated_at ON repositories;
CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contributions_updated_at ON contributions;
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 第二部分：行级安全性（RLS）策略
-- ================================================================

-- 启用行级安全性
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view repositories" ON repositories;
DROP POLICY IF EXISTS "Service role can manage repositories" ON repositories;
DROP POLICY IF EXISTS "Authenticated users can view contributions" ON contributions;
DROP POLICY IF EXISTS "Users can update own contributions" ON contributions;
DROP POLICY IF EXISTS "Service role can manage contributions" ON contributions;

-- 用户表策略
-- 允许服务角色完全访问（用于 API 路由）
CREATE POLICY "Service role can manage users" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 允许用户查看自己的数据
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- 允许用户更新自己的数据
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- 仓库表策略
-- 允许服务角色完全访问
CREATE POLICY "Service role can manage repositories" ON repositories
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 所有认证用户可以查看仓库信息
CREATE POLICY "Authenticated users can view repositories" ON repositories
    FOR SELECT
    TO authenticated
    USING (true);

-- 贡献表策略
-- 允许服务角色完全访问
CREATE POLICY "Service role can manage contributions" ON contributions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 用户可以查看所有贡献
CREATE POLICY "Authenticated users can view contributions" ON contributions
    FOR SELECT
    TO authenticated
    USING (true);

-- 用户只能修改自己的贡献
CREATE POLICY "Users can update own contributions" ON contributions
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = "userId"::text)
    WITH CHECK (auth.uid()::text = "userId"::text);

-- ================================================================
-- 第三部分：RPC 辅助函数
-- ================================================================

-- 创建执行SQL查询的函数（用于支持原始SQL查询）
CREATE OR REPLACE FUNCTION execute_sql(
  query_text TEXT,
  params JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- 执行查询
  EXECUTE query_text INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL执行错误: %', SQLERRM;
END;
$$;

-- 授予权限
GRANT EXECUTE ON FUNCTION execute_sql(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT, JSONB) TO authenticated;

-- 创建健康检查函数
CREATE OR REPLACE FUNCTION health_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'healthy',
    'timestamp', NOW(),
    'database', current_database(),
    'version', version()
  );
END;
$$;

-- 授予权限
GRANT EXECUTE ON FUNCTION health_check() TO anon;
GRANT EXECUTE ON FUNCTION health_check() TO authenticated;

-- 创建数据库版本查询函数
CREATE OR REPLACE FUNCTION get_db_version()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT version();
$$;

GRANT EXECUTE ON FUNCTION get_db_version() TO anon;
GRANT EXECUTE ON FUNCTION get_db_version() TO authenticated;

-- 添加注释
COMMENT ON FUNCTION execute_sql IS '执行原始SQL查询的RPC函数（谨慎使用）';
COMMENT ON FUNCTION health_check IS '数据库健康检查函数';
COMMENT ON FUNCTION get_db_version IS '获取数据库版本信息';

-- ================================================================
-- 完成！
-- ================================================================

-- 验证迁移
SELECT 
    'Tables created' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'repositories', 'contributions');

SELECT 'Migration completed successfully!' as message;

