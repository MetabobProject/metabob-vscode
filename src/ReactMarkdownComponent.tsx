import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface ReactMarkdownProps {
  text: string
}
export const ReactMarkdownComponent = ({ text }: ReactMarkdownProps) => {
  return (
    <>
      <div className='w-100'>
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, '')}
                  style={dark}
                  language={match[1]}
                  PreTag='div'
                />
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              )
            }
          }}
        />
      </div>
    </>
  )
}
