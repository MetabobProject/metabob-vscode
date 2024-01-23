export enum ButtonWidth {
  Small,
  Medium
}

interface ButtonProps {
  label: string
  styles?: string
  handleClick?: React.MouseEventHandler<HTMLButtonElement>
  isBoldText?: boolean
  width?: ButtonWidth
  disabled?: boolean
}

export const Button = ({ handleClick, label, styles, isBoldText, width, disabled = false }: ButtonProps) => {
  let classNames =
    styles ||
    'inline-flex items-center text-center px-4 py-2 text-sm text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'

  if (isBoldText) {
    classNames = `${classNames} font-semibold`
  }

  if (width === ButtonWidth.Small) {
    classNames = `${classNames} px-2 py-1 text-xs`
  }

  if (width === ButtonWidth.Medium) {
    classNames = `${classNames} px-4 py-2 text-sm`
  }

  return (
    <>
      <button onClick={handleClick} disabled={disabled} className={classNames}>
        {label}
      </button>
    </>
  )
}
