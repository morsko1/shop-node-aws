'use strict';

import getProductsListHandler from './getProductsList';
import getProductsByIdHandler from './getProductsById';
import initDBHandler from './initDB';

export const getProductsList = getProductsListHandler;
export const getProductsById = getProductsByIdHandler;
export const initDB = initDBHandler;
