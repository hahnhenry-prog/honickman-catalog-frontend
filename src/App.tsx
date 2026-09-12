import { useState } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'

const STORAGE_KEY = 'site-auth'
const REQUIRED = import.meta.env.VITE_SITE_PASSWORD as string | undefined

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() =>
    !REQUIRED || sessionStorage.getItem(STORAGE_KEY) === REQUIRED
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (authed) return <>{children}</>

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value === REQUIRED) {
      sessionStorage.setItem(STORAGE_KEY, value)
      setAuthed(true)
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="bg-white border border-[#e2e2e2] p-8 w-full max-w-xs flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-semibold tracking-wide uppercase text-[#242424]">
            Honickman Catalog
          </h1>
          <p className="text-[12px] text-[#999999] tracking-wide">Enter password to continue</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false) }}
            placeholder="Password"
            className="w-full border border-[#e2e2e2] px-3 py-2 text-[13px] text-[#242424] outline-none focus:border-[#242424] transition-colors"
            style={{ borderRadius: 0 }}
          />
          {error && (
            <p className="text-[11px] text-red-500 tracking-wide">Incorrect password</p>
          )}
          <button type="submit"
            className="w-full bg-[#242424] text-white text-[12px] tracking-[0.1em] uppercase py-2.5 hover:bg-[#000] transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <PasswordGate>
      <RouterProvider router={router} />
    </PasswordGate>
  )
}
