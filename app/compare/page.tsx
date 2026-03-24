'use client'

import { DocumentCompare } from '@/components/document/document-compare'

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          文档对比
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          智能对比两个文档，发现差异和相似点
        </p>
      </div>

      <DocumentCompare />
    </div>
  )
}
