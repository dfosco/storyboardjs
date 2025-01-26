import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/reset.css'
import './css/globals.css'
import { Routes } from '@generouted/react-router'
import { ThemeProvider, BaseStyles } from '@primer/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider colorMode="light">
      <BaseStyles>
        <Routes />
      </BaseStyles>
    </ThemeProvider>
  </StrictMode>
)