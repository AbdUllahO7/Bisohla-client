export const getCitiesOptions = (t: (arg0: string) => any) => [
    { value: 'Damascus', label: t('filter.filterOptions.address.options.Damascus') },
    { value: 'Idlib', label: t('filter.filterOptions.address.options.Idlib') },
    { value: 'Aleppo', label: t('filter.filterOptions.address.options.Aleppo') },
    { value: 'Homs', label: t('filter.filterOptions.address.options.Homs') },
];

export const getStatesOptions = (t: (arg0: string) => any) => [
    { value: 'dm', label: t('filter.filterOptions.states.options.Damascus') },
    { value: 'ds', label: t('filter.filterOptions.states.options.Idlib') },
    { value: 'as', label: t('filter.filterOptions.states.options.Aleppo') },
    { value: 'ho', label: t('filter.filterOptions.states.options.Homs') },
];

export const getCarMarkaItems = (t: (arg0: string) => any) => [
    {
        id: 'mercedes',
        imageSrc: '/assets/icons/Mercedes.png',
        label: t('filter.filterOptions.productMarka.Mercedes'),
    },
    {
        id: 'bmw',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw1',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw2',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw3',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw5',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw6',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw7',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw8',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
    {
        id: 'bmw9',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.productMarka.Bmw'),
    },
];

export const getControlType = (t: (arg0: string) => any) => [
    {
        id: '1',
        value: 'Auto',
        label: t('filter.filterOptions.ControlType.auto'),
    },
    {
        id: '2',
        value: 'Normal',
        label: t('filter.filterOptions.ControlType.normal'),
    },
];

export const getFuelType = (t: (arg0: string) => any) => [
    {
        id: '1',
        value: 'Gasoline',
        label: t('filter.filterOptions.FuelType.gasoline'),
    },
    {
        id: '2',
        value: 'Diesel',
        label: t('filter.filterOptions.FuelType.diesel'),
    },
];

export const getCarModelsOptions = [
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
];

export const getPriceRanges = [
    { value: '500', label: '500' },
    { value: '1000', label: '1,000' },
    { value: '2500', label: '2,500' },
    { value: '5000', label: '5,000' },
    { value: '10000', label: '10,000' },
    { value: '25000', label: '25,000' },
    { value: '50000', label: '50,000' },
    { value: '100000', label: '100,000' },
    { value: '250000', label: '250,000' },
    { value: '500000', label: '500,000' },
    { value: '1000000', label: '1,000,000' },
    { value: '5000000', label: '5,000,000' },
    { value: '10000000', label: '10,000,000' },
    { value: '10000000000000', label: '10,000,000,000,000' },
];

export const getMileageRanges = [
    { value: '0', label: '0' },
    { value: '10000', label: '10,000' },
    { value: '25000', label: '25,000' },
    { value: '50000', label: '50,000' },
    { value: '75000', label: '75,000' },
    { value: '100000', label: '100,000' },
    { value: '150000', label: '150,000' },
    { value: '200000', label: '200,000' },
    { value: '300000', label: '300,000' },
    { value: '500000', label: '500,000' },
];