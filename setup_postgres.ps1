# Script to automate PostgreSQL installation and database setup

# Generate a strong random password
$postgresPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 20 | % {[char]$_})

# Store the password in a temporary file
$passwordFile = "$env:TEMP\postgres_password.txt"
$postgresPassword | Out-File -FilePath $passwordFile

# Download PostgreSQL 16 installer
$installerUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.2-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"
Write-Host "Downloading PostgreSQL installer..."
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

# Install PostgreSQL silently
Write-Host "Installing PostgreSQL..."
Start-Process -FilePath $installerPath -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /DIR=`"C:\Program Files\PostgreSQL\16`" /DATA=`"C:\Program Files\PostgreSQL\16\data`" /USER=postgres /PASSWORD=`"$postgresPassword`" /PORT=5432 /LOCALE=C" -Wait

# Add PostgreSQL bin directory to PATH (for current session only)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Wait for PostgreSQL service to start
Write-Host "Waiting for PostgreSQL service to start..."
Start-Sleep -Seconds 10

# Create the database
Write-Host "Creating database..."
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE zombitx64;"

# Update .env file with the correct DATABASE_URL
$envContent = Get-Content -Path .env
$newEnvContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"postgresql://postgres:$postgresPassword@localhost:5432/zombitx64`""
Set-Content -Path .env -Value $newEnvContent

# Run Prisma migration
Write-Host "Running Prisma migration..."
npx prisma migrate dev --name "add_user_settings_activity_skills_reputation"

# Display the generated password to the user
Write-Host "PostgreSQL installation and database setup complete."
Write-Host "Your PostgreSQL superuser (postgres) password is: $postgresPassword" -ForegroundColor Yellow
Write-Host "This password has also been saved to: $passwordFile" -ForegroundColor Yellow
Write-Host "Please save this password securely. You will need it to access the database." -ForegroundColor Yellow
