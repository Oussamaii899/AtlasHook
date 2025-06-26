<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedEmbed extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'embed_data',
        'is_favorite',
        'usage_count',
    ];

    protected $casts = [
        'embed_data' => 'array',
        'is_favorite' => 'boolean',
        'usage_count' => 'integer',
    ];

    /**
     * Get the user that owns the saved embed
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
