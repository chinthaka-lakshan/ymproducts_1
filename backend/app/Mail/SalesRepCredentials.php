<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;


class SalesRepCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $email;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($name, $email, $password)
    {
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your Sales Representative Account Credentials')
            ->view('sales_rep_credentials');
    }
}