import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { SessionTimeout } from "./components/SessionTimeout";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <SessionTimeout />
    </>
  );
}