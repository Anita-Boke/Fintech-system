// src/lib/services/userService.ts
import { User, dummyUsers } from '../constants';

const USERS_KEY = 'fintech-users';

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = sessionStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : dummyUsers;
};

export const getUserById = (userId: string): User | undefined => {
  return getUsers().find(user => user.id === userId);
};

export const createUser = (userData: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`
  };
  
  const updatedUsers = [...users, newUser];
  sessionStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return newUser;
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const updatedUser = { ...users[index], ...updates };
  const updatedUsers = [...users];
  updatedUsers[index] = updatedUser;
  
  sessionStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return updatedUser;
};

export const deleteUser = (userId: string): boolean => {
  const users = getUsers();
  const updatedUsers = users.filter(u => u.id !== userId);
  const success = updatedUsers.length < users.length;
  
  if (success) {
    sessionStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  }
  return success;
};