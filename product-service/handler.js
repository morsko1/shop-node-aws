'use strict';

import getProductsListHandler from './getProductsList';
import getProductsByIdHandler from './getProductsById';
import initDBHandler from './initDB';
import createProductHandler from './createProduct';

export const getProductsList = getProductsListHandler;
export const getProductsById = getProductsByIdHandler;
export const initDB = initDBHandler;
export const createProduct = createProductHandler;
