<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'ic_no',
        'role',
        'status_verified_person',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status_verified_person' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the companies owned by this user.
     */
    public function ownedCompanies(): HasMany
    {
        return $this->hasMany('App\Models\Company', 'owner_user_id');
    }

    /**
     * Get the audit logs for this user as an actor.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany('App\Models\AuditLog', 'actor_id');
    }

    /**
     * Get all audit logs for this user as an entity.
     */
    public function entityAuditLogs(): MorphMany
    {
        return $this->morphMany('App\Models\AuditLog', 'entity');
    }

    /**
     * Scope a query to only include verified users.
     */
    public function scopeVerified($query)
    {
        return $query->where('status_verified_person', true);
    }

    /**
     * Scope a query to only include active (non-deleted) users.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }
}
