-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS portfolio;

-- Create the user if it doesn't exist (replace 'your_password' with a real one)
CREATE USER IF NOT EXISTS 'portfolio_user'@'%' IDENTIFIED BY 'PDBLOCAL';

-- Grant the privileges
GRANT ALL PRIVILEGES ON portfolio.* TO 'portfolio_user'@'%';

-- Apply the changes
FLUSH PRIVILEGES;
