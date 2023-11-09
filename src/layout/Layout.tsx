export interface LayoutProps {
  children: React.ReactNode
}
export const Layout = ({ children }: LayoutProps) => {
  return <div className='p-5'>{children}</div>
}
