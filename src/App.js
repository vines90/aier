import React, { useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styled from 'styled-components';
import { Button, message, Spin, Select, Radio } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import * as htmlToImage from 'html-to-image';
import rehypePrism from 'rehype-prism-plus';

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 40px;
  font-size: 2.4em;
  font-weight: 800;
  background: linear-gradient(120deg, #2b4c7d, #567bbd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
`;

const EditorSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewSection = styled.div`
  flex: 1;
  min-width: 0;
  position: sticky;
  top: 20px;
  height: fit-content;
`;

const EditorContainer = styled.div`
  .w-md-editor {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: none;
    background: #ffffff;
    height: calc(100vh - 250px) !important;
    color: #2c3e50 !important;
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
`;

const ControlGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 35px;
  
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
  }
};

function App() {
  const [value, setValue] = useState(`### 探索无限可能

这是一个将 Markdown 转换为精美图片的工具，让你的分享更具创意和格调。

- 多种主题风格，随心切换
- 优雅的排版设计
- 完美适配小红书

> 用优雅的方式，记录美好生活

\`\`\`js
const life = new Journey();
life.setStyle('elegant');
life.start();
\`\`\`

祝你创作愉快！`);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('elegant');
  const previewRef = useRef(null);

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    try {
      setLoading(true);
      
      // 获取预览容器的实际高度
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
      
      message.success('图片导出成功！');
    } catch (err) {
      message.error('导出失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Title>AIer - 优雅的图片创作工具</Title>
      
      <ControlGroup>
        <Radio.Group
          value={theme}
          onChange={e => setTheme(e.target.value)}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="light">明亮</Radio.Button>
          <Radio.Button value="warm">温暖</Radio.Button>
          <Radio.Button value="elegant">优雅</Radio.Button>
          <Radio.Button value="dark">暗黑</Radio.Button>
        </Radio.Group>

        <StyledButton 
          type="primary" 
          icon={<CameraOutlined />}
          onClick={handleExport}
          loading={loading}
          size="large"
        >
          导出图片
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
                placeholder: '在这里输入 Markdown 内容...',
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
    </AppContainer>
  );
}

export default App;
