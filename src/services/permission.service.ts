export const rolesSeed = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'trader' },
  { id: 3, name: 'user' },
];

export const getAdminRole = () =>
  rolesSeed.find((role) => role.name === 'admin');
export const getTraderRole = () =>
  rolesSeed.find((role) => role.name === 'trader');

export const getUserRole = () => rolesSeed.find((role) => role.name === 'user');
