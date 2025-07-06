import React, { useState, useRef, useEffect, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import styled from 'styled-components';
import { Button, message, Spin, Radio, InputNumber, Input, ColorPicker, Select, Slider, Switch, Tabs, Collapse } from 'antd';
import { CameraOutlined, BookOutlined, PictureOutlined, DragOutlined, ExpandOutlined, ScissorOutlined, DeleteOutlined } from '@ant-design/icons';
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

// const Title = styled.h1`
//   text-align: center;
//   color: #1a1a1a;
//   margin-bottom: 10px;
//   font-size: 2.4em;
//   font-weight: 800;
//   background: linear-gradient(120deg, #2b4c7d, #567bbd);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   
//   @media (max-width: 768px) {
//     font-size: 1.8em;
//   }
// `;

// const AuthorInfo = styled.div`
//   text-align: center;
//   margin-bottom: 40px;
//   color: #64748b;
//   font-size: 0.95em;
//   
//   a {
//     color: #2563eb;
//     text-decoration: none;
//     margin-left: 4px;
//     
//     &:hover {
//       text-decoration: underline;
//     }
//   }
// `;

const Copyright = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #64748b;
  font-size: 0.9em;
  margin-top: 40px;
  border-top: 1px solid #e2e8f0;
`;

// Cover maker related styles
const CoverMaker = styled.div`
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CoverInput = styled.div`
  margin-bottom: 20px;
  
  .ant-input, .ant-select {
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    border: 2px solid #e2e8f0;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #2563eb;
    }
    
    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
  
  .ant-input {
    background: #ffffff;
    color: #2c3e50;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }
`;

const CoverPreview = styled.div`
  width: ${props => props.width || 400}px;
  height: ${props => props.height || 533}px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  position: relative;
  
  background: ${props => {
    if (props.backgroundType === 'gradient') {
      return `linear-gradient(135deg, ${props.bg1}, ${props.bg2})`;
    }
    return props.bg1;
  }};
  
  @media (max-width: 768px) {
    width: 100%;
    height: ${props => Math.min(props.height || 533, 400)}px;
    max-height: 80vh;
  }
`;

// Cut line component
const CutLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #ef4444 0px,
    #ef4444 10px,
    transparent 10px,
    transparent 20px
  );
  cursor: pointer;
  z-index: 100;
  
  &::before {
    content: '✂️ Cut #${props => props.index + 1}';
    position: absolute;
    right: 10px;
    top: -25px;
    background: #ef4444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: -2px;
    right: 0;
    height: 7px;
    background: transparent;
  }
  
  &:hover {
    background: repeating-linear-gradient(
      90deg,
      #dc2626 0px,
      #dc2626 10px,
      transparent 10px,
      transparent 20px
    );
    
    &::before {
      background: #dc2626;
      transform: scale(1.1);
    }
  }
`;

// Draggable component wrapper
const DraggableElement = styled.div`
  position: absolute;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  z-index: ${props => props.isDragging ? 1000 : 1};
  transform: ${props => props.isDragging ? 'scale(1.02)' : 'scale(1)'};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    
    .drag-handle {
      opacity: 1;
    }
  }
  
  .drag-handle {
    position: absolute;
    top: -8px;
    left: -8px;
    width: 16px;
    height: 16px;
    background: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: grab;
  }
  
  &.dragging .drag-handle {
    cursor: grabbing;
  }
`;

const CoverTitle = styled.h1`
  font-size: ${props => props.titleSize || 2.5}rem;
  font-weight: 800;
  color: ${props => props.titleColor || '#2c3e50'};
  font-family: ${props => props.titleFont || 'PingFang SC'};
  margin: 0;
  line-height: 1.2;
  word-wrap: break-word;
  text-align: center;
  max-width: 320px;
  
  @media (max-width: 768px) {
    font-size: ${props => (props.titleSize || 2.5) * 0.8}rem;
    max-width: 280px;
  }
`;

const CoverSubtitle = styled.h2`
  font-size: ${props => props.subtitleSize || 1.2}rem;
  font-weight: 400;
  color: ${props => props.subtitleColor || '#64748b'};
  font-family: ${props => props.subtitleFont || 'PingFang SC'};
  margin: 0;
  line-height: 1.4;
  word-wrap: break-word;
  text-align: center;
  max-width: 320px;
  
  @media (max-width: 768px) {
    font-size: ${props => (props.subtitleSize || 1.2) * 0.9}rem;
    max-width: 280px;
  }
`;

const CoverAuthor = styled.div`
  font-size: ${props => props.authorSize || 1}rem;
  color: ${props => props.authorColor || '#94a3b8'};
  font-family: ${props => props.authorFont || 'PingFang SC'};
  margin: 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: ${props => (props.authorSize || 1) * 0.9}rem;
  }
`;

const CoverMarkdown = styled.div`
  font-size: ${props => props.fontSize || 0.9}rem;
  color: ${props => props.textColor || '#4a5568'};
  font-family: ${props => props.fontFamily || 'PingFang SC'};
  line-height: 1.6;
  max-width: 320px;
  background: ${props => props.bgColor || 'rgba(255, 255, 255, 0.9)'};
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  
  .wmde-markdown {
    background: transparent !important;
    color: inherit !important;
    font-size: inherit !important;
    
    * {
      color: inherit !important;
      font-size: inherit !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin: 8px 0 4px 0;
      font-weight: 600;
    }
    
    p {
      margin: 4px 0;
    }
    
    ul, ol {
      margin: 4px 0;
      padding-left: 20px;
    }
    
    li {
      margin: 2px 0;
    }
    
    blockquote {
      margin: 8px 0;
      padding: 8px 12px;
      border-left: 3px solid #e2e8f0;
      background: rgba(0, 0, 0, 0.05);
    }
    
    code {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 4px;
      border-radius: 3px;
    }
  }
  
  @media (max-width: 768px) {
    font-size: ${props => (props.fontSize || 0.9) * 0.9}rem;
    max-width: 280px;
    padding: 12px;
  }
`;

const ValueProposition = styled.div`
  text-align: center;
  margin: 20px 0 40px 0;
  color: #667eea;
  font-size: 18px;
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.8px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
    margin: 15px 0 30px 0;
    letter-spacing: 0.5px;
  }
`;


const ModeToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  
  .ant-radio-group {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 4px;
    
    .ant-radio-button-wrapper {
      border: none;
      background: transparent;
      height: 44px;
      line-height: 44px;
      font-weight: 600;
      border-radius: 8px;
      
      &:hover {
        color: #2563eb;
      }
      
      &.ant-radio-button-wrapper-checked {
        background: #ffffff;
        color: #2563eb;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
      }
    }
  }
`;

