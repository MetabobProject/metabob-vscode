import { useUser } from './hooks/useUser'

export const Header = (): JSX.Element => {
  const { initialState, suggestion, userQuestionAboutSuggestion } = useUser()

  return (
    <>
      <div className='w-100'>
        <span className='font-bold text-clifford text-1xl'>Problem Category:</span>
        <span className='whitespace-pre-wrap'>{`${' ' + initialState?.vuln?.category ?? ''}`}</span>
      </div>
      <div className='w-100'>
        <span className='font-bold text-clifford text-1xl antialiased'>Problem Description:</span>
        <span className='antialiased whitespace-pre-wrap'>{`${' ' + initialState?.vuln?.description ?? ''}`}</span>
      </div>
      {suggestion !== '' ? (
        <>
          <div className='w-100'>
            <span className='font-bold text-clifford text-1xl antialiased'>Question:</span>
            <span className='antialiased whitespace-pre-wrap'>{`${' ' + userQuestionAboutSuggestion}`}</span>
          </div>
          <div className='w-100'>
            <span className='font-bold text-clifford text-1xl antialiased'>Suggestion:</span>
            <span className='antialiased whitespace-pre-wrap'>{`${' ' + suggestion}`}</span>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  )
}
