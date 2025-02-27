import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { getCookie, setCookie } from 'vinxi/http'
import { z } from 'zod'
import { create } from 'zustand'

const themeModeSchema = z.enum(['light', 'dark', 'auto'])
const prefersModeSchema = z.enum(['light', 'dark'])

type ThemeMode = z.infer<typeof themeModeSchema>
type PrefersMode = z.infer<typeof prefersModeSchema>

interface ThemeStore {
  mode: ThemeMode
  prefers: PrefersMode
  toggleMode: () => void
  setPrefers: (prefers: PrefersMode) => void
}

const updateThemeCookie = createServerFn({ method: 'POST' })
  .validator(themeModeSchema)
  .handler((ctx) => {
    setCookie('theme', ctx.data, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
    })
  })

export const getThemeCookie = createServerFn().handler(() => {
  return (
    themeModeSchema.catch('auto').parse(getCookie('theme') ?? 'null') || 'auto'
  )
})

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'auto',
  prefers: (() => {
    if (typeof document !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    return 'light'
  })(),
  toggleMode: () =>
    set((s) => {
      const newMode =
        s.mode === 'auto' ? 'light' : s.mode === 'light' ? 'dark' : 'auto'

      updateThemeClass(newMode, s.prefers)
      updateThemeCookie({
        data: newMode,
      })

      return {
        mode: newMode,
      }
    }),
  setPrefers: (prefers) => {
    set({ prefers })
    updateThemeClass(get().mode, prefers)
  },
}))

if (typeof document !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      if (useThemeStore.getState().mode === 'auto') {
      }
      useThemeStore.getState().setPrefers(event.matches ? 'dark' : 'light')
    })
}

// Helper to update <body> class
function updateThemeClass(mode: ThemeMode, prefers: PrefersMode) {
  document.documentElement.classList.remove('dark')
  if (mode === 'dark' || (mode === 'auto' && prefers === 'dark')) {
    document.documentElement.classList.add('dark')
  }
}

export function ThemeToggle() {
  //const mode = useThemeStore((s) => s.mode)
  const toggleMode = useThemeStore((s) => s.toggleMode)

  const handleToggleMode = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    e.stopPropagation()
    toggleMode()
  }

  return (
    <button
      type="button"
      className="group rounded-full bg-white/90 px-3 py-2 ring-1 shadow-lg shadow-zinc-800/5 ring-zinc-900/5 backdrop-blur-sm transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      onClick={handleToggleMode}
    >
      <SunIcon className="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden [@media(prefers-color-scheme:dark)]:fill-teal-50 [@media(prefers-color-scheme:dark)]:stroke-teal-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-teal-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-teal-600" />
      <MoonIcon className="hidden h-6 w-6 fill-zinc-700 stroke-zinc-500 transition dark:block [@media_not_(prefers-color-scheme:dark)]:fill-teal-400/10 [@media_not_(prefers-color-scheme:dark)]:stroke-teal-500 [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-400" />
    </button>
  )
}

function SunIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 12.25A4.25 4.25 0 0 1 12.25 8v0a4.25 4.25 0 0 1 4.25 4.25v0a4.25 4.25 0 0 1-4.25 4.25v0A4.25 4.25 0 0 1 8 12.25v0Z" />
      <path
        d="M12.25 3v1.5M21.5 12.25H20M18.791 18.791l-1.06-1.06M18.791 5.709l-1.06 1.06M12.25 20v1.5M4.5 12.25H3M6.77 6.77 5.709 5.709M6.77 17.73l-1.061 1.061"
        fill="none"
      />
    </svg>
  )
}

function MoonIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M17.25 16.22a6.937 6.937 0 0 1-9.47-9.47 7.451 7.451 0 1 0 9.47 9.47ZM12.75 7C17 7 17 2.75 17 2.75S17 7 21.25 7C17 7 17 11.25 17 11.25S17 7 12.75 7Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}