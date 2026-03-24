'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Briefcase, Sparkles, Target, Clock, BookOpen, CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export type ModeType = 'student' | 'professional'

interface ModeConfig {
  type: ModeType
  title: string
  description: string
  icon: any
  features: string[]
  color: string
  bgGradient: string
}

const modeConfigs: Record<ModeType, ModeConfig> = {
  student: {
    type: 'student',
    title: '学生模式',
    description: '专注学习备考，深入理解知识点',
    icon: GraduationCap,
    features: [
      '逐段精读，深度解析概念',
      '智能笔记，自动整理重点',
      '举例说明，易于理解',
      '知识图谱，建立体系',
      '错题本管理，高效复习',
      '模拟考试，查漏补缺'
    ],
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  professional: {
    type: 'professional',
    title: '职场模式',
    description: '快速提取信息，提升工作效率',
    icon: Briefcase,
    features: [
      '快速浏览，核心要点提炼',
      '行业分析，洞察趋势',
      '数据对比，决策支持',
      '思维导图，结构化输出',
      '行动建议，落地执行',
      '案例参考，实践指导'
    ],
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  }
}

interface ModeSelectorProps {
  selectedMode?: ModeType
  onModeChange?: (mode: ModeType) => void
  className?: string
}

export function ModeSelector({ selectedMode, onModeChange, className }: ModeSelectorProps) {
  const [currentMode, setCurrentMode] = useState<ModeType>(selectedMode || 'student')

  useEffect(() => {
    // 从 localStorage 读取保存的模式
    const savedMode = localStorage.getItem('appMode') as ModeType
    if (savedMode) {
      setCurrentMode(savedMode)
      onModeChange?.(savedMode)
    }
  }, [onModeChange])

  const handleModeChange = (mode: ModeType) => {
    setCurrentMode(mode)
    localStorage.setItem('appMode', mode)
    onModeChange?.(mode)
    toast.success(`已切换到${modeConfigs[mode].title}`)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* 模式切换卡片 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">选择场景模式</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.values(modeConfigs).map((config) => {
            const Icon = config.icon
            const isSelected = currentMode === config.type

            return (
              <button
                key={config.type}
                onClick={() => handleModeChange(config.type)}
                className={cn(
                  "relative p-6 rounded-xl border-2 transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isSelected
                    ? "border-blue-500 shadow-xl bg-gradient-to-br " + config.bgGradient
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                )}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-gradient-to-br",
                    config.color,
                    "text-white"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {config.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {config.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 text-sm"
                    >
                      <div className="mt-1">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-blue-500" : "bg-gray-400"
                        )} />
                      </div>
                      <span className={cn(
                        "text-left",
                        isSelected ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* 快速提示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                模式说明
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <p>• <strong>学生模式</strong>：深度学习，注重理解概念、掌握知识</p>
                <p>• <strong>职场模式</strong>：快速提取，注重效率、应用实践</p>
                <p>• 随时可以切换模式，不同模式的 AI 伴读体验会有所不同</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 模式上下文 Hook
export function useAppMode() {
  const [mode, setMode] = useState<ModeType>('student')

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as ModeType
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  const switchMode = (newMode: ModeType) => {
    setMode(newMode)
    localStorage.setItem('appMode', newMode)
  }

  return {
    mode,
    setMode: switchMode,
    isStudent: mode === 'student',
    isProfessional: mode === 'professional'
  }
}
