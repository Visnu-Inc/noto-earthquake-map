import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import './index.css'
import Map from './components/pages/Map/index'
import Data from './components/pages/Data/index'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Map />
  },
  {
    path: '/data',
    element: <Data />
  }
])

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <CssBaseline />
    <RouterProvider router={router} />
  </React.StrictMode>
)
