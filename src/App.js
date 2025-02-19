import React, { useState, useRef } from 'react';
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
    : '0 8px 32px rgba(0, 0, 0, 0.08)'};
  max-width: 720px;
  margin: 0 auto;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
    background: linear-gradient(90deg, #2b4c7d, #567bbd);
  }

  .wmde-markdown {
    font-size: 15px;
    line-height: 1.8;
    color: ${props => props.textColor};
    background: ${props => props.background};
  }

  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3 {
    font-weight: 700;
    line-height: 1.4;
    margin: 1.2em 0 0.8em;
    letter-spacing: -0.01em;
    color: ${props => props.titleColor};
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
  }

  .wmde-markdown blockquote {
    border: none;
    padding: 1em 1.2em;
    margin: 1.2em 0;
    background: ${props => props.blockquoteBackground};
    border-radius: 8px;
    position: relative;
    color: ${props => props.blockquoteColor};
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

function App() {
  const [value, setValue] = useState(`# AIer - Markdown to Image Converter 📝

Welcome to AIer, your professional tool for converting Markdown to beautiful images!

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

## 🎯 How to Use AIer

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
      
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 1.0,
        backgroundColor: themes[theme].background,
        width: contentWidth * 2,
        height: contentHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${contentWidth}px`,
          height: `${contentHeight}px`
        },
        pixelRatio: 2
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
    <AppContainer>
      <Analytics />
      <Title>AIer - Elegant Markdown to Image Converter</Title>
      
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

      <Copyright>
        © {new Date().getFullYear()} AIer. All rights reserved. Made with ❤️
      </Copyright>
    </AppContainer>
  );
}

export default App;
