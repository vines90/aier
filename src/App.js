import React, { useState, useRef, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styled from 'styled-components';
import { Button, message, Spin, Radio } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import * as htmlToImage from 'html-to-image';
import rehypePrism from 'rehype-prism-plus';
import { Analytics } from "@vercel/analytics/react";

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2b4c7d, #567bbd);
  border-radius: 8px;
  margin-right: 10px;
  color: white;
  font-weight: bold;
  font-size: 20px;
  position: relative;
  overflow: hidden;
`;

const LogoText = styled.div`
  font-weight: 800;
  font-size: 2em;
  background: linear-gradient(120deg, #2b4c7d, #567bbd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LogoArrow = styled.span`
  position: absolute;
  right: 4px;
  font-size: 14px;
  transform: rotate(45deg);
`;

const Title = styled.h1`
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-size: 2.4em;
  font-weight: 800;
  background: linear-gradient(120deg, #2b4c7d, #567bbd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.8em;
  }
`;

const AuthorInfo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  color: #64748b;
  font-size: 0.95em;
  
  a {
    color: #2563eb;
    text-decoration: none;
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #64748b;
  font-size: 0.9em;
  margin-top: 40px;
  border-top: 1px solid #e2e8f0;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const EditorSection = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PreviewSection = styled.div`
  flex: 1;
  min-width: 0;
  position: sticky;
  top: 20px;
  height: fit-content;

  @media (max-width: 768px) {
    position: static;
    width: 100%;
  }
`;

const EditorContainer = styled.div`
  .w-md-editor {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: none;
    background: #ffffff;
    height: calc(100vh - 250px) !important;
    color: #2c3e50 !important;

    @media (max-width: 768px) {
      height: 300px !important;
    }
  }
  .w-md-editor-toolbar {
    border-radius: 12px 12px 0 0;
    background: #f8f9fa;
    border-bottom: 1px solid #eaecef;
    padding: 8px;
  }
  .w-md-editor-input {
    font-size: 15px;
    padding: 16px;
    color: #2c3e50 !important;
  }
  .w-md-editor-text {
    background: #ffffff !important;
    color: #2c3e50 !important;
  }
  .w-md-editor-text-pre, 
  .w-md-editor-text-input,
  .w-md-editor-text-pre > code,
  textarea {
    font-size: 15px !important;
    color: #2c3e50 !important;
    background: #ffffff !important;
    line-height: 1.8 !important;
    caret-color: #2c3e50 !important;
  }
  .w-md-editor-content {
    background: #ffffff !important;
    color: #2c3e50 !important;
  }
  .wmde-markdown-color {
    background: #ffffff !important;
    color: #2c3e50 !important;
  }
  
  /* 修复编辑器内所有文字颜色 */
  .w-md-editor-text-input::placeholder {
    color: #94a3b8 !important;
  }
  .w-md-editor-text * {
    color: #2c3e50 !important;
  }
  .token {
    color: #2c3e50 !important;
    background: none !important;
  }
  .token.punctuation {
    color: #64748b !important;
  }
  .token.keyword,
  .token.operator {
    color: #7c3aed !important;
  }
  .token.string {
    color: #059669 !important;
  }
  .token.comment {
    color: #94a3b8 !important;
  }
  
  /* 额外的样式修复 */
  .w-md-editor-text-pre > code * {
    color: #2c3e50 !important;
  }
  .w-md-editor-text-pre {
    color: #2c3e50 !important;
  }
  .w-md-editor-preview {
    background: #ffffff !important;
    color: #2c3e50 !important;
  }
  .w-md-editor-preview * {
    color: #2c3e50 !important;
  }
  
  /* 确保编辑器工具栏按钮可见 */
  .w-md-editor-toolbar button {
    color: #4a5568 !important;
  }
  .w-md-editor-toolbar button:hover {
    color: #2c3e50 !important;
    background: #edf2f7 !important;
  }
  .w-md-editor-toolbar-divider {
    background-color: #e2e8f0 !important;
  }

  /* 强制覆盖默认主题 */
  [data-color-mode="light"] {
    --color-fg-default: #2c3e50 !important;
    --color-canvas-default: #ffffff !important;
    --color-border-default: #eaecef !important;
  }
  
  /* 编辑器文本区域 */
  .w-md-editor-text-pre > code,
  .w-md-editor-text-input {
    -webkit-text-fill-color: #2c3e50 !important;
  }
  
  /* 确保光标可见 */
  .w-md-editor-text-input {
    -webkit-text-fill-color: #2c3e50 !important;
    opacity: 1 !important;
  }
`;

const PreviewContainer = styled.div`
  padding: 48px 60px;
  background: ${props => props.background};
  border-radius: 16px;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
    : props.theme === 'gradient'
      ? '0 10px 30px rgba(120, 116, 255, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  max-width: 720px;
  margin: 0 auto;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.theme === 'gradient' 
      ? 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)' 
      : 'linear-gradient(90deg, #2b4c7d, #567bbd)'};
  }

  ${props => props.theme === 'gradient' && `
    &::after {
      content: '';
      position: absolute;
      bottom: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(225deg, rgba(236, 72, 153, 0.07), rgba(99, 102, 241, 0.07));
      z-index: -1;
    }
  `}

  .wmde-markdown {
    font-size: 15px;
    line-height: 1.8;
    color: ${props => props.textColor};
    background: ${props => props.theme === 'gradient' ? 'transparent' : props.background};
  }

  /* 确保所有emoji正确显示 */
  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3,
  .wmde-markdown p,
  .wmde-markdown li,
  .wmde-markdown blockquote {
    font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  }

  /* 允许emoji显示彩色 */
  .wmde-markdown p,
  .wmde-markdown li,
  .wmde-markdown blockquote {
    color: ${props => props.textColor};
    -webkit-text-fill-color: ${props => props.textColor};
    
    /* 确保emoji彩色显示 */
    .emoji, span.emoji, 
    img.emoji {
      color: initial;
      -webkit-text-fill-color: initial;
      background: none;
      font-style: normal;
    }
  }

  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3 {
    font-weight: 700;
    line-height: 1.4;
    margin: 1.2em 0 0.8em;
    letter-spacing: -0.01em;
    color: ${props => props.titleColor};
    ${props => props.theme === 'gradient' && `
      background: linear-gradient(90deg, #2f365f, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      
      /* 确保在渐变主题下emoji仍然可见 */
      & .emoji, & span.emoji {
        -webkit-text-fill-color: initial;
        background: initial;
        color: initial;
      }
    `}
  }

  /* 修正emoji显示 - 移除任何可能干扰emoji的样式 */
  .emoji, 
  span.emoji,
  img.emoji {
    color: initial !important;
    -webkit-text-fill-color: initial !important;
    background: none !important;
    font-style: normal !important;
    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important;
    display: inline-block;
  }
  
  /* 确保Markdown渲染器不会强制应用颜色到emoji */
  .wmde-markdown {
    em .emoji, 
    strong .emoji,
    h1 .emoji,
    h2 .emoji,
    h3 .emoji,
    p .emoji,
    li .emoji,
    blockquote .emoji {
      color: initial !important;
      -webkit-text-fill-color: initial !important;
    }
  }

  .wmde-markdown h1 {
    font-size: 1.8em;
    border-bottom: 2px solid ${props => props.borderColor};
    padding-bottom: 0.3em;
  }

  .wmde-markdown h2 {
    font-size: 1.5em;
    border-bottom: 1px solid ${props => props.borderColor};
    padding-bottom: 0.3em;
  }

  .wmde-markdown h3 {
    font-size: 1.25em;
    margin: 1em 0 0.6em;
  }

  .wmde-markdown p {
    margin: 0.8em 0;
    line-height: 1.8;
  }

  .wmde-markdown ul,
  .wmde-markdown ol {
    padding-left: 1.2em;
    margin: 0.6em 0;
  }

  .wmde-markdown li {
    margin: 0.4em 0;
    line-height: 1.7;
    position: relative;
  }

  .wmde-markdown ul li::before {
    content: '';
    position: absolute;
    left: -1em;
    top: 0.7em;
    width: 5px;
    height: 5px;
    background: ${props => props.accentColor};
    border-radius: 50%;
    ${props => props.theme === 'gradient' && `
      background: linear-gradient(90deg, #6366f1, #a855f7);
    `}
  }

  .wmde-markdown blockquote {
    border: none;
    padding: 1em 1.2em;
    margin: 1.2em 0;
    background: ${props => props.blockquoteBackground};
    border-radius: 8px;
    position: relative;
    color: ${props => props.blockquoteColor};
    ${props => props.theme === 'gradient' && `
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
      border-left: 3px solid transparent;
      border-image: linear-gradient(to bottom, #6366f1, #a855f7);
      border-image-slice: 1;
    `}
  }

  .wmde-markdown blockquote::before {
    content: '"';
    position: absolute;
    top: -0.2em;
    left: 0.2em;
    font-size: 2.5em;
    color: ${props => props.accentColor};
    opacity: 0.15;
    font-family: Georgia, serif;
  }

  .wmde-markdown code {
    background: ${props => props.codeBackground};
    border-radius: 4px;
    padding: 0.2em 0.4em;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.9em;
    color: ${props => props.codeColor};
    ${props => props.theme === 'gradient' && `
      position: relative;
      z-index: 1;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
        border-radius: 4px;
        z-index: -1;
      }
    `}
  }

  .wmde-markdown pre {
    background: ${props => props.preBackground};
    border-radius: 8px;
    padding: 1.2em;
    margin: 1.2em 0;
    overflow-x: auto;
  }

  .wmde-markdown pre code {
    color: ${props => props.preCodeColor};
    background: none;
    padding: 0;
    font-size: 0.9em;
    line-height: 1.6;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  /* 行内代码样式 */
  .wmde-markdown :not(pre) > code {
    background: ${props => props.codeBackground};
    color: ${props => props.codeColor};
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  /* Prism.js 语法高亮自定义样式 */
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${props => props.theme === 'dark' ? '#8b9eb0' : '#93a1a1'};
  }

  .token.punctuation {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2c3e50'};
  }

  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: ${props => props.theme === 'dark' ? '#93c5fd' : '#4f46e5'};
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: ${props => props.theme === 'dark' ? '#86efac' : '#059669'};
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2c3e50'};
  }

  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: ${props => props.theme === 'dark' ? '#c4b5fd' : '#7c3aed'};
  }

  .token.function,
  .token.class-name {
    color: ${props => props.theme === 'dark' ? '#93c5fd' : '#2563eb'};
  }

  .token.regex,
  .token.important,
  .token.variable {
    color: ${props => props.theme === 'dark' ? '#fde047' : '#db2777'};
  }

  /* 行号样式 */
  .line-number::before {
    color: ${props => props.theme === 'dark' ? '#4b5563' : '#94a3b8'};
  }

  /* 确保代码块内的文本可见 */
  .wmde-markdown pre,
  .wmde-markdown pre * {
    color: ${props => props.preCodeColor};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 35px 0;
`;

const StyledButton = styled(Button)`
  min-width: 130px;
  height: 40px;
  font-size: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 35px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .ant-radio-button-wrapper {
    border-radius: 6px;
    padding: 4px 16px;
    height: 34px;
    line-height: 26px;
    font-size: 14px;
    
    &:first-child {
      border-radius: 6px;
    }
    
    &:last-child {
      border-radius: 6px;
    }

    @media (max-width: 768px) {
      font-size: 13px;
      padding: 4px 12px;
    }
  }

  .ant-radio-group {
    @media (max-width: 768px) {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`;

const themes = {
  light: {
    background: '#ffffff',
    textColor: '#2c3e50',
    titleColor: '#1a1a1a',
    borderColor: '#eaecef',
    blockquoteBackground: '#f8f9fa',
    blockquoteColor: '#4a5568',
    codeBackground: '#f8fafc',
    codeColor: '#db2777',
    preBackground: '#f8fafc',
    preCodeColor: '#2c3e50',
    accentColor: '#3182ce'
  },
  warm: {
    background: '#fffaf5',
    textColor: '#4a3c39',
    titleColor: '#2d1f1b',
    borderColor: '#f0e4d8',
    blockquoteBackground: '#fff5eb',
    blockquoteColor: '#5c4c44',
    codeBackground: '#fff8f3',
    codeColor: '#c2410c',
    preBackground: '#fff8f3',
    preCodeColor: '#4a3c39',
    accentColor: '#dd6b20'
  },
  elegant: {
    background: '#f8fafc',
    textColor: '#334155',
    titleColor: '#1e293b',
    borderColor: '#e2e8f0',
    blockquoteBackground: '#f1f5f9',
    blockquoteColor: '#475569',
    codeBackground: '#f8fafc',
    codeColor: '#4f46e5',
    preBackground: '#f8fafc',
    preCodeColor: '#334155',
    accentColor: '#4f46e5'
  },
  dark: {
    background: '#1a1a1a',
    textColor: '#e2e8f0',
    titleColor: '#f8fafc',
    borderColor: '#2d3748',
    blockquoteBackground: '#2d3748',
    blockquoteColor: '#cbd5e1',
    codeBackground: '#2d3748',
    codeColor: '#93c5fd',
    preBackground: '#2d3748',
    preCodeColor: '#e2e8f0',
    accentColor: '#60a5fa'
  },
  gradient: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%)',
    textColor: '#334155',
    titleColor: '#2f365f',
    borderColor: '#cbd5e1',
    blockquoteBackground: 'rgba(255, 255, 255, 0.95)',
    blockquoteColor: '#4a5568',
    codeBackground: 'rgba(255, 255, 255, 0.9)',
    codeColor: '#7c3aed',
    preBackground: 'rgba(255, 255, 255, 0.95)',
    preCodeColor: '#334155',
    accentColor: '#7c3aed'
  },
  nature: {
    background: '#f0f7f4',
    textColor: '#2d3b36',
    titleColor: '#1b2b26',
    borderColor: '#cce3d8',
    blockquoteBackground: '#e6f2ec',
    blockquoteColor: '#435d54',
    codeBackground: '#e6f2ec',
    codeColor: '#0d503c',
    preBackground: '#e6f2ec',
    preCodeColor: '#2d3b36',
    accentColor: '#2d6a4f'
  },
  sunset: {
    background: '#fff9f5',
    textColor: '#4b3c43',
    titleColor: '#2b1c23',
    borderColor: '#f3d8d3',
    blockquoteBackground: '#fef2ed',
    blockquoteColor: '#6d4c55',
    codeBackground: '#fef2ed',
    codeColor: '#c43d54',
    preBackground: '#fef2ed',
    preCodeColor: '#4b3c43',
    accentColor: '#e85d75'
  },
  ocean: {
    background: '#f5f9ff',
    textColor: '#2c4159',
    titleColor: '#1a2c43',
    borderColor: '#d8e6f6',
    blockquoteBackground: '#edf3fc',
    blockquoteColor: '#456185',
    codeBackground: '#edf3fc',
    codeColor: '#0954a5',
    preBackground: '#edf3fc',
    preCodeColor: '#2c4159',
    accentColor: '#1e88e5'
  },
  mint: {
    background: '#f4fbfa',
    textColor: '#2c4a46',
    titleColor: '#1a332f',
    borderColor: '#d5eeeb',
    blockquoteBackground: '#e8f7f5',
    blockquoteColor: '#427369',
    codeBackground: '#e8f7f5',
    codeColor: '#0c8577',
    preBackground: '#e8f7f5',
    preCodeColor: '#2c4a46',
    accentColor: '#14b8a6'
  }
};

// AdSense广告组件
const AdBanner = styled.div`
  margin: 40px 0;
  text-align: center;
  min-height: 90px;
  
  @media (max-width: 768px) {
    margin: 30px 0;
  }
`;

function App() {
  const [isAppRoute, setIsAppRoute] = useState(false);
  
  useEffect(() => {
    if (window.location.pathname === '/app') {
      setIsAppRoute(true);
    } else if (window.location.pathname === '/') {
      window.location.href = '/landing.html';
    } else {
      setIsAppRoute(true);
    }
  }, []);

  const [value, setValue] = useState(`# md2image - Markdown to Image Converter 📝

Welcome to md2image, your professional tool for converting Markdown to beautiful images!

## 📘 What is Markdown?

Markdown is a popular markup language that makes it easy to format text for the web. Created by John Gruber in 2004, it has become the standard for:

- **Content Creation**: Write blog posts, documentation, and notes with simple formatting
- **Documentation**: Used by GitHub, GitLab, and major tech companies for technical docs
- **Social Media**: Create well-formatted posts for platforms like GitHub, Reddit, and Discord
- **Note Taking**: Popular note-taking apps like Notion and Obsidian use Markdown
- **Web Content**: Easily convert to HTML for websites and blogs

### ✨ Why Choose Markdown?

1. **Simple Syntax**: Use \`#\` for headings, \`*\` for lists, \`>\` for quotes
2. **Platform Independent**: Works everywhere, from simple text editors to advanced apps
3. **Future Proof**: Your content stays readable even without formatting
4. **Versatile Output**: Convert to HTML, PDF, images, and more

## 🎯 How to Use md2image

1. **Write or Paste Content**
   - Use our Markdown editor
   - Support for headings, lists, code blocks
   - Real-time preview as you type

2. **Style Your Content**
   - Choose from multiple professional themes
   - Customize the look and feel
   - Perfect for social media posts

3. **Export and Share**
   - High-quality image export
   - Optimized for social platforms
   - Multiple theme options

### 💡 Pro Tips

> "Good documentation is like a love letter to your future self" - Damian Conway

Try this example code block:
\`\`\`markdown
# Your Title
## Subtitle
- List item 1
- List item 2

> Important quote
\`\`\`

### 🎨 Theme Gallery

- **Light**: Professional and clean
- **Warm**: Soft and engaging
- **Elegant**: Modern and stylish
- **Dark**: Easy on the eyes

Ready to transform your Markdown into beautiful images? Start creating now!`);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('warm');
  const previewRef = useRef(null);

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    try {
      setLoading(true);
      
      const previewElement = previewRef.current;
      const contentHeight = previewElement.scrollHeight;
      const contentWidth = previewElement.scrollWidth;
      
      // 临时添加导出专用样式
      const blockquotes = previewElement.querySelectorAll('.wmde-markdown blockquote');
      const originalBlockquoteStyles = [];
      
      // 保存文档中的所有元素原始样式
      const allElements = previewElement.querySelectorAll('*');
      const originalComputedStyles = new Map();
      
      // 创建一个临时样式表，专门处理emoji
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.textContent = `
        /* 全局emoji样式重置 */
        .emoji, 
        span.emoji,
        img.emoji,
        [data-emoji],
        .wmde-markdown h1 .emoji,
        .wmde-markdown h2 .emoji,
        .wmde-markdown h3 .emoji,
        .wmde-markdown p .emoji,
        .wmde-markdown li .emoji,
        .wmde-markdown blockquote .emoji,
        .wmde-markdown strong .emoji,
        .wmde-markdown em .emoji {
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif !important;
          color: initial !important;
          -webkit-text-fill-color: initial !important;
          background: none !important;
          text-shadow: none !important;
          filter: none !important;
          font-style: normal !important;
          opacity: 1 !important;
        }
        
        /* 强制使用原生emoji字体渲染 */
        @font-face {
          font-family: 'EmojiFont';
          src: local('Apple Color Emoji'), local('Segoe UI Emoji'), local('Segoe UI Symbol');
          unicode-range: U+1F300-1F6FF, U+1F900-1F9FF, U+2600-26FF, U+2700-27BF;
        }
        
        /* 应用emoji字体到所有可能包含emoji的元素 */
        body .wmde-markdown * {
          font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'EmojiFont', sans-serif;
        }
      `;
      document.head.appendChild(styleSheet);
      
      // 处理所有emoji元素 - 更精确的模式匹配
      const emojiPattern = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      const markdownElements = previewElement.querySelectorAll('.wmde-markdown *');
      
      // 更系统地处理emoji
      markdownElements.forEach(el => {
        if (el.textContent && emojiPattern.test(el.textContent)) {
          // 保存原始状态
          originalComputedStyles.set(el, {
            html: el.innerHTML,
            color: el.style.color,
            webkitTextFillColor: el.style.webkitTextFillColor,
            fontFamily: el.style.fontFamily
          });
          
          // 对于标题，需要特殊处理
          if (theme === 'gradient' && (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3')) {
            // 使用更可靠的方法包装emoji
            el.innerHTML = el.innerHTML.replace(emojiPattern, match => 
              `<span class="emoji" data-emoji="true" style="color:initial !important;-webkit-text-fill-color:initial !important;background:none !important;">${match}</span>`
            );
          }
          
          // 确保元素使用正确的字体
          el.style.fontFamily = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif";
        }
      });
      
      // 为解决emoji和图标问题，确保字体和颜色渲染正确
      const htmlToImageOptions = {
        quality: 1.0,
        backgroundColor: theme === 'gradient' ? '#f5f7fa' : themes[theme].background,
        width: contentWidth * 2,
        height: contentHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${contentWidth}px`,
          height: `${contentHeight}px`
        },
        pixelRatio: 2,
        fontEmbedCSS: true, // 尝试嵌入字体，以保持一致性
        skipFonts: false, // 不跳过字体处理
        fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"
      };
      
      // 处理引用块
      blockquotes.forEach(blockquote => {
        // 保存更多原始样式属性
        originalBlockquoteStyles.push({
          background: blockquote.style.background,
          borderLeft: blockquote.style.borderLeft,
          borderImage: blockquote.style.borderImage,
          borderImageSlice: blockquote.style.borderImageSlice,
          backdropFilter: blockquote.style.backdropFilter,
          boxShadow: blockquote.style.boxShadow
        });
        
        // 根据当前主题设置实色背景和边框
        if (theme === 'gradient') {
          blockquote.style.background = '#f1f5f9';
          blockquote.style.borderLeft = '3px solid #6366f1';
          blockquote.style.borderImage = 'none';
          blockquote.style.backdropFilter = 'none';
          blockquote.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
        } else if (theme === 'dark') {
          blockquote.style.background = '#2d3748';
          blockquote.style.borderLeft = '3px solid #60a5fa';
        } else if (theme === 'warm') {
          blockquote.style.background = '#fff5eb';
          blockquote.style.borderLeft = '3px solid #dd6b20';
        } else if (theme === 'elegant') {
          blockquote.style.background = '#f1f5f9';
          blockquote.style.borderLeft = '3px solid #4f46e5';
        } else if (theme === 'nature') {
          blockquote.style.background = '#e6f2ec';
          blockquote.style.borderLeft = '3px solid #2d6a4f';
        } else if (theme === 'sunset') {
          blockquote.style.background = '#fef2ed';
          blockquote.style.borderLeft = '3px solid #e85d75';
        } else if (theme === 'ocean') {
          blockquote.style.background = '#edf3fc';
          blockquote.style.borderLeft = '3px solid #1e88e5';
        } else if (theme === 'mint') {
          blockquote.style.background = '#e8f7f5';
          blockquote.style.borderLeft = '3px solid #14b8a6';
        } else { // light 主题
          blockquote.style.background = '#f8f9fa';
          blockquote.style.borderLeft = '3px solid #3182ce';
        }
      });
      
      const dataUrl = await htmlToImage.toPng(previewRef.current, htmlToImageOptions);
      
      // 删除临时样式表
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
      
      // 恢复原样式
      blockquotes.forEach((blockquote, index) => {
        blockquote.style.background = originalBlockquoteStyles[index].background;
        blockquote.style.borderLeft = originalBlockquoteStyles[index].borderLeft;
        blockquote.style.borderImage = originalBlockquoteStyles[index].borderImage;
        blockquote.style.borderImageSlice = originalBlockquoteStyles[index].borderImageSlice;
        blockquote.style.backdropFilter = originalBlockquoteStyles[index].backdropFilter;
        blockquote.style.boxShadow = originalBlockquoteStyles[index].boxShadow;
      });
      
      // 恢复所有元素的原始样式和内容
      markdownElements.forEach(el => {
        if (originalComputedStyles.has(el)) {
          const origStyle = originalComputedStyles.get(el);
          
          // 恢复HTML
          if (origStyle.html) {
            el.innerHTML = origStyle.html;
          }
          
          // 恢复样式属性
          if (origStyle.color) el.style.color = origStyle.color;
          if (origStyle.webkitTextFillColor) el.style.webkitTextFillColor = origStyle.webkitTextFillColor;
          if (origStyle.fontFamily) el.style.fontFamily = origStyle.fontFamily;
        }
      });
      
      const link = document.createElement('a');
      link.download = 'markdown-export.png';
      link.href = dataUrl;
      link.click();
      
      message.success('Export successful!');
    } catch (err) {
      message.error('Export failed, please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isAppRoute ? (
        <AppContainer>
          <Analytics />
          
          <Logo>
            <LogoIcon>
              md<LogoArrow>➚</LogoArrow>
            </LogoIcon>
            <LogoText>md2image</LogoText>
          </Logo>
          
          <ControlGroup>
            <Radio.Group
              value={theme}
              onChange={e => setTheme(e.target.value)}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="warm">Warm</Radio.Button>
              <Radio.Button value="elegant">Elegant</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="gradient">Gradient</Radio.Button>
              <Radio.Button value="nature">Nature</Radio.Button>
              <Radio.Button value="sunset">Sunset</Radio.Button>
              <Radio.Button value="ocean">Ocean</Radio.Button>
              <Radio.Button value="mint">Mint</Radio.Button>
            </Radio.Group>

            <StyledButton 
              type="primary" 
              icon={<CameraOutlined />}
              onClick={handleExport}
              loading={loading}
              size="large"
            >
              Export Image
            </StyledButton>
          </ControlGroup>

          <ContentLayout>
            <EditorSection>
              <EditorContainer>
                <MDEditor
                  value={value}
                  onChange={setValue}
                  preview="edit"
                  hideToolbar={false}
                  enableScroll={true}
                  textareaProps={{
                    placeholder: 'Enter your Markdown content here...',
                    style: {
                      fontSize: '15px',
                      lineHeight: '1.8',
                      color: '#2c3e50',
                      background: '#ffffff'
                    }
                  }}
                  visibleDragbar={false}
                  toolbarCommands={[
                    ['bold', 'italic', 'strikethrough'],
                    ['quote', 'unordered-list', 'ordered-list'],
                    ['link', 'image']
                  ]}
                  previewOptions={{
                    style: {
                      color: '#2c3e50',
                      background: '#ffffff'
                    }
                  }}
                  style={{
                    color: '#2c3e50',
                    background: '#ffffff'
                  }}
                />
              </EditorContainer>
            </EditorSection>

            <PreviewSection>
              <Spin spinning={loading}>
                <PreviewContainer 
                  ref={previewRef} 
                  {...themes[theme]}
                  theme={theme}
                >
                  <MDEditor.Markdown 
                    source={value} 
                    rehypePlugins={[[rehypePrism, { showLineNumbers: true }]]}
                  />
                </PreviewContainer>
              </Spin>
            </PreviewSection>
          </ContentLayout>

          {/* AdSense广告单元 */}
          <AdBanner>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-9798575917692871"
                 data-ad-slot="YOUR_AD_SLOT_ID"
                 data-ad-format="auto"
                 data-full-width-responsive="true" />
          </AdBanner>

          <Copyright>
            © {new Date().getFullYear()} md2image. All rights reserved. Made with ❤️
          </Copyright>
          
          {/* 初始化广告 */}
          <script dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `
          }} />
        </AppContainer>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" tip="Redirecting to landing page..." />
        </div>
      )}
    </>
  );
}

export default App;
