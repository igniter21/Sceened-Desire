import React from 'react'

const Search = ({searchTerm,setSearchTerm}) => {
  return (
    <div className='search glow-once'>
        <div>
            <img src ="search.svg" alt ="search"/>
            <input 
                type="text"
                
                placeholder='Search for your Obsession'
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
            />
                
            </div>
    </div>
  )
}

export default Search