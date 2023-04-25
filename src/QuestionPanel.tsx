export const QuestionPanel = () => {
  return (
    <>
      <form className='w-full'>
        <div className='flex items-center border-b border-teal-500 py-2'>
          <input
            className='appearance-none bg-transparent border-none w-full mr-3 py-1 px-2 leading-tight focus:outline-none'
            type='text'
            placeholder='your question about the problem ?'
            aria-label='your question about the problem ?'
          />
          <button
            className='flex-shrink-0 items-center px-2 py-1 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            type='button'
          >
            ask
          </button>
        </div>
      </form>
    </>
  )
}
