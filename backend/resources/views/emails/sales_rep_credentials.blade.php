<!DOCTYPE html>
<html>
<head>
    <title>Sales Representative Credentials</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .credentials { background-color: #f1f1f1; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Your Sales Representative Account</h2>
        </div>
        
        <div class="content">
            <p>Hello {{ $name }},</p>
            <p>Your account has been successfully created.</p>
            
            <div class="credentials">
                <p><strong>Email:</strong> {{ $email }}</p>
                <p><strong>Temporary Password:</strong> {{ $password }}</p>
            </div>
            
            <p>Please log in and change your password immediately.</p>
            <p>Thank you!</p>
        </div>
    </div>
</body>
</html>