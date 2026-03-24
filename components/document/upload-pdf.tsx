'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn, formatFileSize, validateFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'
import mammoth from 'mammoth'

interface Document {
  id: string
  title: string
  description: string
  type: string
  size: string
  status: '已解析' | '解析中' | '待解析'
  date: string
  progress: number
}

export function UploadPDF() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [encoding, setEncoding] = useState<'auto' | 'utf-8' | 'gbk'>('auto')

  // 从 localStorage 读取已上传的文档
  useEffect(() => {
    const storedDocs = localStorage.getItem('uploadedDocuments')
    if (storedDocs) {
      console.log('已保存的文档数量:', JSON.parse(storedDocs).length)
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    acceptedFiles.forEach((file) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      // 检查文件类型
      if (!['txt', 'pdf', 'docx'].includes(fileExtension || '')) {
        if (fileExtension === 'doc') {
          errors.push(`"${file.name}" 是旧版 .doc 格式，请另存为 .docx 后再上传`)
        } else {
          errors.push(`"${file.name}"不是支持的文件格式（仅支持 TXT、PDF、DOCX）`)
        }
        return
      }

      if (!validateFileSize(file, 10)) {
        errors.push(`"${file.name}"超过10MB限制`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 5
  })

  const simulateUpload = async (file: File) => {
    return new Promise<void>((resolve) => {
      const interval = 100 // ms
      const steps = 50
      let currentStep = 0

      const uploadInterval = setInterval(() => {
        currentStep++
        const newProgress = Math.min((currentStep / steps) * 100, 100)
        
        setProgress(prev => ({
          ...prev,
          [file.name]: newProgress
        }))

        if (currentStep >= steps) {
          clearInterval(uploadInterval)
          setTimeout(() => {
            setUploadedFiles(prev => [...prev, file.name])
            resolve()
          }, 300)
        }
      }, interval)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('请先选择要上传的文件')
      return
    }

    setUploading(true)
    setProgress({})

    try {
      // 读取已存在的文档
      const existingDocs: Document[] = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')

      // 上传每个文件
      for (const file of files) {
        await simulateUpload(file)

        // 根据文件类型处理
        let fileContent = ''
        let fileType = '未知'
        let dataUrl = ''

        const fileExtension = file.name.split('.').pop()?.toLowerCase()

        if (fileExtension === 'txt') {
          // 处理 TXT 文件 - 根据选择的编码读取
          try {
            const arrayBuffer = await file.arrayBuffer()

            // 根据用户选择的编码读取
            if (encoding === 'gbk') {
              // GBK 编码
              const gbkBlob = new Blob([arrayBuffer], { type: 'text/plain;charset=gbk' })
              fileContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.onerror = () => reject(new Error('GBK 解码失败'))
                reader.readAsText(gbkBlob, 'gbk')
              })
            } else if (encoding === 'utf-8') {
              // UTF-8 编码
              const utf8Blob = new Blob([arrayBuffer], { type: 'text/plain;charset=utf-8' })
              fileContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.onerror = () => reject(new Error('UTF-8 解码失败'))
                reader.readAsText(utf8Blob, 'utf-8')
              })
            } else {
              // 自动检测 - 先尝试 UTF-8，如果失败则尝试 GBK
              try {
                const utf8Blob = new Blob([arrayBuffer], { type: 'text/plain;charset=utf-8' })
                fileContent = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = (e) => resolve(e.target?.result as string)
                  reader.onerror = () => reject(new Error('UTF-8 解码失败'))
                  reader.readAsText(utf8Blob, 'utf-8')
                })
              } catch {
                // UTF-8 失败，尝试 GBK
                const gbkBlob = new Blob([arrayBuffer], { type: 'text/plain;charset=gbk' })
                fileContent = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = (e) => resolve(e.target?.result as string)
                  reader.onerror = () => reject(new Error('GBK 解码失败'))
                  reader.readAsText(gbkBlob, 'gbk')
                })
              }
            }

            fileType = 'TXT'
          } catch (error) {
            console.error('读取 TXT 文件失败:', error)

            // 提供一个更简单的编码检测方案
            try {
              const arrayBuffer = await file.arrayBuffer()
              // 直接读取为文本（浏览器会尝试自动检测）
              const reader = new FileReader()
              fileContent = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsText(arrayBuffer)
              })

              fileType = 'TXT'

              // 检测是否包含乱码（重复的替换字符）
              const hasMoJibake = /[\ufffd]/.test(fileContent) || /[\uff01-\uff5e]{5,}/.test(fileContent)
              if (hasMoJibake) {
                console.warn('检测到可能的编码问题')
              }
            } catch (fallbackError) {
              console.error('备用方案也失败:', fallbackError)
              fileContent = `读取 TXT 文件失败。\n\n建议：\n1. 使用记事本打开文件\n2. 点击"另存为"\n3. 编码选择"UTF-8"\n4. 保存后重新上传`
              fileType = 'TXT'
            }
          }
        } else if (fileExtension === 'pdf') {
          // 处理 PDF 文件
          const arrayBuffer = await file.arrayBuffer()
          const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
          dataUrl = `data:application/pdf;base64,${base64}`
          fileType = 'PDF'

          // 尝试提取 PDF 文本（简化版，实际需要后端支持）
          fileContent = `PDF文档：${file.name}\n\n[注意：完整的PDF文本提取需要后端支持]\n\n您可以使用AI伴读功能来辅助阅读文档。`
        } else if (fileExtension === 'docx') {
          // 处理 Word 文档（.docx）
          try {
            const arrayBuffer = await file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            fileContent = result.value || ''
            fileType = 'Word'

            // 保存文件数据
            const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
            dataUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`

            if (result.messages && result.messages.length > 0) {
              console.warn('Word 文档解析警告:', result.messages)
            }
          } catch (error) {
            console.error('解析 Word 文档失败:', error)
            fileContent = `Word文档：${file.name}\n\n文档解析失败，请检查文件格式是否正确。`
            fileType = 'Word'
          }
        } else if (fileExtension === 'doc') {
          // 处理旧版 Word 文档（.doc）
          fileType = 'Word'
          // 旧版 .doc 格式需要后端支持
          fileContent = `Word文档（.doc格式）：${file.name}\n\n注意：旧版 .doc 格式需要后端支持才能解析。\n建议将文件另存为 .docx 格式后再上传。`

          // 保存文件数据（用于将来后端解析）
          const arrayBuffer = await file.arrayBuffer()
          const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
          dataUrl = `data:application/msword;base64,${base64}`
        } else {
          fileType = fileExtension || '未知'
          fileContent = `未知格式文件：${file.name}\n\n不支持的文件类型，请上传 TXT、PDF 或 Word 文档。`
        }

        // 创建新文档对象
        const newDoc: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: file.name,
          description: `用户上传的 ${fileType} 文档`,
          type: fileType,
          size: formatFileSize(file.size),
          status: '已解析',
          date: new Date().toISOString().split('T')[0],
          progress: 100
        }

        // 保存文件内容到 localStorage
        if (fileExtension === 'txt') {
          localStorage.setItem(`doc-content-${newDoc.id}`, fileContent)
        } else if (dataUrl) {
          localStorage.setItem(`doc-data-${newDoc.id}`, dataUrl)
        }
        // 保存文件类型信息
        localStorage.setItem(`doc-type-${newDoc.id}`, fileType)

        // 保存文本内容用于 AI 伴读
        localStorage.setItem(`doc-text-${newDoc.id}`, fileContent)

        // 保存到文档列表
        existingDocs.unshift(newDoc)
      }

      // 保存到 localStorage
      localStorage.setItem('uploadedDocuments', JSON.stringify(existingDocs))

      toast.success(`成功上传 ${files.length} 个文件`)

      // 上传成功后跳转到文档列表页面
      setTimeout(() => {
        window.location.href = '/documents'
      }, 1000)

    } catch (error) {
      toast.error('上传失败，请重试')
      console.error('上传失败:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName))
    setProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    setUploadedFiles(prev => prev.filter(name => name !== fileName))
  }

  const removeAllFiles = () => {
    setFiles([])
    setProgress({})
    setUploadedFiles([])
  }

  return (
    <div className="space-y-6">
      {/* 拖拽区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
          "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragActive
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          )}>
            {uploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {isDragActive ? '松开鼠标上传文件' : '拖放文件到这里'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              或点击选择文件
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>支持 TXT、PDF、DOCX 格式</p>
            <p>单个文件最大 10MB，最多上传 5 个文件</p>

            {/* TXT 文件编码选择器 */}
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">TXT 文件编码：</label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value as any)}
                className="ml-2 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                <option value="auto">自动检测</option>
                <option value="utf-8">UTF-8</option>
                <option value="gbk">GBK (简体中文)</option>
              </select>
            </div>

            <p className="text-blue-600 dark:text-blue-400">💡 TXT 和 DOCX 文件支持 AI 伴读</p>
            <p className="text-gray-400 text-xs">⚠️ 旧版 .doc 格式暂不支持，请另存为 .docx</p>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              已选择 {files.length} 个文件
              {uploading && ` (上传中 ${Object.keys(progress).length}/${files.length})`}
            </h3>
            <button
              onClick={removeAllFiles}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              disabled={uploading}
            >
              清除全部
            </button>
          </div>

          <div className="space-y-3">
            {files.map((file) => {
              const fileProgress = progress[file.name] || 0
              const isUploaded = uploadedFiles.includes(file.name)
              const isUploading = fileProgress > 0 && fileProgress < 100

              return (
                <div
                  key={file.name}
                  className={cn(
                    "bg-white dark:bg-gray-900 rounded-xl border p-4 transition-all",
                    isUploaded
                      ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                      : isUploading
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isUploaded
                          ? "bg-green-100 dark:bg-green-900/30"
                          : isUploading
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      )}>
                        {isUploaded ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : isUploading ? (
                          <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      disabled={uploading}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ml-2"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  {/* 进度条 */}
                  {isUploading && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-600 dark:text-blue-400">
                          上传中...
                        </span>
                        <span className="font-medium">
                          {Math.round(fileProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isUploaded && (
                    <div className="mt-3 flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">上传完成</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 上传按钮 */}
          <div className="pt-4">
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className={cn(
                "w-full py-3 px-6 rounded-xl font-semibold transition-all",
                "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                "hover:from-blue-600 hover:to-purple-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  上传中...
                </span>
              ) : (
                `上传 ${files.length} 个文件`
              )}
            </button>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-300">
              使用提示
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 支持标准 PDF 格式，建议使用文字型 PDF 以获得最佳解析效果</li>
              <li>• 上传后系统将自动解析文档内容，生成 AI 可分析的文本结构</li>
              <li>• 您可以在解析完成后选中文字获得 AI 伴读、笔记标注等功能</li>
              <li>• 大文件可能需要较长时间解析，请耐心等待</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}