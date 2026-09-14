import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutPublico/>,
        errorElement: <NoEncontradaPage />,
        children: [     
            { index: true, element: <Home/> },
            { path: 'Menu', element: <Menu/> },
            { path: 'contacto', element: <Contacto/> }
],},
]);

function AppRouter() {
  return <RouterProvider router={router} />
}