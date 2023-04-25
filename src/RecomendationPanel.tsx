import { useUser } from './hooks/useUser'

export const RecomendationPanel = () => {
  const { isgenerateClicked } = useUser()
  return (
    <>
      <>
        <div className="className='w-full'">
          <div className='flex flex-wrap my-3 flex-row mx-auto justify-between'>
            <span className='font-bold text-clifford text-1xl transition duration-300 antialiased'>Recomendation</span>
            <span className='order-last'>
              <button
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                type='button'
              >
                generate
              </button>
            </span>
          </div>
          {isgenerateClicked ? (
            <>
              <form className='w-full max-w-sm'>
                <div className='flex items-center border-b border-teal-500 py-2'>
                  <input
                    className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none'
                    type='text'
                    placeholder='Jane Doe'
                    aria-label='Full name'
                  />
                  <button
                    className='flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded'
                    type='button'
                  ></button>
                </div>
              </form>
            </>
          ) : (
            <></>
          )}
        </div>
      </>
    </>
  )
}
