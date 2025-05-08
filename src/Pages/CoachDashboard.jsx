const CoachDashboard = () => {

    // Correct logout function
    const handleLogout = async () => {
        try {
            // Call the correct method - logout, not logon
            await authService.logout();
            console.log('Logout successful');
            
            // Navigate to login page
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    

  return (
      <div>
      <h1>Coach Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      </div>
  );
}

export default CoachDashboard;