import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface ReactMarkdownProps {
  text: string
}

// tslint:disable-block
export const ReactMarkdownComponent = ({ text }: ReactMarkdownProps) => {
  const markedDownText = `~~~python\n${text}~~~`

  return (
    <>
      <div className='w-100'>
        <ReactMarkdown
          children={markedDownText}
          remarkPlugins={[remarkGfm]}
          className='prose'
          components={{
            code({ inline, className, children, ...props }) {
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
