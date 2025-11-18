import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Routing from './Routing/routing';
import { configureStore} from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
// import { store } from './slices';
import rootReducer from './slices';

// import App from './App.tsx'

export const store = configureStore({
  reducer: rootReducer,
  devTools: true
});

// Start MSW in development
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  worker.start();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
       <Routing />
     </Provider>
    {/* <App /> */}
  </StrictMode>,
)
