import { Link } from "react-router-dom"

const Links = () => {
    return (
        <ul className="menu menu-horizontal px-1">
            <li><Link to="/graphs">Graphs</Link></li>
            <li>
                <details>
                <summary>Create +</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                    <li><div>New Graph</div></li>
                </ul>
                </details>
            </li>
        </ul>
    )
}

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 p-3">
        <div className="flex-1">
            <Link to="/" className="btn btn-ghost text-xl">Graphematics</Link>
        </div>
        <div className="flex-none gap-2">

            <Links />

            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                    <img
                        alt="Tailwind CSS Navbar component"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                    <li><div>Profile</div></li>
                    <li><div>Settings</div></li>
                    <li><div>Logout</div></li>
                </ul>
            </div>
        </div>
    </div>
  )
}
