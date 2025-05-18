<?php

namespace Tests\Feature\Auth;

use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        require base_path('routes/api.php');
        Mail::fake(); // Mock all mail sending
    }

    /** @test */
    public function password_reset_fails_with_invalid_otp()
    {
        // 1. Create test user
        $user = User::factory()->create([
            'role' => 'sales_rep',
            'email' => 'salesrep@example.com',
            'password' => Hash::make('originalPassword123')
        ]);

        // 2. Generate OTP (simulating the sendOtp endpoint)
        $otp = '654321'; // Could use rand(100000, 999999) for dynamic testing
        PasswordResetOtp::create([
            'email' => $user->email,
            'otp' => $otp,
            'created_at' => now()
        ]);

        // 3. Attempt reset with invalid OTP
        $response = $this->postJson('/api/reset-password-with-otp', [
            'email' => $user->email,
            'otp' => '000000', // Clearly wrong value
            'password' => 'newSecurePassword123',
            'password_confirmation' => 'newSecurePassword123'
        ]);

        // 4. Assertions
        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid OTP or user not found'
            ]);

        // 5. Verify password remains unchanged
        $this->assertTrue(Hash::check('originalPassword123', $user->fresh()->password));
    }

    /** @test */
    public function verify_otp_fails_with_invalid_code()
    {
        $user = User::factory()->create();
        $otp = PasswordResetOtp::create([
            'email' => $user->email,
            'otp' => '123456',
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'otp' => '000000'
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid OTP or user not found'
            ]);
    }

    /** @test */
    // public function password_reset_fails_with_expired_otp()
    // {
    //     $user = User::factory()->create();
    //     $otp = PasswordResetOtp::create([
    //         'email' => $user->email,
    //         'otp' => '123456',
    //         'created_at' => now()->subMinutes(15) // Past expiration
    //     ]);

    //     $response = $this->postJson('/api/reset-password-with-otp', [
    //         'email' => $user->email,
    //         'otp' => '123456',
    //         'password' => 'newPassword123',
    //         'password_confirmation' => 'newPassword123'
    //     ]);

    //     $response->assertStatus(400)
    //         ->assertJson([
    //             'error' => 'OTP expired',
    //             'generated_at' => $otp->created_at->toDateTimeString(),
    //             'expired_at' => $otp->created_at->addMinutes(15)->toDateTimeString()
    //         ]);
    // }

    /** @test */
    public function send_otp_works_correctly()
    {
        $user = User::factory()->create();
        
        $response = $this->postJson('/api/send-otp', [
            'email' => $user->email
        ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'OTP sent successfully'
            ]);
        
        Mail::assertSent(\App\Mail\SendOtpMail::class);
    }

    /** @test */
    public function verify_otp_works_with_valid_code()
    {
        $user = User::factory()->create();
        $otp = PasswordResetOtp::create([
            'email' => $user->email,
            'otp' => '123456',
            'created_at' => now()
        ]);

        $response = $this->postJson('/api/verify-otp', [
            'email' => $user->email,
            'otp' => '123456'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'OTP verified successfully'
            ]);
    }
}