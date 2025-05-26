// Database utility functions for interacting with SQLite backend

const API_BASE_URL = '/api';

export async function query(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Example utility functions - implement these based on your specific needs
export const db = {
  async select(table: string) {
    return query(`/${table}`);
  },
  
  async insert(table: string, data: any) {
    return query(`/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async update(table: string, id: string | number, data: any) {
    return query(`/${table}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(table: string, id: string | number) {
    return query(`/${table}/${id}`, {
      method: 'DELETE',
    });
  },
};