<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create default admin
        User::firstOrCreate(
            ['email' => env('DEFAULT_ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => 'Super Admin',
                'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'Admin@123')),
                'nic' => env('DEFAULT_ADMIN_NIC', '123456789V'),
                'contact_number' => env('DEFAULT_ADMIN_PHONE', '0712345678'),
                'role' => 'admin',
            ]
        );
        
        // Create default sales rep
        // Admin::firstOrCreate(
        //     ['email' => env('DEFAULT_SALES_EMAIL', 'sales@example.com')],
        //     [
        //         'name' => 'Sales Representative',
        //         'password' => Hash::make(env('DEFAULT_SALES_PASSWORD', 'Sales@123')),
        //         'nic' => env('DEFAULT_SALES_NIC', '987654321V'),
        //         'contact_number' => env('DEFAULT_SALES_PHONE', '0787654321'),
        //         'role' => 'sales_rep',
        //     ]
        // );

        $this->command->info('Default admin and sales rep users created successfully!');
    }
}