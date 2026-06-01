


const getRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        // Decode the middle part of the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (err) {
        return null;
    }
};

const getEmail = () => {
    return localStorage.getItem('email') || 'User';
};

export { getRole, getEmail };