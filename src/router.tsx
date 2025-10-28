// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Welcome from "./pages/Step1Page1";
import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";
import Step3 from "./pages/Step3";
import GroupAssignment from "./components/Step1/Step1Page2";
import Step1Page3 from "./components/Step1/Step1Page3";
import Step1Page4 from "./components/Step1/Step1Page4";
import Step1Page5 from "./components/Step1/Step1Page5";
import Step1Page6 from "./components/Step1/Step1Page6";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "step-1", element: <Step1 /> },
      { path: "step-2", element: <Step2 /> },
      { path: "step-3", element: <Step3 /> },
      { path: "group", element: <GroupAssignment /> },
      { path: "step1Page3", element: <Step1Page3 /> },
      { path: "step1Page4", element: <Step1Page4 /> },
      { path: "step1Page5", element: <Step1Page5 /> },
      { path: "step1Page6", element: <Step1Page6 /> },
    ],
  },
]);
