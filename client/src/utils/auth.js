/**
 * Decodes the JWT payload stored in localStorage and returns the user data.
 * Returns null if no token is present or the token is malformed.
 */
export function getCurrentUser() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
