const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Helper functions for JSON file operations
const readJsonFile = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeJsonFile = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// User operations
const getUsers = () => readJsonFile('users.json');
const getUserById = (id) => getUsers().find(user => user.id === id);
const getUserByEmail = (email) => getUsers().find(user => user.email === email);
const createUser = (userData) => {
  const users = getUsers();
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJsonFile('users.json', users);
  return newUser;
};

// Tenant operations
const getTenants = () => readJsonFile('tenants.json');
const getTenantsByUserId = (userId) => getTenants().filter(tenant => tenant.userId === userId);
const getTenantById = (id) => getTenants().find(tenant => tenant.id === id);
const createTenant = (tenantData) => {
  const tenants = getTenants();
  const newTenant = {
    id: `tenant_${Date.now()}`,
    ...tenantData,
    createdAt: new Date().toISOString(),
    stripeCustomerId: null
  };
  tenants.push(newTenant);
  writeJsonFile('tenants.json', tenants);
  return newTenant;
};
const updateTenant = (id, updates) => {
  const tenants = getTenants();
  const index = tenants.findIndex(tenant => tenant.id === id);
  if (index !== -1) {
    tenants[index] = { ...tenants[index], ...updates };
    writeJsonFile('tenants.json', tenants);
    return tenants[index];
  }
  return null;
};

// Subscription operations
const getSubscriptions = () => readJsonFile('subscriptions.json');
const getSubscriptionsByTenantId = (tenantId) => getSubscriptions().filter(sub => sub.tenantId === tenantId);
const getSubscriptionById = (id) => getSubscriptions().find(sub => sub.id === id);
const createSubscription = (subscriptionData) => {
  const subscriptions = getSubscriptions();
  const newSubscription = {
    id: `sub_${Date.now()}`,
    ...subscriptionData,
    createdAt: new Date().toISOString()
  };
  subscriptions.push(newSubscription);
  writeJsonFile('subscriptions.json', subscriptions);
  return newSubscription;
};
const updateSubscription = (id, updates) => {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex(sub => sub.id === id);
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updates };
    writeJsonFile('subscriptions.json', subscriptions);
    return subscriptions[index];
  }
  return null;
};

module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  getTenants,
  getTenantsByUserId,
  getTenantById,
  createTenant,
  updateTenant,
  getSubscriptions,
  getSubscriptionsByTenantId,
  getSubscriptionById,
  createSubscription,
  updateSubscription
};
