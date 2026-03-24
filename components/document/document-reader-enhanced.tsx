'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AIChatMenu } from '@/components/ai/ai-chat-menu';
import ParagraphRenderer from './paragraph-renderer';
import { MessageCircle, Zap, Lightbulb, BookOpen } from 'lucide-react';
import { cn, getSelectionPosition, getSelectedText } from '@/lib/utils';
import toast from 'react-hot-toast';
import { NoteService } from '@/lib/services/note-service';
import { Note } from '@/lib/types/note';

interface DocumentReaderProps {
  documentId: string;
}

export function DocumentReaderEnhanced({ documentId }: DocumentReaderProps) {
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiAction, setAiAction] = useState<'explain' | 'example' | 'summary' | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 加载文档的笔记
  useEffect(() => {
    loadNotes();
  }, [documentId]);

  const loadNotes = async () => {
    try {
      const documentNotes = await NoteService.getDocumentNotes(documentId);
      setNotes(documentNotes);
    } catch (error) {
      console.error('加载笔记失败:', error);
    }
  };

  // 监听文本选择
  useEffect(() => {
    const handleSelectionChange = () => {
      const text = getSelectedText();
      const position = getSelectionPosition();
      const selection = window.getSelection();
      
      if (text && position && selection) {
        // 获取选中的段落ID
        const paragraphElement = selection.anchorNode?.parentElement?.closest('[id^="para-"]');
        const paragraphId = paragraphElement?.id || null;
        
        setSelectedText(text);
        setSelectionPosition(position);
        setSelectedParagraphId(paragraphId);
        setIsSelecting(true);
      } else {
        setSelectedText('');
        setSelectionPosition(null);
        setSelectedParagraphId(null);
        setIsSelecting(false);
        setShowChatMenu(false);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // 防止在 AI 菜单内点击时触发
      const isInMenu = (e.target as HTMLElement).closest('#ai-chat-menu');
      if (!isInMenu && isSelecting) {
        setShowChatMenu(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const isInMenu = (e.target as HTMLElement).closest('#ai-chat-menu');
      const isInContainer = containerRef.current?.contains(e.target as Node);
      
      if (!isInMenu && !isInContainer) {
        setShowChatMenu(false);
        setSelectionPosition(null);
        setSelectedParagraphId(null);
        setIsSelecting(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSelecting]);

  const handleAIAction = useCallback(async (action: 'explain' | 'example' | 'summary') => {
    if (!selectedText) {
      toast.error('请先选择文本');
      return;
    }

    setAiAction(action);
    setIsLoading(true);
    setAiResponse('');
    setShowChatMenu(false);

    try {
      // 调用真实的 AI API
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          action: action,
          documentId: documentId,
          paragraphId: selectedParagraphId,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 请求失败');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              toast.success('AI 分析完成');
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                fullResponse += parsed.choices[0].delta.content;
                setAiResponse(fullResponse);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 分析失败:', error);
      
      // 如果 API 失败，使用模拟响应
      const responses = {
        explain: `我为你解释一下这段内容：\n\n"${selectedText}"\n\n这部分内容主要说明了...`,
        example: `关于"${selectedText}"，我给你举个例子：\n\n假设...`,
        summary: `这段内容的关键要点总结如下：\n\n1. 第一点...\n2. 第二点...\n3. 第三点...`
      };

      const response = responses[action];
      let displayedText = '';
      
      for (let i = 0; i < response.length; i++) {
        displayedText += response.charAt(i);
        setAiResponse(displayedText);
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      toast.error('AI API 调用失败，已使用模拟响应');
    } finally {
      setIsLoading(false);
    }
  }, [selectedText, documentId, selectedParagraphId]);

  const handleAddNote = useCallback(async () => {
    if (!selectedText) {
      toast.error('请先选择文本');
      return;
    }

    if (!selectedParagraphId) {
      toast.error('无法确定段落位置');
      return;
    }

    try {
      await NoteService.createNote({
        document_id: documentId,
        paragraph_id: selectedParagraphId,
        content: `选中的内容：\n${selectedText}\n\n我的笔记：`,
        title: `选中文本的笔记`,
      });

      toast.success('已添加到笔记');
      setShowChatMenu(false);
      setSelectionPosition(null);
      setSelectedParagraphId(null);
      setIsSelecting(false);
      
      // 刷新笔记列表
      loadNotes();
    } catch (error) {
      console.error('添加笔记失败:', error);
      toast.error('添加笔记失败');
    }
  }, [selectedText, selectedParagraphId, documentId]);

  const handleHighlight = useCallback(() => {
    if (!selectedText) {
      toast.error('请先选择文本');
      return;
    }

    // 在实际应用中，这里会高亮选中的文本
    toast.success('已添加高亮标记');
    setShowChatMenu(false);
  }, [selectedText]);

  // 处理段落点击（用于笔记跳转）
  const handleParagraphClick = (paragraphId: string) => {
    // 可以在此处实现段落跳转逻辑
    console.log('段落被点击:', paragraphId);
  };

  // 文档内容 - 模拟数据
  const documentContent = `
# 人工智能发展白皮书

## 第一章：人工智能概述

### 1.1 人工智能的定义
人工智能（Artificial Intelligence，简称 AI）是指由人制造出来的系统所表现出来的智能。通常人工智能是指通过普通计算机程序来呈现人类智能的技术。该词也指出研究这样的智能系统是否能够实现，以及如何实现。

### 1.2 人工智能的发展历程
人工智能的发展经历了多个阶段：
1. **符号主义 AI（1950s-1970s）**：基于逻辑推理和知识表示
2. **连接主义 AI（1980s-1990s）**：基于神经网络和机器学习
3. **深度学习革命（2010s-至今）**：基于深度神经网络和大数据

### 1.3 人工智能的主要技术领域
- **机器学习**：让计算机从数据中学习规律
- **自然语言处理**：让计算机理解、生成人类语言
- **计算机视觉**：让计算机"看懂"图像和视频
- **机器人技术**：实现智能化的物理设备控制

## 第二章：机器学习基础

### 2.1 监督学习
监督学习是指从标记的训练数据中学习预测函数的机器学习任务。训练数据包括输入对象和期望的输出值。监督学习算法分析训练数据并产生一个推断函数，该函数可用于映射新的实例。

### 2.2 无监督学习
无监督学习是指从未标记的训练数据中学习模式或结构的机器学习任务。无监督学习算法不依赖于标记数据，而是通过数据的内在结构进行学习。

### 2.3 强化学习
强化学习是指智能体通过与环境交互来学习最优行为策略的机器学习任务。智能体通过试错来学习，根据行为获得的奖励或惩罚来调整策略。

## 第三章：深度学习技术

### 3.1 神经网络基础
神经网络是受生物神经网络启发而构建的计算模型。它由大量的人工神经元相互连接构成，每个神经元接收输入信号，通过激活函数处理后输出。

### 3.2 卷积神经网络
卷积神经网络（CNN）是专为处理图像数据而设计的深度学习网络。它通过卷积层、池化层和全连接层的组合，能够有效提取图像的空间特征。

### 3.3 循环神经网络
循环神经网络（RNN）是专为处理序列数据而设计的深度学习网络。它具有记忆功能，能够处理时间序列数据，如自然语言、语音等。

## 第四章：人工智能应用

### 4.1 智能客服
智能客服系统利用自然语言处理技术理解用户问题，并通过知识库提供准确回答。它能够24小时不间断服务，大幅提升客户服务效率。

### 4.2 医疗诊断
AI在医疗诊断领域的应用包括医学影像分析、疾病预测、药物研发等。深度学习模型能够在CT、MRI等医学影像中识别病变，辅助医生进行诊断。

### 4.3 自动驾驶
自动驾驶技术结合了计算机视觉、传感器融合、路径规划等多种AI技术。它能够感知周围环境，做出驾驶决策，实现车辆的自主导航。

## 第五章：发展趋势与挑战

### 5.1 技术发展趋势
1. **大模型时代**：参数规模持续扩大，性能不断提升
2. **多模态融合**：文本、图像、语音等多种模态的融合
3. **AI for Science**：AI在科学研究中的应用日益广泛

### 5.2 面临的挑战
- **数据隐私与安全**：如何在保护隐私的前提下有效利用数据
- **算法偏见**：如何避免算法中的偏见和不公平
- **能源消耗**：大规模AI模型的训练需要巨大的能源消耗
- **伦理问题**：AI决策的透明度和可解释性问题

### 5.3 未来展望
随着技术的不断进步，人工智能将在更多领域发挥重要作用。未来的AI系统将更加智能、可靠、可信，更好地服务于人类社会的发展。

**结语**
人工智能作为第四次工业革命的核心技术，正在深刻改变着人类社会的方方面面。我们需要在推动技术发展的同时，关注其带来的伦理、社会和经济影响，确保AI技术朝着有益于人类的方向发展。
`;

  // 将文档内容拆分为段落
  const paragraphs = documentContent
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map((line, index) => ({
      content: line.trim(),
      index,
    }));

  return (
    <div ref={containerRef} className="relative">
      {/* 文档内容区域 */}
      <div 
        className={cn(
          "prose prose-lg max-w-none dark:prose-invert",
          "bg-white dark:bg-gray-900 p-4 md:p-8 rounded-lg border border-gray-200 dark:border-gray-700",
          isMobile && "p-3 text-sm"
        )}
        onMouseDown={() => {
          if (showChatMenu) {
            setShowChatMenu(false);
          }
        }}
      >
        {/* 使用段落渲染器渲染每个段落 */}
        {paragraphs.map((paragraph, index) => (
          <ParagraphRenderer
            key={index}
            documentId={documentId}
            paragraphIndex={index}
            content={paragraph.content}
            onParagraphClick={handleParagraphClick}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* AI 伴读菜单 */}
      {selectionPosition && showChatMenu && (
        <AIChatMenu
          position={selectionPosition}
          selectedText={selectedText}
          onExplain={() => handleAIAction('explain')}
          onExample={() => handleAIAction('example')}
          onSummary={() => handleAIAction('summary')}
          onAddNote={handleAddNote}
          onHighlight={handleHighlight}
          isMobile={isMobile}
        />
      )}

      {/* AI 响应区域 */}
      {(aiResponse || isLoading) && (
        <div className="mt-6 md:mt-8">
          <div className="flex items-center space-x-2 mb-3 md:mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                {aiAction === 'explain' && '通俗讲解'}
                {aiAction === 'example' && '举个例子'}
                {aiAction === 'summary' && '内容总结'}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                AI 伴读助手为您解析
              </p>
            </div>
          </div>
          
          <div 
            ref={responseRef}
            className={cn(
              "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900",
              "p-4 md:p-6 rounded-xl border border-blue-200 dark:border-blue-800 transition-all",
              isMobile && "p-3 text-sm"
            )}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-blue-500 border-t-transparent" />
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  AI 助手正在思考中...
                </p>
              </div>
            ) : (
              <div className={cn("prose prose-blue max-w-none dark:prose-invert", isMobile && "text-sm")}>
                {aiResponse}
              </div>
            )}
            
            {!isLoading && aiResponse && (
              <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiResponse);
                    toast.success('已复制到剪贴板');
                  }}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  复制回答
                </button>
                <button 
                  onClick={handleAddNote}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  保存到笔记
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                  继续提问
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 快速操作按钮（仅桌面端显示） */}
      {!isMobile && (
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
          <button
            onClick={() => {
              toast.success('已保存当前阅读位置');
            }}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="保存进度"
          >
            <BookOpen className="h-5 w-5 text-blue-500" />
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="回到顶部"
          >
            <Zap className="h-5 w-5 text-purple-500" />
          </button>
          <button
            onClick={() => {
              toast.success('已分享文档链接');
            }}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="分享文档"
          >
            <Lightbulb className="h-5 w-5 text-green-500" />
          </button>
        </div>
      )}
    </div>
  );
}