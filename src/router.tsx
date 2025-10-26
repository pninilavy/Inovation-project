// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Step1 from './pages/Step1'
import Step2 from './pages/Step2'
import Step3 from './pages/Step3'

export const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Dashboard /> },
    { path: 'step-1', element: <Step1 /> },
    { path: 'step-2', element: <Step2 /> },
    { path: 'step-3', element: <Step3 /> },
  ]},
])
