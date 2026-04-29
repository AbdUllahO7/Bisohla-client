import { getInjection } from './src/di/container';

async function test() {
    const controller = getInjection('IListingTypesRepoController');
    const response = await controller.getListingTypes(1, 100);
    console.log(JSON.stringify(response.data?.data, null, 2));
}

test();
