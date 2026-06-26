// Simple code snippets for typing practice
// They are stored as strings. The typing engine will split them by spaces.

export const codeSnippets = [
  // JavaScript Snippets
  `function calculateTotal(items) { return items.reduce((acc, curr) => acc + curr.price, 0); }`,
  `const fetchData = async (url) => { try { const res = await fetch(url); return await res.json(); } catch(e) { console.error(e); } };`,
  `setTimeout(() => { console.log("Timeout finished!"); document.body.classList.add('loaded'); }, 2000);`,
  `export const AuthProvider = ({ children }) => { const [user, setUser] = useState(null); return <Context.Provider value={user}>{children}</Context.Provider>; };`,
  
  // Python Snippets
  `def fibonacci(n): if n <= 1: return n else: return fibonacci(n-1) + fibonacci(n-2)`,
  `class User: def __init__(self, username, email): self.username = username self.email = email def get_profile(self): return f"{self.username} <{self.email}>"`,
  `import requests response = requests.get('https://api.github.com') if response.status_code == 200: print(response.json())`,
  
  // C++ Snippets
  `#include <iostream> using namespace std; int main() { cout << "Hello World!"; return 0; }`,
  `std::vector<int> numbers = {1, 2, 3, 4, 5}; for(int i=0; i<numbers.size(); i++) { cout << numbers[i] << endl; }`
];

export const getRandomSnippet = () => {
  const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
  return snippet.split(" ");
};
