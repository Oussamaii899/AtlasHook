<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmbedHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'color',
        'webhook_url',
        'server_name',
        'channel_name',
        'embed_data',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'embed_data' => 'array',
        'sent_at' => 'datetime',
    ];

    /**
     * Get the user that owns the embed history
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
