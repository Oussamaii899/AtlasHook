<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('theme')->default('system')->after('email_verified_at');
            $table->boolean('notifications')->default(true)->after('theme');
            $table->boolean('auto_save')->default(true)->after('notifications');
            $table->boolean('compact_mode')->default(false)->after('auto_save');
            $table->boolean('email_notifications')->default(true)->after('compact_mode');
            $table->boolean('webhook_notifications')->default(true)->after('email_notifications');
            $table->boolean('error_notifications')->default(true)->after('webhook_notifications');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'theme',
                'notifications',
                'auto_save',
                'compact_mode',
                'email_notifications',
                'webhook_notifications',
                'error_notifications'
            ]);
        });
    }
};
