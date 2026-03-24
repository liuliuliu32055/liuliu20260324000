import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { BookOpen, CheckCircle, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: '注册 - AI 伴读助手',
  description: '注册 AI 伴读助手账户，开启智能文档阅读新时代'
}

export default function RegisterPage() {
  const benefits = [
    {
      icon: Zap,
      title: '智能文档解析',
      description: '自动提取文档核心内容，生成结构化数据'
    },
    {
      icon: BookOpen,
      title: '个性化学习',
      description: '根据您的阅读习惯和需求，提供定制化学习路径'
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全防护，保障您的文档和隐私安全'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 顶部标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              加入 AI 伴读助手
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              开启智能文档阅读新时代，让复杂的资料变得简单易懂
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => {
              
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <div className="inline-flex p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* 左侧：注册表单 */}
            <div className="lg:order-2">
              <RegisterForm />
            </div>

            {/* 右侧：服务说明 */}
            <div className="lg:order-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  我们的服务承诺
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        高效文档处理
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        支持 PDF、Word、TXT 等多种格式，快速解析文档内容
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        智能学习助手
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        基于 DeepSeek AI 提供个性化的学习建议和解答
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        跨平台支持
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        在桌面、平板和手机上都能获得一致的优秀体验
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        数据安全保障
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        采用企业级安全措施，确保您的文档和数据安全
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    适合人群
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        学生学者
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        职场人士
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        研究人员
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        企业团队
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              已经有账户？{' '}
              <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                立即登录
              </a>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              注册即表示您同意我们的{' '}
              <a
                href="/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                服务条款
              </a>{' '}
              和{' '}
              <a
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}