'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadAreaProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function UploadArea({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className,
}: UploadAreaProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('')
    
    // 验证文件数量
    if (acceptedFiles.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`)
      return
    }
    
    // 验证文件大小
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      setError(`文件 "${oversizedFiles[0].name}" 超过 ${maxSize / 1024 / 1024}MB 限制`)
      return
    }
    
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [maxFiles, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
  })

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('请先选择要上传的文件')
      return
    }
    
    setUploading(true)
    setError('')
    
    try {
      await onUpload(files)
      setFiles([])
    } catch (err: any) {
      setError(err.message || '上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? '松开鼠标上传文件' : '拖放文件到这里'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              或点击选择文件
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            支持：TXT, PDF, DOC, DOCX, MD, CSV, JSON
            <br />
            最大大小：{formatFileSize(maxSize)}，最多 {maxFiles} 个文件
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">已选择 {files.length} 个文件</h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={uploading}
            >
              清除全部
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-md bg-muted"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="p-1 hover:bg-muted-foreground/10 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading || disabled}
            className={cn(
              'w-full py-3 px-4 rounded-md font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                上传中...
              </>
            ) : (
              `上传 ${files.length} 个文件`
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}