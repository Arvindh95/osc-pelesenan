<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permohonan extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'permohonan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'company_id',
        'jenis_lesen_id',
        'status',
        'tarikh_serahan',
        'butiran_operasi',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'company_name',
        'jenis_lesen_nama',
        'kategori',
        'yuran_proses',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'butiran_operasi' => 'array',
            'tarikh_serahan' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user who owns this application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the company associated with this application.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get all documents for this application.
     */
    public function dokumen(): HasMany
    {
        return $this->hasMany(PermohonanDokumen::class);
    }

    /**
     * Scope a query to only include draft applications.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDraf($query)
    {
        return $query->where('status', 'Draf');
    }

    /**
     * Scope a query to only include submitted applications.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDiserahkan($query)
    {
        return $query->where('status', 'Diserahkan');
    }

    /**
     * Scope a query to only include applications for a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if the application is in draft status.
     *
     * @return bool
     */
    public function isDraf(): bool
    {
        return $this->status === 'Draf';
    }

    /**
     * Check if the application has been submitted.
     *
     * @return bool
     */
    public function isDiserahkan(): bool
    {
        return $this->status === 'Diserahkan';
    }

    /**
     * Get the company name attribute.
     *
     * @return string|null
     */
    public function getCompanyNameAttribute(): ?string
    {
        return $this->company?->name;
    }

    /**
     * Get the jenis lesen nama attribute from Module 4 data.
     * Note: This requires fetching from Module4Client which may be slow.
     * Consider eager loading or caching if performance is an issue.
     *
     * @return string
     */
    public function getJenisLesenNamaAttribute(): string
    {
        try {
            $module4Client = app(\App\Services\M02\Module4Client::class);
            $jenisLesen = $module4Client->getJenisLesen();
            $found = $jenisLesen->firstWhere('id', $this->jenis_lesen_id);
            return $found['nama'] ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get the kategori attribute from Module 4 data.
     *
     * @return string
     */
    public function getKategoriAttribute(): string
    {
        try {
            $module4Client = app(\App\Services\M02\Module4Client::class);
            $jenisLesen = $module4Client->getJenisLesen();
            $found = $jenisLesen->firstWhere('id', $this->jenis_lesen_id);
            return $found['kategori'] ?? 'Tidak Berisiko';
        } catch (\Exception $e) {
            return 'Tidak Berisiko';
        }
    }

    /**
     * Get the yuran proses attribute from Module 4 data.
     *
     * @return float|null
     */
    public function getYuranProsesAttribute(): ?float
    {
        try {
            $module4Client = app(\App\Services\M02\Module4Client::class);
            $jenisLesen = $module4Client->getJenisLesen();
            $found = $jenisLesen->firstWhere('id', $this->jenis_lesen_id);
            return $found['yuran_proses'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
