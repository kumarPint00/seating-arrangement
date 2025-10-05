export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Simulate a database with some mock users
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02T00:00:00Z' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-01-03T00:00:00Z' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', createdAt: '2023-01-04T00:00:00Z' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', createdAt: '2023-01-05T00:00:00Z' },
];

// Simulate database call with 200ms delay
export const simulateDBCall = async (userId: string): Promise<User | null> => {
  console.log(`🗄️  Simulating DB call for user ${userId}...`);
  
  // Simulate network/DB delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find user in mock database
  const user = mockUsers.find(u => u.id === userId);
  
  if (user) {
    console.log(`✅ DB: Found user ${userId}`);
    return { ...user }; // Return a copy to avoid mutations
  } else {
    console.log(`❌ DB: User ${userId} not found`);
    return null;
  }
};

// Simulate saving a user (for POST endpoint)
export const saveUser = async (user: User): Promise<User> => {
  console.log(`💾 Simulating save for user ${user.id}...`);
  
  // Simulate save delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In a real app, this would save to database
  // For simulation, we'll just add to our mock array if not exists
  const existingIndex = mockUsers.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    mockUsers[existingIndex] = user;
  } else {
    mockUsers.push(user);
  }
  
  console.log(`✅ DB: Saved user ${user.id}`);
  return { ...user };
};