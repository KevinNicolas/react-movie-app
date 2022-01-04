import { useState, useEffect, useMemo, createRef, RefObject } from 'react';
import { FiTriangle, FiSearch, FiLoader } from 'react-icons/fi'
import debounce from 'lodash.debounce'

import httpClient from '../utils/httpClient'
import useQuery from '../hooks/query';

import { T_movieData } from '../types/movieApi'
import { MovieCard } from '../components/MovieCard';
import '../css/root.css'
import '../css/general.css'

import { useNavigate } from 'react-router'

export function Root () {

  const [movieData, setMovieData] = useState({
    movies: [] as T_movieData[],
    isLoading: true
  })
  
  const [searchIsLoading, setSearchIsLoading] = useState(false)

  const queries = useQuery()
  const searchQuery: string | null = queries.get('search')
  const endpoint = searchQuery ? `/search/movie?query=${searchQuery}` : '/discover/movie'
  const navigate = useNavigate()
  const textInput: RefObject<HTMLInputElement> = createRef<HTMLInputElement>()
  
  useEffect(() => {
    if (textInput.current) { textInput.current.value = searchQuery ?? '' }
    httpClient.getMovies(endpoint)
      .then((data: any) => {
        const results: T_movieData[] = data.results
        setMovieData({ isLoading: false, movies: results })
        setSearchIsLoading(false)
      })
      .catch((err: any) => { console.error('Error:', err); setSearchIsLoading(false); throw err })
  }, [searchQuery])

  function SearchMovie (event: any) {
    setSearchIsLoading(true)
    navigate(`/?search=${event.target.value}`)
    
  }
  const debouncedChangeHandler = useMemo(() => debounce(SearchMovie, 900), [])

  
  return (
    <div className="root-container">
      {/* Main view */}
      <div className="main-view w-screen h-screen flex justify-center items-center">
        <div className="bg-black bg-opacity-30 flex flex-row justify-center items-center h-48 w-screen">
          <div>
            <span className="text-blue-400 text-8xl sm:text-9xl">
              <FiTriangle />
            </span>
          </div>
          <div className="pb-3 flex flex-row items-end">
            <span className="text-gray-200 text-4xl sm:text-7xl font-medium">React-movies</span>
          </div>
        </div>
      </div>
      <div className='bg-gray-600 bg-opacity-90 flex flex-col'>
        <div className='bg-gray-500 flex flex-row py-4 px-8'>
          <div className='bg-blue-400 pl-3 flex flex-row center gap-3 rounded-md text-white'>
              {
                searchIsLoading
                ? <FiLoader className='spin-fade-in' size={28} />
                : <FiSearch className='fade-in' size={28} />
              }
            <input
              ref={textInput}
              type="text"
              placeholder='Buscar...'
              className='text-black px-2 py-3 outline-none full'
              onChange={debouncedChangeHandler}
            />
          </div>
        </div>
        <div className='movies-grid'>
          {
            movieData.isLoading
            ? <></>
            : movieData.movies.map((movie: T_movieData) => <MovieCard key={movie.id} movie={movie} />)
          }
        </div>
      </div>
    </div>
  )
}