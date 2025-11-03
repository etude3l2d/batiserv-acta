/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- IndexedDB File Storage ---
const DB_NAME = 'batiserv_file_storage';
const DB_VERSION = 1;
const FILE_STORE_NAME = 'files';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening DB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(FILE_STORE_NAME)) {
                // The object store will hold objects of shape { id: string, file: File }
                dbInstance.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

const addFileToDB = async (file: File): Promise<string> => {
    const db = await initDB();
    const id = self.crypto.randomUUID();
    const transaction = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(FILE_STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.put({ id, file });
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
};

const getFileFromDB = async (id: string): Promise<File | null> => {
    const db = await initDB();
    const transaction = db.transaction(FILE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(FILE_STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result ? request.result.file : null);
        };
        request.onerror = () => reject(request.error);
    });
};

const deleteFileFromDB = async (id: string): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(FILE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(FILE_STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// --- Data Interfaces ---
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserWithPassword extends User {
    password?: string;
}

export interface OrderPart {
  number: string;
  isSent: boolean;
  creationDate: string;
  userId: string;
  userName: string;
  notes?: string;
}

export interface Order {
  id: string;
  frames: OrderPart | null;
  doors: OrderPart | null;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
}

export interface ConstructionSite {
  id:string;
  name: string;
  generalInfo: string;
  generalInfoFiles: UploadedFile[];
  orders: Order[];
}

export interface Customer {
  id: string;
  name: string;
  sites: ConstructionSite[];
  notes: string;
}

export interface SpecialOption {
  id: string;
  name: string;
  details: string;
  files: UploadedFile[];
}

export interface SearchResult {
  key: string;
  type: string;
  name: string;
  context?: string;
  customerId?: string;
  siteId?: string;
  optionId?: string;
}

// --- Mock Database using localStorage for persistence ---
const CUSTOMERS_KEY = 'batiserv_customers';
const OPTIONS_KEY = 'batiserv_special_options';
const USERS_KEY = 'batiserv_users';
export const CURRENT_USER_KEY = 'batiserv_current_user';
const NETWORK_DELAY = 100;

const loadInitialData = <T>(key: string, defaultValue: T): T => {
    try {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : defaultValue;
    } catch (error) {
        console.error(`Error loading data from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

let users: UserWithPassword[] = loadInitialData(USERS_KEY, []);
let customers: Customer[] = loadInitialData(CUSTOMERS_KEY, []);
let specialOptions: SpecialOption[] = loadInitialData(OPTIONS_KEY, []);

const saveUsers = () => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to localStorage:", error);
    }
};

// Seed initial admin user if none exist
if (users.length === 0) {
    users = [
        { id: 'admin-seed-1', name: 'taoufik', email: 'taoufik@example.com', password: '123456789', role: 'Admin' },
        { id: 'editor-1', name: 'Editor', email: 'editor@example.com', password: 'password', role: 'Editor' },
        { id: 'viewer-1', name: 'Viewer', email: 'viewer@example.com', password: 'password', role: 'Viewer' },
    ];
    saveUsers();
}


const saveCustomers = () => {
    try {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (error) {
        console.error("Error saving customers to localStorage:", error);
    }
};
const saveOptions = () => {
    try {
        localStorage.setItem(OPTIONS_KEY, JSON.stringify(specialOptions));
    } catch (error) {
        console.error("Error saving special options to localStorage:", error);
    }
};

const simulateNetwork = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), NETWORK_DELAY);
    });
};

// --- API Functions ---

// Users
export const getUsers = () => {
    const usersWithoutPasswords = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });
    return simulateNetwork(usersWithoutPasswords);
};

export const addUser = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Un utilisateur avec ce nom existe déjà.");
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
    }
    const newUser: UserWithPassword = { id: self.crypto.randomUUID(), name, email, password, role };
    users.push(newUser);
    saveUsers();
    const { password: _, ...userWithoutPassword } = newUser;
    return simulateNetwork(userWithoutPassword);
};

export const updateUser = async (id: string, updates: Partial<UserWithPassword>): Promise<User | undefined> => {
    if (updates.name && users.some(u => u.id !== id && u.name.toLowerCase() === updates.name!.toLowerCase())) {
        throw new Error("Un utilisateur avec ce nom existe déjà.");
    }
    if (updates.email && users.some(u => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
    }
    
    let updatedUser: User | undefined;
    users = users.map(u => {
        if (u.id === id) {
            const userWithUpdates = { ...u, ...updates };
            const { password, ...userWithoutPassword } = userWithUpdates;
            if (!updates.password) {
                userWithUpdates.password = u.password;
            }
            updatedUser = userWithoutPassword;
            return userWithUpdates;
        }
        return u;
    });
    saveUsers();
    return simulateNetwork(updatedUser);
};

export const deleteUser = async (id: string) => {
    users = users.filter(u => u.id !== id);
    saveUsers();
    return simulateNetwork({ success: true });
};

// Customers
export const getCustomers = () => simulateNetwork(customers);
export const addCustomer = async (name: string) => {
    const newCustomer: Customer = { id: self.crypto.randomUUID(), name, sites: [], notes: '' };
    customers.push(newCustomer);
    saveCustomers();
    return simulateNetwork(newCustomer);
};
export const deleteCustomer = async (id: string) => {
    customers = customers.filter(c => c.id !== id);
    saveCustomers();
    return simulateNetwork({ success: true });
};
export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    let updatedCustomer: Customer | undefined;
    customers = customers.map(c => {
        if (c.id === id) {
            updatedCustomer = { ...c, ...updates };
            return updatedCustomer;
        }
        return c;
    });
    saveCustomers();
    return simulateNetwork(updatedCustomer);
};

// Sites
export const addSite = async (customerId: string, name: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error("Customer not found");
    const newSite: ConstructionSite = { id: self.crypto.randomUUID(), name, generalInfo: '', generalInfoFiles: [], orders: [] };
    customer.sites.push(newSite);
    saveCustomers();
    return simulateNetwork(newSite);
};
export const deleteSite = async (customerId: string, siteId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        customer.sites = customer.sites.filter(s => s.id !== siteId);
        saveCustomers();
    }
    return simulateNetwork({ success: true });
};
export const updateSite = async (customerId: string, siteId: string, updates: Partial<ConstructionSite>) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        customer.sites = customer.sites.map(s => s.id === siteId ? { ...s, ...updates } : s);
        saveCustomers();
    }
    return simulateNetwork(customer?.sites.find(s => s.id === siteId));
};

// Site Files
export const addFileToSite = async (customerId: string, siteId: string, file: File): Promise<UploadedFile> => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    if (!site) throw new Error("Site not found");
    
    const fileId = await addFileToDB(file);
    const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
    };

    if (!site.generalInfoFiles) {
        site.generalInfoFiles = [];
    }
    site.generalInfoFiles.push(newFile);
    saveCustomers();
    return simulateNetwork(newFile);
};

export const deleteFileFromSite = async (customerId: string, siteId: string, fileId: string) => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    if (site && site.generalInfoFiles) {
        site.generalInfoFiles = site.generalInfoFiles.filter(f => f.id !== fileId);
        saveCustomers();
        await deleteFileFromDB(fileId);
    }
    return simulateNetwork({ success: true });
};


// Orders
export const addOrder = async (customerId: string, siteId: string, framesNumber: string, doorsNumber: string, userId: string): Promise<Order[]> => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    const user = users.find(u => u.id === userId);
    if (!site) throw new Error("Site not found");
    if (!user) throw new Error("User not found");
    if (!framesNumber.trim() && !doorsNumber.trim()) throw new Error("At least one part number is required.");

    const newOrders: Order[] = [];
    const creationDate = new Date().toISOString();

    if (framesNumber.trim()) {
        const order: Order = {
            id: self.crypto.randomUUID(),
            frames: { number: framesNumber.trim(), isSent: false, creationDate, userId: user.id, userName: user.name, notes: '' },
            doors: null,
        };
        site.orders.push(order);
        newOrders.push(order);
    }

    if (doorsNumber.trim()) {
        const order: Order = {
            id: self.crypto.randomUUID(),
            frames: null,
            doors: { number: doorsNumber.trim(), isSent: false, creationDate, userId: user.id, userName: user.name, notes: '' },
        };
        site.orders.push(order);
        newOrders.push(order);
    }
    
    saveCustomers();
    return simulateNetwork(newOrders);
};
export const deleteOrder = async (customerId: string, siteId: string, orderId: string) => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    if (site) {
        site.orders = site.orders.filter(o => o.id !== orderId);
        saveCustomers();
    }
    return simulateNetwork({ success: true });
};
export const updateOrder = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', newNumber: string) => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    const order = site?.orders.find(o => o.id === orderId);
    if (order && order[part]) {
        order[part]!.number = newNumber;
        saveCustomers();
    }
    return simulateNetwork(order);
};
export const updateOrderUser = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', userId: string) => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    const order = site?.orders.find(o => o.id === orderId);
    const user = users.find(u => u.id === userId);
    if (order && order[part] && user) {
        order[part]!.userId = user.id;
        order[part]!.userName = user.name;
        saveCustomers();
    }
    return simulateNetwork(order);
};
export const updateOrderNotes = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors', notes: string) => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    const order = site?.orders.find(o => o.id === orderId);
    if (order && order[part]) {
        order[part]!.notes = notes;
        saveCustomers();
    }
    return simulateNetwork(order);
};
export const toggleOrderStatus = async (customerId: string, siteId: string, orderId: string, part: 'frames' | 'doors') => {
    const site = customers.find(c => c.id === customerId)?.sites.find(s => s.id === siteId);
    const order = site?.orders.find(o => o.id === orderId);
    if (order && order[part]) {
        order[part]!.isSent = !order[part]!.isSent;
        saveCustomers();
    }
    return simulateNetwork(order);
};

// Special Options
export const getSpecialOptions = () => simulateNetwork(specialOptions);
export const addSpecialOption = async (name: string) => {
    const newOption: SpecialOption = { id: self.crypto.randomUUID(), name, details: '', files: [] };
    specialOptions.push(newOption);
    saveOptions();
    return simulateNetwork(newOption);
};
export const deleteSpecialOption = async (id: string) => {
    specialOptions = specialOptions.filter(o => o.id !== id);
    saveOptions();
    return simulateNetwork({ success: true });
};
export const updateSpecialOption = async (id: string, updates: Partial<SpecialOption>) => {
    specialOptions = specialOptions.map(o => o.id === id ? { ...o, ...updates } : o);
    saveOptions();
    return simulateNetwork(specialOptions.find(o => o.id === id));
};

// Files
export const addFileToOption = async (optionId: string, file: File) => {
    const option = specialOptions.find(o => o.id === optionId);
    if (!option) throw new Error("Option not found");
    
    const fileId = await addFileToDB(file);
    const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
    };
    option.files.push(newFile);
    saveOptions();
    return simulateNetwork(newFile);
};
export const deleteFileFromOption = async (optionId: string, fileId: string) => {
    const option = specialOptions.find(o => o.id === optionId);
    if (option) {
        option.files = option.files.filter(f => f.id !== fileId);
        saveOptions();
        await deleteFileFromDB(fileId);
    }
    return simulateNetwork({ success: true });
};

export const getFileUrl = async (id: string): Promise<string | null> => {
    const file = await getFileFromDB(id);
    if (file) {
        return URL.createObjectURL(file);
    }
    return null;
};

// --- Data Import ---
const parseCSV = (csvText: string): Record<string, string>[] => {
    const rows: Record<string, string>[] = [];
    const lines = csvText.replace(/\r/g, '').split('\n');
    if (lines.length < 1) return [];

    // Remove BOM from header and trim
    const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const row: string[] = [];
        let currentField = '';
        let inQuotes = false;

        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];

            if (char === '"') {
                if (inQuotes && lines[i][j + 1] === '"') {
                    currentField += '"';
                    j++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField); // Add last field

        const rowObject: Record<string, string> = {};
        headers.forEach((header, index) => {
            rowObject[header] = row[index] ? row[index].trim() : '';
        });
        rows.push(rowObject);
    }
    return rows;
};

/**
 * Parses a French-style date string (jj/mm/aaaa hh:mm:ss) into a Date object.
 * Also handles variations with commas from `toLocaleString` and ISO strings.
 * @param dateString The date string to parse.
 * @returns A Date object or null if parsing fails.
 */
const parseFrenchDateString = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Clean up potential comma from toLocaleString('fr-FR') e.g., "23/10/2025, 14:30:00"
    const cleanedDateString = dateString.replace(',', '');

    // Matches "jj/mm/aaaa hh:mm:ss" or "jj/mm/aaaa"
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?$/;
    const parts = cleanedDateString.match(regex);

    if (!parts) {
        // Fallback for ISO strings or other parsable formats that new Date() can handle
        const fallbackDate = new Date(dateString);
        if (!isNaN(fallbackDate.getTime())) {
            return fallbackDate;
        }
        console.warn(`Invalid date format for: "${dateString}". Expected "jj/mm/aaaa hh:mm:ss".`);
        return null;
    }

    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10); // month is 1-based here
    const year = parseInt(parts[3], 10);
    
    const hours = parts[4] ? parseInt(parts[4], 10) : 0;
    const minutes = parts[5] ? parseInt(parts[5], 10) : 0;
    const seconds = parts[6] ? parseInt(parts[6], 10) : 0;

    // JavaScript Date month is 0-indexed (0-11)
    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    // Basic validation to check if the constructed date is valid.
    // This handles cases like month being 13, which JS Date auto-corrects.
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        console.warn(`Constructed date is invalid for input: "${dateString}"`);
        return null;
    }

    return date;
};


export const importData = async (csvString: string): Promise<{customers: Customer[], users: User[]}> => {
    const parsedData = parseCSV(csvString);
    if(parsedData.length === 0) throw new Error("Le fichier CSV est vide ou mal formaté.");

    parsedData.forEach(row => {
        const { CustomerName, CustomerNotes, SiteName, SiteGeneralInfo, OrderPart, OrderNumber, OrderStatus, OrderCreationDate, OrderAssignedUser, OrderNotes, UserRole } = row;

        if (!CustomerName) return;

        let user: UserWithPassword | undefined;
        if (OrderAssignedUser) {
            user = users.find(u => u.name.toLowerCase() === OrderAssignedUser.toLowerCase());
            if (!user) {
                const validRoles: UserRole[] = ['Admin', 'Editor', 'Viewer'];
                let role: UserRole = 'Viewer'; // Default role
                const providedRole = UserRole?.trim();
                if (providedRole) {
                    // Be flexible with casing: 'admin' -> 'Admin'
                    const formattedRole = providedRole.charAt(0).toUpperCase() + providedRole.slice(1).toLowerCase();
                    if (validRoles.includes(formattedRole as UserRole)) {
                        role = formattedRole as UserRole;
                    }
                }
                
                const newUser: UserWithPassword = { 
                    id: self.crypto.randomUUID(), 
                    name: OrderAssignedUser,
                    email: `${OrderAssignedUser.toLowerCase().replace(/\s/g, '.')}@example.com`,
                    role, 
                    password: 'password' // Assign a default password
                };
                user = newUser;
                users.push(user);
            }
        }

        let customer = customers.find(c => c.name.toLowerCase() === CustomerName.toLowerCase());
        if (!customer) {
            customer = { id: self.crypto.randomUUID(), name: CustomerName, sites: [], notes: CustomerNotes || '' };
            customers.push(customer);
        } else {
            if (CustomerNotes && !customer.notes) {
                customer.notes = CustomerNotes;
            }
        }

        if (!SiteName) return;

        let site = customer.sites.find(s => s.name.toLowerCase() === SiteName.toLowerCase());
        if (!site) {
            site = { id: self.crypto.randomUUID(), name: SiteName, generalInfo: SiteGeneralInfo || '', generalInfoFiles: [], orders: [] };
            customer.sites.push(site);
        } else {
            if (SiteGeneralInfo && !site.generalInfo) {
                site.generalInfo = SiteGeneralInfo;
            }
        }

        if (!OrderPart || !OrderNumber || !user) return;

        const partType = OrderPart.toLowerCase() === 'huisseries' ? 'frames' : OrderPart.toLowerCase() === 'portes' ? 'doors' : null;
        if (!partType) return;

        const orderExists = site.orders.some(o => {
            const part = o[partType];
            return part && part.number === OrderNumber;
        });

        if (orderExists) return;
        
        const parsedDate = OrderCreationDate ? parseFrenchDateString(OrderCreationDate) : null;
        // If a date was provided but couldn't be parsed, log an error and use the current date as a fallback.
        if (OrderCreationDate && !parsedDate) {
            console.error(`Could not parse date "${OrderCreationDate}", using current date as fallback.`);
        }
        const creationDateISO = parsedDate ? parsedDate.toISOString() : new Date().toISOString();

        const newOrderPart: OrderPart = {
            number: OrderNumber,
            isSent: OrderStatus === 'Envoyée',
            creationDate: creationDateISO,
            userId: user.id,
            userName: user.name,
            notes: OrderNotes || '',
        };

        const newOrder: Order = {
            id: self.crypto.randomUUID(),
            frames: partType === 'frames' ? newOrderPart : null,
            doors: partType === 'doors' ? newOrderPart : null,
        };

        site.orders.push(newOrder);
    });

    saveCustomers();
    saveUsers();
    
    const usersWithoutPasswords = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });

    return simulateNetwork({ customers, users: usersWithoutPasswords });
};

// --- Authentication ---

export const login = async (usernameOrEmail: string, password_param: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const normalizedLogin = usernameOrEmail.toLowerCase();
            const user = users.find(u =>
                (u.name.toLowerCase() === normalizedLogin || u.email.toLowerCase() === normalizedLogin)
            );

            if (user && user.password === password_param) {
                const { password, ...userWithoutPassword } = user;
                try {
                    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
                    resolve(userWithoutPassword);
                } catch (error) {
                    console.error("Error saving user to sessionStorage:", error);
                    reject(new Error("Could not save session."));
                }
            } else {
                reject(new Error("Nom d'utilisateur ou mot de passe incorrect."));
            }
        }, 500); // Simulate network delay
    });
};

export const signup = async (name: string, email: string, password_param: string): Promise<User> => {
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Un utilisateur avec ce nom existe déjà.");
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
    }
    const newUser: UserWithPassword = { id: self.crypto.randomUUID(), name, email, password: password_param, role: 'Viewer' };
    users.push(newUser);
    saveUsers();
    const { password, ...userWithoutPassword } = newUser;
    return simulateNetwork(userWithoutPassword);
};

export const recoverPassword = async (email: string): Promise<{ success: boolean }> => {
    // In a real app, this would trigger an email. Here we just simulate success.
    console.log(`Password recovery requested for ${email}`);
    return simulateNetwork({ success: true });
};

export const logout = async (): Promise<void> => {
    try {
        sessionStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error("Error removing user from sessionStorage:", error);
    }
    return Promise.resolve();
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Error getting user from sessionStorage:", error);
        return null;
    }
};