const CoverSettings = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  
  .setting-group {
    margin-bottom: 24px;
    
    .group-title {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 16px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .setting-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      
      .setting-item {
        flex: 1;
        
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #4b5563;
          font-size: 13px;
        }
        
        .ant-input-number,
        .ant-select,
        .ant-color-picker-trigger {
          width: 100%;
          border-radius: 6px;
        }
        
        .ant-slider {
          margin: 8px 0;
        }
      }
    }
  }
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
  position: relative;
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
  
      /* Fix all text colors in the editor */
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
  
      /* Additional style fixes */
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
  
      /* Ensure editor toolbar buttons are visible */
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
  background: ${props =>
    props.backgroundType === 'gradient'
      ? `linear-gradient(135deg, ${props.bg1}, ${props.bg2})`
      : props.bg1};
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
    font-size: ${props => props.bodyFontSize}px;
    line-height: 1.8;
    color: ${props => props.bodyColor};
    font-family: ${props => props.bodyFontFamily};
    background: transparent;
  }

  /* 确保所有emoji正确显示 */
  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3,
  .wmde-markdown p,
  .wmde-markdown li,
  .wmde-markdown blockquote {
    font-family: ${props => props.bodyFontFamily};
  }

  /* 允许emoji显示彩色 */
  .wmde-markdown p,
  .wmde-markdown li,
  .wmde-markdown blockquote {
    color: ${props => props.bodyColor};
    -webkit-text-fill-color: ${props => props.bodyColor};
    
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
    color: ${props => props.headingColor};
    font-family: ${props => props.headingFontFamily};
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
    font-size: ${props => props.h1Size}em;
    border-bottom: 2px solid ${props => props.borderColor};
    padding-bottom: 0.3em;
  }

  .wmde-markdown h2 {
    font-size: ${props => props.h2Size}em;
    border-bottom: 1px solid ${props => props.borderColor};
    padding-bottom: 0.3em;
  }

  .wmde-markdown h3 {
    font-size: ${props => props.h3Size}em;
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

  /* 行内代码样式 */
  .wmde-markdown :not(pre) > code {
    background: ${props => props.inlineCodeBgColor} !important;
    color: ${props => props.inlineCodeTextColor} !important;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: ${props => props.codeBlockFontFamily} !important;
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

  /* 代码块样式 */
  .wmde-markdown pre {
    background: ${props => props.codeBlockBgColor} !important;
    border-radius: 8px;
    padding: 1.2em;
    margin: 1.2em 0;
    overflow-x: auto;
    border: 1px solid ${props => props.tableBorderColor};
  }

  .wmde-markdown pre code {
    color: ${props => props.codeBlockTextColor} !important;
    background: none !important;
    padding: 0;
    font-size: ${props => props.codeBlockFontSize}px !important;
    line-height: 1.6;
    font-family: ${props => props.codeBlockFontFamily} !important;
  }

  /* 表格样式 */
  .wmde-markdown table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 1.2em 0;
    font-size: ${props => props.tableFontSize}px !important;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .wmde-markdown table th {
    background-color: ${props => props.tableHeaderBgColor} !important;
    color: ${props => props.tableHeaderTextColor} !important;
    font-weight: 600;
    padding: 12px 16px;
    text-align: left;
    border-bottom: 2px solid ${props => props.tableBorderColor} !important;
    border-right: 1px solid ${props => props.tableBorderColor} !important;
  }

  .wmde-markdown table th:last-child {
    border-right: none !important;
  }

  .wmde-markdown table td {
    background-color: ${props => props.tableCellBgColor} !important;
    color: ${props => props.tableCellTextColor} !important;
    padding: 12px 16px;
    border-bottom: 1px solid ${props => props.tableBorderColor} !important;
    border-right: 1px solid ${props => props.tableBorderColor} !important;
  }

  .wmde-markdown table td:last-child {
    border-right: none !important;
  }

  .wmde-markdown table tr:last-child td {
    border-bottom: none !important;
  }

  .wmde-markdown table tr:nth-child(even) td {
    background-color: ${props => props.tableCellBgColor === '#ffffff' ? '#f9fafb' : props.tableCellBgColor} !important;
  }

  .wmde-markdown table tr:hover td {
    background-color: ${props => props.tableCellBgColor === '#ffffff' ? '#f3f4f6' : props.tableCellBgColor} !important;
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

// const ButtonGroup = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 16px;
//   margin: 35px 0;
// `;

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

const SettingsPanel = styled.div`
  max-width: 720px;
  margin: 0 auto 30px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .ant-tabs {
    margin-bottom: 0;
  }

  .ant-tabs-tab {
    padding: 8px 16px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }

  .ant-tabs-content-holder {
    padding-top: 16px;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    align-items: end;
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;

    span {
      font-weight: 500;
      color: #4b5563;
      font-size: 13px;
      white-space: nowrap;
    }

    .ant-input-number,
    .ant-color-picker-trigger,
    .ant-select {
      width: 100%;
      border-radius: 6px;
    }
  }

  .ant-collapse {
    margin-top: 12px;
    border: 1px solid #e5e7eb;
    
    .ant-collapse-item {
      border-bottom: none;
    }
    
    .ant-collapse-header {
      padding: 8px 12px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
    }
    
    .ant-collapse-content-box {
      padding: 12px !important;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    
    .setting-row {
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .ant-tabs-tab {
      padding: 6px 10px !important;
      font-size: 12px !important;
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
  },
  tiffany: {
    background: '#f0fffe',
    textColor: '#1e3a3a',
    titleColor: '#0d2626',
    borderColor: '#b3e5e0',
    blockquoteBackground: '#e6f9f7',
    blockquoteColor: '#2d5555',
    codeBackground: '#e6f9f7',
    codeColor: '#0891b2',
    preBackground: '#e6f9f7',
    preCodeColor: '#1e3a3a',
    accentColor: '#06b6d4'
  }
};

// AdSense广告组件
const AdBanner = styled.div`
  margin: 80px 0;
  text-align: center;
  min-height: 90px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    margin: 60px 0;
    padding: 15px;
  }
`;

function App() {
  const [isAppRoute, setIsAppRoute] = useState(false);
  const [mode, setMode] = useState('markdown'); // 'markdown' or 'cover'
  
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
\`\`\`javascript
function generateImage(markdown) {
  const parser = new MarkdownParser();
  const ast = parser.parse(markdown);
  return renderer.toImage(ast);
}

// Usage example
const result = generateImage('# Hello World');
console.log('Image generated successfully!');
\`\`\`

You can also use inline code like \`npm install\` or \`const value = 42\`.

### 📊 Data Table Example

| Feature | Light | Dark | Warm | Elegant |
|---------|-------|------|------|---------|
| Background | White | Dark Gray | Warm Beige | Clean Gray |
| Text Color | Dark | Light | Brown | Charcoal |
| Code Blocks | Gray BG | Dark Blue | Warm Tan | Light Blue |
| Tables | Clean | High Contrast | Warm Tones | Minimal |
| Best For | Documentation | Night Reading | Blogs | Professional |

### 🎨 Theme Gallery

- **Light**: Professional and clean
- **Warm**: Soft and engaging  
- **Elegant**: Modern and stylish
- **Dark**: Easy on the eyes

Ready to transform your Markdown into beautiful images? Start creating now!`);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('warm');
  const [h1Size, setH1Size] = useState(1.8);
  const [h2Size, setH2Size] = useState(1.5);
  const [h3Size, setH3Size] = useState(1.25);
  const [headingColor, setHeadingColor] = useState(themes['warm'].titleColor);
  const [headingFontFamily, setHeadingFontFamily] = useState('PingFang SC');
  const [bodyColor, setBodyColor] = useState(themes['warm'].textColor);
  const [bodyFontSize, setBodyFontSize] = useState(15);
  const [bodyFontFamily, setBodyFontFamily] = useState('PingFang SC');
  const [bgColor1, setBgColor1] = useState('#fffaf5');
  const [bgColor2, setBgColor2] = useState('#fffaf5');
  
  // Code block and table styling
  const [codeBlockFontSize, setCodeBlockFontSize] = useState(14);
  const [codeBlockFontFamily, setCodeBlockFontFamily] = useState('JetBrains Mono');
  const [codeBlockBgColor, setCodeBlockBgColor] = useState('#f8f9fa');
  const [codeBlockTextColor, setCodeBlockTextColor] = useState('#2c3e50');
  const [inlineCodeBgColor, setInlineCodeBgColor] = useState('#f1f5f9');
  const [inlineCodeTextColor, setInlineCodeTextColor] = useState('#e11d48');
  const [tableBorderColor, setTableBorderColor] = useState('#e5e7eb');
  const [tableHeaderBgColor, setTableHeaderBgColor] = useState('#f9fafb');
  const [tableHeaderTextColor, setTableHeaderTextColor] = useState('#374151');
  const [tableCellBgColor, setTableCellBgColor] = useState('#ffffff');
  const [tableCellTextColor, setTableCellTextColor] = useState('#6b7280');
  const [tableFontSize, setTableFontSize] = useState(14);
  
  const previewRef = useRef(null);
  const coverPreviewRef = useRef(null);
  
  // Cover maker state - default to RedBook style
  const [coverTitle, setCoverTitle] = useState('Daily Sharing ✨');
  const [coverSubtitle, setCoverSubtitle] = useState('Worth Collecting Recommendations');
  const [coverAuthor, setCoverAuthor] = useState('@your_name');
  const [coverTitleSize, setCoverTitleSize] = useState(2.2);
  const [coverSubtitleSize, setCoverSubtitleSize] = useState(1.1);
  const [coverAuthorSize, setCoverAuthorSize] = useState(1);
  const [coverTitleColor, setCoverTitleColor] = useState('#2c3e50');
  const [coverSubtitleColor, setCoverSubtitleColor] = useState('#64748b');
  const [coverAuthorColor, setCoverAuthorColor] = useState('#94a3b8');
  const [coverTitleFont, setCoverTitleFont] = useState('PingFang SC');
  const [coverSubtitleFont, setCoverSubtitleFont] = useState('PingFang SC');
  const [coverAuthorFont, setCoverAuthorFont] = useState('PingFang SC');
  const [coverBgColor1, setCoverBgColor1] = useState('#ffeaa7');
  const [coverBgColor2, setCoverBgColor2] = useState('#fab1a0');
  
  // Cover markdown content and display settings
  const [coverMarkdownContent, setCoverMarkdownContent] = useState('# Featured Content 📖\n\n- Practical Tips Sharing\n- Deep Thinking\n- Life Insights\n\n> Content Worth Collecting');
  const [showMarkdown, setShowMarkdown] = useState(true);
  const [coverMarkdownFontSize, setCoverMarkdownFontSize] = useState(0.9);
  const [coverMarkdownColor, setCoverMarkdownColor] = useState('#4a5568');
  const [coverMarkdownBgColor, setCoverMarkdownBgColor] = useState('rgba(255, 255, 255, 0.9)');
  
  // Cover size ratio settings
  const [coverSizeRatio, setCoverSizeRatio] = useState('3:4');
  
  // Manual cutting tool settings
  const [isCuttingMode, setIsCuttingMode] = useState(false);
  const [cutLines, setCutLines] = useState([]);
  const [showCutLines, setShowCutLines] = useState(false);
  
  // Position states of each component
  const [elementPositions, setElementPositions] = useState({
    title: { x: 90, y: 80 },
    subtitle: { x: 90, y: 150 },
    author: { x: 280, y: 480 },
    markdown: { x: 40, y: 220 }
  });
  
  // Drag state
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragElement: null,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0
  });
  
  // Font options for selection
  const fontOptions = useMemo(() => [
    { value: 'PingFang SC', label: 'PingFang SC (苹方)', category: 'System Fonts' },
    { value: 'Arial', label: 'Arial', category: 'System Fonts' },
    { value: 'Helvetica', label: 'Helvetica', category: 'System Fonts' },
    { value: 'Times New Roman', label: 'Times New Roman', category: 'System Fonts' },
    { value: 'Georgia', label: 'Georgia', category: 'System Fonts' },
    { value: 'Verdana', label: 'Verdana', category: 'System Fonts' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'System Fonts' },
    { value: 'Tahoma', label: 'Tahoma', category: 'System Fonts' },
    { value: 'Monaco', label: 'Monaco', category: 'Monospace' },
    { value: 'Consolas', label: 'Consolas', category: 'Monospace' },
    { value: 'Courier New', label: 'Courier New', category: 'Monospace' },
    { value: 'SF Pro Display', label: 'SF Pro Display', category: 'Modern' },
    { value: 'SF Pro Text', label: 'SF Pro Text', category: 'Modern' },
    { value: 'Inter', label: 'Inter', category: 'Modern' },
    { value: 'Roboto', label: 'Roboto', category: 'Modern' },
    { value: 'Lato', label: 'Lato', category: 'Modern' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Modern' },
    { value: 'Open Sans', label: 'Open Sans', category: 'Modern' },
    { value: 'Microsoft YaHei', label: 'Microsoft YaHei (微软雅黑)', category: 'Chinese' },
    { value: 'SimHei', label: 'SimHei (黑体)', category: 'Chinese' },
    { value: 'SimSun', label: 'SimSun (宋体)', category: 'Chinese' },
    { value: 'STHeiti', label: 'STHeiti (华文黑体)', category: 'Chinese' },
    { value: 'STSong', label: 'STSong (华文宋体)', category: 'Chinese' },
    { value: 'Noto Sans CJK SC', label: 'Noto Sans CJK SC', category: 'Chinese' },
    { value: 'Source Han Sans SC', label: 'Source Han Sans SC (思源黑体)', category: 'Chinese' },
    { value: 'Source Han Serif SC', label: 'Source Han Serif SC (思源宋体)', category: 'Chinese' }
  ], []);

  // Cover size ratio presets
  const coverSizeRatios = useMemo(() => ({
    '3:4': {
      name: 'RedBook (3:4)',
      width: 400,
      height: 533,
      description: 'Perfect for RedBook/Instagram'
    },
    '1:1': {
      name: 'Square (1:1)',
      width: 400,
      height: 400,
      description: 'Instagram posts, profile images'
    },
    '16:9': {
      name: 'Landscape (16:9)',
      width: 400,
      height: 225,
      description: 'YouTube thumbnails, presentations'
    },
    '9:16': {
      name: 'Story (9:16)',
      width: 400,
      height: 711,
      description: 'Instagram/Facebook stories'
    },
    '4:5': {
      name: 'Portrait (4:5)',
      width: 400,
      height: 500,
      description: 'Instagram feed posts'
    }
  }), []);
  
  // Cover template presets
  const coverTemplates = {
    xiaohongshu: {
      name: 'RedBook Style',
      titleSize: 2.2,
      subtitleSize: 1.1,
      titleColor: '#2c3e50',
      subtitleColor: '#64748b',
      bgColor1: '#ffeaa7',
      bgColor2: '#fab1a0',
      sampleTitle: 'Daily Sharing ✨',
      sampleSubtitle: 'Worth Collecting Recommendations'
    },
    business: {
      name: 'Business Minimal',
      titleSize: 2.5,
      subtitleSize: 1.0,
      titleColor: '#1a202c',
      subtitleColor: '#718096',
      bgColor1: '#ffffff',
      bgColor2: '#f7fafc',
      sampleTitle: 'Professional Content',
      sampleSubtitle: 'In-depth Analysis | Practical Tips'
    },
    creative: {
      name: 'Creative Design',
      titleSize: 2.8,
      subtitleSize: 1.3,
      titleColor: '#6b46c1',
      subtitleColor: '#8b5cf6',
      bgColor1: '#f3e8ff',
      bgColor2: '#e9d5ff',
      sampleTitle: 'Creative Inspiration 🎨',
      sampleSubtitle: 'Design Thinking · Aesthetic Sharing'
    },
    nature: {
      name: 'Fresh Nature',
      titleSize: 2.3,
      subtitleSize: 1.1,
      titleColor: '#047857',
      subtitleColor: '#059669',
      bgColor1: '#ecfdf5',
      bgColor2: '#d1fae5',
      sampleTitle: 'Natural Living 🌿',
      sampleSubtitle: 'Back to Basics · Simple Beauty'
    }
  };
  
  const applyTemplate = (templateKey) => {
    const template = coverTemplates[templateKey];
    if (template) {
      setCoverTitleSize(template.titleSize);
      setCoverSubtitleSize(template.subtitleSize);
      setCoverTitleColor(template.titleColor);
      setCoverSubtitleColor(template.subtitleColor);
      setCoverBgColor1(template.bgColor1);
      setCoverBgColor2(template.bgColor2);
      setCoverTitle(template.sampleTitle);
      setCoverSubtitle(template.sampleSubtitle);
      
      // Reset font settings
      setCoverTitleFont('PingFang SC');
      setCoverSubtitleFont('PingFang SC');
      setCoverAuthorFont('PingFang SC');
      
      // Reset author color and size
      setCoverAuthorColor('#94a3b8');
      setCoverAuthorSize(1);
    }
  };
  
  // Handle size ratio change
  const handleSizeRatioChange = (newRatio) => {
    setCoverSizeRatio(newRatio);
    
    // Adjust element positions based on new size ratio
    const ratio = coverSizeRatios[newRatio];
    if (ratio) {
      const heightRatio = ratio.height / 533; // 533 is the original 3:4 height
      const widthRatio = ratio.width / 400; // 400 is the original width
      
      // Adjust positions proportionally
      setElementPositions(prev => {
        const newPositions = {};
        Object.keys(prev).forEach(key => {
          newPositions[key] = {
            x: Math.min(prev[key].x * widthRatio, ratio.width - 100), // Ensure within bounds
            y: Math.min(prev[key].y * heightRatio, ratio.height - 50) // Ensure within bounds
          };
        });
        return newPositions;
      });
    }
  };
  
  // Extract H1 title from markdown and sanitize for filename
  const extractH1Title = (markdown) => {
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : 'markdown-content';
    
    // Remove emoji and special characters, replace spaces with hyphens
    return title
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emoji
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase() || 'markdown-content';
  };
  
  // Add cut line
  const addCutLine = (y) => {
    setCutLines(prev => [...prev, y].sort((a, b) => a - b));
  };
  
  // Remove cut line
  const removeCutLine = (index) => {
    setCutLines(prev => prev.filter((_, i) => i !== index));
  };
  
  // Toggle cutting mode
  const toggleCuttingMode = () => {
    setIsCuttingMode(!isCuttingMode);
    setShowCutLines(!showCutLines);
    if (!isCuttingMode) {
      setCutLines([]);
    }
  };
  
  // Handle preview click to add cut line
  const handlePreviewClick = (e) => {
    if (!isCuttingMode) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    addCutLine(y);
  };
  
  // Drag handling functions
  const handleDragStart = (e, elementType) => {
    const rect = coverPreviewRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    setDragState({
      isDragging: true,
      dragElement: elementType,
      startX: startX,
      startY: startY,
      elementStartX: elementPositions[elementType].x,
      elementStartY: elementPositions[elementType].y
    });
    
    // Prevent text selection
    e.preventDefault();
  };
  

  
  // Reset layout
  const resetLayout = () => {
    const currentRatio = coverSizeRatios[coverSizeRatio];
    const heightRatio = currentRatio.height / 533; // 533 is the original 3:4 height
    const widthRatio = currentRatio.width / 400; // 400 is the original width
    
    setElementPositions({
      title: { x: 90 * widthRatio, y: 80 * heightRatio },
      subtitle: { x: 90 * widthRatio, y: 150 * heightRatio },
      author: { x: Math.min(280 * widthRatio, currentRatio.width - 100), y: Math.min(480 * heightRatio, currentRatio.height - 50) },
      markdown: { x: 40 * widthRatio, y: 220 * heightRatio }
    });
  };

  // Automatically update related settings when theme changes
  useEffect(() => {
    const currentTheme = themes[theme];
    if (currentTheme) {
      setHeadingColor(currentTheme.titleColor);
      setBodyColor(currentTheme.textColor);
      setBgColor1(currentTheme.background);
      setBgColor2(currentTheme.background);
      
      // Update code block and table colors based on theme
      if (theme === 'dark') {
        setCodeBlockBgColor('#1e293b');
        setCodeBlockTextColor('#e2e8f0');
        setInlineCodeBgColor('#374151');
        setInlineCodeTextColor('#f87171');
        setTableBorderColor('#374151');
        setTableHeaderBgColor('#1f2937');
        setTableHeaderTextColor('#f9fafb');
        setTableCellBgColor('#111827');
        setTableCellTextColor('#d1d5db');
      } else if (theme === 'warm') {
        setCodeBlockBgColor('#fef7f0');
        setCodeBlockTextColor('#92400e');
        setInlineCodeBgColor('#fde68a');
        setInlineCodeTextColor('#dc2626');
        setTableBorderColor('#fed7aa');
        setTableHeaderBgColor('#fef3c7');
        setTableHeaderTextColor('#92400e');
        setTableCellBgColor('#fffbeb');
        setTableCellTextColor('#a16207');
      } else if (theme === 'elegant') {
        setCodeBlockBgColor('#f8fafc');
        setCodeBlockTextColor('#475569');
        setInlineCodeBgColor('#e2e8f0');
        setInlineCodeTextColor('#be123c');
        setTableBorderColor('#cbd5e1');
        setTableHeaderBgColor('#f1f5f9');
        setTableHeaderTextColor('#334155');
        setTableCellBgColor('#ffffff');
        setTableCellTextColor('#64748b');
      } else {
        // Default/light theme
        setCodeBlockBgColor('#f8f9fa');
        setCodeBlockTextColor('#2c3e50');
        setInlineCodeBgColor('#f1f5f9');
        setInlineCodeTextColor('#e11d48');
        setTableBorderColor('#e5e7eb');
        setTableHeaderBgColor('#f9fafb');
        setTableHeaderTextColor('#374151');
        setTableCellBgColor('#ffffff');
        setTableCellTextColor('#6b7280');
      }
      
      // Also update cover maker colors
      setCoverTitleColor(currentTheme.titleColor);
      setCoverSubtitleColor(currentTheme.textColor);
      setCoverBgColor1(currentTheme.background);
      setCoverBgColor2(currentTheme.background);
    }
  }, [theme]);
  
  // Drag event listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState.isDragging || !coverPreviewRef.current) return;
      
      const rect = coverPreviewRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const deltaX = currentX - dragState.startX;
      const deltaY = currentY - dragState.startY;
      
      const currentRatio = coverSizeRatios[coverSizeRatio];
      const newX = Math.max(0, Math.min(currentRatio.width - 100, dragState.elementStartX + deltaX));
      const newY = Math.max(0, Math.min(currentRatio.height - 50, dragState.elementStartY + deltaY));
      
      setElementPositions(prev => ({
        ...prev,
        [dragState.dragElement]: {
          x: newX,
          y: newY
        }
      }));
    };
    
    const handleMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          dragElement: null,
          startX: 0,
          startY: 0,
          elementStartX: 0,
          elementStartY: 0
        });
      }
    };
    
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, coverSizeRatio, coverSizeRatios]);

  // Handle cut export - export multiple images
  const handleCutExport = async () => {
    const currentRef = previewRef.current;
    if (!currentRef) return;
    
    try {
      setLoading(true);
      
      const previewElement = currentRef;
      const contentHeight = previewElement.scrollHeight;
      const contentWidth = previewElement.scrollWidth;
      
      // Get base title
      const baseTitle = extractH1Title(value);
      
      // Define cut segments
      const segments = [];
      const sortedCutLines = [...cutLines].sort((a, b) => a - b);
      
      let startY = 0;
      sortedCutLines.forEach((cutY, index) => {
        segments.push({
          startY: startY,
          endY: cutY,
          filename: segments.length === 0 && sortedCutLines.length === 1 ? 
            `${baseTitle}-1.png` : 
            `${baseTitle}-${index + 1}.png`
        });
        startY = cutY;
      });
      
      // Add final segment
      if (startY < contentHeight) {
        segments.push({
          startY: startY,
          endY: contentHeight,
          filename: segments.length === 0 ? 
            `${baseTitle}.png` : 
            `${baseTitle}-${segments.length + 1}.png`
        });
      }
      
      // If no cut lines, export as single image
      if (cutLines.length === 0) {
        segments.push({
          startY: 0,
          endY: contentHeight,
          filename: `${baseTitle}.png`
        });
      }
      
      // Hide cut lines during export - directly manipulate DOM
      const cutLineElements = document.querySelectorAll('[data-cut-line]');
      const originalCutLineStyles = [];
      cutLineElements.forEach((line, index) => {
        originalCutLineStyles[index] = line.style.display;
        line.style.display = 'none';
      });
      
      // Also hide cutting mode instructions
      const cuttingInstructions = document.querySelector('[data-cutting-instructions]');
      let originalInstructionsDisplay = '';
      if (cuttingInstructions) {
        originalInstructionsDisplay = cuttingInstructions.style.display;
        cuttingInstructions.style.display = 'none';
      }
      
      // Temporarily remove cutting mode border from preview container
      const originalPreviewBorder = previewElement.style.border;
      const originalPreviewCursor = previewElement.style.cursor;
      previewElement.style.border = 'none';
      previewElement.style.cursor = 'default';
      
      // Small delay to ensure DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Export each segment
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentHeight = segment.endY - segment.startY;
        
        const dataUrl = await htmlToImage.toPng(previewElement, {
          cacheBust: true,
          backgroundColor: theme === 'gradient' ? '#f5f7fa' : themes[theme].background,
          width: contentWidth,
          height: segmentHeight,
          style: {
            transform: `translateY(-${segment.startY}px)`,
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            overflow: 'hidden'
          },
          quality: 0.95,
          pixelRatio: 2
        });
        
        // Download the segment
        const link = document.createElement('a');
        link.download = segment.filename;
        link.href = dataUrl;
        link.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Restore cut lines display
      cutLineElements.forEach((line, index) => {
        line.style.display = originalCutLineStyles[index] || '';
      });
      
      // Restore cutting instructions
      if (cuttingInstructions) {
        cuttingInstructions.style.display = originalInstructionsDisplay;
      }
      
      // Restore preview container styles
      previewElement.style.border = originalPreviewBorder;
      previewElement.style.cursor = originalPreviewCursor;
      
      message.success(`Successfully exported ${segments.length} image(s)!`);
    } catch (error) {
      console.error('Cut export failed:', error);
      message.error('Cut export failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    // If in cutting mode and has cut lines, use cut export
    if (mode === 'markdown' && isCuttingMode && cutLines.length > 0) {
      return handleCutExport();
    }
    
    const currentRef = mode === 'cover' ? coverPreviewRef.current : previewRef.current;
    if (!currentRef) return;
    
    try {
      setLoading(true);
      
      const previewElement = currentRef;
      const contentHeight = previewElement.scrollHeight;
      const contentWidth = previewElement.scrollWidth;
      
      // Hide drag handles in cover mode
      const originalDragHandleStyles = [];
      if (mode === 'cover') {
        const dragHandles = previewElement.querySelectorAll('.drag-handle');
        dragHandles.forEach(handle => {
          originalDragHandleStyles.push(handle.style.display);
          handle.style.display = 'none';
        });
      }
      
      // Temporarily add export-specific styles
      const blockquotes = previewElement.querySelectorAll('.wmde-markdown blockquote');
      const originalBlockquoteStyles = [];
      
      // Save original styles of all elements in the document
      // const allElements = previewElement.querySelectorAll('*');
      const originalComputedStyles = new Map();
      
      // Create a temporary stylesheet specifically for handling emoji
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.textContent = `
        /* Global emoji style reset */
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
        
        /* Force native emoji font rendering */
        @font-face {
          font-family: 'EmojiFont';
          src: local('Apple Color Emoji'), local('Segoe UI Emoji'), local('Segoe UI Symbol');
          unicode-range: U+1F300-1F6FF, U+1F900-1F9FF, U+2600-26FF, U+2700-27BF;
        }
        
        /* Apply emoji font to all elements that may contain emoji */
        body .wmde-markdown * {
          font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'EmojiFont', sans-serif;
        }
      `;
      document.head.appendChild(styleSheet);
      
      // Handle all emoji elements - more precise pattern matching
      const emojiPattern = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      
      // Select correct element selector based on mode
      const elementsSelector = mode === 'cover' ? '*' : '.wmde-markdown *';
      const markdownElements = previewElement.querySelectorAll(elementsSelector);
      
      // Handle emoji more systematically
      markdownElements.forEach(el => {
        if (el.textContent && emojiPattern.test(el.textContent)) {
          // Save original state
          originalComputedStyles.set(el, {
            html: el.innerHTML,
            color: el.style.color,
            webkitTextFillColor: el.style.webkitTextFillColor,
            fontFamily: el.style.fontFamily
          });
          
          // Special handling for headings
          const needsGradientFix = mode === 'markdown' && theme === 'gradient' && (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3');
          if (needsGradientFix) {
            // Use more reliable method to wrap emoji
            el.innerHTML = el.innerHTML.replace(emojiPattern, match => 
              `<span class="emoji" data-emoji="true" style="color:initial !important;-webkit-text-fill-color:initial !important;background:none !important;">${match}</span>`
            );
          }
          
          // Ensure element uses correct font
          el.style.fontFamily = "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif";
        }
      });
      
              // To solve emoji and icon issues, ensure correct font and color rendering
        const getBackgroundColor = () => {
          if (mode === 'cover') {
            // Cover mode: use cover background color
            return coverBgColor1 !== coverBgColor2 ? coverBgColor1 : coverBgColor1;
          } else {
            // Markdown mode: use theme background color
            return theme === 'gradient' ? '#f5f7fa' : themes[theme].background;
          }
        };
      
      const htmlToImageOptions = {
        quality: 1.0,
        backgroundColor: getBackgroundColor(),
        width: contentWidth * 2,
        height: contentHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${contentWidth}px`,
          height: `${contentHeight}px`
        },
        pixelRatio: 2,
        fontEmbedCSS: true, // Try to embed fonts to maintain consistency
        skipFonts: false, // Don't skip font processing
        fontFamily: "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif"
      };
      
      // Handle blockquotes (only in markdown mode)
      if (mode === 'markdown') {
        blockquotes.forEach(blockquote => {
          // Save more original style properties
          originalBlockquoteStyles.push({
            background: blockquote.style.background,
            borderLeft: blockquote.style.borderLeft,
            borderImage: blockquote.style.borderImage,
            borderImageSlice: blockquote.style.borderImageSlice,
            backdropFilter: blockquote.style.backdropFilter,
            boxShadow: blockquote.style.boxShadow
          });
          
          // Set solid background and border based on current theme
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
          } else { // light theme
            blockquote.style.background = '#f8f9fa';
            blockquote.style.borderLeft = '3px solid #3182ce';
          }
        });
      }
      
      const dataUrl = await htmlToImage.toPng(currentRef, htmlToImageOptions);
      
      // Remove temporary stylesheet
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
      
      // Restore original styles (only in markdown mode)
      if (mode === 'markdown') {
        blockquotes.forEach((blockquote, index) => {
          blockquote.style.background = originalBlockquoteStyles[index].background;
          blockquote.style.borderLeft = originalBlockquoteStyles[index].borderLeft;
          blockquote.style.borderImage = originalBlockquoteStyles[index].borderImage;
          blockquote.style.borderImageSlice = originalBlockquoteStyles[index].borderImageSlice;
          blockquote.style.backdropFilter = originalBlockquoteStyles[index].backdropFilter;
          blockquote.style.boxShadow = originalBlockquoteStyles[index].boxShadow;
        });
      }
      
      // Restore original styles and content of all elements
      markdownElements.forEach(el => {
        if (originalComputedStyles.has(el)) {
          const origStyle = originalComputedStyles.get(el);
          
          // Restore HTML
          if (origStyle.html) {
            el.innerHTML = origStyle.html;
          }
          
          // Restore style properties
          if (origStyle.color) el.style.color = origStyle.color;
          if (origStyle.webkitTextFillColor) el.style.webkitTextFillColor = origStyle.webkitTextFillColor;
          if (origStyle.fontFamily) el.style.fontFamily = origStyle.fontFamily;
        }
      });
      
      // Restore drag handle display state
      if (mode === 'cover') {
        const dragHandles = previewElement.querySelectorAll('.drag-handle');
        dragHandles.forEach((handle, index) => {
          handle.style.display = originalDragHandleStyles[index] || '';
        });
      }
      
      const link = document.createElement('a');
      link.download = mode === 'cover' ? 'xiaohongshu-cover.png' : 'markdown-export.png';
      link.href = dataUrl;
      link.click();
      
      message.success(mode === 'cover' ? 'Cover exported successfully!' : 'Export successful!');
    } catch (err) {
      message.error('Export failed, please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Advertisement initialization effect
  useEffect(() => {
    if (isAppRoute) {
      try {
        // Ensure global adsbygoogle object exists
        if (window.adsbygoogle && window.adsbygoogle.push) {
          // Try to initialize all ads after component mounting
          const ads = document.querySelectorAll('.adsbygoogle');
          ads.forEach(ad => {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
              console.error('Ad initialization failed:', e);
            }
          });
        }
      } catch (e) {
        console.error('AdSense initialization error:', e);
      }
    }
  }, [isAppRoute]); // Only run on component mount and isAppRoute change

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
          
          <ValueProposition>
            Making knowledge spread in a more elegant way
          </ValueProposition>
          
          <ModeToggle>
            <Radio.Group
              value={mode}
              onChange={e => setMode(e.target.value)}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="markdown">
                <BookOutlined /> Markdown Editor
              </Radio.Button>
              <Radio.Button value="cover">
                <PictureOutlined /> Cover Maker
              </Radio.Button>
            </Radio.Group>
          </ModeToggle>
          
          <ControlGroup>
            {mode === 'markdown' && (
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
                <Radio.Button value="tiffany">Tiffany</Radio.Button>
              </Radio.Group>
            )}

            <StyledButton 
              type="primary" 
              icon={<CameraOutlined />}
              onClick={handleExport}
              loading={loading}
              size="large"
            >
              {mode === 'cover' ? 'Export Cover' : 
               (isCuttingMode && cutLines.length > 0 ? `Export ${cutLines.length + 1} Images` : 'Export Image')}
            </StyledButton>
            
            {mode === 'markdown' && (
              <StyledButton 
                type={isCuttingMode ? "danger" : "default"}
                icon={<ScissorOutlined />}
                onClick={toggleCuttingMode}
                size="large"
                style={{ marginLeft: '10px' }}
              >
                {isCuttingMode ? 'Exit Cutting' : 'Cut Images'}
              </StyledButton>
            )}
          </ControlGroup>



          {mode === 'markdown' && (
            <SettingsPanel>
              {isCuttingMode && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#dc2626'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                      ✂️ Cutting Mode Active ({cutLines.length} cut lines)
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      • Click on preview to add cut lines
                      • Click existing lines to remove them
                      • Export will generate {cutLines.length + 1} separate images
                    </div>
                    {cutLines.length > 0 && (
                      <Button 
                        size="small" 
                        danger 
                        onClick={() => setCutLines([])}
                        icon={<DeleteOutlined />}
                      >
                        Clear All Lines
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <Tabs
                defaultActiveKey="basic"
                type="card"
                size="small"
                style={{ marginBottom: '20px' }}
                items={[
                  {
                    key: 'basic',
                    label: '📝 Basic Settings',
                    children: (
                      <div className="tab-content">
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>H1 Size</span>
                            <InputNumber min={0.5} max={5} step={0.1} value={h1Size} onChange={setH1Size} />
                          </div>
                          <div className="setting-item">
                            <span>H2 Size</span>
                            <InputNumber min={0.5} max={5} step={0.1} value={h2Size} onChange={setH2Size} />
                          </div>
                          <div className="setting-item">
                            <span>H3 Size</span>
                            <InputNumber min={0.5} max={5} step={0.1} value={h3Size} onChange={setH3Size} />
                          </div>
                        </div>
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>Heading Color</span>
                            <ColorPicker value={headingColor} onChange={(value, hex) => setHeadingColor(hex)} />
                          </div>
                          <div className="setting-item">
                            <span>Body Color</span>
                            <ColorPicker value={bodyColor} onChange={(value, hex) => setBodyColor(hex)} />
                          </div>
                          <div className="setting-item">
                            <span>Body Size</span>
                            <InputNumber min={10} max={40} value={bodyFontSize} onChange={setBodyFontSize} />
                          </div>
                        </div>
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>Heading Font</span>
                            <Select
                              value={headingFontFamily}
                              onChange={setHeadingFontFamily}
                              showSearch
                              filterOption={(input, option) => 
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {fontOptions.map((font) => (
                                <Select.Option key={font.value} value={font.value}>
                                  {font.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                          <div className="setting-item">
                            <span>Body Font</span>
                            <Select
                              value={bodyFontFamily}
                              onChange={setBodyFontFamily}
                              showSearch
                              filterOption={(input, option) => 
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {fontOptions.map((font) => (
                                <Select.Option key={font.value} value={font.value}>
                                  {font.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>Background Color 1</span>
                            <ColorPicker value={bgColor1} onChange={(value, hex) => setBgColor1(hex)} />
                          </div>
                          <div className="setting-item">
                            <span>Background Color 2</span>
                            <ColorPicker value={bgColor2} onChange={(value, hex) => setBgColor2(hex)} />
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'code',
                    label: '💾 Code Style',
                    children: (
                      <div className="tab-content">
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>Code Font Size</span>
                            <InputNumber min={10} max={24} value={codeBlockFontSize} onChange={setCodeBlockFontSize} />
                          </div>
                          <div className="setting-item">
                            <span>Code Font Family</span>
                            <Select
                              value={codeBlockFontFamily}
                              onChange={setCodeBlockFontFamily}
                              showSearch
                              filterOption={(input, option) => 
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              style={{ width: '100%' }}
                            >
                              {fontOptions.filter(font => font.category === 'Monospace').map((font) => (
                                <Select.Option key={font.value} value={font.value}>
                                  {font.label}
                                </Select.Option>
                              ))}
                              <Select.Option value="JetBrains Mono">JetBrains Mono</Select.Option>
                              <Select.Option value="Fira Code">Fira Code</Select.Option>
                              <Select.Option value="SF Mono">SF Mono</Select.Option>
                              <Select.Option value="Source Code Pro">Source Code Pro</Select.Option>
                              <Select.Option value="Roboto Mono">Roboto Mono</Select.Option>
                            </Select>
                          </div>
                        </div>
                        <Collapse 
                          size="small"
                          items={[
                            {
                              key: 'codeblock',
                              label: 'Code Block Style',
                              children: (
                                <div className="setting-row">
                                  <div className="setting-item">
                                    <span>Background</span>
                                    <ColorPicker value={codeBlockBgColor} onChange={(value, hex) => setCodeBlockBgColor(hex)} />
                                  </div>
                                  <div className="setting-item">
                                    <span>Text Color</span>
                                    <ColorPicker value={codeBlockTextColor} onChange={(value, hex) => setCodeBlockTextColor(hex)} />
                                  </div>
                                </div>
                              )
                            },
                            {
                              key: 'inline',
                              label: 'Inline Code Style',
                              children: (
                                <div className="setting-row">
                                  <div className="setting-item">
                                    <span>Background</span>
                                    <ColorPicker value={inlineCodeBgColor} onChange={(value, hex) => setInlineCodeBgColor(hex)} />
                                  </div>
                                  <div className="setting-item">
                                    <span>Text Color</span>
                                    <ColorPicker value={inlineCodeTextColor} onChange={(value, hex) => setInlineCodeTextColor(hex)} />
                                  </div>
                                </div>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'table',
                    label: '📊 Table Style',
                    children: (
                      <div className="tab-content">
                        <div className="setting-row">
                          <div className="setting-item">
                            <span>Table Font Size</span>
                            <InputNumber min={10} max={24} value={tableFontSize} onChange={setTableFontSize} />
                          </div>
                          <div className="setting-item">
                            <span>Border Color</span>
                            <ColorPicker value={tableBorderColor} onChange={(value, hex) => setTableBorderColor(hex)} />
                          </div>
                        </div>
                        <Collapse 
                          size="small"
                          items={[
                            {
                              key: 'header',
                              label: 'Table Header Style',
                              children: (
                                <div className="setting-row">
                                  <div className="setting-item">
                                    <span>Background</span>
                                    <ColorPicker value={tableHeaderBgColor} onChange={(value, hex) => setTableHeaderBgColor(hex)} />
                                  </div>
                                  <div className="setting-item">
                                    <span>Text Color</span>
                                    <ColorPicker value={tableHeaderTextColor} onChange={(value, hex) => setTableHeaderTextColor(hex)} />
                                  </div>
                                </div>
                              )
                            },
                            {
                              key: 'cell',
                              label: 'Table Cell Style',
                              children: (
                                <div className="setting-row">
                                  <div className="setting-item">
                                    <span>Background</span>
                                    <ColorPicker value={tableCellBgColor} onChange={(value, hex) => setTableCellBgColor(hex)} />
                                  </div>
                                  <div className="setting-item">
                                    <span>Text Color</span>
                                    <ColorPicker value={tableCellTextColor} onChange={(value, hex) => setTableCellTextColor(hex)} />
                                  </div>
                                </div>
                              )
                            }
                          ]}
                        />
                      </div>
                    )
                  }
                ]}
              />
            </SettingsPanel>
          )}

          <ContentLayout>
            {mode === 'markdown' ? (
              <>
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
                    <div style={{ position: 'relative' }}>
                      <PreviewContainer
                        ref={previewRef}
                        {...themes[theme]}
                        theme={theme}
                        bg1={bgColor1}
                        bg2={bgColor2}
                        backgroundType={bgColor1 !== bgColor2 ? 'gradient' : 'solid'}
                        h1Size={h1Size}
                        h2Size={h2Size}
                        h3Size={h3Size}
                        headingColor={headingColor}
                        headingFontFamily={headingFontFamily}
                        bodyColor={bodyColor}
                        bodyFontFamily={bodyFontFamily}
                        bodyFontSize={bodyFontSize}
                        codeBlockFontSize={codeBlockFontSize}
                        codeBlockFontFamily={codeBlockFontFamily}
                        codeBlockBgColor={codeBlockBgColor}
                        codeBlockTextColor={codeBlockTextColor}
                        inlineCodeBgColor={inlineCodeBgColor}
                        inlineCodeTextColor={inlineCodeTextColor}
                        tableBorderColor={tableBorderColor}
                        tableHeaderBgColor={tableHeaderBgColor}
                        tableHeaderTextColor={tableHeaderTextColor}
                        tableCellBgColor={tableCellBgColor}
                        tableCellTextColor={tableCellTextColor}
                        tableFontSize={tableFontSize}
                        onClick={handlePreviewClick}
                        style={{ 
                          cursor: isCuttingMode ? 'crosshair' : 'default',
                          border: isCuttingMode ? '2px dashed #ef4444' : 'none'
                        }}
                      >
                        <MDEditor.Markdown 
                          source={value} 
                          rehypePlugins={[[rehypePrism, { showLineNumbers: true }]]}
                        />
                      </PreviewContainer>
                      
                      {/* Cut lines overlay */}
                      {showCutLines && cutLines.map((y, index) => (
                        <CutLine
                          key={index}
                          index={index}
                          data-cut-line
                          style={{ top: `${y}px` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCutLine(index);
                          }}
                        />
                      ))}
                      
                      {/* Cutting mode instructions */}
                      {isCuttingMode && (
                        <div 
                          data-cutting-instructions
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            zIndex: 200,
                            pointerEvents: 'none'
                          }}
                        >
                          ✂️ Click to add cut lines | Click cut lines to remove
                        </div>
                      )}
                    </div>
                  </Spin>
                </PreviewSection>
              </>
            ) : (
              <>
                <CoverMaker>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #ff6b6b, #feca57)', 
                    color: 'white', 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    📱 Social Media Cover Maker · Designed for RedBook & Instagram
                  </div>
                  <CoverSettings>
                    <div className="setting-group">
                      <div className="group-title">
                        📐 Size Ratio
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Choose Size Ratio</label>
                          <Select
                            value={coverSizeRatio}
                            onChange={handleSizeRatioChange}
                            size="large"
                            style={{ width: '100%' }}
                          >
                            {Object.entries(coverSizeRatios).map(([key, ratio]) => (
                              <Select.Option key={key} value={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{ratio.name}</span>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {ratio.width}×{ratio.height}
                                  </span>
                                </div>
                              </Select.Option>
                            ))}
                          </Select>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            marginTop: '4px' 
                          }}>
                            {coverSizeRatios[coverSizeRatio].description}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="setting-group">
                      <div className="group-title">
                        🎯 Quick Templates
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Select Template</label>
                          <Select
                            placeholder="Choose a cover template"
                            size="large"
                            onChange={applyTemplate}
                            style={{ width: '100%' }}
                          >
                            {Object.entries(coverTemplates).map(([key, template]) => (
                              <Select.Option key={key} value={key}>
                                {template.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="setting-group">
                      <div className="group-title">
                        <PictureOutlined />
                        Content Settings
                      </div>
                      <CoverInput>
                        <label>Title</label>
                        <Input
                          value={coverTitle}
                          onChange={e => setCoverTitle(e.target.value)}
                          placeholder="Enter your title"
                          size="large"
                        />
                      </CoverInput>
                      <CoverInput>
                        <label>Subtitle</label>
                        <Input
                          value={coverSubtitle}
                          onChange={e => setCoverSubtitle(e.target.value)}
                          placeholder="Enter subtitle or description"
                          size="large"
                        />
                      </CoverInput>
                      <CoverInput>
                        <label>Author Info</label>
                        <Input
                          value={coverAuthor}
                          onChange={e => setCoverAuthor(e.target.value)}
                          placeholder="@your_name"
                          size="large"
                        />
                      </CoverInput>
                      <CoverInput>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Show Content Card</span>
                          <Switch
                            checked={showMarkdown}
                            onChange={setShowMarkdown}
                            size="small"
                          />
                        </label>
                        {showMarkdown && (
                          <div style={{ marginTop: '8px' }}>
                            <MDEditor
                              value={coverMarkdownContent}
                              onChange={setCoverMarkdownContent}
                              preview="edit"
                              hideToolbar={false}
                              height={120}
                              data-color-mode="light"
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                        )}
                      </CoverInput>
                    </div>
                    
                    <div className="setting-group">
                      <div className="group-title">
                        🎨 Style Settings
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Title Size</label>
                          <Slider
                            min={1}
                            max={4}
                            step={0.1}
                            value={coverTitleSize}
                            onChange={setCoverTitleSize}
                          />
                        </div>
                        <div className="setting-item">
                          <label>Subtitle Size</label>
                          <Slider
                            min={0.8}
                            max={2}
                            step={0.1}
                            value={coverSubtitleSize}
                            onChange={setCoverSubtitleSize}
                          />
                        </div>
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Title Color</label>
                          <ColorPicker
                            value={coverTitleColor}
                            onChange={(value, hex) => setCoverTitleColor(hex)}
                          />
                        </div>
                        <div className="setting-item">
                          <label>Subtitle Color</label>
                          <ColorPicker
                            value={coverSubtitleColor}
                            onChange={(value, hex) => setCoverSubtitleColor(hex)}
                          />
                        </div>
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Author Font Size</label>
                          <Slider
                            min={0.6}
                            max={1.8}
                            step={0.1}
                            value={coverAuthorSize}
                            onChange={setCoverAuthorSize}
                          />
                        </div>
                        <div className="setting-item">
                          <label>Author Text Color</label>
                          <ColorPicker
                            value={coverAuthorColor}
                            onChange={(value, hex) => setCoverAuthorColor(hex)}
                          />
                        </div>
                      </div>
                      {showMarkdown && (
                        <div className="setting-row">
                          <div className="setting-item">
                            <label>Content Font Size</label>
                            <Slider
                              min={0.6}
                              max={1.4}
                              step={0.1}
                              value={coverMarkdownFontSize}
                              onChange={setCoverMarkdownFontSize}
                            />
                          </div>
                          <div className="setting-item">
                            <label>Content Text Color</label>
                            <ColorPicker
                              value={coverMarkdownColor}
                              onChange={(value, hex) => setCoverMarkdownColor(hex)}
                            />
                          </div>
                        </div>
                      )}
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Title Font</label>
                          <Select
                            value={coverTitleFont}
                            onChange={setCoverTitleFont}
                            showSearch
                            filterOption={(input, option) => 
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                          >
                            {fontOptions.map((font) => (
                              <Select.Option key={font.value} value={font.value}>
                                {font.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                        <div className="setting-item">
                          <label>Subtitle Font</label>
                          <Select
                            value={coverSubtitleFont}
                            onChange={setCoverSubtitleFont}
                            showSearch
                            filterOption={(input, option) => 
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                          >
                            {fontOptions.map((font) => (
                              <Select.Option key={font.value} value={font.value}>
                                {font.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Author Font</label>
                          <Select
                            value={coverAuthorFont}
                            onChange={setCoverAuthorFont}
                            showSearch
                            filterOption={(input, option) => 
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                          >
                            {fontOptions.map((font) => (
                              <Select.Option key={font.value} value={font.value}>
                                {font.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                        <div className="setting-item">
                          <label>Content Card Background</label>
                          <ColorPicker
                            value={coverMarkdownBgColor}
                            onChange={(value, hex) => setCoverMarkdownBgColor(hex)}
                          />
                        </div>
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <label>Background Color 1</label>
                          <ColorPicker
                            value={coverBgColor1}
                            onChange={(value, hex) => setCoverBgColor1(hex)}
                          />
                        </div>
                        <div className="setting-item">
                          <label>Background Color 2</label>
                          <ColorPicker
                            value={coverBgColor2}
                            onChange={(value, hex) => setCoverBgColor2(hex)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="setting-group">
                      <div className="group-title">
                        <DragOutlined />
                        Layout Control
                      </div>
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '12px', 
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '12px'
                      }}>
                        💡 Drag Tips: Directly drag components in the preview area to adjust positions
                      </div>
                      <div className="setting-row">
                        <div className="setting-item">
                          <Button 
                            onClick={resetLayout}
                            icon={<ExpandOutlined />}
                            size="small"
                            style={{ width: '100%' }}
                          >
                            Reset Layout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CoverSettings>
                </CoverMaker>

                <PreviewSection>
                  <Spin spinning={loading}>
                    <CoverPreview
                      ref={coverPreviewRef}
                      bg1={coverBgColor1}
                      bg2={coverBgColor2}
                      backgroundType={coverBgColor1 !== coverBgColor2 ? 'gradient' : 'solid'}
                      width={coverSizeRatios[coverSizeRatio].width}
                      height={coverSizeRatios[coverSizeRatio].height}
                    >
                      {/* 标题 */}
                      <DraggableElement
                        x={elementPositions.title.x}
                        y={elementPositions.title.y}
                        isDragging={dragState.isDragging && dragState.dragElement === 'title'}
                        onMouseDown={(e) => handleDragStart(e, 'title')}
                        className={dragState.isDragging && dragState.dragElement === 'title' ? 'dragging' : ''}
                      >
                        <div className="drag-handle">
                          <DragOutlined />
                        </div>
                        <CoverTitle
                          titleSize={coverTitleSize}
                          titleColor={coverTitleColor}
                          titleFont={coverTitleFont}
                        >
                          {coverTitle}
                        </CoverTitle>
                      </DraggableElement>
                      
                      {/* 副标题 */}
                      <DraggableElement
                        x={elementPositions.subtitle.x}
                        y={elementPositions.subtitle.y}
                        isDragging={dragState.isDragging && dragState.dragElement === 'subtitle'}
                        onMouseDown={(e) => handleDragStart(e, 'subtitle')}
                        className={dragState.isDragging && dragState.dragElement === 'subtitle' ? 'dragging' : ''}
                      >
                        <div className="drag-handle">
                          <DragOutlined />
                        </div>
                        <CoverSubtitle
                          subtitleSize={coverSubtitleSize}
                          subtitleColor={coverSubtitleColor}
                          subtitleFont={coverSubtitleFont}
                        >
                          {coverSubtitle}
                        </CoverSubtitle>
                      </DraggableElement>
                      
                      {/* 作者信息 */}
                      <DraggableElement
                        x={elementPositions.author.x}
                        y={elementPositions.author.y}
                        isDragging={dragState.isDragging && dragState.dragElement === 'author'}
                        onMouseDown={(e) => handleDragStart(e, 'author')}
                        className={dragState.isDragging && dragState.dragElement === 'author' ? 'dragging' : ''}
                      >
                        <div className="drag-handle">
                          <DragOutlined />
                        </div>
                        <CoverAuthor
                          authorSize={coverAuthorSize}
                          authorColor={coverAuthorColor}
                          authorFont={coverAuthorFont}
                        >
                          {coverAuthor}
                        </CoverAuthor>
                      </DraggableElement>
                      
                      {/* Markdown内容 */}
                      {showMarkdown && (
                        <DraggableElement
                          x={elementPositions.markdown.x}
                          y={elementPositions.markdown.y}
                          isDragging={dragState.isDragging && dragState.dragElement === 'markdown'}
                          onMouseDown={(e) => handleDragStart(e, 'markdown')}
                          className={dragState.isDragging && dragState.dragElement === 'markdown' ? 'dragging' : ''}
                        >
                          <div className="drag-handle">
                            <DragOutlined />
                          </div>
                          <CoverMarkdown
                            fontSize={coverMarkdownFontSize}
                            textColor={coverMarkdownColor}
                            fontFamily={coverAuthorFont}
                            bgColor={coverMarkdownBgColor}
                          >
                            <MDEditor.Markdown 
                              source={coverMarkdownContent} 
                              rehypePlugins={[[rehypePrism, { showLineNumbers: false }]]}
                            />
                          </CoverMarkdown>
                        </DraggableElement>
                      )}
                    </CoverPreview>
                  </Spin>
                </PreviewSection>
              </>
            )}
          </ContentLayout>

          {/* AdSense广告单元 - 第一个广告位 */}
          <AdBanner>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-9798575917692871"
                 data-ad-slot="3180808479"
                 data-ad-format="auto"
                 data-full-width-responsive="true" />
          </AdBanner>

          {/* AdSense广告单元 - 第二个广告位 */}
          <AdBanner style={{ marginTop: '60px' }}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-9798575917692871"
                 data-ad-slot="2290871395"
                 data-ad-format="auto"
                 data-full-width-responsive="true" />
          </AdBanner>

          {/* AdSense广告单元 - 第三个广告位 */}
          <AdBanner style={{ marginTop: '60px' }}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-9798575917692871"
                 data-ad-slot="8950405245"
                 data-ad-format="auto" 
                 data-full-width-responsive="true" />
          </AdBanner>

          <Copyright>
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#8b9dc3', fontStyle: 'italic' }}>
              "Transforming ideas into beautiful visuals, one markdown at a time"
            </div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#a0aec0' }}>
              Empowering creators • Elegant design • Knowledge sharing
            </div>
            © {new Date().getFullYear()} md2image. All rights reserved. Made with ❤️
          </Copyright>
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
