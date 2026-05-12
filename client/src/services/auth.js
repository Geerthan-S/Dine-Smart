// Auth helper utilities for localStorage management

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    ownedRestaurants: data.ownedRestaurants || [],
  }));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!getToken();
export const isAdmin = () => getUser()?.role === 'admin';
export const isOwner = () => getUser()?.role === 'owner';
export const isOwnerOrAdmin = () => ['owner', 'admin'].includes(getUser()?.role);

