import Graphs from "../components/Graphs";

const SearchBar = () => {
    return (
        <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search for Graphs..." />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70 cursor-pointer">
                <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd" 
                className=" border border-solid border-black"/>
            </svg>
        </label>
    )
}

export default function GraphPage() {
  return (
    <div>
        <div className="row mb-4 m-10">
            <SearchBar />
        </div>
        
        <div className="m-10">
            <Graphs />
        </div>

    </div>
  )
}
