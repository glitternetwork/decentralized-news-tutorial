
import type { RouteObject } from 'react-router-dom';
import { createHashRouter } from 'react-router-dom';
import Index from '../App';
import Detial from '../pages/Detail';


const routes: RouteObject[] = [
    {
        path: '/',
        element: <Index />,
    },
    {
        path: '/detail/:id',
        element: <Detial />,
    },
    {
        path: '*',
        element: <Index />,
    },
];

const router: any = createHashRouter(routes);

export default router;
