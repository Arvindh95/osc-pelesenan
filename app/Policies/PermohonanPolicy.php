<?php

namespace App\Policies;

use App\Models\Permohonan;
use App\Models\User;

class PermohonanPolicy
{
    /**
     * Determine whether the user can view the application.
     * Users can only view their own applications.
     *
     * @param User $user
     * @param Permohonan $permohonan
     * @return bool
     */
    public function view(User $user, Permohonan $permohonan): bool
    {
        return $permohonan->user_id === $user->id;
    }

    /**
     * Determine whether the user can update the application.
     * Users can only update their own applications that are in draft status.
     *
     * @param User $user
     * @param Permohonan $permohonan
     * @return bool
     */
    public function update(User $user, Permohonan $permohonan): bool
    {
        return $permohonan->user_id === $user->id && $permohonan->isDraf();
    }

    /**
     * Determine whether the user can submit the application.
     * Users can only submit their own draft applications if their identity is verified.
     *
     * @param User $user
     * @param Permohonan $permohonan
     * @return bool
     */
    public function submit(User $user, Permohonan $permohonan): bool
    {
        return $permohonan->user_id === $user->id 
            && $permohonan->isDraf()
            && $user->status_verified_person === true;
    }

    /**
     * Determine whether the user can cancel the application.
     * Users can only cancel their own applications that are in draft status.
     *
     * @param User $user
     * @param Permohonan $permohonan
     * @return bool
     */
    public function cancel(User $user, Permohonan $permohonan): bool
    {
        return $permohonan->user_id === $user->id && $permohonan->isDraf();
    }
}
