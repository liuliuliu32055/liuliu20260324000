'use client'; // 保留这行
import { LoginForm } from '@/components/auth/login-form';
import { BookOpen, Zap, MessageSquare, Brain } from 'lucide-react';

export default function LoginPage() {



  const features = [
    {
      icon: Zap,
      title: 'AI 智能伴读',
      description: '选中文字即可获得通俗讲解、举例说明和重点总结'
    },
    {
      icon: MessageSquare,
      title: '实时问答',
      description: '针对文档内容进行深度问答，获得个性化解答'
    },
    {
      icon: Brain,
      title: '思维导图',
      description: '自动提取文档大纲，生成可视化知识结构'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：登录表单 */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI 伴读助手
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                基于 DeepSeek AI 的智能文档阅读平台，让阅读更高效、理解更深入
              </p>
            </div>

            <LoginForm />
          </div>

          {/* 右侧：功能介绍 */}
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                为什么选择 AI 伴读助手？
              </h2>
              <p className="text-lg opacity-90">
                结合最新的人工智能技术，为您提供前所未有的阅读体验
              </p>
            </div>

            <div className="space-y-6">
      {features.map((feature, index) => (
  <div
    key={index}
    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
      {features.map((feature, index) => (
  <div
    key={index}
    className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
  >
    <div className="flex items-start space-x-4">
      {/* ✅ 修复点：把对象当作组件渲染，添加 className */}
      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
       <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </div>
  </div>
))}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </div>
  </div>
))}
            </div>

            {/* 用户评价 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">张</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">张先生</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">产品经理</p>
                </div>
              </div>
              <blockquote className="text-gray-600 dark:text-gray-400 italic">
                "这个工具彻底改变了我的阅读方式。以前需要几个小时才能理解的复杂文档，现在只需要几分钟就能掌握核心内容。"
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}