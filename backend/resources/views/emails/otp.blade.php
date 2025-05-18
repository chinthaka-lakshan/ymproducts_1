<!DOCTYPE html>
<html>
<head>
    <title>OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .otp-display { 
            font-size: 24px; 
            font-weight: bold;
            color: #2563eb;
            margin: 20px 0;
            padding: 10px;
            background: #f5f5f5;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>OTP Verification Code</h2>
        <p>Your one-time password is:</p>
        <div class="otp-display">{{ $otp }}</div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </div>
</body>
</html>