<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermohonanDokumen extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'permohonan_dokumen';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'permohonan_id',
        'keperluan_dokumen_id',
        'nama_fail',
        'mime',
        'saiz_bait',
        'url_storan',
        'hash_fail',
        'status_sah',
        'uploaded_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'saiz_bait' => 'integer',
            'keperluan_dokumen_id' => 'integer',
            'uploaded_by' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the application that owns this document.
     */
    public function permohonan(): BelongsTo
    {
        return $this->belongsTo(Permohonan::class);
    }

    /**
     * Get the user who uploaded this document.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
