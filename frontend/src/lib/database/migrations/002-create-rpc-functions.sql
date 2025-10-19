-- 创建执行SQL的RPC函数
-- 这个函数允许通过Supabase客户端执行原始SQL查询

-- 注意：此函数需要在Supabase控制台的SQL编辑器中手动执行
-- 路径：Supabase Dashboard -> SQL Editor -> New Query

-- 创建执行SQL查询的函数
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
  param_count INT;
  query_with_params TEXT;
BEGIN
  -- 获取参数数量
  param_count := jsonb_array_length(params);
  
  -- 如果有参数，需要特殊处理
  -- 注意：这是一个简化版本，实际使用中可能需要更复杂的参数处理
  IF param_count > 0 THEN
    -- 暂时不支持参数化查询，直接执行查询
    EXECUTE query_text INTO result;
  ELSE
    -- 无参数查询
    EXECUTE query_text INTO result;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL执行错误: %', SQLERRM;
END;
$$;

-- 为匿名用户授予执行权限（谨慎使用，生产环境需要更严格的权限控制）
GRANT EXECUTE ON FUNCTION execute_sql(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT, JSONB) TO authenticated;

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

GRANT EXECUTE ON FUNCTION health_check() TO anon;
GRANT EXECUTE ON FUNCTION health_check() TO authenticated;

-- 注释说明
COMMENT ON FUNCTION execute_sql IS '执行原始SQL查询的RPC函数，需要谨慎使用';
COMMENT ON FUNCTION get_db_version IS '获取数据库版本信息';
COMMENT ON FUNCTION health_check IS '数据库健康检查函数';



