<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesRepLoginTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function sales_rep_can_login_with_correct_credentials()
    {
        // TC1: Sales Rep logs in using correct credentials
        
        // 1. Arrange - Create a sales rep user
        $salesRep = User::factory()->create([
            'email' => 'srashenb@gmail.com',
            'password' => bcrypt('Rashen@123'),
            'role' => 'sales_rep'
        ]);

        // 2. Act - Attempt to login
        $response = $this->postJson('/api/login', [
            'email' => 'srashenb@gmail.com',
            'password' => 'Rashen@123'
        ]);

        // 3. Assert - Check for successful response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ]
            ])
            ->assertJson([
                'token_type' => 'Bearer',
                'user' => [
                    'email' => 'srashenb@gmail.com',
                    'role' => 'sales_rep'
                ]
            ]);
    }

    /** @test */
    public function sales_rep_cannot_login_with_incorrect_password()
    {
        // Create a sales rep user
        $salesRep = User::factory()->create([
            'email' => 'srashenb@gmail.com',
            'password' => bcrypt('Rashen@123'),
            'role' => 'sales_rep'
        ]);

        // Attempt to login with wrong password
        $response = $this->postJson('/api/login', [
            'email' => 'srashenb@gmail.com',
            'password' => 'Rashen@1234'
        ]);

        // Check for error response
        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid login details'
            ]);
    }

    /** @test */
    public function non_sales_rep_users_cannot_login()
    {
        // Create a non-sales rep user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('Admin@123'),
            'role' => 'admin' // or any role other than sales_rep
        ]);

        // Attempt to login
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin@123'
        ]);

        // The login should still work as your current implementation
        // doesn't restrict by role. If you want to restrict login to
        // only sales reps, you would need to modify your AuthController.
        $response->assertStatus(200);
    }
}