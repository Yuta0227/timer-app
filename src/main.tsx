import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterConfig } from './Routes.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterConfig />
  </React.StrictMode>,
)
