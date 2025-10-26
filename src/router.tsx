// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Welcome from "./pages/Welcome";
import Step1 from './pages/Step1'
import Step2 from './pages/Step2'
import Step3 from './pages/Step3'
import GroupAssignment from "./components/GroupAssignment";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Welcome /> }, 
      { path: "step-1", element: <Step1 /> },
      { path: "step-2", element: <Step2 /> },
      { path: "step-3", element: <Step3 /> },
      {path: "group", element: <GroupAssignment />},
   
    ],
  },
]);


