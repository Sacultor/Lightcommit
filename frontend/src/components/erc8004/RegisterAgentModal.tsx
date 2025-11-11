'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/use-agent-registry';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterAgentModal({ isOpen, onClose, onSuccess }: RegisterAgentModalProps) {
  const { user } = useAuth();
  const { registerAgent } = useAgentRegistry();
  const [registering, setRegistering] = useState(false);

  // 从 user_metadata 获取 GitHub 用户名
  const githubUsername = (user as any)?.user_metadata?.user_name || 
    (user as any)?.user_metadata?.preferred_username || 
    (user as any)?.user_metadata?.login || 
    'unknown';

  const handleRegister = async () => {
    setRegistering(true);

    try {
      toast.loading('正在注册代理...', { id: 'register' });

      await registerAgent(githubUsername);

      toast.dismiss('register');
      toast.success('代理注册成功！');

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('注册失败:', error);
      toast.dismiss('register');

      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error('交易已取消');
      } else {
        toast.error(error.message || '注册失败，请重试');
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#F5F1E8] border-[4px] border-black rounded-3xl p-8 max-w-md w-full"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-black" />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center mb-4"
                style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.8)' }}>
                <User className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-black text-black mb-2">
                注册代理身份
              </h2>
              <p className="text-gray-600 text-sm">
                首次使用 ERC-8004 需要注册你的代理身份
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">GitHub 用户名</span>
                  <span className="text-xs text-green-600 font-bold">✓ 已验证</span>
                </div>
                <div className="font-mono font-bold text-black">
                  {githubUsername}
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="text-xs text-blue-800 space-y-1">
                  <p className="font-bold mb-2">📋 Agent Card 包含：</p>
                  <p>• 用户名: {githubUsername}</p>
                  <p>• 能力: 代码审查、Commit 评分</p>
                  <p>• 版本: 1.0.0</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-xs text-yellow-800">
                  💡 <span className="font-bold">提示</span>: 注册是一次性操作，需要支付少量 Gas 费用
                </p>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={registering}
              className={`w-full py-4 rounded-2xl font-bold text-lg border-[3px] border-black transition-all ${
                registering
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              {registering ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  注册中...
                </span>
              ) : (
                '立即注册'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              注册后你的 GitHub 账户将与钱包地址绑定
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
