const THEME_STORE_KEY = 'theme'

const themeChangeListeners: Function[] = []

window.onThemeChange = function (listener: Function) {
  themeChangeListeners.push(listener)
}

function updateTheme(mode?: string) {
  const theme = localStorage.getItem(THEME_STORE_KEY) ?? 'auto'
  if (theme !== 'auto') {
    mode = theme
  } else {
    if (mode === undefined) {
      const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)')
      mode = mediaQueryListDark.matches ? 'dark' : ''
    }
  }
  themeChangeListeners.forEach((listener) => listener(mode))
  if (mode === 'dark') {
    document.documentElement.setAttribute('theme-mode', 'dark')
  } else {
    document.documentElement.removeAttribute('theme-mode')
  }
}

updateTheme()

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addListener((mediaQueryListEvent) => {
    updateTheme(mediaQueryListEvent.matches ? 'dark' : '')
  })

window.addEventListener('load', () => {
  const themeSwitch = document.getElementById('themeSwitch')!
  const defaultTheme = localStorage.getItem(THEME_STORE_KEY) ?? 'auto'
  themeSwitch.className = 'theme-switch ' + defaultTheme

  updateTheme()
  themeSwitch.addEventListener('click', function (e) {
    let switchChild = e.target as HTMLElement
    while (switchChild.parentNode !== this) {
      switchChild = switchChild.parentNode as HTMLElement
    }
    themeSwitch.className = 'theme-switch ' + switchChild.className
    localStorage.setItem(THEME_STORE_KEY, switchChild.className)
    updateTheme()
  })
})
