-- 修复 users 表的 RLS 策略
-- 添加缺失的插入策略

-- 允许认证用户插入自己的数据
CREATE POLICY "Users can insert own data" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = id::text);

-- 验证策略是否正确创建
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
