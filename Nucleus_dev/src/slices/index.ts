import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import serviceReducer from './configManagerJsonSlices/servicesSearch/reducer';
import fileReducer from './configManagerJsonSlices/fileUploader/reducer';
import treeReducer from './configManagerJsonSlices/orderContent/reducer';
import attributeReducer from './configManagerJsonSlices/itemAttribute/reducer';
import activationReducer from './newInstall/reducer';
import devicesReducer from './devices/reducer';
import type { store } from '../main';

const rootReducer = combineReducers({
    service: serviceReducer,
    file: fileReducer,
    tree: treeReducer,
    attribute: attributeReducer,
    devices: devicesReducer,
    activation: activationReducer,

})

export default rootReducer;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;