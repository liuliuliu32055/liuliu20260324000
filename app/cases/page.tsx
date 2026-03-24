'use client'

import { useState } from 'react'
import { Search, Filter, BookOpen, Users, Star, Eye, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: '全部', count: 12 },
    { id: 'technology', label: '技术文档', count: 5 },
    { id: 'business', label: '商业分析', count: 3 },
    { id: 'education', label: '教育资料', count: 2 },
    { id: 'research', label: '学术研究', count: 2 }
  ]

  const cases = [
    {
      id: '1',
      title: '人工智能伦理指南',
      description: '探讨人工智能发展中的伦理问题和应对策略，包含国际标准和最佳实践',
      category: 'technology',
      rating: 4.8,
      downloads: 1245,
      views: 3210,
      tags: ['AI', '伦理', '标准'],
      featured: true
    },
    {
      id: '2',
      title: '数字化转型案例研究',
      description: '分析传统企业数字化转型的成功案例，总结关键成功因素和实施路径',
      category: 'business',
      rating: 4.6,
      downloads: 892,
      views: 2150,
      tags: ['数字化', '转型', '案例'],
      featured: true
    },
    {
      id: '3',
      title: '机器学习算法详解',
      description: '详细讲解常见的机器学习算法原理、应用场景和实现方法',
      category: 'technology',
      rating: 4.9,
      downloads: 1876,
      views: 4321,
      tags: ['机器学习', '算法', '教程']
    },
    {
      id: '4',
      title: '教育科技发展趋势',
      description: '分析教育科技行业的最新发展趋势和未来展望',
      category: 'education',
      rating: 4.5,
      downloads: 567,
      views: 1289,
      tags: ['教育', '科技', '趋势']
    },
    {
      id: '5',
      title: '区块链技术白皮书',
      description: '区块链技术原理、应用场景和发展前景的全面分析',
      category: 'technology',
      rating: 4.7,
      downloads: 987,
      views: 2345,
      tags: ['区块链', '技术', '白皮书']
    },
    {
      id: '6',
      title: '创业公司融资指南',
      description: '创业公司融资策略、估值方法和投资者关系管理',
      category: 'business',
      rating: 4.4,
      downloads: 432,
      views: 987,
      tags: ['创业', '融资', '投资']
    }
  ]

  const filteredCases = cases.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      business: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      education: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      research: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-8">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">
            案例库
          </h1>
          <p className="text-lg opacity-90 mb-6">
            探索丰富的文档案例，学习行业最佳实践，获取灵感启发
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>{cases.length} 个案例</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>持续更新</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>高质量内容</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="搜索案例标题、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 筛选按钮 */}
          <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Filter className="h-5 w-5" />
            <span>高级筛选</span>
          </button>
        </div>

        {/* 分类标签 */}
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 特色案例 */}
      {filteredCases.filter(c => c.featured).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            精选案例
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases
              .filter(c => c.featured)
              .map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        getCategoryColor(caseItem.category)
                      )}>
                        {categories.find(c => c.id === caseItem.category)?.label}
                      </span>
                    </div>
                    {caseItem.featured && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full">
                        精选
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {caseItem.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{caseItem.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{caseItem.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{caseItem.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm hover:opacity-90">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 所有案例 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            所有案例 ({filteredCases.length})
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            按下载量排序
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="mb-3">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getCategoryColor(caseItem.category)
                )}>
                  {categories.find(c => c.id === caseItem.category)?.label}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {caseItem.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {caseItem.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {caseItem.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {caseItem.tags.length > 2 && (
                  <span className="px-2 py-1 text-gray-500 dark:text-gray-500 text-xs">
                    +{caseItem.tags.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{caseItem.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{caseItem.downloads}</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50">
                  查看
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              没有找到匹配的案例
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              请尝试其他搜索关键词或选择其他分类
            </p>
          </div>
        )}
      </div>

      {/* 使用指南 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p1-8">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            如何使用案例库
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="inline-flex p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">1. 搜索案例</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                使用关键词、分类或标签搜索您感兴趣的案例
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">2. 查看详情</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                查看案例的详细内容、评分和用户反馈
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">3. 下载学习</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                下载案例文档，使用 AI 伴读功能进行深入学习
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}