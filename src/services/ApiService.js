class ApiService {
  static async fetchData(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(url, options = {}) {
    return this.fetchData(url, { method: 'GET', ...options });
  }

  static async post(url, data, options = {}) {
    return this.fetchData(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }
}

export default ApiService;